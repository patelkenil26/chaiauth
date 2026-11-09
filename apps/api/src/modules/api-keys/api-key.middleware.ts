import type { RequestHandler } from "express";
import { ApiError } from "../../common/errors/api-error";
import { apiKeyService } from "./api-key.service";

const KEY_SHAPE = /^ca_live_[A-Za-z0-9_-]{20,128}$/;

const readKey = (headers: { authorization?: string; "x-api-key"?: string | string[] }): string | null => {
  const bearer = headers.authorization?.startsWith("Bearer ")
    ? headers.authorization.slice("Bearer ".length).trim()
    : null;
  const header = Array.isArray(headers["x-api-key"]) ? headers["x-api-key"][0] : headers["x-api-key"];
  return bearer || header?.trim() || null;
};

/**
 * Authenticates server-to-server calls with an application API key
 * (`Authorization: Bearer ca_live_...` or `X-API-Key`). Sets `req.apiClient`.
 */
export const apiKeyAuthenticate: RequestHandler = async (req, res, next) => {
  const raw = readKey(req.headers);
  if (!raw || !KEY_SHAPE.test(raw)) {
    res.setHeader("WWW-Authenticate", "Bearer");
    return next(ApiError.unauthorized("A valid API key is required"));
  }

  try {
    req.apiClient = await apiKeyService.authenticate(raw);
    next();
  } catch (err) {
    res.setHeader("WWW-Authenticate", 'Bearer error="invalid_token"');
    next(err);
  }
};
