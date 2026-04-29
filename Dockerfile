# syntax=docker/dockerfile:1.7
#
# Production image for blog.onfin.io.
#
# Multi-stage build that follows Next.js's standalone output convention:
#   - deps  → install node_modules from package-lock
#   - build → run `next build`, which writes a self-contained server to
#             .next/standalone/ and static assets to .next/static/
#   - runner→ slim node image that runs the standalone server
#
# Two services are built from this image:
#   - `app`         → CMD ["node", "server.js"]
#   - `cron-worker` → CMD ["node", "scripts/cron-worker.js"] (compose override)
#
# Listens on the port specified by $PORT (defaults to 3000). The container is
# meant to sit behind an Nginx reverse proxy on the host; only 127.0.0.1:PORT
# should be exposed.

# ─── deps ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat
COPY package.json package-lock.json* ./
RUN npm ci

# ─── build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ─── runner ──────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 nodejs && adduser -S -u 1001 -G nodejs nextjs

# next.config.js `output: 'standalone'` writes a minimal server here.
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Cron worker script + its dependency (node-cron is already in node_modules,
# which standalone bundles selectively — copy the worker script alongside).
COPY --from=builder --chown=nextjs:nodejs /app/scripts ./scripts

USER nextjs
EXPOSE 3000

# Healthcheck hits the same `/api/health` endpoint Nginx will probe.
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:${PORT}/api/health || exit 1

CMD ["node", "server.js"]
