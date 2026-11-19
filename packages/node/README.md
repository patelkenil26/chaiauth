# @chaiauth/node

Server-side helpers for [ChaiAuth](https://github.com). Your frontend signs users in with `@chaiauth/react`, which gives it an **access token**. Your backend must never trust that token blindly. This package verifies it.

- Verifies the signature against your ChaiAuth server's public keys (JWKS, cached and rotated automatically)
- Checks issuer and expiry, accepts **RS256 only**, and (optionally) that the token was issued to **your** app
- Fetches the user's profile (name, email) when you need it
- Works in any Node 18+ backend: Express, Fastify, Next.js route handlers, tRPC, Hono, ...

## Install

```bash
npm install @chaiauth/node
```

## Use

Create the verifier **once** at startup so the public keys stay cached.

```ts
import { createChaiAuth, getBearerToken, ChaiAuthTokenError } from "@chaiauth/node";

export const chaiauth = createChaiAuth({
  issuer: process.env.CHAIAUTH_ISSUER!,       // base URL of the ChaiAuth API
  clientId: process.env.CHAIAUTH_CLIENT_ID!,  // your application's client ID
});
```

### Express

```ts
app.use(async (req, res, next) => {
  try {
    const { userId } = await chaiauth.verifyToken(getBearerToken(req.headers.authorization));
    req.userId = userId; // ChaiAuth user id
    next();
  } catch (err) {
    if (err instanceof ChaiAuthTokenError) return res.status(401).json({ error: err.code });
    next(err);
  }
});
```

### tRPC context

```ts
export async function createContext({ req }: { req: Request }) {
  const token = getBearerToken(req.headers.get("authorization"));
  try {
    const { userId } = await chaiauth.verifyToken(token);
    return { chaiAuthUserId: userId };
  } catch {
    return { chaiAuthUserId: null };
  }
}
```

### Sending the token from the browser

```tsx
import { useChaiAuth } from "@chaiauth/react";

const { getAccessToken } = useChaiAuth();
const token = await getAccessToken(); // refreshed automatically when about to expire
fetch("/api/forms", { headers: { authorization: `Bearer ${token}` } });
```

### Linking ChaiAuth users to your own users table

The token only carries the user id (`sub`). Use it as the key to your own user row, and call `getUserInfo` once when you first see a new user:

```ts
const verified = await chaiauth.verifyToken(token);
let user = await db.findUserByChaiAuthId(verified.userId);
if (!user) {
  const info = await chaiauth.getUserInfo(token); // { sub, name, email, email_verified }
  user = await db.createUser({ chaiAuthId: info.sub, name: info.name, email: info.email });
}
```

## API

| Export | Description |
| --- | --- |
| `createChaiAuth({ issuer, clientId?, clockToleranceSec? })` | Returns `{ verifyToken, getUserInfo, issuer }`. |
| `verifyToken(token)` | Resolves to `{ userId, clientId, scopes, expiresAt, claims }`, or throws `ChaiAuthTokenError`. |
| `getUserInfo(accessToken)` | Verifies the token, then returns `{ sub, name?, email?, email_verified? }` (depends on granted scopes). |
| `getBearerToken(header)` | Pulls the token out of an `Authorization: Bearer ...` header, or `null`. |
| `ChaiAuthTokenError` | `error.code` is one of `missing_token`, `invalid_token`, `token_expired`, `wrong_client`, `userinfo_failed`. |

## Security notes

- Always pass `clientId`. Without it, a valid token minted for a different ChaiAuth application would be accepted.
- Only RS256 is accepted. Tokens using `HS256` or `alg: none` are rejected.
- Treat `getUserInfo().email` as verified only when `email_verified` is `true`.
- Keep your own authorization rules (who can see which form). This package only proves **who** the user is.

## Develop

```bash
pnpm --filter @chaiauth/node test
pnpm --filter @chaiauth/node check-types
pnpm --filter @chaiauth/node build
```
