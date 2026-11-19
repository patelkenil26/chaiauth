import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { ChaiAuthClient, ChaiAuthError, createMemoryStorage, type AuthContext } from "./client";

const ISSUER = "https://auth.test";
const CLIENT_ID = "client-123";
const REDIRECT = "https://app.test/callback";
const METADATA = {
  issuer: ISSUER,
  authorization_endpoint: "https://ui.auth.test/authorize",
  token_endpoint: `${ISSUER}/o/token`,
  userinfo_endpoint: `${ISSUER}/o/userinfo`,
};

const LOGIN_CONTEXT = {
  event_id: "evt-1",
  method: "password",
  at: "2026-11-19T10:00:00.000Z",
  is_new_device: false,
  ip: "203.0.113.9",
  device: { type: "Mobile", browser: "Chrome", browser_version: "124", os: "Android 14" },
  language: "en-IN",
  location: { country: "IN", region: "MH", city: "Pune", timezone: "Asia/Kolkata", latitude: 18.5, longitude: 73.8 },
};

const b64url = (obj: unknown) => Buffer.from(JSON.stringify(obj)).toString("base64url");
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

function setup(authorize: (body: Record<string, unknown>) => Response, other: Record<string, (body: Record<string, unknown>) => Response> = {}) {
  const storage = createMemoryStorage();
  const navigated: string[] = [];
  const authorizeBodies: Record<string, unknown>[] = [];
  const otherBodies: Record<string, Record<string, unknown>> = {};
  let nonce = "";

  const fetchFn: typeof fetch = async (input, init) => {
    const url = String(input);
    if (url.endsWith("/.well-known/openid-configuration")) return json(METADATA);
    if (url === `${ISSUER}/o/authorize`) {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      authorizeBodies.push(body);
      nonce = String(body.nonce ?? "");
      return authorize(body);
    }
    const path = url.slice(ISSUER.length);
    if (other[path]) {
      const body = JSON.parse(String(init?.body)) as Record<string, unknown>;
      otherBodies[path] = body;
      if (path === "/o/authorize/mfa") nonce = String(body.nonce ?? "");
      return other[path]!(body);
    }
    if (url === METADATA.token_endpoint) {
      return json({
        access_token: "access-ok",
        refresh_token: "refresh-1",
        id_token: `${b64url({ alg: "RS256" })}.${b64url({ aud: CLIENT_ID, iss: ISSUER, nonce, exp: Date.now() / 1000 + 600, login_context: LOGIN_CONTEXT })}.sig`,
        expires_in: 3600,
        token_type: "Bearer",
      });
    }
    if (url === METADATA.userinfo_endpoint) return json({ sub: "user-1", email: "asha@example.com" });
    return json({}, 404);
  };

  const client = new ChaiAuthClient({
    clientId: CLIENT_ID,
    redirectUri: REDIRECT,
    issuer: ISSUER,
    storage,
    fetch: fetchFn,
    navigate: (u) => void navigated.push(u),
  });
  return { client, storage, navigated, authorizeBodies, otherBodies };
}

const ok = (body: Record<string, unknown>) =>
  json({ success: true, data: { code: "the-code", state: body.state, redirect_uri: body.redirect_uri } });

describe("embedded password sign-in (browser-only mode)", () => {
  test("posts PKCE context + credentials, then finishes the sign-in without leaving the page", async () => {
    const h = setup(ok);
    const result = await h.client.signInWithPassword({ email: "asha@example.com", password: "pw" }, { returnTo: "/dashboard" });

    const sent = h.authorizeBodies[0]!;
    assert.equal(sent.client_id, CLIENT_ID);
    assert.equal(sent.redirect_uri, REDIRECT);
    assert.equal(sent.consent_granted, true);
    assert.equal(sent.email, "asha@example.com");
    assert.equal(sent.code_challenge_method, "S256");
    assert.ok(typeof sent.code_challenge === "string" && sent.code_challenge.length >= 43);

    assert.deepEqual(result, { status: "complete", returnTo: "/dashboard" });
    assert.equal(h.client.getState().status, "authenticated");
    assert.equal(h.navigated.length, 0);
  });

  test("exposes the login context from the ID token on the user", async () => {
    const h = setup(ok);
    await h.client.signInWithPassword({ email: "asha@example.com", password: "pw" });
    assert.deepEqual(h.client.getState().user?.login_context, LOGIN_CONTEXT);
  });

  test("a wrong password throws the server's message and leaves no pending sign-in behind", async () => {
    const h = setup(() => json({ success: false, message: "Invalid credentials", code: "UNAUTHORIZED" }, 401));
    await assert.rejects(
      () => h.client.signInWithPassword({ email: "asha@example.com", password: "nope" }),
      (err: unknown) => err instanceof ChaiAuthError && err.message === "Invalid credentials" && err.code === "UNAUTHORIZED",
    );
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:pending`), null);
    assert.notEqual(h.client.getState().status, "authenticated");
  });

  test("an unreachable server becomes a friendly network error", async () => {
    const h = setup(() => {
      throw new TypeError("Failed to fetch");
    });
    await assert.rejects(
      () => h.client.signInWithPassword({ email: "a@b.co", password: "pw" }),
      (err: unknown) => err instanceof ChaiAuthError && err.code === "network_error",
    );
  });
});

describe("embedded password sign-in (backend mode)", () => {
  const context: AuthContext = {
    client_id: CLIENT_ID,
    redirect_uri: REDIRECT,
    scope: "openid profile email",
    state: "server-state",
    nonce: "server-nonce",
    code_challenge: "c".repeat(43),
    code_challenge_method: "S256",
  };

  test("uses the server's context and sends the browser to the server's redirect URI with the code", async () => {
    const h = setup(ok);
    await h.client.signInWithPassword({ email: "asha@example.com", password: "pw" }, { context });

    assert.equal(h.authorizeBodies[0]!.state, "server-state");
    assert.equal(h.navigated.length, 1);
    const target = new URL(h.navigated[0]!);
    assert.equal(`${target.origin}${target.pathname}`, REDIRECT);
    assert.equal(target.searchParams.get("code"), "the-code");
    assert.equal(target.searchParams.get("state"), "server-state");
    // No browser-side secrets were created
    assert.equal(h.storage.getItem(`chaiauth:${CLIENT_ID}:pending`), null);
  });
});

describe("social sign-in", () => {
  test("navigates to the provider endpoint carrying the authorization context", async () => {
    const h = setup(ok);
    await h.client.signInWithProvider("google", { returnTo: "/dashboard" });

    const url = new URL(h.navigated[0]!);
    assert.equal(`${url.origin}${url.pathname}`, `${ISSUER}/api/auth/providers/google`);
    const ctx = JSON.parse(url.searchParams.get("proxy_state")!);
    assert.equal(ctx.client_id, CLIENT_ID);
    assert.equal(ctx.redirect_uri, REDIRECT);
    assert.equal(ctx.code_challenge_method, "S256");
    assert.ok(h.storage.getItem(`chaiauth:${CLIENT_ID}:pending`), "pending login stored so the redirect back can finish");
  });
});

const mfaChallenge = () =>
  json(
    { success: false, message: "Two-factor authentication is required.", code: "FORBIDDEN", mfa_required: true, mfa_token: "mfa-tok" },
    403,
  );

describe("two-factor step", () => {
  test("a password sign-in on an MFA account returns the challenge and keeps the sign-in pending", async () => {
    const h = setup(mfaChallenge);
    const result = await h.client.signInWithPassword({ email: "asha@example.com", password: "pw" }, { returnTo: "/dashboard" });

    assert.equal(result.status, "mfa_required");
    if (result.status !== "mfa_required") return;
    assert.equal(result.mfaToken, "mfa-tok");
    assert.equal(result.context.client_id, CLIENT_ID);
    assert.ok(h.storage.getItem(`chaiauth:${CLIENT_ID}:pending`), "PKCE verifier must survive until the code is verified");
    assert.notEqual(h.client.getState().status, "authenticated");
  });

  test("verifying the code with the same context completes the sign-in", async () => {
    const h = setup(mfaChallenge, { "/o/authorize/mfa": ok });
    const first = await h.client.signInWithPassword({ email: "asha@example.com", password: "pw" }, { returnTo: "/dashboard" });
    assert.equal(first.status, "mfa_required");
    if (first.status !== "mfa_required") return;

    const done = await h.client.verifyMfa({ mfaToken: first.mfaToken, code: " 123456 ", context: first.context });
    const sent = h.otherBodies["/o/authorize/mfa"]!;
    assert.equal(sent.mfa_token, "mfa-tok");
    assert.equal(sent.code, "123456", "code is trimmed");
    assert.equal(sent.state, first.context.state);
    assert.deepEqual(done, { status: "complete", returnTo: "/dashboard" });
    assert.equal(h.client.getState().status, "authenticated");
  });

  test("a wrong code throws but keeps the pending sign-in so the user can retry", async () => {
    const h = setup(mfaChallenge, { "/o/authorize/mfa": () => json({ success: false, message: "Invalid authenticator code", code: "UNAUTHORIZED" }, 401) });
    const first = await h.client.signInWithPassword({ email: "a@b.co", password: "pw" });
    if (first.status !== "mfa_required") throw new Error("expected mfa");
    await assert.rejects(
      () => h.client.verifyMfa({ mfaToken: first.mfaToken, code: "000000", context: first.context }),
      (err: unknown) => err instanceof ChaiAuthError && err.message === "Invalid authenticator code",
    );
    assert.ok(h.storage.getItem(`chaiauth:${CLIENT_ID}:pending`));
  });

  test("backend mode: the MFA step navigates to the server redirect URI", async () => {
    const h = setup(mfaChallenge, { "/o/authorize/mfa": ok });
    const context: AuthContext = {
      client_id: CLIENT_ID, redirect_uri: REDIRECT, scope: "openid", state: "srv-state", code_challenge: "c".repeat(43), code_challenge_method: "S256",
    };
    const first = await h.client.signInWithPassword({ email: "a@b.co", password: "pw" }, { context });
    if (first.status !== "mfa_required") throw new Error("expected mfa");
    await h.client.verifyMfa({ mfaToken: first.mfaToken, code: "123456", context: first.context }, { backend: true });
    const target = new URL(h.navigated[0]!);
    assert.equal(target.searchParams.get("code"), "the-code");
    assert.equal(target.searchParams.get("state"), "srv-state");
  });
});

describe("email code sign-in", () => {
  test("requests a code for the app, then signs in with it", async () => {
    const h = setup(ok, { "/o/email-code": () => json({ success: true, message: "sent" }) });
    await h.client.sendEmailCode("asha@example.com");
    assert.deepEqual(h.otherBodies["/o/email-code"], { client_id: CLIENT_ID, email: "asha@example.com" });

    const result = await h.client.signInWithEmailCode({ email: "asha@example.com", code: "123456" }, { returnTo: "/dashboard" });
    const sent = h.authorizeBodies[0]!;
    assert.equal(sent.otp, "123456");
    assert.equal(sent.email, "asha@example.com");
    assert.equal(sent.password, undefined);
    assert.equal(result.status, "complete");
  });

  test("a wrong code is reported", async () => {
    const h = setup(() => json({ success: false, message: "Invalid OTP.", code: "UNAUTHORIZED" }, 401));
    await assert.rejects(
      () => h.client.signInWithEmailCode({ email: "a@b.co", code: "000000" }),
      (err: unknown) => err instanceof ChaiAuthError && err.message === "Invalid OTP.",
    );
  });
});

describe("sign up", () => {
  test("sends the app, details and captcha token, and returns the confirmation message", async () => {
    const h = setup(ok, { "/o/register": () => json({ success: true, message: "Account created. Check your email." }, 201) });
    const message = await h.client.signUp({ name: "Asha", email: "asha@example.com", password: "Str0ng!pass", captchaToken: "cf-token" });
    assert.equal(message, "Account created. Check your email.");
    assert.deepEqual(h.otherBodies["/o/register"], {
      client_id: CLIENT_ID, name: "Asha", email: "asha@example.com", password: "Str0ng!pass", captchaToken: "cf-token",
    });
  });

  test("a duplicate email surfaces the server message", async () => {
    const h = setup(ok, { "/o/register": () => json({ success: false, message: "Email already registered", code: "CONFLICT" }, 409) });
    await assert.rejects(
      () => h.client.signUp({ name: "Asha", email: "asha@example.com", password: "x" }),
      (err: unknown) => err instanceof ChaiAuthError && err.code === "CONFLICT" && err.message === "Email already registered",
    );
  });
});
