import type { CSSProperties } from "react";
import { Check, Fingerprint, KeyRound, Lock, ShieldCheck, Smartphone } from "lucide-react";

/** Product mock for the home hero. Pure CSS motion, no client JS needed. */
export function HeroShowcase() {
  return (
    <div className="relative mx-auto mt-16 w-full max-w-5xl px-2 sm:px-0" aria-hidden>
      {/* glow behind the window */}
      <div className="absolute inset-x-10 -top-6 h-40 rounded-full bg-[var(--chai-mid)]/25 blur-3xl" />

      {/* browser window */}
      <div className="ca-glass relative overflow-hidden rounded-3xl">
        <div className="flex items-center gap-2 border-b border-border px-5 py-3.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
          <div className="ca-mono mx-auto flex items-center gap-2 rounded-lg bg-background/60 px-4 py-1 text-[0.7rem] text-muted-foreground">
            <Lock className="h-3 w-3 text-good" /> auth.chaiauth.com/authorize
          </div>
          <span className="w-12" />
        </div>

        <div className="grid gap-0 md:grid-cols-[1.1fr_1fr]">
          {/* left: consent */}
          <div className="border-b border-border p-6 sm:p-8 md:border-b-0 md:border-r">
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
                <KeyRound className="h-5 w-5" />
              </span>
              <div className="text-left">
                <p className="text-sm font-semibold text-foreground">Acme Dashboard wants access</p>
                <p className="text-xs text-muted-foreground">to your ChaiAuth account</p>
              </div>
            </div>

            <ul className="mt-6 space-y-2.5 text-left text-sm">
              {["Read your name and email", "Verify your identity (OpenID)", "Stay signed in for 30 days"].map((t, i) => (
                <li
                  key={t}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/40 px-3.5 py-2.5 text-text-soft"
                  style={{ animation: `ca-slide-in .6s cubic-bezier(.2,.7,.2,1) ${0.5 + i * 0.18}s both` }}
                >
                  <span className="grid h-5 w-5 place-items-center rounded-full bg-good/15 text-good">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <div className="ca-btn ca-btn-ghost !h-10 text-sm">Deny</div>
              <div className="ca-btn ca-btn-primary !h-10 text-sm">Allow access</div>
            </div>
          </div>

          {/* right: live security */}
          <div className="relative p-6 sm:p-8">
            <p className="ca-mono text-[0.65rem] uppercase tracking-[0.2em] text-muted-foreground">Two-step verification</p>

            <div className="mt-5 flex items-center gap-5">
              <div className="relative h-20 w-20 shrink-0">
                <svg viewBox="0 0 36 36" className="h-20 w-20 -rotate-90">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="var(--border)" strokeWidth="2.4" />
                  <circle
                    cx="18" cy="18" r="15.9" fill="none" stroke="var(--chai-bright)" strokeWidth="2.4" strokeLinecap="round"
                    pathLength={100} strokeDasharray="100"
                    style={{ animation: "ca-ring 30s linear infinite" }}
                  />
                </svg>
                <Smartphone className="absolute inset-0 m-auto h-6 w-6 text-primary" />
              </div>
              <div className="flex gap-1.5">
                {["4", "8", "2", "9", "1", "7"].map((d, i) => (
                  <span
                    key={i}
                    className="ca-mono grid h-11 w-8 place-items-center rounded-lg border border-border bg-background/60 text-lg font-semibold text-foreground"
                    style={{ animation: `ca-pop .5s cubic-bezier(.2,.7,.2,1) ${0.9 + i * 0.1}s both` }}
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-7 space-y-3">
              {[
                { icon: Fingerprint, t: "Passkey enrolled", s: "MacBook · Touch ID" },
                { icon: ShieldCheck, t: "Suspicious login blocked", s: "Moscow, RU" },
              ].map(({ icon: I, t, s }, i) => (
                <div
                  key={t}
                  className="flex items-center gap-3 rounded-xl border border-border bg-background/40 p-3 text-left"
                  style={{ animation: `ca-slide-in .6s cubic-bezier(.2,.7,.2,1) ${1.3 + i * 0.2}s both` }}
                >
                  <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><I className="h-4 w-4" /></span>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t}</p>
                    <p className="text-xs text-muted-foreground">{s}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating chips */}
      <div
        className="ca-float absolute -left-2 top-24 hidden items-center gap-3 rounded-2xl border border-border bg-card/90 p-3.5 pr-5 shadow-2xl backdrop-blur-xl sm:flex lg:-left-10"
        style={{ "--r": "-3deg" } as CSSProperties}
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-good/15 text-good"><ShieldCheck className="h-4 w-4" /></span>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">Session verified</p>
          <p className="text-xs text-muted-foreground">Chrome · Ahmedabad</p>
        </div>
      </div>
      <div
        className="ca-float-slow absolute -right-2 bottom-16 hidden items-center gap-3 rounded-2xl border border-border bg-card/90 p-3.5 pr-5 shadow-2xl backdrop-blur-xl sm:flex lg:-right-10"
        style={{ "--r": "3deg" } as CSSProperties}
      >
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary"><Fingerprint className="h-4 w-4" /></span>
        <div className="text-left">
          <p className="text-sm font-semibold text-foreground">Passwordless</p>
          <p className="text-xs text-muted-foreground">Signed in with passkey</p>
        </div>
      </div>
    </div>
  );
}
