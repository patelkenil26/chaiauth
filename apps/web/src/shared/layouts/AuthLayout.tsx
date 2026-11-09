"use client";

import React, { ReactNode } from "react";
import { Lock, ShieldCheck, KeyRound, Fingerprint } from "lucide-react";

import { Logo } from "@/shared/components/Logo";

function AnimatedSecurityChecks() {
  const LOGS = [
    { event: "Successful login", user: "kenil@chaiauth.com", loc: "Ahmedabad, IN", time: "Just now", icon: ShieldCheck, color: "text-good", bg: "bg-good/10", rowBg: "from-good/5 hover:from-good/10" },
    { event: "Passkey added", user: "sarah@acme.corp", loc: "New York, US", time: "2m ago", icon: Fingerprint, color: "text-blue-400", bg: "bg-blue-400/10", rowBg: "from-blue-400/5 hover:from-blue-400/10" },
    { event: "Blocked attempt", user: "admin@chaiauth.com", loc: "Moscow, RU", time: "5m ago", icon: Lock, color: "text-destructive", bg: "bg-destructive/10", rowBg: "from-destructive/5 hover:from-destructive/10" },
    { event: "Token rotated", user: "system-cron", loc: "AWS us-east-1", time: "8m ago", icon: KeyRound, color: "text-purple-400", bg: "bg-purple-400/10", rowBg: "from-purple-400/5 hover:from-purple-400/10" },
    { event: "Session revoked", user: "unknown_device", loc: "Beijing, CN", time: "12m ago", icon: ShieldCheck, color: "text-orange-400", bg: "bg-orange-400/10", rowBg: "from-orange-400/5 hover:from-orange-400/10" },
  ];

  return (
    <div className="relative pt-8 border-t border-border/40">
      <style>{`
        @keyframes scroll-y {
          0% { transform: translateY(0); }
          100% { transform: translateY(calc(-50% - 0.5rem)); }
        }
        .animate-scroll-y {
          animation: scroll-y 20s linear infinite;
        }
        .animate-scroll-y:hover {
          animation-play-state: paused;
        }
        @keyframes scanline {
          0% { top: 0%; opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scanline {
          animation: scanline 4s ease-in-out infinite;
        }
      `}</style>
      
      <div className="flex items-center justify-between mb-5">
        <p className="ca-mono text-[0.65rem] uppercase tracking-widest text-muted-foreground flex items-center gap-2">
          Live Security Audit
        </p>
        <span className="flex items-center gap-1.5 rounded-full bg-good/10 px-2 py-0.5 text-[0.65rem] text-good border border-good/20 shadow-[0_0_10px_color-mix(in_oklab,var(--good)_30%,transparent)]">
          <span className="h-1.5 w-1.5 rounded-full bg-good animate-pulse shadow-[0_0_5px_var(--good)]" /> Monitoring
        </span>
      </div>
      
      {/* Container for scrolling logs */}
      <div className="relative h-[220px] overflow-hidden rounded-xl border border-white/5 bg-[#050505]/50 shadow-inner">
        {/* Top and Bottom Fading Gradients */}
        <div className="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-[#050505] to-transparent z-10 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#050505] to-transparent z-10 pointer-events-none" />
        
        {/* Scanning Line */}
        <div className="animate-scanline absolute left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-primary/50 to-transparent z-20 shadow-[0_0_15px_var(--primary)] pointer-events-none" />

        {/* Scrolling Content */}
        <div className="animate-scroll-y flex flex-col gap-2.5 px-3 py-2">
          {[...LOGS, ...LOGS].map((log, i) => (
            <div 
              key={i} 
              className={`group relative flex items-center justify-between rounded-lg border border-white/5 bg-gradient-to-r ${log.rowBg} to-transparent p-3 pr-4 transition-all hover:border-white/10`}
            >
              <div className="flex items-center gap-3.5">
                <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-md ${log.bg} ${log.color}`}>
                  <log.icon className="h-4 w-4" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[0.75rem] font-semibold text-foreground">{log.event}</span>
                  <span className="text-[0.65rem] text-muted-foreground mt-0.5">{log.user}</span>
                </div>
              </div>
              <div className="flex flex-col items-end text-right">
                <span className="text-[0.7rem] font-medium text-text-soft">{log.time}</span>
                <span className="text-[0.65rem] text-muted-foreground mt-0.5">{log.loc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function TrustPanel() {
  return (
    <div className="relative flex h-full min-h-screen flex-col justify-center gap-12 p-12 xl:p-16">
      <div className="ca-aurora"><span /><span /><span /></div>
      <div className="relative">
        <span className="ca-mono text-[0.7rem] uppercase tracking-[0.2em] text-primary">Identity infrastructure</span>
        <h2 className="mt-4 max-w-md text-[2.6rem] font-semibold leading-[1.05] tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>
          One login. <span className="ca-text-chai-anim">Every app</span> you trust.
        </h2>
        <p className="mt-4 max-w-sm text-muted-foreground">
          OpenID Connect sign-in for your products, with secure sessions and granular consent.
        </p>
      </div>

      <div className="relative ca-glass ca-glow-border ca-float-slow mx-auto w-full max-w-md rounded-2xl p-5">
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-accent text-primary">
              <ShieldCheck className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-semibold">Session verified</p>
              <p className="text-xs text-muted-foreground">Chrome · Ahmedabad, IN</p>
            </div>
          </div>
          <span className="flex items-center gap-1.5 rounded-full bg-accent px-2.5 py-1 text-[0.7rem] text-good">
            <span className="ca-dot-live" /> Live
          </span>
        </div>
        <ul className="space-y-3 pt-4 text-sm">
          {[
            { icon: KeyRound, t: "Authorization code + PKCE", s: "Enabled" },
            { icon: Lock, t: "Token rotation", s: "Every 15 min" },
            { icon: Fingerprint, t: "Passkeys", s: "Enabled" },
          ].map(({ icon: I, t, s }) => (
            <li key={t} className="flex items-center justify-between">
              <span className="flex items-center gap-2.5 text-text-soft">
                <I className="h-4 w-4 text-muted-foreground" /> {t}
              </span>
              <span className="ca-mono text-xs text-muted-foreground">{s}</span>
            </li>
          ))}
        </ul>
      </div>

      <AnimatedSecurityChecks />
    </div>
  );
}

/** Split auth layout: form on the left, brand/trust panel on the right. */
export function AuthLayout({
  title,
  subtitle,
  children,
  footer
}: {
  title?: string;
  subtitle?: ReactNode;
  children: ReactNode;
  footer?: ReactNode
}) {
  return (
    <div className="ca-root dark relative grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
      <div className="ca-aurora lg:hidden"><span /><span /><span /></div>
      <div className="ca-grid pointer-events-none absolute inset-0" />
      <main className="relative flex min-h-screen flex-col px-5 py-8 sm:px-10">
        <Logo />
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="ca-glass ca-fade-up w-full max-w-[440px] rounded-3xl p-7 sm:p-9">
            <div className="ca-stagger">
              {title && <h1 className="text-[1.9rem] font-semibold leading-tight tracking-tight" style={{ fontFamily: '"Sora", sans-serif' }}>{title}</h1>}
              {subtitle && <p className="mt-2 text-[0.95rem] text-muted-foreground">{subtitle}</p>}
              <div className="mt-8">{children}</div>
              {footer && <div className="mt-8 text-center text-sm text-muted-foreground">{footer}</div>}
            </div>
          </div>
        </div>
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Lock className="h-3 w-3" /> Encrypted in transit · Sessions stored in httpOnly cookies
        </p>
      </main>
      <aside className="relative hidden overflow-hidden border-l border-border lg:block">
        <TrustPanel />
      </aside>
    </div>
  );
}
