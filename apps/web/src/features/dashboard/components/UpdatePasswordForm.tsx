"use client";

import React from "react";
import { KeyRound, Eye, EyeOff, Loader2 } from "lucide-react";
import { PasswordRules } from "@/shared/components/PasswordRules";

import { useUpdatePassword } from "../hooks/useUpdatePassword";

export function UpdatePasswordForm() {
  const {
    showCurPass, setShowCurPass,
    showNextPass, setShowNextPass,
    curPassId, nextPassId,
    register, errors, nextPassword,
    isSubmitting,
    onSubmit
  } = useUpdatePassword();

  return (
    <form onSubmit={onSubmit} noValidate className="ca-glass space-y-4 rounded-md p-6">
      <div className="flex items-center gap-4 mb-6">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-md bg-accent text-primary">
          <KeyRound className="h-5 w-5" />
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Password</h2>
          <p className="text-sm text-muted-foreground mt-1">Use at least six characters.</p>
        </div>
      </div>
      
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor={curPassId} className="block mb-2 text-[0.8rem] font-medium text-text-soft">Current password</label>
          <div className="relative">
            <input
              id={curPassId}
              type={showCurPass ? "text" : "password"}
              className={`ca-input pr-11 ${errors.currentPassword ? "border-destructive" : ""}`}
              {...register("currentPassword")}
            />
            <button
              type="button"
              onClick={() => setShowCurPass((s) => !s)}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {showCurPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.currentPassword && <p className="text-[0.78rem] text-destructive">{errors.currentPassword.message}</p>}
        </div>
        
        <div className="space-y-1.5">
          <label htmlFor={nextPassId} className="block mb-2 text-[0.8rem] font-medium text-text-soft">New password</label>
          <div className="relative">
            <input
              id={nextPassId}
              type={showNextPass ? "text" : "password"}
              className={`ca-input pr-11 ${errors.newPassword ? "border-destructive" : ""}`}
              {...register("newPassword")}
            />
            <button
              type="button"
              onClick={() => setShowNextPass((s) => !s)}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {showNextPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.newPassword && <p className="text-[0.78rem] text-destructive">{errors.newPassword.message}</p>}
        </div>
      </div>
      
      <button type="submit" disabled={isSubmitting} className="ca-btn ca-btn-primary mt-2">
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Update password
      </button>
    </form>
  );
}
