"use client";

import { Fragment, useState, type ReactNode } from "react";
import { Check, Clipboard } from "lucide-react";
import { toast } from "sonner";

// One pass tokenizer: comments | strings | keywords | object keys | numbers.
const TOKEN =
  /(\/\/.*|#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|export|const|return|default|await|async|new|curl|POST|GET)\b|\b([A-Za-z_][\w]*)(?=\s*:)|(\b\d+\b)/g;

function highlight(code: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of code.matchAll(TOKEN)) {
    const idx = m.index ?? 0;
    if (idx > last) out.push(code.slice(last, idx));
    const [text, comment, str, kw, prop, num] = m;
    const cls = comment
      ? "text-muted-foreground italic"
      : str
        ? "text-[var(--chai-soft)]"
        : kw
          ? "text-[var(--chai-mid)]"
          : prop
            ? "text-[var(--chai-bright)]"
            : num
              ? "text-good"
              : "";
    out.push(
      <span key={key++} className={cls}>
        {text}
      </span>,
    );
    last = idx + text.length;
  }
  if (last < code.length) out.push(code.slice(last));
  return out;
}

export function CodeBlock({ code, label, plain = false }: { code: string; label: string; plain?: boolean }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Code copied");
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      toast.error("Could not copy. Select the code and copy it manually.");
    }
  }

  return (
    <div className="ca-glass group overflow-hidden rounded-2xl">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]/80" />
          <span className="ca-mono ml-3 text-xs text-muted-foreground">{label}</span>
        </div>
        <button
          type="button"
          onClick={copy}
          className="flex items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2.5 py-1 text-xs font-medium text-text-soft transition-colors hover:border-primary/40 hover:text-foreground"
          aria-label={`Copy ${label}`}
        >
          {copied ? <Check className="h-3.5 w-3.5 text-good" /> : <Clipboard className="h-3.5 w-3.5" />}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <pre className="ca-mono overflow-x-auto p-5 text-[0.8rem] leading-6 text-text-soft">
        <code>{plain ? code : <Fragment>{highlight(code)}</Fragment>}</code>
      </pre>
    </div>
  );
}
