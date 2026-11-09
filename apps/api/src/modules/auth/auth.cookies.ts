import type { CookieOptions, Response } from "express";
import { config } from "../../common/config/env.config";
import { parseDurationMs } from "../../common/utils/duration";
import { REFRESH_COOKIE_NAME } from "./auth.constants";

/**
 * The refresh token lives ONLY in an httpOnly cookie, so page JavaScript (and any XSS) can't read it.
 * `clearCookie` must use the same attributes, so both share this one definition.
 */
const baseCookieOptions: CookieOptions = {
  httpOnly: true,
  secure: config.app.isProduction,
  sameSite: "strict",
};

export const setRefreshTokenCookie = (res: Response, refreshToken: string) => {
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, {
    ...baseCookieOptions,
    maxAge: parseDurationMs(config.jwt.refreshExpiresIn),
  });
};

export const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie(REFRESH_COOKIE_NAME, baseCookieOptions);
};
