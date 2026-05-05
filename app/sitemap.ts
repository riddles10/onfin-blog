import type { MetadataRoute } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { DEMO_POSTS, isDemoMode } from '@/lib/demo-data'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/locales'

// Built-in Next.js sitemap. Emits one entry per (locale, post) pair plus
// the localised index pages, with `alternates.languages` filled in so
// search engines can de-duplicate the localised versions.
//
// Strategy: every post is emitted once per supported locale, even if no
// translation row exists yet (the route falls back to English with a
// banner — still a valid, indexable page). This way sitemap entries
// stay aligned with what the routes actually serve.

export const revalidate = 3600  // 1h — sitemap doesn't need to be hot

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'

type SlugRow = { slug: string; published_at: string | null }

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

function postEntries(rows: SlugRow[]): MetadataRoute.Sitemap {
  const out: MetadataRoute.Sitemap = []
  for (const r of rows) {
    const lastModified = r.published_at ? new Date(r.published_at) : new Date()
    const alternates = { languages: buildAlternatesForSlug(r.slug) }
    for (const loc of SUPPORTED_LOCALES) {
      out.push({
        url: `${BASE_URL}/${loc}/${r.slug}`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
        alternates,
      })
    }
  }
  return out
}

function indexEntries(): MetadataRoute.Sitemap {
  const alternates = { languages: buildAlternatesForSlug(null) }
  return SUPPORTED_LOCALES.map((loc) => ({
    url: `${BASE_URL}/${loc}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
    alternates,
  }))
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  if (isDemoMode()) {
    const rows: SlugRow[] = DEMO_POSTS.map((p) => ({
      slug: p.slug,
      published_at: p.published_at,
    }))
    return [...indexEntries(), ...postEntries(rows)]
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[sitemap] supabase error:', error.message)
    return indexEntries()
  }

  return [...indexEntries(), ...postEntries((data ?? []) as SlugRow[])]
}
