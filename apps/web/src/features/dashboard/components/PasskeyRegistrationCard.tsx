"use client";

import React from "react";
import { Fingerprint, Loader2 } from "lucide-react";
import { usePasskeys } from "../hooks/usePasskeys";
import { IconTile } from "@/shared/components/IconTile";

export function PasskeyRegistrationCard() {
  const { isLoading, registerPasskey } = usePasskeys();

  return (
    <section className="ca-glass rounded-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <IconTile>
          <Fingerprint className="h-5 w-5" />
        </IconTile>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            Passkeys & WebAuthn
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Enable passwordless sign in with your fingerprint, face scan, or screen lock.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled={isLoading}
        onClick={registerPasskey}
        className="ca-btn ca-btn-primary w-full sm:w-auto mt-2"
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        Add a Passkey
      </button>
    </section>
  );
}
