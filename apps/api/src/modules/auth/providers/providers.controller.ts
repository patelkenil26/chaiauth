import crypto from "node:crypto";
import type { CookieOptions, Request, Response } from "express";
import { logger } from "@repo/logger";
import { ApiError } from "../../../common/errors/api-error";
import { config } from "../../../common/config/env.config";
import { redis } from "../../../common/config/redis";
import { safeEqual } from "../../../common/utils/crypto";
import { minutes } from "../../../common/utils/duration";
import { oidcAuthContextSchema } from "../../oidc/oidc.dto";
import { oidcService } from "../../oidc/oidc.service";
import { startAuthenticatedSession } from "../auth.session";
import type { ProviderCallbackQuery, ProviderParams, ProviderRedirectQuery } from "./providers.dto";
import { getProvider } from "./providers.registry";
import { providersService } from "./providers.service";

const STATE_COOKIE = "oauth_state";
const SSO_COOKIE = "sso_proxy_id";
const FLOW_TTL_MS = minutes(10);

// "lax" (not "strict"): the provider redirects the browser back with a cross-site top-level GET,
// and strict cookies would not be sent on that navigation.
const flowCookie: CookieOptions = {
  httpOnly: true,
  secure: config.app.isProduction,
  sameSite: "lax",
  maxAge: FLOW_TTL_MS,
};

const ssoKey = (id: string) => `oidc_sso:${id}`;

const safeJsonParse = (value: string): unknown => {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

/** Atomically reads and deletes the stored OIDC context (single use). */
const takeOidcContext = async (ssoId: string) => {
  const raw = await redis.getdel(ssoKey(ssoId));
  if (!raw) return null;
  const parsed = oidcAuthContextSchema.safeParse(safeJsonParse(raw));
  return parsed.success ? parsed.data : null;
};

/** Browser navigations can't render a JSON error: send the user back to the login page instead. */
const redirectToLoginWithError = (res: Response, message: string) =>
  res.redirect(`${config.app.frontendUrl}/login?error=${encodeURIComponent(message)}`);

/** GET /auth/providers/:provider: send the browser to the provider's consent screen. */
export const providerRedirect = async (
  req: Request<ProviderParams, unknown, unknown, ProviderRedirectQuery>,
  res: Response,
) => {
  const provider = getProvider(req.params.provider);

  // `state` ties the callback to THIS browser, preventing login-CSRF
  const state = crypto.randomBytes(24).toString("hex");
  res.cookie(STATE_COOKIE, state, flowCookie);

  // When a social login is part of an OIDC "Login with ChaiAuth" flow, remember where to resume
  const { proxy_state: proxyState } = req.query;
  if (proxyState) {
    const parsed = oidcAuthContextSchema.safeParse(safeJsonParse(proxyState));
    if (!parsed.success) throw ApiError.badRequest("Invalid proxy_state");

    const ssoId = crypto.randomBytes(16).toString("hex");
    await redis.set(ssoKey(ssoId), JSON.stringify(parsed.data), "EX", FLOW_TTL_MS / 1000);
    res.cookie(SSO_COOKIE, ssoId, flowCookie);
  }

  res.redirect(provider.getAuthUrl(state));
};

/** GET /auth/providers/:provider/callback: the provider sends the user back here. */
export const providerCallback = async (
  req: Request<ProviderParams, unknown, unknown, ProviderCallbackQuery>,
  res: Response,
) => {
  const { code, state, error } = req.query;
  const expectedState: string | undefined = req.cookies?.[STATE_COOKIE];
  const ssoProxyId: string | undefined = req.cookies?.[SSO_COOKIE];

  // One-shot cookies: always clear, whatever happens next
  res.clearCookie(STATE_COOKIE, flowCookie);
  res.clearCookie(SSO_COOKIE, flowCookie);

  try {
    if (error) throw ApiError.badRequest("Sign-in was cancelled or denied");
    if (!code) throw ApiError.badRequest("Authorization code is missing");
    if (!state || !expectedState || !safeEqual(state, expectedState)) {
      throw ApiError.badRequest("Invalid sign-in state. Please try again.");
    }

    const user = await providersService.loginWithProvider(req.params.provider, code);

    // OIDC flow: finish the pending "Login with ChaiAuth" request
    const oidcContext = ssoProxyId ? await takeOidcContext(ssoProxyId) : null;
    if (oidcContext) {
      const result = await oidcService.createAuthorizationCode({ userId: user.id, context: oidcContext });
      const target = new URL(result.redirectUri);
      target.searchParams.set("code", result.code);
      if (result.state) target.searchParams.set("state", result.state);
      return res.redirect(target.toString());
    }

    // Normal dashboard login.
    // Tokens are NEVER put in the URL (history, logs and Referer headers would leak them).
    // The httpOnly refresh cookie is set here; the frontend then calls /auth/refresh-token.
    await startAuthenticatedSession(req, res, user);
    return res.redirect(`${config.app.frontendUrl}/oauth-callback`);
  } catch (err) {
    if (err instanceof ApiError) return redirectToLoginWithError(res, err.message);
    logger.error("OAuth callback failed", { err });
    return redirectToLoginWithError(res, "Sign-in failed. Please try again.");
  }
};
