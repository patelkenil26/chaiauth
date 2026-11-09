import type { Request, Response } from "express";
import { ApiResponse } from "../../../common/utils/api-response";
import type { BodyRequest } from "../../../common/utils/request";
import { startAuthenticatedSession } from "../auth.session";
import type { DisableMfaInput, MfaLoginInput, VerifyMfaInput } from "./mfa.dto";
import { mfaService } from "./mfa.service";

export const generateSecret = async (req: Request, res: Response) => {
  const data = await mfaService.generateSecret(req.user!.id);
  ApiResponse.ok(res, "MFA secret generated successfully", data);
};

export const verifyAndEnable = async (req: BodyRequest<VerifyMfaInput>, res: Response) => {
  await mfaService.verifyAndEnable(req.user!.id, req.body.code);
  ApiResponse.ok(res, "MFA enabled successfully");
};

export const disable = async (req: BodyRequest<DisableMfaInput>, res: Response) => {
  await mfaService.disable(req.user!.id, req.body.code);
  ApiResponse.ok(res, "MFA disabled successfully");
};

/** POST /auth/login/mfa: second factor of a password / OTP login. */
export const loginWithMfa = async (req: BodyRequest<MfaLoginInput>, res: Response) => {
  const user = await mfaService.completeLogin(req.body.mfaToken, req.body.code);
  const data = await startAuthenticatedSession(req, res, user);
  ApiResponse.ok(res, "Login successful", data);
};
