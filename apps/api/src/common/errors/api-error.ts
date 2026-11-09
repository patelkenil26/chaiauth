export const ERROR_CODES = {
  BAD_REQUEST: "BAD_REQUEST",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  TOO_MANY_REQUESTS: "TOO_MANY_REQUESTS",
  INTERNAL: "INTERNAL_SERVER_ERROR",
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

/**
 * Operational (expected) error that is safe to show to the client.
 * Anything that is NOT an ApiError is treated as a bug and masked by the error handler.
 */
export class ApiError extends Error {
  public readonly isOperational = true;

  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly code: ErrorCode = ERROR_CODES.INTERNAL,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "ApiError";
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(message = "Bad request", details?: unknown) {
    return new ApiError(400, message, ERROR_CODES.BAD_REQUEST, details);
  }
  static validation(message = "Validation failed", details?: unknown) {
    return new ApiError(400, message, ERROR_CODES.VALIDATION_ERROR, details);
  }
  static unauthorized(message = "Unauthorized") {
    return new ApiError(401, message, ERROR_CODES.UNAUTHORIZED);
  }
  static forbidden(message = "Forbidden") {
    return new ApiError(403, message, ERROR_CODES.FORBIDDEN);
  }
  static notFound(message = "Not found") {
    return new ApiError(404, message, ERROR_CODES.NOT_FOUND);
  }
  static conflict(message = "Conflict") {
    return new ApiError(409, message, ERROR_CODES.CONFLICT);
  }
  static tooManyRequests(message = "Too many requests") {
    return new ApiError(429, message, ERROR_CODES.TOO_MANY_REQUESTS);
  }
  static internal(message = "Internal server error") {
    return new ApiError(500, message, ERROR_CODES.INTERNAL);
  }
}
