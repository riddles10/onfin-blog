import type { Metadata } from 'next'
import {
  type Locale,
  isLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  t,
} from '@/lib/locales'
import Breadcrumbs from '@/components/blog/Breadcrumbs'

// Editorial / fact-check policy page. Required by the May 2026 SEO
// audit (P1 #9, E-E-A-T) — Google looks for an explicit editorial
// policy on YMYL sites before ranking long-form trading content.
//
// Static page, copy lives in i18n/<locale>.json under blog.editorial.*
// keys. Falls back to English copy if a locale doesn't have the
// translation yet (handled by the t() helper).

type Params = { lang: string }

function buildHreflang(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    map[loc] = `/${loc}/editorial-policy`
  }
  map['x-default'] = `/${DEFAULT_LOCALE}/editorial-policy`
  return map
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  return {
    title: t(locale, 'blog.editorial.title'),
    description: t(locale, 'blog.editorial.intro'),
    alternates: {
      canonical: `/${lang}/editorial-policy`,
      languages: buildHreflang(),
    },
  }
}

export default async function EditorialPolicyPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')

  const sections: Array<{ heading: string; body: string }> = [
    {
      heading: t(locale, 'blog.editorial.section.scope.heading'),
      body: t(locale, 'blog.editorial.section.scope.body'),
    },
    {
      heading: t(locale, 'blog.editorial.section.sources.heading'),
      body: t(locale, 'blog.editorial.section.sources.body'),
    },
    {
      heading: t(locale, 'blog.editorial.section.review.heading'),
      body: t(locale, 'blog.editorial.section.review.body'),
    },
    {
      heading: t(locale, 'blog.editorial.section.corrections.heading'),
      body: t(locale, 'blog.editorial.section.corrections.body'),
    },
    {
      heading: t(locale, 'blog.editorial.section.independence.heading'),
      body: t(locale, 'blog.editorial.section.independence.body'),
    },
  ]

  const breadcrumbs = [
    { label: t(locale, 'blog.breadcrumb_root'), href: `/${lang}` },
    { label: t(locale, 'blog.editorial.title') },
  ]

  return (
    <main id="main-content">
      <header className="border-b border-ink-100 bg-white">
        <div className="container-site pt-8 sm:pt-10">
          <Breadcrumbs crumbs={breadcrumbs} baseUrl={baseUrl} />
        </div>
        <div className="container-site pb-10 pt-6">
          <div className="mx-auto max-w-3xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
              {t(locale, 'blog.editorial.kicker')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-brand-black sm:text-4xl">
              {t(locale, 'blog.editorial.title')}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
              {t(locale, 'blog.editorial.intro')}
            </p>
          </div>
        </div>
      </header>

      <article className="container-site py-12 sm:py-16">
        <div className="prose-blog mx-auto max-w-3xl">
          {sections.map((s) => (
            <section key={s.heading}>
              <h2>{s.heading}</h2>
              <p>{s.body}</p>
            </section>
          ))}
          <p className="text-sm text-ink-400">
            {t(locale, 'blog.editorial.contact')}
          </p>
        </div>
      </article>
    </main>
  )
}
