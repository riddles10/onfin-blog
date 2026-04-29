import Link from 'next/link'

// Pagination footer for the blog index. Pure links, SEO-clean: the URL
// always reflects the active page, so search engines crawl every page in
// the archive. Compact: prev / page x of y / next.

export default function Pagination({
  basePath,
  page,
  totalPages,
  category,
}: {
  basePath: string                    // e.g. "/en"
  page: number                        // 1-based
  totalPages: number
  category?: string | null
}) {
  if (totalPages <= 1) return null

  const buildHref = (p: number) => {
    const params = new URLSearchParams()
    if (category) params.set('category', category)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `${basePath}?${qs}` : basePath
  }

  const prev = page > 1 ? buildHref(page - 1) : null
  const next = page < totalPages ? buildHref(page + 1) : null

  return (
    <nav
      aria-label="Article pages"
      className="mt-12 flex items-center justify-between border-t border-ink-100 pt-8"
    >
      {prev ? (
        <Link
          href={prev}
          rel="prev"
          className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-black transition hover:text-brand-blue"
        >
          <span aria-hidden="true">←</span> Previous
        </Link>
      ) : (
        <span className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-300">
          <span aria-hidden="true">←</span> Previous
        </span>
      )}

      <span className="font-display text-xs uppercase tracking-[0.18em] text-ink-400">
        Page {page} of {totalPages}
      </span>

      {next ? (
        <Link
          href={next}
          rel="next"
          className="inline-flex items-center gap-2 font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-black transition hover:text-brand-blue"
        >
          Next <span aria-hidden="true">→</span>
        </Link>
      ) : (
        <span className="font-display text-sm font-semibold uppercase tracking-[0.14em] text-ink-300">
          Next <span aria-hidden="true">→</span>
        </span>
      )}
    </nav>
  )
}
