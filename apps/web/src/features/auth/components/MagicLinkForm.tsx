"use client";

import React, { useId } from "react";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Captcha } from "@/shared/components/ui/Captcha";
import { useMagicLink } from "../hooks/useMagicLink";

/** Passwordless sign-in: ask for an email, then tell the user to check their inbox. */
export function MagicLinkForm({ onBack, defaultEmail }: { onBack: () => void; defaultEmail?: string }) {
  const { sentEmail, resetSent, register, setValue, errors, onSubmit, isLoading } = useMagicLink(defaultEmail);
  const emailId = useId();

  if (sentEmail) {
    return (
      <div className="space-y-5 ca-fade-up">
        <div className="ca-glass flex items-center gap-4 rounded-2xl p-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-accent text-primary">
            <MailCheck className="h-5 w-5" />
          </span>
          <div>
            <h2 className="font-semibold text-foreground">Check your inbox</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              If an account exists for <span className="text-foreground">{sentEmail}</span>, a sign-in link is on its way.
              It works once and expires in 15 minutes.
            </p>
          </div>
        </div>
        <button type="button" className="ca-btn ca-btn-ghost w-full" onClick={resetSent}>
          Use a different email
        </button>
        <button type="button" onClick={onBack} className="w-full text-center text-sm text-muted-foreground transition-colors hover:text-foreground">
          Back to sign in
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 ca-fade-up">
      <div>
        <h2 className="mb-2 text-xl font-semibold">Sign in with an email link</h2>
        <p className="text-sm text-muted-foreground">No password needed. We&apos;ll email you a one-time link.</p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor={emailId} className="mb-2 block text-[0.8rem] font-medium text-text-soft">
            Email address
          </label>
          <input
            id={emailId}
            type="email"
            autoComplete="email"
            autoFocus
            placeholder="you@company.com"
            aria-invalid={!!errors.email}
            className={`ca-input ${errors.email ? "border-destructive" : ""}`}
            {...register("email")}
          />
          {errors.email && <p className="ca-fade-up text-[0.78rem] text-destructive">{errors.email.message}</p>}
        </div>

        <Captcha
          onSuccess={(token) => setValue("captchaToken", token, { shouldValidate: true })}
          onError={() => setValue("captchaToken", "", { shouldValidate: true })}
        />
        {errors.captchaToken && (
          <p className="ca-fade-up -mt-2 mb-2 text-center text-[0.78rem] text-destructive">{errors.captchaToken.message}</p>
        )}

        <button type="submit" disabled={isLoading} className="ca-btn ca-btn-primary w-full">
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Send sign-in link
        </button>
      </form>

      <button
        type="button"
        onClick={onBack}
        className="flex w-full items-center justify-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
      </button>
    </div>
  );
}
