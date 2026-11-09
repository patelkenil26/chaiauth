import jwt, { type SignOptions } from "jsonwebtoken";
import { config } from "../config/env.config";
import { getSigningKeys } from "./cert";
import type { UserRole } from "../constants/roles";

// ── Payload types ───────────────────────────────────────────
export interface AccessTokenPayload {
  id: string;
  role: UserRole;
}
export interface RefreshTokenPayload {
  id: string;
}
export interface MfaTokenPayload {
  id: string;
}

type ExpiresIn = NonNullable<SignOptions["expiresIn"]>;

const MFA_TOKEN_TTL: ExpiresIn = "5m";
const OIDC_TOKEN_TTL: ExpiresIn = "1h";

// ── Session tokens (HS256) ──────────────────────────────────
export const generateAccessToken = (payload: AccessTokenPayload) =>
  jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn as ExpiresIn,
  });

export const verifyAccessToken = (token: string) =>
  jwt.verify(token, config.jwt.accessSecret, { algorithms: ["HS256"] }) as AccessTokenPayload;

export const generateRefreshToken = (payload: RefreshTokenPayload) =>
  jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn as ExpiresIn,
  });

export const verifyRefreshToken = (token: string) =>
  jwt.verify(token, config.jwt.refreshSecret, { algorithms: ["HS256"] }) as RefreshTokenPayload;

export const generateAuthTokens = (user: { id: string; role: UserRole }) => ({
  accessToken: generateAccessToken({ id: user.id, role: user.role }),
  refreshToken: generateRefreshToken({ id: user.id }),
});

// ── Short-lived MFA challenge token ─────────────────────────
// Signed with a DERIVED secret + distinct audience, so a challenge token (issued after the
// password step but BEFORE MFA is verified) can never be accepted as an access token.
const MFA_AUDIENCE = "mfa-challenge";
const mfaSecret = () => `${config.jwt.accessSecret}:mfa-challenge`;

export const generateMfaToken = (payload: MfaTokenPayload) =>
  jwt.sign(payload, mfaSecret(), { expiresIn: MFA_TOKEN_TTL, audience: MFA_AUDIENCE });

export const verifyMfaToken = (token: string) =>
  jwt.verify(token, mfaSecret(), {
    algorithms: ["HS256"],
    audience: MFA_AUDIENCE,
  }) as MfaTokenPayload;

// ── OIDC tokens (RS256) ─────────────────────────────────────
export const generateOidcIdToken = (userId: string, clientId: string) =>
  jwt.sign({ sub: userId, aud: clientId }, getSigningKeys().privateKey, {
    algorithm: "RS256",
    expiresIn: OIDC_TOKEN_TTL,
    issuer: config.jwt.issuer,
  });

export const generateOidcAccessToken = (userId: string, clientId: string, scope: string) =>
  jwt.sign({ sub: userId, client_id: clientId, scope }, getSigningKeys().privateKey, {
    algorithm: "RS256",
    expiresIn: OIDC_TOKEN_TTL,
    issuer: config.jwt.issuer,
  });

export interface OidcAccessTokenPayload {
  sub: string;
  client_id: string;
  scope: string;
}

export const verifyOidcAccessToken = (token: string) =>
  jwt.verify(token, getSigningKeys().publicKey, {
    algorithms: ["RS256"],
    issuer: config.jwt.issuer,
  }) as OidcAccessTokenPayload;
