import Link from "next/link";
import { AppWindow, ArrowRight, Check, Network, Plus, UserCheck } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { features, faqs, securityPillars } from "@/features/marketing/content";
import { CtaBanner, Section } from "@/features/marketing/components/blocks";
import { CodeTabs } from "@/features/marketing/components/CodeTabs";
import { SelfHostTerminal } from "@/features/marketing/components/SelfHostTerminal";
import { HeroDemo } from "@/features/marketing/stageshow/HeroDemo";
import { Reveal } from "@/features/marketing/components/Reveal";
import { SpotlightCard } from "@/features/marketing/components/SpotlightCard";

export const metadata = constructMetadata({
  description: "ChaiAuth is an OpenID Connect identity provider with passkeys, MFA, social login and a developer console.",
});

const steps = [
  { icon: AppWindow, title: "Create an app", text: "Register it in the developer console and add your callback URLs.", hint: "Developer console" },
  { icon: Network, title: "Connect with OIDC", text: "Point any OIDC library at our discovery URL with your client ID.", hint: "/.well-known/openid-configuration" },
  { icon: UserCheck, title: "Let users in", text: "Users sign in with any method and approve access on a consent screen.", hint: "Consent screen" },
];

const selfHostPoints = [
  "Docker Compose files for local and production",
  "Your own RSA keys sign every token",
  "A Caddy config and a deployment guide included",
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
        <div className="mx-auto max-w-6xl px-5 pb-8 pt-16 text-center sm:px-8 sm:pt-24">
          <h1 className="mx-auto max-w-3xl text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Authentication that feels <span className="ca-text-chai">warm</span>, and runs on your own server.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-text-soft">
            A simple, self-hostable OpenID Connect provider. Passwords, social login, MFA and passkeys, plus a developer console to register your apps.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href="/register" className="ca-btn ca-btn-primary ca-btn-lg">
              Get started free <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href="/docs" className="ca-btn ca-btn-ghost ca-btn-lg">Read the docs</Link>
          </div>
          <HeroDemo />
        </div>
      </section>

      {/* BENTO FEATURES */}
      <Section
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
      <Section title="Up and running in three steps">
        <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
          {steps.map(({ icon: Icon, title, text, hint }, i) => (
            <li
              key={title}
              className={`relative ${
                i < steps.length - 1
                  ? "md:before:absolute md:before:left-16 md:before:right-[-1rem] md:before:top-6 md:before:h-px md:before:bg-border"
                  : ""
              }`}
            >
              <Reveal delay={i * 120}>
                <span className="ca-tile !h-12 !w-12 !rounded-full">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
                  <span className="mr-2 text-primary">{i + 1}.</span>
                  {title}
                </h3>
                <p className="mt-2.5 max-w-xs text-base leading-relaxed text-text-soft">{text}</p>
                <p className="ca-mono mt-4 inline-block rounded-md border border-border bg-background/50 px-2.5 py-1 text-[0.72rem] text-muted-foreground">
                  {hint}
                </p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Section>

      {/* OPEN STANDARDS + CODE */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <Reveal className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Built on open standards</h2>
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
            <CodeTabs />
          </Reveal>
        </div>
      </Section>

      {/* SELF-HOST */}
      <Section>
        <div className="grid grid-cols-1 items-center gap-10 lg:grid-cols-2 lg:gap-14">
          <Reveal delay={120} className="min-w-0 lg:order-1">
            <SelfHostTerminal />
          </Reveal>
          <Reveal className="min-w-0 lg:order-2">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Run it on your own server</h2>
            <p className="mt-3 text-text-soft">
              ChaiAuth is one repository you can read end to end: an Express API, a Next.js dashboard, Postgres and Redis.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-text-soft">
              {selfHostPoints.map((t) => (
                <li key={t} className="flex items-start gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-border text-primary">
                    <Check className="h-3 w-3" />
                  </span>
                  {t}
                </li>
              ))}
            </ul>
            <Link href="/docs" className="ca-btn ca-btn-ghost mt-8">
              Read the docs <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </Section>

      {/* SECURITY */}
      <Section>
        <div className="grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
          <Reveal className="min-w-0">
            <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">Security is the product</h2>
            <p className="mt-3 text-text-soft">
              Passwords are hashed, sessions are short-lived and every redirect URI is checked against the ones you
              registered.
            </p>
            <Link href="/trust" className="ca-btn ca-btn-ghost mt-8">
              How we handle security <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          <Reveal delay={120} className="min-w-0">
            <ul className="grid gap-x-10 sm:grid-cols-2">
              {securityPillars.map(({ icon: Icon, title, description }) => (
                <li key={title} className="flex gap-4 border-t border-border py-5">
                  <Icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                  <div>
                    <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </Section>

      {/* FAQ */}
      <Section title="Frequently asked questions">
        <div className="mx-auto max-w-3xl divide-y divide-border border-y border-border">
          {faqs.map((f, i) => (
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
