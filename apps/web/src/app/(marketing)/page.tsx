import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { features, stats, faqs } from "@/features/marketing/content";
import { CtaBanner, FeatureGrid, PageHero, Section } from "@/features/marketing/components/blocks";

export const metadata = constructMetadata({
  description: "ChaiAuth is an OpenID Connect identity provider with passkeys, MFA, social login and a developer console.",
});

const codeSample = `// next-auth provider
{
  id: "chaiauth",
  name: "ChaiAuth",
  type: "oauth",
  wellKnown: "https://auth.example.com/.well-known/openid-configuration",
  clientId: process.env.CHAIAUTH_CLIENT_ID,
  clientSecret: process.env.CHAIAUTH_CLIENT_SECRET,
  checks: ["pkce", "state"],
}`;

const steps = [
  { n: "01", title: "Create an app", text: "Register your application in the developer console and add your callback URLs." },
  { n: "02", title: "Connect with OIDC", text: "Point any OpenID Connect library at our discovery URL with your client ID and secret." },
  { n: "03", title: "Let users in", text: "Users sign in with password, social, MFA or passkeys and approve access on a clear consent screen." },
];

export default function HomePage() {
  return (
    <>
      <PageHero
        eyebrow="OpenID Connect · Passkeys · MFA"
        title={<>Authentication that <span className="ca-text-chai">feels warm</span>, and stays secure.</>}
        subtitle="ChaiAuth is an identity provider for your apps. Passwords, social login, authenticator apps and passkeys, with a developer console to manage it all."
      >
        <Link href="/register" className="ca-btn ca-btn-primary">Get started free <ArrowRight className="h-4 w-4" /></Link>
        <Link href="/docs" className="ca-btn ca-btn-ghost">Read the docs</Link>
      </PageHero>

      <section className="mx-auto max-w-6xl px-5 sm:px-8">
        <div className="ca-glass grid grid-cols-2 gap-6 rounded-2xl p-6 sm:p-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.value} className="text-center">
              <div className="font-display text-2xl font-bold ca-text-chai sm:text-3xl">{s.value}</div>
              <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <Section title="Everything sign-in needs" subtitle="The pieces you would otherwise stitch together yourself, built in and working together.">
        <FeatureGrid items={features.slice(0, 6)} />
        <div className="mt-8 text-center">
          <Link href="/features" className="ca-btn ca-btn-ghost">See all features <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </Section>

      <Section title="Up and running in three steps">
        <div className="grid gap-4 md:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="ca-glass rounded-2xl p-6">
              <div className="font-display text-sm font-bold ca-text-chai">{s.n}</div>
              <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">Built on open standards</h2>
            <p className="mt-4 text-text-soft">
              No proprietary lock-in. If your framework speaks OpenID Connect, it speaks ChaiAuth.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-text-soft">
              {["Authorization Code flow with PKCE", "Standard discovery document", "Consent screen for every third-party app", "Rotating client secrets"].map((t) => (
                <li key={t} className="flex items-start gap-2.5">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {t}
                </li>
              ))}
            </ul>
          </div>
          <div className="ca-glass overflow-hidden rounded-2xl">
            <div className="flex gap-1.5 border-b border-border px-4 py-3">
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
              <span className="h-2.5 w-2.5 rounded-full bg-border" />
            </div>
            <pre className="ca-mono overflow-x-auto p-5 text-xs leading-relaxed text-text-soft sm:text-sm"><code>{codeSample}</code></pre>
          </div>
        </div>
      </Section>

      <Section title="Frequently asked questions">
        <div className="mx-auto max-w-3xl space-y-3">
          {faqs.map((f) => (
            <details key={f.q} className="ca-glass group rounded-xl px-5 py-4">
              <summary className="cursor-pointer list-none text-base font-semibold text-foreground">
                {f.q}
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
            </details>
          ))}
        </div>
      </Section>

      <CtaBanner />
    </>
  );
}
