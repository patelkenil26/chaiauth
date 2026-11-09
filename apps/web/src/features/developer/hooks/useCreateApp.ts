import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createAppSchema, CreateAppForm } from "../schemas/developer.schema";

export function useCreateApp(onCreate: (name: string, applicationUrl: string | undefined, uri: string, allowedIdps: string[]) => Promise<void>) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, setError, watch, setValue } = useForm<CreateAppForm>({
    resolver: zodResolver(createAppSchema),
    defaultValues: { name: "", applicationUrl: "", uri: "", allowedIdps: ["email", "google"] }
  });

  const onSubmit = handleSubmit(async (data: CreateAppForm) => {
    try {
      const url = data.applicationUrl && data.applicationUrl.trim() !== "" ? data.applicationUrl : undefined;
      await onCreate(data.name, url, data.uri, data.allowedIdps);
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
