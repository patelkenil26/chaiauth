"use client";

import React from "react";
import { CheckCircle2, XCircle, MailCheck } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useVerifyEmail } from "../hooks/useVerifyEmail";

export function VerifyEmailPageContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const { isPending, isSuccess, isError } = useVerifyEmail(token);

  const showLoading = isPending && !!token;
  const showError = isError || !token;

  return (
    <div className="ca-fade-up text-center py-6">
      {showLoading && (
        <div className="flex flex-col items-center space-y-6">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-accent text-primary">
            <MailCheck className="h-10 w-10 relative z-10" />
            <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Verifying your email</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Please wait while we securely verify your email address.
            </p>
          </div>
        </div>
      )}

      {isSuccess && (
        <div className="flex flex-col items-center space-y-6 ca-fade-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-good/10 text-good">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Email verified!</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Your email address has been successfully verified. Your account is now fully secured.
            </p>
          </div>
          <Link href="/dashboard" className="ca-btn ca-btn-primary w-full mt-4">
            Continue to Dashboard
          </Link>
        </div>
      )}

      {showError && (
        <div className="flex flex-col items-center space-y-6 ca-fade-up">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <XCircle className="h-10 w-10" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">Verification failed</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              This verification link is invalid or has expired. Please request a new verification email from your dashboard.
            </p>
          </div>
          <Link href="/dashboard" className="ca-btn ca-btn-ghost w-full mt-4">
            Back to Dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
