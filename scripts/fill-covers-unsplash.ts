/**
 * Fill in cover_image for cover-less posts via Unsplash search.
 *
 * Strategy
 * --------
 * For each post category, run a couple of varied searches to build a
 * pool of unique photos. Then assign one photo from the pool to each
 * cover-less post in that category (round-robin so siblings don't all
 * get the same image). Download → upload to Supabase Storage at
 * cms-images/unsplash-covers/<slug>.jpg → set posts.cover_image.
 *
 * Unsplash TOS compliance
 * -----------------------
 * Their API rules require us to "trigger a download" when an image is
 * actually used (not just when it's previewed). We hit the
 * `links.download_location` endpoint per photo. Photographer attribution
 * is recommended; not strictly enforced for free tier — we skip per-post
 * credit for now (footer credit is sufficient for blog use).
 *
 * Rate limit handling
 * -------------------
 * Free tier = 50 requests/hour. We watch the X-Ratelimit-Remaining
 * header on every response and sleep ~62 minutes when it drops to <= 1.
 * For the typical run (6 categories × ~2 queries + 65 download triggers
 * = ~77 calls) we'll cross the boundary once, mid-run.
 *
 * Idempotency
 * -----------
 * Skips posts that already have cover_image set, unless --force.
 *
 * Usage:
 *   npm run covers:unsplash             # fill missing covers
 *   npm run covers:unsplash -- --dry    # show plan, no writes
 *   npm run covers:unsplash -- --force  # overwrite existing covers
 *
 * Required env: UNSPLASH_ACCESS_KEY, NEXT_PUBLIC_SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from '@supabase/supabase-js'

const STORAGE_BUCKET = 'cms-images'
const STORAGE_PREFIX = 'unsplash-covers'

const ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY
const SUPA_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPA_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

const PER_CALL_DELAY_MS = 600           // gentle pacing between API calls
const RATELIMIT_BACKOFF_MS = 62 * 60 * 1000  // 62 min — free tier resets hourly

type PostCategorySlug =
  | 'platform-updates'
  | 'trading-guides'
  | 'market-analysis'
  | 'regulation-news'
  | 'strategies'
  | 'general'

/**
 * Search queries per category. Two-three angles each so the photo pool
 * has visual variety — neighbouring posts won't show the exact same
 * image. Forex-flavoured but generic enough that Unsplash actually has
 * results for them.
 */
const CATEGORY_QUERIES: Record<PostCategorySlug, string[]> = {
  'platform-updates': [
    'stock market terminal',
    'forex trading screen',
    'financial dashboard',
  ],
  'trading-guides': [
    'forex trading desk',
    'investment chart analysis',
    'trader education',
  ],
  'market-analysis': [
    'candlestick chart',
    'stock market trading',
    'currency exchange',
  ],
  'regulation-news': [
    'financial regulation office',
    'legal documents desk',
    'business compliance',
  ],
  strategies: [
    'business strategy planning',
    'chess strategy desk',
    'trading whiteboard',
  ],
  general: [
    'modern finance office',
    'business workspace',
    'computer monitor charts',
  ],
}

type UnsplashPhoto = {
  id: string
  width: number
  height: number
  urls: { raw: string; full: string; regular: string; small: string }
  links: { download_location: string; html: string }
  user: { name: string; username: string }
}

// Track rate limit state across calls.
let rateRemaining: number | null = null

function sleep(ms: number) {
  return new Promise<void>((res) => setTimeout(res, ms))
}

/**
 * One Unsplash API call. Updates rateRemaining from response headers.
 * Throws on non-2xx (caller decides whether to retry / skip).
 */
async function unsplashFetch(url: string): Promise<Response> {
  const res = await fetch(url, {
    headers: { Authorization: `Client-ID ${ACCESS_KEY}` },
  })
  const remaining = res.headers.get('x-ratelimit-remaining')
  if (remaining !== null) rateRemaining = parseInt(remaining, 10)
  return res
}

/**
 * Wait if we're about to hit the rate limit. Free tier resets every
 * hour on the wall clock; we don't know when the bucket started, so
 * the safe thing is to sleep ~62 minutes and try again.
 */
async function maybeWaitForRatelimit(): Promise<void> {
  if (rateRemaining !== null && rateRemaining <= 1) {
    console.log(
      `[unsplash] rate-limit headroom = ${rateRemaining}; sleeping ${(RATELIMIT_BACKOFF_MS / 60000).toFixed(0)}m`
    )
    await sleep(RATELIMIT_BACKOFF_MS)
    rateRemaining = null  // assume reset; next response refreshes the count
  }
}

async function unsplashSearch(query: string): Promise<UnsplashPhoto[]> {
  await maybeWaitForRatelimit()
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=30&orientation=landscape&content_filter=high`
  const res = await unsplashFetch(url)
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`search ${res.status}: ${body.slice(0, 200)}`)
  }
  const data = (await res.json()) as { results: UnsplashPhoto[] }
  return data.results ?? []
}

async function unsplashTriggerDownload(photo: UnsplashPhoto): Promise<void> {
  // Per Unsplash TOS: must hit download_location when using an image.
  // Failures here aren't fatal — they're a TOS courtesy; the actual
  // image download (next step) is via the photo CDN and unaffected.
  await maybeWaitForRatelimit()
  try {
    await unsplashFetch(photo.links.download_location)
  } catch {
    /* swallow */
  }
}

/**
 * Fetch the actual image bytes. Uses urls.raw with Imgix-style params
 * to get a 1200×630 JPEG (matches the article-page hero aspect ratio
 * and the existing tilda-covers/ output dimensions). The CDN doesn't
 * count against the API rate limit.
 */
async function downloadImage(photo: UnsplashPhoto): Promise<Buffer> {
  const url = `${photo.urls.raw}&w=1200&h=630&fit=crop&fm=jpg&q=85&auto=format`
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(`image download ${res.status}`)
  }
  const ab = await res.arrayBuffer()
  return Buffer.from(ab)
}

type Post = { id: string; slug: string; title_en: string; category: string; cover_image: string | null }

async function main() {
  if (!ACCESS_KEY) {
    console.error('UNSPLASH_ACCESS_KEY must be set')
    process.exit(1)
  }
  if (!SUPA_URL || !SUPA_KEY) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  const dryRun = process.argv.includes('--dry')
  const force = process.argv.includes('--force')

  const supabase = createClient(SUPA_URL, SUPA_KEY, {
    auth: { persistSession: false },
  })

  // ── Read cover-less posts ──────────────────────────────────────────────
  let q = supabase
    .from('posts')
    .select('id, slug, title_en, category, cover_image')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (!force) q = q.is('cover_image', null)

  const { data: rawPosts, error: postsErr } = await q
  if (postsErr) {
    console.error('Failed to read posts:', postsErr.message)
    process.exit(1)
  }
  const posts = (rawPosts ?? []) as Post[]

  if (posts.length === 0) {
    console.log('No posts need covers.')
    return
  }
  console.log(`Posts needing covers: ${posts.length}`)

  // ── Group posts by category ────────────────────────────────────────────
  const byCategory = new Map<string, Post[]>()
  for (const p of posts) {
    if (!byCategory.has(p.category)) byCategory.set(p.category, [])
    byCategory.get(p.category)!.push(p)
  }
  console.log('By category:')
  for (const [cat, list] of byCategory) {
    console.log(`  ${cat}: ${list.length}`)
  }

  // ── Build photo pools per category (one batch of searches up front) ───
  console.log('\nBuilding Unsplash photo pools…')
  const photoPool = new Map<string, UnsplashPhoto[]>()
  for (const [cat, catPosts] of byCategory) {
    const queries = CATEGORY_QUERIES[cat as PostCategorySlug] ?? ['business finance']
    const seen = new Set<string>()
    const pool: UnsplashPhoto[] = []
    for (const query of queries) {
      if (pool.length >= catPosts.length + 5) break  // small headroom
      try {
        const results = await unsplashSearch(query)
        for (const p of results) {
          if (!seen.has(p.id)) {
            seen.add(p.id)
            pool.push(p)
          }
        }
        console.log(`  [${cat}] '${query}' → ${results.length} results, pool=${pool.length}, rate=${rateRemaining ?? '?'}`)
      } catch (err) {
        console.warn(`  [${cat}] '${query}' failed: ${err instanceof Error ? err.message : String(err)}`)
      }
      await sleep(PER_CALL_DELAY_MS)
    }
    photoPool.set(cat, pool)
  }

  if (dryRun) {
    console.log('\n--- DRY RUN preview ---')
    for (const [cat, catPosts] of byCategory) {
      const pool = photoPool.get(cat) ?? []
      console.log(`[${cat}]  ${catPosts.length} posts ← ${pool.length} photos in pool`)
      for (let i = 0; i < Math.min(3, catPosts.length); i++) {
        const photo = pool[i % pool.length]
        console.log(
          `  ${catPosts[i].slug.padEnd(22)} ← ${photo?.id ?? '<no photo>'}` +
            (photo ? ` by ${photo.user.name}` : '')
        )
      }
    }
    return
  }

  // ── Assign, download, upload ──────────────────────────────────────────
  console.log('\nDownloading + uploading…')
  let ok = 0
  let failed = 0
  const startedAt = Date.now()

  for (const [cat, catPosts] of byCategory) {
    const pool = photoPool.get(cat) ?? []
    if (pool.length === 0) {
      console.warn(`  [${cat}] empty pool — skipping ${catPosts.length} posts`)
      failed += catPosts.length
      continue
    }

    for (let i = 0; i < catPosts.length; i++) {
      const post = catPosts[i]
      const photo = pool[i % pool.length]
      const trace = `${post.slug.padEnd(22)} (${cat})`

      try {
        await unsplashTriggerDownload(photo)
        const buffer = await downloadImage(photo)

        const storagePath = `${STORAGE_PREFIX}/${post.slug}.jpg`
        const { error: upErr } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(storagePath, buffer, {
            contentType: 'image/jpeg',
            upsert: true,
            cacheControl: '31536000',
          })
        if (upErr) throw new Error(`storage: ${upErr.message}`)

        const { data: urlData } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(storagePath)

        const { error: updErr } = await supabase
          .from('posts')
          .update({ cover_image: urlData.publicUrl })
          .eq('id', post.id)
        if (updErr) throw new Error(`db: ${updErr.message}`)

        const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(0)
        console.log(`  ✓ ${trace} ← ${photo.id} by ${photo.user.name}  (${elapsedSec}s, rate=${rateRemaining ?? '?'})`)
        ok++
      } catch (err) {
        console.warn(`  ✗ ${trace}: ${err instanceof Error ? err.message : String(err)}`)
        failed++
      }
      await sleep(PER_CALL_DELAY_MS)
    }
  }

  console.log(`\nDone — wrote ${ok}, failed ${failed}.`)
}

main().catch((err) => {
  console.error('Cover fill failed:', err)
  process.exit(1)
})
