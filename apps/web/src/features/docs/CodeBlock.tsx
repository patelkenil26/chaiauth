"use client";

import { Fragment, useEffect, useState, type ReactNode } from "react";
import { Check, Clipboard } from "lucide-react";
import { toast } from "sonner";

// One pass tokenizer: comments | strings | keywords | object keys | numbers.
const TOKEN =
  /(\/\/.*|#.*)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|\b(import|from|export|const|return|default|await|async|new|curl|POST|GET|require|print|def|with|as)\b|\b([A-Za-z_][\w]*)(?=\s*:)|(\b\d+\b)/g;

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

export type CodeTab = { id: string; label: string; code: string };

const LANG_KEY = "chaiauth-docs-lang";
const LANG_EVENT = "chaiauth-docs-lang";

/** Same example in several languages. The chosen language is remembered and shared by every tab group on the page. */
export function CodeTabs({ tabs, label }: { tabs: CodeTab[]; label: string }) {
  const [picked, setPicked] = useState<string | null>(null);

  useEffect(() => {
    const read = () => {
      try {
        setPicked(window.localStorage.getItem(LANG_KEY));
      } catch {
        /* storage unavailable: keep the default */
      }
    };
    read();
    window.addEventListener(LANG_EVENT, read);
    return () => window.removeEventListener(LANG_EVENT, read);
  }, []);

  const active = tabs.find((t) => t.id === picked) ?? tabs[0];

  function choose(id: string) {
    setPicked(id);
    try {
      window.localStorage.setItem(LANG_KEY, id);
    } catch {
      /* ignore */
    }
    window.dispatchEvent(new Event(LANG_EVENT));
  }

  return (
    <CodeBlock
      label={label}
      code={active.code}
      tabs={
        <div role="tablist" aria-label="Language" className="flex shrink-0 gap-1 rounded-lg border border-border bg-background/50 p-0.5">
          {tabs.map((t) => (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={t.id === active.id}
              onClick={() => choose(t.id)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                t.id === active.id ? "bg-primary/15 text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      }
    />
  );
}

export function CodeBlock({
  code,
  label,
  plain = false,
  tabs,
}: {
  code: string;
  label: string;
  plain?: boolean;
  tabs?: ReactNode;
}) {
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
      <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-2.5">
        <div className="flex min-w-0 items-center gap-2">
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#ff5f57]/80" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#febc2e]/80" />
          <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-[#28c840]/80" />
          <span className="ca-mono ml-3 min-w-0 truncate text-xs text-muted-foreground">{label}</span>
        </div>
        {tabs}
        <button
          type="button"
          onClick={copy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border bg-background/50 px-2.5 py-1 text-xs font-medium text-text-soft transition-colors hover:border-primary/40 hover:text-foreground"
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
