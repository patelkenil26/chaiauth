export type OAuthApp = {
  id: string;
  name: string;
  clientId: string;
  applicationUrl?: string;
  redirectUris: string[];
  allowedIdps: string[];
  createdAt: string;
};
