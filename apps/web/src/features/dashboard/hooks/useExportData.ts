import { useState } from "react";
import { authApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";
import { useUserProfile } from "./useUserProfile";

export function useExportData() {
  const [isExporting, setIsExporting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { data: user } = useUserProfile();

  const handleExportRequest = async () => {
    setIsExporting(true);
    try {
      const response = await authApi.requestDataExport({ password }) as any;
      toast.success(response.message || "Data export requested successfully.");
      setIsModalOpen(false);
      setPassword("");
    } catch (error: any) {
      toast.error(error.message || "Failed to request data export");
    } finally {
      setIsExporting(false);
    }
  };

  const initiateExport = () => {
    if (user?.hasPassword) {
      setIsModalOpen(true);
    } else {
      // Social login user, no password required
      handleExportRequest();
    }
  };

  return {
    isExporting,
    isModalOpen,
    setIsModalOpen,
    password,
    setPassword,
    initiateExport,
    handleExportRequest,
    hasPassword: user?.hasPassword
  };
}
