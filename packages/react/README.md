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
