import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";

export function useMfa() {
  const [setupData, setSetupData] = useState<{ secret: string; qrCodeUrl: string; backupCodes?: string[] } | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const queryClient = useQueryClient();

  const generateMfa = useMutation({
    mutationFn: authApi.generateMfa,
    onSuccess: (res: any) => {
      setSetupData(res.data);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to generate MFA secret");
    },
  });

  const verifyMfa = useMutation({
    mutationFn: authApi.verifyMfa,
    onSuccess: () => {
      toast.success("Two-Factor Authentication enabled!");
      setSetupData(null);
      setVerificationCode("");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Invalid MFA code");
    },
  });

  const disableMfa = useMutation({
    mutationFn: authApi.disableMfa,
    onSuccess: () => {
      toast.success("Two-Factor Authentication disabled");
      setVerificationCode("");
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
    onError: (err: any) => {
      toast.error(err.message || "Invalid MFA code");
    },
  });

  return {
    setupData,
    setSetupData,
    verificationCode,
    setVerificationCode,
    generateMfa,
    verifyMfa,
    disableMfa,
  };
}
