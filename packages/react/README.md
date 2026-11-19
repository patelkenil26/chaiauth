# @chaiauth/react

React SDK for ChaiAuth. It runs the OpenID Connect **Authorization Code flow with PKCE** for you and gives you ready-made components.

- `<ChaiAuthProvider>`, `useChaiAuth()`
- `<SignIn />`, `<UserButton />`, `<SignedIn>`, `<SignedOut>`
- `ChaiAuthClient`, a framework-agnostic core if you want your own UI

It is a **public client**: no client secret ever reaches the browser. PKCE (S256), `state` and `nonce` are generated and checked for you, refresh tokens rotate, and sign-out revokes the refresh token on the server.

## Setup

1. In the ChaiAuth developer console, create an application. Its redirect URI must match the one you pass to the SDK **exactly**.
2. Wrap your app:

```tsx
"use client";
import { ChaiAuthProvider } from "@chaiauth/react";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ChaiAuthProvider
      clientId={process.env.NEXT_PUBLIC_CHAIAUTH_CLIENT_ID!}
      redirectUri="https://yourapp.com/auth/callback"
      issuer="https://auth.example.com" // base URL of the ChaiAuth API
    >
      {children}
    </ChaiAuthProvider>
  );
}
```

The provider finishes sign-in on whatever page your redirect URI points to. That page only has to render inside the provider.

3. Use it:

```tsx
import { SignIn, SignedIn, SignedOut, UserButton, useChaiAuth } from "@chaiauth/react";

<SignedOut><SignIn returnTo="/dashboard" /></SignedOut>
<SignedIn><UserButton accountUrl="https://auth.example.com/dashboard" /></SignedIn>

const { user, isLoading, getAccessToken, signOut } = useChaiAuth();
const token = await getAccessToken(); // refreshed when about to expire; null when signed out
```

## API

| Export | What it does |
| --- | --- |
| `ChaiAuthProvider` | Props: `clientId`, `redirectUri`, `issuer`, optional `scope` (default `openid profile email`) and `storage`. |
| `useChaiAuth()` | `{ status, isLoading, isAuthenticated, user, error, signIn, signOut, getAccessToken }` |
| `<SignIn returnTo? className?>` | Sign-in button. `returnTo` must be a path on your site. |
| `<UserButton accountUrl? afterSignOutUrl?>` | Avatar menu with the user's details and "Sign out". Renders nothing when signed out. |
| `<SignedIn>` / `<SignedOut>` | Render children only in that state. |

`signIn()` never throws: failures (for example ChaiAuth being unreachable, or the user cancelling) show up in `error`.

## Security notes

- Tokens are kept in `sessionStorage` (per tab, cleared when the tab closes), so there are no cross-tab refresh races. Like any browser-stored token, they are exposed to XSS: keep a strict Content-Security-Policy.
- `returnTo` only accepts same-origin paths, so it cannot be used as an open redirect.
- The ID token's `aud`, `iss`, `nonce` and `exp` are checked. The signature is not verified in the browser because the token arrives directly from the token endpoint over TLS (OIDC Core 3.1.3.7). Verify it on your server with the JWKS endpoint if you forward it.
- Web Crypto is required, so serve your app over HTTPS (`localhost` is fine in development).

## Develop

```bash
pnpm --filter @chaiauth/react test         # unit tests (node:test)
pnpm --filter @chaiauth/react check-types
pnpm --filter @chaiauth/react build        # ESM + CJS + .d.ts in dist/
```

## Embedded sign-in form (no redirect to ChaiAuth's page)

`<SignInForm />` renders email + password (and optional social buttons) **inside your own page**, in your own theme.

```tsx
<SignInForm
  returnTo="/dashboard"
  providers={["google"]}
  forgotPasswordHref="/forgot-password"
  onSuccess={(to) => router.replace(to ?? "/dashboard")}
  appearance={{ variables: { primary: "#65a30d", radius: "0.75rem" } }}
/>
```

- **Theming:** unset tokens inherit your page's text colour and font. Pass `appearance.variables` (CSS variables) and/or `appearance.classNames` (Tailwind etc.). Prefer your own UI? Use `useChaiAuth().signInWithPassword()` / `signInWithProvider()`.
- **Required console setting:** set the app's **Application URL** to the site that hosts the form (e.g. `https://forms.example.com`). ChaiAuth only accepts embedded sign-ins from that origin.
- **Backend mode:** if your server keeps the client secret (confidential client), pass `getAuthContext` returning the context from your server. The browser posts the credentials to ChaiAuth, then navigates to your server's redirect URI with the code; your server finishes the exchange. The PKCE verifier never reaches the browser.
- **Two-factor** accounts get a code step inside the form (authenticator or backup code). Nothing to configure.
- **Email code** (passwordless): pass `emailCode` to `<SignInForm />` to offer "Email me a sign-in code". It is the inline replacement for magic links, which would have to leave your page.
- **Sign-up:** `<SignUpForm turnstileSiteKey="..." />`. ChaiAuth requires the Cloudflare Turnstile check for sign-ups: add your site's domain to the widget. The user verifies their email, then signs in.
- **Headless:** `useChaiAuth()` also exposes `signInWithEmailCode`, `sendEmailCode`, `verifyMfa` and `signUp` for fully custom UI.
- **Not in the forms yet:** password reset (link to the hosted `/forgot-password` page) and passkeys.

## Login context (device, IP, approximate location)

Add the `login_context` scope and every sign-in comes with the security facts, so you never write device or location detection yourself:

```tsx
<ChaiAuthProvider scope="openid profile email login_context" ... />

const { user } = useChaiAuth();
user?.login_context?.device.browser;     // "Chrome"
user?.login_context?.location.city;      // "Pune"  (from the IP: approximate, not GPS)
user?.login_context?.is_new_device;      // true the first time this browser + OS + country is seen
```

It is a signed claim of the ID token (`login_context`), delivered to your server in backend mode. Store it with `event_id` as a unique key. ChaiAuth also keeps its own login history and emails the user about sign-ins from unfamiliar devices. Full field list: the *Login context* section of the ChaiAuth docs.
