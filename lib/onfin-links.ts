// Helpers for linking from blog.onfin.io back to the parent onfin.io site.
//
// Goals:
//   - Forward the visitor's current locale automatically. If they're reading
//     in `/ru`, the "Open account" CTA should land on the Russian onfin.io
//     page, not the English one.
//   - Keep one source of truth — every component that links out goes
//     through `parentSiteUrl(locale, '/some-path')`, no hardcoded
//     `https://onfin.io/en/...` strings scattered through the codebase.
//   - Be safe when the blog supports a locale the parent site doesn't:
//     fall back to English rather than producing a 404.

const PARENT_SITE = 'https://onfin.io'

/**
 * Locales onfin.io currently serves. Mirrors the `locales` array in
 * onfin.io/astro.config.mjs. If the blog ends up supporting a locale
 * the parent doesn't, this set is the gate that catches it.
 */
const PARENT_LOCALES: ReadonlySet<string> = new Set([
  'en',
  'ru',
  'vi',
  'th',
  'ms',
  'id',
  'es',
  'km',
  'zh',
])

const FALLBACK_LOCALE = 'en'

/**
 * Build a full URL to a path on onfin.io under the same locale the visitor
 * is currently browsing on the blog. Always returns an absolute URL.
 *
 * @param currentLocale  the `lang` route param of the current blog page
 * @param path           a path on onfin.io ("/about", "/account-types"); the
 *                       leading slash is optional. The locale segment is added
 *                       automatically — DON'T include it here.
 */
export function parentSiteUrl(currentLocale: string, path: string = '/'): string {
  const locale = PARENT_LOCALES.has(currentLocale) ? currentLocale : FALLBACK_LOCALE
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  // Root-of-locale: return /en (no trailing slash) instead of /en/.
  if (normalizedPath === '/') {
    return `${PARENT_SITE}/${locale}`
  }
  return `${PARENT_SITE}/${locale}${normalizedPath}`
}

/**
 * Bare home — bypasses the locale prefix and lets onfin.io's own root
 * redirect (cookie / Accept-Language) decide where to send the visitor.
 * Useful for the header logo where you want the parent site to apply
 * its own locale-detection logic instead of inheriting ours.
 */
export function parentSiteHome(): string {
  return PARENT_SITE
}
