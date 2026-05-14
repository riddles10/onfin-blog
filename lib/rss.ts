import { getServiceClient } from '@/lib/supabase'
import { DEMO_POSTS, isDemoMode } from '@/lib/demo-data'
import {
  type Locale,
  isLocale,
  DEFAULT_LOCALE,
  BCP47,
  t,
} from '@/lib/locales'
import { applyTranslation, fetchTranslationsBatch } from '@/lib/post-locale'
import { htmlToExcerpt } from '@/lib/format'

// Shared RSS 2.0 builder used by /rss.xml (English firehose) and the
// per-locale /rss/[locale]/route.ts handler. Returns ready-to-serve XML.
//
// Keeps the per-route handlers tiny so the only non-trivial work — DB
// fetch + locale-aware translation zip + XML escaping — lives here.

const ITEM_LIMIT = 50

type Row = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  cover_image: string | null
  published_at: string | null
}

export async function buildFeed(rawLocale: string): Promise<string> {
  const locale: Locale = isLocale(rawLocale) ? rawLocale : DEFAULT_LOCALE
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const feedUrl =
    locale === DEFAULT_LOCALE
      ? `${baseUrl}/rss.xml`
      : `${baseUrl}/rss/${locale}.xml`
  const indexUrl = `${baseUrl}/${locale}`

  const rows = await fetchRows()
  const translations = isDemoMode()
    ? new Map()
    : await fetchTranslationsBatch(getServiceClient(), rows.map((r) => r.id), locale)

  const items = rows.map((r) => {
    const view = applyTranslation(
      { title_en: r.title_en, body_en: r.body_en, excerpt_en: r.excerpt_en },
      locale,
      translations.get(r.id) ?? null
    )
    const desc = view.excerpt || htmlToExcerpt(view.body, 280)
    const link = `${baseUrl}/${locale}/${r.slug}`
    const pubDate = r.published_at
      ? new Date(r.published_at).toUTCString()
      : new Date().toUTCString()
    const media = r.cover_image
      ? `\n      <media:content url="${esc(r.cover_image)}" medium="image" />`
      : ''
    return `    <item>
      <title>${esc(view.title)}</title>
      <link>${esc(link)}</link>
      <guid isPermaLink="true">${esc(link)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${esc(desc)}</description>${media}
    </item>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(t(locale, 'blog.metadata.title'))}</title>
    <link>${esc(indexUrl)}</link>
    <atom:link href="${esc(feedUrl)}" rel="self" type="application/rss+xml" />
    <description>${esc(t(locale, 'blog.metadata.description'))}</description>
    <language>${BCP47[locale]}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items.join('\n')}
  </channel>
</rss>
`
}

async function fetchRows(): Promise<Row[]> {
  if (isDemoMode()) {
    return DEMO_POSTS.slice(0, ITEM_LIMIT).map((p) => ({
      id: p.id,
      slug: p.slug,
      title_en: p.title_en,
      excerpt_en: p.excerpt_en,
      body_en: p.body_en,
      cover_image: p.cover_image,
      published_at: p.published_at,
    }))
  }
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, body_en, cover_image, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(ITEM_LIMIT)
  return (data ?? []) as Row[]
}

function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
