// Helpers that resolve a Post + a target locale into the localised view
// the public pages render.
//
// English is canonical and lives on the `posts` row itself
// (`title_en`, `body_en`, `excerpt_en`). All other locales are stored as
// rows in `post_translations`. When a non-English locale is requested:
//
//   1. We look up `post_translations` for (post.id, locale).
//   2. If a row exists, the localised fields come from it.
//   3. If not, we fall back to the English columns and flag
//      `isFallback: true` so the page can render a "this article is in
//      English" banner.
//
// Keeping the resolver in one place means every fetcher (index, slug,
// sitemap, related) gets the same fallback semantics for free.

import type { SupabaseClient } from '@supabase/supabase-js'
import { type Locale, DEFAULT_LOCALE } from '@/lib/locales'

export type LocalizedPostView = {
  title: string
  body: string
  excerpt: string | null
  isFallback: boolean
  // The actual locale the rendered content is in. Equals the requested
  // locale when a translation existed, otherwise DEFAULT_LOCALE.
  effectiveLocale: Locale
  source: 'manual' | 'ai' | 'imported' | 'canonical' | null
}

/**
 * Apply the English fallback rule to a single post + a translation row
 * (which may be null). Pure — no IO. Used by index/list pages that batch-
 * fetch the translations and zip them with the posts they came from.
 */
export function applyTranslation(
  post: { title_en: string; body_en: string; excerpt_en: string | null },
  locale: Locale,
  translation: {
    title: string
    body: string
    excerpt: string | null
    source: 'manual' | 'ai' | 'imported'
  } | null
): LocalizedPostView {
  if (locale === DEFAULT_LOCALE || !translation) {
    return {
      title: post.title_en,
      body: post.body_en,
      excerpt: post.excerpt_en,
      isFallback: locale !== DEFAULT_LOCALE,
      effectiveLocale: DEFAULT_LOCALE,
      source: 'canonical',
    }
  }
  return {
    title: translation.title,
    body: translation.body,
    excerpt: translation.excerpt,
    isFallback: false,
    effectiveLocale: locale,
    source: translation.source,
  }
}

/**
 * Fetch translations for a batch of post ids in a single round trip.
 * Returns a Map keyed by post_id for cheap zip with the source posts.
 */
export async function fetchTranslationsBatch(
  supabase: SupabaseClient,
  postIds: string[],
  locale: Locale
): Promise<
  Map<string, { title: string; body: string; excerpt: string | null; source: 'manual' | 'ai' | 'imported' }>
> {
  const out = new Map<string, { title: string; body: string; excerpt: string | null; source: 'manual' | 'ai' | 'imported' }>()
  if (locale === DEFAULT_LOCALE || postIds.length === 0) return out

  const { data, error } = await supabase
    .from('post_translations')
    .select('post_id, title, body, excerpt, source')
    .eq('locale', locale)
    .in('post_id', postIds)

  if (error) {
    console.warn('[post-locale] translations batch failed:', error.message)
    return out
  }
  for (const r of data ?? []) {
    out.set(r.post_id as string, {
      title: r.title as string,
      body: r.body as string,
      excerpt: (r.excerpt as string | null) ?? null,
      source: r.source as 'manual' | 'ai' | 'imported',
    })
  }
  return out
}

/**
 * Single-post variant. Returns null if the post itself doesn't exist;
 * the translation is allowed to be missing (fallback handles it).
 */
export async function fetchTranslationForPost(
  supabase: SupabaseClient,
  postId: string,
  locale: Locale
): Promise<{ title: string; body: string; excerpt: string | null; source: 'manual' | 'ai' | 'imported' } | null> {
  if (locale === DEFAULT_LOCALE) return null

  const { data, error } = await supabase
    .from('post_translations')
    .select('title, body, excerpt, source')
    .eq('post_id', postId)
    .eq('locale', locale)
    .maybeSingle()

  if (error) {
    console.warn('[post-locale] translation fetch failed:', error.message)
    return null
  }
  if (!data) return null
  return {
    title: data.title as string,
    body: data.body as string,
    excerpt: (data.excerpt as string | null) ?? null,
    source: data.source as 'manual' | 'ai' | 'imported',
  }
}
