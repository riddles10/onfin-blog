import { localizedPath, t, type Locale } from '@/lib/locales'
import { parentSiteUrl } from '@/lib/onfin-links'
import CookiePreferencesButton from './CookiePreferencesButton'

// Site footer — ports onfin.io's Footer.astro structure 1:1 so the
// blog reads as part of the same family.
//
// Three blocks, top to bottom:
//   1. Four-column link grid (Trading / Investing / Company / Legal)
//   2. Two-column legal block: copyright + company info on the left,
//      research/risk/jurisdiction disclaimers on the right
//   3. Social row — icons vary by locale. Russian users get RU-specific
//      channels (Telegram RU, Facebook RU community, YouTube RU). All
//      other locales fall back to the English channels until each
//      locale gets its own.
//
// Outbound product links go to the parent site under the visitor's
// current locale via `parentSiteUrl()`. The "Blog" link points to
// the blog index on the current domain (this site).

type SocialIcon = 'telegram' | 'instagram' | 'linkedin' | 'facebook' | 'youtube'
type SocialLink = { label: string; href: string; icon: SocialIcon }

const SOCIALS_EN: SocialLink[] = [
  { label: 'Telegram', href: 'https://t.me/OnFin_analytics_EN', icon: 'telegram' },
  { label: 'Instagram', href: 'https://www.instagram.com/onfin.io/', icon: 'instagram' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/company/onfineng/', icon: 'linkedin' },
]

const SOCIALS_RU: SocialLink[] = [
  { label: 'Telegram', href: 'https://t.me/OnFin_analytics', icon: 'telegram' },
  { label: 'Facebook', href: 'https://www.facebook.com/OnFin.russian.community', icon: 'facebook' },
  { label: 'YouTube', href: 'https://www.youtube.com/@onfin_ru', icon: 'youtube' },
]

const SOCIALS_BY_LOCALE: Partial<Record<Locale, SocialLink[]>> = {
  ru: SOCIALS_RU,
}

export default function Footer({ locale }: { locale: string }) {
  const loc = locale as Locale
  const lp = (p: string) => parentSiteUrl(loc, p)

  const columns = [
    {
      heading: t(loc, 'nav.trading'),
      links: [
        { href: lp('/account-types'), label: t(loc, 'nav.account_types') },
        { href: lp('/mt4'), label: t(loc, 'nav.mt4') },
        { href: lp('/mt5'), label: t(loc, 'nav.mt5') },
        { href: lp('/trading-tools'), label: t(loc, 'nav.trading_tools') },
        { href: lp('/leverage'), label: t(loc, 'nav.leverage') },
        { href: lp('/economic-calendar'), label: t(loc, 'nav.economic_calendar') },
      ],
    },
    {
      heading: t(loc, 'nav.programs'),
      links: [
        { href: lp('/ib'), label: t(loc, 'nav.ib') },
        { href: lp('/copytrading'), label: t(loc, 'nav.copytrading') },
        { href: lp('/prop-trading'), label: t(loc, 'nav.prop_trading') },
        { href: lp('/prop-challenge'), label: t(loc, 'nav.prop_challenge') },
      ],
    },
    {
      heading: t(loc, 'nav.company'),
      links: [
        { href: lp('/about'), label: t(loc, 'nav.about') },
        { href: lp('/contacts'), label: t(loc, 'nav.contacts') },
        { href: lp('/faq'), label: t(loc, 'nav.faq') },
        { href: lp('/liquidity'), label: t(loc, 'nav.liquidity') },
        // Blog link stays on the current domain — the whole point of
        // moving blog to its own subdomain.
        { href: localizedPath(loc, '/'), label: t(loc, 'nav.blog'), internal: true },
      ],
    },
    {
      heading: t(loc, 'footer.legal'),
      links: [
        { href: lp('/documents/client-agreement'), label: t(loc, 'footer.client_agreement') },
        { href: lp('/documents/terms-of-use'), label: t(loc, 'footer.terms_of_use') },
        { href: lp('/documents/gdpr-policy'), label: t(loc, 'footer.privacy') },
        { href: lp('/documents/kyc-policy'), label: t(loc, 'footer.kyc') },
        { href: lp('/documents/risk-disclosure'), label: t(loc, 'footer.risk_disclosure') },
        { href: lp('/documents/aml-policy'), label: t(loc, 'footer.aml') },
        { href: lp('/documents/complaints-policy'), label: t(loc, 'footer.complaints') },
      ],
    },
  ]

  const socials = SOCIALS_BY_LOCALE[loc] ?? SOCIALS_EN

  return (
    <footer
      role="contentinfo"
      className="mt-24 border-t border-ink-100 bg-ink-50/50"
    >
      <div className="container-site py-14">
        {/* Top: link columns */}
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {columns.map((col) => (
            <div key={col.heading}>
              <h3 className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-brand-black">
                {col.heading}
              </h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <a
                      href={link.href}
                      className="text-sm text-ink-500 hover:text-brand-black"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Middle: legal block (copyright + company info | disclaimers) */}
        <div className="mt-12 grid gap-10 border-t border-ink-100 pt-10 lg:grid-cols-2 lg:gap-14">
          <div className="space-y-4 text-xs leading-relaxed text-ink-500">
            <p className="font-semibold text-brand-black">{t(loc, 'footer.copyright_line')}</p>
            <p>{t(loc, 'footer.company_info')}</p>
          </div>
          <div className="space-y-4 text-xs leading-relaxed text-ink-500">
            <p>{t(loc, 'footer.disclaimer.research')}</p>
            <p>{t(loc, 'footer.disclaimer.risk')}</p>
            <p>{t(loc, 'footer.disclaimer.jurisdictions')}</p>
          </div>
        </div>

        {/* Bottom: social icons */}
        <div className="mt-10 flex flex-col items-start gap-4 border-t border-ink-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
            {t(loc, 'footer.social.heading')}
          </p>
          <ul className="flex items-center gap-3">
            {socials.map((s) => (
              <li key={s.href}>
                <a
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-200 bg-white text-ink-500 transition hover:border-brand-lime hover:bg-brand-lime/10 hover:text-brand-black"
                >
                  <SocialIcon icon={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>

        {/* Cookie preferences re-open trigger (client island).
            Required by GDPR so users can withdraw or change consent.
            English-only for v1; translation tracked in a follow-up
            Asana task. */}
        <div className="mt-6 flex justify-end">
          <CookiePreferencesButton />
        </div>
      </div>
    </footer>
  )
}

function SocialIcon({ icon }: { icon: SocialIcon }) {
  switch (icon) {
    case 'telegram':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.146.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.054 5.56-5.022c.242-.213-.054-.334-.373-.121l-6.869 4.326-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.538-.196 1.006.128.832.94z" />
        </svg>
      )
    case 'instagram':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      )
    case 'linkedin':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.063 2.063 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
        </svg>
      )
    case 'facebook':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    case 'youtube':
      return (
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true">
          <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      )
  }
}
