import { z } from "zod";
import { emailValidation, passwordValidation } from "@/shared/schemas/common.schema";

export const loginSchema = z.object({
  email: emailValidation,
  password: passwordValidation,
  rememberMe: z.boolean().default(false).optional(),
  captchaToken: z.string().min(1, "Please complete the anti-bot verification"),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  name: z.string().min(2, "Enter your full name."),
  email: emailValidation,
  password: passwordValidation,
  role: z.enum(["customer", "seller"]),
  captchaToken: z.string().min(1, "Please complete the anti-bot verification"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
  email: emailValidation,
  captchaToken: z.string().min(1, "Please complete the anti-bot verification"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const resetSchema = z.object({
  password: passwordValidation,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type ResetForm = z.infer<typeof resetSchema>;

export const magicLinkSchema = z.object({
  email: emailValidation,
  captchaToken: z.string().min(1, "Please complete the anti-bot verification"),
});

export type MagicLinkFormData = z.infer<typeof magicLinkSchema>;
