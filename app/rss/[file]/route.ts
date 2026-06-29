import { buildFeed } from '@/lib/rss'
import { isLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE } from '@/lib/locales'

// Per-locale RSS feed at /rss/<locale>.xml — e.g. /rss/ru.xml.
// The dynamic segment captures the full filename ("ru.xml") so we can
// route inside Next 15's app router without needing a literal dot in
// the folder name.

export const revalidate = 3600

export function generateStaticParams() {
  return [
    ...SUPPORTED_LOCALES.map((loc) => ({ file: `${loc}.xml` })),
    { file: 'news.xml' },
  ]
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  if (!file.endsWith('.xml')) {
    return new Response('Not found', { status: 404 })
  }
  const name = file.slice(0, -'.xml'.length)
  // /rss/news.xml is the News section's own feed (English); /rss/<locale>.xml
  // are the per-locale article feeds.
  let xml: string
  if (name === 'news') {
    xml = await buildFeed(DEFAULT_LOCALE, 'news')
  } else if (isLocale(name)) {
    xml = await buildFeed(name)
  } else {
    return new Response('Not found', { status: 404 })
  }
  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
