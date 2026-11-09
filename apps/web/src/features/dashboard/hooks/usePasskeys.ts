import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";
import { authApi } from "@/features/auth/api/auth.api";
import { toast } from "sonner";

export function usePasskeys() {
  const [isLoading, setIsLoading] = useState(false);

  const registerPasskey = async () => {
    setIsLoading(true);
    try {
      const optionsRes = await authApi.getPasskeyRegistrationOptions();
      
      let attResp;
      try {
        attResp = await startRegistration({ optionsJSON: optionsRes.data });
      } catch (error: any) {
        if (error.name === 'InvalidStateError') {
          throw new Error("Authenticator was probably already registered by user");
        }
        throw error;
      }

      await authApi.verifyPasskeyRegistration(attResp);
      
      toast.success("Passkey registered!", {
        description: "You can now sign in without a password using your biometric device."
      });
    } catch (error: any) {
      console.error(error);
      
      // Don't show scary errors if the user just cancelled the prompt
      if (error.name === "NotAllowedError") {
        toast.info("Passkey registration cancelled.");
        return;
      }

      toast.error(error.message || "Failed to register passkey");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    registerPasskey,
  };
}
