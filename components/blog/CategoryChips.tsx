import Link from 'next/link'
import { ALL_CATEGORIES } from '@/lib/categories'

// Filter chips for the blog index. Real `<a href>` links so the URL
// updates and the filtered list comes back via SSR — no client-side
// state, fully crawlable by search engines. Active state is bold-filled
// rather than just a color tweak so colour isn't the only signal.

export default function CategoryChips({
  locale,
  active,
}: {
  locale: string
  active: string | null
}) {
  return (
    <nav
      aria-label="Filter posts by category"
      className="border-b border-ink-100 bg-white"
    >
      <div className="container-site">
        {/* Horizontal scroll on small screens, wrap on larger. */}
        <ul className="flex gap-2 overflow-x-auto py-4 sm:flex-wrap sm:overflow-visible">
          <li className="shrink-0">
            <Chip
              href={`/${locale}`}
              label="All articles"
              active={active === null}
            />
          </li>
          {ALL_CATEGORIES.map((c) => (
            <li key={c.slug} className="shrink-0">
              <Chip
                href={`/${locale}?category=${c.slug}`}
                label={c.label}
                active={active === c.slug}
              />
            </li>
          ))}
        </ul>
      </div>
    </nav>
  )
}

function Chip({
  href,
  label,
  active,
}: {
  href: string
  label: string
  active: boolean
}) {
  const base =
    'inline-flex items-center rounded-pill px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.14em] transition'
  const activeCls = 'bg-brand-black text-white'
  const idleCls =
    'border border-ink-200 bg-white text-ink-600 hover:border-brand-black hover:text-brand-black'
  return (
    <Link
      href={href}
      className={`${base} ${active ? activeCls : idleCls}`}
      aria-current={active ? 'page' : undefined}
    >
      {label}
    </Link>
  )
}
