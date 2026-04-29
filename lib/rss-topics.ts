// RSS-based topic seeder for the daily draft cron.
//
// Pulls headlines from the feeds configured in `TOPIC_RSS_FEEDS` (cms-config),
// dedupes them against recently-used topics in the DB, and queues a candidate
// topic with `status='pending'` and `notes='RSS: <source>'` so the topic
// picker can prefer it over the autocomplete fallback.
//
// The seeder is intentionally conservative:
//   - Only the top N items per feed are considered (most recent).
//   - Headlines that look like recaps or stale summaries are skipped.
//   - The same headline title is never queued twice (deduped by topic text).
//   - Each daily run queues at most `MAX_PER_RUN` new rows so the queue
//     doesn't balloon if the operator is on holiday.

import { XMLParser } from 'fast-xml-parser'
import { getServiceClient } from '@/lib/supabase'
import { TOPIC_RSS_FEEDS, type PostCategory } from '@/lib/cms-config'

const MAX_ITEMS_PER_FEED = 10
const MAX_PER_RUN = 8
const FETCH_TIMEOUT_MS = 8000

type RssItem = {
  title: string
  link?: string
  pubDate?: string
}

type FetchedHeadline = {
  title: string
  link: string | null
  pubDate: string | null
  source: string
  category: PostCategory
}

/**
 * Fetch + parse one RSS feed. Returns up to MAX_ITEMS_PER_FEED items.
 * Errors are swallowed so a single broken feed doesn't poison the run.
 */
async function fetchFeed(
  url: string,
  source: string,
  category: PostCategory
): Promise<FetchedHeadline[]> {
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), FETCH_TIMEOUT_MS)
  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        // Some feeds 403 the default fetch UA. A plain Mozilla string is
        // enough to get parsed RSS back.
        'User-Agent':
          'Mozilla/5.0 (compatible; OnFinBlogBot/1.0; +https://blog.onfin.io)',
        Accept: 'application/rss+xml, application/xml;q=0.9, text/xml;q=0.8',
      },
      cache: 'no-store',
    })
    if (!res.ok) {
      console.warn(`[rss-topics] ${source} → ${res.status}, skipping feed`)
      return []
    }
    const xml = await res.text()
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      trimValues: true,
    })
    const parsed = parser.parse(xml)

    // Most major financial RSS feeds are RSS 2.0: <rss><channel><item>...
    // FXStreet and ForexLive both follow this shape. A few use Atom; we
    // handle the common case here.
    const channelItems = parsed?.rss?.channel?.item
    const atomEntries = parsed?.feed?.entry
    const rawItems: unknown[] = Array.isArray(channelItems)
      ? channelItems
      : Array.isArray(atomEntries)
      ? atomEntries
      : channelItems
      ? [channelItems]
      : []

    const items: RssItem[] = rawItems
      .map((it) => {
        const obj = it as Record<string, unknown>
        const title = typeof obj.title === 'string' ? obj.title : (obj.title as { '#text'?: string })?.['#text']
        const link =
          typeof obj.link === 'string'
            ? obj.link
            : (obj.link as { '@_href'?: string; '#text'?: string })?.['@_href'] ||
              (obj.link as { '#text'?: string })?.['#text']
        const pubDate =
          (typeof obj.pubDate === 'string' && obj.pubDate) ||
          (typeof obj.published === 'string' && obj.published) ||
          (typeof obj.updated === 'string' && obj.updated) ||
          undefined
        return { title: title || '', link, pubDate }
      })
      .filter((it) => it.title && it.title.length >= 12)

    return items.slice(0, MAX_ITEMS_PER_FEED).map((it) => ({
      title: cleanTitle(it.title),
      link: it.link ?? null,
      pubDate: it.pubDate ?? null,
      source,
      category,
    }))
  } catch (err) {
    console.warn(`[rss-topics] ${source} fetch failed:`, err)
    return []
  } finally {
    clearTimeout(timer)
  }
}

function cleanTitle(t: string): string {
  return t
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim()
}

/**
 * Headlines we don't want to queue: pure recap noise, plain ticker quotes,
 * or anything obviously not interesting to a retail forex audience.
 */
function isJunkHeadline(title: string): boolean {
  const low = title.toLowerCase()
  if (low.length < 25) return true
  if (/^(daily|weekly|monthly) (recap|summary|report)/i.test(title)) return true
  if (/^(stocks|markets) (close|open|wrap)/i.test(title)) return true
  // Pure ticker mentions ("EUR/USD: 1.0850")
  if (/^[A-Z]{3}\/[A-Z]{3}:\s*[\d.,]+/.test(title)) return true
  return false
}

/**
 * Look at the topic_queue and reject any RSS headline whose title duplicates
 * an existing pending or used row. Keeps the queue from filling up with
 * variations of the same story.
 */
async function filterByDb(
  candidates: FetchedHeadline[]
): Promise<FetchedHeadline[]> {
  if (candidates.length === 0) return []
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('topic_queue')
    .select('topic')
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    console.warn('[rss-topics] could not check duplicates:', error.message)
    return candidates
  }

  const seen = new Set(
    (data || []).map((r) => normalizeTitle(r.topic as string))
  )
  return candidates.filter((c) => !seen.has(normalizeTitle(c.title)))
}

function normalizeTitle(t: string): string {
  return t.toLowerCase().replace(/[^\w\s]/g, '').replace(/\s+/g, ' ').trim()
}

/**
 * Public entrypoint. Pulls all configured feeds, dedupes, and inserts up to
 * MAX_PER_RUN new rows into topic_queue with priority 5 (above the
 * autocomplete-fallback default of 0 but below explicit operator entries
 * which the admin defaults to 10).
 *
 * Returns the number of rows inserted, the number of feeds fetched, and the
 * total candidate count — useful for logging in the cron flow.
 */
export async function seedTopicQueueFromRss(): Promise<{
  inserted: number
  fetched: number
  candidates: number
}> {
  const all = (
    await Promise.all(
      TOPIC_RSS_FEEDS.map((f) => fetchFeed(f.url, f.source, f.defaultCategory))
    )
  ).flat()

  const cleaned = all.filter((h) => !isJunkHeadline(h.title))
  const deduped = await filterByDb(cleaned)

  if (deduped.length === 0) {
    return { inserted: 0, fetched: TOPIC_RSS_FEEDS.length, candidates: cleaned.length }
  }

  const toInsert = deduped.slice(0, MAX_PER_RUN).map((h) => ({
    topic: h.title,
    keywords: deriveKeywords(h.title),
    category: h.category,
    status: 'pending' as const,
    priority: 5,
    notes: `RSS: ${h.source}${h.link ? ` — ${h.link}` : ''}`,
  }))

  const supabase = getServiceClient()
  const { error } = await supabase.from('topic_queue').insert(toInsert)
  if (error) {
    console.warn('[rss-topics] insert failed:', error.message)
    return { inserted: 0, fetched: TOPIC_RSS_FEEDS.length, candidates: cleaned.length }
  }

  console.log(
    `[rss-topics] queued ${toInsert.length} new topics from ${TOPIC_RSS_FEEDS.length} feeds`
  )
  return {
    inserted: toInsert.length,
    fetched: TOPIC_RSS_FEEDS.length,
    candidates: cleaned.length,
  }
}

/**
 * Lift a small set of keyword hints out of the headline so the AI generator
 * has something to anchor on. Naive but good enough — splits on whitespace,
 * drops stopwords, keeps the longest tokens.
 */
function deriveKeywords(title: string): string[] {
  const stopwords = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'of', 'in', 'on', 'at', 'to', 'for',
    'with', 'as', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have', 'has',
    'had', 'will', 'would', 'could', 'should', 'this', 'that', 'these', 'those',
    'from', 'after', 'before', 'over', 'under', 'into', 'about',
  ])
  const tokens = title
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 4 && !stopwords.has(t))
  // Return up to 5 most distinctive (longest) tokens
  return Array.from(new Set(tokens))
    .sort((a, b) => b.length - a.length)
    .slice(0, 5)
}
