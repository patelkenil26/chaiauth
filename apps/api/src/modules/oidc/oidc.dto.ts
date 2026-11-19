import { z } from "zod";
import { emailField, nameField, passwordField, tokenField } from "../../common/schemas/fields";
import { loginFieldsShape, withLoginRules } from "../auth/dto/login.dto";
import { mfaCodeField } from "../auth/mfa/mfa.dto";

/**
 * Redirect URIs must be https (http only for localhost development) and must not carry a fragment.
 * Registered URIs are later compared by EXACT string match.
 */
const redirectUriField = z
  .url("Redirect URI must be a valid URL")
  .max(255)
  .refine((value) => {
    const url = new URL(value);
    const isLocal = url.hostname === "localhost" || url.hostname === "127.0.0.1";
    return (url.protocol === "https:" || (url.protocol === "http:" && isLocal)) && !url.hash;
  }, "Redirect URI must use https (http is allowed only for localhost) and cannot contain a fragment");

const scopeField = z.string().min(1).max(255);

/** Everything needed to resume an authorization request after the user has authenticated. */
export const oidcAuthContextSchema = z.object({
  client_id: z.string().min(1).max(255),
  redirect_uri: z.string().min(1).max(255),
  scope: scopeField,
  state: z.string().min(1).max(2048),
  // PKCE. Only S256 is supported ("plain" offers no protection against an intercepted code).
  code_challenge: z.string().min(43).max(128).optional(),
  code_challenge_method: z.literal("S256").optional(),
  nonce: z.string().max(256).optional(),
});
export type OidcAuthContext = z.infer<typeof oidcAuthContextSchema>;

// ── Authorization endpoint ──────────────────────────────────
export const authorizeQueryDto = oidcAuthContextSchema.extend({ response_type: z.literal("code") });
export type AuthorizeQuery = z.infer<typeof authorizeQueryDto>;

export const authorizeSubmitDto = withLoginRules(
  z.object({
    ...loginFieldsShape,
    ...oidcAuthContextSchema.shape,
    consent_granted: z.boolean(),
  }),
);
export type AuthorizeSubmitInput = z.infer<typeof authorizeSubmitDto>;

// ── Embedded sign-in extras (an app's own form; see embedded-cors.middleware.ts) ──
/** Second step when the account has two-factor authentication. */
export const authorizeMfaDto = z.object({
  ...oidcAuthContextSchema.shape,
  mfa_token: z.string().min(1).max(2048),
  code: mfaCodeField,
  consent_granted: z.boolean(),
});
export type AuthorizeMfaInput = z.infer<typeof authorizeMfaDto>;

/** Sign-up from an app's own form. The role is never client-controlled: always a normal user. */
export const embeddedRegisterDto = z.object({
  client_id: z.string().min(1).max(255),
  name: nameField,
  email: emailField,
  password: passwordField,
});
export type EmbeddedRegisterInput = z.infer<typeof embeddedRegisterDto>;

/** Passwordless: emails a 6-digit sign-in code. */
export const embeddedEmailCodeDto = z.object({
  client_id: z.string().min(1).max(255),
  email: emailField,
});
export type EmbeddedEmailCodeInput = z.infer<typeof embeddedEmailCodeDto>;

/** Email verification link, opened on the APP's own page (`/verify-email?token=`). */
export const embeddedVerifyEmailDto = z.object({
  client_id: z.string().min(1).max(255),
  token: tokenField,
});
export type EmbeddedVerifyEmailInput = z.infer<typeof embeddedVerifyEmailDto>;

/** "Forgot password" from the app's own form. The reset link goes to the app's `/reset-password` page. */
export const embeddedForgotPasswordDto = z.object({
  client_id: z.string().min(1).max(255),
  email: emailField,
});
export type EmbeddedForgotPasswordInput = z.infer<typeof embeddedForgotPasswordDto>;

export const embeddedResetPasswordDto = z.object({
  client_id: z.string().min(1).max(255),
  token: tokenField,
  password: passwordField,
});
export type EmbeddedResetPasswordInput = z.infer<typeof embeddedResetPasswordDto>;

// ── Token endpoint ──────────────────────────────────────────
const clientAuthFields = {
  client_id: z.string().min(1).max(255),
  // Confidential clients authenticate with a secret; public clients (SPA / mobile) rely on PKCE.
  client_secret: z.string().min(1).max(255).optional(),
};

export const tokenDto = z.discriminatedUnion("grant_type", [
  z.object({
    grant_type: z.literal("authorization_code"),
    ...clientAuthFields,
    code: z.string().min(1).max(255),
    redirect_uri: z.string().min(1).max(255),
    code_verifier: z.string().min(43).max(128).optional(),
  }),
  z.object({
    grant_type: z.literal("refresh_token"),
    ...clientAuthFields,
    refresh_token: z.string().min(1).max(255),
  }),
]);
export type TokenInput = z.infer<typeof tokenDto>;

export const revokeDto = z.object({ token: z.string().min(1).max(255) });
export type RevokeInput = z.infer<typeof revokeDto>;

// ── Developer portal (client registration) ─────────────────
const allowedIdpsField = z.array(z.string().min(1).max(50)).max(10);

// White-label branding for emails sent on the app's behalf
const logoUrlField = z
  .url("Logo URL must be a valid URL")
  .max(500)
  .refine((v) => new URL(v).protocol === "https:", "Logo URL must use https");
const brandColorField = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Brand colour must look like #RRGGBB");
const emailFromNameField = z
  .string()
  .trim()
  .min(2)
  .max(80)
  .regex(/^[^<>"\r\n,;:@]+$/, "Sender name cannot contain < > \" , ; : @ or line breaks");

export const registerClientDto = z.object({
  displayName: z.string().trim().min(3).max(255),
  applicationUrl: z.url().max(255).optional(),
  redirectUri: redirectUriField,
  allowedIdps: allowedIdpsField.optional(),
  logoUrl: logoUrlField.optional(),
  brandColor: brandColorField.optional(),
  emailFromName: emailFromNameField.optional(),
});
export type RegisterClientInput = z.infer<typeof registerClientDto>;

export const updateClientDto = z
  .object({
    displayName: z.string().trim().min(3).max(255).optional(),
    applicationUrl: z.url().max(255).optional(),
    redirectUri: redirectUriField.optional(),
    allowedIdps: allowedIdpsField.optional(),
    logoUrl: logoUrlField.optional(),
    brandColor: brandColorField.optional(),
    emailFromName: emailFromNameField.optional(),
  })
  .refine((v) => Object.values(v).some((x) => x !== undefined), {
    message: "Please provide at least one field to update",
  });
export type UpdateClientInput = z.infer<typeof updateClientDto>;

export const clientIdParamDto = z.object({ clientId: z.string().min(1).max(255) });
export type ClientIdParams = z.infer<typeof clientIdParamDto>;
