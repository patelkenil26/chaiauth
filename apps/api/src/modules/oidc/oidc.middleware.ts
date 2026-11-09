import type { RequestHandler } from "express";
import { verifyOidcAccessToken } from "../../common/utils/jwt";
import { oauthError } from "./oidc.errors";

/** Protects OIDC resource endpoints (e.g. /o/userinfo) with an RS256 access token issued to a client. */
export const oidcAuthenticate: RequestHandler = (req, res, next) => {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.setHeader("WWW-Authenticate", "Bearer");
    return next(oauthError(401, "invalid_token", "Bearer token is missing"));
  }

  try {
    req.oidcUser = verifyOidcAccessToken(header.slice("Bearer ".length).trim());
    next();
  } catch (err) {
    const expired = (err as Error).name === "TokenExpiredError";
    res.setHeader("WWW-Authenticate", 'Bearer error="invalid_token"');
    next(oauthError(401, "invalid_token", expired ? "Access token has expired" : "Invalid access token"));
  }
};
