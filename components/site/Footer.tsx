import Link from 'next/link'

const PARENT_SITE = 'https://onfin.io'

// Public site footer. Same restrained tone as the header — a few essential
// links to the parent marketing site, copyright, and the legal disclaimer
// that an editorial site about trading needs.
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
      className="mt-24 border-t border-ink-100 bg-[#0b0b0b] text-white/80"
    >
      <div className="container-site py-14">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand block */}
          <div>
            <a href={PARENT_SITE} aria-label="OnFin home">
              <img
                src="/logo-dark.svg"
                alt=""
                aria-hidden="true"
                width={120}
                height={32}
                className="h-8 w-auto"
              />
            </a>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              Editorial coverage for retail forex and CFD traders — guides,
              platform updates, regulation news, and market analysis from
              the OnFin team.
            </p>
          </div>

          {/* Link groups */}
          {groups.map((group) => (
            <nav
              key={group.heading}
              aria-label={group.heading}
            >
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-white">
                {group.heading}
              </p>
              <ul className="mt-4 space-y-2 text-sm">
                {group.links.map((link) => (
                  <li key={link.href}>
                    {link.external ? (
                      <a
                        href={link.href}
                        className="text-white/70 transition hover:text-brand-lime"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-white/70 transition hover:text-brand-lime"
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
        <div className="mt-12 border-t border-white/10 pt-8 text-xs leading-relaxed text-white/50">
          <p>
            <strong className="text-white/70">Risk warning.</strong> Trading
            forex and CFDs carries a high level of risk and may not be
            suitable for every investor. Leverage can work against you as
            well as for you. Before deciding to trade, consider your
            investment objectives, level of experience, and risk appetite.
            Past performance is not indicative of future results. Nothing on
            this blog constitutes investment advice.
          </p>
          <p className="mt-4 flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
            <span>© {year} OnFin. All rights reserved.</span>
            <span>
              <a
                href={`${PARENT_SITE}/en/documents`}
                className="text-white/70 hover:text-brand-lime"
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
