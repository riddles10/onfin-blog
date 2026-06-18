import type { MetadataRoute } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { DEMO_POSTS, isDemoMode } from '@/lib/demo-data'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/locales'

// Per-locale sitemaps + automatic sitemap index. Next 15's
// `generateSitemaps` emits one /sitemap/<id>.xml file per shard (one
// per locale here) and an index at /sitemap.xml that points at them.
// GSC Performance reports tag each URL by its sitemap, so splitting by
// locale lets us see ranking & indexation per language without manual
// CSV wrangling.
//
// Each entry still carries hreflang `alternates.languages` so search
// engines can de-duplicate the localised versions across the shards.

export const revalidate = 3600  // 1h — sitemap doesn't need to be hot

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'

type SlugRow = { slug: string; published_at: string | null }

export async function generateSitemaps() {
  // Numeric ids — Next.js maps these to /sitemap/<id>.xml. We index by
  // locale order so the file→locale mapping is deterministic.
  return SUPPORTED_LOCALES.map((_, idx) => ({ id: idx }))
}

export default async function sitemap({
  id,
}: {
  id: number
}): Promise<MetadataRoute.Sitemap> {
  const locale = SUPPORTED_LOCALES[id]
  if (!locale) return []

  const rows = await fetchRows()
  // Future: add an /authors index entry once the listing page exists.
  return [
    indexEntry(locale),
    editorialEntry(locale),
    faqEntry(locale),
    ...postEntries(rows, locale),
  ]
}

async function fetchRows(): Promise<SlugRow[]> {
  if (isDemoMode()) {
    return DEMO_POSTS.map((p) => ({
      slug: p.slug,
      published_at: p.published_at,
    }))
  }
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[sitemap] supabase error:', error.message)
    return []
  }
  return (data ?? []) as SlugRow[]
}

function buildAlternatesForSlug(slug: string | null): Record<string, string> {
  const out: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    out[loc] = slug ? `${BASE_URL}/${loc}/${slug}` : `${BASE_URL}/${loc}`
  }
  out['x-default'] = slug
    ? `${BASE_URL}/${DEFAULT_LOCALE}/${slug}`
    : `${BASE_URL}/${DEFAULT_LOCALE}`
  return out
}

function postEntries(rows: SlugRow[], locale: Locale): MetadataRoute.Sitemap {
  return rows.map((r) => ({
    url: `${BASE_URL}/${locale}/${r.slug}`,
    lastModified: r.published_at ? new Date(r.published_at) : new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
    alternates: { languages: buildAlternatesForSlug(r.slug) },
  }))
}

function indexEntry(locale: Locale): MetadataRoute.Sitemap[number] {
  return {
    url: `${BASE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
    alternates: { languages: buildAlternatesForSlug(null) },
  }
}

function editorialEntry(locale: Locale): MetadataRoute.Sitemap[number] {
  const alternates: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    alternates[loc] = `${BASE_URL}/${loc}/editorial-policy`
  }
  alternates['x-default'] = `${BASE_URL}/${DEFAULT_LOCALE}/editorial-policy`
  return {
    url: `${BASE_URL}/${locale}/editorial-policy`,
    lastModified: new Date(),
    changeFrequency: 'yearly',
    priority: 0.4,
    alternates: { languages: alternates },
  }
}

function faqEntry(locale: Locale): MetadataRoute.Sitemap[number] {
  const alternates: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    alternates[loc] = `${BASE_URL}/${loc}/faq`
  }
  alternates['x-default'] = `${BASE_URL}/${DEFAULT_LOCALE}/faq`
  return {
    url: `${BASE_URL}/${locale}/faq`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.6,
    alternates: { languages: alternates },
  }
}

