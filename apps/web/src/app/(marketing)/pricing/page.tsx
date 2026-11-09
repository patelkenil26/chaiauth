import Link from "next/link";
import { Check } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { PageHero, Section } from "@/features/marketing/components/blocks";
import { Reveal } from "@/features/marketing/components/Reveal";
import { SpotlightCard } from "@/features/marketing/components/SpotlightCard";

export const metadata = constructMetadata({
  title: "Pricing",
  description: "Simple pricing for ChaiAuth. Start free and grow when you need to.",
});

// NOTE: placeholder plans and numbers; update before launch.
const plans = [
  {
    name: "Starter",
    price: "Free",
    note: "For side projects",
    cta: "Get started",
    href: "/register",
    highlight: false,
    items: ["Up to 3 applications", "Email, magic link, Google & GitHub login", "TOTP MFA & passkeys", "Community support"],
  },
  {
    name: "Pro",
    price: "$19",
    note: "per month",
    cta: "Start Pro",
    href: "/register",
    highlight: true,
    items: ["Unlimited applications", "Everything in Starter", "Extended security activity log", "Email support"],
  },
  {
    name: "Enterprise",
    price: "Custom",
    note: "for larger teams",
    cta: "Contact us",
    href: "/contact",
    highlight: false,
    items: ["Everything in Pro", "Self-hosting guidance", "Custom SLAs", "Dedicated support"],
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title={<>Simple pricing, <span className="ca-text-chai-anim">no surprises</span></>}
        subtitle="Start free. Upgrade when your apps and team grow."
      />
      <Section>
        <div className="grid items-stretch gap-5 md:grid-cols-3">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 110} className={p.highlight ? "md:-mt-4 md:mb-4" : ""}>
              <SpotlightCard className={`flex h-full flex-col rounded-3xl p-8 ${p.highlight ? "ca-glow-border" : ""}`}>
                {p.highlight && (
                  <span className="absolute right-6 top-6 rounded-full bg-primary/15 px-3 py-1 text-[0.7rem] font-semibold text-[var(--chai-soft)] ring-1 ring-primary/30">
                    Most popular
                  </span>
                )}
                <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className={`font-display text-5xl font-bold ${p.highlight ? "ca-text-chai" : "text-foreground"}`}>{p.price}</span>
                  <span className="text-sm text-muted-foreground">{p.note}</span>
                </div>
                <div className="ca-line-h my-6" />
                <ul className="flex-1 space-y-3.5 text-sm text-text-soft">
                  {p.items.map((item) => (
                    <li key={item} className="flex items-start gap-3">
                      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/15 text-primary">
                        <Check className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href={p.href} className={`ca-btn mt-8 ${p.highlight ? "ca-btn-primary" : "ca-btn-ghost"}`}>
                  {p.cta}
                </Link>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </Section>
    </>
  );
}
