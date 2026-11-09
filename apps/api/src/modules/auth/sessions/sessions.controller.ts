import type { Request, Response } from "express";
import { ApiResponse } from "../../../common/utils/api-response";
import { REFRESH_COOKIE_NAME } from "../auth.constants";
import { clearRefreshTokenCookie } from "../auth.cookies";
import { sessionsService } from "./sessions.service";
import type { SessionParams } from "./sessions.dto";

export const getSessions = async (req: Request, res: Response) => {
  const sessions = await sessionsService.listForUser(req.user!.id, req.cookies?.[REFRESH_COOKIE_NAME]);
  ApiResponse.ok(res, "Sessions fetched", sessions);
};

export const revokeSession = async (req: Request<SessionParams>, res: Response) => {
  await sessionsService.revokeById(req.params.sessionId, req.user!.id);
  ApiResponse.ok(res, "Session revoked");
};

export const revokeAllSessions = async (req: Request, res: Response) => {
  await sessionsService.revokeAll(req.user!.id);
  clearRefreshTokenCookie(res);
  ApiResponse.ok(res, "All sessions revoked");
};
