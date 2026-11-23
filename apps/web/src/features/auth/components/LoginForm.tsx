"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Mail, Fingerprint } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { Captcha } from "@/shared/components/ui/Captcha";
import { MagicLinkForm } from "./MagicLinkForm";
import { AuthDivider, LastUsedBadge, SocialButtons } from "./SocialButtons";
import { getLastMethod, setLastMethod, type AuthMethod } from "../lastMethod";

export function LoginForm() {
  const {
    showPassword, setShowPassword,
    requiresMfa, setRequiresMfa,
    mfaCode, setMfaCode,
    onMfaSubmit, isMfaLoading,
    emailId, passId,
    register, setValue, errors,
    isLoading,
    onSubmit,
    onGoogleLogin,
    onGithubLogin,
    onPasskeyLogin
  } = useLogin();

  const [magicLinkMode, setMagicLinkMode] = useState(false);
  const [lastMethod, setLast] = useState<AuthMethod | null>(null);

  // Read after mount so server and client markup match.
  useEffect(() => setLast(getLastMethod()), []);

  const pickSocial = (method: "google" | "github", go: () => void) => () => {
    setLastMethod(method);
    go();
  };

  if (magicLinkMode) {
    return <MagicLinkForm onBack={() => setMagicLinkMode(false)} />;
  }

  if (requiresMfa) {
    return (
      <div className="space-y-6 ca-fade-up">
        <div>
          <h2 className="text-xl font-semibold mb-2">Two-Factor Authentication</h2>
          <p className="text-sm text-muted-foreground">
            Enter the 6-digit code from your authenticator app, or an 8-character backup code to continue.
          </p>
        </div>
        <form onSubmit={onMfaSubmit} className="space-y-4">
          <label htmlFor="mfa-code" className="block text-[0.8rem] font-medium text-text-soft">
            Authentication code
          </label>
          <input
            id="mfa-code"
            type="text"
            placeholder="000000"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={8}
            value={mfaCode}
            onChange={(e) => setMfaCode(e.target.value)}
            className="ca-input text-center tracking-widest font-mono text-lg"
            autoFocus
          />
          <button
            type="submit"
            disabled={(mfaCode.length !== 6 && mfaCode.length !== 8) || isMfaLoading}
            className="ca-btn ca-btn-primary w-full"
          >
            {isMfaLoading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Verify Code"}
          </button>
        </form>
        <button
          onClick={() => setRequiresMfa(false)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors w-full text-center"
        >
          Back to login
        </button>
      </div>
    );
  }

  return (
    <div>
      <SocialButtons
        onGoogle={pickSocial("google", onGoogleLogin)}
        onGithub={pickSocial("github", onGithubLogin)}
        lastUsed={lastMethod === "google" || lastMethod === "github" ? lastMethod : null}
      />
      <AuthDivider>or with email</AuthDivider>

      <form onSubmit={onSubmit} noValidate className="space-y-3.5">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label htmlFor={emailId} className="block text-[0.8rem] font-medium text-text-soft">
            Email address
          </label>
          <div className="relative">
            <input
              id={emailId}
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? `${emailId}-error` : undefined}
              className={`ca-input ${errors.email ? "border-destructive" : ""}`}
              {...register("email")}
            />
          </div>
          {errors.email && (
            <p id={`${emailId}-error`} role="alert" className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor={passId} className="text-[0.8rem] font-medium text-text-soft">
              Password
            </label>
            <Link href="/forgot-password" className="text-[0.78rem] text-muted-foreground transition hover:text-primary">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input
              id={passId}
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              aria-invalid={!!errors.password}
              aria-describedby={errors.password ? `${passId}-error` : undefined}
              className={`ca-input pr-11 ${errors.password ? "border-destructive" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-0 top-0 grid h-11 w-11 place-items-center rounded-[.85rem] text-muted-foreground transition hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p id={`${passId}-error`} role="alert" className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.password.message}
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

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="ca-btn ca-btn-primary ca-btn-lg w-full"
        >
          {isLoading &&<Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      <div className="mt-5 grid grid-cols-2 gap-2.5">
        <button type="button" onClick={() => { setLastMethod("magic"); setMagicLinkMode(true); }} className="ca-btn ca-btn-ghost relative !overflow-visible">
          <Mail className="h-4 w-4" /> Email link
          {lastMethod === "magic" && <LastUsedBadge />}
        </button>
        <button type="button" onClick={onPasskeyLogin} className="ca-btn ca-btn-ghost relative !overflow-visible">
          <Fingerprint className="h-4 w-4" /> Passkey
          {lastMethod === "passkey" && <LastUsedBadge />}
        </button>
      </div>
    </div>
  );
}
