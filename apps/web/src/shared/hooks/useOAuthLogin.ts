import { useEffect } from "react";
import { toast } from "sonner";
import { env } from "@/config/env";

/**
 * Shared hook for Google OAuth popup flow.
 * Used by both LoginForm and RegisterForm — avoids duplicating
 * BroadcastChannel listener + popup window logic.
 */
export function useOAuthLogin() {
  useEffect(() => {
    const channel = new BroadcastChannel("oauth_login_channel");

    channel.onmessage = (e: MessageEvent) => {
      if (e.data?.type === "OAUTH_SUCCESS") {
        localStorage.setItem("accessToken", e.data.accessToken);
        localStorage.setItem("user", e.data.userStr);
        toast.success("Successfully signed in!");
        window.location.href = "/dashboard";
      } else if (e.data?.type === "OAUTH_FAILED") {
        toast.error("OAuth login failed. Please try again.");
      }
    };

    return () => channel.close();
  }, []);

  const openGooglePopup = () => {
    const url = `${env.NEXT_PUBLIC_API_URL}/auth/providers/google`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(url, "Google Login", `width=${width},height=${height},left=${left},top=${top}`);
  };

  const openGithubPopup = () => {
    const url = `${env.NEXT_PUBLIC_API_URL}/auth/providers/github`;
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    window.open(url, "GitHub Login", `width=${width},height=${height},left=${left},top=${top}`);
  };

  return { openGooglePopup, openGithubPopup };
}
