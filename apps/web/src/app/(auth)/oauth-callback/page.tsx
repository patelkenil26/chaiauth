"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import { authApi } from "@/features/auth/api/auth.api";
import { env } from "@/config/env";

function MfaVerifyStep({ mfaToken }: { mfaToken: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleVerify = async () => {
    if (code.length !== 6) return;
    setIsLoading(true);
    try {
      const res = await authApi.mfaLogin({ mfaToken, code }) as any;
      const { accessToken, user } = res.data;
      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      toast.success("Welcome back!");
      router.push("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Invalid code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="w-full max-w-sm p-8 ca-glass rounded-xl space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2">Two-Factor Authentication</h1>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app.
          </p>
        </div>
        
        <div className="flex gap-2 justify-center">
          {Array.from({ length: 6 }).map((_, i) => (
            <input
              key={i}
              id={`mfa-otp-${i}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={code[i] || ""}
              autoFocus={i === 0}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                const chars = code.split("");
                chars[i] = val;
                const next = chars.join("").slice(0, 6);
                setCode(next);
                if (val && i < 5) document.getElementById(`mfa-otp-${i + 1}`)?.focus();
              }}
              onKeyDown={(e) => {
                if (e.key === "Backspace" && !code[i] && i > 0) {
                  document.getElementById(`mfa-otp-${i - 1}`)?.focus();
                }
              }}
              onPaste={(e) => {
                e.preventDefault();
                const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
                setCode(pasted);
                document.getElementById(`mfa-otp-${Math.min(pasted.length, 5)}`)?.focus();
              }}
              className="w-10 h-12 text-center text-lg font-mono font-semibold rounded-md border border-border/60 bg-accent/40 text-foreground focus:border-primary focus:ring-2 focus:ring-primary/30 focus:outline-none transition-all"
            />
          ))}
        </div>

        <button
          onClick={handleVerify}
          disabled={code.length !== 6 || isLoading}
          className="ca-btn ca-btn-primary w-full"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Verify & Sign In
        </button>

        <button
          onClick={() => router.push("/login")}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
        >
          ← Back to login
        </button>
      </div>
    </div>
  );
}

function OAuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const effectRan = useRef(false);

  const requiresMfa = searchParams.get("requiresMfa") === "true";
  const mfaToken = searchParams.get("mfaToken") || "";

  useEffect(() => {
    if (requiresMfa) return; // Let MFA step handle it
    if (effectRan.current) return;
    effectRan.current = true;

    const channel = new BroadcastChannel("oauth_login_channel");

    // The server already set the httpOnly refresh cookie. Tokens are never passed in the URL:
    // exchange the cookie for an access token, then load the profile.
    const completeSignIn = async () => {
      const refresh = await axios.post(
        `${env.NEXT_PUBLIC_API_URL}/auth/refresh-token`,
        {},
        { withCredentials: true },
      );
      const accessToken: string | undefined = refresh.data?.data?.accessToken;
      if (!accessToken) throw new Error("No access token");

      const me = await axios.get(`${env.NEXT_PUBLIC_API_URL}/auth/me`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      return { accessToken, userStr: JSON.stringify(me.data?.data) };
    };

    completeSignIn()
      .then(({ accessToken, userStr }) => {
        // Hand the session to the window that opened this popup
        channel.postMessage({ type: "OAUTH_SUCCESS", accessToken, userStr });
        setTimeout(() => { window.close(); }, 150);
        // If this was not a popup (window.close is a no-op), finish in this tab
        setTimeout(() => {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("user", userStr);
          toast.success("Successfully signed in!");
          router.push("/dashboard");
        }, 500);
      })
      .catch(() => {
        channel.postMessage({ type: "OAUTH_FAILED" });
        setTimeout(() => { window.close(); }, 150);
        setTimeout(() => {
          toast.error("OAuth login failed. Please try again.");
          router.push("/login");
        }, 500);
      });
  }, [searchParams, router, requiresMfa]);

  if (requiresMfa && mfaToken) {
    return <MfaVerifyStep mfaToken={mfaToken} />;
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center justify-center space-y-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground font-medium">Completing sign in...</p>
      </div>
    </div>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    }>
      <OAuthCallbackContent />
    </Suspense>
  );
}
