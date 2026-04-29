import Link from 'next/link'

const PARENT_SITE = 'https://onfin.io'

// Public site footer. Light surface to match the parent onfin.io footer
// (`bg-ink-50/50`). The dark slab pattern is reserved for hero cards and
// the article-page CTA — not for the footer.
export default function Footer({ locale }: { locale: string }) {
  const year = new Date().getFullYear()

  const groups: Array<{ heading: string; links: Array<{ href: string; label: string; external?: boolean }> }> = [
    {
      heading: 'Blog',
      links: [
        { href: `/${locale}`, label: 'All articles' },
        { href: `/${locale}?category=market-analysis`, label: 'Market analysis' },
        { href: `/${locale}?category=trading-guides`, label: 'Trading guides' },
        { href: `/${locale}?category=platform-updates`, label: 'Platform updates' },
        { href: `/${locale}?category=regulation-news`, label: 'Regulation news' },
      ],
    },
    {
      heading: 'OnFin',
      links: [
        { href: `${PARENT_SITE}`, label: 'Home', external: true },
        { href: `${PARENT_SITE}/en/about`, label: 'About', external: true },
        { href: `${PARENT_SITE}/en/contacts`, label: 'Contact', external: true },
        { href: `${PARENT_SITE}/en/account-types`, label: 'Account types', external: true },
        { href: `${PARENT_SITE}/en/documents`, label: 'Documents', external: true },
      ],
    },
    {
      heading: 'Trading',
      links: [
        { href: `${PARENT_SITE}/en/mt4`, label: 'MT4', external: true },
        { href: `${PARENT_SITE}/en/mt5`, label: 'MT5', external: true },
        { href: `${PARENT_SITE}/en/copytrading`, label: 'Copy trading', external: true },
        { href: `${PARENT_SITE}/en/prop-trading`, label: 'Prop trading', external: true },
        { href: `${PARENT_SITE}/en/economic-calendar`, label: 'Economic calendar', external: true },
      ],
    },
  ]

  return (
    <footer
      role="contentinfo"
      className="mt-24 border-t border-ink-100 bg-ink-50/50"
    >
      <div className="container-site py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand block */}
          <div>
            <a href={PARENT_SITE} aria-label="OnFin home" className="block">
              <img
                src="/logo-dark.svg"
                alt=""
                aria-hidden="true"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-ink-500">
              Editorial coverage for retail forex and CFD traders — guides,
              platform updates, regulation news, and market analysis from
              the OnFin team.
            </p>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <nav key={group.heading} aria-label={group.heading}>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-brand-black">
                {group.heading}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="text-ink-500 transition hover:text-brand-black"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-ink-500 transition hover:text-brand-black"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        {/* Disclaimer + copyright */}
        <div className="mt-12 border-t border-ink-100 pt-8 text-xs leading-relaxed text-ink-500">
          <p>
            <strong className="font-semibold text-brand-black">Risk warning.</strong>{' '}
            Trading forex and CFDs carries a high level of risk and may not
            be suitable for every investor. Leverage can work against you as
            well as for you. Before deciding to trade, consider your
            investment objectives, level of experience, and risk appetite.
            Past performance is not indicative of future results. Nothing on
            this blog constitutes investment advice.
          </p>
          <p className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span className="text-ink-400">© {year} OnFin. All rights reserved.</span>
            <span>
              <a
                href={`${PARENT_SITE}/en/documents`}
                className="text-ink-500 hover:text-brand-black"
              >
                Legal documents
              </a>
            </span>
          </p>
        </div>
      </div>
    </footer>
  )
}
