import { OAuth2Client } from "google-auth-library";
import { ApiError } from "../../../../common/errors/api-error";
import { config } from "../../../../common/config/env.config";
import type { OAuthProfile, OAuthProvider } from "../providers.types";

class GoogleProvider implements OAuthProvider {
  readonly id = "google";
  readonly displayName = "Google";

  private readonly client = new OAuth2Client(
    config.google.clientId,
    config.google.clientSecret,
    config.google.callbackUrl,
  );

  isConfigured() {
    return Boolean(config.google.clientId && config.google.clientSecret);
  }

  getAuthUrl(state: string) {
    return this.client.generateAuthUrl({
      scope: ["profile", "email"],
      prompt: "select_account",
      state,
    });
  }

  async getProfile(code: string): Promise<OAuthProfile> {
    try {
      const { tokens } = await this.client.getToken(code);
      if (!tokens.id_token) throw new Error("Google did not return an id_token");

      // Cryptographically verifies signature, audience and expiry against Google's JWKS
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: config.google.clientId,
      });
      const payload = ticket.getPayload();
      if (!payload?.sub) throw new Error("Invalid Google token payload");

      return {
        providerAccountId: payload.sub,
        email: payload.email ?? null,
        name: payload.name ?? null,
        emailVerified: payload.email_verified === true,
      };
    } catch {
      throw ApiError.badRequest("Google sign-in failed. Please try again.");
    }
  }
}

export const googleProvider = new GoogleProvider();
