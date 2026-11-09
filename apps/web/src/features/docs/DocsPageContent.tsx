"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Logo } from "@/shared/components/Logo";
import { env } from "@/config/env";
import { 
  Menu, 
  X, 
  ChevronRight, 
  KeyRound, 
  Code2, 
  ShieldCheck, 
  Clipboard, 
  Check, 
  ArrowRight,
  BookOpen
} from "lucide-react";
import { toast } from "sonner";

export function DocsPageContent() {
  const [open, setOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("quick-start");

  const nav = ["Quick start", "Configure your app", "NextAuth.js Integration", "Authorization flow", "Endpoints", "Security notes"];
  const backendHost = env.NEXT_PUBLIC_API_URL.replace("/api", "");
  const frontendHost = env.NEXT_PUBLIC_FRONTEND_URL;

  const authCode = `${backendHost}/o/authorize?
  response_type=code
  &client_id=YOUR_CLIENT_ID
  &redirect_uri=${frontendHost}/callback
  &scope=profile email
  &state=xyz123
  &code_challenge=abc...
  &code_challenge_method=S256`;

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

  // Simple syntax highlighting for the demo
  const nextAuthHighlighted = nextAuthCode
    .replace(/(import|from|export|const|return)/g, '<span class="text-primary">$1</span>')
    .replace(/(providers|id|name|type|wellKnown|clientId|clientSecret|authorization|idToken|checks|profile|params|scope)(?=:)/g, '<span class="text-orange-300">$1</span>')
    .replace(/("[^"]*")/g, '<span class="text-good">$1</span>');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0.1 }
    );

    const sections = document.querySelectorAll("section[id]");
    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
    };
  }, []);

  async function copyCode(text: string, id: string) {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success("Code copied");
    window.setTimeout(() => setCopiedId(null), 1600);
  }

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    setOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <div className="ca-root dark min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setOpen(!open)}
              className="lg:hidden p-1 rounded-md text-foreground hover:bg-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
            <Logo />
            <span className="hidden border-l border-border pl-5 ml-2 text-sm text-muted-foreground sm:block">
              Documentation
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/developer" className="ca-btn ca-btn-ghost hidden sm:inline-flex">
              Developer Console
            </Link>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="mx-auto grid max-w-7xl lg:grid-cols-[230px_minmax(0,760px)_220px]">
        
        {/* Left Sidebar (Table of Contents) */}
        <aside className={`border-b border-border px-5 py-4 lg:block lg:h-[calc(100vh-4rem)] lg:sticky lg:top-16 lg:overflow-y-auto lg:border-b-0 lg:border-r lg:py-8 ${!open && "hidden"}`}>
          <p className="ca-mono px-2 text-[0.65rem] uppercase text-muted-foreground" style={{ letterSpacing: ".16em" }}>
            Get started
          </p>
          <nav className="mt-3 grid gap-1">
            {nav.map((item) => {
              const id = item.toLowerCase().replaceAll(" ", "-");
              return (
                <a 
                  key={item} 
                  href={`#${id}`} 
                  onClick={(e) => handleNavClick(e, id)} 
                  className={`flex items-center justify-between rounded-md px-2 py-2 text-sm transition-colors ${
                    activeSection === id ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                  }`}
                >
                  {item}
                  <ChevronRight className={`h-3.5 w-3.5 transition-transform ${activeSection === id ? "translate-x-0.5 opacity-100" : "opacity-0"}`} />
                </a>
              );
            })}
          </nav>
        </aside>

        {/* Documentation Content */}
        <main className="min-w-0 px-5 py-10 pb-[40vh] sm:px-9 lg:py-14 ca-fade-up">
          <p className="ca-mono text-[0.7rem] uppercase text-primary" style={{ letterSpacing: ".18em" }}>
            ChaiAuth docs · v1 demo
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>
            Add sign-in to your app.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">
            ChaiAuth is a fully OIDC-compliant Auth provider that natively handles Passkeys (WebAuthn), Two-Factor Authentication (TOTP), Session Management, and user lifecycles. This guide demonstrates how to integrate it into your application.
          </p>

          <section id="quick-start" className="mt-12 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Quick start</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[
                { icon: KeyRound, n: "01", t: "Create an app", d: "Register your name and callback URL." },
                { icon: Code2, n: "02", t: "Build the request", d: "Generate state, verifier, and PKCE challenge." },
                { icon: ShieldCheck, n: "03", t: "Exchange the code", d: "Validate the response on your server." }
              ].map(({ icon: Icon, n, t, d }) => (
                <article key={n} className="rounded-md border border-border bg-secondary/45 p-4 hover:border-primary/20 transition-colors">
                  <Icon className="h-4 w-4 text-primary" />
                  <p className="ca-mono mt-5 text-[0.65rem] text-muted-foreground">STEP {n}</p>
                  <h3 className="mt-1 font-semibold text-foreground">{t}</h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{d}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="configure-your-app" className="mt-14 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Configure your app</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Create credentials in the Developer Console. Callback URLs must use HTTPS outside local development and must match exactly.
            </p>
            <div className="mt-5 overflow-x-auto rounded-md border border-border">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead className="bg-secondary">
                  <tr>
                    <th className="px-4 py-3 font-medium text-foreground">Setting</th>
                    <th className="px-4 py-3 font-medium text-foreground">Example</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">Client ID</td>
                    <td className="ca-mono px-4 py-3 text-foreground">ca_live_8f2k1m9qz4</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">App URL</td>
                    <td className="ca-mono px-4 py-3 text-foreground">https://yourapp.com</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">Redirect URI</td>
                    <td className="ca-mono px-4 py-3 text-foreground">https://yourapp.com/auth/callback</td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 text-muted-foreground">Scopes</td>
                    <td className="ca-mono px-4 py-3 text-foreground">openid profile email</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="nextauth.js-integration" className="mt-14 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>NextAuth.js Integration</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              ChaiAuth is fully OIDC compliant. You can easily integrate it into your Next.js application using NextAuth.js (v4) or Auth.js by configuring a custom OAuth provider.
            </p>
            
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">1. Install NextAuth</h3>
              <pre className="overflow-x-auto rounded-md border border-border bg-[#0d0d0d] p-3 text-[0.8rem] ca-mono text-muted-foreground">
                <code>npm install next-auth</code>
              </pre>
            </div>

            <div className="mt-6">
              <h3 className="text-sm font-semibold text-foreground mb-2">2. Configure Provider</h3>
              <p className="text-sm text-muted-foreground mb-3">Add the following to your <code className="ca-mono text-primary">pages/api/auth/[...nextauth].ts</code> or <code className="ca-mono text-primary">app/api/auth/[...nextauth]/route.ts</code> file:</p>
              
              <div className="relative group">
                <button 
                  className="absolute right-3 top-3 ca-btn ca-btn-ghost h-8 w-8 p-0 border border-border bg-[#0d0d0d] opacity-0 group-hover:opacity-100 transition-opacity" 
                  onClick={() => copyCode(nextAuthCode, "nextauth")}
                  title="Copy code"
                >
                  {copiedId === "nextauth" ? <Check className="h-4 w-4 text-good" /> : <Clipboard className="h-4 w-4 text-muted-foreground" />}
                </button>
                <pre className="overflow-x-auto rounded-md border border-border bg-[#0d0d0d] p-5 text-[0.8rem] leading-6 ca-mono text-muted-foreground">
                  <code dangerouslySetInnerHTML={{ __html: nextAuthHighlighted }}></code>
                </pre>
              </div>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Because ChaiAuth exposes a <code className="ca-mono text-primary">/.well-known/openid-configuration</code> endpoint, NextAuth automatically discovers the Authorize, Token, and JWKS endpoints!
            </p>
          </section>

          <section id="authorization-flow" className="mt-14 scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Authorization flow</h2>
                <p className="mt-3 text-sm text-muted-foreground">Redirect the browser to the authorization endpoint.</p>
              </div>
              <button className="ca-btn ca-btn-ghost shrink-0 border border-border hover:bg-accent" onClick={() => copyCode(authCode, "auth")}>
                {copiedId === "auth" ? <Check className="h-4 w-4 text-good mr-2" /> : <Clipboard className="h-4 w-4 mr-2" />}
                {copiedId === "auth" ? "Copied" : "Copy"}
              </button>
            </div>
            <pre className="mt-5 overflow-x-auto rounded-md border border-border bg-[#0d0d0d] p-5 text-[0.78rem] leading-6 ca-mono text-primary/80">
              <code>{authCode}</code>
            </pre>
            <Link href="/authorize" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:gap-3 transition-all">
              Preview consent screen <ArrowRight className="h-4 w-4" />
            </Link>
          </section>

          <section id="endpoints" className="mt-14 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Endpoints</h2>
            <div className="mt-5 divide-y divide-border rounded-md border border-border">
              {[
                ["GET", "/o/authorize", "Start an authorization request (Consent Screen)"],
                ["POST", "/o/token", "Exchange authorization code for access token"],
                ["GET", "/.well-known/openid-configuration", "Read OpenID provider metadata"],
                ["GET", "/o/userinfo", "Read approved user profile claims"],
                ["POST", "/o/revoke", "Revoke an active token"]
              ].map(([method, path, desc]) => (
                <div key={path} className="grid gap-1 p-4 sm:grid-cols-[56px_1fr_1.2fr] sm:items-center">
                  <span className="ca-mono text-xs font-bold text-primary">{method}</span>
                  <code className="break-all text-sm text-foreground">{path}</code>
                  <span className="text-xs text-muted-foreground">{desc}</span>
                </div>
              ))}
            </div>
          </section>

          <section id="security-notes" className="mt-14 scroll-mt-24">
            <h2 className="font-display text-2xl font-semibold text-foreground" style={{ fontFamily: '"Sora", sans-serif' }}>Security notes</h2>
            <ul className="mt-5 space-y-3 text-sm leading-6 text-muted-foreground">
              {[
                "Use PKCE for every public client and single-page application.",
                "Generate and validate a unique state value for every request.",
                "Keep client secrets on your server. Never expose them in browser code.",
                "Use exact redirect URI matching and HTTPS in production."
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-good" />
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Spacer to allow the last section to scroll up */}
          <div className="h-[60vh]"></div>
        </main>

        {/* Right Sidebar */}
        <aside className="hidden border-l border-border px-6 py-14 xl:block">
          <div className="sticky top-28">
            <BookOpen className="h-5 w-5 text-primary" />
            <p className="mt-3 text-sm font-medium text-foreground">Phase 1 demo docs</p>
            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              ChaiAuth handles all complex auth flows (Passkeys, MFA, Sessions) on its own UI, allowing you to just use standard OIDC to log users into your app.
            </p>
          </div>
        </aside>

      </div>
    </div>
  );
}
