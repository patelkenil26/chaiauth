import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Feature } from "../content";
import { Reveal } from "./Reveal";
import { SpotlightCard } from "./SpotlightCard";

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: ReactNode; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="ca-aurora"><span /><span /><span /></div>
      <div className="ca-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
        {eyebrow && (
          <Reveal>
            <span className="ca-eyebrow">{eyebrow}</span>
          </Reveal>
        )}
        <Reveal delay={80}>
          <h1 className="mt-6 text-4xl font-bold leading-[1.08] tracking-tight text-foreground sm:text-6xl">{title}</h1>
        </Reveal>
        {subtitle && (
          <Reveal delay={160}>
            <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-soft sm:text-lg">{subtitle}</p>
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
    <section id={id} className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
      {title && (
        <Reveal className="mx-auto mb-12 max-w-2xl text-center">
          {eyebrow && <span className="ca-eyebrow mb-4">{eyebrow}</span>}
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-4 text-text-soft">{subtitle}</p>}
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
        <Reveal key={title} delay={(i % 3) * 90}>
          <SpotlightCard className="h-full rounded-2xl p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
              <Icon className="h-5 w-5" />
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
          </SpotlightCard>
        </Reveal>
      ))}
    </div>
  );
}

export function CtaBanner({
  title = "Ready to ship auth you can trust?",
  subtitle = "Create a free account and register your first application in minutes.",
}: { title?: string; subtitle?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <Reveal>
        <div className="ca-glass relative overflow-hidden rounded-3xl px-6 py-16 text-center sm:px-12">
          <div className="ca-aurora opacity-80"><span /><span /><span /></div>
          <div className="ca-grid pointer-events-none absolute inset-0 opacity-60" />
          <h2 className="relative text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{title}</h2>
          <p className="relative mx-auto mt-5 max-w-xl text-text-soft">{subtitle}</p>
          <div className="relative mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/register" className="ca-btn ca-btn-primary ca-btn-lg">Get started free <ArrowRight className="h-4 w-4" /></Link>
            <Link href="/docs" className="ca-btn ca-btn-ghost ca-btn-lg">Read the docs</Link>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
