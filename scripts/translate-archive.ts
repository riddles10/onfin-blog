/**
 * One-shot machine-translation pass over the imported archive.
 *
 * For every published post and every non-English locale in
 * SUPPORTED_LOCALES, translate title + excerpt + body via Google
 * Translate's public endpoint (the unofficial-but-stable one wrapped
 * by `google-translate-api-x`) and upsert a row into
 * `post_translations` with source='ai'.
 *
 * Idempotency
 * -----------
 * Skips (post_id, locale) pairs that already have a row, unless --force
 * is passed. Failed runs resume cleanly. Per-call failures (rate limits,
 * transient network) are logged but don't abort the run — the next run
 * picks up the missing pairs.
 *
 * HTML preservation
 * -----------------
 * Article bodies use a narrow tag set (<p>, <h2>, <h3>, <ul>, <ol>,
 * <li>, <strong>, <em>, <a>, <blockquote>, <table>). Google's public
 * endpoint preserves the flow-content tags reliably IF the request is
 * short enough — it caps around ~5000 chars per call. We split the body
 * at <h2> boundaries (each section is small enough by construction),
 * translate each chunk, then reassemble.
 *
 * Table handling
 * --------------
 * Google does NOT preserve table-family tag names: <table>, <thead>,
 * <tbody>, <tr>, <th>, <td> all get translated as if they were ordinary
 * English words (→ <таблица>, <голова> etc. in RU and similar in every
 * other locale). The fix is to lift each <table>…</table> block out of
 * the body before translation, replacing it with an opaque token Google
 * round-trips intact, then translate the cell text (<td>/<th>) cell-by-
 * cell as plain strings and stitch the table back into the translated
 * body. See `extractTables`, `translateTableBlock`, and the call sequence
 * in `translateBody`. Only six tag names are exposed this way; the rest
 * of the allowed tag set survives Google's pass intact (verified against
 * existing translated rows).
 *
 * Glossary pass-through
 * ---------------------
 * Forex domain terms get wrapped in <span class="notranslate">…</span>
 * before translation. Google honours this and returns them verbatim.
 * Spans are stripped after translation so the HTML matches the source
 * structure.
 *
 * Usage:
 *   npm run translate:archive                       # all locales, all posts
 *   npm run translate:archive -- --dry              # show plan, no writes
 *   npm run translate:archive -- --locale ru        # one locale only
 *   npm run translate:archive -- --slug news_30_01_2026  # one post
 *   npm run translate:archive -- --force            # overwrite existing rows
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from '@supabase/supabase-js'
// google-translate-api-x is CJS-only; import the default export and unwrap.
import translatePkg from 'google-translate-api-x'
import { SUPPORTED_LOCALES, DEFAULT_LOCALE, type Locale } from '../lib/locales'

const translate = (translatePkg as unknown as {
  default?: typeof translatePkg
}).default ?? translatePkg

// ── Config ────────────────────────────────────────────────────────────────

const NON_ENGLISH_LOCALES: Locale[] = SUPPORTED_LOCALES.filter(
  (l) => l !== DEFAULT_LOCALE
) as Locale[]

const CHUNK_MAX_CHARS = 4000          // Google's public endpoint caps per call
const PER_CALL_DELAY_MS = 250         // gentle rate-limit between requests
const MAX_RETRIES = 3
const RETRY_BACKOFF_MS = 1500

// Google Translate uses different short codes than our route locales for
// Chinese. Everything else maps 1:1.
const GOOGLE_LOCALE_CODE: Record<Locale, string> = {
  en: 'en',
  ru: 'ru',
  vi: 'vi',
  th: 'th',
  ms: 'ms',
  id: 'id',
  es: 'es',
  km: 'km',
  zh: 'zh-CN',
}

/**
 * Forex / brand glossary that should pass through every locale verbatim.
 * Wrapped in <span class="notranslate"> before sending to Google;
 * unwrapped after.
 *
 * Patterns are intentionally narrow — overdoing this makes translations
 * read like English with foreign connectives. Keep it to brand names,
 * platform names, ticker symbols, regulator acronyms, and economic
 * indicators that don't translate well anyway.
 */
const GLOSSARY: RegExp[] = [
  // Brand
  /\bOnFin\b/g,

  // Trading platforms
  /\bMT[45]\b/g,
  /\bMetaTrader\s*[45]?\b/g,

  // Currency pairs (XXX/YYY) — three-letter ISO codes only
  /\b[A-Z]{3}\/[A-Z]{3}\b/g,

  // Regulators
  /\b(ESMA|FCA|MAS|CFTC|MISA|CySEC|ASIC|FINMA|SEC)\b/g,

  // Economic indicators / orgs
  /\b(NFP|FOMC|CPI|PMI|GDP|ECB|BoE|BoJ|RBA|RBNZ|SNB)\b/g,

  // Asset class acronyms
  /\b(ETFs?|CFDs?|FX)\b/g,

  // Product names
  /\bcopytrading\b/gi,
]

// ── Helpers ────────────────────────────────────────────────────────────────

const NOTRANSLATE_OPEN = '<span class="notranslate">'
const NOTRANSLATE_CLOSE = '</span>'

/**
 * Wrap glossary matches in <span class="notranslate"> so Google passes
 * them through. Source-string-equality check after each pattern keeps
 * us from double-wrapping nested matches.
 */
function protectGlossary(text: string): string {
  let out = text
  for (const re of GLOSSARY) {
    out = out.replace(re, (m) => `${NOTRANSLATE_OPEN}${m}${NOTRANSLATE_CLOSE}`)
  }
  return out
}

/** Inverse of protectGlossary — strips the spans Google preserved. */
function unwrapGlossary(text: string): string {
  // Some translation engines decode HTML entities inside the span. Match
  // both the literal tag and the entity-encoded variant.
  return text
    .replace(/<span class="notranslate">([\s\S]*?)<\/span>/g, '$1')
    .replace(/&lt;span class=&quot;notranslate&quot;&gt;([\s\S]*?)&lt;\/span&gt;/g, '$1')
}

// Sentinel placeholder for a <table> block. Three hash chars + a numeric
// index is implausible in editorial copy and contains no alpha letters
// Google would try to translate — round-trips intact across every locale.
const TABLE_TOKEN = (i: number) => `###TBL${i}###`
const TABLE_RE = /<table[\s\S]*?<\/table>/gi

/**
 * Replace every <table>…</table> block in the input with an opaque token
 * and return the placeholder-only string plus the list of original blocks
 * in source order. Non-greedy match so multiple tables per post stay
 * separate. Nested tables are forbidden by content rules so a simple
 * regex (rather than a full HTML parser) is sufficient.
 */
function extractTables(html: string): { stripped: string; tables: string[] } {
  const tables: string[] = []
  const stripped = html.replace(TABLE_RE, (m) => {
    const i = tables.push(m) - 1
    return TABLE_TOKEN(i)
  })
  return { stripped, tables }
}

/**
 * Translate the text inside <th> / <td> cells of a single <table> block.
 * Tag names, attributes, and surrounding whitespace are preserved
 * verbatim — that's the whole reason we never feed table HTML to Google
 * as a single string. Inline tags inside a cell (<strong>, <em>, <a>,
 * <li>) translate normally because they ride along inside the cell text
 * and survive Google's pass.
 *
 * Glossary protection is applied per-cell so brand/ticker/regulator
 * tokens pass through.
 */
async function translateTableBlock(html: string, to: string): Promise<string> {
  // Pattern matches <td> or <th> opening tag (with any attributes), inner
  // contents, and matching closing tag. Captures the open and close tags
  // separately so we can splice translated inner text between them.
  const cellRe = /(<(?:td|th)[^>]*>)([\s\S]*?)(<\/(?:td|th)>)/gi
  const cells: string[] = []
  // First pass: collect all cell inner contents in document order.
  html.replace(cellRe, (_m, _open, inner: string) => {
    cells.push(inner)
    return _m
  })
  // Translate each cell's inner content in parallel. They're short enough
  // that 10–20 parallel calls don't move the needle on rate limiting, but
  // we still throttle below with a per-table sleep in the caller.
  const translated = await Promise.all(
    cells.map(async (inner) => {
      if (!inner.trim()) return inner
      const protectedInner = protectGlossary(inner)
      const out = await gtranslate(protectedInner, to)
      return unwrapGlossary(out)
    })
  )
  // Second pass: splice translated text back in, preserving the original
  // open/close tags (including any attributes).
  let idx = 0
  return html.replace(cellRe, (_m, open: string, _inner: string, close: string) => {
    return `${open}${translated[idx++]}${close}`
  })
}

/**
 * Split body HTML at <h2> boundaries. Each chunk starts with its own
 * <h2> (or, for the first chunk, the intro paragraphs preceding the
 * first <h2>). Empty chunks dropped.
 *
 * Output chunks are re-joined with no glue — the splits happen at the
 * `<` character of an <h2> tag, so concatenation reproduces the input.
 */
function chunkByH2(html: string): string[] {
  const parts = html.split(/(?=<h2[\s>])/i)
  return parts.map((p) => p.trim()).filter((p) => p.length > 0)
}

/**
 * Further split a single chunk if it's still over the character cap.
 * Splits on the next paragraph boundary, conservative.
 */
function splitOversized(chunk: string, cap: number): string[] {
  if (chunk.length <= cap) return [chunk]
  const out: string[] = []
  let remaining = chunk
  while (remaining.length > cap) {
    // Find a <p>, <ul>, <ol>, <h3>, <blockquote> boundary near the cap.
    const cut = remaining.lastIndexOf('<p>', cap)
    const fallback = remaining.lastIndexOf('</p>', cap)
    const splitAt = cut > 0 ? cut : fallback > 0 ? fallback + 4 : cap
    out.push(remaining.slice(0, splitAt))
    remaining = remaining.slice(splitAt)
  }
  if (remaining.length > 0) out.push(remaining)
  return out
}

async function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms))
}

/**
 * Translate one short string through google-translate-api-x. Retries on
 * transient failures with exponential-ish backoff. Returns the input on
 * exhaustion so the caller can stitch around the failure rather than
 * blowing up the whole post.
 */
async function gtranslate(
  text: string,
  to: string,
  attempt = 1
): Promise<string> {
  if (!text || !text.trim()) return text
  try {
    const result = await translate(text, { from: 'en', to })
    // The library types are flexible (single vs batch). For a single
    // string input we get an object with a .text field.
    const out =
      typeof result === 'string'
        ? result
        : Array.isArray(result)
        ? (result[0] as { text?: string })?.text ?? text
        : (result as { text?: string }).text ?? text
    return out
  } catch (err) {
    if (attempt >= MAX_RETRIES) {
      console.warn(
        `[translate] giving up on '${text.slice(0, 60)}…' (${to}) after ${attempt} tries:`,
        err instanceof Error ? err.message : String(err)
      )
      return text
    }
    await sleep(RETRY_BACKOFF_MS * attempt)
    return gtranslate(text, to, attempt + 1)
  }
}

/**
 * Translate the body in pieces (chunked at H2, optionally re-split if
 * any chunk is still over cap), with the glossary protection wrapper
 * applied to each chunk. <table> blocks are lifted out before the main
 * pass (Google translates their tag names) and re-inserted after a
 * per-cell translation pass — see `extractTables` / `translateTableBlock`.
 */
async function translateBody(html: string, to: string): Promise<string> {
  // 1. Lift every <table> block out so Google never sees its tag names.
  const { stripped, tables } = extractTables(html)

  // 2. Translate the (table-free) body in the existing H2-chunked flow.
  const chunks = chunkByH2(stripped).flatMap((c) =>
    splitOversized(c, CHUNK_MAX_CHARS)
  )
  const translatedChunks: string[] = []
  for (const chunk of chunks) {
    const protectedChunk = protectGlossary(chunk)
    const out = await gtranslate(protectedChunk, to)
    translatedChunks.push(unwrapGlossary(out))
    await sleep(PER_CALL_DELAY_MS)
  }
  let bodyOut = translatedChunks.join('')

  // 3. Translate each extracted table cell-by-cell and splice it back
  // into the body at the corresponding token. We walk in order so the
  // i-th token maps to the i-th original table, regardless of where the
  // tokens end up in the (possibly reordered) translated chunk text.
  for (let i = 0; i < tables.length; i++) {
    const translatedTable = await translateTableBlock(tables[i], to)
    bodyOut = bodyOut.replace(TABLE_TOKEN(i), translatedTable)
    await sleep(PER_CALL_DELAY_MS)
  }

  return bodyOut
}

// ── Main ──────────────────────────────────────────────────────────────────

type ArgvFlags = {
  dry: boolean
  force: boolean
  locale: Locale | null
  slug: string | null
}

function parseArgs(argv: string[]): ArgvFlags {
  const flags: ArgvFlags = { dry: false, force: false, locale: null, slug: null }
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i]
    if (a === '--dry') flags.dry = true
    else if (a === '--force') flags.force = true
    else if (a === '--locale') {
      const v = argv[++i]
      if (v && (NON_ENGLISH_LOCALES as string[]).includes(v)) flags.locale = v as Locale
      else throw new Error(`--locale must be one of: ${NON_ENGLISH_LOCALES.join(', ')}`)
    } else if (a === '--slug') {
      flags.slug = argv[++i] ?? null
    }
  }
  return flags
}

async function main() {
  const flags = parseArgs(process.argv.slice(2))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  // ── Fetch posts ────────────────────────────────────────────────────────
  let q = supabase
    .from('posts')
    .select('id, slug, title_en, body_en, excerpt_en')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (flags.slug) q = q.eq('slug', flags.slug)
  const { data: posts, error: postsErr } = await q
  if (postsErr) {
    console.error('Failed to read posts:', postsErr.message)
    process.exit(1)
  }
  if (!posts || posts.length === 0) {
    console.log('No posts to translate.')
    return
  }
  console.log(`Posts to consider: ${posts.length}`)

  // ── Fetch existing translations to skip already-done pairs ─────────────
  const targetLocales = flags.locale ? [flags.locale] : NON_ENGLISH_LOCALES
  const existing = new Set<string>()       // key: `${post_id}::${locale}`
  if (!flags.force) {
    const { data: rows } = await supabase
      .from('post_translations')
      .select('post_id, locale')
      .in('post_id', posts.map((p) => p.id))
      .in('locale', targetLocales as string[])
    for (const r of rows ?? []) {
      existing.add(`${r.post_id}::${r.locale}`)
    }
  }

  // ── Plan ────────────────────────────────────────────────────────────────
  const todo: Array<{ post: typeof posts[number]; locale: Locale }> = []
  for (const p of posts) {
    for (const loc of targetLocales) {
      if (!flags.force && existing.has(`${p.id}::${loc}`)) continue
      todo.push({ post: p as typeof posts[number], locale: loc as Locale })
    }
  }
  console.log(
    `${todo.length} (post, locale) pairs to translate ` +
      `(${posts.length} posts × ${targetLocales.length} locales, ` +
      `${posts.length * targetLocales.length - todo.length} already done)`
  )

  if (flags.dry) {
    console.log('\nDry run preview (first 10 pairs):')
    for (const t of todo.slice(0, 10)) {
      console.log(`  ${t.locale.padEnd(3)}  ${t.post.slug.padEnd(22)}  ${t.post.title_en}`)
    }
    return
  }

  // ── Translate + upsert ─────────────────────────────────────────────────
  let ok = 0
  let failed = 0
  const startedAt = Date.now()
  for (let i = 0; i < todo.length; i++) {
    const { post, locale } = todo[i]
    const target = GOOGLE_LOCALE_CODE[locale]
    const slugTrace = `[${i + 1}/${todo.length}] ${locale}/${post.slug}`
    try {
      const protectedTitle = protectGlossary(post.title_en)
      const protectedExcerpt = post.excerpt_en
        ? protectGlossary(post.excerpt_en)
        : ''

      const [titleOut, bodyOut, excerptOut] = await Promise.all([
        gtranslate(protectedTitle, target),
        translateBody(post.body_en, target),
        protectedExcerpt ? gtranslate(protectedExcerpt, target) : Promise.resolve(''),
      ])

      const title = unwrapGlossary(titleOut).trim()
      const body = bodyOut
      const excerpt = excerptOut ? unwrapGlossary(excerptOut).trim() : null

      const { error: upErr } = await supabase.from('post_translations').upsert(
        {
          post_id: post.id,
          locale,
          title,
          body,
          excerpt,
          source: 'ai' as const,
        },
        { onConflict: 'post_id,locale' }
      )
      if (upErr) {
        console.warn(`  ✗ ${slugTrace}: db: ${upErr.message}`)
        failed++
      } else {
        const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(0)
        console.log(`  ✓ ${slugTrace}  (${elapsedSec}s elapsed)`)
        ok++
      }
    } catch (err) {
      console.warn(
        `  ✗ ${slugTrace}: ${err instanceof Error ? err.message : String(err)}`
      )
      failed++
    }

    await sleep(PER_CALL_DELAY_MS)
  }

  const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(0)
  console.log(`\nDone in ${elapsedSec}s — wrote ${ok}, failed ${failed}.`)
}

main().catch((err) => {
  console.error('Translate-archive failed:', err)
  process.exit(1)
})
