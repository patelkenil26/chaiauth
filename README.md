# ChaiAuth Platform

Monorepo (pnpm + Turborepo) for ChaiAuth: API, dashboard and the upcoming SDK packages.

## Structure

| Path | What |
| --- | --- |
| `apps/api` | Express + TypeScript API: `modules/auth` (credentials, sessions, MFA, social login, passkeys), `modules/oidc` ("Login with ChaiAuth" provider), tRPC/OpenAPI docs at `/docs` |
| `apps/web` | Next.js dashboard & auth screens (ported from `chaiauth-ui`) |
| `packages/database` | Drizzle ORM schema + migrations (Postgres) |
| `packages/services` | Business logic |
| `packages/trpc` | tRPC routers |
| `packages/logger` | Winston logger |
| `packages/eslint-config`, `packages/typescript-config` | Shared configs |

## Getting started

```sh
pnpm install
bash setup.sh            # creates .env from .env.example
docker compose up -d     # Postgres :5432 (db: chaiauth), Redis :6380
bash scripts/generate-keys.sh   # RSA keys for OIDC token signing
pnpm db:migrate
pnpm dev                 # api :8000, web :3000
```

## Scripts

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm check-types` · `pnpm db:generate` · `pnpm db:migrate`
