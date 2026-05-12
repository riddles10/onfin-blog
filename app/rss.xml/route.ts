import { buildFeed } from '@/lib/rss'
import { DEFAULT_LOCALE } from '@/lib/locales'

// English firehose. Per-locale variants live at /rss/<locale>.xml.

export const revalidate = 3600

export async function GET() {
  const xml = await buildFeed(DEFAULT_LOCALE)
  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
