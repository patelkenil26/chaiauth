import React from "react";
import Link from "next/link";
import { ArrowRight, Check, Circle } from "lucide-react";

interface HealthUser {
  isVerified: boolean;
  mfaEnabled: boolean;
  hasPassword?: boolean;
}

interface CheckItem {
  label: string;
  hint: string;
  done: boolean;
  href?: string;
}

/** Account health: a small checklist and progress ring built only from data the API already returns. */
export function AccountHealthCard({ user }: { user: HealthUser }) {
  const items: CheckItem[] = [
    { label: "Email verified", hint: "Needed for recovery and app access", done: user.isVerified },
    { label: "Two-factor authentication", hint: "Add an authenticator app", done: user.mfaEnabled, href: "/security" },
    // Social / passkey-only accounts have no password to set, so only ask when the API says it is unknown
    ...(user.hasPassword === false
      ? []
      : [{ label: "Password set", hint: "Protect your account with a strong password", done: true } as CheckItem]),
  ];

  const done = items.filter((i) => i.done).length;
  const percent = Math.round((done / items.length) * 100);
  const complete = done === items.length;

  return (
    <section className="ca-glass p-6">
      <div className="flex items-center gap-5">
        <div className="relative h-20 w-20 shrink-0" role="img" aria-label={`Account health ${percent} percent`}>
          <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.6" />
            <circle
              cx="18" cy="18" r="15.9" fill="none" strokeWidth="2.6" strokeLinecap="round"
              stroke={complete ? "var(--good)" : "var(--chai-bright)"}
              pathLength={100} strokeDasharray="100" strokeDashoffset={100 - percent}
              className="ca-ring-fill"
            />
          </svg>
          <span className="absolute inset-0 grid place-items-center text-lg font-bold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            {percent}%
          </span>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            {complete ? "You're fully protected" : "Strengthen your account"}
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {done} of {items.length} security steps done
          </p>
        </div>
      </div>

      <ul className="mt-5 divide-y divide-border/60 border-t border-border/60">
        {items.map((item) => (
          <li key={item.label} className="flex items-center gap-3 py-3">
            <span
              className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${
                item.done ? "bg-good/15 text-good" : "bg-secondary text-muted-foreground"
              }`}
            >
              {item.done ? <Check className="h-3.5 w-3.5" /> : <Circle className="h-3 w-3" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className={`text-sm font-medium ${item.done ? "text-text-soft" : "text-foreground"}`}>{item.label}</p>
              {!item.done && <p className="text-xs text-muted-foreground">{item.hint}</p>}
            </div>
            {!item.done && item.href && (
              <Link href={item.href} className="inline-flex items-center gap-1 text-xs font-semibold text-primary transition-all hover:gap-2">
                Set up <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
