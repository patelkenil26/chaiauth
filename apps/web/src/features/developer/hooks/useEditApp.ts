import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { OAuthApp } from "../types";

const editAppSchema = z.object({
  name: z.string().min(2, "Enter an application name."),
  applicationUrl: z.union([z.string().url("Enter a valid HTTP or HTTPS URL."), z.literal("")]).optional(),
  uri: z.string().url("Enter a complete HTTP or HTTPS callback URL."),
  allowedIdps: z.array(z.string()).min(1, "Select at least one sign-in method."),
  logoUrl: z.union([z.string().url("Enter a valid https:// image URL.").startsWith("https://", "The logo must use https."), z.literal("")]).optional(),
  brandColor: z.union([z.string().regex(/^#[0-9a-fA-F]{6}$/, "Use a colour like #65a30d."), z.literal("")]).optional(),
  emailFromName: z.union([z.string().min(2, "At least 2 characters.").max(80).regex(/^[^<>"\r\n,;:@]+$/, "Remove < > \" , ; : @"), z.literal("")]).optional()
});

export type EditAppForm = z.infer<typeof editAppSchema>;

export function useEditApp(
  app: OAuthApp,
  onUpdate: (clientId: string, data: EditAppForm) => Promise<void>
) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, watch, setValue } = useForm<EditAppForm>({
    resolver: zodResolver(editAppSchema),
    defaultValues: { 
      name: app.name, 
      applicationUrl: app.applicationUrl || "",
      uri: app.redirectUris[0] || "", 
      allowedIdps: app.allowedIdps || [],
      logoUrl: app.logoUrl || "",
      brandColor: app.brandColor || "",
      emailFromName: app.emailFromName || ""
    }
  });

  const onSubmit = handleSubmit(async (data: EditAppForm) => {
    try {
      await onUpdate(app.clientId, data);
    } catch (error: any) {
      const msg = error.message.toLowerCase();
      if (msg.includes("uri") || msg.includes("url") || msg.includes("redirect")) {
        setError("uri", { message: error.message });
      } else {
        setError("name", { message: error.message });
      }
    }
  });

  return {
    register, errors, isSubmitting, onSubmit,
    allowedIdps: watch("allowedIdps"),
    setAllowedIdps: (val: string[]) => setValue("allowedIdps", val)
  };
}
