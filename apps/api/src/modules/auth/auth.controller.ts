import type { Request, Response } from "express";
import { ApiResponse } from "../../common/utils/api-response";
import type { BodyRequest } from "../../common/utils/request";
import { REFRESH_COOKIE_NAME } from "./auth.constants";
import { clearRefreshTokenCookie } from "./auth.cookies";
import { authService } from "./auth.service";
import { startAuthenticatedSession } from "./auth.session";
import type { LoginInput } from "./dto/login.dto";
import type { SendOtpInput } from "./dto/otp.dto";
import type { ForgotPasswordInput, ResetPasswordInput, TokenParams } from "./dto/password.dto";
import type { RegisterInput } from "./dto/register.dto";

export const register = async (req: BodyRequest<RegisterInput>, res: Response) => {
  const user = await authService.register(req.body);
  ApiResponse.created(res, "Registration successful. Please verify your email.", user);
};

export const login = async (req: BodyRequest<LoginInput>, res: Response) => {
  const outcome = await authService.login(req.body);

  if (outcome.status === "mfa_required") {
    // Only the email is revealed until the second factor is verified
    return ApiResponse.ok(res, "MFA required", {
      requiresMfa: true,
      mfaToken: outcome.mfaToken,
      user: { email: outcome.email },
    });
  }

  const data = await startAuthenticatedSession(req, res, outcome.user);
  ApiResponse.ok(res, "Login successful", data);
};

export const sendOtp = async (req: BodyRequest<SendOtpInput>, res: Response) => {
  await authService.sendOtp(req.body);
  ApiResponse.ok(res, "If an account exists, a login code has been sent.");
};

export const refreshToken = async (req: Request, res: Response) => {
  const result = await authService.refresh(req.cookies?.[REFRESH_COOKIE_NAME]);
  ApiResponse.ok(res, "Token refreshed", result);
};

export const logout = async (req: Request, res: Response) => {
  await authService.logout(req.user!.id, req.cookies?.[REFRESH_COOKIE_NAME]);
  clearRefreshTokenCookie(res);
  ApiResponse.ok(res, "Logged out successfully");
};

export const verifyEmail = async (req: Request<TokenParams>, res: Response) => {
  await authService.verifyEmail(req.params.token);
  ApiResponse.ok(res, "Email verified successfully");
};

export const forgotPassword = async (req: BodyRequest<ForgotPasswordInput>, res: Response) => {
  await authService.forgotPassword(req.body.email);
  ApiResponse.ok(res, "If an account exists for that email, a reset link has been sent.");
};

export const resetPassword = async (
  req: Request<TokenParams, unknown, ResetPasswordInput>,
  res: Response,
) => {
  await authService.resetPassword(req.params.token, req.body.password);
  ApiResponse.ok(res, "Password reset successful");
};
