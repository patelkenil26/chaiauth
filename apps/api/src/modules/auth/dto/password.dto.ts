import { z } from "zod";
import { emailField, passwordField, tokenField } from "../../../common/schemas/fields";

export const forgotPasswordDto = z.object({ email: emailField });
export type ForgotPasswordInput = z.infer<typeof forgotPasswordDto>;

export const resetPasswordDto = z.object({ password: passwordField });
export type ResetPasswordInput = z.infer<typeof resetPasswordDto>;

export const updatePasswordDto = z
  .object({
    oldPassword: z.string().min(1, "Current password is required").max(72),
    newPassword: passwordField,
  })
  .refine((v) => v.oldPassword !== v.newPassword, {
    message: "New password must be different from the current password",
    path: ["newPassword"],
  });
export type UpdatePasswordInput = z.infer<typeof updatePasswordDto>;

/** `:token` URL parameter (email verification, password reset, data export download). */
export const tokenParamDto = z.object({ token: tokenField });
export type TokenParams = z.infer<typeof tokenParamDto>;
