"use client";

import React, { ReactNode } from "react";
import Link from "next/link";
import { Lock, ShieldCheck, KeyRound, Fingerprint, RefreshCw, MonitorSmartphone, UserPlus, Code2, ArrowLeft } from "lucide-react";

import { Logo } from "@/shared/components/Logo";
import { ThemeToggle } from "@/shared/components/ThemeToggle";

type Variant = "login" | "signup";

const panels: Record<Variant, {
  eyebrow: string;
  title: ReactNode;
  text: string;
  points: { icon: typeof KeyRound; title: string; text: string }[];
}> = {
  login: {
    eyebrow: "Welcome back",
    title: <>Pick up right <span className="ca-text-chai">where you left off</span>.</>,
    text: "Your apps, sessions and security settings are one sign-in away.",
    points: [
      { icon: Fingerprint, title: "Sign in faster", text: "Use a passkey or an email link, no password needed." },
      { icon: MonitorSmartphone, title: "Stay in control", text: "Review active sessions and revoke any device." },
      { icon: RefreshCw, title: "Short-lived sessions", text: "Rotating tokens keep your account safe." },
    ],
  },
  signup: {
    eyebrow: "Get started free",
    title: <>Add secure sign-in to <span className="ca-text-chai">your app</span> today.</>,
    text: "Create an account, register an app and start accepting users in minutes.",
    points: [
      { icon: UserPlus, title: "1. Create your account", text: "Free to start, no credit card required." },
      { icon: Code2, title: "2. Register an app", text: "Get a client ID and secret from the developer console." },
      { icon: KeyRound, title: "3. Connect with OIDC", text: "Works with any OpenID Connect library, PKCE included." },
    ],
  },
};

function TrustPanel({ variant }: { variant: Variant }) {
  const { eyebrow, title, text, points } = panels[variant];
  return (
    <div className="relative flex h-full min-h-screen flex-col justify-center gap-10 p-12 xl:p-16">
      <div className="ca-aurora"><span /><span /><span /></div>
      <div className="relative">
        <span className="ca-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary">{eyebrow}</span>
        <h2 className="mt-4 max-w-md text-4xl font-bold leading-[1.1] tracking-tight xl:text-[2.6rem]" style={{ fontFamily: '"Sora", sans-serif' }}>
          {title}
        </h2>
        <p className="mt-4 max-w-sm text-muted-foreground">{text}</p>
      </div>

      <ul className="relative max-w-md space-y-5">
        {points.map(({ icon: Icon, title, text }) => (
          <li key={title} className="flex items-start gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-border bg-accent text-primary">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-foreground">{title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{text}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="relative flex items-center gap-2 text-xs text-muted-foreground">
        <ShieldCheck className="h-4 w-4 text-good" /> Protected by bot detection and rate limiting
      </p>
    </div>
  );
}

/** Split auth layout: form on the left, brand/trust panel on the right. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  variant = "login",
}: {
  variant?: Variant;
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode
}) {
  return (
    <div className="ca-root relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="ca-aurora lg:hidden"><span /><span /><span /></div>
      <div className="ca-grid pointer-events-none absolute inset-0 opacity-60" />
      <main className="relative flex min-h-screen flex-col px-5 py-4 sm:px-10">
        <div className="flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-2">
            <Link href="/" className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
              <ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back to site</span><span className="sm:hidden">Home</span>
            </Link>
            <ThemeToggle />
          </div>
        </div>
        <div className="flex flex-1 items-center justify-center py-4">
          <div className="ca-glass ca-fade-up w-full max-w-[420px] rounded-3xl p-6 sm:px-8 sm:py-7">
            <div className="ca-stagger">
              {title && <h1 className="text-[1.75rem] font-bold leading-tight tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>{title}</h1>}
              {subtitle && <p className="mt-2 text-sm text-text-soft">{subtitle}</p>}
              <div className="mt-5">{children}</div>
              {footer && <div className="mt-5 border-t border-border/60 pt-4 text-center text-sm text-muted-foreground">{footer}</div>}
            </div>
          </div>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Encrypted in transit · httpOnly session cookies
        </p>
      </main>
      <aside className="relative hidden overflow-hidden border-l border-border lg:block">
        <TrustPanel variant={variant} />
      </aside>
    </div>
  );
}
