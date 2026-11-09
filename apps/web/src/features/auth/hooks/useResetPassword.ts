import { useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { resetSchema } from "../schemas/auth.schema";
import { z } from "zod";

type ResetForm = z.infer<typeof resetSchema>;

export function useResetPassword(token: string | null) {
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passId = useId();
  const confirmId = useId();

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm<ResetForm>({
    resolver: zodResolver(resetSchema),
  });

  const currentPassword = watch("password");

  const mutation = useMutation({
    mutationFn: async (data: { password: string }) => {
      if (!token) throw new Error("Invalid or missing reset token.");
      return await authApi.resetPassword(token, { password: data.password });
    },
    onSuccess: () => {
      setIsSuccess(true);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to reset password.");
    }
  });

  const onSubmit = handleSubmit((data: ResetForm) => {
    mutation.mutate({ password: data.password });
  });

  return {
    isSuccess,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,
    passId, confirmId,
    register, errors, currentPassword,
    isSubmitting: mutation.isPending || isSubmitting,
    onSubmit
  };
}
