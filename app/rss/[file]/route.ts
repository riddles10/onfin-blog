import { buildFeed } from '@/lib/rss'
import { isLocale, SUPPORTED_LOCALES } from '@/lib/locales'

// Per-locale RSS feed at /rss/<locale>.xml — e.g. /rss/ru.xml.
// The dynamic segment captures the full filename ("ru.xml") so we can
// route inside Next 15's app router without needing a literal dot in
// the folder name.

export const revalidate = 3600

export function generateStaticParams() {
  return SUPPORTED_LOCALES.map((loc) => ({ file: `${loc}.xml` }))
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ file: string }> }
) {
  const { file } = await params
  if (!file.endsWith('.xml')) {
    return new Response('Not found', { status: 404 })
  }
  const locale = file.slice(0, -'.xml'.length)
  if (!isLocale(locale)) {
    return new Response('Not found', { status: 404 })
  }
  const xml = await buildFeed(locale)
  return new Response(xml, {
    headers: {
      'content-type': 'application/rss+xml; charset=utf-8',
      'cache-control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
