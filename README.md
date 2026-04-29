# blog.onfin.io

Self-hosted Next.js blog for OnFin. The repository follows the engineering constraints in [`.ai/ENGINEERING_CONSTRAINTS.txt`](.ai/ENGINEERING_CONSTRAINTS.txt) — no Vercel-specific runtime features, no managed-only services baked in, all configuration via environment variables.

The CMS layer is the [ba-cms](https://github.com/riddles10/ba-cms) package, customized for OnFin's forex audience and integrated at `/admin`. Public-facing routes are designed for legibility and organic search.

## Repository layout

| Path                 | What it is                                                                |
|----------------------|---------------------------------------------------------------------------|
| `app/`               | Next.js App Router. `[lang]/` for the public blog, `admin/` for the CMS.  |
| `app/api/`           | Server endpoints — admin CRUD, AI generation, cron triggers, healthcheck. |
| `components/`        | TipTap editor, image upload, blog/page editors. (Public components arrive in the design pass.) |
| `lib/`               | CMS data layer, Anthropic client, Slack notifier, RSS topic seeder, etc.  |
| `supabase/`          | Database schema. Run `schema.sql` once on a fresh Supabase project.       |
| `scripts/`           | One-off Tilda importer + cron worker entrypoint.                          |
| `docs/design/`       | Design handoff folder — brief, tokens, reference, content samples.        |
| `_tilda_export/`     | Source HTML of the legacy Tilda blog (gitignored, used by the importer). |
| `Dockerfile`         | Multi-stage build, standalone Next.js output.                             |
| `docker-compose.yml` | App + cron-worker. Postgres/object storage are external (see below).     |

## Build the image

```sh
docker build -t onfin-blog:latest .
```

Multi-stage build: `deps` (npm ci), `builder` (`next build`), `runner` (slim node:20-alpine running `node server.js` from `.next/standalone`).

## Run locally with docker compose

```sh
cp .env.example .env
# fill in the values, especially NEXT_PUBLIC_BASE_URL, the Supabase URLs/keys,
# ADMIN_PASSWORD, ANTHROPIC_API_KEY, SLACK_WEBHOOK_URL, CRON_SECRET
docker compose up --build
```

Two containers come up:

- **app** — Next.js HTTP server bound to `127.0.0.1:3000`. Nginx on the host should reverse-proxy `blog.onfin.io` to that address.
- **cron-worker** — A separate node process that fires the daily content pipeline by POSTing to `/api/cron/...` with `CRON_SECRET`. Schedule (UTC):
  - `01:00` `/api/cron/daily-draft` — pulls from the topic queue (or RSS / autocomplete fallback) and generates an English draft
  - `01:30` `/api/cron/daily-translate` — scores, fetches a cover image, posts to Slack. Translation runs only if `SECONDARY_LANG` is set in `lib/cms-config.ts`.

## Required environment variables

| Variable | What it controls |
|---|---|
| `NEXT_PUBLIC_BASE_URL` | Public origin used for canonical links, OG tags, sitemap, JSON-LD, and the cron worker's callback target. No trailing slash. |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase URL. Self-hosted or managed — the app doesn't care. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key (browser-safe). |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only). |
| `ADMIN_PASSWORD` | Single password for `/admin`. |
| `ANTHROPIC_API_KEY` | Claude API key for the AI content pipeline. |
| `SLACK_WEBHOOK_URL` | Incoming webhook for the editorial channel. Leave blank to silence notifications. |
| `UNSPLASH_ACCESS_KEY` | Cover image search. Optional — the pipeline runs without it. |
| `CRON_SECRET` | Shared secret between the cron worker and the cron API routes. |

## Healthcheck

`GET /api/health` returns `{ status: "ok", uptime: <seconds> }` with HTTP 200. Use this as the Nginx upstream check and the docker-compose `healthcheck`.

## Reverse proxy expectations

- The container listens on `0.0.0.0:3000` inside the docker network and is published only on `127.0.0.1:3000` on the host.
- Nginx terminates TLS on `blog.onfin.io` and proxies to that address.
- Nothing in the app cares about the public URL except via `NEXT_PUBLIC_BASE_URL` — set that to the value behind Nginx.
- Cookies (`ADMIN_SESSION_KEY` from `lib/cms-config.ts`) work over a standard reverse proxy without extra trust headers.

## External dependencies

The app expects the following to be reachable from the docker network or from the public internet:

- A **Supabase** instance (Postgres + Storage + Auth). Self-host with the official `supabase/supabase` docker-compose, or point at a managed instance.
- The **Anthropic** API.
- **Slack** incoming webhooks.
- **Unsplash** API (optional).
- The configured **RSS feeds** (Investing.com, FXStreet, ForexLive — see `lib/cms-config.ts:TOPIC_RSS_FEEDS`).

No volumes are required by the app itself. Persistent state lives in Supabase; image uploads go to Supabase Storage.

## One-time setup steps

### 1. Database schema

Run `supabase/schema.sql` in the SQL editor of your Supabase project. It is idempotent (`IF NOT EXISTS` and `ON CONFLICT` throughout) so re-running on an existing project is safe.

### 2. Import legacy Tilda content

```sh
# from the host, with .env populated and node_modules installed:
npm run import:tilda -- --dry      # preview only
npm run import:tilda               # write to Supabase
```

This reads `_tilda_export/_index.json`, filters to news pages with the `news_DD_MM_YYYY` slug shape, drops promo announcements, parses each Tilda HTML page, and inserts into the `posts` table preserving the original slug. Old `https://onfin.io/news_*` URLs resolve at `https://blog.onfin.io/en/news_*` once the redirect on the parent site is configured (handled outside this repo by the `onfin.io` Nginx vhost).

### 3. Update `onfin.io` to link to `blog.onfin.io`

The plan is to retire the Hygraph-backed `/[lang]/blog` route on `onfin.io` by changing the navigation links to `https://blog.onfin.io/en` and adding a server-level redirect from the old paths. That work belongs in the `onfin.io` repo, not here.

## Local dev (without docker)

```sh
npm install
cp .env.example .env.local
# fill in values
npm run dev
```

`http://localhost:3000` for the public site, `http://localhost:3000/admin` for the CMS.

## Constraints respected

This repo is platform-agnostic and intentionally avoids:

- Vercel-specific runtime features
- Edge-only APIs
- Hidden hosting-platform-managed services
- Build-time secret dependencies
- Hardcoded external domain names
- Application-managed TLS

Re-read [`.ai/ENGINEERING_CONSTRAINTS.txt`](.ai/ENGINEERING_CONSTRAINTS.txt) before adding new infra dependencies.
