"use client";

import React from "react";
import { ShieldAlert, ArrowRight, Check, AlertTriangle, Loader2, CheckCircle2, Lock, Phone, Mail, User, KeyRound, RefreshCw } from "lucide-react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useConsent } from "../hooks/useConsent";

export function ConsentScreen() {
  const searchParams = useSearchParams();
  const {
    authData, allowedIdps, isInitLoading, isInitError,
    email, setEmail,
    password, setPassword,
    phone, setPhone,
    otp, setOtp,
    otpSent, otpLoading, handleSendOtp,
    username, setUsername,
    loading, isSuccess, redirectUrl,
    handleAction, handleFederatedLogin
  } = useConsent(searchParams);

  if (isInitLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Validating request...</p>
      </div>
    );
  }

  if (isInitError || !authData) {
    return (
      <div className="text-center py-12 space-y-4">
        <AlertTriangle className="h-10 w-10 text-destructive mx-auto" />
        <h2 className="font-display text-xl font-semibold">Invalid Request</h2>
        <p className="text-sm text-muted-foreground">This authorization link is invalid or expired.</p>
        <Link href="/dashboard" className="ca-btn ca-btn-primary mt-4">Go to Dashboard</Link>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="ca-fade-up text-center space-y-6 py-4">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-good/10 text-good">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Authorization Successful</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            You have successfully granted access to <strong className="text-foreground font-medium">{authData.clientName}</strong>.
          </p>
          <div className="mt-4 p-3 rounded-lg bg-accent/50 border border-border/50 text-xs text-muted-foreground ca-mono break-all text-left">
            Redirecting to: {redirectUrl}
          </div>
        </div>
        <div className="flex justify-center mt-4">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      </div>
    );
  }

  const appName = authData.clientName;
  const scopesList = authData.requestedScope ? authData.requestedScope.split(" ") : ["Access your profile"];

  return (
    <div className="ca-fade-up space-y-8">
      {/* App Logos & Connection */}
      <div className="flex items-center justify-center gap-6">
        <div className="flex items-center justify-center h-14 w-14 rounded-[14px] bg-accent shadow-sm border border-border/50 text-lg font-bold text-primary uppercase">
          {appName.substring(0, 2)}
        </div>
        <div className="text-muted-foreground/40">
          <ArrowRight className="h-5 w-5 animate-pulse" />
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center h-14 w-14 rounded-[14px] ca-btn-primary p-0 shadow-sm border border-border/50 text-primary-foreground">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <span className="text-[1.15rem] font-bold tracking-tight">
            Chai<span className="ca-text-chai">Auth</span>
          </span>
        </div>
      </div>

      <div className="text-center space-y-2">
        <h1 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
          Connect to {appName}
        </h1>
        <p className="text-sm leading-6 text-muted-foreground">
          <strong className="text-foreground font-medium">{appName}</strong> wants to access your ChaiAuth account.
        </p>
      </div>

      <div className="ca-glass rounded-xl p-5 space-y-4">
        <div className="flex items-center gap-2 border-b border-border/50 pb-3">
          <ShieldAlert className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold text-foreground">Requested access</span>
        </div>
        <ul className="space-y-3">
          {scopesList.map((scope: string, idx: number) => (
            <li key={idx} className="flex items-start gap-3 text-sm text-text-soft">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-good" />
              <span>{scope}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Identity Verification Section */}
      <div className="space-y-4 rounded-xl border border-border/50 bg-background/50 p-5">
        <div className="flex items-center gap-2 mb-2">
          <Lock className="h-4 w-4 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Verify your identity</p>
        </div>

        {/* Email + Password */}
        {allowedIdps.includes("email") && (
          <div className="space-y-3">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="email"
                placeholder="Email address"
                className="ca-input text-sm pl-9"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                className="ca-input text-sm pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Username + Password */}
        {allowedIdps.includes("username") && !allowedIdps.includes("email") && (
          <div className="space-y-3">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Username"
                className="ca-input text-sm pl-9"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="password"
                placeholder="Password"
                className="ca-input text-sm pl-9"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Phone + OTP */}
        {allowedIdps.includes("phone") && (
          <div className="space-y-3">
            {/* Divider if email is also present */}
            {allowedIdps.includes("email") && (
              <div className="flex items-center gap-3 my-1">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or via Phone</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}

            <div className="relative flex gap-2">
              <div className="relative flex-1">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="Phone number"
                  className="ca-input text-sm pl-9 w-full"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={otpSent}
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={otpLoading || otpSent}
                className="ca-btn border border-primary/50 text-primary hover:bg-primary/10 text-sm px-3 py-2 h-auto whitespace-nowrap transition-colors disabled:opacity-50 flex items-center gap-1.5"
              >
                {otpLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : otpSent ? (
                  <>
                    <Check className="h-3.5 w-3.5 text-good" />
                    <span className="text-good">Sent</span>
                  </>
                ) : (
                  "Send OTP"
                )}
              </button>
            </div>

            {otpSent && (
              <div className="space-y-2 ca-fade-up">
                <div className="flex gap-2 items-center">
                  {/* 6 individual OTP digit boxes */}
                  <div className="flex gap-2 flex-1 justify-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <input
                        key={i}
                        id={`otp-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        className="w-10 h-11 text-center text-lg font-bold ca-input p-0 rounded-lg border border-border/60 focus:border-primary focus:ring-2 focus:ring-primary/30 bg-background/70"
                        value={otp[i] || ""}
                        onChange={(e) => {
                          const val = e.target.value.replace(/\D/g, "");
                          const newOtp = otp.split("");
                          newOtp[i] = val;
                          setOtp(newOtp.join(""));
                          // Auto-focus next
                          if (val && i < 5) {
                            document.getElementById(`otp-${i + 1}`)?.focus();
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !otp[i] && i > 0) {
                            document.getElementById(`otp-${i - 1}`)?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs text-muted-foreground">OTP sent to your registered email. Valid for 10 mins.</p>
                  <button
                    type="button"
                    onClick={() => { 
                      setOtp(""); 
                      handleSendOtp(); 
                    }}
                    className="text-xs text-primary hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" /> Resend
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Google */}
        {allowedIdps.includes("google") && (
          <div className={allowedIdps.some(i => i !== "google") ? "pt-1" : ""}>
            {allowedIdps.some(i => i !== "google") && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleFederatedLogin("google")}
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
          </div>
        )}

        {/* GitHub */}
        {allowedIdps.includes("github") && (
          <div className={allowedIdps.some(i => i !== "github" && i !== "google") ? "pt-1" : ""}>
            {allowedIdps.some(i => i !== "github" && i !== "google") && !allowedIdps.includes("google") && (
              <div className="flex items-center gap-3 mb-3">
                <div className="flex-1 h-px bg-border/50" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border/50" />
              </div>
            )}
            <button
              type="button"
              onClick={() => handleFederatedLogin("github")}
              className="ca-btn ca-btn-ghost w-full flex items-center justify-center gap-2 mt-2"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden>
                <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
              </svg>
              Sign in with GitHub
            </button>
          </div>
        )}

        {(!allowedIdps || allowedIdps.length === 0) && (
          <p className="text-sm text-destructive">No identity providers enabled for this app.</p>
        )}
      </div>

      <div className="rounded-md bg-secondary/50 p-4 flex gap-3 text-xs text-muted-foreground border border-border/40">
        <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500" />
        <p>
          Only authorize apps you trust. By clicking Allow, you let this application access your information.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          onClick={() => handleAction("deny")}
          disabled={loading !== null}
          className="ca-btn ca-btn-ghost w-full sm:flex-1"
        >
          {loading === "deny" ? <Loader2 className="h-4 w-4 animate-spin" /> : "Cancel"}
        </button>
        <button
          onClick={() => handleAction("allow")}
          disabled={loading !== null}
          className="ca-btn ca-btn-primary w-full sm:flex-1"
        >
          {loading === "allow" ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : null}
          Allow access
        </button>
      </div>
    </div>
  );
}
