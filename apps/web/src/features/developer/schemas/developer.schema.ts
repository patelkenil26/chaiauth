import { z } from "zod";

export const createAppSchema = z.object({
  name: z.string().min(2, "Enter an application name."),
  applicationUrl: z.union([z.string().url("Enter a valid HTTP or HTTPS URL."), z.literal("")]).optional(),
  uri: z.string().url("Enter a complete HTTP or HTTPS callback URL."),
  allowedIdps: z.array(z.string()).min(1, "Select at least one sign-in method.")
});

export type CreateAppForm = z.infer<typeof createAppSchema>;

export const editAppSchema = z.object({
  name: z.string().min(2, "Enter an application name.").optional(),
  applicationUrl: z.union([z.string().url("Enter a valid HTTP or HTTPS URL."), z.literal("")]).optional(),
  uri: z.string().url("Enter a complete HTTP or HTTPS callback URL.").optional(),
  allowedIdps: z.array(z.string()).min(1, "Select at least one sign-in method.").optional()
});

export type EditAppForm = z.infer<typeof editAppSchema>;
