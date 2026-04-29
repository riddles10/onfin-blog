/**
 * Self-hosted cron worker for blog.onfin.io.
 *
 * This replaces the Vercel cron config we'd otherwise be using. The worker
 * runs as its own service in docker-compose and POSTs to the app's internal
 * cron endpoints on a node-cron schedule, authenticated by CRON_SECRET.
 *
 * Schedule (UTC):
 *   01:00  /api/cron/daily-draft     — generate English draft from topic queue
 *   01:30  /api/cron/daily-translate — translate, score, send Slack notification
 *
 * Adjust the cron expressions at the call sites if you need a different
 * cadence. The endpoints are idempotent enough that an extra run is safe;
 * they just no-op when there's nothing to do.
 */
const cron = require('node-cron')

const BASE_URL = process.env.CRON_TARGET_BASE_URL || 'http://app:3000'
const SECRET = process.env.CRON_SECRET || ''

if (!SECRET) {
  console.error('[cron-worker] CRON_SECRET is not set — refusing to start')
  process.exit(1)
}

async function fire(path) {
  const url = `${BASE_URL}${path}`
  const startedAt = Date.now()
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${SECRET}` },
    })
    const ms = Date.now() - startedAt
    const body = await res.text().catch(() => '')
    if (!res.ok) {
      console.error(`[cron-worker] ${path} → ${res.status} (${ms}ms): ${body.slice(0, 300)}`)
      return
    }
    console.log(`[cron-worker] ${path} → ok (${ms}ms)`)
  } catch (err) {
    console.error(`[cron-worker] ${path} fetch failed:`, err)
  }
}

cron.schedule('0 1 * * *', () => fire('/api/cron/daily-draft'), { timezone: 'UTC' })
cron.schedule('30 1 * * *', () => fire('/api/cron/daily-translate'), { timezone: 'UTC' })

console.log(`[cron-worker] running, target=${BASE_URL}`)
