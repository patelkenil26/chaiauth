import Link from "next/link";
import { Check } from "lucide-react";
import { constructMetadata } from "@/config/site";
import { PageHero, Section } from "@/features/marketing/components/blocks";

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
    items: ["Up to 3 applications", "Email, Google & GitHub login", "TOTP MFA & passkeys", "Community support"],
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
        title={<>Simple pricing, <span className="ca-text-chai">no surprises</span></>}
        subtitle="Start free. Upgrade when your apps and team grow."
      />
      <Section>
        <div className="grid gap-5 md:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.name}
              className={`ca-glass flex flex-col rounded-2xl p-7 ${p.highlight ? "ring-2 ring-primary/70" : ""}`}
            >
              <h3 className="text-lg font-semibold text-foreground">{p.name}</h3>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold text-foreground">{p.price}</span>
                <span className="text-sm text-muted-foreground">{p.note}</span>
              </div>
              <ul className="mt-6 flex-1 space-y-3 text-sm text-text-soft">
                {p.items.map((i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> {i}
                  </li>
                ))}
              </ul>
              <Link href={p.href} className={`ca-btn mt-8 ${p.highlight ? "ca-btn-primary" : "ca-btn-ghost"}`}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
