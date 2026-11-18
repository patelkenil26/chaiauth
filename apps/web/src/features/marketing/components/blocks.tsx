import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Feature } from "../content";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: ReactNode; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="ca-grid pointer-events-none absolute inset-0 opacity-60" />
      <div className="relative mx-auto max-w-3xl px-5 pb-10 pt-16 text-center sm:px-8 sm:pt-20">
        {eyebrow && (
          <Reveal>
            <span className="ca-eyebrow">{eyebrow}</span>
          </Reveal>
        )}
        <Reveal delay={80}>
          <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-5xl">{title}</h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={160}>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-text-soft">{subtitle}</p>
          </Reveal>
        )}
        {children && (
          <Reveal delay={240}>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>
          </Reveal>
        )}
      </div>
    </section>
  );
}

export function Section({ title, subtitle, eyebrow, children, id }: { title?: string; subtitle?: string; eyebrow?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
      {title && (
        <Reveal className="mx-auto mb-10 max-w-xl text-center">
          {eyebrow && <span className="ca-eyebrow mb-4">{eyebrow}</span>}
          <h2 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          {subtitle && <p className="mt-3 text-sm text-text-soft sm:text-base">{subtitle}</p>}
        </Reveal>
      )}
      {children}
    </section>
  );
}

export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, description }, i) => (
        <Reveal key={title} delay={(i % 3) * 60}>
          <SpotlightCard className="h-full rounded-2xl p-5">
            <span className="ca-tile">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-4 text-base font-semibold tracking-tight text-foreground">{title}</h3>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}

export function CtaBanner({
  title = "Ready to get started?",
  subtitle = "Create a free account and register your first app in minutes.",
}: { title?: string; subtitle?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 pt-4 sm:px-8">
      <Reveal>
        <div className="ca-glass relative overflow-hidden rounded-3xl px-6 py-12 text-center sm:px-12">
          <h2 className="relative text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h2>
          <p className="relative mx-auto mt-3 max-w-md text-sm text-text-soft sm:text-base">{subtitle}</p>
          <div className="relative mt-7 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="ca-btn ca-btn-primary">Get started free <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/docs" className="ca-btn ca-btn-ghost">Read the docs</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
