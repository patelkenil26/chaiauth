import crypto from "node:crypto";
import type { Request } from "express";
import type { SelectClient } from "@repo/database/schema";
import { ApiError, ERROR_CODES } from "../../common/errors/api-error";
import { redis } from "../../common/config/redis";
import { generateToken, hashToken, safeEqual } from "../../common/utils/crypto";
import { days } from "../../common/utils/duration";
import {
  generateOidcAccessToken,
  generateOidcIdToken,
} from "../../common/utils/jwt";
import { authService } from "../auth/auth.service";
import { userRepository } from "../auth/user.repository";
import { clientRepository } from "./client.repository";
import { getClientContext } from "../../common/utils/client-context";
import { clientService } from "./client.service";
import { loginEventsService, toLoginContextClaim, type LoginContextClaim } from "./login-events.service";
import { mfaService } from "../auth/mfa/mfa.service";
import type {
  AuthorizeMfaInput,
  AuthorizeSubmitInput,
  EmbeddedEmailCodeInput,
  EmbeddedRegisterInput,
  OidcAuthContext,
  TokenInput,
} from "./oidc.dto";
import { oauthError } from "./oidc.errors";

/**
 * `login_context` is opt-in: the ID token then carries the device / IP / approximate location of this
 * sign-in (see login-events.service.ts), so apps do not have to collect it themselves.
 */
export const SUPPORTED_SCOPES = ["openid", "profile", "email", "login_context"] as const;

const AUTH_CODE_TTL_SEC = 60;
const REFRESH_TOKEN_TTL_SEC = days(7) / 1000;
export const ACCESS_TOKEN_TTL_SEC = 3600;

// Codes and refresh tokens are stored under the HASH of their value, so a Redis dump is not a credential dump.
const authCodeKey = (code: string) => `auth_code:${hashToken(code)}`;
const refreshTokenKey = (token: string) => `oidc_refresh_token:${hashToken(token)}`;

interface StoredAuthCode {
  userId: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  codeChallenge?: string;
  nonce?: string;
  /** Present only when the app asked for the `login_context` scope. */
  loginContext?: LoginContextClaim;
}

interface StoredRefreshToken {
  userId: string;
  clientId: string;
  scope: string;
  /** Issued to a PKCE-protected public client (no client secret). */
  isPublicClient: boolean;
}

export interface TokenResponse {
  id_token: string;
  access_token: string;
  refresh_token: string;
  token_type: "Bearer";
  expires_in: number;
  scope: string;
}

/** Keeps only known scopes (deduplicated). Rejects the request if nothing valid was asked for. */
export const normalizeScope = (scope: string): string => {
  const requested = [...new Set(scope.split(/\s+/).filter(Boolean))];
  const granted = requested.filter((s) => (SUPPORTED_SCOPES as readonly string[]).includes(s));
  if (granted.length === 0) throw oauthError(400, "invalid_scope", "No supported scope requested");
  return granted.join(" ");
};

const s256 = (verifier: string) => crypto.createHash("sha256").update(verifier).digest("base64url");

/**
 * Client authentication:
 *  - a presented secret must ALWAYS be correct;
 *  - without a secret the client must be PKCE-protected (public client).
 */
const authenticateClient = (client: SelectClient, clientSecret: string | undefined, pkceProtected: boolean) => {
  if (clientSecret) {
    if (!clientService.isSecretValid(client, clientSecret)) {
      throw oauthError(401, "invalid_client", "Invalid client credentials");
    }
    return;
  }
  if (!pkceProtected) {
    throw oauthError(401, "invalid_client", "Client authentication failed: provide client_secret or use PKCE");
  }
};

const issueTokens = async (params: {
  userId: string;
  clientId: string;
  scope: string;
  nonce?: string;
  isPublicClient: boolean;
  /** Only on the authorization-code exchange (a refresh is not a new sign-in). */
  loginContext?: LoginContextClaim;
}): Promise<TokenResponse> => {
  const { userId, clientId, scope, nonce, isPublicClient, loginContext } = params;

  const user = await userRepository.findById(userId);
  if (!user || user.deletedAt) throw oauthError(400, "invalid_grant", "User no longer exists");

  const { rawToken: refreshToken } = generateToken(32);
  const stored: StoredRefreshToken = { userId, clientId, scope, isPublicClient };
  await redis.set(refreshTokenKey(refreshToken), JSON.stringify(stored), "EX", REFRESH_TOKEN_TTL_SEC);

  return {
    id_token: generateOidcIdToken(userId, clientId, nonce, loginContext ? { login_context: loginContext } : {}),
    access_token: generateOidcAccessToken(userId, clientId, scope),
    refresh_token: refreshToken,
    token_type: "Bearer",
    expires_in: ACCESS_TOKEN_TTL_SEC,
    scope,
  };
};

export const oidcService = {
  /** Mints a short-lived, single-use authorization code for an already-authenticated user. */
  async createAuthorizationCode(params: {
    userId: string;
    context: OidcAuthContext;
    /** The sign-in request: its IP, browser and language are recorded as a login event. */
    req: Request;
    /** password | email_code | mfa | google | github ... */
    method: string;
  }) {
    const { userId, context, req, method } = params;
    const client = await clientService.verifyForAuthorization(context.client_id, context.redirect_uri);
    const scope = normalizeScope(context.scope);

    await clientRepository.upsertConsent(userId, client.clientId, scope);

    const event = await loginEventsService.record({
      userId,
      clientId: client.clientId,
      clientName: client.displayName,
      method,
      context: getClientContext(req),
    });

    const { rawToken: code } = generateToken(32);
    const stored: StoredAuthCode = {
      userId,
      clientId: client.clientId,
      redirectUri: client.redirectUri,
      scope,
      codeChallenge: context.code_challenge,
      nonce: context.nonce,
      ...(event && scope.split(" ").includes("login_context") && { loginContext: toLoginContextClaim(event) }),
    };
    await redis.set(authCodeKey(code), JSON.stringify(stored), "EX", AUTH_CODE_TTL_SEC);

    return { code, redirectUri: client.redirectUri, state: context.state };
  },

  /** Login form on the authorize page: verify credentials + consent, then issue the code. */
  async authorizeWithCredentials(input: AuthorizeSubmitInput, req: Request) {
    if (!input.consent_granted) {
      throw oauthError(403, "access_denied", "User denied the consent request");
    }

    const { email, username, phone, password, otp, consent_granted: _consent, ...context } = input;
    const outcome = await authService.login({ email, username, phone, password, otp });

    if (outcome.status === "mfa_required") {
      // Embedded forms read `mfa_required` + `mfa_token` and ask for the code (POST /o/authorize/mfa).
      // The hosted page just shows the message.
      throw new ApiError(
        403,
        "Two-factor authentication is required. Enter the code from your authenticator app.",
        ERROR_CODES.FORBIDDEN,
        undefined,
        { mfa_required: true, mfa_token: outcome.mfaToken },
      );
    }

    return this.createAuthorizationCode({
      userId: outcome.user.id,
      context,
      req,
      method: input.otp ? "email_code" : "password",
    });
  },

  /** Second factor of an embedded sign-in: MFA challenge token + TOTP/backup code in, authorization code out. */
  async authorizeWithMfa(input: AuthorizeMfaInput, req: Request) {
    if (!input.consent_granted) {
      throw oauthError(403, "access_denied", "User denied the consent request");
    }
    const { mfa_token, code, consent_granted: _consent, ...context } = input;
    const user = await mfaService.completeLogin(mfa_token, code);
    return this.createAuthorizationCode({ userId: user.id, context, req, method: "mfa" });
  },

  /** Sign-up from an app's own form. Verification still happens by email before the first login. */
  async registerEmbedded(input: EmbeddedRegisterInput) {
    const client = await clientRepository.findByClientId(input.client_id);
    if (!client) throw ApiError.notFound("Client not found");
    await authService.register({ name: input.name, email: input.email, password: input.password, role: "customer" });
  },

  /** Emails a one-time sign-in code. Always succeeds (no user enumeration). */
  async sendEmailCode(input: EmbeddedEmailCodeInput) {
    const client = await clientRepository.findByClientId(input.client_id);
    if (!client) throw ApiError.notFound("Client not found");
    await authService.sendOtp({ email: input.email });
  },

  /** Token endpoint: authorization_code and refresh_token grants. */
  async exchange(input: TokenInput): Promise<TokenResponse> {
    const client = await clientRepository.findByClientId(input.client_id);
    if (!client) throw oauthError(401, "invalid_client", "Unknown client");

    if (input.grant_type === "authorization_code") {
      return this.exchangeAuthorizationCode(client, input);
    }
    return this.exchangeRefreshToken(client, input);
  },

  async exchangeAuthorizationCode(
    client: SelectClient,
    input: Extract<TokenInput, { grant_type: "authorization_code" }>,
  ): Promise<TokenResponse> {
    // GETDEL: a code is single-use, even if this attempt fails (limits guessing / replay)
    const raw = await redis.getdel(authCodeKey(input.code));
    if (!raw) throw oauthError(400, "invalid_grant", "Invalid or expired authorization code");
    const data = JSON.parse(raw) as StoredAuthCode;

    // The code is bound to the client and redirect URI it was issued for
    if (data.clientId !== client.clientId || data.redirectUri !== input.redirect_uri) {
      throw oauthError(400, "invalid_grant", "Authorization code was not issued for this client");
    }

    authenticateClient(client, input.client_secret, Boolean(data.codeChallenge));

    // PKCE: if a challenge was set at authorize time, the verifier MUST match
    if (data.codeChallenge) {
      if (!input.code_verifier) throw oauthError(400, "invalid_grant", "code_verifier is required");
      if (!safeEqual(s256(input.code_verifier), data.codeChallenge)) {
        throw oauthError(400, "invalid_grant", "PKCE validation failed");
      }
    }

    return issueTokens({
      userId: data.userId,
      clientId: client.clientId,
      scope: data.scope,
      nonce: data.nonce,
      isPublicClient: !input.client_secret,
    });
  },

  /** Refresh tokens rotate: the presented token is consumed and a new one is returned. */
  async exchangeRefreshToken(
    client: SelectClient,
    input: Extract<TokenInput, { grant_type: "refresh_token" }>,
  ): Promise<TokenResponse> {
    const raw = await redis.getdel(refreshTokenKey(input.refresh_token));
    if (!raw) throw oauthError(400, "invalid_grant", "Invalid or expired refresh token");
    const data = JSON.parse(raw) as StoredRefreshToken;

    if (data.clientId !== client.clientId) {
      throw oauthError(400, "invalid_grant", "Refresh token was not issued for this client");
    }
    authenticateClient(client, input.client_secret, data.isPublicClient);

    return issueTokens({
      userId: data.userId,
      clientId: client.clientId,
      scope: data.scope,
      isPublicClient: data.isPublicClient,
    });
  },

  /** RFC 7009: always succeeds, whether or not the token existed. */
  async revoke(token: string): Promise<void> {
    await redis.del(refreshTokenKey(token));
  },
};
