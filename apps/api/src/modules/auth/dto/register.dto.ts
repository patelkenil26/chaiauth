import { z } from "zod";
import { emailField, nameField, passwordField, phoneField, usernameField } from "../../../common/schemas/fields";

export const registerDto = z.object({
  name: nameField,
  email: emailField,
  username: usernameField.optional(),
  phone: phoneField.optional(),
  password: passwordField,
  // Self-service roles only. Elevated roles are assigned by admins.
  role: z.enum(["customer", "seller"]).default("customer"),
});

export type RegisterInput = z.infer<typeof registerDto>;
