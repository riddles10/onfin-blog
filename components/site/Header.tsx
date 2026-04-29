import Link from 'next/link'

// Public site header for blog.onfin.io.
//
// Deliberately small — readers came for an article, not a marketing nav.
// Logo links to the parent marketing site (onfin.io); a single right-side
// CTA points at account opening so OnFin gets a constant, unobtrusive
// conversion path without cluttering the editorial surface.

const PARENT_SITE = 'https://onfin.io'

export default function Header({ locale }: { locale: string }) {
  return (
    <header
      role="banner"
      className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur"
    >
      <div className="container-site flex items-center justify-between gap-6 py-4">
        <div className="flex items-center gap-8">
          {/* Logo — to parent marketing site */}
          <a
            href={PARENT_SITE}
            className="flex items-center gap-2"
            aria-label="OnFin home"
          >
            <img
              src="/logo.svg"
              alt=""
              aria-hidden="true"
              width={108}
              height={28}
              className="h-7 w-auto"
            />
          </a>

          {/* Single in-site link back to the blog index */}
          <nav aria-label="Blog navigation" className="hidden sm:block">
            <Link
              href={`/${locale}`}
              className="font-display text-sm font-medium tracking-wide text-brand-black transition hover:text-brand-blue"
            >
              Blog
            </Link>
          </nav>
        </div>

        <a
          href={`${PARENT_SITE}/en/account-types`}
          className="group inline-flex items-center gap-1.5 rounded-pill bg-brand-black px-4 py-2 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-lime transition hover:bg-ink-700"
        >
          Open account
          <span
            aria-hidden="true"
            className="transition group-hover:translate-x-0.5"
          >
            →
          </span>
        </a>
      </div>
    </header>
  )
}
