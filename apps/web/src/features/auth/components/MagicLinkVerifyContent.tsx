"use client";

import React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, XCircle } from "lucide-react";
import { useMagicLinkVerify } from "../hooks/useMagicLinkVerify";

export function MagicLinkVerifyContent() {
  const token = useSearchParams().get("token");
  const { phase, error, mfaCode, setMfaCode, onMfaSubmit, isMfaLoading } = useMagicLinkVerify(token);

  if (phase === "mfa") {
    return (
      <div className="space-y-6 ca-fade-up">
        <div>
          <h2 className="mb-2 text-xl font-semibold">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">
            Link verified. Enter the 6-digit code from your authenticator app, or an 8-character backup code.
          </p>
        </div>
        <form onSubmit={onMfaSubmit} className="space-y-4">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={8}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value.trim())}
            className="ca-input text-center font-mono text-lg tracking-widest"
            autoFocus
          />
          <button
            type="submit"
            disabled={(mfaCode.length !== 6 && mfaCode.length !== 8) || isMfaLoading}
            className="ca-btn ca-btn-primary w-full"
          >
            {isMfaLoading ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : "Verify Code"}
          </button>
        </form>
      </div>
    );
  }

  if (phase === "error") {
    return (
      <div className="flex flex-col items-center space-y-6 py-6 text-center ca-fade-up">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <XCircle className="h-10 w-10" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Link didn&apos;t work</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">{error}</p>
        </div>
        <Link href="/login" className="ca-btn ca-btn-primary mt-2 w-full">
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center space-y-6 py-6 text-center ca-fade-up" role="status" aria-live="polite">
      <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary">
        <ShieldCheck className="relative z-10 h-10 w-10" />
        <div className="absolute inset-0 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
      <div>
        <h2 className="font-display text-2xl font-semibold text-foreground">Signing you in</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Verifying your one-time link…</p>
      </div>
    </div>
  );
}
