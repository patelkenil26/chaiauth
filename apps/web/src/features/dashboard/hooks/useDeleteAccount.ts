import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import { useState } from "react";

export function useDeleteAccount() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  const deleteAccount = useMutation({
    mutationFn: async () => {
      return await authApi.deleteAccount();
    },
    onSuccess: () => {
      toast.success("Account deleted successfully");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      window.location.href = "/register";
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to delete account");
    }
  });

  const handleDelete = () => {
    if (confirmText !== "DELETE") return;
    deleteAccount.mutate();
  };

  return {
    isModalOpen,
    setIsModalOpen,
    confirmText,
    setConfirmText,
    isDeleting: deleteAccount.isPending,
    handleDelete
  };
}
