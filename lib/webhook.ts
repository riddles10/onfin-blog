// Webhook firer for the RSS triage admin.
//
// When the operator clicks Article / Carousel / Reel on a row in
// /admin/rss, we POST a plain-text body to the URL configured in
// `cms_settings.rss_triage_webhook_url`:
//
//   #article
//
//   <headline>
//
//   <link>
//
// Plain text reads naturally in Slack / Discord / Mattermost / Teams
// without needing a per-platform JSON shape. Switch to JSON if a
// downstream needs structure.

import { readSetting, SETTINGS_KEYS } from '@/lib/cms-settings'

export type TriageType = 'article' | 'carousel' | 'reel'

export type TriagePayload = {
  type: TriageType
  headline: string
  link: string | null
}

/**
 * Build the plain-text body sent to the webhook. Pulled out as a pure
 * function so unit tests / preview UI can call it without a network round-trip.
 */
export function formatTriagePayload(payload: TriagePayload): string {
  const lines: string[] = [`#${payload.type}`, '']
  lines.push(payload.headline.trim())
  if (payload.link) {
    lines.push('', payload.link.trim())
  }
  return lines.join('\n')
}

/**
 * POST the formatted body to the configured webhook. No-op (with a
 * warning) when no URL is configured, so the rest of the triage action
 * still completes (DB row is marked triaged) and the operator gets a
 * clear message in the UI.
 */
export async function fireTriageWebhook(
  payload: TriagePayload
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const url = await readSetting(SETTINGS_KEYS.RSS_TRIAGE_WEBHOOK_URL)
  if (!url) {
    return { ok: false, error: 'No webhook URL configured' }
  }

  const body = formatTriagePayload(payload)
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 8000)
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
      body,
      signal: ctrl.signal,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      return {
        ok: false,
        status: res.status,
        error: `webhook returned ${res.status} ${res.statusText} ${text.slice(0, 200)}`,
      }
    }
    return { ok: true, status: res.status }
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : String(err),
    }
  } finally {
    clearTimeout(timer)
  }
}
