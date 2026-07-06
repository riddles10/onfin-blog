import { SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/locales'

/**
 * Relative path to a post detail page, respecting the content-type axis.
 *
 *   postPath('en', 'my-post', 'article')  → /en/my-post
 *   postPath('en', 'my-post', 'news')     → /en/news/my-post
 *
 * When postType is undefined or null it defaults to the article path
 * so existing callers stay backward-compatible.
 */
export function postPath(
  locale: string,
  slug: string,
  postType?: string | null
): string {
  if (postType === 'news') {
    return `/${locale}/news/${slug}`
  }
  return `/${locale}/${slug}`
}

/**
 * Absolute URL to a post detail page.
 */
export function postUrl(
  baseUrl: string,
  locale: string,
  slug: string,
  postType?: string | null
): string {
  return `${baseUrl}${postPath(locale, slug, postType)}`
}

/**
 * Build the alternates.languages map for `<link rel="alternate" hreflang>`
 * on a post detail page. x-default always points at English.
 */
export function buildHreflangForPost(
  slug: string,
  postType?: string | null
): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    map[loc] = postPath(loc, slug, postType)
  }
  map['x-default'] = postPath(DEFAULT_LOCALE, slug, postType)
  return map
}
