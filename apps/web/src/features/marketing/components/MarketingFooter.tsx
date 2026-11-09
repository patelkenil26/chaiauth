import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import { footerColumns } from "../content";

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background/60">
      <div className="pointer-events-none absolute -bottom-40 left-1/2 h-72 w-[48rem] -translate-x-1/2 rounded-full bg-[var(--chai-mid)]/10 blur-3xl" />
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Open, standards-based authentication for people who like their auth strong and their chai stronger.
            </p>
            <p className="mt-5 inline-flex items-center gap-2 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-text-soft">
              <span className="ca-dot-live" /> All systems operational
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="inline-block text-sm text-muted-foreground transition-all duration-200 hover:translate-x-0.5 hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="ca-line-h mt-12" />
        <div className="mt-6 flex flex-col items-start justify-between gap-3 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ChaiAuth. All rights reserved.</p>
          <p>Built with Next.js, PostgreSQL &amp; a lot of chai.</p>
        </div>
      </div>
    </footer>
  );
}
