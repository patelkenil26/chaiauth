import { createRemoteJWKSet, errors as joseErrors, jwtVerify, type JWTVerifyGetKey } from "jose";

export interface ChaiAuthVerifierOptions {
  /** Base URL of the ChaiAuth API, e.g. `https://api.chaiauth.example.com`. Must match the token `iss`. */
  issuer: string;
  /**
   * Your application's client ID. When set, tokens issued to any other application are rejected.
   * Strongly recommended: without it, a token minted for a different app would be accepted.
   */
  clientId?: string;
  /** Allowed clock drift in seconds when checking `exp` / `nbf`. Default 5. */
  clockToleranceSec?: number;
  /** Advanced: custom key resolver (used by tests). Defaults to the issuer's JWKS endpoint. */
  keys?: JWTVerifyGetKey;
}

export interface VerifiedToken {
  /** ChaiAuth user id. Stable: use it as the foreign key to your own user row. */
  userId: string;
  /** Client ID the token was issued to. */
  clientId: string;
  /** Granted scopes, e.g. `["openid", "profile", "email"]`. */
  scopes: string[];
  /** Expiry as a Unix timestamp (seconds). */
  expiresAt: number;
  /** All claims in the token. */
  claims: Record<string, unknown>;
}

export interface UserInfo {
  sub: string;
  /** Present when the `profile` scope was granted. */
  name?: string;
  /** Present when the `email` scope was granted. */
  email?: string;
  email_verified?: boolean;
}

export type TokenErrorCode =
  | "missing_token"
  | "invalid_token"
  | "token_expired"
  | "wrong_client"
  | "userinfo_failed";

export class ChaiAuthTokenError extends Error {
  readonly code: TokenErrorCode;
  constructor(code: TokenErrorCode, message: string, options?: { cause?: unknown }) {
    super(message, options);
    this.name = "ChaiAuthTokenError";
    this.code = code;
  }
}

const stripTrailingSlash = (url: string) => url.replace(/\/+$/, "");

/**
 * Extracts the token from an `Authorization: Bearer <token>` header value.
 * Returns `null` if the header is absent or not a Bearer credential.
 */
export function getBearerToken(authorizationHeader: string | null | undefined): string | null {
  if (!authorizationHeader) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(authorizationHeader.trim());
  return match?.[1] ?? null;
}

/**
 * Creates a reusable verifier. Create it ONCE at startup: it caches the issuer's public keys
 * (and refreshes them automatically when ChaiAuth rotates its signing key).
 *
 * ```ts
 * const chaiauth = createChaiAuth({ issuer: process.env.CHAIAUTH_ISSUER!, clientId: process.env.CHAIAUTH_CLIENT_ID! });
 * const { userId } = await chaiauth.verifyToken(getBearerToken(req.headers.authorization));
 * ```
 */
export function createChaiAuth(options: ChaiAuthVerifierOptions) {
  const issuer = stripTrailingSlash(options.issuer);
  const keys = options.keys ?? createRemoteJWKSet(new URL(`${issuer}/.well-known/jwks.json`));

  /**
   * Verifies signature (RS256 only), issuer and expiry, and that the token was issued to your app.
   * Throws {@link ChaiAuthTokenError} on any failure. Never trusts an unverified token.
   */
  async function verifyToken(token: string | null | undefined): Promise<VerifiedToken> {
    if (!token) throw new ChaiAuthTokenError("missing_token", "No access token provided");

    let claims: Record<string, unknown>;
    try {
      const { payload } = await jwtVerify(token, keys, {
        issuer,
        algorithms: ["RS256"],
        clockTolerance: options.clockToleranceSec ?? 5,
      });
      claims = payload as Record<string, unknown>;
    } catch (err) {
      if (err instanceof joseErrors.JWTExpired) {
        throw new ChaiAuthTokenError("token_expired", "Access token has expired", { cause: err });
      }
      throw new ChaiAuthTokenError("invalid_token", "Access token is invalid", { cause: err });
    }

    const sub = typeof claims.sub === "string" ? claims.sub : "";
    // Access tokens carry `client_id`; ID tokens carry `aud`. Accept either.
    const aud = Array.isArray(claims.aud) ? claims.aud[0] : claims.aud;
    const tokenClient =
      typeof claims.client_id === "string" ? claims.client_id : typeof aud === "string" ? aud : "";

    if (!sub || !tokenClient) {
      throw new ChaiAuthTokenError("invalid_token", "Token is missing required claims");
    }
    if (options.clientId && tokenClient !== options.clientId) {
      throw new ChaiAuthTokenError("wrong_client", "Token was not issued to this application");
    }

    return {
      userId: sub,
      clientId: tokenClient,
      scopes: typeof claims.scope === "string" ? claims.scope.split(" ").filter(Boolean) : [],
      expiresAt: typeof claims.exp === "number" ? claims.exp : 0,
      claims,
    };
  }

  /**
   * Fetches the user's profile (name, email, email_verified) from ChaiAuth.
   * Access tokens only carry the user id, so call this once when you first create your local user row.
   */
  async function getUserInfo(accessToken: string): Promise<UserInfo> {
    await verifyToken(accessToken);
    let res: Response;
    try {
      res = await fetch(`${issuer}/o/userinfo`, { headers: { authorization: `Bearer ${accessToken}` } });
    } catch (err) {
      throw new ChaiAuthTokenError("userinfo_failed", "Could not reach ChaiAuth", { cause: err });
    }
    if (!res.ok) {
      throw new ChaiAuthTokenError("userinfo_failed", `ChaiAuth userinfo returned ${res.status}`);
    }
    return (await res.json()) as UserInfo;
  }

  return { verifyToken, getUserInfo, issuer };
}

export type ChaiAuth = ReturnType<typeof createChaiAuth>;
