"use client";

import { useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * The API redirects failed social sign-ins (and rate-limited OAuth attempts) to `/login?error=...`.
 * Show that message once, as a toast.
 */
export function LoginErrorToast() {
  const searchParams = useSearchParams();
  const shown = useRef(false);

  useEffect(() => {
    const message = searchParams.get("error");
    if (message && !shown.current) {
      shown.current = true;
      toast.error(message);
    }
  }, [searchParams]);

  return null;
}
