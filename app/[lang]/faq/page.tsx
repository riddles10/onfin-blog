import type { Metadata } from 'next'
import {
  type Locale,
  isLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  t,
} from '@/lib/locales'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import { buildFaqSchema, type FaqEntry } from '@/lib/faq-schema'

// Per-locale FAQ page with FAQPage JSON-LD. Top AI-citation lever per the
// May 2026 audit — concise, authoritative answers are what ChatGPT /
// Perplexity quote when asked about OnFin. Copy lives in i18n/<locale>.json
// under blog.faq.* keys (English fallback via t()); the same strings feed
// both the visible page and the schema so they never drift.

const FAQ_COUNT = 8

type Params = { lang: string }

function buildHreflang(): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    map[loc] = `/${loc}/faq`
  }
  map['x-default'] = `/${DEFAULT_LOCALE}/faq`
  return map
}

function faqEntries(locale: Locale): FaqEntry[] {
  const entries: FaqEntry[] = []
  for (let i = 1; i <= FAQ_COUNT; i++) {
    const question = t(locale, `blog.faq.q${i}`)
    const answer = t(locale, `blog.faq.a${i}`)
    // t() returns the raw key when a string is missing in both the locale
    // and English; skip those so a gap never leaks into the schema.
    if (question === `blog.faq.q${i}` || answer === `blog.faq.a${i}`) continue
    entries.push({ question, answer })
  }
  return entries
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  return {
    title: t(locale, 'blog.faq.title'),
    description: t(locale, 'blog.faq.meta_description'),
    alternates: {
      canonical: `/${lang}/faq`,
      languages: buildHreflang(),
    },
  }
}

export default async function FaqPage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')

  const entries = faqEntries(locale)
  const faqSchema = buildFaqSchema(entries)

  const breadcrumbs = [
    { label: t(locale, 'blog.breadcrumb_root'), href: `/${lang}` },
    { label: t(locale, 'blog.faq.title') },
  ]

  return (
    <main id="main-content">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <header className="border-b border-ink-100 bg-white">
        <div className="container-site pt-8 sm:pt-10">
          <Breadcrumbs crumbs={breadcrumbs} baseUrl={baseUrl} />
        </div>
        <div className="container-site pb-10 pt-6">
          <div className="mx-auto max-w-3xl">
            <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
              {t(locale, 'blog.faq.kicker')}
            </p>
            <h1 className="mt-3 font-display text-3xl font-semibold leading-tight tracking-tight text-brand-black sm:text-4xl">
              {t(locale, 'blog.faq.title')}
            </h1>
            <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
              {t(locale, 'blog.faq.intro')}
            </p>
          </div>
        </div>
      </header>

      <article className="container-site py-12 sm:py-16">
        <div className="prose-blog mx-auto max-w-3xl">
          {entries.map((e) => (
            <section key={e.question}>
              <h2>{e.question}</h2>
              <p>{e.answer}</p>
            </section>
          ))}
          <p className="text-sm text-ink-400">{t(locale, 'blog.faq.contact')}</p>
        </div>
      </article>
    </main>
  )
}
