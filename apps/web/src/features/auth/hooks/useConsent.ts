import { useQuery, useMutation } from "@tanstack/react-query";
import { authApi } from "../api/auth.api";
import { useState } from "react";
import { toast } from "sonner";

export function useConsent(searchParams: URLSearchParams) {
  const [loading, setLoading] = useState<"allow" | "deny" | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectUrl, setRedirectUrl] = useState("");

  // Email / password flow
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone / OTP flow
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // Username flow
  const [username, setUsername] = useState("");

  const initQuery = useQuery({
    queryKey: ['consent-init', searchParams.toString()],
    queryFn: async () => {
      const params = {
        client_id: searchParams.get("client_id"),
        redirect_uri: searchParams.get("redirect_uri"),
        scope: searchParams.get("scope"),
        state: searchParams.get("state"),
        code_challenge: searchParams.get("code_challenge"),
        code_challenge_method: searchParams.get("code_challenge_method"),
        // Echoed back in the ID token so the app can tie it to its own sign-in attempt
        nonce: searchParams.get("nonce")
      };

      if (!params.client_id) {
        throw new Error("Missing client_id in URL");
      }

      const res = await authApi.authorize(params);
      return res.data;
    },
    retry: false
  });

  const submitMutation = useMutation({
    mutationFn: async (payload: any) => {
      return await authApi.authorizeSubmit(payload);
    }
  });

  // Allowed IDPs from backend response
  const allowedIdps: string[] = initQuery.data?.allowedIdps || [];

  const handleSendOtp = async () => {
    if (!phone) {
      toast.error("Please enter your phone number");
      return;
    }
    setOtpLoading(true);
    try {
      await authApi.sendOtp({ phone });
      setOtpSent(true);
      toast.success("OTP sent! Check your registered email.");
    } catch (err: any) {
      toast.error(err.message || "Failed to send OTP");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleAction = (action: "allow" | "deny") => {
    const idps = allowedIdps;

    if (action === "allow") {
      // Validate based on active IdP
      if (idps.includes("phone") && !idps.includes("email") && !idps.includes("username")) {
        // Phone-only flow
        if (!phone) { toast.error("Please enter your phone number"); return; }
        if (!otpSent) { toast.error("Please request an OTP first"); return; }
        if (!otp) { toast.error("Please enter the OTP"); return; }
      } else if (idps.includes("username") && !idps.includes("email") && !idps.includes("phone")) {
        // Username-only flow
        if (!username || !password) { toast.error("Please enter username and password"); return; }
      } else {
        // Email (default) or mixed — require email + password
        if (!email || !password) { toast.error("Please enter your email and password"); return; }
      }
    }

    setLoading(action);

    if (action === "allow") {
      const payload: any = {
        consent_granted: true,
        ...initQuery.data?.authContext
      };

      // Populate auth fields based on what is filled
      if (phone && otp) {
        payload.phone = phone;
        payload.otp = otp;
      } else if (username && password) {
        payload.username = username;
        payload.password = password;
      } else {
        payload.email = email;
        payload.password = password;
      }

      submitMutation.mutate(payload, {
        onSuccess: (res) => {
          const data = res.data;
          const redirect = new URL(data.redirect_uri);
          redirect.searchParams.append("code", data.code);
          if (data.state) redirect.searchParams.append("state", data.state);

          setRedirectUrl(redirect.toString());
          setIsSuccess(true);

          setTimeout(() => {
            window.location.href = redirect.toString();
          }, 1500);
        },
        onError: (error: any) => {
          toast.error(error.message || "Authorization failed. Check your credentials.");
          setLoading(null);
        }
      });
    } else {
      // OAuth 2.0 (RFC 6749 4.1.2.1): tell the app the user said no, instead of leaving it waiting.
      // The redirect_uri was already validated against the app's registered URI by the server.
      const ctx = initQuery.data?.authContext;
      if (ctx?.redirect_uri) {
        const redirect = new URL(ctx.redirect_uri);
        redirect.searchParams.set("error", "access_denied");
        if (ctx.state) redirect.searchParams.set("state", ctx.state);
        window.location.href = redirect.toString();
      } else {
        window.location.href = "/dashboard";
      }
    }
  };

  const handleFederatedLogin = (provider: "google" | "github") => {
    const oidcContext = initQuery.data?.authContext;
    if (!oidcContext) return;
    const proxyState = encodeURIComponent(JSON.stringify(oidcContext));
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    window.location.href = `${apiUrl}/auth/providers/${provider}?proxy_state=${proxyState}`;
  };

  return {
    authData: initQuery.data,
    allowedIdps,
    isInitLoading: initQuery.isLoading,
    isInitError: initQuery.isError,
    // email
    email, setEmail,
    password, setPassword,
    // phone/otp
    phone, setPhone,
    otp, setOtp,
    otpSent,
    otpLoading,
    handleSendOtp,
    // username
    username, setUsername,
    // actions
    loading,
    isSuccess,
    redirectUrl,
    handleAction,
    handleFederatedLogin
  };
}
