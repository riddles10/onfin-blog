import Link from 'next/link'

export type Crumb = { label: string; href?: string }

// Renders the visible breadcrumb trail and emits the matching
// BreadcrumbList JSON-LD so search engines pick it up. Used at the top
// of the article page.

export default function Breadcrumbs({
  crumbs,
  baseUrl,
}: {
  crumbs: Crumb[]              // last item is the current page (no href)
  baseUrl: string              // absolute origin, e.g. https://blog.onfin.io
}) {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((c, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${baseUrl}${c.href}` } : {}),
    })),
  }

  return (
    <nav aria-label="Breadcrumb" className="text-xs">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
      <ol className="flex flex-wrap items-center gap-1.5 text-ink-400">
        {crumbs.map((c, i) => {
          const last = i === crumbs.length - 1
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className="font-display font-medium uppercase tracking-[0.14em] text-ink-500 transition hover:text-brand-black"
                >
                  {c.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? 'page' : undefined}
                  className="font-display font-semibold uppercase tracking-[0.14em] text-brand-black"
                >
                  {/* Truncate long titles in the trailing crumb so the row
                      stays on one line on most screens. */}
                  {last && c.label.length > 60
                    ? c.label.slice(0, 58).trimEnd() + '…'
                    : c.label}
                </span>
              )}
              {!last && (
                <span aria-hidden="true" className="text-ink-300">/</span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
