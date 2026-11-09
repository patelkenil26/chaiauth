import type { Request, Response } from "express";
import type { SelectUser } from "@repo/database/schema";
import { generateAccessToken, generateRefreshToken } from "../../common/utils/jwt";
import { setRefreshTokenCookie } from "./auth.cookies";
import { toPublicUser } from "./auth.mapper";
import { sessionsService } from "./sessions/sessions.service";

/**
 * The ONE place that turns "credentials verified" into a logged-in device:
 *  1. mints the refresh token and records its session (one row per device),
 *  2. mints an access token bound to that session (`sid`), so revoking the session kills it at once,
 *  3. sets the httpOnly refresh cookie.
 *
 * Reused by every login path (password, OTP, MFA, social, passkey) so they can't drift apart.
 */
export const startAuthenticatedSession = async (req: Request, res: Response, user: SelectUser) => {
  const refreshToken = generateRefreshToken({ id: user.id });
  const session = await sessionsService.createSession({ userId: user.id, refreshToken, req });
  const accessToken = generateAccessToken({ id: user.id, role: user.role, sid: session.id });

  setRefreshTokenCookie(res, refreshToken);
  return { user: toPublicUser(user), accessToken };
};
