import { ApiError, ERROR_CODES } from "../../common/errors/api-error";

/** Error codes defined by RFC 6749 section 5.2 (+ RFC 6750 for bearer tokens). */
export type OAuthErrorCode =
  | "invalid_request"
  | "invalid_client"
  | "invalid_grant"
  | "invalid_scope"
  | "unauthorized_client"
  | "unsupported_grant_type"
  | "access_denied"
  | "invalid_token";

/**
 * ApiError that ALSO serialises as an OAuth2 error body (`error`, `error_description`),
 * so standard OAuth / OIDC client libraries understand failures from our token endpoint.
 */
export const oauthError = (
  statusCode: number,
  error: OAuthErrorCode,
  description: string,
): ApiError =>
  new ApiError(statusCode, description, ERROR_CODES.BAD_REQUEST, undefined, {
    error,
    error_description: description,
  });
