import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import { footerColumns } from "../content";

export function MarketingFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              Open, standards-based authentication for people who like their auth strong and their chai stronger.
            </p>
          </div>
          {footerColumns.map((col) => (
            <div key={col.title}>
              <h3 className="text-sm font-semibold text-foreground">{col.title}</h3>
              <ul className="mt-4 space-y-3">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} ChaiAuth. All rights reserved.</p>
          <p>Built with Next.js, PostgreSQL &amp; a lot of chai.</p>
        </div>
      </div>
    </footer>
  );
}
