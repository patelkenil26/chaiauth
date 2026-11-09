import type { RequestHandler } from "express";
import { ApiError } from "../../common/errors/api-error";
import { verifyAccessToken, type AccessTokenPayload } from "../../common/utils/jwt";
import { sessionsService } from "./sessions/sessions.service";
import { userRepository } from "./user.repository";

const extractBearerToken = (header: string | undefined): string | null => {
  if (!header?.startsWith("Bearer ")) return null;
  return header.slice("Bearer ".length).trim() || null;
};

/**
 * Authenticates a request by its short-lived access token, then makes sure:
 *  - the session the token was issued for is still active (revocation is immediate), and
 *  - the user still exists and is not deleted.
 * Populates `req.user` for downstream handlers.
 *
 * Works for browser (cookie + bearer) and server-to-server (bearer only) callers alike.
 */
export const authenticate: RequestHandler = async (req, _res, next) => {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) return next(ApiError.unauthorized("Not authenticated"));

  let payload: AccessTokenPayload;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return next(ApiError.unauthorized("Invalid or expired token"));
  }

  const session = await sessionsService.findActiveById(payload.sid);
  if (!session || session.userId !== payload.id) {
    return next(ApiError.unauthorized("Session was revoked. Please log in again."));
  }

  const user = await userRepository.findById(payload.id);
  if (!user || user.deletedAt) return next(ApiError.unauthorized("User no longer exists"));

  req.user = { id: user.id, role: user.role, name: user.name, email: user.email };
  next();
};
