import { useMutation } from "@tanstack/react-query";
import { dashboardApi } from "../api/dashboard.api";
import { useState, useId } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { z } from "zod";
import { passwordValidation } from "@/shared/schemas/common.schema";

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordValidation,
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type PasswordChangeForm = z.infer<typeof updatePasswordSchema>;

export function useUpdatePassword() {
  const [showCurPass, setShowCurPass] = useState(false);
  const [showNextPass, setShowNextPass] = useState(false);

  const curPassId = useId();
  const nextPassId = useId();

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm<PasswordChangeForm>({
    resolver: zodResolver(updatePasswordSchema),
  });

  const nextPassword = watch("newPassword");

  const mutation = useMutation({
    mutationFn: async (data: { oldPassword: string; newPassword: string }) => {
      return await dashboardApi.updatePassword(data);
    },
    onSuccess: () => {
      toast.success("Password updated successfully");
      reset();
      setShowCurPass(false);
      setShowNextPass(false);
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to update password");
    }
  });

  const onSubmit = handleSubmit((data: PasswordChangeForm) => {
    mutation.mutate({
      oldPassword: data.currentPassword,
      newPassword: data.newPassword
    });
  });

  return {
    showCurPass, setShowCurPass,
    showNextPass, setShowNextPass,
    curPassId, nextPassId,
    register, errors, nextPassword,
    isSubmitting: mutation.isPending || isSubmitting,
    onSubmit
  };
}
