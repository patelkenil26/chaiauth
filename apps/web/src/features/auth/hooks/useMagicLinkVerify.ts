import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { authApi } from "../api/auth.api";

type Phase = "verifying" | "mfa" | "error";

/** Persists the session the same way every other login path does, then enters the app. */
const completeSignIn = (accessToken: string, user: unknown) => {
  localStorage.setItem("accessToken", accessToken);
  localStorage.setItem("user", JSON.stringify(user));
  toast.success("Welcome back!", { description: "You have successfully signed in." });
  window.location.href = "/dashboard";
};

/**
 * Landing step of passwordless login: spends the one-time link from the email.
 * The link is single use, so it must be sent exactly once (React StrictMode runs effects twice).
 */
export function useMagicLinkVerify(token: string | null) {
  const [phase, setPhase] = useState<Phase>(token ? "verifying" : "error");
  const [error, setError] = useState(token ? "" : "This sign-in link is missing its token.");
  const [mfaToken, setMfaToken] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [isMfaLoading, setIsMfaLoading] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    if (!token || started.current) return;
    started.current = true;

    authApi
      .verifyMagicLink({ token })
      .then((res) => {
        const { accessToken, user, requiresMfa, mfaToken: nextMfaToken } = res.data;
        if (requiresMfa) {
          setMfaToken(nextMfaToken);
          setPhase("mfa");
          return;
        }
        completeSignIn(accessToken, user);
      })
      .catch((err: Error) => {
        setError(err.message || "This sign-in link is invalid or has expired.");
        setPhase("error");
      });
  }, [token]);

  const onMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsMfaLoading(true);
    try {
      const res = await authApi.mfaLogin({ mfaToken, code: mfaCode });
      completeSignIn(res.data.accessToken, res.data.user);
    } catch (err) {
      toast.error((err as Error).message || "Invalid authenticator code.");
      setIsMfaLoading(false);
    }
  };

  return { phase, error, mfaCode, setMfaCode, onMfaSubmit, isMfaLoading };
}
