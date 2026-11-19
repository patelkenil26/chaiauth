# ChaiAuth deployment runbook (Oracle Cloud VM + Docker + GitHub Actions)

Read top to bottom the first time. Later, jump to **Everyday use** and **Troubleshooting**.

## How it works

`git push origin main` → GitHub Actions checks types/build → builds Docker images → pushes them to Docker Hub → SSHes into the VM → pulls images, restarts containers, runs DB migrations.

```
Browser ──► Caddy (ports 80/443, automatic HTTPS)
              ├─ WEB_DOMAIN ──► chaiauth-web  (Next.js :3000)
              └─ API_DOMAIN ──► chaiauth-api  (Express + tRPC + OIDC :8000) ──► chaiauth-postgres, chaiauth-redis
```

Files: `Dockerfile.api`, `Dockerfile.web`, `docker-compose.prod.yml`, `Caddyfile`, `.env.production.example`, `.github/workflows/deploy.yml`.

> **Never put real passwords, tokens or keys in this repo, in chat, or in plain notes.** Use a password manager. If one leaks, rotate it.

## Our setup

ChaiAuth runs on its **own Oracle VM** (`chaiauth-server`, Ubuntu 22.04, x86, 1 GB RAM + 2 GB swap), separate from ChaiForm's VM, so the two cannot affect each other.

| Thing | Value |
|---|---|
| Web (`WEB_DOMAIN`) | `chaiauth.kenilpatel.in` |
| API / OIDC issuer (`API_DOMAIN`) | `auth-api.kenilpatel.in` |
| VM user / folder | `ubuntu` / `~/chaiauth` |
| Caddy | bundled with ChaiAuth: GitHub variable `BUNDLED_CADDY=true` |
| Platform | `DOCKER_PLATFORMS=linux/amd64` |

Docker, swap and the firewall rules (80/443 in `iptables`) are already set up on the VM. The Oracle network security list is shared with ChaiForm's VM, where ports 80/443 are already open.

---

## One-time setup

### 1. DNS
At your DNS provider for `kenilpatel.in`, add two **A records** to the VM's public IP:
- `chaiauth` → `<VM_IP>`
- `auth-api` → `<VM_IP>`
If you use Cloudflare, set them to **DNS only** (grey cloud) at first.

### 2. `.env.production` on the VM
```bash
ssh -i "<path-to-key>" ubuntu@<VM_IP>
cd ~/chaiauth
nano .env.production      # copy from .env.production.example and fill every value
chmod 600 .env.production
```
Required: `WEB_DOMAIN`, `API_DOMAIN`, `POSTGRES_PASSWORD`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATA_ENCRYPTION_KEY`, and the three legacy `GOOGLE_OAUTH_*` placeholders (the API will not boot without them). Fill Resend, Google, GitHub, Turnstile values for those features.
Generate secrets: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` (use `randomBytes(32)` for `DATA_ENCRYPTION_KEY`).

The OIDC signing keys (`~/chaiauth/cert/`) are generated automatically by the first deploy.

### 3. GitHub repo settings (Settings → Secrets and variables → Actions)

**Secrets**
| Name | Value |
|---|---|
| `DOCKERHUB_TOKEN` | a **new** Docker Hub access token (Read & Write) for ChaiAuth |
| `SSH_PRIVATE_KEY` | full contents of the private key file for this VM |

**Variables**
| Name | Value |
|---|---|
| `DOCKERHUB_USERNAME` | your Docker Hub username |
| `SERVER_IP` | the VM's public IP |
| `WEB_DOMAIN` | `chaiauth.kenilpatel.in` (domain only, no `https://`) |
| `API_DOMAIN` | `auth-api.kenilpatel.in` |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Turnstile **site** key (public) |
| `BUNDLED_CADDY` | `true` |
| `DOCKER_PLATFORMS` | `linux/amd64` |
| `SSH_USER` | optional, default `ubuntu` |

> `WEB_DOMAIN` / `API_DOMAIN` in GitHub must match `.env.production`. The web image bakes the API URL in at build time, so after changing a domain run Actions → Run workflow with `force_all`.

### 4. Provider dashboards
- **Google / GitHub OAuth callback URLs:** `https://auth-api.kenilpatel.in/api/auth/providers/google/callback` and `.../github/callback`.
- **Turnstile:** widget for hostname `chaiauth.kenilpatel.in`. Site key → GitHub; secret key → `.env.production` (`TURNSTILE_SECRET_KEY`).
- **Resend:** verify your sending domain, then set `EMAIL_FROM` to an address on it.

---

## First deploy
Push to `main` (or Actions → *Production CI/CD Pipeline* → Run workflow with `force_all`). Watch the Actions tab: `validate` → build images → deploy. The first run is slow; later ones use the cache.

Verify:
```bash
curl https://auth-api.kenilpatel.in/health
curl https://auth-api.kenilpatel.in/.well-known/openid-configuration
```
Then open `https://chaiauth.kenilpatel.in`, register and log in.

## Everyday use
Deploy = push to `main`. On the VM, in `~/chaiauth`:
```bash
C="docker compose --env-file .env.production -f docker-compose.prod.yml --profile standalone"
$C ps                       # status
$C logs -f chaiauth-api     # also: chaiauth-web, chaiauth-db, caddy
$C restart chaiauth-api
$C exec chaiauth-db psql -U postgres -d chaiauth     # DB shell
free -h                     # memory check (1 GB VM: watch swap usage)
```

**Rollback:** re-run an older successful workflow run from the Actions tab, or `git revert` the bad commit and push.

**Backups** (before risky changes):
```bash
docker exec chaiauth-postgres pg_dump -U postgres chaiauth > chaiauth-$(date +%F).sql
cp -r ~/chaiauth/cert ~/chaiauth-cert-backup      # signing keys: losing them invalidates issued tokens
```

**Publishing the SDKs to npm** is separate: bump versions in `packages/react` / `packages/node`, add the `NPM_TOKEN` secret, then `git tag sdk-v0.1.0 && git push origin sdk-v0.1.0` (see `.github/workflows/publish-packages.yml`).

## Troubleshooting
- **Site not loading / no HTTPS:** DNS not pointing to the VM yet, or ports 80/443 closed. Check `$C logs caddy`.
- **`exec format error`:** image architecture does not match the VM. Set `DOCKER_PLATFORMS` correctly and re-run with `force_all`.
- **API exits right after start:** missing or invalid value in `.env.production`; `$C logs chaiauth-api` names the variable.
- **Containers randomly killed / VM very slow:** out of memory. `free -h`, `docker stats --no-stream`. Consider a bigger shape.
- **Deploy says `.env.production` is missing:** do step 2.
- **Sharing a VM with another Caddy instead** (not our setup): leave `BUNDLED_CADDY` unset, create the network once with `docker network create shared-proxy`, attach the other project's Caddy to `shared-proxy`, and add site blocks forwarding to `chaiauth-web:3000` and `chaiauth-api:8000`.
