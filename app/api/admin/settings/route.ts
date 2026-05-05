import { NextRequest, NextResponse } from 'next/server'
import { readSetting, writeSetting, SETTINGS_KEYS } from '@/lib/cms-settings'

// Admin-side settings reader/writer. Currently exposes a single key
// (the RSS-triage webhook URL) but the shape generalises — add more
// keys to SETTINGS_KEYS in lib/cms-settings.ts as new admin-editable
// settings come along.

export const runtime = 'nodejs'

export async function GET() {
  const webhookUrl = await readSetting(SETTINGS_KEYS.RSS_TRIAGE_WEBHOOK_URL)
  return NextResponse.json({ rss_triage_webhook_url: webhookUrl })
}

export async function PUT(request: NextRequest) {
  let body: { rss_triage_webhook_url?: string | null } = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const value = body.rss_triage_webhook_url
  if (typeof value !== 'string' && value !== null) {
    return NextResponse.json(
      { error: 'rss_triage_webhook_url must be a string or null' },
      { status: 400 }
    )
  }

  // Guard rail: if a URL is provided, make sure it's a plausible HTTPS URL.
  // We're not strict about hostname, but http:// or junk strings get rejected.
  if (typeof value === 'string' && value.length > 0) {
    try {
      const u = new URL(value)
      if (u.protocol !== 'https:' && u.protocol !== 'http:') {
        return NextResponse.json({ error: 'webhook URL must be http or https' }, { status: 400 })
      }
    } catch {
      return NextResponse.json({ error: 'webhook URL is not a valid URL' }, { status: 400 })
    }
  }

  const result = await writeSetting(
    SETTINGS_KEYS.RSS_TRIAGE_WEBHOOK_URL,
    value && value.length > 0 ? value : null
  )
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
