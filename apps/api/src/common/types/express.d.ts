import type { UserRole } from "../constants/roles";
import type { OidcAccessTokenPayload } from "../utils/jwt";

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  name: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      /** Set by `authenticate` (first-party session access token). */
      user?: AuthenticatedUser;
      /** Set by `oidcAuthenticate` (RS256 access token issued to a third-party client). */
      oidcUser?: OidcAccessTokenPayload;
      /** Set by `apiKeyAuthenticate` (server-to-server call made with an application API key). */
      apiClient?: { clientId: string; keyId: string };
    }
  }
}

export {};
