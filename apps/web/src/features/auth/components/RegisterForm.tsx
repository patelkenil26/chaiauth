"use client";

import React from "react";
import { Controller } from "react-hook-form";
import Link from "next/link";
import { Loader2, Eye, EyeOff, ShoppingBag, Store, Check } from "lucide-react";
import { PasswordRules } from "@/shared/components/PasswordRules";
import { Captcha } from "@/shared/components/ui/Captcha";
import { AuthDivider, SocialButtons } from "./SocialButtons";

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
      <SocialButtons onGoogle={onGoogleLogin} onGithub={onGithubLogin} />
      <AuthDivider>or with email</AuthDivider>

      <form onSubmit={onSubmit} noValidate className="space-y-3.5">
        {/* Full Name */}
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="block text-[0.8rem] font-medium text-text-soft">
            Full name
          </label>
          <div className="relative">
            <input
              id={nameId}
              type="text"
              autoComplete="name"
              placeholder="e.g. John Doe"
              aria-invalid={!!errors.name}
              aria-describedby={errors.name ? `${nameId}-error` : undefined}
              className={`ca-input ${errors.name ? "border-destructive" : ""}`}
              {...register("name")}
            />
          </div>
          {errors.name && (
            <p id={`${nameId}-error`} role="alert" className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.name.message}
            </p>
          )}
        </div>

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
          <label htmlFor={passId} className="block text-[0.8rem] font-medium text-text-soft">
            Password
          </label>
          <div className="relative">
            <input
              id={passId}
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              placeholder="Create a password"
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
          {errors.password ? (
            <p id={`${passId}-error`} role="alert" className="text-[0.78rem] text-destructive ca-fade-up">
              {errors.password.message}
            </p>
          ) : currentPassword ? (
            <PasswordRules value={currentPassword} />
          ) : null}
        </div>

        {/* Role / Account Type Selection */}
        <fieldset className="space-y-1.5">
          <legend className="mb-1.5 text-[0.8rem] font-medium text-text-soft">I am a</legend>
          <Controller
            control={control}
            name="role"
            render={({ field }) => (
              <div role="radiogroup" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-secondary/40 p-1">
                {roles.map(({ id, label, desc, icon: Icon }) => {
                  const active = field.value === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      title={desc}
                      onClick={() => field.onChange(id)}
                      className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                        active
                          ? "bg-background text-foreground shadow-sm ring-1 ring-primary/40"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <Icon className={`h-4 w-4 ${active ? "text-primary" : ""}`} />
                      {label}
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
          className="ca-btn ca-btn-primary ca-btn-lg w-full"
        >
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          Create account
        </button>
        <p className="text-center text-xs text-muted-foreground">
          By continuing you agree to the <Link href="/terms" className="hover:text-primary underline underline-offset-2">Terms</Link> and <Link href="/privacy" className="hover:text-primary underline underline-offset-2">Privacy Policy</Link>.
        </p>
      </form>
    </div>
  );
}
