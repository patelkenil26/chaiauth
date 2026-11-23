"use client";

import { Fragment, useRef, useState, type KeyboardEvent } from "react";
import { Check, Copy } from "lucide-react";

type Tab = { id: string; label: string; file: string; code: string };

const TABS: Tab[] = [
  {
    id: "sdk",
    label: "React SDK",
    file: "providers.tsx",
    code: `"use client";
import {
  ChaiAuthProvider,
  SignIn,
  SignedIn,
  SignedOut,
  UserButton,
} from "@chaiauth/react";

export function Providers({ children }) {
  return (
    <ChaiAuthProvider
      clientId={process.env.NEXT_PUBLIC_CHAIAUTH_CLIENT_ID!}
      redirectUri="https://yourapp.com/auth/callback"
      issuer="https://auth.example.com"
    >
      <SignedOut><SignIn returnTo="/dashboard" /></SignedOut>
      <SignedIn><UserButton /></SignedIn>
      {children}
    </ChaiAuthProvider>
  );
}`,
  },
  {
    id: "oidc",
    label: "Any OIDC library",
    file: "auth.ts",
    code: `// Works with next-auth, Auth.js, Passport...
// Discovery: /.well-known/openid-configuration
export const chaiauth = {
  id: "chaiauth",
  type: "oidc",
  issuer: "https://auth.example.com",
  clientId: process.env.CHAIAUTH_CLIENT_ID,
  clientSecret: process.env.CHAIAUTH_CLIENT_SECRET,
  checks: ["pkce", "state"],
};`,
  },
];

const LINE_COUNT = Math.max(...TABS.map((t) => t.code.split("\n").length));

type Kind = "cm" | "str" | "tag" | "kw" | "prop";
const TOKEN =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*")|(<\/?[A-Z][A-Za-z.]*)|\b(import|from|export|function|return|const|true|false)\b|\b([A-Za-z_]+)(?=[=:])/g;
const KINDS: Kind[] = ["cm", "str", "tag", "kw", "prop"];

/** Tiny, dependency-free highlighter for the two snippets above. */
function highlight(line: string) {
  const out: { text: string; kind?: Kind }[] = [];
  let last = 0;
  for (const m of line.matchAll(TOKEN)) {
    const i = m.index ?? 0;
    if (i > last) out.push({ text: line.slice(last, i) });
    const g = m.slice(1).findIndex(Boolean);
    out.push({ text: m[0], kind: KINDS[g] });
    last = i + m[0].length;
  }
  if (last < line.length) out.push({ text: line.slice(last) });
  return out;
}

/** Tabbed, copyable integration snippet for the home page. */
export function CodeTabs() {
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const tab = TABS[active];
  const lines = tab.code.split("\n");

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, i: number) {
    let next = i;
    if (e.key === "ArrowRight") next = (i + 1) % TABS.length;
    else if (e.key === "ArrowLeft") next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus();
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(tab.code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="ca-code overflow-hidden rounded-2xl border border-border bg-[var(--code-bg)] shadow-[0_24px_60px_-34px_var(--shadow-color)]">
      <div className="flex items-center justify-between gap-3 border-b border-border/80 px-2 sm:px-3">
        <div role="tablist" aria-label="Integration examples" className="flex min-w-0">
          {TABS.map((t, i) => (
            <button
              key={t.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              role="tab"
              id={`code-tab-${t.id}`}
              aria-selected={i === active}
              aria-controls="code-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => onKeyDown(e, i)}
              className={`relative min-h-12 whitespace-nowrap px-3 text-[0.82rem] font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-primary sm:px-4 ${
                i === active
                  ? "text-foreground after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:rounded-full after:bg-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        >
          {copied ? <Check className="h-4 w-4 text-good" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
          <span className="sr-only" role="status" aria-live="polite">
            {copied ? "Snippet copied to clipboard" : ""}
          </span>
        </button>
      </div>

      <div id="code-panel" role="tabpanel" aria-labelledby={`code-tab-${tab.id}`} tabIndex={0} className="outline-offset-[-2px]">
        <p className="ca-mono flex items-center gap-2 px-4 pt-3 text-[0.72rem] text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary/70" aria-hidden />
          {tab.file}
        </p>
        <pre
          className="ca-mono overflow-x-auto px-4 pb-5 pt-2 text-[0.8rem] leading-[1.75] text-text-soft"
          style={{ minHeight: `calc(${LINE_COUNT} * 1.75 * 0.8rem + 1.75rem)` }}
        >
          <code>
            {lines.map((line, n) => (
              <span key={n} className="flex">
                <span aria-hidden className="w-7 shrink-0 select-none pr-3 text-right text-muted-foreground/50">
                  {n + 1}
                </span>
                <span className="whitespace-pre">
                  {highlight(line).map((p, k) => (
                    <Fragment key={k}>{p.kind ? <span className={`tk-${p.kind}`}>{p.text}</span> : p.text}</Fragment>
                  ))}
                  {line === "" && " "}
                </span>
              </span>
            ))}
          </code>
        </pre>
      </div>
    </div>
  );
}
