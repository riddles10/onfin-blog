// Single, restrained CTA at the bottom of an article. One link back to
// the parent marketing site so OnFin always gets a path to conversion
// without the blog feeling like a marketing funnel.

import { parentSiteUrl } from '@/lib/onfin-links'
import { t, type Locale } from '@/lib/locales'

export default function ArticleCTA({ locale }: { locale: Locale }) {
  return (
    <aside
      aria-label={t(locale, 'blog.cta.aria')}
      className="mt-16 overflow-hidden rounded-3xl bg-[#0b0b0b] p-6 sm:p-12"
    >
      <div className="relative">
        {/* soft brand glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-brand-lime/15 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="font-display text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-lime sm:text-xs sm:tracking-[0.22em]">
            {t(locale, 'blog.cta.kicker')}
          </p>
          <h2 className="mt-3 font-display text-xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
            {t(locale, 'blog.cta.heading')}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-white/70 sm:mt-4 sm:text-base">
            {t(locale, 'blog.cta.body')}
          </p>
          {/* Buttons:
              On mobile, uppercase + wide tracking + text-sm made the
              stacked buttons feel chunky and Russian/long translations
              wrapped awkwardly. We drop to a smaller eyebrow-sized
              label (text-[11px], tighter tracking) and full-width
              stacking, then scale back up to the original ratio at
              `sm:`. The lime CTA stays the primary action. */}
          <div className="mt-6 flex flex-col gap-2.5 sm:mt-7 sm:flex-row sm:gap-3">
            <a
              href={parentSiteUrl(locale, '/account-types')}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-lime px-5 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-black transition hover:bg-white sm:px-6 sm:text-sm sm:tracking-[0.14em]"
            >
              {t(locale, 'blog.cta.open_account')}
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={parentSiteUrl(locale, '/how')}
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/30 px-5 py-3 font-display text-[11px] font-semibold uppercase tracking-[0.1em] text-white transition hover:border-brand-lime hover:text-brand-lime sm:px-6 sm:text-sm sm:tracking-[0.14em]"
            >
              {t(locale, 'blog.cta.how_it_works')}
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
