import { SUPPORTED_LOCALES } from '@/lib/locales'

// Explicit sitemap index.
//
// `app/sitemap.ts` uses `generateSitemaps()` to emit one per-locale shard
// at /sitemap/<id>.xml, but Next 15's auto-generated index at /sitemap.xml
// does NOT serve under `output: 'standalone'` (our Docker deploy) — it 404s,
// which left robots.txt advertising a dead sitemap and ~440 blog paths
// bot-invisible. A plain route handler renders fine under standalone, so we
// build the <sitemapindex> ourselves and point robots.txt here. One shard
// per locale, ids matching generateSitemaps()' locale order.

export const revalidate = 3600

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'

export async function GET() {
  const lastmod = new Date().toISOString()
  const entries = SUPPORTED_LOCALES.map(
    (_, idx) =>
      `  <sitemap>\n    <loc>${BASE_URL}/sitemap/${idx}.xml</loc>\n    <lastmod>${lastmod}</lastmod>\n  </sitemap>`
  ).join('\n')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>
`

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
