import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";
import type { Feature } from "../content";

export function PageHero({ eyebrow, title, subtitle, children }: { eyebrow?: string; title: ReactNode; subtitle?: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden">
      <div className="ca-grid pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 pb-16 pt-20 text-center sm:px-8 sm:pt-28">
        {eyebrow && (
          <span className="inline-block rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            {eyebrow}
          </span>
        )}
        <h1 className="mt-5 text-4xl font-bold leading-[1.1] tracking-tight text-foreground sm:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-soft sm:text-lg">{subtitle}</p>}
        {children && <div className="mt-9 flex flex-wrap items-center justify-center gap-3">{children}</div>}
      </div>
    </section>
  );
}

export function Section({ title, subtitle, children, id }: { title?: string; subtitle?: string; children: ReactNode; id?: string }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
      {title && (
        <div className="mx-auto mb-12 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
          {subtitle && <p className="mt-4 text-text-soft">{subtitle}</p>}
        </div>
      )}
      {children}
    </section>
  );
}

export function FeatureGrid({ items }: { items: Feature[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map(({ icon: Icon, title, description }) => (
        <div key={title} className="ca-glass rounded-2xl p-6 transition-transform duration-200 hover:-translate-y-1">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <h3 className="mt-5 text-lg font-semibold text-foreground">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
        </div>
      ))}
    </div>
  );
}

export function CtaBanner({
  title = "Ready to ship auth you can trust?",
  subtitle = "Create a free account and register your first application in minutes.",
}: { title?: string; subtitle?: string }) {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
      <div className="ca-glass relative overflow-hidden rounded-3xl px-6 py-14 text-center sm:px-12">
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-96 -translate-x-1/2 rounded-full bg-[var(--chai-mid)]/20 blur-3xl" />
        <h2 className="relative text-3xl font-bold tracking-tight text-foreground sm:text-4xl">{title}</h2>
        <p className="relative mx-auto mt-4 max-w-xl text-text-soft">{subtitle}</p>
        <div className="relative mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/register" className="ca-btn ca-btn-primary">Get started free <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/docs" className="ca-btn ca-btn-ghost">Read the docs</Link>
        </div>
      </div>
    </section>
  );
}
