/**
 * Data behind the Error reference, Rate limits and Troubleshooting pages.
 * Every message, status and limit here mirrors the backend (apps/api): keep them in sync when it changes.
 */

export type OAuthErrorRow = {
  /** The `error` field of the response, or the `code` field for non-OAuth errors. */
  error: string;
  status: number;
  /** Where it comes from. */
  endpoint: string;
  /** The `message` / `error_description` your app receives. */
  message: string;
  cause: string;
  fix: string;
};

/** Failures shaped like RFC 6749: the body carries `error` and `error_description`. */
export const OAUTH_ERRORS: OAuthErrorRow[] = [
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token",
    message: "Invalid or expired authorization code",
    cause: "The code is older than 60 seconds, was already used, or never existed. A code is single use even when the attempt fails.",
    fix: "Exchange the code immediately and only once. Do not retry: send the user through /authorize again to get a fresh code.",
  },
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token",
    message: "Authorization code was not issued for this client",
    cause: "The client_id or redirect_uri in the token request differs from the one used at /authorize.",
    fix: "Send the exact same redirect_uri string and the same client_id in both requests.",
  },
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token",
    message: "code_verifier is required",
    cause: "The authorize request carried a code_challenge, but the token request has no code_verifier.",
    fix: "Send the original PKCE verifier (43 to 128 characters) with the token request.",
  },
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token",
    message: "PKCE validation failed",
    cause: "The base64url SHA-256 of code_verifier does not equal the code_challenge sent earlier.",
    fix: "Keep one verifier per sign-in attempt, hash it with S256 and base64url encoding (no padding), and do not regenerate it between the redirect and the callback.",
  },
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token (refresh_token)",
    message: "Invalid or expired refresh token",
    cause: "Refresh tokens last 7 days and rotate: every successful refresh consumes the old token and returns a new one.",
    fix: "Always store the refresh_token from the latest response and discard the old one. If it is gone or expired, sign the user in again.",
  },
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token (refresh_token)",
    message: "Refresh token was not issued for this client",
    cause: "The refresh token belongs to a different app than the client_id you sent.",
    fix: "Use the client_id of the app the user signed in to.",
  },
  {
    error: "invalid_grant",
    status: 400,
    endpoint: "POST /o/token",
    message: "User no longer exists",
    cause: "The account was deleted after the code or refresh token was issued.",
    fix: "Treat the user as signed out and remove their local session.",
  },
  {
    error: "invalid_client",
    status: 401,
    endpoint: "POST /o/token",
    message: "Unknown client",
    cause: "No application has this client_id (typo, wrong environment, or the app was deleted).",
    fix: "Copy the Client ID from the developer console.",
  },
  {
    error: "invalid_client",
    status: 401,
    endpoint: "POST /o/token",
    message: "Invalid client credentials",
    cause: "A client_secret was sent and it is wrong. A secret you send must always be correct.",
    fix: "Use the current secret from the console. Public clients (SPA, mobile) should omit client_secret entirely and rely on PKCE.",
  },
  {
    error: "invalid_client",
    status: 401,
    endpoint: "POST /o/token",
    message: "Client authentication failed: provide client_secret or use PKCE",
    cause: "No client_secret was sent and the authorization request did not include a code_challenge.",
    fix: "Either send client_secret from your server, or add code_challenge and code_challenge_method=S256 to /authorize and send code_verifier.",
  },
  {
    error: "invalid_scope",
    status: 400,
    endpoint: "GET /o/authorize, POST /o/token",
    message: "No supported scope requested",
    cause: "None of the requested scopes is supported. Unsupported scopes are ignored, but at least one valid one is required.",
    fix: "Request at least one of openid, profile, email or login_context.",
  },
  {
    error: "access_denied",
    status: 403,
    endpoint: "POST /o/authorize, POST /o/authorize/mfa",
    message: "User denied the consent request",
    cause: "The user declined to share their details with your app.",
    fix: "Show a friendly message and let them try again. Do not retry automatically.",
  },
  {
    error: "invalid_token",
    status: 401,
    endpoint: "GET /o/userinfo",
    message: "Bearer token is missing",
    cause: "No Authorization: Bearer header was sent.",
    fix: "Send the access token as Authorization: Bearer <access_token>.",
  },
  {
    error: "invalid_token",
    status: 401,
    endpoint: "GET /o/userinfo",
    message: "Access token has expired",
    cause: "Access tokens last 1 hour (expires_in: 3600).",
    fix: "Call POST /o/token with grant_type=refresh_token and retry once with the new access token.",
  },
  {
    error: "invalid_token",
    status: 401,
    endpoint: "GET /o/userinfo",
    message: "Invalid access token",
    cause: "The token is malformed, signed by another issuer, or is an ID token instead of an access token.",
    fix: "Send the access_token, not the id_token.",
  },
];

/** Failures without an OAuth `error` field: identify them by HTTP status and `code`. */
export const GENERAL_ERRORS: OAuthErrorRow[] = [
  {
    error: "BAD_REQUEST",
    status: 400,
    endpoint: "GET /o/authorize",
    message: "Invalid redirect uri",
    cause: "redirect_uri does not match the one registered for the app. Matching is exact: scheme, host, port, path and trailing slash.",
    fix: "Copy the redirect URI from the developer console character for character. Remember that http is only allowed for localhost.",
  },
  {
    error: "NOT_FOUND",
    status: 404,
    endpoint: "GET /o/authorize",
    message: "Client not found",
    cause: "client_id is unknown.",
    fix: "Check the Client ID and that you are calling the right ChaiAuth environment.",
  },
  {
    error: "VALIDATION_ERROR",
    status: 400,
    endpoint: "Any endpoint",
    message: "Field-level messages joined with “;”. The details array lists each part, path and message.",
    cause: "A required parameter is missing or malformed. Typical: response_type is not “code”, state is empty, code_challenge_method is not S256, code_challenge is not 43 to 128 characters, grant_type is not authorization_code or refresh_token.",
    fix: "Read details[].path and details[].message to see the exact field.",
  },
  {
    error: "FORBIDDEN",
    status: 403,
    endpoint: "Embedded sign-in endpoints (POST /o/*)",
    message: "This origin is not allowed to sign in to this application. Set the app's Application URL to this site in the ChaiAuth developer console.",
    cause: "A browser on a different origin than the app's Application URL called an embedded endpoint.",
    fix: "Set Application URL in the developer console to the exact origin that hosts your form, for example https://yourapp.com.",
  },
  {
    error: "FORBIDDEN",
    status: 403,
    endpoint: "POST /o/authorize",
    message: "Two-factor authentication is required. Enter the code from your authenticator app.",
    cause: "Not a failure. The account has two-factor on. The body also carries mfa_required: true and an mfa_token.",
    fix: "Ask for the authenticator or backup code and send it with the mfa_token to POST /o/authorize/mfa. The SDK forms do this for you.",
  },
  {
    error: "UNAUTHORIZED",
    status: 401,
    endpoint: "/v1/*",
    message: "A valid API key is required",
    cause: "The key is missing or does not look like ca_live_… .",
    fix: "Send Authorization: Bearer ca_live_… (or an X-API-Key header).",
  },
  {
    error: "UNAUTHORIZED",
    status: 401,
    endpoint: "/v1/*",
    message: "Invalid API key",
    cause: "The key does not exist, was revoked or has expired.",
    fix: "Create a new key in the developer console, open your app, then API keys.",
  },
  {
    error: "NOT_FOUND",
    status: 404,
    endpoint: "GET /v1/users/:userId",
    message: "User not found",
    cause: "The user does not exist or never approved your app.",
    fix: "You can only read users who granted your app access.",
  },
  {
    error: "CONFLICT",
    status: 409,
    endpoint: "Developer console",
    message: "An application can have at most 10 active API keys. Revoke one first.",
    cause: "The per-app limit of active keys is reached.",
    fix: "Revoke a key you no longer use.",
  },
  {
    error: "TOO_MANY_REQUESTS",
    status: 429,
    endpoint: "Any endpoint",
    message: "Varies by limiter, for example “Too many authentication attempts, please try again after 1 minute”.",
    cause: "A rate limit was hit. See the Rate limits page.",
    fix: "Wait for the time in the Retry-After header, then retry with backoff.",
  },
  {
    error: "INTERNAL_SERVER_ERROR",
    status: 500,
    endpoint: "Any endpoint",
    message: "Internal Server Error",
    cause: "Something went wrong on our side. Details are never sent to clients.",
    fix: "Retry after a moment. If it persists, contact us with the time and endpoint.",
  },
];

export type RateLimitRow = {
  scope: string;
  endpoints: string;
  limit: string;
  counts: string;
};

export const RATE_LIMITS: RateLimitRow[] = [
  { scope: "Per API key", endpoints: "/v1/users, /v1/users/:userId", limit: "120 requests / minute", counts: "Every request, per key (not per IP)" },
  { scope: "Per IP", endpoints: "POST /o/token, POST /o/revoke, POST /o/register", limit: "5 requests / minute", counts: "Every request" },
  {
    scope: "Per IP",
    endpoints: "POST /o/authorize, POST /o/authorize/mfa, POST /o/verify-email, POST /o/reset-password",
    limit: "5 failed attempts / 15 minutes",
    counts: "Only failed requests, so successful sign-ins never lock anyone out",
  },
  { scope: "Per IP", endpoints: "POST /o/email-code, POST /o/forgot-password", limit: "5 requests / 15 minutes", counts: "Every request (these always answer 200 to avoid revealing which emails exist)" },
  { scope: "Per IP", endpoints: "Everything except / and /health", limit: "100 requests / 15 minutes", counts: "Every request, on top of the limits above" },
];

export type FaqItem = { q: string; a: string };

export const FAQ: { group: string; items: FaqItem[] }[] = [
  {
    group: "Sign-in redirect",
    items: [
      {
        q: "Why do I get “Invalid redirect uri”?",
        a: "redirect_uri must equal the registered value exactly: scheme, host, port, path and trailing slash. https://yourapp.com/auth/callback and https://yourapp.com/auth/callback/ are different. Use https; http works only for localhost and 127.0.0.1. The URI also cannot contain a #fragment.",
      },
      {
        q: "Why does /authorize return a validation error?",
        a: "Check the required parameters: response_type=code, client_id, redirect_uri, scope and a non-empty state. If you use PKCE, code_challenge_method must be S256 (plain is not supported) and code_challenge must be 43 to 128 characters.",
      },
      {
        q: "The embedded form says “This origin is not allowed”.",
        a: "Set the app's Application URL in the developer console to the exact origin of the page that hosts the form, such as https://yourapp.com (no path). Only that origin may call the embedded endpoints from a browser.",
      },
    ],
  },
  {
    group: "Tokens",
    items: [
      {
        q: "“Invalid or expired authorization code” right after sign-in.",
        a: "Codes live for 60 seconds and work once, even if the attempt fails. Exchange the code in the callback handler straight away, never retry it, and make sure the callback is not run twice (React strict mode and prefetching can double-fire it).",
      },
      {
        q: "My access token expired. What now?",
        a: "Access tokens last 1 hour. Call POST /o/token with grant_type=refresh_token, your client_id and the refresh_token (plus client_secret for confidential clients), then use the new access token. The @chaiauth/react SDK does this automatically.",
      },
      {
        q: "Refreshing worked once, then failed with invalid_grant.",
        a: "Refresh tokens rotate. Each refresh consumes the token you sent and returns a new one, so you must save the new refresh_token every time. Two parallel refreshes with the same token will make one of them fail. Refresh tokens expire 7 days after they were issued.",
      },
      {
        q: "“PKCE validation failed”.",
        a: "The code_verifier you send must be the same random string whose S256 hash (base64url, no padding) you sent as code_challenge. Store the verifier per sign-in attempt, for example in a cookie or session, and read that same value in the callback.",
      },
      {
        q: "“Client authentication failed: provide client_secret or use PKCE”.",
        a: "A server app must send client_secret. A browser or mobile app has no secret, so it must send a code_challenge at /authorize and a code_verifier at /o/token.",
      },
      {
        q: "How do I verify an ID token?",
        a: "Fetch the public keys from /.well-known/jwks.json, verify the RS256 signature, then check iss, aud (your client ID), exp and your nonce.",
      },
    ],
  },
  {
    group: "Data and emails",
    items: [
      {
        q: "A claim is missing from the token or userinfo.",
        a: "Claims follow the scopes the user approved. name needs profile, email and email_verified need email, and login_context is only included when you request that scope.",
      },
      {
        q: "Reset or sign-in code emails are not arriving.",
        a: "For privacy, forgot-password and email-code always answer success, whether or not the address exists. App-branded email is sent only to people who signed up or signed in through your app. Also check spam, and note that these two endpoints allow 5 requests per 15 minutes per IP.",
      },
    ],
  },
  {
    group: "Server API",
    items: [
      {
        q: "“Invalid API key” or “A valid API key is required”.",
        a: "Keys look like ca_live_… and are sent as Authorization: Bearer <key> or an X-API-Key header. A key that was revoked or has expired is rejected. Keys are shown only once, so create a new one if it was lost.",
      },
      {
        q: "I get 429 Too Many Requests.",
        a: "You hit a rate limit. Read the Retry-After header, wait, and retry with exponential backoff. Cache access tokens for their full hour and refresh them instead of repeating the sign-in flow. See the Rate limits page for every limit.",
      },
    ],
  },
];
