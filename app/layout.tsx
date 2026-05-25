import type { Metadata } from 'next'
import './globals.css'
import ConsentBanner from '@/components/ConsentBanner'
import { GtmHead, GtmNoScript } from '@/components/GoogleTagManager'
import GtmConsentBridge from '@/components/GtmConsentBridge'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'
const PARENT_URL = 'https://onfin.io'

// Google Tag Manager container id (e.g. GTM-XXXXXXX). When unset, no GTM/GA
// scripts are emitted — the site behaves exactly as before. Set in the host
// env to switch analytics on. See components/GoogleTagManager.tsx.
const GTM_ID = process.env.NEXT_PUBLIC_GTM_ID

// Organization JSON-LD lives on every page. Mirrors the brand profile
// declared on onfin.io so that Google treats the blog subdomain as
// part of the same publisher entity (key for Knowledge-Graph carryover).
const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${PARENT_URL}/#organization`,
  name: 'OnFin',
  alternateName: 'OnFin Blog',
  url: PARENT_URL,
  logo: {
    '@type': 'ImageObject',
    url: `${BASE_URL}/logo.svg`,
    width: 192,
    height: 46,
  },
  sameAs: [
    'https://t.me/OnFin_analytics_EN',
    'https://www.instagram.com/onfin.io/',
    'https://www.linkedin.com/company/onfineng/',
    'https://t.me/OnFin_analytics',
    'https://www.facebook.com/OnFin.russian.community',
    'https://www.youtube.com/@onfin_ru',
  ],
  description:
    'OnFin is an international forex and CFD broker offering MT4/MT5 trading, copy trading, and prop trading on 800+ instruments. Licensed under Mohéli MISA (BFX2024038).',
}

// Root metadata that every route inherits unless it overrides. Per-route
// pages set their own title/description/OG/JSON-LD on top of this.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'),
  title: {
    // `default` is used only when a child route doesn't set its own title.
    // Per-locale homepage and article pages emit absolute titles, so this
    // fallback is mostly defensive (e.g. /admin routes).
    default: 'OnFin Blog | Forex and CFD trading guides for retail traders',
    // Pipe-separated and brand-suffixed — the audit flagged em-dashes as
    // SERP-breaking and the brand was being concatenated twice.
    template: '%s | OnFin Blog',
  },
  description:
    'Forex and CFD trading guides, market analysis, platform updates, and regulation news from OnFin.',
  openGraph: {
    type: 'website',
    siteName: 'OnFin Blog',
  },
  robots: { index: true, follow: true },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* GTM + Consent Mode v2 — emitted as high in <head> as possible, and
            only when a container id is configured. */}
        {GTM_ID && <GtmHead gtmId={GTM_ID} />}
        {/*
          Web fonts are loaded via the standard Google Fonts link tags so
          static export and Docker SSR both work without next/font's
          build-time fetch (which was Vercel-friendly but adds friction in
          some self-hosted CI setups).
        */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;500;600;700&family=Unbounded:wght@400;500;600;700&display=swap"
        />
        {/* RSS autodiscovery — feed readers pick up the English firehose
            from the <head> link. Per-locale feeds live at /rss/<locale>.xml. */}
        <link
          rel="alternate"
          type="application/rss+xml"
          title="OnFin Blog"
          href="/rss.xml"
        />
      </head>
      <body>
        {/* GTM <noscript> fallback — must be immediately after <body>. */}
        {GTM_ID && <GtmNoScript gtmId={GTM_ID} />}
        {/* Forwards live consent-banner choices to Consent Mode v2. */}
        {GTM_ID && <GtmConsentBridge />}
        {/* Site-wide Organization schema — picked up by Google Knowledge
            Graph and answer-engine crawlers so the blog subdomain
            inherits brand identity from onfin.io. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }}
        />
        {children}
        <ConsentBanner />
      </body>
    </html>
  )
}
