import Link from 'next/link'
import { categoriesForLocale } from '@/lib/categories'
import { t, type Locale } from '@/lib/locales'

// Filter chips for the blog index. Real `<a href>` links so the URL
// updates and the filtered list comes back via SSR — no client-side
// state, fully crawlable by search engines. Active state is bold-filled
// rather than just a color tweak so colour isn't the only signal.

export default function CategoryChips({
  locale,
  active,
}: {
  locale: Locale
  active: string | null
}) {
  const categories = categoriesForLocale(locale)
  return (
    <nav
      aria-label={t(locale, 'blog.chips.aria')}
      className="border-b border-ink-100 bg-[#f5f5f8]"
    >
      <div className="container-site">
        {/* Horizontal scroll on small screens, wrap on larger. */}
        <ul className="flex gap-2 overflow-x-auto py-4 sm:flex-wrap sm:overflow-visible">
          <li className="shrink-0">
            <Chip
              href={`/${locale}`}
              label={t(locale, 'blog.chips.all_articles')}
              active={active === null}
            />
          </li>
          {categories.map((c) => (
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
  // Onfin's pill pattern: lime-tinted active state, soft white idle.
  // The 1px border is on both states so chips don't shift on activation.
  const base =
    'inline-flex items-center rounded-pill border px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.14em] transition'
  const activeCls = 'border-brand-lime bg-brand-lime/10 text-brand-black'
  const idleCls =
    'border-ink-200 bg-white text-ink-600 hover:border-brand-lime hover:bg-brand-lime/5 hover:text-brand-black'
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
