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
  { n: "01", title: "Create an app", text: "Register it in the developer console and add your callback URLs." },
  { n: "02", title: "Connect with OIDC", text: "Point any OIDC library at our discovery URL with your client ID." },
  { n: "03", title: "Let users in", text: "Users sign in with any method and approve access on a consent screen." },
];

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
        <div className="relative mx-auto max-w-6xl px-5 pb-8 pt-16 text-center sm:px-8 sm:pt-24">
          <Reveal>
            <span className="ca-eyebrow">
              <span className="ca-dot-live" /> OpenID Connect · Passkeys · MFA
            </span>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="mx-auto mt-6 max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Authentication that <span className="ca-text-chai-anim">feels warm</span>, and stays secure.
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-soft">
              An identity provider for your apps: passwords, social login, MFA and passkeys, with a developer console.
            </p>
          </Reveal>
          <Reveal delay={270}>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="ca-btn ca-btn-primary ca-btn-lg">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/docs" className="ca-btn ca-btn-ghost ca-btn-lg">Read the docs</Link>
            </div>
          </Reveal>
          <Reveal delay={380}>
            <HeroShowcase />
          </Reveal>
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-6xl px-5 pt-10 sm:px-8">
        <Reveal>
          <div className="grid grid-cols-2 gap-y-6 border-y border-border py-7 md:grid-cols-4 md:divide-x md:divide-border">
            {stats.map((s) => (
              <div key={s.value} className="px-4 text-left md:px-8">
                <div className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">{s.value}</div>
                <div className="ca-mono mt-1.5 text-[0.68rem] uppercase tracking-[0.14em] text-muted-foreground">{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* BENTO FEATURES */}
      <Section
        eyebrow="Features"
        title="Everything sign-in needs"
        subtitle="The pieces you would otherwise stitch together yourself."
      >
        <div className="grid gap-4 lg:grid-cols-6">
          {bento.map(([idx, span], i) => {
            const { icon: Icon, title, description } = features[idx];
            const big = span.includes("col-span-4");
            return (
              <Reveal key={title} delay={i * 80} className={span}>
                <SpotlightCard className="h-full rounded-2xl p-6">
                  <span className="ca-tile">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-lg font-semibold tracking-tight text-foreground">{title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">{description}</p>
                  {big && (
                    <div className="ca-mono mt-5 flex flex-wrap gap-2 text-[0.7rem] text-text-soft">
                      {["/.well-known/openid-configuration", "/o/authorize", "/o/token"].map((p) => (
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
        <div className="grid gap-x-10 gap-y-10 md:grid-cols-3">
          {steps.map((s, i) => (
            <Reveal key={s.n} delay={i * 120}>
              <div className="border-t border-border pt-6">
                <span className="ca-mono text-xs font-semibold tracking-[0.18em] text-primary">{s.n}</span>
                <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">{s.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Section>

      {/* OPEN STANDARDS + CODE */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <Reveal className="min-w-0">
            <span className="ca-eyebrow">For developers</span>
            <h2 className="mt-5 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Built on open standards</h2>
            <p className="mt-3 text-text-soft">
              If your framework speaks OpenID Connect, it speaks ChaiAuth.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-text-soft">
              {[
                "Authorization Code flow with PKCE",
                "Standard discovery document",
                "Rotating client secrets",
              ].map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-primary">
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

          <Reveal delay={140} className="min-w-0">
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
        <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
          {faqs.slice(0, 4).map((f, i) => (
            <Reveal key={f.q} delay={i * 40}>
              <details className="ca-faq group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-base font-medium text-foreground transition-colors hover:text-primary">
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
