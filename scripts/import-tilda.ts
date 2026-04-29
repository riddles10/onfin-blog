/**
 * Tilda → Supabase one-off import.
 *
 * Reads `_tilda_export/_index.json`, filters down to the news/blog pages
 * (slug shape `news_DD_MM_YYYY`), parses each Tilda page's HTML, and
 * inserts the result into Supabase as a published post under the same
 * `news_DD_MM_YYYY` slug so legacy onfin.io links continue to resolve
 * after the redirect to blog.onfin.io.
 *
 * Promo announcements (deposit bonuses, welcome bonus, cashback, etc.)
 * are intentionally skipped — those live on onfin.io as marketing pages
 * and don't belong on the editorial blog.
 *
 * Usage:
 *   npm run import:tilda           # idempotent dry-run + insert
 *   npm run import:tilda -- --dry  # don't write to DB, just print
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

type IndexEntry = {
  file: string
  title: string
  og_title?: string
  canonical?: string
  english?: boolean
}

type ParsedPost = {
  slug: string
  title: string
  excerpt: string | null
  body: string
  publishedAt: string  // ISO
  coverImage: string | null
}

const EXPORT_DIR = path.resolve(process.cwd(), '_tilda_export')
const INDEX_PATH = path.join(EXPORT_DIR, '_index.json')

// Promo headline detector. Anything matching these patterns is dropped at
// the filter step. The list errs on the side of dropping — better to lose
// a borderline news post than to import a marketing landing page.
const PROMO_PATTERNS: RegExp[] = [
  /\b\d{2,3}\s*%/i,                  // "111%", "20 %"
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

function isPromo(title: string): boolean {
  return PROMO_PATTERNS.some((rx) => rx.test(title))
}

/**
 * Pull the publish date out of a `news_DD_MM_YYYY[_n]` slug. Returns an
 * ISO string at midnight UTC for that day; we have no time-of-day info
 * from Tilda so noon-UTC ordering is good enough for the listing.
 */
function dateFromSlug(slug: string): string | null {
  const m = slug.match(/^news_(\d{2})_(\d{2})_(\d{4})/)
  if (!m) return null
  const [, dd, mm, yyyy] = m
  const iso = `${yyyy}-${mm}-${dd}T00:00:00.000Z`
  if (Number.isNaN(new Date(iso).getTime())) return null
  return iso
}

function slugFromCanonical(canonical: string): string | null {
  // Canonical looks like https://onfin.io/news_12_12_2025
  const m = canonical.match(/\/(news_[\w-]+)\/?$/)
  return m ? m[1] : null
}

/**
 * Strip the date prefix some Tilda titles carry, e.g.
 *   "12.12.2025 | Scheduled Maintenance Notice" → "Scheduled Maintenance Notice"
 * If the input has no date prefix, return as-is (trimmed).
 */
function cleanTitle(raw: string): string {
  return raw
    .replace(/^\d{1,2}[.\-/]\d{1,2}[.\-/]\d{4}\s*[|\-–]\s*/, '')
    .replace(/\s*\|\s*Onfin\.io\s*$/i, '')
    .trim()
}

/**
 * Tilda renders editor content into many <div class="tn-atom" field="tn_text_xxx">
 * blocks. The article body is the *single longest* tn_text block on the page,
 * surrounded by short ones for headers, nav, and footer chrome. We pick the
 * longest and clean it.
 */
function extractBody(rawHtml: string): { html: string; excerpt: string | null } {
  const blockRe =
    /<div\s+class=['"][^'"]*tn-atom[^'"]*['"][^>]*field=['"]tn_text_[^'"]+['"][^>]*>([\s\S]*?)<\/div>/gi

  let longest = ''
  let longestText = ''
  let m: RegExpExecArray | null
  while ((m = blockRe.exec(rawHtml))) {
    const inner = m[1]
    // Strip nested tn-atom wrappers, scripts, styles
    const stripped = inner
      .replace(/<script[\s\S]*?<\/script>/gi, '')
      .replace(/<style[\s\S]*?<\/style>/gi, '')
    const plain = stripped.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
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

  // Strip data-* attributes Tilda peppers everywhere.
  html = html.replace(/\sdata-[\w-]+(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/g, '')

  // Normalize <li data-list=""> → plain <li>.
  html = html.replace(/<li[^>]*>/gi, '<li>')

  // Drop class/style/id attributes from common tags so the article reads
  // as semantic HTML the prose-blog stylesheet can take over.
  html = html.replace(
    /<(p|ul|ol|li|strong|em|h2|h3|h4|blockquote|a)\b[^>]*>/gi,
    (_match, tag) => `<${tag}>`
  )

  // Wrap the whole blob in <p> if it doesn't already start with a block tag.
  if (!/^\s*<(p|h\d|ul|ol|blockquote)/i.test(html)) {
    html = `<p>${html}</p>`
  }

  // Collapse triple-or-more newlines and stray empty paragraphs.
  html = html
    .replace(/<p>\s*<\/p>/g, '')
    .replace(/\s+/g, ' ')
    .trim()

  const excerpt = longestText.slice(0, 200).trim() + (longestText.length > 200 ? '…' : '')
  return { html, excerpt }
}

function extractOgImage(rawHtml: string): string | null {
  const m = rawHtml.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i)
  return m ? m[1] : null
}

async function parseTildaPage(file: string, entry: IndexEntry): Promise<ParsedPost | null> {
  const slug = entry.canonical ? slugFromCanonical(entry.canonical) : null
  if (!slug) return null
  const publishedAt = dateFromSlug(slug)
  if (!publishedAt) return null

  const html = await fs.readFile(path.join(EXPORT_DIR, file), 'utf8')
  const title = cleanTitle(entry.title || entry.og_title || '')
  if (!title) return null

  const { html: body, excerpt } = extractBody(html)
  if (!body || body.length < 80) {
    console.warn(`  → skipping ${slug}: body too short to be an article`)
    return null
  }

  return {
    slug,
    title,
    excerpt,
    body,
    publishedAt,
    coverImage: extractOgImage(html),
  }
}

async function main() {
  const dryRun = process.argv.includes('--dry')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!dryRun && (!supabaseUrl || !supabaseServiceKey)) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  const indexJson = await fs.readFile(INDEX_PATH, 'utf8')
  const index = JSON.parse(indexJson) as IndexEntry[]

  const newsEntries = index.filter((e) =>
    /\/news_\d{2}_\d{2}_\d{4}/.test(e.canonical || '')
  )
  console.log(`Found ${newsEntries.length} news_* pages in index`)

  const filtered = newsEntries.filter((e) => {
    const t = e.title || e.og_title || ''
    if (isPromo(t)) {
      console.log(`  · skip promo: ${t}`)
      return false
    }
    return true
  })
  console.log(`After promo filter: ${filtered.length} candidates`)

  const parsed: ParsedPost[] = []
  for (const entry of filtered) {
    const post = await parseTildaPage(entry.file, entry)
    if (post) parsed.push(post)
  }
  console.log(`Parsed ${parsed.length} usable posts`)

  if (dryRun) {
    console.log('\n--- DRY RUN preview (first 5) ---')
    parsed.slice(0, 5).forEach((p) => {
      console.log(`\n[${p.publishedAt.slice(0, 10)}] ${p.title}`)
      console.log(`  slug: ${p.slug}`)
      console.log(`  cover: ${p.coverImage ?? '<none>'}`)
      console.log(`  excerpt: ${p.excerpt ?? '<none>'}`)
      console.log(`  body: ${p.body.length} chars`)
    })
    return
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  })

  // Find the default author so each imported post has a byline.
  const { data: defaultAuthor } = await supabase
    .from('authors')
    .select('id')
    .eq('is_default', true)
    .maybeSingle()
  const authorId = defaultAuthor?.id ?? null

  let inserted = 0
  let skipped = 0
  for (const post of parsed) {
    // Categorise based on the title — schedule/maintenance becomes a
    // platform-update; everything else lands as general.
    const cat = /maintenance|schedule|platform|update|outage/i.test(post.title)
      ? 'platform-updates'
      : /regulat/i.test(post.title)
      ? 'regulation-news'
      : 'general'

    const { error } = await supabase.from('posts').upsert(
      {
        slug: post.slug,
        title_en: post.title,
        body_en: post.body,
        excerpt_en: post.excerpt,
        category: cat,
        cover_image: post.coverImage,
        published: true,
        published_at: post.publishedAt,
        blog_author_id: authorId,
        generation_status: null,
      },
      { onConflict: 'slug' }
    )
    if (error) {
      console.warn(`  ✗ ${post.slug}: ${error.message}`)
      skipped++
    } else {
      inserted++
    }
  }
  console.log(`\nDone — upserted ${inserted}, skipped ${skipped}.`)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
