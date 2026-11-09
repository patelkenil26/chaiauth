import type { ErrorRequestHandler, RequestHandler } from "express";
import { logger } from "@repo/logger";
import { ApiError, ERROR_CODES } from "../errors/api-error";
import { config } from "../config/env.config";

/** Catch-all for routes that did not match anything. */
export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(ApiError.notFound(`Route ${req.method} ${req.originalUrl} not found`));
};

/** Postgres error code for unique_violation. */
const PG_UNIQUE_VIOLATION = "23505";

/** Normalises any thrown value into an ApiError (or null if it is a genuine bug). */
const toApiError = (err: unknown): ApiError | null => {
  if (err instanceof ApiError) return err;

  const e = err as { type?: string; code?: string; cause?: { code?: string } };

  // Malformed / oversized body (body-parser)
  if (e?.type === "entity.parse.failed") return ApiError.badRequest("Malformed JSON body");
  if (e?.type === "entity.too.large") {
    return new ApiError(413, "Payload too large", ERROR_CODES.BAD_REQUEST);
  }

  // Drizzle wraps the driver error in `cause`
  if (e?.code === PG_UNIQUE_VIOLATION || e?.cause?.code === PG_UNIQUE_VIOLATION) {
    return ApiError.conflict("Resource already exists");
  }
  return null;
};

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  const apiError = toApiError(err);

  if (!apiError) {
    // Unexpected error: log everything, tell the client nothing.
    logger.error("Unhandled exception", { err, method: req.method, url: req.originalUrl });
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      code: ERROR_CODES.INTERNAL,
      ...(config.app.isProduction ? {} : { stack: (err as Error)?.stack }),
    });
  }

  return res.status(apiError.statusCode).json({
    success: false,
    message: apiError.message,
    code: apiError.code,
    ...(apiError.details !== undefined && { details: apiError.details }),
    ...apiError.extra,
  });
};
