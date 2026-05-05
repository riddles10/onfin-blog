import { type Locale, LOCALE_NAMES } from '@/lib/locales'

// Small notice rendered at the top of an article when the visitor's
// requested locale doesn't have a translation yet, and we're serving
// the English version as a fallback. Mirrors the pattern onfin.io's
// previous Hygraph-backed blog used (`isFallback: true` banner).
//
// Visible but not loud — readers came for the article. The banner sits
// inside the article container, above the breadcrumbs, with a small
// lime accent so it's clearly informational rather than an error.

export default function EnglishFallbackBanner({
  requestedLocale,
}: {
  requestedLocale: Locale
}) {
  const localeName = LOCALE_NAMES[requestedLocale] ?? requestedLocale
  return (
    <div
      role="status"
      className="border-b border-ink-100 bg-brand-lime/10"
    >
      <div className="container-site py-3">
        <p className="text-sm text-ink-600">
          <span className="mr-2 inline-flex items-center rounded-pill bg-brand-lime/20 px-2 py-0.5 text-xs font-display font-semibold uppercase tracking-[0.14em] text-brand-black">
            EN
          </span>
          This article is shown in English. The {localeName} translation
          isn&apos;t available yet — we&apos;re working through the archive.
        </p>
      </div>
    </div>
  )
}
