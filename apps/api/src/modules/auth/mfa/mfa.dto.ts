import { z } from "zod";

/** 6-digit authenticator code, or an 8-character hex backup code. */
export const mfaCodeField = z
  .string()
  .trim()
  .regex(/^(\d{6}|[0-9a-fA-F]{8})$/, "Enter the 6-digit authenticator code or an 8-character backup code");

export const verifyMfaDto = z.object({
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit code from your authenticator app"),
});
export type VerifyMfaInput = z.infer<typeof verifyMfaDto>;

export const disableMfaDto = z.object({ code: mfaCodeField });
export type DisableMfaInput = z.infer<typeof disableMfaDto>;

export const mfaLoginDto = z.object({
  mfaToken: z.string().min(1, "MFA token is required"),
  code: mfaCodeField,
});
export type MfaLoginInput = z.infer<typeof mfaLoginDto>;
