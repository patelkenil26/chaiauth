import { z } from "zod";
import { emailField, phoneField } from "../../../common/schemas/fields";

/** Credential fields shared by `/auth/login` and the OIDC authorize form. */
export const loginFieldsShape = {
  email: emailField.optional(),
  username: z.string().trim().min(1).optional(),
  phone: phoneField.optional(),
  // Login does NOT apply the password policy: it must accept whatever was set earlier.
  password: z.string().min(1).max(72).optional(),
  otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric").optional(),
};

interface LoginFields {
  email?: string;
  username?: string;
  phone?: string;
  password?: string;
  otp?: string;
}

/** Cross-field rules: one identifier, and exactly one of password / OTP. */
export const withLoginRules = <S extends z.ZodType<LoginFields>>(schema: S) =>
  schema
    .refine((v) => v.email || v.username || v.phone, {
      message: "Please provide email, username, or phone",
    })
    .refine((v) => Boolean(v.password) !== Boolean(v.otp), {
      message: "Provide either a password or an OTP (not both)",
    });

export const loginDto = withLoginRules(z.object(loginFieldsShape));

export type LoginInput = z.infer<typeof loginDto>;
