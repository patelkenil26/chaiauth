/** Normalised identity returned by every social provider. */
export interface OAuthProfile {
  /** The provider's own stable id for this account. */
  providerAccountId: string;
  email: string | null;
  name: string | null;
  /** True only if the PROVIDER vouches that the user controls `email`. */
  emailVerified: boolean;
}

/**
 * Strategy interface: adding a provider (LinkedIn, Microsoft...) means writing one class
 * that implements this and registering it in `providers.registry.ts`. No route/controller changes.
 */
export interface OAuthProvider {
  readonly id: string;
  readonly displayName: string;
  /** False when client id/secret are missing, so the provider is hidden / rejected cleanly. */
  isConfigured(): boolean;
  getAuthUrl(state: string): string;
  getProfile(code: string): Promise<OAuthProfile>;
}
