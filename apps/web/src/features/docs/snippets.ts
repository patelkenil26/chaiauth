/** Code samples for the docs page that need the real host URLs filled in. */
export function buildSnippets(backendHost: string, frontendHost: string) {
  const sdkProviderCode = `"use client";
import { ChaiAuthProvider } from "@chaiauth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChaiAuthProvider
      clientId={process.env.NEXT_PUBLIC_CHAIAUTH_CLIENT_ID!}
      redirectUri="https://yourapp.com/auth/callback" // exactly as registered
      issuer="${backendHost}"
    >
      {children}
    </ChaiAuthProvider>
  );
}`;

  const sdkUsageCode = `import { SignIn, SignedIn, SignedOut, UserButton, useChaiAuth } from "@chaiauth/react";

export function Header() {
  return (
    <header>
      <SignedOut>
        <SignIn returnTo="/dashboard" />
      </SignedOut>
      <SignedIn>
        <UserButton accountUrl="${frontendHost}/dashboard" />
      </SignedIn>
    </header>
  );
}

// Calling your own backend with the user's access token
export function useApi() {
  const { getAccessToken } = useChaiAuth();
  return async (path: string) => {
    const token = await getAccessToken(); // refreshed automatically when needed
    return fetch(path, { headers: { Authorization: \`Bearer \${token}\` } });
  };
}`;

  const apiKeyCode = `# List the users who granted your app access
curl "${backendHost}/v1/users?limit=20" \\
  -H "Authorization: Bearer ca_live_YOUR_API_KEY"

# One user
curl "${backendHost}/v1/users/USER_ID" \\
  -H "Authorization: Bearer ca_live_YOUR_API_KEY"`;

  const apiKeyResponse = `{
  "success": true,
  "data": {
    "sub": "8f14e45f-ceea-4f67-9c1e-2b9d3a6b1c7e",
    "name": "Asha Patel",
    "email": "asha@example.com",
    "email_verified": true,
    "scope": "openid profile email",
    "granted_at": "2026-11-09T10:15:00.000Z"
  }
}`;

  const embeddedFormsCode = `import { SignInForm, SignUpForm } from "@chaiauth/react";

// Rendered INSIDE your own page and theme: the user never visits ChaiAuth.
export function LoginPage() {
  return (
    <SignInForm
      returnTo="/dashboard"
      providers={["google"]}          // optional social buttons
      emailCode                       // optional "email me a code" (passwordless)
      forgotPasswordHref="${frontendHost}/forgot-password"
      onSuccess={(to) => router.replace(to ?? "/dashboard")}
      appearance={{ variables: { primary: "#65a30d", radius: "0.75rem" } }}
    />
  );
}

export function SignupPage() {
  return <SignUpForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />;
}

// Prefer your own UI? Same flows as hooks:
// const { signInWithPassword, sendEmailCode, signInWithEmailCode, verifyMfa, signUp } = useChaiAuth();`;

  const embeddedBackendCode = `// 1. Your SERVER starts the sign-in. It keeps the PKCE verifier and client secret.
app.get("/auth/chaiauth/start", async (req, res) => {
  const state = randomUrlSafe(24), nonce = randomUrlSafe(24), verifier = randomUrlSafe(48);
  res.cookie("chaiauth-flow", sign({ state, nonce, verifier }), { httpOnly: true, sameSite: "lax" });
  res.json({
    context: {
      client_id: CLIENT_ID,
      redirect_uri: "https://yourapp.com/auth/chaiauth/callback",
      scope: "openid profile email login_context",
      state, nonce,
      code_challenge: sha256Base64Url(verifier),
      code_challenge_method: "S256",
    },
  });
});

// 2. Your page passes that context to the SDK. The browser posts the credentials straight to ChaiAuth,
//    then navigates to your callback with the code. Your server finishes the exchange (see "Token exchange").
<SignInForm getAuthContext={() => fetch("/auth/chaiauth/start", { credentials: "include" }).then((r) => r.json()).then((j) => j.context)} />`;

  const brandedEmailsCode = `// Three pages on YOUR site. The emails link to them, so users never see ChaiAuth.

// app/forgot-password/page.tsx
<ForgotPasswordForm turnstileSiteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY} />

// app/reset-password/page.tsx      (link in the email: https://yourapp.com/reset-password?token=...)
<ResetPasswordForm token={searchParams.token} successFooter={<a href="/login">Sign in</a>} />

// app/verify-email/page.tsx        (link in the email: https://yourapp.com/verify-email?token=...)
<VerifyEmail token={searchParams.token} successFooter={<a href="/login">Continue to sign in</a>} />`;

  const loginContextCode = `// Request the scope...
scope=openid profile email login_context

// ...and the ID token (signed, RS256) carries this claim:
{
  "sub": "8f14e45f-ceea-4f67-9c1e-2b9d3a6b1c7e",
  "login_context": {
    "event_id": "5b1c1f06-6d7e-4c2f-9a53-0f2f6d0f9a11",
    "method": "password",                 // password | email_code | mfa | google | github
    "at": "2026-11-19T10:15:42.000Z",
    "is_new_device": false,               // first time this browser + OS + country for this user
    "ip": "203.0.113.9",
    "device": { "type": "Mobile", "browser": "Chrome", "browser_version": "124.0", "os": "Android 14" },
    "language": "en-IN",
    "location": {                         // from the IP: approximate, NOT a GPS position
      "country": "IN", "region": "MH", "city": "Pune", "timezone": "Asia/Kolkata",
      "latitude": 18.5196, "longitude": 73.8553
    }
  }
}`;

  const tokenNodeCode = `// Exchange the code for tokens (server side, Node 18+)
const res = await fetch("${backendHost}/o/token", {
  method: "POST",
  headers: { "Content-Type": "application/x-www-form-urlencoded" },
  body: new URLSearchParams({
    grant_type: "authorization_code",
    client_id: process.env.CHAIAUTH_CLIENT_ID!,
    client_secret: process.env.CHAIAUTH_CLIENT_SECRET!,
    code: authorizationCode,
    redirect_uri: "https://yourapp.com/auth/callback",
    code_verifier: pkceVerifier,
  }),
});
const tokens = await res.json();`;

  const tokenPythonCode = `# Exchange the code for tokens (server side)
import os
import requests

res = requests.post(
    "${backendHost}/o/token",
    data={
        "grant_type": "authorization_code",
        "client_id": os.environ["CHAIAUTH_CLIENT_ID"],
        "client_secret": os.environ["CHAIAUTH_CLIENT_SECRET"],
        "code": authorization_code,
        "redirect_uri": "https://yourapp.com/auth/callback",
        "code_verifier": pkce_verifier,
    },
)
tokens = res.json()`;

  const apiKeyNodeCode = `// List the users who granted your app access (Node 18+)
const res = await fetch("${backendHost}/v1/users?limit=20", {
  headers: { Authorization: \`Bearer \${process.env.CHAIAUTH_API_KEY}\` },
});
const users = await res.json();

// One user
const one = await fetch("${backendHost}/v1/users/USER_ID", {
  headers: { Authorization: \`Bearer \${process.env.CHAIAUTH_API_KEY}\` },
}).then((r) => r.json());`;

  const apiKeyPythonCode = `# List the users who granted your app access
import os
import requests

headers = {"Authorization": f"Bearer {os.environ['CHAIAUTH_API_KEY']}"}

users = requests.get("${backendHost}/v1/users", params={"limit": 20}, headers=headers).json()

# One user
one = requests.get("${backendHost}/v1/users/USER_ID", headers=headers).json()`;

  return {
    tokenNodeCode,
    tokenPythonCode,
    apiKeyNodeCode,
    apiKeyPythonCode,
    sdkProviderCode,
    sdkUsageCode,
    embeddedFormsCode,
    embeddedBackendCode,
    brandedEmailsCode,
    loginContextCode,
    apiKeyCode,
    apiKeyResponse,
  };
}
