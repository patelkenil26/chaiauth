"use client";

import React, { useId } from "react";
import Link from "next/link";
import { Loader2, ArrowLeft, MailCheck } from "lucide-react";
import { toast } from "sonner";
import { AuthLayout } from "@/shared/layouts/AuthLayout";
import { useForgotPassword } from "../hooks/useForgotPassword";
import { Captcha } from "@/shared/components/ui/Captcha";

export function ForgotPasswordPageContent() {
  const {
    sentEmail, setSentEmail,
    register, setValue, errors,
    isSubmitting,
    onSubmit
  } = useForgotPassword();

  const emailId = useId();

  const back = (
    <Link href="/login" className="inline-flex items-center gap-1.5 hover:text-foreground">
      <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
    </Link>
  );

  if (sentEmail) {
    return (
      <AuthLayout
        title="Check your inbox"
        subtitle={<>If an account exists for <span className="text-foreground">{sentEmail}</span>, a reset link is on its way.</>}
        footer={back}
      >
        <div className="ca-glass flex items-center gap-4 rounded-2xl p-5">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
            <MailCheck className="h-5 w-5" />
          </span>
          <p className="text-sm text-muted-foreground">The link expires in 15 minutes. Didn't get it? Check spam or try again.</p>
        </div>
        <div className="mt-4 grid gap-2.5">
          <button
            type="button"
            className="ca-btn ca-btn-ghost w-full"
            onClick={() => setSentEmail(null)}
          >
            Use a different email
          </button>
          <button
            type="button"
            className="text-center text-xs text-muted-foreground hover:text-primary transition-colors"
            onClick={() => {
              // Usually links to reset password page in a real flow
              toast.info("This would normally link to the email reset URL.");
            }}
          >
            Demo: open the reset page
          </button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a secure reset link."
      footer={back}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor={emailId} className="block mb-2 text-[0.8rem] font-medium text-text-soft">
            Email address
          </label>
          <div className="relative">
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              className={`ca-input ${errors.email ? "border-destructive" : ""}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Captcha */}
        <Captcha 
          onSuccess={(token) => setValue("captchaToken", token, { shouldValidate: true })} 
          onError={() => setValue("captchaToken", "", { shouldValidate: true })}
        />
        {errors.captchaToken && (
          <p className="text-[0.78rem] text-destructive text-center ca-fade-up -mt-2 mb-2">
            {errors.captchaToken.message}
          </p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="ca-btn ca-btn-primary w-full mt-4"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Send reset link
        </button>
      </form>
    </AuthLayout>
  );
}
