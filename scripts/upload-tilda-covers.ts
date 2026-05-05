/**
 * Pull a hero image out of each Tilda news page, upload it to Supabase
 * Storage, and set `posts.cover_image` to the public URL.
 *
 * Strategy
 * --------
 * Tilda generated 1200×630 social-share images for each news article but
 * never wired them into <meta property="og:image"> (Tilda quirk). They
 * live as static files referenced from the page body.
 *
 * For each post:
 *   1. Find the matching Tilda HTML file (by slug → canonical map).
 *   2. Cross-reference image usage across ALL news pages, so we know which
 *      image filenames are page-unique vs. shared chrome (~29 chrome images
 *      reused across the whole archive).
 *   3. Among the page's UNIQUE images, prefer ones whose filename contains
 *      `1200630` / `1200x630` (Tilda's social-share dimensions).
 *   4. Prefer the full-res variant — Tilda also stores low-res placeholders
 *      named `*__-__resize__20x__*` which we explicitly avoid.
 *   5. Read the bytes from disk, upload to Supabase Storage at a stable
 *      path (`tilda-covers/<slug>.<ext>`), set posts.cover_image to the
 *      public URL.
 *
 * Idempotent: posts that already have a cover_image set are skipped
 * unless `--force` is passed. Re-running on a post will overwrite the
 * Storage object (upsert: true) but won't waste bandwidth on already-
 * resolved posts.
 *
 * Usage:
 *   npm run upload:covers              # only fill in null cover_image
 *   npm run upload:covers -- --dry     # show what would happen
 *   npm run upload:covers -- --force   # overwrite existing covers too
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import fs from 'node:fs/promises'
import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'

const EXPORT_DIR = path.resolve(process.cwd(), '_tilda_export')
const STORAGE_BUCKET = 'cms-images'
const STORAGE_PREFIX = 'tilda-covers'

type IndexEntry = {
  file: string
  title: string
  canonical?: string
}

type Candidate = {
  filename: string             // e.g. images/tild...__1200630_eng_news.png
  isSocialShape: boolean       // matches 1200x630 / 1200630
  isLowRes: boolean            // matches __-__resize__20x__
}

const IMAGE_REF_RE = /images\/tild[a-z0-9_-]+\.(?:png|jpe?g|webp|gif)/gi
const SOCIAL_SHAPE_RE = /1200630|1200x630/i
const LOWRES_RE = /__-__resize\w*__20x__/i

function slugFromCanonical(canonical: string): string | null {
  const m = canonical.match(/\/(news_[\w-]+)\/?$/)
  return m ? m[1] : null
}

function mimeType(ext: string): string {
  switch (ext.toLowerCase()) {
    case '.png': return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.gif': return 'image/gif'
    case '.svg': return 'image/svg+xml'
    default: return 'application/octet-stream'
  }
}

/**
 * Score a candidate. Lower is better — we sort ascending and pick [0].
 *   - prefer social-shape (1200×630) over anything else
 *   - prefer full-res over Tilda's tiny placeholders
 */
function score(c: Candidate): number {
  let s = 0
  if (!c.isSocialShape) s += 100         // social shape is by far the strongest signal
  if (c.isLowRes) s += 1000              // never pick a low-res placeholder if we can avoid it
  return s
}

/**
 * Build an index of available image files keyed by the human-readable
 * suffix (everything after the `tild<hex>__` prefix). Tilda's CDN ID
 * prefix changes on every re-upload of an image, but the suffix —
 * derived from the original upload filename — stays stable.
 *
 * The export was captured at one point in time, then images were
 * re-uploaded for some pages. The export's HTML references the OLD
 * tild-prefixed filename; the file on disk has the NEW prefix. Matching
 * by suffix gets us back to the visually-equivalent file.
 */
function buildSuffixIndex(imagesDir: string): Map<string, string[]> {
  const out = new Map<string, string[]>()
  for (const f of readdirSync(imagesDir)) {
    const m = f.match(/^tild[a-z0-9-]+__(.+)$/i)
    if (!m) continue
    const suffix = m[1]
    if (!out.has(suffix)) out.set(suffix, [])
    out.get(suffix)!.push(f)
  }
  return out
}

/**
 * Resolve a Tilda image reference to a file that actually exists on
 * disk. First tries the exact filename. If that's gone (re-upload),
 * falls back to a different file with the same human-readable suffix.
 * Returns null if neither path turns up a file.
 */
function resolveImageFile(
  filename: string,                  // e.g. "images/tild3463-..._summer_time_.png"
  imagesDir: string,
  suffixIndex: Map<string, string[]>
): string | null {
  const direct = path.join(imagesDir, '..', filename)
  if (existsSync(direct)) return direct

  // Suffix fallback: pull "1200630_summer_time_.png" out of
  // "images/tild3463-..__1200630_summer_time_.png" and look it up.
  const baseName = path.basename(filename)
  const m = baseName.match(/^tild[a-z0-9-]+__(.+)$/i)
  if (!m) return null
  const candidates = suffixIndex.get(m[1])
  if (!candidates || candidates.length === 0) return null

  // Multiple matches → prefer non-low-res, otherwise first.
  const sorted = [...candidates].sort((a, b) => {
    const aLow = LOWRES_RE.test(a) ? 1 : 0
    const bLow = LOWRES_RE.test(b) ? 1 : 0
    return aLow - bLow
  })
  return path.join(imagesDir, sorted[0])
}

async function main() {
  const dryRun = process.argv.includes('--dry')
  const force = process.argv.includes('--force')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  // ── Step 1: read tilda index, build slug → file map ─────────────────────
  const indexJson = await fs.readFile(path.join(EXPORT_DIR, '_index.json'), 'utf8')
  const index = JSON.parse(indexJson) as IndexEntry[]
  const newsEntries = index.filter((e) =>
    /\/news_\d{2}_\d{2}_\d{4}/.test(e.canonical || '')
  )
  const slugToFile = new Map<string, string>()
  for (const e of newsEntries) {
    const slug = slugFromCanonical(e.canonical || '')
    if (slug) slugToFile.set(slug, e.file)
  }
  console.log(`Indexed ${slugToFile.size} news pages from Tilda export`)

  // ── Step 1b: build a suffix index over what's actually on disk ─────────
  const imagesDir = path.join(EXPORT_DIR, 'images')
  const suffixIndex = buildSuffixIndex(imagesDir)
  console.log(`Disk index: ${suffixIndex.size} distinct image suffixes`)

  // ── Step 2: build cross-reference of image usage across all news pages ──
  // Read each HTML file once; record which slugs reference each image filename.
  const usage = new Map<string, Set<string>>()
  const htmlBySlug = new Map<string, string>()
  for (const [slug, file] of slugToFile) {
    const html = await fs.readFile(path.join(EXPORT_DIR, file), 'utf8')
    htmlBySlug.set(slug, html)
    const seen = new Set<string>()
    let m: RegExpExecArray | null
    while ((m = IMAGE_REF_RE.exec(html))) {
      seen.add(m[0])
    }
    for (const img of seen) {
      if (!usage.has(img)) usage.set(img, new Set())
      usage.get(img)!.add(slug)
    }
  }
  console.log(`Built image usage map: ${usage.size} distinct images`)

  // ── Step 3: query posts ─────────────────────────────────────────────────
  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })
  const { data: postsData, error: postsErr } = await supabase
    .from('posts')
    .select('id, slug, cover_image')
    .eq('published', true)
    .order('published_at', { ascending: false })
  if (postsErr) {
    console.error('Failed to read posts:', postsErr.message)
    process.exit(1)
  }
  const posts = (postsData ?? []) as Array<{
    id: string
    slug: string
    cover_image: string | null
  }>

  // ── Step 4: per-post pick + upload ──────────────────────────────────────
  let resolved = 0
  let skippedExisting = 0
  let skippedNoCandidate = 0
  let failed = 0

  for (const post of posts) {
    if (post.cover_image && !force) {
      skippedExisting++
      continue
    }

    const file = slugToFile.get(post.slug)
    if (!file) {
      console.log(`  · ${post.slug}: no matching tilda file (skip)`)
      skippedNoCandidate++
      continue
    }
    const html = htmlBySlug.get(post.slug)!

    // Collect all image references on this page.
    const seen = new Set<string>()
    let m: RegExpExecArray | null
    const re = new RegExp(IMAGE_REF_RE.source, 'gi')
    while ((m = re.exec(html))) seen.add(m[0])

    // Filter to those uniquely used by this news page (chrome images
    // reused across many pages get dropped).
    const unique = [...seen].filter((img) => (usage.get(img)?.size ?? 0) === 1)

    if (unique.length === 0) {
      console.log(`  · ${post.slug}: no unique images (skip)`)
      skippedNoCandidate++
      continue
    }

    // Score and sort.
    const scored: Candidate[] = unique.map((filename) => ({
      filename,
      isSocialShape: SOCIAL_SHAPE_RE.test(filename),
      isLowRes: LOWRES_RE.test(filename),
    }))
    scored.sort((a, b) => score(a) - score(b))

    // Pick the best. If all candidates fail the social-shape test, we'd
    // still pick the highest-scored unique image — but it's not necessarily
    // a real cover. Better to skip those rather than upload something that
    // might be a decorative banner.
    const best = scored[0]
    if (!best.isSocialShape) {
      console.log(`  · ${post.slug}: no social-shape image found (skip — design team can fill in)`)
      skippedNoCandidate++
      continue
    }

    const localPath = resolveImageFile(best.filename, imagesDir, suffixIndex)
    if (!localPath) {
      console.log(`  ✗ ${post.slug}: candidate file not on disk: ${best.filename}`)
      failed++
      continue
    }

    const ext = path.extname(localPath)
    const storagePath = `${STORAGE_PREFIX}/${post.slug}${ext}`

    const onDiskName = path.basename(localPath)
    const fellBack = onDiskName !== path.basename(best.filename)
    const trace = fellBack
      ? `${best.filename} (fell back to ${onDiskName})`
      : best.filename

    if (dryRun) {
      console.log(`  ✓ ${post.slug} ← ${trace}  (would upload to ${storagePath})`)
      resolved++
      continue
    }

    const buffer = await fs.readFile(localPath)
    const { error: upErr } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType(ext),
        upsert: true,
        cacheControl: '31536000',
      })
    if (upErr) {
      console.log(`  ✗ ${post.slug}: upload failed: ${upErr.message}`)
      failed++
      continue
    }
    const { data: urlData } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(storagePath)
    const publicUrl = urlData.publicUrl

    const { error: updErr } = await supabase
      .from('posts')
      .update({ cover_image: publicUrl })
      .eq('id', post.id)
    if (updErr) {
      console.log(`  ✗ ${post.slug}: db update failed: ${updErr.message}`)
      failed++
      continue
    }
    console.log(`  ✓ ${post.slug} ← ${trace}`)
    resolved++
  }

  console.log()
  console.log(`Resolved: ${resolved}`)
  console.log(`Skipped (had existing cover): ${skippedExisting}`)
  console.log(`Skipped (no good candidate): ${skippedNoCandidate}`)
  console.log(`Failed: ${failed}`)
}

main().catch((err) => {
  console.error('Cover upload failed:', err)
  process.exit(1)
})
