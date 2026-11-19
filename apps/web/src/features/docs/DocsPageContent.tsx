"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Logo } from "@/shared/components/Logo";
import { env } from "@/config/env";
import { Menu, X, KeyRound, Code2, ShieldCheck, Check, ArrowRight, BookOpen, Info, ChevronRight, Link2, Search } from "lucide-react";
import { CodeBlock, CodeTabs } from "./CodeBlock";
import { buildSnippets } from "./snippets";
import { ANCHOR_PAGE, DOCS_UPDATED, DOCS_VERSION, type SearchEntry } from "./docsIndex";
import { SearchDialog } from "./SearchDialog";
import { ErrorList, FaqList, RateLimitTable } from "./ReferenceSections";
import { GENERAL_ERRORS, OAUTH_ERRORS } from "./referenceData";
import { Reveal } from "@/features/marketing/components/Reveal";

const NAV = [
  {
    group: "Get started",
    items: [
      { id: "quick-start", label: "Quick start" },
      { id: "configure-your-app", label: "Configure your app" },
    ],
  },
  {
    group: "Integrate",
    items: [
      { id: "authjs", label: "Auth.js / NextAuth" },
      { id: "authorization-flow", label: "Authorization flow" },
      { id: "token-exchange", label: "Token exchange" },
      { id: "react-sdk", label: "React SDK" },
      { id: "embedded-sign-in", label: "Embedded sign-in forms" },
      { id: "branded-emails", label: "Branded emails" },
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "endpoints", label: "Endpoints" },
      { id: "server-api", label: "Server API & keys" },
      { id: "scopes", label: "Scopes & claims" },
      { id: "login-context", label: "Login context" },
      { id: "error-reference", label: "Error reference" },
      { id: "rate-limits", label: "Rate limits" },
      { id: "security-notes", label: "Security notes" },
    ],
  },
  {
    group: "Help",
    items: [{ id: "troubleshooting", label: "Troubleshooting & FAQ" }],
  },
];
const FLAT = NAV.flatMap((g) => g.items.map((i) => ({ ...i, group: g.group })));
const ALL_IDS = FLAT.map((i) => i.id);

// Renders its children only while it is the selected docs page
function Page({ id, active, children }: { id: string; active: string; children: ReactNode }) {
  if (id !== active) return null;
  return <div key={id} className="ca-fade-up">{children}</div>;
}

// Hover-revealed button that copies a link straight to a heading
function CopyLink({ id }: { id: string }) {
  async function copy() {
    const url = `${window.location.origin}${window.location.pathname}#${id}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch {
      toast.error("Could not copy the link.");
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      aria-label="Copy link to this section"
      className="ml-2 inline-grid h-7 w-7 place-items-center rounded-md align-middle text-muted-foreground opacity-0 transition-opacity hover:bg-accent/60 hover:text-foreground focus-visible:opacity-100 group-hover/h:opacity-100 max-sm:opacity-60"
    >
      <Link2 className="h-4 w-4" />
    </button>
  );
}

function H2({ id, children, sub }: { id: string; children: ReactNode; sub?: string }) {
  return (
    <section id={id} data-toc className="scroll-mt-24">
      <Reveal>
        <h2 className="group/h text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: '"Sora", sans-serif' }}>
          {children}
          <CopyLink id={id} />
        </h2>
        {sub && <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{sub}</p>}
      </Reveal>
    </section>
  );
}

function H3({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} data-toc className="group/h mt-10 scroll-mt-24 text-lg font-semibold text-foreground">
      {children}
      <CopyLink id={id} />
    </h3>
  );
}

function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="mt-5 flex gap-3 rounded-2xl border border-primary/25 bg-primary/8 p-4 text-sm leading-6 text-text-soft">
      <Info className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
      <div>{children}</div>
    </div>
  );
}

const METHOD_STYLE: Record<string, string> = {
  GET: "bg-good/15 text-good ring-good/25",
  POST: "bg-primary/15 text-[var(--chai-soft)] ring-primary/30",
};

export function DocsPageContent() {
  const [open, setOpen] = useState(false);
  const [page, setPage] = useState("quick-start");
  const activeSection = page;
  const index = ALL_IDS.indexOf(page);
  const prev = index > 0 ? FLAT[index - 1] : null;
  const next = index < FLAT.length - 1 ? FLAT[index + 1] : null;
  const [progress, setProgress] = useState(0);
  const [searchOpen, setSearchOpen] = useState(false);
  const [toc, setToc] = useState<{ id: string; label: string; level: 2 | 3 }[]>([]);
  const [activeToc, setActiveToc] = useState("");
  const pendingAnchor = useRef<string | null>(null);

  const backendHost = env.NEXT_PUBLIC_API_URL.replace(/\/api\/?$/, "");
  const frontendHost = env.NEXT_PUBLIC_FRONTEND_URL;

  const authCode = `${frontendHost}/authorize
  ?response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/auth/callback
  &scope=openid profile email
  &state=RANDOM_STATE
  &nonce=RANDOM_NONCE
  &code_challenge=BASE64URL_SHA256_OF_VERIFIER
  &code_challenge_method=S256`;

  const tokenCode = `# Exchange the code for tokens (server side)
curl -X POST ${backendHost}/o/token \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=authorization_code" \\
  -d "client_id=YOUR_CLIENT_ID" \\
  -d "client_secret=YOUR_CLIENT_SECRET" \\
  -d "code=AUTHORIZATION_CODE" \\
  -d "redirect_uri=https://yourapp.com/auth/callback" \\
  -d "code_verifier=YOUR_PKCE_VERIFIER"`;

  const tokenResponse = `{
  "access_token": "eyJhbGciOi...",
  "id_token": "eyJhbGciOi...",
  "refresh_token": "a1b2c3...",
  "token_type": "Bearer",
  "expires_in": 3600,
  "scope": "openid profile email"
}`;

  const nextAuthCode = `import NextAuth from "next-auth";

export const authOptions = {
  providers: [
    {
      id: "chaiauth",
      name: "ChaiAuth",
      type: "oauth",
      wellKnown: "${backendHost}/.well-known/openid-configuration",
      clientId: process.env.CHAIAUTH_CLIENT_ID,
      clientSecret: process.env.CHAIAUTH_CLIENT_SECRET,
      authorization: { params: { scope: "openid profile email" } },
      idToken: true,
      checks: ["pkce", "state"],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
        };
      },
    },
  ],
};

export default NextAuth(authOptions);`;

  const {
    sdkProviderCode,
    sdkUsageCode,
    embeddedFormsCode,
    embeddedBackendCode,
    brandedEmailsCode,
    loginContextCode,
    apiKeyCode,
    apiKeyResponse,
    tokenNodeCode,
    tokenPythonCode,
    apiKeyNodeCode,
    apiKeyPythonCode,
  } = buildSnippets(backendHost, frontendHost);

  const oauthErrorCode = `HTTP/1.1 400 Bad Request

{
  "success": false,
  "message": "Invalid or expired authorization code",
  "code": "BAD_REQUEST",
  "error": "invalid_grant",
  "error_description": "Invalid or expired authorization code"
}`;

  const generalErrorCode = `HTTP/1.1 400 Bad Request

{
  "success": false,
  "message": "Too small: expected string to have >=1 characters",
  "code": "VALIDATION_ERROR",
  "details": [
    { "part": "query", "path": "state", "message": "Too small: expected string to have >=1 characters" }
  ]
}`;

  const rateLimitCode = `HTTP/1.1 429 Too Many Requests
Retry-After: 42

{
  "success": false,
  "message": "Too many authentication attempts, please try again after 1 minute",
  "code": "TOO_MANY_REQUESTS"
}`;

  const tokenTabs = [
    { id: "curl", label: "cURL", code: tokenCode },
    { id: "node", label: "Node", code: tokenNodeCode },
    { id: "python", label: "Python", code: tokenPythonCode },
  ];
  const apiKeyTabs = [
    { id: "curl", label: "cURL", code: apiKeyCode },
    { id: "node", label: "Node", code: apiKeyNodeCode },
    { id: "python", label: "Python", code: apiKeyPythonCode },
  ];

  // Keep the selected page in sync with the URL hash (deep links, back/forward)
  // Scroll to a sub-heading queued by a search result, a TOC click or a deep link
  const flushAnchor = useCallback(() => {
    const id = pendingAnchor.current;
    if (!id) return;
    const el = document.getElementById(id);
    if (el) {
      pendingAnchor.current = null;
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const fromHash = () => {
      const id = window.location.hash.slice(1);
      if (ALL_IDS.includes(id)) {
        setPage(id);
      } else if (ANCHOR_PAGE[id]) {
        pendingAnchor.current = id;
        setPage(ANCHOR_PAGE[id]);
        flushAnchor(); // already on that page; otherwise the page effect below does it
      }
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [flushAnchor]);

  // Collect this page's headings for "On this page" and highlight the one being read
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("main [data-toc]"));
    const items = els.map((el) => {
      const isH3 = el.tagName === "H3";
      const heading = isH3 ? el : el.querySelector("h2");
      return { id: el.id, label: heading?.textContent?.trim() ?? "", level: (isH3 ? 3 : 2) as 2 | 3 };
    });
    // Deferred one frame so the state updates are not synchronous inside the effect
    const raf = requestAnimationFrame(() => {
      setToc(items);
      setActiveToc(items[0]?.id ?? "");
      flushAnchor();
    });

    const observer = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActiveToc(e.target.id)),
      { rootMargin: "-15% 0px -70% 0px" },
    );
    els.forEach((el) => observer.observe(el));
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, [page, flushAnchor]);

  // Ctrl/Cmd+K or "/" opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
        return;
      }
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reading progress (resets when the page changes)
  useEffect(() => {
    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [page]);

  // Open a docs page, optionally scrolling to a sub-heading inside it
  const jump = (id: string, anchor?: string) => {
    setOpen(false);
    setSearchOpen(false);
    setPage(id);
    window.history.pushState(null, "", `#${anchor ?? id}`);
    if (anchor) {
      pendingAnchor.current = anchor;
      if (id === page) flushAnchor();
    } else {
      window.scrollTo({ top: 0 });
    }
  };

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string, anchor?: string) => {
    e.preventDefault();
    jump(id, anchor);
  };

  const onSearchSelect = (entry: SearchEntry) => jump(entry.page, entry.anchor);

  // A render helper, not a component: components must not be created during render
  const renderNav = (compact = false) => (
    <nav className="space-y-6" aria-label="Documentation">
      {NAV.map((g) => (
        <div key={g.group}>
          <p className="ca-mono px-2 text-[0.65rem] uppercase text-muted-foreground" style={{ letterSpacing: ".16em" }}>
            {g.group}
          </p>
          <div className="mt-2 grid gap-0.5">
            {g.items.map((item) => {
              const active = activeSection === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  onClick={(e) => go(e, item.id)}
                  className={`relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-all ${
                    active
                      ? "bg-primary/12 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-accent/60 hover:text-foreground"
                  }`}
                >
                  {active && !compact && (
                    <span className="absolute -left-px top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                  )}
                  {item.label}
                  <ChevronRight className={`h-3.5 w-3.5 transition-all ${active ? "translate-x-0.5 opacity-100 text-primary" : "opacity-0"}`} />
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <div className="ca-root min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="rounded-md p-1 text-foreground transition-colors hover:bg-secondary lg:hidden"
              aria-label="Toggle menu"
              aria-expanded={open}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
            <span className="ml-2 hidden border-l border-border pl-5 text-sm text-muted-foreground sm:block">Documentation</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              aria-label="Search the docs"
              className="flex h-10 items-center gap-2 rounded-lg border border-border bg-background/50 px-3 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
            >
              <Search className="h-4 w-4" />
              <span className="hidden md:block">Search docs</span>
              <kbd className="ca-mono hidden rounded border border-border px-1.5 py-0.5 text-[0.65rem] md:block">Ctrl K</kbd>
            </button>
            <Link href="/" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
              Home
            </Link>
            <Link href="/developer" className="ca-btn ca-btn-ghost !h-10 max-sm:!hidden">Developer console</Link>
            <Link href="/register" className="ca-btn ca-btn-primary !h-9 !px-4 sm:!h-10 sm:!px-5">Get started</Link>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-transparent">
          <div
            className="h-px bg-gradient-to-r from-[var(--chai-bright)] to-[var(--chai-mid)] shadow-[0_0_10px_var(--chai-mid)]"
            style={{ width: `${progress}%`, transition: "width .1s linear" }}
          />
        </div>
      </header>

      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} onSelect={onSearchSelect} />}

      {/* Mobile nav */}
      <div className={`grid overflow-hidden border-b border-border bg-background/95 transition-[grid-template-rows] duration-300 lg:hidden ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr] border-b-0"}`}>
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 py-5">{renderNav(true)}</div>
        </div>
      </div>

      <div className="mx-auto grid max-w-7xl lg:grid-cols-[250px_minmax(0,1fr)] xl:grid-cols-[250px_minmax(0,1fr)_230px]">
        {/* Left sidebar */}
        <aside className="hidden border-r border-border/70 px-5 py-10 lg:sticky lg:top-16 lg:block lg:h-[calc(100vh-4rem)] lg:overflow-y-auto">
          {renderNav()}
        </aside>

        {/* Content */}
        <main className="min-w-0 px-5 pb-32 sm:px-10">
          {/* Breadcrumb on every page except the first, which has the hero */}
          {page !== "quick-start" && (
            <p className="ca-mono pb-8 pt-12 text-[0.7rem] uppercase text-muted-foreground lg:pt-16" style={{ letterSpacing: ".16em" }}>
              {FLAT[index]?.group} / {FLAT[index]?.label}
              <span className="ml-3 normal-case tracking-normal opacity-70">· {DOCS_VERSION} · Updated {DOCS_UPDATED}</span>
            </p>
          )}
          {/* Hero */}
          <div className={`relative -mx-5 overflow-hidden px-5 pb-12 pt-12 sm:-mx-10 sm:px-10 lg:pt-16 ${page === "quick-start" ? "" : "hidden"}`}>
            <div className="ca-aurora opacity-70"><span /><span /><span /></div>
            <div className="ca-grid pointer-events-none absolute inset-0" />
            <div className="relative ca-fade-up">
              <span className="ca-eyebrow"><BookOpen className="h-3.5 w-3.5" /> ChaiAuth docs · {DOCS_VERSION} · Updated {DOCS_UPDATED}</span>
              <h1 className="mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-foreground sm:text-5xl" style={{ fontFamily: '"Sora", sans-serif' }}>
                Add sign-in to your app <span className="ca-text-chai-anim">in minutes.</span>
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-text-soft">
                ChaiAuth is an OpenID Connect provider. Passkeys, two-factor auth, sessions and consent all run on our UI.
                Your app just speaks standard OIDC.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <a href="#quick-start" onClick={(e) => go(e, "quick-start")} className="ca-btn ca-btn-primary">
                  Quick start <ArrowRight className="h-4 w-4" />
                </a>
                <Link href="/developer" className="ca-btn ca-btn-ghost">Open developer console</Link>
              </div>
            </div>
          </div>

          <Page id="quick-start" active={page}>
          <H2 id="quick-start" sub="Three steps from zero to a signed-in user.">Quick start</H2>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { icon: KeyRound, n: "01", t: "Create an app", d: "Register your name and callback URL in the console." },
              { icon: Code2, n: "02", t: "Redirect to sign-in", d: "Send users to /authorize with state and a PKCE challenge." },
              { icon: ShieldCheck, n: "03", t: "Exchange the code", d: "Swap the code for tokens on your server." },
            ].map(({ icon: Icon, n, t, d }, i) => (
              <Reveal key={n} delay={i * 90}>
                <article className="ca-glass ca-spot h-full rounded-2xl p-5">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/20">
                    <Icon className="h-5 w-5" />
                  </span>
                  <p className="ca-mono mt-5 text-[0.65rem] text-muted-foreground">STEP {n}</p>
                  <h3 className="mt-1 font-semibold text-foreground">{t}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{d}</p>
                </article>
              </Reveal>
            ))}
          </div>
          </Page>

          <Page id="configure-your-app" active={page}>
          <H2
            id="configure-your-app"
            sub="Create credentials in the developer console. Redirect URIs must use HTTPS (http is allowed only for localhost) and are matched exactly."
          >
            Configure your app
          </H2>
          <Reveal className="mt-6">
            <div className="ca-glass overflow-x-auto rounded-2xl">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3.5 font-medium">Setting</th>
                    <th className="px-5 py-3.5 font-medium">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {[
                    ["Client ID", "ca_live_8f2k1m9qz4"],
                    ["App URL", "https://yourapp.com"],
                    ["Redirect URI", "https://yourapp.com/auth/callback"],
                    ["Scopes", "openid profile email"],
                  ].map(([k, v]) => (
                    <tr key={k} className="transition-colors hover:bg-accent/30">
                      <td className="px-5 py-3.5 text-muted-foreground">{k}</td>
                      <td className="ca-mono px-5 py-3.5 text-foreground">{v}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          </Page>

          <Page id="authjs" active={page}>
          <H2
            id="authjs"
            sub="ChaiAuth publishes an OpenID discovery document, so Auth.js finds the token, userinfo and JWKS endpoints by itself."
          >
            Auth.js / NextAuth
          </H2>
          <H3 id="authjs-install">Install Auth.js</H3>
          <Reveal className="mt-4">
            <CodeBlock label="terminal" code="npm install next-auth" plain />
          </Reveal>
          <H3 id="authjs-configure">Configure the provider</H3>
          <Reveal className="mt-4">
            <CodeBlock label="app/api/auth/[...nextauth]/route.ts" code={nextAuthCode} />
          </Reveal>
          <Callout>
            Using another library? Point it at <code className="ca-mono text-primary">{backendHost}/.well-known/openid-configuration</code> and
            use the Authorization Code flow with PKCE.
          </Callout>
          </Page>

          <Page id="authorization-flow" active={page}>
          <H2 id="authorization-flow" sub="Send the browser to the sign-in and consent screen. Generate a fresh state and PKCE pair for every request.">
            Authorization flow
          </H2>
          <Reveal className="mt-6">
            <CodeBlock label="authorization request" code={authCode} plain />
            <Link href="/authorize" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3">
              Preview consent screen <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
          </Page>

          <Page id="token-exchange" active={page}>
          <H2 id="token-exchange" sub="Do this on your server so the client secret never reaches the browser. Public clients (SPA / mobile) skip client_secret and rely on PKCE.">
            Token exchange
          </H2>
          <H3 id="token-request">Token request</H3>
          <Reveal className="mt-4">
            <CodeTabs label="POST /o/token" tabs={tokenTabs} />
          </Reveal>
          <H3 id="token-response">Token response</H3>
          <Reveal className="mt-4">
            <CodeBlock label="response" code={tokenResponse} />
          </Reveal>
          <Callout>
            Use <code className="ca-mono text-primary">grant_type=refresh_token</code> with your refresh token to get new access tokens.
          </Callout>
          </Page>

          <Page id="react-sdk" active={page}>
          <H2
            id="react-sdk"
            sub="@chaiauth/react runs the whole flow for you: PKCE, state and nonce checks, token refresh and sign-out, with ready-made components."
          >
            React SDK
          </H2>
          <H3 id="sdk-provider">Wrap your app in the provider</H3>
          <Reveal className="mt-4">
            <CodeBlock label="providers.tsx" code={sdkProviderCode} />
          </Reveal>
          <H3 id="sdk-usage">Use the SDK in a component</H3>
          <Reveal className="mt-4">
            <CodeBlock label="header.tsx" code={sdkUsageCode} />
          </Reveal>
          <Callout>
            The SDK uses PKCE, so your client secret is never needed in the browser. The provider finishes sign-in on whatever
            page your redirect URI points to, so that page only has to render inside{" "}
            <code className="ca-mono text-primary">&lt;ChaiAuthProvider&gt;</code>. The package lives in this repo (
            <code className="ca-mono text-primary">packages/react</code>) until it is published to npm.
          </Callout>
          </Page>

          <Page id="embedded-sign-in" active={page}>
          <H2
            id="embedded-sign-in"
            sub="Like Clerk: the form lives in your own page and theme. Your users never see a ChaiAuth screen."
          >
            Embedded sign-in forms
          </H2>
          <H3 id="embedded-form">Drop in the sign-in form</H3>
          <Reveal className="mt-4">
            <CodeBlock label="login.tsx" code={embeddedFormsCode} />
          </Reveal>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Sign in", "Email + password, optional email code (passwordless) and social buttons."],
              ["Two-factor", "Accounts with an authenticator app get a code step inside the form automatically."],
              ["Sign up", "Name, email and password with the Cloudflare Turnstile anti-bot check. The user verifies their email, then signs in."],
              ["Theming", "Unset tokens inherit your page's colour and font. Pass appearance.variables (CSS variables) or appearance.classNames (Tailwind)."],
            ].map(([t, d]) => (
              <div key={t} className="ca-glass rounded-2xl p-5">
                <div className="text-sm font-semibold text-foreground">{t}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <Callout>
            <strong>Required:</strong> set your app&apos;s <em>Application URL</em> in the developer console to the site that
            hosts the form (for example <code className="ca-mono text-primary">https://yourapp.com</code>). ChaiAuth only accepts
            embedded sign-ins from that origin. Also add the same domain to your Turnstile widget for sign-up.
          </Callout>
          <H3 id="embedded-backend-mode">Keep the client secret on your server</H3>
          <Reveal className="mt-4 space-y-5">
            <CodeBlock label="backend mode" code={embeddedBackendCode} />
          </Reveal>
          <Callout>
            Without <code className="ca-mono text-primary">getAuthContext</code> the SDK runs as a public client and finishes
            the sign-in in the browser (PKCE only). With it, your server owns the PKCE verifier and client secret, and the browser
            only ever holds a one-time code. Passwords go from the browser straight to ChaiAuth and never touch your server.
          </Callout>
          </Page>

          <Page id="branded-emails" active={page}>
          <H2
            id="branded-emails"
            sub="When a user acts on YOUR site, every email goes out as your app. They never learn that ChaiAuth exists."
          >
            Branded emails
          </H2>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {[
              ["Sent as your app", "Verify email, welcome, reset password, password changed, sign-in codes and new-device alerts use your app's name, logo, colour and sender name. 'ChaiAuth' appears nowhere."],
              ["Links go to your site", "Verification and reset links open your own /verify-email and /reset-password pages, which render the SDK components below."],
              ["Set it once", "In the developer console, open your app and set Application URL, Sender name, Logo URL and Brand colour."],
              ["Only for your users", "App-branded email is sent only to people who signed up or signed in through your app. Everyone else gets nothing (reset) or a neutral ChaiAuth email (codes)."],
            ].map(([t, d]) => (
              <div key={t} className="ca-glass rounded-2xl p-5">
                <div className="text-sm font-semibold text-foreground">{t}</div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{d}</p>
              </div>
            ))}
          </div>
          <Reveal className="mt-6 space-y-5">
            <CodeBlock label="your pages" code={brandedEmailsCode} />
          </Reveal>
          <Callout>
            <strong>Sender address:</strong> the display name is your app&apos;s, but the address is ChaiAuth&apos;s verified
            sending domain. To send from your own domain (for example{" "}
            <code className="ca-mono text-primary">noreply@yourapp.com</code>), the ChaiAuth operator has to verify that domain
            with the email provider. <strong>Not covered:</strong> Google&apos;s own consent screen still shows the name of the
            Google OAuth client, which is ChaiAuth&apos;s.
          </Callout>
          </Page>

          <Page id="endpoints" active={page}>
          <H2 id="endpoints" sub={`Base URL: ${backendHost}`}>Endpoints</H2>
          <Reveal className="mt-6">
            <div className="ca-glass divide-y divide-border overflow-hidden rounded-2xl">
              {[
                ["GET", "/.well-known/openid-configuration", "OpenID provider metadata"],
                ["GET", "/.well-known/jwks.json", "Public keys to verify ID tokens (RS256)"],
                ["GET", "/o/authorize", "Validate an authorization request"],
                ["POST", "/o/authorize", "Embedded sign-in: credentials in, authorization code out"],
                ["POST", "/o/authorize/mfa", "Embedded sign-in: second factor (authenticator or backup code)"],
                ["POST", "/o/register", "Embedded sign-up (needs a Turnstile token)"],
                ["POST", "/o/email-code", "Embedded passwordless: email a 6-digit sign-in code"],
                ["POST", "/o/forgot-password", "Embedded: email a reset link that opens on your site"],
                ["POST", "/o/reset-password", "Embedded: set a new password with the emailed token"],
                ["POST", "/o/verify-email", "Embedded: confirm an email address with the emailed token"],
                ["POST", "/o/token", "Exchange a code or refresh token for tokens"],
                ["GET", "/o/userinfo", "Read approved profile claims (Bearer token)"],
                ["POST", "/o/revoke", "Revoke a token"],
                ["GET", "/v1/users", "List users who granted your app access (API key)"],
                ["GET", "/v1/users/:userId", "Read one user's approved claims (API key)"],
              ].map(([method, path, desc]) => (
                <div key={path} className="grid gap-2 p-4 transition-colors hover:bg-accent/30 sm:grid-cols-[64px_minmax(0,1.2fr)_1fr] sm:items-center sm:gap-4 sm:px-5">
                  <span className={`ca-mono w-fit rounded-md px-2 py-0.5 text-[0.7rem] font-bold ring-1 ${METHOD_STYLE[method]}`}>{method}</span>
                  <code className="ca-mono break-all text-sm text-foreground">{path}</code>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </Reveal>
          </Page>

          <Page id="scopes" active={page}>
          <H2 id="scopes" sub="Request only what you need. Unsupported scopes are ignored; a request with no supported scope is rejected.">
            Scopes &amp; claims
          </H2>
          <Reveal className="mt-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ["openid", "Required for OIDC. Returns an ID token with the sub claim."],
                ["profile", "The user's name."],
                ["email", "The user's email and email_verified."],
                ["login_context", "Device, IP and approximate location of each sign-in, in the ID token."],
              ].map(([s, d]) => (
                <div key={s} className="ca-glass rounded-2xl p-5">
                  <code className="ca-mono rounded-md bg-primary/12 px-2 py-1 text-xs text-[var(--chai-soft)]">{s}</code>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>
          </Page>

          <Page id="login-context" active={page}>
          <H2
            id="login-context"
            sub="Every sign-in is recorded and the facts are handed to your app, so you never write device or location detection yourself."
          >
            Login context
          </H2>
          <Reveal className="mt-6 space-y-5">
            <CodeBlock label="ID token" code={loginContextCode} />
          </Reveal>
          <Callout>
            <strong>What it is:</strong> the sign-in request&apos;s IP, browser, OS, device type and language, plus a location
            looked up from the IP in an offline database (the IP is never sent to a third party). Location is approximate, city
            level at best, and not a GPS position. <strong>What ChaiAuth does with it:</strong> keeps a login history per user
            and emails them when a sign-in comes from an unfamiliar browser, OS and country combination.{" "}
            <strong>What you do:</strong> store it in your own database (use <code className="ca-mono text-primary">event_id</code>{" "}
            as a unique key so a replayed callback cannot add a duplicate), show it in your account-security page, or step up
            verification when <code className="ca-mono text-primary">is_new_device</code> is true. In browser-only mode the SDK
            exposes it as <code className="ca-mono text-primary">user.login_context</code>. Only request the scope if you need it.
          </Callout>
          </Page>

          <Page id="server-api" active={page}>
          <H2
            id="server-api"
            sub="Create an API key in the developer console (open your app, then API keys) to call ChaiAuth from your own backend, without a user present."
          >
            Server API &amp; keys
          </H2>
          <H3 id="api-request">Make an API request</H3>
          <Reveal className="mt-4">
            <CodeTabs label="GET /v1/users" tabs={apiKeyTabs} />
          </Reveal>
          <H3 id="api-response">API response</H3>
          <Reveal className="mt-4">
            <CodeBlock label="GET /v1/users/:userId" code={apiKeyResponse} />
          </Reveal>
          <Callout>
            Keys are shown once, stored only as a hash, can expire, and can be revoked at any time. You can read only users who
            approved <em>your</em> app, and only the claims their consent covers. Each key is limited to 120 requests per minute.
          </Callout>
          </Page>

          <Page id="error-reference" active={page}>
          <H2
            id="error-reference"
            sub="What each error means, the exact message your app receives, and how to fix it. Match on the error code or HTTP status, never on the message text."
          >
            Error reference
          </H2>
          <H3 id="error-format">Response format</H3>
          <Reveal className="mt-4 space-y-5">
            <CodeBlock label="OAuth error (token endpoint, userinfo, consent)" code={oauthErrorCode} />
            <CodeBlock label="General error (everything else)" code={generalErrorCode} />
          </Reveal>
          <Callout>
            OAuth errors always carry <code className="ca-mono text-primary">error</code> and{" "}
            <code className="ca-mono text-primary">error_description</code>, so standard OAuth libraries understand them. Their{" "}
            <code className="ca-mono text-primary">code</code> field is always <code className="ca-mono text-primary">BAD_REQUEST</code>,
            even on a 401, so read <code className="ca-mono text-primary">error</code> instead. Malformed requests are reported as{" "}
            <code className="ca-mono text-primary">VALIDATION_ERROR</code> (not <code className="ca-mono text-primary">invalid_request</code>
            ), including an unsupported <code className="ca-mono text-primary">grant_type</code>.
          </Callout>
          <H3 id="oauth-errors">OAuth errors</H3>
          <Reveal className="mt-4">
            <ErrorList rows={OAUTH_ERRORS} />
          </Reveal>
          <H3 id="general-errors">Other errors</H3>
          <Reveal className="mt-4">
            <ErrorList rows={GENERAL_ERRORS} />
          </Reveal>
          </Page>

          <Page id="rate-limits" active={page}>
          <H2
            id="rate-limits"
            sub="Limits protect sign-in from abuse. They are counted in Redis, so they hold across servers, and they stack: a request must pass every limit that applies to it."
          >
            Rate limits
          </H2>
          <Reveal className="mt-6">
            <RateLimitTable />
          </Reveal>
          <H3 id="rate-limit-429">When you hit a limit</H3>
          <Reveal className="mt-4 space-y-5">
            <CodeBlock label="429 Too Many Requests" code={rateLimitCode} />
          </Reveal>
          <Callout>
            Limits are per IP address, so a request made by your <em>server</em> (for example the token exchange) counts against your
            server&apos;s IP, while requests from a browser count against that user&apos;s IP. The response carries the standard{" "}
            <code className="ca-mono text-primary">RateLimit-*</code> headers and, once limited,{" "}
            <code className="ca-mono text-primary">Retry-After</code>. Wait that long, then retry with exponential backoff.
          </Callout>
          <H3 id="rate-limit-tips">Staying under the limits</H3>
          <Reveal className="mt-4">
            <ul className="ca-glass space-y-4 rounded-2xl p-6 text-sm leading-6 text-text-soft">
              {[
                "Reuse an access token for its full hour and refresh it instead of sending the user through sign-in again.",
                "Exchange each authorization code exactly once. Retrying a used code only burns your quota.",
                "Do not poll /v1/users. Read a user when you need them and cache the result.",
                "Use one API key per service so a busy service cannot exhaust another one's 120 requests per minute.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-good/15 text-good">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          </Page>

          <Page id="troubleshooting" active={page}>
          <H2 id="troubleshooting" sub="The questions developers ask most, with the quickest fix. If yours is not here, check the Error reference.">
            Troubleshooting &amp; FAQ
          </H2>
          <Reveal className="mt-8">
            <FaqList />
          </Reveal>
          <Callout>
            Still stuck? <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">Contact us</Link>{" "}
            with the endpoint, the time of the request and the <code className="ca-mono text-primary">error</code> or{" "}
            <code className="ca-mono text-primary">code</code> you received. Never send a client secret, API key or token.
          </Callout>
          </Page>

          <Page id="security-notes" active={page}>
          <H2 id="security-notes">Security notes</H2>
          <Reveal className="mt-6">
            <ul className="ca-glass space-y-4 rounded-2xl p-6 text-sm leading-6 text-text-soft">
              {[
                "Use PKCE (S256) for every public client and single-page application.",
                "Generate and validate a unique state value for every request.",
                "Keep client secrets on your server. Never expose them in browser code.",
                "Use exact redirect URI matching and HTTPS in production.",
                "Verify ID tokens against the JWKS endpoint before trusting them.",
                "Treat API keys like passwords: server side only, one per service, revoke on suspicion.",
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-good/15 text-good">
                    <Check className="h-3 w-3" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          </Page>

          {/* Previous / next */}
          <div className="mt-16 grid gap-3 border-t border-border/70 pt-8 sm:grid-cols-2">
            {prev ? (
              <a href={`#${prev.id}`} onClick={(e) => go(e, prev.id)} className="ca-glass group rounded-2xl p-4 transition-colors hover:bg-accent/30">
                <span className="text-xs text-muted-foreground">Previous</span>
                <span className="mt-1 flex items-center gap-2 text-sm font-semibold text-foreground">
                  <ChevronRight className="h-4 w-4 rotate-180 text-primary transition-transform group-hover:-translate-x-0.5" />
                  {prev.label}
                </span>
              </a>
            ) : (
              <span />
            )}
            {next && (
              <a href={`#${next.id}`} onClick={(e) => go(e, next.id)} className="ca-glass group rounded-2xl p-4 text-right transition-colors hover:bg-accent/30 sm:col-start-2">
                <span className="text-xs text-muted-foreground">Next</span>
                <span className="mt-1 flex items-center justify-end gap-2 text-sm font-semibold text-foreground">
                  {next.label}
                  <ChevronRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-0.5" />
                </span>
              </a>
            )}
          </div>
        </main>

        {/* Right rail */}
        <aside className="hidden border-l border-border/70 px-6 py-14 xl:block">
          <div className="sticky top-28 space-y-6">
            {toc.length > 1 && (
              <div>
                <p className="ca-mono text-[0.65rem] uppercase text-muted-foreground" style={{ letterSpacing: ".16em" }}>On this page</p>
                <ul className="mt-3 space-y-1 border-l border-border">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a
                        href={`#${item.id}`}
                        onClick={(e) => go(e, page, item.id === page ? undefined : item.id)}
                        className={`-ml-px block border-l py-1 text-xs transition-colors ${item.level === 3 ? "pl-7" : "pl-4"} ${
                          activeToc === item.id
                            ? "border-primary font-medium text-foreground"
                            : "border-transparent text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="ca-glass rounded-2xl p-4">
              <BookOpen className="h-5 w-5 text-primary" />
              <p className="mt-3 text-sm font-medium text-foreground">Need a hand?</p>
              <p className="mt-1.5 text-xs leading-5 text-muted-foreground">Ask us anything about integrating ChaiAuth.</p>
              <Link href="/contact" className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:gap-2.5 transition-all">
                Contact us <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
