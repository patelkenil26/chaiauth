import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { magicLinkSchema, type MagicLinkFormData } from "../schemas/auth.schema";

/** "Email me a sign-in link": request step of passwordless login. */
export function useMagicLink(defaultEmail = "") {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<MagicLinkFormData>({
    resolver: zodResolver(magicLinkSchema),
    defaultValues: { email: defaultEmail, captchaToken: "" },
  });

  const mutation = useMutation({
    mutationFn: (data: MagicLinkFormData) => authApi.requestMagicLink(data),
    onSuccess: (_res, variables) => setSentEmail(variables.email),
    onError: (error: Error) => toast.error(error.message || "Failed to send the sign-in link"),
  });

  const onSubmit = handleSubmit((data) => mutation.mutate(data));

  return {
    sentEmail,
    resetSent: () => setSentEmail(null),
    register,
    setValue,
    errors,
    onSubmit,
    isLoading: mutation.isPending,
  };
}
