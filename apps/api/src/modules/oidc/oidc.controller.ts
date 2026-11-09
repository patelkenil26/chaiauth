import type { Request, Response } from "express";
import { config } from "../../common/config/env.config";
import { ApiResponse } from "../../common/utils/api-response";
import { getPublicJwk } from "../../common/utils/jwks";
import type { BodyRequest } from "../../common/utils/request";
import { userRepository } from "../auth/user.repository";
import { clientService } from "./client.service";
import type { AuthorizeQuery, AuthorizeSubmitInput, RevokeInput, TokenInput } from "./oidc.dto";
import { oauthError } from "./oidc.errors";
import { SUPPORTED_SCOPES, normalizeScope, oidcService } from "./oidc.service";

/** GET /.well-known/openid-configuration */
export const getOpenIdConfiguration = (_req: Request, res: Response) => {
  // Use the configured issuer, never the Host header (it is attacker-controlled)
  const issuer = config.jwt.issuer;

  res.json({
    issuer,
    // The consent / login UI lives in the frontend
    authorization_endpoint: `${config.app.frontendUrl}/authorize`,
    token_endpoint: `${issuer}/o/token`,
    userinfo_endpoint: `${issuer}/o/userinfo`,
    revocation_endpoint: `${issuer}/o/revoke`,
    jwks_uri: `${issuer}/.well-known/jwks.json`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["RS256"],
    scopes_supported: SUPPORTED_SCOPES,
    claims_supported: ["sub", "name", "email", "email_verified"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["client_secret_post", "none"],
  });
};

/** GET /.well-known/jwks.json */
export const getJwks = (_req: Request, res: Response) => {
  res.json({ keys: [getPublicJwk()] });
};

/** GET /o/authorize: validates the request so the frontend can show the login / consent screen. */
export const authorize = async (req: Request, res: Response) => {
  const query = req.query as unknown as AuthorizeQuery;
  const client = await clientService.verifyForAuthorization(query.client_id, query.redirect_uri);

  ApiResponse.ok(res, "Authorization Request Valid. Ready for login/consent.", {
    clientName: client.displayName,
    requestedScope: normalizeScope(query.scope),
    allowedIdps: client.allowedIdps,
    authContext: {
      client_id: query.client_id,
      redirect_uri: query.redirect_uri,
      scope: query.scope,
      state: query.state,
      code_challenge: query.code_challenge,
      code_challenge_method: query.code_challenge_method,
      nonce: query.nonce,
    },
  });
};

/** POST /o/authorize: credentials + consent in, authorization code out. */
export const authorizeSubmit = async (req: BodyRequest<AuthorizeSubmitInput>, res: Response) => {
  const result = await oidcService.authorizeWithCredentials(req.body);
  ApiResponse.ok(res, "Login Successful. Redirecting to client...", {
    code: result.code,
    redirect_uri: result.redirectUri,
    state: result.state,
  });
};

/** POST /o/token: RFC 6749 token response (not wrapped in our envelope). */
export const token = async (req: BodyRequest<TokenInput>, res: Response) => {
  const tokens = await oidcService.exchange(req.body);
  // RFC 6749 5.1: token responses must never be cached
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("Pragma", "no-cache");
  res.status(200).json(tokens);
};

/** GET /o/userinfo: claims limited to the scopes the user granted. */
export const userInfo = async (req: Request, res: Response) => {
  const { sub, scope } = req.oidcUser!;
  const user = await userRepository.findById(sub);
  if (!user || user.deletedAt) throw oauthError(401, "invalid_token", "User no longer exists");

  const scopes = scope.split(" ");
  res.status(200).json({
    sub: user.id,
    ...(scopes.includes("profile") && { name: user.name }),
    ...(scopes.includes("email") && { email: user.email, email_verified: user.isVerified }),
  });
};

/** POST /o/revoke (RFC 7009) */
export const revoke = async (req: BodyRequest<RevokeInput>, res: Response) => {
  await oidcService.revoke(req.body.token);
  res.status(200).send();
};
