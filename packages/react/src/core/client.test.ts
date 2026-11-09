import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ChaiAuthClient, createMemoryStorage } from "./client";
import { createCodeChallenge, randomString } from "./pkce";

const ISSUER = "https://auth.test";
const CLIENT_ID = "client-123";
const REDIRECT = "https://app.test/callback";
const METADATA = {
  issuer: ISSUER,
  authorization_endpoint: "https://ui.auth.test/authorize",
  token_endpoint: `${ISSUER}/o/token`,
  userinfo_endpoint: `${ISSUER}/o/userinfo`,
  revocation_endpoint: `${ISSUER}/o/revoke`,
};
const USER = { sub: "user-1", name: "Asha Patel", email: "asha@example.com", email_verified: true };

const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const makeIdToken = (claims: Record<string, unknown>) => `${b64url({ alg: "RS256" })}.${b64url(claims)}.sig`;
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

interface Harness {
  client: ChaiAuthClient;
  storage: ReturnType<typeof createMemoryStorage>;
  navigated: string[];
  tokenRequests: URLSearchParams[];
  revoked: URLSearchParams[];
  clock: { now: number };
  /** Decides the token endpoint answer; defaults to a successful exchange. */
  onToken: { fn: (params: URLSearchParams) => Response };
  network: { down: boolean };
}

function setup(): Harness {
  const storage = createMemoryStorage();
  const navigated: string[] = [];
  const tokenRequests: URLSearchParams[] = [];
  const revoked: URLSearchParams[] = [];
  const clock = { now: 1_700_000_000_000 };
  const network = { down: false };
  const onToken = { fn: (_p: URLSearchParams): Response => json({}, 500) };
  let nonceForIdToken = "";

  const fetchFn: typeof fetch = async (input, init) => {
    if (network.down) throw new TypeError("Failed to fetch");
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) return json(METADATA);
    if (url === METADATA.token_endpoint) {
      const params = new URLSearchParams(String(init?.body));
      tokenRequests.push(params);
      return onToken.fn(params);
    }
    if (url === METADATA.userinfo_endpoint) {
      const auth = (init?.headers as Record<string, string>).Authorization;
      return auth === "Bearer access-ok" || auth === "Bearer access-2" ? json(USER) : json({ error: "invalid_token" }, 401);
    }
    if (url === METADATA.revocation_endpoint) {
      revoked.push(new URLSearchParams(String(init?.body)));
      return new Response(null, { status: 200 });
    }
    return json({}, 404);
  };

  const client = new ChaiAuthClient({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT,
    issuer: `${ISSUER}/`,
    storage,
    fetch: fetchFn,
    navigate: (u) => void navigated.push(u),
    now: () => clock.now,
  });

  // Default token endpoint: exchange succeeds, ID token carries whatever nonce was sent at sign-in
  onToken.fn = (p) =>
    p.get("grant_type") === "refresh_token"
      ? json({ access_token: "access-2", refresh_token: "refresh-2", expires_in: 3600, token_type: "Bearer" })
      : json({
          access_token: "access-ok",
          refresh_token: "refresh-1",
          id_token: makeIdToken({ aud: CLIENT_ID, iss: ISSUER, nonce: nonceForIdToken, exp: clock.now / 1000 + 600 }),
          expires_in: 3600,
          token_type: "Bearer",
          scope: "openid profile email",
        });

  // Lets tests pick the nonce that the next ID token should echo
  Object.defineProperty(client, "__setNonce", { value: (n: string) => (nonceForIdToken = n) });
  return { client, storage, navigated, tokenRequests, revoked, clock, onToken, network };
}

const pendingOf = (h: Harness) => JSON.parse(h.storage.getItem(`chaiauth:${CLIENT_ID}:pending`) ?? "null");
const setNonce = (h: Harness, n: string) => (h.client as unknown as { __setNonce: (n: string) => void }).__setNonce(n);

/** Runs sign-in and returns the redirect URL ChaiAuth would send the browser back to. */
async function signInAndRedirect(h: Harness, extra: Record<string, string> = { code: "the-code" }, state?: string) {
  await h.client.signIn({ returnTo: "/dashboard" });
  const pending = pendingOf(h);
  setNonce(h, pending.nonce);
  const url = new URL(REDIRECT);
  url.searchParams.set("state", state ?? pending.state);
  for (const [k, v] of Object.entries(extra)) url.searchParams.set(k, v);
  return url.toString();
}

describe("PKCE", () => {
  test("matches the RFC 7636 test vector", async () => {
    assert.equal(
      await createCodeChallenge("dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk"),
      "E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM",
    );
  });

  test("random strings are URL-safe, long enough and unique", () => {
    const a = randomString(32);
    assert.equal(a.length, 43);
    assert.match(a, /^[A-Za-z0-9_-]+$/);
    assert.notEqual(a, randomString(32));
  });
});

describe("sign in", () => {
  test("redirects to the authorization endpoint with PKCE, state and nonce", async () => {
    const h = setup();
    await h.client.signIn();

    assert.equal(h.navigated.length, 1);
    const url = new URL(h.navigated[0]!);
    assert.equal(`${url.origin}${url.pathname}`, METADATA.authorization_endpoint);
    assert.equal(url.searchParams.get("response_type"), "code");
    assert.equal(url.searchParams.get("client_id"), CLIENT_ID);
    assert.equal(url.searchParams.get("redirect_uri"), REDIRECT);
    assert.equal(url.searchParams.get("scope"), "openid profile email");
    assert.equal(url.searchParams.get("code_challenge_method"), "S256");

    const pending = pendingOf(h);
    assert.equal(url.searchParams.get("state"), pending.state);
    assert.equal(url.searchParams.get("nonce"), pending.nonce);
    assert.equal(url.searchParams.get("code_challenge"), await createCodeChallenge(pending.verifier));
  });

  test("reports an unreachable server through state.error instead of throwing", async () => {
    const h = setup();
    h.network.down = true;
    await h.client.signIn();
    assert.equal(h.navigated.length, 0);
    assert.match(h.client.getState().error ?? "", /Failed to fetch/);
  });
});

describe("redirect handling", () => {
  test("exchanges the code, verifies the ID token and signs in", async () => {
    const h = setup();
    const url = await signInAndRedirect(h);
    const result = await h.client.initialize(url);

    assert.deepEqual(result, { handledRedirect: true, returnTo: "/dashboard" });
    assert.equal(h.client.getState().status, "authenticated");
    assert.deepEqual(h.client.getState().user, USER);

    const sent = h.tokenRequests[0]!;
    assert.equal(sent.get("grant_type"), "authorization_code");
    assert.equal(sent.get("code"), "the-code");
    assert.equal(sent.get("redirect_uri"), REDIRECT);
    assert.equal(sent.get("client_id"), CLIENT_ID);
    assert.equal(sent.get("client_secret"), null); // public client: no secret in the browser
    assert.equal(await createCodeChallenge(sent.get("code_verifier")!), new URL(h.navigated[0]!).searchParams.get("code_challenge"));
    assert.equal(pendingOf(h), null, "the pending login is single use");
  });

  test("a returnTo that is not a local path is dropped", async () => {
    const h = setup();
    await h.client.signIn({ returnTo: "//evil.example/steal" });
    assert.equal(pendingOf(h).returnTo, undefined);
    await h.client.signIn({ returnTo: "https://evil.example" });
    assert.equal(pendingOf(h).returnTo, undefined);
  });

  test("rejects a mismatched state (CSRF) and never calls the token endpoint", async () => {
    const h = setup();
    const url = await signInAndRedirect(h, { code: "the-code" }, "forged-state");
    const result = await h.client.initialize(url);

    assert.equal(result.handledRedirect, true);
    assert.equal(h.client.getState().status, "unauthenticated");
    assert.match(h.client.getState().error ?? "", /did not match/);
    assert.equal(h.tokenRequests.length, 0);
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:tokens`), null);
  });

  test("shows a friendly message when the user cancels", async () => {
    const h = setup();
    const url = await signInAndRedirect(h, { error: "access_denied" });
    await h.client.initialize(url);
    assert.equal(h.client.getState().status, "unauthenticated");
    assert.equal(h.client.getState().error, "Sign-in was cancelled.");
    assert.equal(h.tokenRequests.length, 0);
  });

  test("rejects an ID token whose nonce does not match", async () => {
    const h = setup();
    const url = await signInAndRedirect(h);
    setNonce(h, "someone-elses-nonce");
    await h.client.initialize(url);
    assert.equal(h.client.getState().status, "unauthenticated");
    assert.match(h.client.getState().error ?? "", /nonce/);
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:tokens`), null);
  });

  test("shows the server's reason when the code exchange fails", async () => {
    const h = setup();
    const url = await signInAndRedirect(h);
    h.onToken.fn = () => json({ error: "invalid_grant", error_description: "Invalid or expired authorization code" }, 400);
    await h.client.initialize(url);
    assert.equal(h.client.getState().error, "Invalid or expired authorization code");
  });

  test("leaves an app's own ?code= alone when no sign-in was started", async () => {
    const h = setup();
    const result = await h.client.initialize(`${REDIRECT}?code=not-ours&state=x`);
    assert.equal(result.handledRedirect, false);
    assert.equal(h.client.getState().status, "unauthenticated");
    assert.equal(h.tokenRequests.length, 0);
  });
});

describe("session", () => {
  async function signedIn() {
    const h = setup();
    await h.client.initialize(await signInAndRedirect(h));
    return h;
  }

  test("is restored from storage after a reload", async () => {
    const h = await signedIn();
    const reloaded = new ChaiAuthClient({
      clientId: CLIENT_ID, redirectUri: REDIRECT, issuer: ISSUER, storage: h.storage,
      fetch: async (input, init) => {
        if (String(input).endsWith("openid-configuration")) return json(METADATA);
        const auth = (init?.headers as Record<string, string>).Authorization;
        return auth === "Bearer access-ok" ? json(USER) : json({}, 401);
      },
      now: () => h.clock.now,
    });
    await reloaded.initialize(REDIRECT);
    assert.equal(reloaded.getState().status, "authenticated");
    assert.equal(reloaded.getState().user?.email, USER.email);
  });

  test("refreshes an expiring token once, even for concurrent callers, and rotates the refresh token", async () => {
    const h = await signedIn();
    h.tokenRequests.length = 0;
    h.clock.now += 3600_000; // access token expired

    const [a, b] = await Promise.all([h.client.getAccessToken(), h.client.getAccessToken()]);
    assert.equal(a, "access-2");
    assert.equal(b, "access-2");
    assert.equal(h.tokenRequests.length, 1, "one shared refresh request");
    assert.equal(h.tokenRequests[0]!.get("refresh_token"), "refresh-1");

    h.clock.now += 3600_000;
    await h.client.getAccessToken();
    assert.equal(h.tokenRequests[1]!.get("refresh_token"), "refresh-2", "the rotated token is used next");
  });

  test("a valid token is returned without any network call", async () => {
    const h = await signedIn();
    h.tokenRequests.length = 0;
    assert.equal(await h.client.getAccessToken(), "access-ok");
    assert.equal(h.tokenRequests.length, 0);
  });

  test("signs out locally when the refresh token is rejected", async () => {
    const h = await signedIn();
    h.clock.now += 3600_000;
    h.onToken.fn = () => json({ error: "invalid_grant", error_description: "Invalid or expired refresh token" }, 400);

    assert.equal(await h.client.getAccessToken(), null);
    assert.equal(h.client.getState().status, "unauthenticated");
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:tokens`), null);
  });

  test("keeps the session when the network fails during refresh", async () => {
    const h = await signedIn();
    h.clock.now += 3600_000;
    h.network.down = true;
    await assert.rejects(() => h.client.getAccessToken(), /Failed to fetch/);
    assert.equal(h.client.getState().status, "authenticated");
    assert.notEqual(h.storage.getItem(`chaiauth:${CLIENT_ID}:tokens`), null);
  });

  test("stays signed in with the cached profile if ChaiAuth is unreachable on reload", async () => {
    const h = await signedIn();
    const offline = new ChaiAuthClient({
      clientId: CLIENT_ID, redirectUri: REDIRECT, issuer: ISSUER, storage: h.storage,
      fetch: async () => { throw new TypeError("Failed to fetch"); },
      now: () => h.clock.now,
    });
    await offline.initialize(REDIRECT);
    assert.equal(offline.getState().status, "authenticated");
    assert.equal(offline.getState().user?.sub, USER.sub);
  });

  test("sign out clears everything and revokes the refresh token", async () => {
    const h = await signedIn();
    await h.client.signOut();

    assert.equal(h.client.getState().status, "unauthenticated");
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:tokens`), null);
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:user`), null);
    assert.equal(h.revoked.length, 1);
    assert.equal(h.revoked[0]!.get("token"), "refresh-1");
    assert.equal(await h.client.getAccessToken(), null);
  });

  test("notifies subscribers only when the state actually changes", async () => {
    const h = setup();
    let calls = 0;
    h.client.subscribe(() => calls++);
    await h.client.initialize(REDIRECT); // loading -> unauthenticated
    await h.client.signOut(); // already unauthenticated with the same shape
    assert.equal(calls, 1);
  });
});
