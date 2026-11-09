import { z } from "zod";
import { emailField } from "../../../common/schemas/fields";

/**
 * The WebAuthn payloads are produced by the browser API and fully verified (signature, origin,
 * challenge...) by @simplewebauthn/server. We only check the envelope and keep every other key.
 */
const credentialEnvelope = {
  id: z.string().min(1),
  rawId: z.string().min(1),
  type: z.literal("public-key"),
  response: z.looseObject({}),
};

export const verifyRegistrationDto = z.looseObject(credentialEnvelope);
export type VerifyRegistrationInput = z.infer<typeof verifyRegistrationDto>;

/** `email` is optional: without it the browser offers any discoverable passkey on the device. */
export const authenticationOptionsDto = z.object({ email: emailField.optional() });
export type AuthenticationOptionsInput = z.infer<typeof authenticationOptionsDto>;

export const verifyAuthenticationDto = z.object({
  response: z.looseObject(credentialEnvelope),
  sessionToken: z.string().min(1),
});
export type VerifyAuthenticationInput = z.infer<typeof verifyAuthenticationDto>;
