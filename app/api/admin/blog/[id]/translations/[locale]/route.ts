import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { isLocale, DEFAULT_LOCALE } from '@/lib/locales'

// Per-locale translation CRUD.
//
//   PUT    /api/admin/blog/[id]/translations/[locale]
//     body: { title, body, excerpt?, source? }   → upsert
//   DELETE /api/admin/blog/[id]/translations/[locale]
//     → remove the translation row
//
// The English locale is rejected: English lives canonically on
// `posts.title_en` / `body_en` / `excerpt_en` and is updated through the
// existing PATCH /api/admin/blog/[id] route. Mixing the two would create
// two-source-of-truth problems on the canonical version.

const VALID_SOURCES = ['manual', 'ai', 'imported'] as const

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; locale: string } }
) {
  const { id, locale } = params

  if (!isLocale(locale)) {
    return NextResponse.json(
      { error: `locale must be one of the SUPPORTED_LOCALES (got "${locale}")` },
      { status: 400 }
    )
  }
  if (locale === DEFAULT_LOCALE) {
    return NextResponse.json(
      { error: 'English is canonical — update via PATCH /api/admin/blog/[id], not the translations endpoint' },
      { status: 400 }
    )
  }

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'body must be a JSON object' }, { status: 400 })
  }

  const title = typeof body.title === 'string' ? body.title.trim() : ''
  const text = typeof body.body === 'string' ? body.body : ''
  const excerpt =
    typeof body.excerpt === 'string' && body.excerpt.trim().length > 0
      ? body.excerpt
      : null
  const sourceRaw = typeof body.source === 'string' ? body.source : 'manual'
  const source = (VALID_SOURCES as readonly string[]).includes(sourceRaw)
    ? sourceRaw
    : 'manual'
  const qaScore =
    typeof body.qa_score === 'number' && Number.isFinite(body.qa_score)
      ? Math.round(body.qa_score)
      : null

  if (!title) {
    return NextResponse.json({ error: 'title is required' }, { status: 400 })
  }
  if (!text) {
    return NextResponse.json({ error: 'body is required' }, { status: 400 })
  }

  const supabase = getServiceClient()

  // Confirm the post exists before writing — without this check, a stale
  // post_id from an old editor tab would silently insert an orphan row
  // (ON DELETE CASCADE only triggers on subsequent post deletion).
  const { data: post, error: postErr } = await supabase
    .from('posts')
    .select('id')
    .eq('id', id)
    .maybeSingle()
  if (postErr) {
    return NextResponse.json({ error: postErr.message }, { status: 500 })
  }
  if (!post) {
    return NextResponse.json({ error: `post ${id} not found` }, { status: 404 })
  }

  const { data, error } = await supabase
    .from('post_translations')
    .upsert(
      {
        post_id: id,
        locale,
        title,
        body: text,
        excerpt,
        source,
        qa_score: qaScore,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'post_id,locale' }
    )
    .select('locale, title, body, excerpt, source, qa_score, updated_at')
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string; locale: string } }
) {
  const { id, locale } = params

  if (!isLocale(locale)) {
    return NextResponse.json(
      { error: `locale must be one of the SUPPORTED_LOCALES (got "${locale}")` },
      { status: 400 }
    )
  }
  if (locale === DEFAULT_LOCALE) {
    return NextResponse.json(
      { error: 'English is canonical and cannot be deleted via this endpoint' },
      { status: 400 }
    )
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('post_translations')
    .delete()
    .eq('post_id', id)
    .eq('locale', locale)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
