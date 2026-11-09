import crypto from "node:crypto";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransport,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";
import type { SelectPasskey, SelectUser } from "@repo/database/schema";
import { ApiError } from "../../../common/errors/api-error";
import { config } from "../../../common/config/env.config";
import { redis } from "../../../common/config/redis";
import { minutes } from "../../../common/utils/duration";
import { restoreIfSoftDeleted } from "../account-recovery";
import { userRepository } from "../user.repository";
import { passkeyRepository } from "./passkey.repository";

const { rpName, rpId, origin } = config.webauthn;
const CHALLENGE_TTL_SEC = minutes(5) / 1000;

const registrationChallengeKey = (userId: string) => `webauthn_challenge:${userId}`;
const authenticationChallengeKey = (sessionToken: string) => `webauthn_auth_session:${sessionToken}`;

const parseTransports = (stored: string | null): AuthenticatorTransport[] => {
  if (!stored) return [];
  try {
    return JSON.parse(stored) as AuthenticatorTransport[];
  } catch {
    return [];
  }
};

const toCredentialDescriptor = (key: SelectPasskey) => ({
  id: key.id,
  transports: parseTransports(key.transports),
});

export const webauthnService = {
  // ── Registration (user is already signed in) ──────────────
  async generateRegistration(user: { id: string; email: string }) {
    const existing = await passkeyRepository.listByUserId(user.id);

    const options = await generateRegistrationOptions({
      rpName,
      rpID: rpId,
      userID: new TextEncoder().encode(user.id),
      userName: user.email,
      // Stops the same authenticator being registered twice
      excludeCredentials: existing.map(toCredentialDescriptor),
      authenticatorSelection: {
        residentKey: "preferred",
        userVerification: "preferred",
        authenticatorAttachment: "platform",
      },
    });

    await redis.set(registrationChallengeKey(user.id), options.challenge, "EX", CHALLENGE_TTL_SEC);
    return options;
  },

  async verifyRegistration(userId: string, response: RegistrationResponseJSON): Promise<void> {
    // GETDEL: a challenge can be answered exactly once
    const expectedChallenge = await redis.getdel(registrationChallengeKey(userId));
    if (!expectedChallenge) throw ApiError.badRequest("Registration challenge expired or not found");

    let verification: Awaited<ReturnType<typeof verifyRegistrationResponse>>;
    try {
      verification = await verifyRegistrationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
      });
    } catch {
      throw ApiError.badRequest("Passkey verification failed");
    }

    const { verified, registrationInfo } = verification;
    if (!verified || !registrationInfo) throw ApiError.badRequest("Passkey verification failed");

    const { credential, credentialDeviceType, credentialBackedUp } = registrationInfo;
    await passkeyRepository.create({
      id: credential.id,
      userId,
      publicKey: Buffer.from(credential.publicKey).toString("base64url"),
      counter: credential.counter,
      deviceType: credentialDeviceType,
      backedUp: credentialBackedUp,
      transports: JSON.stringify(response.response.transports ?? []),
    });
  },

  // ── Authentication (passwordless sign-in) ─────────────────
  async generateAuthentication(email?: string) {
    // Unknown emails get the same response shape as known ones (no user enumeration)
    const user = email ? await userRepository.findByEmail(email) : undefined;
    const passkeys = user ? await passkeyRepository.listByUserId(user.id) : [];

    const options = await generateAuthenticationOptions({
      rpID: rpId,
      allowCredentials: passkeys.map(toCredentialDescriptor),
      userVerification: "preferred",
    });

    const sessionToken = crypto.randomBytes(24).toString("hex");
    await redis.set(authenticationChallengeKey(sessionToken), options.challenge, "EX", CHALLENGE_TTL_SEC);

    return { ...options, sessionToken };
  },

  /** Returns the authenticated user. The caller starts the session. */
  async verifyAuthentication(
    response: AuthenticationResponseJSON,
    sessionToken: string,
  ): Promise<SelectUser> {
    const expectedChallenge = await redis.getdel(authenticationChallengeKey(sessionToken));
    if (!expectedChallenge) throw ApiError.badRequest("Authentication challenge expired or not found");

    const passkey = await passkeyRepository.findById(response.id);
    if (!passkey) throw ApiError.badRequest("Authenticator is not registered with this site");

    const user = await userRepository.findById(passkey.userId);
    if (!user) throw ApiError.badRequest("User not found");

    let verification: Awaited<ReturnType<typeof verifyAuthenticationResponse>>;
    try {
      verification = await verifyAuthenticationResponse({
        response,
        expectedChallenge,
        expectedOrigin: origin,
        expectedRPID: rpId,
        credential: {
          id: passkey.id,
          publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64url")),
          counter: passkey.counter,
          transports: parseTransports(passkey.transports),
        },
      });
    } catch {
      throw ApiError.badRequest("Passkey verification failed");
    }
    if (!verification.verified) throw ApiError.badRequest("Passkey verification failed");

    // The counter guards against cloned authenticators
    await passkeyRepository.updateCounter(passkey.id, verification.authenticationInfo.newCounter);

    return restoreIfSoftDeleted(user);
  },
};
