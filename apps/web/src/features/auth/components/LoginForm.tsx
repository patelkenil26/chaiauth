"use client";

import React from "react";
import Link from "next/link";
import { Loader2, Eye, EyeOff, Mail, Fingerprint } from "lucide-react";
import { useLogin } from "../hooks/useLogin";
import { Captcha } from "@/shared/components/ui/Captcha";

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
          <input
            type="text"
            placeholder="000000"
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
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        
        {/* Email Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-2">
            <label htmlFor={emailId} className="text-[0.8rem] font-medium text-text-soft">
              Email address
            </label>
          </div>
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between mb-2">
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
              className={`ca-input pr-11 ${errors.password ? "border-destructive" : ""}`}
              {...register("password")}
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-muted-foreground transition hover:bg-accent hover:text-foreground"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-[0.78rem] text-destructive ca-fade-up">
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
          className="ca-btn ca-btn-primary w-full"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Sign in
        </button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-3 text-[0.72rem] uppercase tracking-[0.14em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      {/* Social / Other Login Options */}
      <div className="space-y-2.5">
        <button
          type="button"
          onClick={onGoogleLogin}
          className="ca-btn ca-btn-ghost w-full flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
            <path fill="#4285F4" d="M22.5 12.3c0-.8-.1-1.5-.2-2.2H12v4.2h5.9a5 5 0 0 1-2.2 3.3v2.7h3.5c2.1-1.9 3.3-4.7 3.3-8Z" />
            <path fill="#34A853" d="M12 23c3 0 5.5-1 7.3-2.7l-3.5-2.7c-1 .7-2.3 1.1-3.8 1.1-2.9 0-5.4-2-6.3-4.6H2.1v2.8A11 11 0 0 0 12 23Z" />
            <path fill="#FBBC05" d="M5.7 14.1a6.6 6.6 0 0 1 0-4.2V7.1H2.1a11 11 0 0 0 0 9.8l3.6-2.8Z" />
            <path fill="#EA4335" d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.1-3.1A11 11 0 0 0 2.1 7.1l3.6 2.8C6.6 7.3 9.1 5.4 12 5.4Z" />
          </svg>
          Sign in with Google
        </button>

        <button
          type="button"
          onClick={onGithubLogin}
          className="ca-btn ca-btn-ghost w-full flex items-center justify-center gap-2"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
            <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
          Sign in with GitHub
        </button>
        
        <div className="grid grid-cols-2 gap-2.5">
          <button type="button" disabled title="Coming soon" className="ca-btn ca-btn-ghost opacity-60">
            <Mail className="h-4 w-4" /> Magic link <span className="ca-soon">Soon</span>
          </button>
          <button type="button" onClick={onPasskeyLogin} className="ca-btn ca-btn-ghost">
            <Fingerprint className="h-4 w-4" /> Passkey
          </button>
        </div>
      </div>
    </div>
  );
}
