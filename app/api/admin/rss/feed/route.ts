import { NextResponse } from 'next/server'
import { fetchAllConfiguredFeeds } from '@/lib/rss-topics'

// Live RSS preview for the /admin/rss page. Pulls every configured feed
// in parallel, filters out junk + already-triaged items, returns the
// remaining headlines as JSON.
//
// No DB writes — this is read-only. Triage actions go to
// /api/admin/rss/triage instead.

export const runtime = 'nodejs'
// Don't cache — the operator's hitting Refresh because they want a fresh pull.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const items = await fetchAllConfiguredFeeds()
    return NextResponse.json({ items, count: items.length })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
