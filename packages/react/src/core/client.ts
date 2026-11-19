import { createCodeChallenge, randomString } from "./pkce";

/**
 * Security facts about a sign-in, delivered when the app requests the `login_context` scope.
 * Location is derived from the IP: approximate, never a GPS position.
 */
export interface LoginContext {
  event_id: string;
  /** password | email_code | mfa | google | github ... */
  method: string;
  /** ISO 8601 time of the sign-in. */
  at: string;
  /** First time this browser + OS + country was used by this user. */
  is_new_device: boolean;
  ip: string | null;
  device: { type: string; browser: string; browser_version: string | null; os: string };
  language: string | null;
  location: {
    country: string | null;
    region: string | null;
    city: string | null;
    timezone: string | null;
    latitude: number | null;
    longitude: number | null;
  };
}

export interface ChaiAuthUser {
  sub: string;
  name?: string;
  email?: string;
  email_verified?: boolean;
  /** Only after a sign-in that requested the `login_context` scope (browser-only mode). */
  login_context?: LoginContext;
}

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthState {
  status: AuthStatus;
  user: ChaiAuthUser | null;
  /** Message of the last failed sign-in (denied, expired, tampered redirect, ...). */
  error: string | null;
}

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface ChaiAuthConfig {
  /** Client ID of the application, from the ChaiAuth developer console. */
  clientId: string;
  /** Must match the application's registered redirect URI exactly. */
  redirectUri: string;
  /** Base URL of the ChaiAuth API (the OpenID issuer), e.g. `https://auth.example.com`. */
  issuer: string;
  /** Defaults to `openid profile email`. */
  scope?: string;
  /** Where the session lives. Defaults to `sessionStorage` (per tab, cleared when the tab closes). */
  storage?: StorageLike;
  /** Override for tests or non-browser runtimes. */
  fetch?: typeof fetch;
  /** How to send the browser to the sign-in page. Defaults to `window.location.assign`. */
  navigate?: (url: string) => void;
  now?: () => number;
}

/** Everything ChaiAuth needs to resume an authorization request after the user has authenticated. */
export interface AuthContext {
  client_id: string;
  redirect_uri: string;
  scope: string;
  state: string;
  nonce?: string;
  code_challenge?: string;
  code_challenge_method?: "S256";
}

export interface PasswordCredentials {
  /** Email address. */
  email?: string;
  /** Username, if the app allows it. */
  username?: string;
  password: string;
}

export interface EmbeddedSignInOptions {
  /** Path on your site to return to afterwards (browser-only mode). */
  returnTo?: string;
  /**
   * Backend mode: an authorization context created by YOUR server (which keeps the PKCE verifier and
   * the client secret). The browser then hands the resulting code to your server's redirect URI.
   * Without it, the SDK runs as a public client and finishes the sign-in in the browser.
   */
  context?: AuthContext;
}

/** Result of a credentials sign-in step. */
export type SignInResult =
  | { status: "complete"; returnTo?: string }
  | { status: "mfa_required"; mfaToken: string; context: AuthContext };

/** Shape of ChaiAuth's JSON responses (success and error). */
interface ApiBody {
  message?: string;
  code?: string;
  mfa_required?: boolean;
  mfa_token?: string;
  data?: { code?: string; state?: string; redirect_uri?: string } | null;
}

export class ChaiAuthError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = "ChaiAuthError";
  }
}

export interface InitResult {
  /** True when the current URL was a sign-in redirect, so the caller should clean it up. */
  handledRedirect: boolean;
  /** Where the app asked to go back to after sign-in (same-origin path only). */
  returnTo?: string;
}

interface Metadata {
  issuer?: string;
  authorization_endpoint: string;
  token_endpoint: string;
  userinfo_endpoint: string;
  revocation_endpoint?: string;
}

interface StoredTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  scope?: string;
  /** Epoch milliseconds. */
  expiresAt: number;
}

interface PendingLogin {
  state: string;
  verifier: string;
  nonce: string;
  returnTo?: string;
}

const DEFAULT_SCOPE = "openid profile email";
/** Refresh slightly early so a token never expires in flight. */
const EXPIRY_SKEW_MS = 30_000;
/** Errors after which the refresh token is certainly unusable (as opposed to a network blip). */
const TERMINAL_TOKEN_ERRORS = new Set(["invalid_grant", "invalid_client", "unauthorized_client", "invalid_request"]);

const SERVER_STATE: AuthState = { status: "loading", user: null, error: null };

export const createMemoryStorage = (): StorageLike => {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
};

const defaultStorage = (): StorageLike => {
  try {
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem("__chaiauth_probe", "1");
      sessionStorage.removeItem("__chaiauth_probe");
      return sessionStorage;
    }
  } catch {
    // Storage blocked (private mode, sandboxed iframe): fall back to memory
  }
  return createMemoryStorage();
};

const decodeJwtPayload = (jwt: string): Record<string, unknown> => {
  const part = jwt.split(".")[1];
  if (!part) throw new ChaiAuthError("invalid_id_token", "Malformed ID token");
  try {
    const binary = atob(part.replace(/-/g, "+").replace(/_/g, "/"));
    const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as Record<string, unknown>;
  } catch {
    throw new ChaiAuthError("invalid_id_token", "Malformed ID token");
  }
};

/** Only same-origin paths are honoured, so a crafted `returnTo` can never become an open redirect. */
const safeReturnTo = (value: string | undefined): string | undefined =>
  value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") ? value : undefined;

/**
 * Framework-agnostic OpenID Connect client for ChaiAuth: Authorization Code flow with PKCE (S256),
 * as a public client (no client secret is ever needed in the browser).
 */
export class ChaiAuthClient {
  private state: AuthState = SERVER_STATE;
  private readonly listeners = new Set<() => void>();
  private metadataPromise?: Promise<Metadata>;
  private initPromise?: Promise<InitResult>;
  private refreshPromise?: Promise<StoredTokens | null>;

  private readonly scope: string;
  private readonly storage: StorageLike;
  private readonly fetchFn: typeof fetch;
  private readonly navigate: (url: string) => void;
  private readonly now: () => number;
  private readonly issuer: string;

  constructor(private readonly config: ChaiAuthConfig) {
    if (!config.clientId) throw new Error("ChaiAuth: `clientId` is required");
    if (!config.redirectUri) throw new Error("ChaiAuth: `redirectUri` is required");
    if (!config.issuer) throw new Error("ChaiAuth: `issuer` is required");

    this.issuer = config.issuer.replace(/\/+$/, "");
    this.scope = config.scope ?? DEFAULT_SCOPE;
    this.storage = config.storage ?? defaultStorage();
    this.fetchFn = config.fetch ?? ((...args) => globalThis.fetch(...args));
    this.navigate = config.navigate ?? ((url) => window.location.assign(url));
    this.now = config.now ?? Date.now;
  }

  // ── State (shaped for React's useSyncExternalStore) ───────
  getState = (): AuthState => this.state;
  getServerState = (): AuthState => SERVER_STATE;

  subscribe = (listener: () => void): (() => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private setState(next: AuthState) {
    const prev = this.state;
    if (prev.status === next.status && prev.user === next.user && prev.error === next.error) return;
    this.state = next;
    this.listeners.forEach((l) => l());
  }

  // ── Lifecycle ─────────────────────────────────────────────
  /**
   * Call once on page load with the current URL. Finishes a sign-in redirect if there is one,
   * otherwise restores the stored session. Safe to call repeatedly (e.g. React StrictMode).
   */
  initialize(currentUrl: string): Promise<InitResult> {
    this.initPromise ??= this.run(currentUrl);
    return this.initPromise;
  }

  private async run(currentUrl: string): Promise<InitResult> {
    const params = new URL(currentUrl).searchParams;
    const pending = this.readPending();
    const looksLikeRedirect = params.has("code") || params.has("error");

    // Query params are only ours if WE started a sign-in: an app's own `?code=` is left alone
    if (pending && looksLikeRedirect) {
      try {
        const returnTo = await this.handleRedirect(currentUrl);
        return { handledRedirect: true, returnTo };
      } catch (err) {
        this.clearSession();
        this.setState({ status: "unauthenticated", user: null, error: (err as Error).message });
        return { handledRedirect: true };
      }
    }

    await this.restoreSession();
    return { handledRedirect: false };
  }

  private async restoreSession(): Promise<void> {
    let tokens = this.readTokens();
    if (!tokens) return this.setState({ status: "unauthenticated", user: null, error: null });

    try {
      if (tokens.expiresAt - EXPIRY_SKEW_MS <= this.now()) {
        tokens = await this.refreshTokens();
        if (!tokens) return; // refreshTokens already published "unauthenticated"
      }

      let user: ChaiAuthUser;
      try {
        user = await this.fetchUser(tokens.accessToken);
      } catch (err) {
        if (!(err instanceof ChaiAuthError) || err.code !== "invalid_token") throw err;
        // Access token rejected (e.g. server restart): one refresh, then give up
        const fresh = await this.refreshTokens();
        if (!fresh) return;
        user = await this.fetchUser(fresh.accessToken);
      }

      // The login context belongs to the sign-in, not the profile: carry it over from the cached user
      const cachedContext = this.readCachedUser()?.login_context;
      if (cachedContext) user = { ...user, login_context: cachedContext };

      this.storage.setItem(this.key("user"), JSON.stringify(user));
      this.setState({ status: "authenticated", user, error: null });
    } catch (err) {
      // Network trouble must not sign anyone out: keep the tokens and show the cached profile
      const cached = this.readCachedUser();
      if (cached) return this.setState({ status: "authenticated", user: cached, error: null });
      this.setState({ status: "unauthenticated", user: null, error: (err as Error).message });
    }
  }

  // ── Sign in ───────────────────────────────────────────────
  /**
   * Sends the browser to ChaiAuth. Resolves right before navigation starts.
   * Failures (e.g. ChaiAuth unreachable) are reported through `state.error` instead of throwing,
   * so it is safe to call straight from a click handler.
   */
  async signIn(options: { returnTo?: string } = {}): Promise<void> {
    let authorizeUrl: string;
    try {
      authorizeUrl = await this.buildAuthorizeUrl(options.returnTo);
    } catch (err) {
      this.setState({ ...this.state, error: (err as Error).message });
      return;
    }
    this.navigate(authorizeUrl);
  }

  private async buildAuthorizeUrl(returnTo: string | undefined): Promise<string> {
    const metadata = await this.getMetadata();
    const context = await this.createAuthContext(returnTo);

    const url = new URL(metadata.authorization_endpoint);
    url.searchParams.set("response_type", "code");
    for (const [key, value] of Object.entries(context)) url.searchParams.set(key, value);
    return url.toString();
  }

  /** Fresh PKCE verifier, state and nonce for one sign-in attempt. The verifier stays in storage. */
  private async createAuthContext(returnTo: string | undefined): Promise<Required<AuthContext>> {
    const verifier = randomString(32);
    const state = randomString(16);
    const nonce = randomString(16);
    const challenge = await createCodeChallenge(verifier);

    this.writePending({ state, verifier, nonce, returnTo: safeReturnTo(returnTo) });

    return {
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: this.scope,
      state,
      nonce,
      code_challenge: challenge,
      code_challenge_method: "S256",
    };
  }

  // ── Embedded sign-in (no redirect to ChaiAuth's page) ─────
  /**
   * Signs in with email/username + password using the app's OWN form. Throws a `ChaiAuthError` with a
   * user-presentable message on failure. A `complete` result means signed in (browser-only mode) or
   * that the browser is already navigating to your server's redirect URI (backend mode).
   * `mfa_required` means the account has two-factor: collect a code and call `verifyMfa`.
   */
  async signInWithPassword(credentials: PasswordCredentials, options: EmbeddedSignInOptions = {}): Promise<SignInResult> {
    return this.authorize({ ...credentials }, options);
  }

  /** Passwordless step 1: emails a 6-digit sign-in code. Always succeeds for unknown emails (no enumeration). */
  async sendEmailCode(email: string): Promise<void> {
    await this.post("/o/email-code", { client_id: this.config.clientId, email });
  }

  /** Passwordless step 2: signs in with the emailed code. */
  async signInWithEmailCode(input: { email: string; code: string }, options: EmbeddedSignInOptions = {}): Promise<SignInResult> {
    return this.authorize({ email: input.email, otp: input.code }, options);
  }

  /** Second factor: the `mfaToken` and `context` come from the `mfa_required` result. Accepts an authenticator or backup code. */
  async verifyMfa(
    input: { mfaToken: string; code: string; context: AuthContext },
    options: Pick<EmbeddedSignInOptions, "returnTo"> & { backend?: boolean } = {},
  ): Promise<SignInResult> {
    const body = await this.post("/o/authorize/mfa", {
      ...input.context,
      consent_granted: true,
      mfa_token: input.mfaToken,
      code: input.code.trim(),
    });
    return this.finish(body, Boolean(options.backend));
  }

  /**
   * Creates an account. ChaiAuth emails a verification link; the user can sign in after confirming it.
   * `captchaToken` is the Cloudflare Turnstile token (see `<SignUpForm turnstileSiteKey>`).
   */
  async signUp(input: { name: string; email: string; password: string; captchaToken?: string }): Promise<string> {
    const body = await this.post("/o/register", { client_id: this.config.clientId, ...input });
    return body.message ?? "Account created. Check your email to verify your address.";
  }

  /** Starts a social sign-in (e.g. Google). The provider has to leave the page; you come back signed in. */
  async signInWithProvider(provider: string, options: EmbeddedSignInOptions = {}): Promise<void> {
    const context = options.context ?? (await this.createAuthContext(options.returnTo));
    const url = new URL(`${this.issuer}/api/auth/providers/${encodeURIComponent(provider)}`);
    url.searchParams.set("proxy_state", JSON.stringify(context));
    this.navigate(url.toString());
  }

  /** First step of a credentials sign-in: PKCE context (or the server's), credentials, then finish or ask for MFA. */
  private async authorize(credentials: Record<string, unknown>, options: EmbeddedSignInOptions): Promise<SignInResult> {
    const backend = Boolean(options.context);
    const context = options.context ?? (await this.createAuthContext(options.returnTo));

    let body: ApiBody;
    try {
      body = await this.post("/o/authorize", { ...context, consent_granted: true, ...credentials }, { allowMfa: true });
    } catch (err) {
      if (!backend) this.clearPending();
      throw err;
    }

    if (body.mfa_required && body.mfa_token) return { status: "mfa_required", mfaToken: body.mfa_token, context };
    return this.finish(body, backend);
  }

  /** Turns an authorization response into a finished sign-in (or the navigation that finishes it). */
  private async finish(body: ApiBody, backend: boolean): Promise<SignInResult> {
    const data = body.data;
    if (!data?.code || !data.redirect_uri) {
      throw new ChaiAuthError("invalid_response", "The sign-in response had no authorization code.");
    }
    const redirect = new URL(data.redirect_uri);
    redirect.searchParams.set("code", data.code);
    if (data.state) redirect.searchParams.set("state", data.state);

    if (backend) {
      this.navigate(redirect.toString());
      return { status: "complete" };
    }
    return { status: "complete", returnTo: await this.handleRedirect(redirect.toString()) };
  }

  /** POST JSON to a ChaiAuth endpoint; failures become a `ChaiAuthError` with the server's message. */
  private async post(path: string, payload: Record<string, unknown>, opts: { allowMfa?: boolean } = {}): Promise<ApiBody> {
    let res: Response;
    try {
      res = await this.fetchFn(`${this.issuer}${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload),
      });
    } catch {
      throw new ChaiAuthError("network_error", "Could not reach the sign-in service. Check your connection and try again.");
    }

    const body = (await res.json().catch(() => ({}))) as ApiBody;
    if (opts.allowMfa && res.status === 403 && body.mfa_required && body.mfa_token) return body;
    if (!res.ok) throw new ChaiAuthError(body.code ?? "request_failed", body.message ?? `Request failed (${res.status}).`);
    return body;
  }

  /** Completes the redirect back from ChaiAuth. Returns the `returnTo` path, if any. */
  async handleRedirect(url: string): Promise<string | undefined> {
    const params = new URL(url).searchParams;
    const pending = this.readPending();
    this.clearPending(); // single use, whatever happens next

    if (!pending) throw new ChaiAuthError("no_pending_login", "No sign-in is in progress. Please try again.");
    if (params.get("state") !== pending.state) {
      throw new ChaiAuthError("state_mismatch", "The sign-in response did not match your request. Please try again.");
    }

    const error = params.get("error");
    if (error) {
      throw new ChaiAuthError(
        error,
        params.get("error_description") ??
          (error === "access_denied" ? "Sign-in was cancelled." : "Sign-in failed. Please try again."),
      );
    }

    const code = params.get("code");
    if (!code) throw new ChaiAuthError("invalid_response", "The sign-in response had no authorization code.");

    const tokens = await this.requestTokens({
      grant_type: "authorization_code",
      code,
      redirect_uri: this.config.redirectUri,
      code_verifier: pending.verifier,
    });
    if (tokens.idToken) await this.verifyIdToken(tokens.idToken, pending.nonce);

    const loginContext = tokens.idToken ? (decodeJwtPayload(tokens.idToken).login_context as LoginContext | undefined) : undefined;
    const user: ChaiAuthUser = {
      ...(await this.fetchUser(tokens.accessToken)),
      ...(loginContext && { login_context: loginContext }),
    };

    this.saveTokens(tokens);
    this.storage.setItem(this.key("user"), JSON.stringify(user));
    this.setState({ status: "authenticated", user, error: null });
    return pending.returnTo;
  }

  // ── Tokens ────────────────────────────────────────────────
  /**
   * A valid access token for calling your own API, refreshed when it is about to expire.
   * `null` means signed out. Throws on transient network failures (the session is kept: retry).
   */
  async getAccessToken(): Promise<string | null> {
    const tokens = this.readTokens();
    if (!tokens) return null;
    if (tokens.expiresAt - EXPIRY_SKEW_MS > this.now()) return tokens.accessToken;
    return (await this.refreshTokens())?.accessToken ?? null;
  }

  private refreshTokens(): Promise<StoredTokens | null> {
    // Refresh tokens rotate (single use): concurrent callers must share one request
    this.refreshPromise ??= this.doRefresh().finally(() => {
      this.refreshPromise = undefined;
    });
    return this.refreshPromise;
  }

  private async doRefresh(): Promise<StoredTokens | null> {
    const current = this.readTokens();
    if (!current?.refreshToken) {
      this.clearSession();
      this.setState({ status: "unauthenticated", user: null, error: null });
      return null;
    }

    try {
      const next = await this.requestTokens({ grant_type: "refresh_token", refresh_token: current.refreshToken });
      const merged: StoredTokens = { ...next, refreshToken: next.refreshToken ?? current.refreshToken };
      this.saveTokens(merged);
      return merged;
    } catch (err) {
      if (err instanceof ChaiAuthError && TERMINAL_TOKEN_ERRORS.has(err.code)) {
        this.clearSession();
        this.setState({ status: "unauthenticated", user: null, error: "Your session has expired. Please sign in again." });
        return null;
      }
      throw err;
    }
  }

  private async requestTokens(params: Record<string, string>): Promise<StoredTokens> {
    const metadata = await this.getMetadata();
    const res = await this.fetchFn(metadata.token_endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", Accept: "application/json" },
      body: new URLSearchParams({ client_id: this.config.clientId, ...params }),
    });

    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok) {
      throw new ChaiAuthError(
        typeof body.error === "string" ? body.error : "token_error",
        String(body.error_description ?? body.message ?? `Token request failed (${res.status})`),
      );
    }
    if (typeof body.access_token !== "string") {
      throw new ChaiAuthError("invalid_response", "The token response had no access token.");
    }

    const expiresIn = typeof body.expires_in === "number" ? body.expires_in : 3600;
    return {
      accessToken: body.access_token,
      refreshToken: typeof body.refresh_token === "string" ? body.refresh_token : undefined,
      idToken: typeof body.id_token === "string" ? body.id_token : undefined,
      scope: typeof body.scope === "string" ? body.scope : undefined,
      expiresAt: this.now() + expiresIn * 1000,
    };
  }

  /**
   * Checks the claims that bind the token to this login. The token arrives straight from the token
   * endpoint over TLS (OIDC Core 3.1.3.7), so the signature check is not required for this flow.
   */
  private async verifyIdToken(idToken: string, expectedNonce: string): Promise<void> {
    const claims = decodeJwtPayload(idToken);
    const metadata = await this.getMetadata();

    const aud = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    if (!aud.includes(this.config.clientId)) {
      throw new ChaiAuthError("invalid_id_token", "The ID token was issued for a different application.");
    }
    if (metadata.issuer && claims.iss !== metadata.issuer) {
      throw new ChaiAuthError("invalid_id_token", "The ID token came from an unexpected issuer.");
    }
    if (claims.nonce !== expectedNonce) {
      throw new ChaiAuthError("invalid_id_token", "The ID token nonce did not match. Please try again.");
    }
    if (typeof claims.exp === "number" && claims.exp * 1000 <= this.now()) {
      throw new ChaiAuthError("invalid_id_token", "The ID token has expired.");
    }
  }

  private async fetchUser(accessToken: string): Promise<ChaiAuthUser> {
    const metadata = await this.getMetadata();
    const res = await this.fetchFn(metadata.userinfo_endpoint, {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/json" },
    });
    if (res.status === 401) throw new ChaiAuthError("invalid_token", "The access token was rejected.");

    const body = (await res.json().catch(() => ({}))) as Record<string, unknown>;
    if (!res.ok || typeof body.sub !== "string") {
      throw new ChaiAuthError("userinfo_error", `Could not load the user profile (${res.status}).`);
    }
    return {
      sub: body.sub,
      ...(typeof body.name === "string" && { name: body.name }),
      ...(typeof body.email === "string" && { email: body.email }),
      ...(typeof body.email_verified === "boolean" && { email_verified: body.email_verified }),
    };
  }

  // ── Sign out ──────────────────────────────────────────────
  /** Ends the local session and revokes the refresh token at ChaiAuth (best effort). */
  async signOut(): Promise<void> {
    const tokens = this.readTokens();
    this.clearSession();
    this.setState({ status: "unauthenticated", user: null, error: null });

    if (!tokens?.refreshToken) return;
    try {
      const metadata = await this.getMetadata();
      if (!metadata.revocation_endpoint) return;
      await this.fetchFn(metadata.revocation_endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ token: tokens.refreshToken, client_id: this.config.clientId }),
      });
    } catch {
      // Already signed out locally; the refresh token also expires on its own
    }
  }

  // ── Discovery ─────────────────────────────────────────────
  private getMetadata(): Promise<Metadata> {
    this.metadataPromise ??= this.loadMetadata().catch((err) => {
      this.metadataPromise = undefined; // allow a retry after a network failure
      throw err;
    });
    return this.metadataPromise;
  }

  private async loadMetadata(): Promise<Metadata> {
    const res = await this.fetchFn(`${this.issuer}/.well-known/openid-configuration`, {
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new ChaiAuthError("discovery_failed", `Could not reach ChaiAuth at ${this.issuer} (${res.status}).`);

    const m = (await res.json()) as Partial<Metadata>;
    if (!m.authorization_endpoint || !m.token_endpoint || !m.userinfo_endpoint) {
      throw new ChaiAuthError("discovery_failed", "ChaiAuth returned an incomplete discovery document.");
    }
    return m as Metadata;
  }

  // ── Storage ───────────────────────────────────────────────
  private key = (name: string) => `chaiauth:${this.config.clientId}:${name}`;

  private readJson<T>(name: string): T | null {
    try {
      const raw = this.storage.getItem(this.key(name));
      return raw ? (JSON.parse(raw) as T) : null;
    } catch {
      return null;
    }
  }

  private readTokens(): StoredTokens | null {
    const t = this.readJson<StoredTokens>("tokens");
    return t && typeof t.accessToken === "string" && typeof t.expiresAt === "number" ? t : null;
  }

  private saveTokens(tokens: StoredTokens) {
    this.storage.setItem(this.key("tokens"), JSON.stringify(tokens));
  }

  private readCachedUser(): ChaiAuthUser | null {
    const u = this.readJson<ChaiAuthUser>("user");
    return u && typeof u.sub === "string" ? u : null;
  }

  private readPending(): PendingLogin | null {
    const p = this.readJson<PendingLogin>("pending");
    return p && typeof p.state === "string" && typeof p.verifier === "string" && typeof p.nonce === "string" ? p : null;
  }

  private writePending(pending: PendingLogin) {
    this.storage.setItem(this.key("pending"), JSON.stringify(pending));
  }

  private clearPending() {
    this.storage.removeItem(this.key("pending"));
  }

  private clearSession() {
    this.storage.removeItem(this.key("tokens"));
    this.storage.removeItem(this.key("user"));
    this.clearPending();
  }
}
