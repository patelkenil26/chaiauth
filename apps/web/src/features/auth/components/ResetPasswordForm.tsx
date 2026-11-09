"use client";

import React from "react";
import { KeyRound, Loader2, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { PasswordRules } from "@/shared/components/PasswordRules";
import { useSearchParams } from "next/navigation";
import { useResetPassword } from "../hooks/useResetPassword";

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const {
    isSuccess,
    showPassword, setShowPassword,
    showConfirm, setShowConfirm,
    passId, confirmId,
    register, errors, currentPassword,
    isSubmitting,
    onSubmit
  } = useResetPassword(token);

  if (isSuccess) {
    return (
      <div className="ca-fade-up text-center space-y-6 py-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good/10 text-good">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Password reset complete</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Your password has been successfully updated. You can now use your new password to sign in.
          </p>
        </div>
        <Link href="/login" className="ca-btn ca-btn-primary w-full mt-2">
          Return to login
        </Link>
      </div>
    );
  }

  return (
    <div className="ca-fade-up space-y-8">
      <div className="space-y-3">
        <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary shadow-sm border border-border/50">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
          Set new password
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          Must be at least 8 characters. Please choose a strong password that you haven't used before.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor={passId} className="block mb-2 text-sm font-medium text-text-soft">
            New password
          </label>
          <div className="relative">
            <input
              id={passId}
              type={showPassword ? "text" : "password"}
              placeholder="••••••••"
              className={`ca-input pr-11 ${errors.password ? "border-destructive focus:ring-destructive" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password ? (
            <p className="mt-1.5 text-[0.8rem] text-destructive">{errors.password.message}</p>
          ) : (
            <PasswordRules value={currentPassword || ""} />
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor={confirmId} className="block mb-2 text-sm font-medium text-text-soft">
            Confirm new password
          </label>
          <div className="relative">
            <input
              id={confirmId}
              type={showConfirm ? "text" : "password"}
              placeholder="••••••••"
              className={`ca-input pr-11 ${errors.confirmPassword ? "border-destructive focus:ring-destructive" : ""}`}
              {...register("confirmPassword")}
            />
            <button
              type="button"
              onClick={() => setShowConfirm((s) => !s)}
              className="absolute right-1.5 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="mt-1.5 text-[0.8rem] text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isSubmitting} className="ca-btn ca-btn-primary w-full mt-2">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Updating...
            </>
          ) : (
            "Reset password"
          )}
        </button>
      </form>
    </div>
  );
}
