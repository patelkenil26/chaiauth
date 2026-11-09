import { z } from "zod";
import { emailField, phoneField } from "../../../common/schemas/fields";

export const sendOtpDto = z
  .object({
    email: emailField.optional(),
    phone: phoneField.optional(),
  })
  .refine((v) => v.email || v.phone, { message: "Please provide email or phone number" });

export type SendOtpInput = z.infer<typeof sendOtpDto>;
