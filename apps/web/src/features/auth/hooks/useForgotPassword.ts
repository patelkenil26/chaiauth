import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { forgotPasswordSchema, ForgotPasswordFormData } from "../schemas/auth.schema";
import { toast } from "sonner";

export function useForgotPassword() {
  const [sentEmail, setSentEmail] = useState<string | null>(null);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "", captchaToken: "" }
  });

  const mutation = useMutation({
    mutationFn: async (data: ForgotPasswordFormData) => {
      return await authApi.forgotPassword({ email: data.email, captchaToken: data.captchaToken });
    },
    onSuccess: (_, variables) => {
      setSentEmail(variables.email);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to send reset link");
    }
  });

  const onSubmit = handleSubmit((data: ForgotPasswordFormData) => {
    mutation.mutate(data);
  });

  return {
    sentEmail, setSentEmail,
    register, setValue, errors,
    isSubmitting: mutation.isPending || isSubmitting,
    onSubmit
  };
}
