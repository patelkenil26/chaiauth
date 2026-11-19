import { ChevronDown } from "lucide-react";
import { FAQ, RATE_LIMITS, type OAuthErrorRow } from "./referenceData";

function statusStyle(status: number) {
  if (status >= 500) return "bg-destructive/15 text-destructive ring-destructive/25";
  if (status === 429) return "bg-amber-500/15 text-amber-500 ring-amber-500/25";
  return "bg-primary/15 text-[var(--chai-soft)] ring-primary/30";
}

/** One card per error, with the exact message, why it happens and how to fix it. */
export function ErrorList({ rows }: { rows: OAuthErrorRow[] }) {
  return (
    <div className="ca-glass divide-y divide-border overflow-hidden rounded-2xl">
      {rows.map((r) => (
        <article key={`${r.error}-${r.endpoint}-${r.message}`} className="p-5">
          <div className="flex flex-wrap items-center gap-2">
            <code className="ca-mono rounded-md bg-primary/12 px-2 py-1 text-xs font-semibold text-[var(--chai-soft)]">{r.error}</code>
            <span className={`ca-mono rounded-md px-2 py-0.5 text-[0.7rem] font-bold ring-1 ${statusStyle(r.status)}`}>{r.status}</span>
            <span className="ca-mono text-xs text-muted-foreground">{r.endpoint}</span>
          </div>
          <p className="ca-mono mt-3 text-sm text-foreground">“{r.message}”</p>
          <dl className="mt-3 grid gap-3 text-sm leading-6 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Why it happens</dt>
              <dd className="mt-1 text-text-soft">{r.cause}</dd>
            </div>
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">How to fix it</dt>
              <dd className="mt-1 text-text-soft">{r.fix}</dd>
            </div>
          </dl>
        </article>
      ))}
    </div>
  );
}

export function RateLimitTable() {
  return (
    <div className="ca-glass overflow-x-auto rounded-2xl">
      <table className="w-full min-w-[640px] text-left text-sm">
        <thead>
          <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
            <th className="px-5 py-3.5 font-medium">Scope</th>
            <th className="px-5 py-3.5 font-medium">Endpoints</th>
            <th className="px-5 py-3.5 font-medium">Limit</th>
            <th className="px-5 py-3.5 font-medium">What counts</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border align-top">
          {RATE_LIMITS.map((r) => (
            <tr key={r.endpoints} className="transition-colors hover:bg-accent/30">
              <td className="px-5 py-3.5 text-muted-foreground">{r.scope}</td>
              <td className="ca-mono px-5 py-3.5 text-xs leading-6 text-foreground">{r.endpoints}</td>
              <td className="px-5 py-3.5 font-medium text-foreground">{r.limit}</td>
              <td className="px-5 py-3.5 text-xs leading-6 text-muted-foreground">{r.counts}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Collapsible questions, grouped. Uses native <details> so it works without JavaScript. */
export function FaqList() {
  return (
    <div className="space-y-8">
      {FAQ.map((g) => (
        <div key={g.group}>
          <p className="ca-mono text-[0.65rem] uppercase text-muted-foreground" style={{ letterSpacing: ".16em" }}>
            {g.group}
          </p>
          <div className="ca-glass mt-3 divide-y divide-border overflow-hidden rounded-2xl">
            {g.items.map((item) => (
              <details key={item.q} className="group">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-medium text-foreground transition-colors hover:bg-accent/30 [&::-webkit-details-marker]:hidden">
                  {item.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <p className="px-5 pb-5 text-sm leading-7 text-text-soft">{item.a}</p>
              </details>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
