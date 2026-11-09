"use client";

import React from "react";
import { Controller } from "react-hook-form";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ShoppingBag, Store, Check } from "lucide-react";
import { PasswordRules } from "@/shared/components/PasswordRules";
import { Captcha } from "@/shared/components/ui/Captcha";

import { useRegister } from "../hooks/useRegister";

export function RegisterForm() {
  const {
    showPassword, setShowPassword,
    nameId, emailId, passId,
    register, control, setValue, errors, currentPassword,
    isLoading,
    onSubmit,
    onGoogleLogin,
    onGithubLogin
  } = useRegister();

  const roles = [
    { id: "customer" as const, label: "Customer", desc: "Shop and sign in to apps", icon: ShoppingBag },
    { id: "seller" as const, label: "Seller", desc: "Sell and manage a store", icon: Store },
  ];

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="space-y-4">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="block mb-2 text-[0.8rem] font-medium text-text-soft">
            Full name
          </label>
          <div className="relative">
            <input
              id={nameId}
              type="text"
              autoComplete="name"
              placeholder="e.g. John Doe"
              aria-invalid={!!errors.name}
              className={`ca-input ${errors.name ? "border-destructive" : ""}`}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.name.message}
            </p>
          )}
        </div>

        {/* Email Field */}
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

        {/* Password Field */}
        <div className="space-y-1.5">
          <label htmlFor={passId} className="block mb-2 text-[0.8rem] font-medium text-text-soft">
            Password
          </label>
          <div className="relative">
            <input
              id={passId}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="At least 6 characters"
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
          {errors.password ? (
            <p className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.password.message}
            </p>
          ) : (
            <PasswordRules value={currentPassword || ""} />
          )}
        </div>

        {/* Role / Account Type Selection */}
        <fieldset className="space-y-1.5 pt-2">
          <legend className="mb-1.5 text-[0.8rem] font-medium text-text-soft">Account type</legend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div role="radiogroup" className="grid grid-cols-2 gap-2.5">
                {roles.map(({ id, label, desc, icon: Icon }) => {
                  const active = field.value === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => field.onChange(id)}
                      className={`rounded-xl border p-3 text-left transition-all active:scale-[0.99] ${
                        active
                          ? "border-primary bg-accent shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_16%,transparent)]"
                          : "border-border hover:bg-secondary"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : "text-muted-foreground"}`} />
                      <p className="mt-2 text-sm font-semibold">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </button>
                  );
                })}
              </div>
            )}
          />
        </fieldset>

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
          className="ca-btn ca-btn-primary w-full mt-4"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
        <p className="text-center text-xs text-muted-foreground mt-4">
          By continuing you agree to the <Link href="/terms" className="hover:text-primary underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="hover:text-primary underline underline-offset-2">Privacy Policy</Link>.
        </p>
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
      </div>
    </div>
  );
}
