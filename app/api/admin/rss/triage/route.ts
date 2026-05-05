import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { fireTriageWebhook, type TriageType } from '@/lib/webhook'

// Triage handler. Operator clicks Article / Carousel / Reel / Skip on
// a row; the page POSTs here with { type, headline, link }.
//
// Two side effects, in this order:
//   1. Fire the configured webhook with the formatted body.
//   2. Insert a topic_queue row marked triaged so the item drops out
//      of the live RSS view on next refresh.
//
// We do the webhook first because the DB row is mostly a dedupe / audit
// artifact — if Supabase fails after a successful webhook fire, the
// downstream still received the message and the operator can re-fire
// from the source feed if they want a duplicate.

export const runtime = 'nodejs'

const VALID_TYPES = new Set(['article', 'carousel', 'reel', 'skip'])

type Body = {
  type?: string
  headline?: string
  link?: string | null
  source?: string | null
}

export async function POST(request: NextRequest) {
  let body: Body = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'invalid json' }, { status: 400 })
  }

  const { type, headline, link, source } = body
  if (typeof type !== 'string' || !VALID_TYPES.has(type)) {
    return NextResponse.json(
      { error: 'type must be one of article, carousel, reel, skip' },
      { status: 400 }
    )
  }
  if (typeof headline !== 'string' || headline.trim().length === 0) {
    return NextResponse.json({ error: 'headline is required' }, { status: 400 })
  }

  // Fire webhook for routed types (skip is admin-only bookkeeping).
  let webhookResult: { ok: boolean; status?: number; error?: string } = { ok: true }
  if (type !== 'skip') {
    webhookResult = await fireTriageWebhook({
      type: type as TriageType,
      headline: headline.trim(),
      link: typeof link === 'string' && link.length > 0 ? link : null,
    })
  }

  // Mark the item triaged in topic_queue. We always insert (not upsert
  // by source_url) — duplicates are fine since the dedupe set is read
  // by source_url at fetch-time, and an operator triaging the same URL
  // twice intentionally is a real signal we shouldn't silently swallow.
  const supabase = getServiceClient()
  const now = new Date().toISOString()
  const formatColumn: 'article' | 'carousel' | 'reel' | null =
    type === 'skip' ? null : (type as 'article' | 'carousel' | 'reel')

  const { error: insertError } = await supabase.from('topic_queue').insert({
    topic: headline.trim(),
    keywords: [],
    category: 'general',
    status: 'used', // not eligible for the cron picker
    priority: 0,
    notes: source ? `RSS triage: ${source}` : 'RSS triage',
    format: formatColumn,
    source_url: link ?? null,
    triaged_at: now,
  })
  if (insertError) {
    // Log + report, but don't fail if the webhook fired — the operator
    // already got the routing they wanted. The dedupe will be slightly
    // off until the same row succeeds.
    console.warn('[rss triage] could not record triage:', insertError.message)
    if (!webhookResult.ok) {
      return NextResponse.json(
        { ok: false, webhook: webhookResult, db: insertError.message },
        { status: 500 }
      )
    }
  }

  return NextResponse.json({ ok: true, webhook: webhookResult })
}
