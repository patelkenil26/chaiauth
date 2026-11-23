"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

type Line = { kind: "cmd" | "note"; text: string };

// Straight from the repo README ("Getting started").
const LINES: Line[] = [
  { kind: "note", text: "# install and create your .env" },
  { kind: "cmd", text: "pnpm install" },
  { kind: "cmd", text: "bash setup.sh" },
  { kind: "note", text: "# Postgres and Redis" },
  { kind: "cmd", text: "docker compose up -d" },
  { kind: "note", text: "# RSA keys that sign your tokens" },
  { kind: "cmd", text: "bash scripts/generate-keys.sh" },
  { kind: "cmd", text: "pnpm db:migrate" },
  { kind: "note", text: "# API on :8000, dashboard on :3000" },
  { kind: "cmd", text: "pnpm dev" },
];

const COPY_TEXT = LINES.filter((l) => l.kind === "cmd")
  .map((l) => l.text)
  .join("\n");

/** A copyable terminal showing the real self-host commands. */
export function SelfHostTerminal() {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(COPY_TEXT);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="ca-code overflow-hidden rounded-2xl border border-border bg-[var(--code-bg)] shadow-[0_24px_60px_-34px_var(--shadow-color)]">
      <div className="flex items-center justify-between border-b border-border/80 pl-4 pr-2">
        <span className="ca-mono text-[0.78rem] text-muted-foreground">~/chaiauth</span>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy commands"}
          title={copied ? "Copied" : "Copy commands"}
          className="grid h-12 w-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary"
        >
          {copied ? <Check className="h-4 w-4 text-good" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Commands copied to clipboard" : ""}
          </span>
        </button>
      </div>
      <pre className="ca-mono overflow-x-auto px-5 py-5 text-[0.8rem] leading-[1.9]">
        <code>
          {LINES.map((l, i) =>
            l.kind === "note" ? (
              <span key={i} className="tk-cm block">
                {l.text}
              </span>
            ) : (
              <span key={i} className="block text-foreground">
                <span aria-hidden className="select-none pr-3 text-primary">
                  $
                </span>
                {l.text}
              </span>
            ),
          )}
        </code>
      </pre>
    </div>
  );
}
