/** @type {import('next').NextConfig} */
//
// Self-hosted Docker deployment. `output: 'standalone'` produces a minimal
// runtime bundle under .next/standalone that the production Dockerfile copies
// into a slim node image. No Vercel-specific features are used.
//
// Legacy Tilda redirects: the imported posts use the original
// `news_DD_MM_YYYY` slug shape so old links resolve. Anyone hitting the
// pre-locale path gets bounced to the locale-prefixed canonical URL.
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Image hosts allowed by next/image. Add hosts as the CMS uses them.
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  async redirects() {
    return [
      // Pre-locale legacy URL → English canonical.
      // The Tilda export's news pages live at /news_DD_MM_YYYY (no locale).
      // Anyone landing on those without /en/ should be sent to the canonical.
      {
        source: '/news_:date',
        destination: '/en/news_:date',
        permanent: true,
      },
      // Bare root → English landing.
      {
        source: '/',
        destination: '/en',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
