import Link from 'next/link'
import { localizedPath, t, type Locale } from '@/lib/locales'
import { parentSiteHome, parentSiteUrl } from '@/lib/onfin-links'
import LanguageSwitcher from './LanguageSwitcher'
import MobileNav from './MobileNav'

// Site header — ports onfin.io's Nav.astro structure 1:1 so the blog's
// chrome reads as part of the same family.
//
// Top-level groups + hover dropdowns work via pure CSS (`group/menu`
// pattern from Tailwind), no client-side JS. The mobile drawer is a
// small client island (MobileNav.tsx). The language switcher is a
// separate client island that reads the current pathname.
//
// External portal links go to client.onfin.io and are kept English-only
// for now (matches onfin.io behaviour).

interface NavLink {
  href: string
  label: string
}

interface NavGroup {
  label: string
  items: NavLink[]
}

export default function Header({ locale: localeProp }: { locale: string }) {
  const locale = localeProp as Locale
  const lp = (p: string) => parentSiteUrl(locale, p)

  // Top-level nav groups — mirrors onfin.io exactly:
  // Trading solutions · Markets · Investing · Affiliate program · About Us
  const groups: NavGroup[] = [
    {
      label: t(locale, 'nav.trading'),
      items: [
        { href: lp('/account-types'), label: t(locale, 'nav.account_types') },
        { href: lp('/deposit'), label: t(locale, 'nav.deposit') },
        { href: lp('/withdraw'), label: t(locale, 'nav.withdraw') },
        { href: lp('/leverage'), label: t(locale, 'nav.leverage') },
        { href: lp('/how'), label: t(locale, 'nav.how') },
        { href: lp('/mt4'), label: t(locale, 'nav.mt4') },
        { href: lp('/mt5'), label: t(locale, 'nav.mt5') },
        { href: lp('/economic-calendar'), label: t(locale, 'nav.economic_calendar') },
      ],
    },
    {
      label: t(locale, 'nav.trading_tools'),
      items: [{ href: lp('/trading-tools'), label: t(locale, 'nav.trading_tools') }],
    },
    {
      label: t(locale, 'nav.programs'),
      items: [
        { href: lp('/copytrading'), label: t(locale, 'nav.copytrading') },
        { href: lp('/prop-trading'), label: t(locale, 'nav.prop_trading') },
        { href: lp('/prop-challenge'), label: t(locale, 'nav.prop_challenge') },
      ],
    },
    {
      label: t(locale, 'nav.affiliate_program'),
      items: [{ href: lp('/ib'), label: t(locale, 'nav.ib') }],
    },
    {
      label: t(locale, 'nav.company'),
      items: [
        { href: lp('/about'), label: t(locale, 'nav.about') },
        { href: lp('/liquidity'), label: t(locale, 'nav.liquidity') },
        // Blog stays on the current domain — that's why we forked it.
        { href: localizedPath(locale, '/'), label: t(locale, 'nav.blog') },
        { href: lp('/documents'), label: t(locale, 'nav.documents') },
        { href: lp('/contacts'), label: t(locale, 'nav.contacts') },
        { href: lp('/faq'), label: t(locale, 'nav.faq') },
      ],
    },
  ]

  // Client portal — always English for now (matches onfin.io behaviour).
  const loginHref = 'https://client.onfin.io/#/login?lang=en'
  const registerHref = 'https://client.onfin.io/#/register?lang=en'

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-ink-100 bg-white/95 backdrop-blur">
        <div className="container-site flex h-16 items-center justify-between gap-4">
          {/* Logo links to bare onfin.io so the parent's own redirect picks
              the locale — don't inherit ours; the visitor may have only
              dropped by the blog momentarily. */}
          <a href={parentSiteHome()} className="block shrink-0" aria-label="OnFin home">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-dark.svg"
              alt="OnFin"
              className="h-9 w-auto"
              width={192}
              height={46}
            />
          </a>

          {/* Desktop nav — hover dropdowns via pure CSS */}
          <nav
            className="hidden flex-1 items-center justify-center gap-5 lg:flex xl:gap-8"
            aria-label="Primary"
          >
            {groups.map((group) => (
              <div key={group.label} className="group/menu relative">
                <button
                  type="button"
                  className="nav-trigger flex items-center gap-1 whitespace-nowrap py-5 text-sm font-medium text-brand-black/85 transition group-hover/menu:text-brand-black group-focus-within/menu:text-brand-black"
                  aria-haspopup="true"
                  aria-expanded="false"
                >
                  {group.label}
                  <span
                    className="inline-block text-[10px] transition group-hover/menu:rotate-180 group-focus-within/menu:rotate-180"
                    aria-hidden="true"
                  >
                    ▼
                  </span>
                </button>
                <div className="invisible absolute left-1/2 top-full z-50 min-w-[240px] -translate-x-1/2 -translate-y-1 rounded-2xl border border-ink-100 bg-white p-2 opacity-0 shadow-xl transition duration-150 group-hover/menu:visible group-hover/menu:translate-y-0 group-hover/menu:opacity-100 group-focus-within/menu:visible group-focus-within/menu:translate-y-0 group-focus-within/menu:opacity-100">
                  {group.items.map((item) => {
                    const isInternal = item.href.startsWith('/')
                    return isInternal ? (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="block rounded-xl px-4 py-2.5 text-sm text-brand-black/80 hover:bg-ink-50 hover:text-brand-black"
                      >
                        {item.label}
                      </Link>
                    ) : (
                      <a
                        key={item.href}
                        href={item.href}
                        className="block rounded-xl px-4 py-2.5 text-sm text-brand-black/80 hover:bg-ink-50 hover:text-brand-black"
                      >
                        {item.label}
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>

          {/* Right side: portal CTAs + language switcher + mobile hamburger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <a
              href={loginHref}
              className="hidden rounded-full border border-ink-200 bg-white px-5 py-2 text-sm font-medium text-brand-black transition hover:border-ink-300 sm:inline-block"
            >
              {t(locale, 'cta.login')}
            </a>
            <a
              href={registerHref}
              className="hidden rounded-full px-4 py-2 text-sm font-medium text-brand-black transition hover:text-brand-black/70 sm:inline-block"
            >
              {t(locale, 'cta.register')}
            </a>

            <LanguageSwitcher locale={locale} />

            {/* Mobile hamburger — shown below lg, controlled by MobileNav */}
            <MobileNavTrigger />
          </div>
        </div>
      </header>

      {/* The mobile drawer is rendered as a SIBLING of the header, not a
          child — the header uses backdrop-blur which establishes a
          containing block for position:fixed. A drawer nested inside the
          header would snap to the header's 64px bounds instead of the
          full viewport. */}
      <MobileNav locale={locale} groups={groups} loginHref={loginHref} registerHref={registerHref} />
    </>
  )
}

/**
 * Mobile hamburger button — kept here as a separate small client island
 * via MobileNav so the header stays a server component. The button just
 * dispatches a custom event the drawer listens for.
 */
function MobileNavTrigger() {
  return (
    <button
      type="button"
      data-mobile-nav-trigger
      className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-brand-black transition hover:bg-ink-50 lg:hidden"
      aria-controls="mobile-nav-drawer"
      aria-expanded="false"
      aria-label="Open menu"
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 6h18M3 12h18M3 18h18" />
      </svg>
    </button>
  )
}
