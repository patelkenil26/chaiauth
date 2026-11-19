import { createContext, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react";
import {
  ChaiAuthClient,
  type AuthState,
  type ChaiAuthConfig,
  type ChaiAuthUser,
  type EmbeddedSignInOptions,
  type PasswordCredentials,
  type SignInResult,
  type AuthContext,
} from "../core/client";

export interface ChaiAuthContextValue extends AuthState {
  isLoading: boolean;
  isAuthenticated: boolean;
  user: ChaiAuthUser | null;
  /** Redirects to ChaiAuth. Pass `returnTo` (a path on your site) to land there afterwards. */
  signIn: (options?: { returnTo?: string }) => Promise<void>;
  /** Email/username + password sign-in with your own form. Throws a ChaiAuthError on failure. */
  signInWithPassword: (credentials: PasswordCredentials, options?: EmbeddedSignInOptions) => Promise<SignInResult>;
  /** Passwordless step 1: emails a 6-digit sign-in code. */
  sendEmailCode: (email: string) => Promise<void>;
  /** Passwordless step 2: signs in with the emailed code. */
  signInWithEmailCode: (input: { email: string; code: string }, options?: EmbeddedSignInOptions) => Promise<SignInResult>;
  /** Second factor after a `mfa_required` result. Pass the `mfaToken` and `context` you were given. */
  verifyMfa: (
    input: { mfaToken: string; code: string; context: AuthContext },
    options?: { returnTo?: string; backend?: boolean },
  ) => Promise<SignInResult>;
  /** Creates an account; ChaiAuth emails a verification link. Returns the confirmation message. */
  signUp: (input: { name: string; email: string; password: string; captchaToken?: string }) => Promise<string>;
  /** Social sign-in, e.g. "google". Leaves the page and comes back signed in. */
  signInWithProvider: (provider: string, options?: EmbeddedSignInOptions) => Promise<void>;
  signOut: () => Promise<void>;
  /** A fresh access token for calling your own backend, or `null` when signed out. */
  getAccessToken: () => Promise<string | null>;
}

const ChaiAuthContext = createContext<ChaiAuthContextValue | null>(null);

export interface ChaiAuthProviderProps extends Omit<ChaiAuthConfig, "fetch" | "navigate" | "now"> {
  children: ReactNode;
}

/** Query params added by the sign-in redirect. They are removed once handled. */
const REDIRECT_PARAMS = ["code", "state", "error", "error_description", "iss"];

export function ChaiAuthProvider({ children, clientId, redirectUri, issuer, scope, storage }: ChaiAuthProviderProps) {
  // One client per configuration. `storage` is intentionally not a dependency: pass a stable object.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const client = useMemo(() => new ChaiAuthClient({ clientId, redirectUri, issuer, scope, storage }), [clientId, redirectUri, issuer, scope]);

  const state = useSyncExternalStore(client.subscribe, client.getState, client.getServerState);

  useEffect(() => {
    let cancelled = false;
    void client.initialize(window.location.href).then(({ handledRedirect, returnTo }) => {
      if (cancelled || !handledRedirect) return;

      // Strip the one-time code and state from the address bar; go to `returnTo` if there is one
      const url = new URL(window.location.href);
      REDIRECT_PARAMS.forEach((p) => url.searchParams.delete(p));
      const target = returnTo ?? `${url.pathname}${url.search}${url.hash}`;
      window.history.replaceState(window.history.state, "", target);
    });
    return () => {
      cancelled = true;
    };
  }, [client]);

  const value = useMemo<ChaiAuthContextValue>(
    () => ({
      ...state,
      isLoading: state.status === "loading",
      isAuthenticated: state.status === "authenticated",
      signIn: (options) => client.signIn(options),
      signInWithPassword: (credentials, options) => client.signInWithPassword(credentials, options),
      sendEmailCode: (email) => client.sendEmailCode(email),
      signInWithEmailCode: (input, options) => client.signInWithEmailCode(input, options),
      verifyMfa: (input, options) => client.verifyMfa(input, options),
      signUp: (input) => client.signUp(input),
      signInWithProvider: (provider, options) => client.signInWithProvider(provider, options),
      signOut: () => client.signOut(),
      getAccessToken: () => client.getAccessToken(),
    }),
    [client, state],
  );

  return <ChaiAuthContext.Provider value={value}>{children}</ChaiAuthContext.Provider>;
}

export function useChaiAuth(): ChaiAuthContextValue {
  const ctx = useContext(ChaiAuthContext);
  if (!ctx) throw new Error("useChaiAuth must be used inside <ChaiAuthProvider>");
  return ctx;
}
