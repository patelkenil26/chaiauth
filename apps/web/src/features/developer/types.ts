export type OAuthApp = {
  id: string;
  name: string;
  clientId: string;
  applicationUrl?: string;
  redirectUris: string[];
  allowedIdps: string[];
  /** Email branding: emails sent from this app's own forms use these instead of ChaiAuth's. */
  logoUrl?: string;
  brandColor?: string;
  emailFromName?: string;
  createdAt: string;
};

export type ApiKeyStatus = "active" | "expired" | "revoked";

export type ApiKey = {
  id: string;
  name: string;
  /** First characters of the key, enough to recognise it. The full key is only shown at creation. */
  keyPrefix: string;
  status: ApiKeyStatus;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};
