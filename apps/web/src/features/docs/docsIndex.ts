/** Docs metadata and the search index. Update DOCS_UPDATED whenever the docs change. */
export const DOCS_VERSION = "v1";
export const DOCS_UPDATED = "Nov 19, 2026";

export type SearchEntry = {
  /** Docs page this entry lives on (a NAV id). */
  page: string;
  /** Sub-heading id inside the page, if the entry points at one. */
  anchor?: string;
  title: string;
  group: string;
  /** Keywords and a one-line summary. Searched but not all shown. */
  text: string;
};

export const SEARCH_INDEX: SearchEntry[] = [
  { page: "quick-start", group: "Get started", title: "Quick start", text: "three steps create an app redirect to sign-in exchange the code tokens console getting started" },
  { page: "configure-your-app", group: "Get started", title: "Configure your app", text: "client id app url redirect uri scopes https localhost developer console credentials exact match" },

  { page: "authjs", group: "Integrate", title: "Auth.js / NextAuth", text: "next-auth provider openid configuration well-known wellKnown pkce state idToken profile nextjs" },
  { page: "authjs", anchor: "authjs-install", group: "Integrate", title: "Install Auth.js", text: "npm install next-auth" },
  { page: "authjs", anchor: "authjs-configure", group: "Integrate", title: "Configure the provider", text: "authOptions providers clientId clientSecret authorization params route.ts" },

  { page: "authorization-flow", group: "Integrate", title: "Authorization flow", text: "authorize response_type code client_id redirect_uri state nonce code_challenge code_challenge_method S256 pkce consent screen" },

  { page: "token-exchange", group: "Integrate", title: "Token exchange", text: "o/token grant_type authorization_code code_verifier client_secret refresh_token access token id token bearer expires_in curl node python" },
  { page: "token-exchange", anchor: "token-request", group: "Integrate", title: "Token request", text: "POST /o/token curl node fetch python requests" },
  { page: "token-exchange", anchor: "token-response", group: "Integrate", title: "Token response", text: "access_token id_token refresh_token token_type expires_in scope json" },

  { page: "react-sdk", group: "Integrate", title: "React SDK", text: "@chaiauth/react ChaiAuthProvider hooks components pkce refresh sign-out useChaiAuth" },
  { page: "react-sdk", anchor: "sdk-provider", group: "Integrate", title: "Wrap your app in the provider", text: "ChaiAuthProvider clientId redirectUri issuer providers.tsx" },
  { page: "react-sdk", anchor: "sdk-usage", group: "Integrate", title: "Use the SDK in a component", text: "header sign in sign out user hook button" },

  { page: "embedded-sign-in", group: "Integrate", title: "Embedded sign-in forms", text: "clerk form your own page theme sign in sign up two-factor mfa passwordless email code social turnstile appearance variables classNames application url origin" },
  { page: "embedded-sign-in", anchor: "embedded-form", group: "Integrate", title: "Drop in the sign-in form", text: "login.tsx SignIn SignUp component" },
  { page: "embedded-sign-in", anchor: "embedded-backend-mode", group: "Integrate", title: "Keep the client secret on your server", text: "getAuthContext backend mode pkce verifier one-time code public client" },

  { page: "branded-emails", group: "Integrate", title: "Branded emails", text: "sender name logo brand colour verify email welcome reset password new-device alert application url your app domain noreply" },

  { page: "endpoints", group: "Reference", title: "Endpoints", text: "api reference base url openid-configuration jwks.json o/authorize o/token o/userinfo o/revoke o/register o/email-code forgot-password reset-password verify-email v1/users GET POST" },

  { page: "server-api", group: "Reference", title: "Server API & keys", text: "api key ca_live bearer v1/users list users one user rate limit 120 requests per minute revoke hash backend" },
  { page: "server-api", anchor: "api-request", group: "Reference", title: "Make an API request", text: "curl node python Authorization Bearer ca_live_YOUR_API_KEY" },
  { page: "server-api", anchor: "api-response", group: "Reference", title: "API response", text: "GET /v1/users/:userId claims json" },

  { page: "scopes", group: "Reference", title: "Scopes & claims", text: "openid profile email login_context email_verified sub name unsupported scope rejected" },
  { page: "login-context", group: "Reference", title: "Login context", text: "device ip location browser os language is_new_device event_id history new-device email id token city country timezone" },
  { page: "error-reference", group: "Reference", title: "Error reference", text: "errors error codes invalid_grant invalid_client invalid_scope invalid_token access_denied invalid redirect uri validation_error bad_request forbidden unauthorized not_found conflict 400 401 403 404 409 fix meaning" },
  { page: "error-reference", anchor: "error-format", group: "Reference", title: "Error response format", text: "error error_description code message details json body success false" },
  { page: "error-reference", anchor: "oauth-errors", group: "Reference", title: "OAuth errors", text: "invalid_grant authorization code expired used pkce validation failed refresh token invalid_client unknown client secret invalid_scope access_denied invalid_token expired access token" },
  { page: "error-reference", anchor: "general-errors", group: "Reference", title: "Other errors (redirect uri, validation, origin, API key)", text: "invalid redirect uri client not found validation_error forbidden origin not allowed application url unauthorized api key mfa_required 500" },
  { page: "rate-limits", group: "Reference", title: "Rate limits", text: "rate limit 429 too many requests retry-after backoff throttle per ip per api key 120 per minute 5 per minute 15 minutes quota" },
  { page: "rate-limits", anchor: "rate-limit-429", group: "Reference", title: "When you hit a rate limit", text: "429 TOO_MANY_REQUESTS Retry-After RateLimit headers wait retry exponential backoff" },
  { page: "rate-limits", anchor: "rate-limit-tips", group: "Reference", title: "Staying under the limits", text: "cache tokens refresh reuse access token one api key per service do not poll" },
  { page: "troubleshooting", group: "Help", title: "Troubleshooting & FAQ", text: "faq problems not working redirect_uri mismatch invalid redirect uri token expired authorization code expired refresh token rotation pkce origin not allowed emails not arriving missing claim api key 429 help support" },
  { page: "security-notes", group: "Reference", title: "Security notes", text: "pkce s256 state client secret redirect uri exact match https jwks verify id tokens api keys best practices" },
];

/** Sub-heading id -> the page that contains it. */
export const ANCHOR_PAGE: Record<string, string> = Object.fromEntries(
  SEARCH_INDEX.filter((e) => e.anchor).map((e) => [e.anchor as string, e.page]),
);

export function searchDocs(query: string): SearchEntry[] {
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (words.length === 0) return [];
  return SEARCH_INDEX.map((e) => {
    const title = e.title.toLowerCase();
    const body = `${e.group} ${e.text}`.toLowerCase();
    let score = 0;
    for (const w of words) {
      if (title.startsWith(w)) score += 6;
      else if (title.includes(w)) score += 4;
      else if (body.includes(w)) score += 1;
      else return { e, score: 0 }; // every word must match somewhere
    }
    if (!e.anchor) score += 1; // prefer whole pages over sub-headings on ties
    return { e, score };
  })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.e)
    .slice(0, 8);
}
