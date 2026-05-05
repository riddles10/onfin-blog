import { notFound } from 'next/navigation'
import Header from '@/components/site/Header'
import Footer from '@/components/site/Footer'
import { SUPPORTED_LOCALES, isLocale } from '@/lib/locales'

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!isLocale(lang)) {
    notFound()
  }

  return (
    <>
      {/* Skip-to-content link for keyboard users — visually hidden until
          focused. The target landmark is the <main> rendered inside each
          page, which has id="main-content". */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-pill focus:bg-brand-black focus:px-4 focus:py-2 focus:font-display focus:text-sm focus:font-semibold focus:text-brand-lime"
      >
        Skip to content
      </a>
      <Header locale={lang} />
      {children}
      <Footer locale={lang} />
    </>
  )
}

export type { Locale } from '@/lib/locales'
