import { logger } from "@repo/logger";
import { config } from "../config/env.config";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export interface CaptchaResult {
  success: boolean;
  errorCodes: string[];
}

/** Verifies a Cloudflare Turnstile token. Network failures resolve to `success: false`. */
export const verifyTurnstileToken = async (
  token: string,
  remoteIp?: string,
): Promise<CaptchaResult> => {
  const body = new URLSearchParams({ secret: config.turnstile.secretKey, response: token });
  if (remoteIp) body.append("remoteip", remoteIp);

  try {
    const res = await fetch(TURNSTILE_VERIFY_URL, { method: "POST", body });
    const outcome = (await res.json()) as { success: boolean; "error-codes"?: string[] };
    return { success: outcome.success, errorCodes: outcome["error-codes"] ?? [] };
  } catch (err) {
    logger.error("Turnstile verification request failed", { err });
    return { success: false, errorCodes: ["network-error"] };
  }
};
