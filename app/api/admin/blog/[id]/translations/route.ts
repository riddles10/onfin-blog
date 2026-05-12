import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { SUPPORTED_LOCALES } from '@/lib/locales'

// List every translation row for a post. Used by the BlogEditor to
// hydrate non-English locale tabs in one round-trip.
//
// Returns an array of:
//   { locale, title, body, excerpt, source, qa_score, updated_at }
// English isn't stored in `post_translations` (it lives canonically on
// `posts.title_en` / `body_en` / `excerpt_en`), so it's never returned.

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('post_translations')
    .select('locale, title, body, excerpt, source, qa_score, updated_at')
    .eq('post_id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Drop anything for a locale we no longer support (legacy data from
  // before locales were trimmed). Cheaper to filter here than to expect
  // every caller to know the active SUPPORTED_LOCALES list.
  const filtered = (data ?? []).filter((row) =>
    (SUPPORTED_LOCALES as readonly string[]).includes(row.locale)
  )
  return NextResponse.json(filtered)
}
