import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// Increment the post view counter. Client-side fire-and-forget hit from
// ArticleViewTracker (sent once on mount per session to avoid double-counting
// strict-mode rerenders and refresh bouncers). We use the service client so
// RLS can't block the write even though this endpoint is unauthenticated --
// view counters are public metrics, not PII.
//
// We intentionally do NOT return an error body to the caller on failure.
// If view tracking breaks for any reason, the worst outcome is the "Most
// popular" rail gets stale, which is fine.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type TrackBody = { slug?: string }

export async function POST(request: NextRequest) {
  let body: TrackBody
  try {
    body = (await request.json()) as TrackBody
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  const slug = (body.slug || '').trim()
  if (!slug) {
    return NextResponse.json({ ok: false }, { status: 400 })
  }

  try {
    const supabase = getServiceClient()
    // Look up the current views count then +1. We don't have a Postgres
    // RPC helper set up, so the two-step read-modify-write races under
    // extreme concurrency -- but blog traffic is low enough that this is
    // fine. If it ever becomes a problem, we'll switch to an RPC with
    // `update ... set views = views + 1`.
    const { data: post } = await supabase
      .from('posts')
      .select('id, views')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()

    if (!post) {
      return NextResponse.json({ ok: false }, { status: 404 })
    }

    await supabase
      .from('posts')
      .update({ views: (post.views || 0) + 1 })
      .eq('id', post.id)

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.warn('[track-view] failed:', err)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
