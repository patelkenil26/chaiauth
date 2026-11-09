import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";
import { LoginFormData, loginSchema } from "../schemas/auth.schema";
import { useState, useId, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useOAuthLogin } from "@/shared/hooks/useOAuthLogin";
import { startAuthentication } from '@simplewebauthn/browser';

export function useLogin() {
  const [showPassword, setShowPassword] = useState(false);
  const [requiresMfa, setRequiresMfa] = useState(false);
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  
  const emailId = useId();
  const passId = useId();
  const { openGooglePopup, openGithubPopup } = useOAuthLogin();

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", captchaToken: "" },
  });

  useEffect(() => {
    // Check for error messages passed via URL (e.g., from OAuth rate limiter redirects)
    const params = new URLSearchParams(window.location.search);
    const errorMsg = params.get("error");
    if (errorMsg) {
      toast.error(errorMsg);
      // Clean up the URL so the toast doesn't reappear on refresh
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const mutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
      return await authApi.login(data);
    },
    onSuccess: (response) => {
      const { accessToken, user, requiresMfa, mfaToken } = response.data;
      
      if (requiresMfa) {
        setRequiresMfa(true);
        setMfaToken(mfaToken);
        toast.info("Two-Factor Authentication required", { description: "Please enter your authenticator code." });
        return;
      }

      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
      }
      toast.success("Welcome back!", { description: "You have successfully signed in." });
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast.error(error.message || "Failed to sign in. Please check your credentials.");
    }
  });

  const onSubmit = handleSubmit((data: LoginFormData) => {
    mutation.mutate(data);
  });

  const onPasskeyLogin = async () => {
    try {
      const email = getValues("email");
      const res = await authApi.getPasskeyAuthOptions(email ? { email } : {});
      
      const asseResp = await startAuthentication({ optionsJSON: res.data });
      
      const verifyRes = await authApi.verifyPasskeyAuth({ response: asseResp, sessionToken: res.data.sessionToken });
      
      if (verifyRes.data.accessToken) {
        localStorage.setItem("accessToken", verifyRes.data.accessToken);
        localStorage.setItem("user", JSON.stringify(verifyRes.data.user));
        toast.success("Welcome back!", { description: "You have successfully signed in with your passkey." });
        window.location.href = "/dashboard";
      }
    } catch (error: any) {
      console.error(error);
      
      if (error.name === "NotAllowedError") {
        // User cancelled the prompt, no need to show an error toast
        return;
      }

      toast.error(error.message || "Failed to authenticate with passkey");
    }
  };

  const mfaLoginMutation = useMutation({
    mutationFn: async () => {
      return await authApi.mfaLogin({ mfaToken, code: mfaCode });
    },
    onSuccess: (response) => {
      const { accessToken, user } = response.data;
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
        localStorage.setItem("user", JSON.stringify(user));
      }
      toast.success("Welcome back!", { description: "You have successfully signed in." });
      window.location.href = "/dashboard";
    },
    onError: (error: any) => {
      toast.error(error.message || "Invalid authenticator code.");
    }
  });

  const onMfaSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mfaLoginMutation.mutate();
  };

  return {
    showPassword, setShowPassword,
    requiresMfa, setRequiresMfa,
    mfaCode, setMfaCode,
    onMfaSubmit,
    isMfaLoading: mfaLoginMutation.isPending,
    emailId, passId,
    register, setValue, errors,
    isLoading: mutation.isPending,
    onSubmit,
    onGoogleLogin: openGooglePopup,
    onGithubLogin: openGithubPopup,
    onPasskeyLogin
  };
}
