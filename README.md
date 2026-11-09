# ChaiAuth Platform

Monorepo (pnpm + Turborepo) for ChaiAuth: API, dashboard and the upcoming SDK packages.

## Structure

| Path | What |
| --- | --- |
| `apps/api` | Express + tRPC (+ OpenAPI via `trpc-to-openapi`), docs at `/docs` |
| `apps/web` | Next.js app |
| `packages/database` | Drizzle ORM schema + migrations (Postgres) |
| `packages/services` | Business logic |
| `packages/trpc` | tRPC routers |
| `packages/logger` | Winston logger |
| `packages/eslint-config`, `packages/typescript-config` | Shared configs |

## Getting started

```sh
pnpm install
bash setup.sh            # creates .env from .env.example
docker compose up -d     # Postgres on :5432 (db: chaiauth)
pnpm db:migrate
pnpm dev                 # api :8000, web :3000
```

## Scripts

`pnpm dev` · `pnpm build` · `pnpm lint` · `pnpm check-types` · `pnpm db:generate` · `pnpm db:migrate`
