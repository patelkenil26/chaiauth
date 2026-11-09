import type { RequestHandler } from "express";
import { ApiError } from "../errors/api-error";
import { verifyTurnstileToken } from "../services/captcha.service";

/**
 * Verifies the Cloudflare Turnstile token in `req.body.captchaToken`,
 * then removes it so it never reaches the DTO validators.
 */
export const verifyCaptcha: RequestHandler = async (req, _res, next) => {
  const token: unknown = req.body?.captchaToken;

  if (typeof token !== "string" || token.length === 0) {
    return next(
      ApiError.badRequest("Captcha token is missing. Please complete the anti-bot verification."),
    );
  }

  const result = await verifyTurnstileToken(token, req.ip);
  if (!result.success) {
    return next(ApiError.badRequest("Anti-bot verification failed. Please try again.", result.errorCodes));
  }

  delete req.body.captchaToken;
  next();
};
