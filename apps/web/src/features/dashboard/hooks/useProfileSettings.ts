import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";

export function useProfileSettings(user: any) {
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: async (data: { name?: string; email?: string }) => {
      // Create an api method or call fetch directly. Let's assume authApi.updateProfile exists.
      return authApi.updateProfile(data);
    },
    onSuccess: (res: any) => {
      toast.success(res.message || "Profile updated successfully");
      queryClient.invalidateQueries({ queryKey: ["user"] });
      
      if (res.data?.email !== user.email && !res.data?.isVerified) {
        toast.info("Please check your new email for a verification link.", { duration: 5000 });
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Failed to update profile");
    },
  });

  const isDirty = name !== user?.name || email !== user?.email;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isDirty) return;
    
    const updates: { name?: string; email?: string } = {};
    if (name !== user.name) updates.name = name;
    if (email !== user.email) updates.email = email;
    
    updateProfile.mutate(updates);
  };

  return {
    name,
    setName,
    email,
    setEmail,
    isDirty,
    isLoading: updateProfile.isPending,
    handleSubmit,
  };
}
