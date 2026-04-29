import type { Metadata } from 'next'
import './globals.css'

// Root metadata that every route inherits unless it overrides. Per-route
// pages set their own title/description/OG/JSON-LD on top of this.
export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'),
  title: {
    default: 'OnFin Blog',
    template: '%s — OnFin Blog',
  },
  description:
    'Market analysis, trading guides, platform updates, and regulation news from OnFin.',
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
      </head>
      <body>{children}</body>
    </html>
  )
}
