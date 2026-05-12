import Link from 'next/link'
import { t, type Locale } from '@/lib/locales'

// Standard CFD/forex retail-trader risk disclosure block. Required on
// long-form trading-strategy posts per the May 2026 SEO audit (P1 #9,
// E-E-A-T) — Google flags YMYL trading content without a visible risk
// disclosure as low-trust.
//
// Renders inside .prose-blog so it gets prose styling for free, but
// wraps in an <aside role="note"> with a tinted background so readers
// can scan past it once they've seen it. Author/template embeds it
// once near the start of the article body.

export default function RiskDisclosure({ locale }: { locale: Locale }) {
  return (
    <aside
      role="note"
      aria-label={t(locale, 'blog.risk.aria')}
      className="not-prose my-8 rounded-2xl border border-amber-200 bg-amber-50/80 p-5 sm:p-6"
    >
      <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-amber-700">
        {t(locale, 'blog.risk.kicker')}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-ink-700">
        {t(locale, 'blog.risk.body')}
      </p>
      <p className="mt-3 text-xs text-ink-500">
        <Link
          href={`/${locale}/editorial-policy`}
          className="font-semibold text-brand-black underline hover:text-brand-blue"
        >
          {t(locale, 'blog.risk.editorial_link')}
        </Link>
      </p>
    </aside>
  )
}
