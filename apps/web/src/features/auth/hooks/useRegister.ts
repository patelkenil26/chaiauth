import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { RegisterFormData, registerSchema } from "../schemas/auth.schema";
import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOAuthLogin } from "@/shared/hooks/useOAuthLogin";

export function useRegister() {
  const [showPassword, setShowPassword] = useState(false);
  const nameId = useId();
  const emailId = useId();
  const passId = useId();
  const { openGooglePopup, openGithubPopup } = useOAuthLogin();

  const { register, handleSubmit, watch, control, setValue, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { name: "", email: "", password: "", role: "customer", captchaToken: "" },
  });

  const currentPassword = watch("password");

  const mutation = useMutation({
    mutationFn: async (data: RegisterFormData) => {
      return await authApi.register(data);
    },
    onSuccess: (_, variables) => {
      window.location.href = `/check-email?email=${encodeURIComponent(variables.email)}`;
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to create account.");
    }
  });

  const onSubmit = handleSubmit((data: RegisterFormData) => {
    mutation.mutate(data);
  });

  return {
    showPassword, setShowPassword,
    nameId, emailId, passId,
    register, control, setValue, errors, currentPassword,
    isLoading: mutation.isPending,
    onSubmit,
    onGoogleLogin: openGooglePopup,
    onGithubLogin: openGithubPopup
  };
}
