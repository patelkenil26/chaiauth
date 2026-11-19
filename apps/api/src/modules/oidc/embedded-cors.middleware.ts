import type { RequestHandler } from "express";
import { config } from "../../common/config/env.config";
import { ApiError } from "../../common/errors/api-error";
import { clientRepository } from "./client.repository";

/**
 * Embedded sign-in: an app's OWN page (e.g. https://forms.example.com/login) posts credentials to
 * `POST /o/authorize` and gets an authorization code back, so the user never leaves the app.
 *
 * Browsers only allow that cross-origin call if we answer with CORS headers, and we only do so for
 * the origin of the application's registered **Application URL**. Anyone else is refused.
 */

const originOf = (value: string | null | undefined): string | null => {
  try {
    return value ? new URL(value).origin : null;
  } catch {
    return null;
  }
};

/**
 * Answers the CORS preflight. A preflight carries no data and no credentials, so it can be answered
 * for any origin; the real check happens on the POST itself (see `embeddedOriginGuard`).
 * ChaiAuth's own frontend (the allow-listed, credentialed origins) keeps using the normal CORS.
 */
export const embeddedPreflight: RequestHandler = (req, res, next) => {
  const origin = req.headers.origin;
  if (req.method !== "OPTIONS" || !origin || config.app.allowedOrigins.includes(origin)) return next();

  res.set({
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "600",
    Vary: "Origin",
  });
  res.status(204).end();
};

/** Lets the POST through only when it comes from the app's registered Application URL origin. */
export const embeddedOriginGuard: RequestHandler = async (req, res, next) => {
  const origin = req.headers.origin;
  // No Origin: not a browser cross-origin call (curl, server-to-server). ChaiAuth's own frontend: normal CORS.
  if (!origin || config.app.allowedOrigins.includes(origin)) return next();

  const clientId = typeof req.body?.client_id === "string" ? req.body.client_id : "";
  const client = clientId ? await clientRepository.findByClientId(clientId) : undefined;

  if (!client || originOf(client.applicationUrl) !== origin) {
    return next(
      ApiError.forbidden(
        "This origin is not allowed to sign in to this application. Set the app's Application URL to this site in the ChaiAuth developer console.",
      ),
    );
  }

  // Credentials (cookies) are never used here, so the origin is echoed back without Allow-Credentials
  res.set({ "Access-Control-Allow-Origin": origin, Vary: "Origin" });
  next();
};
