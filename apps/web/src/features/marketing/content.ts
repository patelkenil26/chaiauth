import {
  KeyRound, Fingerprint, ShieldCheck, Smartphone, Users, Share2, Download,
  MonitorSmartphone, Code2, Mail, Lock, Activity, Globe, Link2, Blocks, type LucideIcon,
} from "lucide-react";

export const navLinks = [
  { label: "Features", href: "/features" },
  { label: "Security", href: "/trust" },
  { label: "Pricing", href: "/pricing" },
  { label: "Docs", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
];

export const footerColumns = [
  {
    title: "Product",
    links: [
      { label: "Features", href: "/features" },
      { label: "Security", href: "/trust" },
      { label: "Pricing", href: "/pricing" },
      { label: "Changelog", href: "/changelog" },
    ],
  },
  {
    title: "Developers",
    links: [
      { label: "Documentation", href: "/docs" },
      { label: "Developer console", href: "/developer" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy policy", href: "/privacy" },
      { label: "Terms & conditions", href: "/terms" },
    ],
  },
];

export type Feature = { icon: LucideIcon; title: string; description: string };

export const features: Feature[] = [
  { icon: Mail, title: "Email & password", description: "Securely hashed passwords, email verification, and expiring reset links out of the box." },
  { icon: Share2, title: "Social login", description: "Sign in with Google and GitHub. Failures bring users back to a clear error, never a broken page." },
  { icon: Smartphone, title: "Multi-factor auth", description: "TOTP authenticator apps as a second factor, enforced at login." },
  { icon: Fingerprint, title: "Passkeys (WebAuthn)", description: "Passwordless sign-in with Touch ID, Windows Hello or a hardware key. Biometrics never leave the device." },
  { icon: KeyRound, title: "OpenID Connect provider", description: "Use ChaiAuth as the identity provider for your apps with Authorization Code + PKCE and standard discovery." },
  { icon: Code2, title: "Developer console", description: "Register applications, manage callback URLs, and rotate client secrets from one place." },
  { icon: MonitorSmartphone, title: "Sessions & devices", description: "See every active session with device and IP details, and revoke any of them instantly." },
  { icon: Activity, title: "Security activity", description: "A timeline of sign-ins and sensitive changes so you notice anything unusual." },
  { icon: Download, title: "Data export & deletion", description: "Your data belongs to you. Export it or delete your account whenever you want." },
  { icon: Link2, title: "Magic links", description: "Passwordless sign-in with a one-time email link that works once, expires in 15 minutes and still respects MFA." },
  { icon: KeyRound, title: "API keys & server API", description: "Create hashed, expiring, revocable keys per application and read the users who approved your app from your backend." },
  { icon: Blocks, title: "React SDK", description: "Drop in <SignIn /> and <UserButton /> with hooks. PKCE, token refresh and sign-out are handled for you." },
];

export const stats = [
  { value: "OIDC", label: "Standards-based" },
  { value: "PKCE", label: "Code flow protection" },
  { value: "WebAuthn", label: "Passkeys ready" },
  { value: "TOTP", label: "MFA built in" },
];

export const securityPillars: Feature[] = [
  { icon: Lock, title: "Hashed, never stored", description: "Passwords are hashed with a modern, slow algorithm. We cannot read them, and neither can an attacker with a database dump." },
  { icon: ShieldCheck, title: "Bot & abuse protection", description: "Cloudflare Turnstile guards sign-up and sign-in, with rate limiting backed by Redis." },
  { icon: Fingerprint, title: "Phishing-resistant sign-in", description: "Passkeys are bound to your domain, so a fake login page cannot capture them." },
  { icon: Users, title: "Short-lived sessions", description: "Access tokens are short-lived and refresh tokens are rotated. Revoke any session from your dashboard." },
  { icon: Globe, title: "Strict redirect rules", description: "Registered redirect URIs and PKCE keep authorization codes from being intercepted or replayed." },
  { icon: Download, title: "You control your data", description: "No selling, no ad targeting. Export or delete everything at any time." },
];

export const faqs = [
  { q: "Is ChaiAuth a replacement for NextAuth / Auth.js?", a: "ChaiAuth is an identity provider. You can plug it into NextAuth (or any OIDC library) as a provider, or later use our SDK directly." },
  { q: "Which login methods are supported today?", a: "Email + password, magic links, Google, GitHub, TOTP-based MFA and passkeys." },
  { q: "Can I self-host it?", a: "The project is a monorepo (API + web) backed by PostgreSQL and Redis, so you can run it on your own infrastructure." },
  { q: "Is there an SDK?", a: "Yes: @chaiauth/react gives you <SignIn />, <UserButton /> and hooks, built on standard OIDC with PKCE. Any other stack can use plain OpenID Connect." },
  { q: "How do I get client credentials?", a: "Create an account, open the Developer console, and register an application to get a client ID and secret." },
];
