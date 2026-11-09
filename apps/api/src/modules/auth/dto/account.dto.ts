import { z } from "zod";
import { emailField, nameField } from "../../../common/schemas/fields";

export const updateProfileDto = z
  .object({
    name: nameField.optional(),
    email: emailField.optional(),
  })
  .refine((v) => v.name !== undefined || v.email !== undefined, {
    message: "Please provide at least one field to update",
  });
export type UpdateProfileInput = z.infer<typeof updateProfileDto>;

/** Re-authentication ("sudo mode") for sensitive exports. Password is optional for passwordless accounts. */
export const dataExportRequestDto = z.object({
  password: z.string().min(1).max(72).optional(),
});
export type DataExportRequestInput = z.infer<typeof dataExportRequestDto>;
