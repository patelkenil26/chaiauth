"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import { env } from "@/config/env";
import { Menu, X, KeyRound, Code2, ShieldCheck, Check, ArrowRight, BookOpen, Info, ChevronRight } from "lucide-react";
import { CodeBlock } from "./CodeBlock";
import { buildSnippets } from "./snippets";
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
    ],
  },
  {
    group: "Reference",
    items: [
      { id: "endpoints", label: "Endpoints" },
      { id: "server-api", label: "Server API & keys" },
      { id: "scopes", label: "Scopes & claims" },
      { id: "security-notes", label: "Security notes" },
    ],
  },
];
const ALL_IDS = NAV.flatMap((g) => g.items.map((i) => i.id));

function H2({ id, children, sub }: { id: string; children: ReactNode; sub?: string }) {
  return (
    <section id={id} className="scroll-mt-24 pt-16 first:pt-0">
      <Reveal>
        <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl" style={{ fontFamily: '"Sora", sans-serif' }}>
          {children}
        </h2>
        {sub && <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">{sub}</p>}
      </Reveal>
    </section>
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
  const [activeSection, setActiveSection] = useState("quick-start");
  const [progress, setProgress] = useState(0);

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

  const { sdkProviderCode, sdkUsageCode, apiKeyCode, apiKeyResponse } = buildSnippets(backendHost, frontendHost);

  // Scroll spy + reading progress
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => e.isIntersecting && setActiveSection(e.target.id));
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0.1 },
    );
    ALL_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const onScroll = () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      setProgress(max > 0 ? Math.min(100, (h.scrollTop / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const go = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

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
    <div className="ca-root dark min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-3">
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
            <Link href="/" className="hidden rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground sm:block">
              Home
            </Link>
            <Link href="/developer" className="ca-btn ca-btn-ghost !h-10 hidden sm:inline-flex">Developer console</Link>
            <Link href="/register" className="ca-btn ca-btn-primary !h-10">Get started</Link>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-transparent">
          <div
            className="h-px bg-gradient-to-r from-[var(--chai-bright)] to-[var(--chai-mid)] shadow-[0_0_10px_var(--chai-mid)]"
            style={{ width: `${progress}%`, transition: "width .1s linear" }}
          />
        </div>
      </header>

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
          {/* Hero */}
          <div className="relative -mx-5 overflow-hidden px-5 pb-12 pt-12 sm:-mx-10 sm:px-10 lg:pt-16">
            <div className="ca-aurora opacity-70"><span /><span /><span /></div>
            <div className="ca-grid pointer-events-none absolute inset-0" />
            <div className="relative ca-fade-up">
              <span className="ca-eyebrow"><BookOpen className="h-3.5 w-3.5" /> ChaiAuth docs · v1</span>
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

          <H2
            id="authjs"
            sub="ChaiAuth publishes an OpenID discovery document, so Auth.js finds the token, userinfo and JWKS endpoints by itself."
          >
            Auth.js / NextAuth
          </H2>
          <Reveal className="mt-6 space-y-5">
            <CodeBlock label="terminal" code="npm install next-auth" plain />
            <CodeBlock label="app/api/auth/[...nextauth]/route.ts" code={nextAuthCode} />
          </Reveal>
          <Callout>
            Using another library? Point it at <code className="ca-mono text-primary">{backendHost}/.well-known/openid-configuration</code> and
            use the Authorization Code flow with PKCE.
          </Callout>

          <H2 id="authorization-flow" sub="Send the browser to the sign-in and consent screen. Generate a fresh state and PKCE pair for every request.">
            Authorization flow
          </H2>
          <Reveal className="mt-6">
            <CodeBlock label="authorization request" code={authCode} plain />
            <Link href="/authorize" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3">
              Preview consent screen <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>

          <H2 id="token-exchange" sub="Do this on your server so the client secret never reaches the browser. Public clients (SPA / mobile) skip client_secret and rely on PKCE.">
            Token exchange
          </H2>
          <Reveal className="mt-6 space-y-5">
            <CodeBlock label="POST /o/token" code={tokenCode} />
            <CodeBlock label="response" code={tokenResponse} />
          </Reveal>
          <Callout>
            Use <code className="ca-mono text-primary">grant_type=refresh_token</code> with your refresh token to get new access tokens.
          </Callout>

          <H2
            id="react-sdk"
            sub="@chaiauth/react runs the whole flow for you: PKCE, state and nonce checks, token refresh and sign-out, with ready-made components."
          >
            React SDK
          </H2>
          <Reveal className="mt-6 space-y-5">
            <CodeBlock label="providers.tsx" code={sdkProviderCode} />
            <CodeBlock label="header.tsx" code={sdkUsageCode} />
          </Reveal>
          <Callout>
            The SDK uses PKCE, so your client secret is never needed in the browser. The provider finishes sign-in on whatever
            page your redirect URI points to, so that page only has to render inside{" "}
            <code className="ca-mono text-primary">&lt;ChaiAuthProvider&gt;</code>. The package lives in this repo (
            <code className="ca-mono text-primary">packages/react</code>) until it is published to npm.
          </Callout>

          <H2 id="endpoints" sub={`Base URL: ${backendHost}`}>Endpoints</H2>
          <Reveal className="mt-6">
            <div className="ca-glass divide-y divide-border overflow-hidden rounded-2xl">
              {[
                ["GET", "/.well-known/openid-configuration", "OpenID provider metadata"],
                ["GET", "/.well-known/jwks.json", "Public keys to verify ID tokens (RS256)"],
                ["GET", "/o/authorize", "Validate an authorization request"],
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

          <H2 id="scopes" sub="Request only what you need. Unsupported scopes are ignored; a request with no supported scope is rejected.">
            Scopes &amp; claims
          </H2>
          <Reveal className="mt-6">
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["openid", "Required for OIDC. Returns an ID token with the sub claim."],
                ["profile", "The user's name."],
                ["email", "The user's email and email_verified."],
              ].map(([s, d]) => (
                <div key={s} className="ca-glass rounded-2xl p-5">
                  <code className="ca-mono rounded-md bg-primary/12 px-2 py-1 text-xs text-[var(--chai-soft)]">{s}</code>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{d}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <H2
            id="server-api"
            sub="Create an API key in the developer console (open your app, then API keys) to call ChaiAuth from your own backend, without a user present."
          >
            Server API &amp; keys
          </H2>
          <Reveal className="mt-6 space-y-5">
            <CodeBlock label="terminal" code={apiKeyCode} />
            <CodeBlock label="GET /v1/users/:userId" code={apiKeyResponse} />
          </Reveal>
          <Callout>
            Keys are shown once, stored only as a hash, can expire, and can be revoked at any time. You can read only users who
            approved <em>your</em> app, and only the claims their consent covers. Each key is limited to 120 requests per minute.
          </Callout>

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
        </main>

        {/* Right rail */}
        <aside className="hidden border-l border-border/70 px-6 py-14 xl:block">
          <div className="sticky top-28 space-y-6">
            <div>
              <p className="ca-mono text-[0.65rem] uppercase text-muted-foreground" style={{ letterSpacing: ".16em" }}>On this page</p>
              <ul className="mt-3 space-y-1.5 border-l border-border">
                {NAV.flatMap((g) => g.items).map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      onClick={(e) => go(e, item.id)}
                      className={`-ml-px block border-l py-1 pl-4 text-xs transition-colors ${
                        activeSection === item.id
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
