# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Two audiences, in this order:

1. **Developers** adding sign-in to their own apps. They register an app in the developer console, point an OIDC library at the discovery URL, and read the docs and API reference.
2. **Their end users**, who meet ChaiAuth's login, registration, consent ("Login with ChaiAuth"), email verification, password reset, security (MFA, passkeys) and sessions screens.

## Product Purpose

ChaiAuth is an OpenID Connect identity provider. It handles credentials, sessions, MFA, social login and passkeys, and it acts as an OIDC provider other apps can sign users in with. A developer console manages apps, callback URLs and API keys. Success means a developer gets from zero to working sign-in quickly, and their users trust the screens they land on.

## Positioning

A simple, self-hostable OIDC provider. The whole system runs from this monorepo (API, web, Postgres, Redis, Docker and Caddy deployment files) and can be understood end to end, unlike a large hosted auth platform.

## Operating Context

- Developers work with OIDC discovery (`/.well-known/openid-configuration`), `/o/authorize`, `/o/token`, client IDs, callback URLs and API keys.
- End users reach the auth screens from a third-party app's redirect, so they arrive mid-task and need to recognise what they are approving.
- Self-hosting is a first-class path (`DEPLOYMENT.md`, `docker-compose*.yml`).

## Capabilities and Constraints

- Password and social login, MFA, passkeys (WebAuthn), magic link, email verification, password reset, Turnstile bot checks, disposable-email blocking.
- Account surfaces: dashboard, security, sessions, developer console. Marketing surfaces: home, features, pricing, trust, about, changelog, contact. Also `/docs`, `/privacy` and `/terms`.
- Stack in place: Next.js (App Router, breaking-change version, read `node_modules/next/dist/docs/` before writing code), React 19, Tailwind 4, Radix/Base UI primitives, shadcn-style components, lucide icons, Sonner toasts, next-themes (light and dark).
- Pricing tiers are not final.

## Brand Commitments

- Name: ChaiAuth. The chai theme is established in the code: a warm cream/amber palette, "feels warm, and stays secure" hero copy, Manrope and Sora type. (Inferred from the repository; confirm before treating any specific colour or font as binding.)

## Evidence on Hand

Real: the working auth flows, the OIDC endpoints, the developer console and the API docs.

Do not fabricate:
- customers, logos or testimonials (there are no real customers yet);
- stats, benchmarks, uptime or "all systems operational" style status claims (none are backed by real data; the homepage stats row and the footer status line were removed for this reason);
- compliance or certification claims (SOC 2, GDPR and the like);
- final pricing.

## Product Principles

1. **Developer time-to-first-login is the core metric.** Docs, the console and copy serve getting integrated quickly.
2. **Trust is shown by being legible.** Auth screens say plainly what is being approved, by whom, and what happens next.
3. **Simple enough to understand and self-host.** Prefer plain language and visible mechanics over enterprise abstraction.
4. **Claim only what is true.** Features, numbers and compliance are stated only when the system actually provides them.
