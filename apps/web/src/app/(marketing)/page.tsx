import Link from "next/link";
import { ArrowRight, Check, Plus } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { features, stats, faqs } from "@/features/marketing/content";
import { CtaBanner, Section } from "@/features/marketing/components/blocks";
import { HeroShowcase } from "@/features/marketing/components/HeroShowcase";
import { Reveal } from "@/features/marketing/components/Reveal";
import { SpotlightCard } from "@/features/marketing/components/SpotlightCard";

export const metadata = constructMetadata({
  description: "ChaiAuth is an OpenID Connect identity provider with passkeys, MFA, social login and a developer console.",
});

const steps = [
  { n: "01", title: "Create an app", text: "Register your application in the developer console and add your callback URLs." },
  { n: "02", title: "Connect with OIDC", text: "Point any OpenID Connect library at our discovery URL with your client ID and secret." },
  { n: "03", title: "Let users in", text: "Users sign in with password, social, MFA or passkeys and approve access on a clear consent screen." },
];

const works = ["Next.js", "Auth.js", "Express", "Passport.js", "Remix", "SvelteKit", "Django", "Laravel", "Spring Security", "ASP.NET"];

// bento layout: [feature index, grid span classes]
const bento: [number, string][] = [
  [4, "lg:col-span-4"], // OIDC provider
  [3, "lg:col-span-2"], // Passkeys
  [2, "lg:col-span-2"], // MFA
  [1, "lg:col-span-2"], // Social
  [5, "lg:col-span-2"], // Console
];

export default function HomePage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="ca-aurora"><span /><span /><span /></div>
        <div className="ca-grid pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-6xl px-5 pb-10 pt-20 text-center sm:px-8 sm:pt-28">
          <Reveal>
            <span className="ca-eyebrow">
              <span className="ca-dot-live" /> OpenID Connect · Passkeys · MFA
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mx-auto mt-7 max-w-4xl text-[2.6rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl">
              Authentication that <span className="ca-text-chai-anim">feels warm</span>, and stays secure.
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-text-soft sm:text-lg">
              ChaiAuth is the identity provider for your apps. Passwords, social login, authenticator apps and
              passkeys, with a developer console to manage it all.
            </p>
          </Reveal>
          <Reveal delay={270}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="ca-btn ca-btn-primary ca-btn-lg">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="ca-btn ca-btn-ghost ca-btn-lg">Read the docs</Link>
            </div>
            <p className="mt-5 text-xs text-muted-foreground">Free to start · Standards-based · No lock-in</p>
          </Reveal>
          <Reveal delay={380}>
            <HeroShowcase />
          </Reveal>
        </div>
      </section>

      {/* WORKS WITH */}
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-8">
        <p className="text-center text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Plugs into any OpenID Connect library
        </p>
        <div className="ca-marquee mt-6">
          <div className="ca-marquee-track">
            {[...works, ...works].map((w, i) => (
              <span
                key={`${w}-${i}`}
                className="whitespace-nowrap rounded-full border border-border bg-secondary/40 px-5 py-2 text-sm font-medium text-text-soft"
              >
                {w}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-5 pt-14 sm:px-8">
        <Reveal>
          <div className="ca-glass grid grid-cols-2 gap-6 rounded-3xl p-6 sm:p-8 md:grid-cols-4 md:gap-0 md:divide-x md:divide-border">
            {stats.map((s) => (
              <div key={s.value} className="text-center">
                <div className="font-display text-2xl font-bold ca-text-chai sm:text-4xl">{s.value}</div>
                <div className="mt-1.5 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* BENTO FEATURES */}
      <Section
        eyebrow="Features"
        title="Everything sign-in needs"
        subtitle="The pieces you would otherwise stitch together yourself, built in and working together."
      >
        <div className="grid gap-4 lg:grid-cols-6">
          {bento.map(([idx, span], i) => {
            const { icon: Icon, title, description } = features[idx];
            const big = span.includes("col-span-4");
            return (
              <Reveal key={title} delay={i * 80} className={span}>
                <SpotlightCard className="h-full rounded-3xl p-7">
                  <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/15 text-primary ring-1 ring-primary/25">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mt-6 text-xl font-semibold text-foreground">{title}</h3>
                  <p className="mt-2.5 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
                  {big && (
                    <div className="ca-mono mt-6 flex flex-wrap gap-2 text-[0.7rem] text-text-soft">
                      {["/.well-known/openid-configuration", "/o/authorize", "/o/token", "/o/userinfo"].map((p) => (
                        <span key={p} className="rounded-md border border-border bg-background/50 px-2.5 py-1">{p}</span>
                      ))}
                    </div>
                  )}
                </SpotlightCard>
              </Reveal>
            );
          })}
        </div>
        <Reveal className="mt-10 text-center">
          <Link href="/features" className="ca-btn ca-btn-ghost">See all features <ArrowRight className="h-4 w-4" /></Link>
        </Reveal>
      </Section>

      {/* STEPS */}
      <Section eyebrow="How it works" title="Up and running in three steps">
        <div className="relative grid gap-5 md:grid-cols-3">
          <div className="pointer-events-none absolute left-[16%] right-[16%] top-[3.1rem] hidden h-px bg-gradient-to-r from-transparent via-[var(--chai-mid)]/60 to-transparent md:block" />
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <SpotlightCard className="h-full rounded-3xl p-7">
                <span className="grid h-12 w-12 place-items-center rounded-2xl border border-border bg-background/70 font-display text-sm font-bold ca-text-chai">
                  {s.n}
                </span>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* OPEN STANDARDS + CODE */}
      <Section>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="ca-eyebrow">For developers</span>
            <h2 className="mt-5 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built on open standards</h2>
            <p className="mt-4 text-text-soft">
              No proprietary lock-in. If your framework speaks OpenID Connect, it speaks ChaiAuth.
            </p>
            <ul className="mt-7 space-y-3.5 text-sm text-text-soft">
              {[
                "Authorization Code flow with PKCE",
                "Standard discovery document",
                "Consent screen for every third-party app",
                "Rotating client secrets",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/docs" className="ca-btn ca-btn-ghost mt-8">
              Explore the docs <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <Reveal delay={140}>
            <div className="ca-glass ca-glow-border rounded-2xl">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
                <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
                <span className="ca-mono ml-3 text-xs text-muted-foreground">auth.ts</span>
              </div>
              <pre className="ca-mono overflow-x-auto p-5 text-xs leading-7 sm:text-[0.82rem]"><code>
                <span className="text-muted-foreground">{"// next-auth provider\n"}</span>
                <span className="text-text-soft">{"{\n"}</span>
                <span className="text-text-soft">{"  id: "}</span><span className="text-[var(--chai-soft)]">{'"chaiauth"'}</span>{",\n"}
                <span className="text-text-soft">{"  type: "}</span><span className="text-[var(--chai-soft)]">{'"oidc"'}</span>{",\n"}
                <span className="text-text-soft">{"  issuer: "}</span><span className="text-[var(--chai-soft)]">{'"https://auth.example.com"'}</span>{",\n"}
                <span className="text-text-soft">{"  clientId: "}</span><span className="text-[var(--chai-bright)]">{"process.env.CHAIAUTH_CLIENT_ID"}</span>{",\n"}
                <span className="text-text-soft">{"  clientSecret: "}</span><span className="text-[var(--chai-bright)]">{"process.env.CHAIAUTH_CLIENT_SECRET"}</span>{",\n"}
                <span className="text-text-soft">{"  checks: "}</span>{"["}<span className="text-[var(--chai-soft)]">{'"pkce"'}</span>{", "}<span className="text-[var(--chai-soft)]">{'"state"'}</span>{"],\n"}
                <span className="text-text-soft">{"}"}</span>
              </code></pre>
            </div>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section eyebrow="FAQ" title="Frequently asked questions">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="ca-faq ca-glass group rounded-2xl px-6 py-5 transition-colors">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-semibold text-foreground">
                  {f.q}
                  <Plus className="ca-faq-icon h-5 w-5 shrink-0 text-primary transition-transform duration-300" />
                </summary>
                <p className="ca-faq-body mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
