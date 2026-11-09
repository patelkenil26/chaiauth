import { z } from "zod";
import { emailField, phoneField } from "../../../common/schemas/fields";

export const loginDto = z
  .object({
    email: emailField.optional(),
    username: z.string().trim().min(1).optional(),
    phone: phoneField.optional(),
    // Login does NOT apply the password policy: it must accept whatever was set earlier.
    password: z.string().min(1).max(72).optional(),
    otp: z.string().length(6, "OTP must be 6 digits").regex(/^\d+$/, "OTP must be numeric").optional(),
  })
  .refine((v) => v.email || v.username || v.phone, {
    message: "Please provide email, username, or phone",
  })
  .refine((v) => Boolean(v.password) !== Boolean(v.otp), {
    message: "Provide either a password or an OTP (not both)",
  });

export type LoginInput = z.infer<typeof loginDto>;
