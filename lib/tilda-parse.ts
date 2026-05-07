// Pure-server parsing of the Tilda HTML export.
//
// Used by two callers:
//   - `scripts/import-tilda.ts`    → writes parsed posts into Supabase
//   - `scripts/build-fixture.ts`   → emits a TS fixture for the demo path
//
// Both share this module so there's exactly one parsing implementation
// and the demo path is a true preview of what the live import produces.

import fs from 'node:fs/promises'
import path from 'node:path'

export type IndexEntry = {
  file: string
  title: string
  og_title?: string
  canonical?: string
  english?: boolean
}

export type ParsedPost = {
  slug: string
  title: string
  excerpt: string | null
  body: string
  publishedAt: string                 // ISO timestamp at midnight UTC
  coverImage: string | null
  category: PostCategorySlug
}

export type PostCategorySlug =
  | 'market-analysis'
  | 'trading-guides'
  | 'platform-updates'
  | 'regulation-news'
  | 'strategies'
  | 'general'

// ─────────────────────────────────────────────────────────────────────────────
// Promo filter
// ─────────────────────────────────────────────────────────────────────────────

// Anything matching one of these is treated as marketing copy and skipped.
// Errs on the side of dropping borderline pieces — better to miss one
// regulation explainer than to publish a deposit-bonus promo.
const PROMO_PATTERNS: RegExp[] = [
  /\b\d{2,3}\s*%/i,                 // "111%", "20 %"
  /\bbonus\b/i,
  /\bcashback\b/i,
  /\bwelcome\b/i,
  /\bpromo(?:tion)?\b/i,
  /\bgift\b/i,
  /\bgiveaway\b/i,
  /\bcontest\b/i,
  /\bvip\b/i,
  /\bdeposit (?:bonus|reward|offer)\b/i,
  /\bguaranteed\b/i,
]

export function isPromo(title: string): boolean {
  return PROMO_PATTERNS.some((rx) => rx.test(title))
}

// ─────────────────────────────────────────────────────────────────────────────
// Slug + date extraction
// ─────────────────────────────────────────────────────────────────────────────

export function dateFromSlug(slug: string): string | null {
  const m = slug.match(/^news_(\d{2})_(\d{2})_(\d{4})/)
  if (!m) return null
  const [, dd, mm, yyyy] = m
  const iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`
  if (Number.isNaN(new Date(iso).getTime())) return null
  return iso
}

export function slugFromCanonical(canonical: string): string | null {
  const m = canonical.match(/\/(news_[\w-]+)\/?$/)
  return m ? m[1] : null
}

// ─────────────────────────────────────────────────────────────────────────────
// Title cleanup
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Drop the date prefix some Tilda titles carry, e.g.
 *   "12.12.2025 | Scheduled Maintenance Notice" → "Scheduled Maintenance Notice"
 */
export function cleanTitle(raw: string): string {
  return raw
    .replace(/^\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}\s*[|\-–]\s*/, '')
    .replace(/\s*\|\s*Onfin\.io\s*$/i, '')
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Body extraction
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Phrases that mark a tn_text block as site-wide chrome rather than the
 * article body. Tilda includes a long legal disclaimer + company info
 * + support-email block on every news page; without filtering, those
 * outrun the actual article body in length and our "pick the longest"
 * heuristic returns the wrong thing.
 *
 * Match against the first ~200 chars of the block's plain text — that
 * way a legitimate article body that happens to *mention* "OnFin Ltd
 * is registered" further down doesn't get filtered out.
 */
const SITEWIDE_CHROME_PATTERNS: RegExp[] = [
  /^Website information does not contain/i,
  /^Risk Warning:\s*Trading foreign exchange/i,
  /^OnFin Ltd is registered/i,
  /^If you have any questions, our support team/i,
  // Russian + Spanish translated copies of the same disclaimers (some pages
  // were already partially localised on Tilda — those localised chrome
  // blocks would also win the "longest" race otherwise).
  /^Информация на веб[- ]сайте не содержит/i,
  /^Предупреждение о рисках/i,
]

function isSitewideChrome(plainText: string): boolean {
  const head = plainText.slice(0, 200).trim()
  return SITEWIDE_CHROME_PATTERNS.some((rx) => rx.test(head))
}

/**
 * Decode the HTML entities that survive after we strip tags. Bodies are
 * left as HTML so browser rendering decodes entities natively, but the
 * excerpt is plain text fed straight into JSX (`{post.excerpt}`) where
 * React renders entities as literal characters — so we must decode here.
 *
 * Limited to the entities Tilda actually emits. Numeric entities are
 * rare in this corpus; if we ever see them, add a `&#\d+;` pass.
 */
function decodeBasicEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")
    .replace(/&#34;/g, '"')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&hellip;/g, '…')
    .replace(/&laquo;/g, '«')
    .replace(/&raquo;/g, '»')
}

/**
 * Tilda authors articles with stray spaces around punctuation
 * (commas, periods, semicolons, colons) — visible as "Day ." and
 * "2026 ,". Squash one space immediately before each so excerpts
 * read cleanly. Doesn't touch in-body HTML — only used on plain
 * excerpt text.
 */
function tightenPunctuation(text: string): string {
  return text
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Tilda renders editor content into many <div class="tn-atom" field="tn_text_xxx">
 * blocks. The article body is the longest tn_text block on the page that
 * ISN'T site-wide chrome (legal disclaimer / company info / support email,
 * which Tilda repeats on every page).
 */
export function extractBody(rawHtml: string): { html: string; excerpt: string | null } {
  const blockRe =
    /<div\s+class=['"][^'"]*tn-atom[^'"]*['"][^>]*field=['"]tn_text_[^'"]+['"][^>]*>([\s\S]*?)<\/div>/gi

  let longest = ''
  let longestText = ''
  let m: RegExpExecArray | null
  while ((m = blockRe.exec(rawHtml))) {
    const inner = m[1]
    const stripped = inner
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
    const plain = stripped.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
    if (isSitewideChrome(plain)) continue
    if (plain.length > longestText.length) {
      longestText = plain
      longest = stripped
    }
  }

  if (!longest) return { html: '', excerpt: null }

  // Convert <br><br> sequences into paragraph breaks.
  let html = longest
    .replace(/&nbsp;/g, ' ')
    .replace(/<br\s*\/?>(\s*<br\s*\/?>)+/gi, '</p><p>')
    .replace(/<br\s*\/?>/gi, ' ')

  // Strip data-* attrs Tilda peppers everywhere.
  html = html.replace(/\sdata-[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/g, '')

  // Normalise <li data-list=""> → plain <li>.
  html = html.replace(/<li[^>]*>/gi, '<li>')

  // Drop class/style/id from the tags we keep so prose-blog styles take over.
  html = html.replace(
    /<(p|ul|ol|li|strong|em|h2|h3|h4|blockquote|a)\b[^>]*>/gi,
    (_match, tag) => {
      // Anchors keep their href — pull it out before stripping the rest.
      if (tag.toLowerCase() === 'a') {
        const hrefMatch = _match.match(/href=(["'])([^"']+)\1/i)
        return hrefMatch ? `<a href="${hrefMatch[2]}">` : '<a>'
      }
      return `<${tag}>`
    }
  )

  // Wrap the whole blob in <p> if it doesn't already start with a block tag.
  if (!/^\s*<(p|h\d|ul|ol|blockquote)/i.test(html)) {
    html = `<p>${html}</p>`
  }

  // Tidy: drop empty paragraphs, collapse whitespace.
  html = html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  // Excerpt is plain text fed straight into JSX, not into innerHTML — so
  // decode entities here (browsers won't decode them in {expr} renders),
  // and squash Tilda's stray pre-punctuation spaces.
  const cleanedPlain = tightenPunctuation(decodeBasicEntities(longestText))
  const excerpt =
    cleanedPlain.length > 200
      ? cleanedPlain.slice(0, 200).trim() + '…'
      : cleanedPlain.trim()
  return { html, excerpt }
}

// ─────────────────────────────────────────────────────────────────────────────
// Cover image
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Pull og:image from the Tilda <head>. Tilda often serves these as
 * absolute static.tildacdn.com URLs — those will load fine over the open
 * web but won't go through next/image (we use plain <img>, so this is a
 * non-issue). If the value is relative ("images/..."), it's useless on
 * blog.onfin.io and we drop it so the category-gradient fallback kicks in.
 */
export function extractOgImage(rawHtml: string): string | null {
  const m = rawHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
  if (!m) return null
  const url = m[1].trim()
  if (!url) return null
  // Reject relative paths — they reference the original Tilda export tree
  // and won't resolve from blog.onfin.io.
  if (!/^https?:\/\//i.test(url)) return null
  return url
}

// ─────────────────────────────────────────────────────────────────────────────
// Category classification
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Bucket a parsed news post into the OnFin category set based on title
 * keywords. Order matters — earlier rules win when titles match more
 * than one pattern. Tightened against the actual archive headlines, so
 * the catch-all `general` only fires for true edge cases.
 */
export function classifyCategory(title: string): PostCategorySlug {
  const t = title.toLowerCase()

  // Regulation-news first — narrow, specific signals (jurisdiction acronyms,
  // licensing) shouldn't get swallowed by the broader platform bucket if the
  // headline happens to mention MT5 in the same breath.
  if (/regulation|license|licence|compliance|\bkyc\b|\baml\b|cftc|esma|\bfca\b|\bmas\b|misa|prudential/.test(t)) {
    return 'regulation-news'
  }

  // Platform updates — by far the largest bucket in the archive. Covers:
  //   - infrastructure (maintenance, outages, server moves)
  //   - terminal versions (MT4/MT5/launch/support)
  //   - schedule changes (sessions, holidays, daylight saving, time change)
  //   - tradeable-instrument additions (shares, ETFs, indices, instruments,
  //     trading tools, currency pairs added/removed)
  //   - account-spec changes (leverage, MINI/VIP/Standard accounts, conditions)
  //   - payment / deposit / withdrawal channel changes
  //   - product launches (copytrading, prop trading, ETF access)
  //   - support hours, contact channels
  if (/maintenance|outage|server|platform|\bmt[45]\b|metatrader|terminal|update to the|launch/.test(t)) {
    return 'platform-updates'
  }
  if (/schedule|trading hours|market hours|holiday|daylight saving|session|time change/.test(t)) {
    return 'platform-updates'
  }
  if (/instrument|trading tools|shares|stocks|\betfs?\b|indices|currency pair|trading pair/.test(t)) {
    return 'platform-updates'
  }
  if (/leverage|trading conditions|account|spread|commission|swap|margin/.test(t)) {
    return 'platform-updates'
  }
  if (/deposit|withdraw|payment|replenish|fund (your|account)|fiatsystem|billline|mpay|paylib/.test(t)) {
    return 'platform-updates'
  }
  if (/copytrading|copy trading|prop trading|prop challenge/.test(t)) {
    return 'platform-updates'
  }
  if (/support service|opening hours|contact|customer service/.test(t)) {
    return 'platform-updates'
  }
  if (/restriction|limitation|temporary|election/.test(t)) {
    return 'platform-updates'
  }

  // Strategies — narrower set, has to match technique-specific terminology.
  if (/strategy|setup|backtest|signal|indicator|risk management|position sizing|stop loss/.test(t)) {
    return 'strategies'
  }

  // Market analysis — recaps, forecasts, instrument-specific commentary,
  // year-in-review pieces.
  if (/analysis|forecast|outlook|recap|review|year with|deals of the year|most profitable|forex|\bfx\b|gold|oil|\bnfp\b|fomc|\bcpi\b|\becb\b|\bfed\b|inflation|rate decision/.test(t)) {
    return 'market-analysis'
  }

  // Trading guides — how-to / explainer / primer style.
  if (/guide|how to|explained|primer|walkthrough|tutorial|beginners?/.test(t)) {
    return 'trading-guides'
  }

  return 'general'
}

// ─────────────────────────────────────────────────────────────────────────────
// Per-page parser
// ─────────────────────────────────────────────────────────────────────────────

const MIN_BODY_LENGTH = 80

export async function parseTildaPage(
  exportDir: string,
  entry: IndexEntry
): Promise<ParsedPost | null> {
  const slug = entry.canonical ? slugFromCanonical(entry.canonical) : null
  if (!slug) return null
  const publishedAt = dateFromSlug(slug)
  if (!publishedAt) return null

  const html = await fs.readFile(path.join(exportDir, entry.file), 'utf8')
  const title = cleanTitle(entry.title || entry.og_title || '')
  if (!title) return null

  const { html: body, excerpt } = extractBody(html)
  if (!body || body.length < MIN_BODY_LENGTH) return null

  return {
    slug,
    title,
    excerpt,
    body,
    publishedAt,
    coverImage: extractOgImage(html),
    category: classifyCategory(title),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Whole-export parser
// ─────────────────────────────────────────────────────────────────────────────

export type ParseStats = {
  total: number              // raw news_* candidates
  promosSkipped: number
  parsed: number
  shortSkipped: number       // body too short to be an article
  posts: ParsedPost[]
}

/**
 * Read `_index.json`, filter to news_DD_MM_YYYY entries, drop promos,
 * parse each remaining HTML file. Returns the parsed posts plus skip counts.
 */
export async function parseAllTildaPages(exportDir: string): Promise<ParseStats> {
  const indexJson = await fs.readFile(path.join(exportDir, '_index.json'), 'utf8')
  const index = JSON.parse(indexJson) as IndexEntry[]

  const news = index.filter((e) =>
    /\/news_\d{2}_\d{2}_\d{4}/.test(e.canonical || '')
  )

  let promosSkipped = 0
  const candidates: IndexEntry[] = []
  for (const entry of news) {
    const t = entry.title || entry.og_title || ''
    if (isPromo(t)) {
      promosSkipped++
      continue
    }
    candidates.push(entry)
  }

  const posts: ParsedPost[] = []
  let shortSkipped = 0
  for (const entry of candidates) {
    const post = await parseTildaPage(exportDir, entry)
    if (post) {
      posts.push(post)
    } else {
      shortSkipped++
    }
  }

  // Newest first — same ordering the blog index uses.
  posts.sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))

  return {
    total: news.length,
    promosSkipped,
    parsed: posts.length,
    shortSkipped,
    posts,
  }
}
