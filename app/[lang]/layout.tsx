import { notFound } from 'next/navigation'

// Locale shell for the public blog. Currently English-only; the array is
// what the route validates against and what Antigravity's design will key
// hreflang tags off when more locales come online.
const SUPPORTED_LOCALES = ['en'] as const
type Locale = (typeof SUPPORTED_LOCALES)[number]

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((lang) => ({ lang }))
}

export default function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: { lang: string }
}) {
  if (!(SUPPORTED_LOCALES as readonly string[]).includes(params.lang)) {
    notFound()
  }
  // The visible header / nav / footer chrome is part of the design pass —
  // leave the layout transparent until that lands so Antigravity owns those
  // structural choices.
  return <>{children}</>
}

export type { Locale }
