import { z } from "zod";
import disposableDomains from "disposable-email-blocklist";

export const emailValidation = z
  .string()
  .min(1, "Email is required")
  .email("Please enter a valid email address.")
  .regex(
    /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    "Please enter a valid email format."
  )
  .refine((email) => {
    const domain = email.split("@")[1]?.toLowerCase();
    return !disposableDomains.includes(domain);
  }, "Temporary or disposable emails are not allowed.");

export const passwordValidation = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(/[a-z]/, "Must contain at least one lowercase letter.")
  .regex(/[A-Z]/, "Must contain at least one uppercase letter.")
  .regex(/[0-9]/, "Must contain at least one number.");

// Future common validations can go here:
// export const phoneValidation = z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits.");
// export const dobValidation = z.date().max(new Date(), "Date of birth cannot be in the future");
