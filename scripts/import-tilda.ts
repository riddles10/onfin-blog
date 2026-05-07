/**
 * Tilda → Supabase one-off import.
 *
 * Reads `_tilda_export/` via the shared parser in `lib/tilda-parse.ts`,
 * filters to `news_DD_MM_YYYY` slugs (skipping promo headlines), and
 * upserts each post into Supabase. Old `https://onfin.io/news_*` URLs
 * keep resolving once the parent-site Nginx redirect is in place.
 *
 * Usage:
 *   npm run import:tilda           # idempotent insert/update
 *   npm run import:tilda -- --dry  # don't write to DB, just print
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import path from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { parseAllTildaPages } from '../lib/tilda-parse'

const EXPORT_DIR = path.resolve(process.cwd(), '_tilda_export')

async function main() {
  const dryRun = process.argv.includes('--dry')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!dryRun && (!supabaseUrl || !supabaseServiceKey)) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  const stats = await parseAllTildaPages(EXPORT_DIR)
  console.log(`Found ${stats.total} news_* candidates`)
  console.log(`  · ${stats.promosSkipped} skipped as promo`)
  console.log(`  · ${stats.shortSkipped} skipped as too short`)
  console.log(`  · ${stats.parsed} parsed for import`)

  if (dryRun) {
    console.log('\n--- DRY RUN preview (first 5) ---')
    stats.posts.slice(0, 5).forEach((p) => {
      console.log(`\n[${p.publishedAt.slice(0, 10)}] ${p.title}`)
      console.log(`  slug: ${p.slug}`)
      console.log(`  category: ${p.category}`)
      console.log(`  cover: ${p.coverImage ?? '<none>'}`)
      console.log(`  body: ${p.body.length} chars`)
    })
    return
  }

  const supabase = createClient(supabaseUrl!, supabaseServiceKey!, {
    auth: { persistSession: false },
  })

  // Use the flagged default author for the byline. If none exists yet,
  // posts go in with a null byline and the article page falls back.
  const { data: defaultAuthor } = await supabase
    .from('authors')
    .select('id')
    .eq('is_default', true)
    .maybeSingle()
  const authorId = defaultAuthor?.id ?? null

  let inserted = 0
  let failed = 0
  for (const post of stats.posts) {
    // cover_image is intentionally OMITTED from the upsert payload after
    // the first import. scripts/upload-tilda-covers.ts populates this
    // field separately (Supabase Storage URL), and re-running import
    // shouldn't undo that. We still write a cover on first INSERT —
    // hence the read-then-write below.
    const { data: existing } = await supabase
      .from('posts')
      .select('cover_image')
      .eq('slug', post.slug)
      .maybeSingle()

    const payload: Record<string, unknown> = {
      slug: post.slug,
      title_en: post.title,
      body_en: post.body,
      excerpt_en: post.excerpt,
      category: post.category,
      published: true,
      published_at: post.publishedAt,
      blog_author_id: authorId,
      generation_status: null,
    }
    if (!existing) {
      payload.cover_image = post.coverImage  // first insert
    } else if (!existing.cover_image && post.coverImage) {
      payload.cover_image = post.coverImage  // post had no cover yet
    }
    // else: existing cover stays — preserved across re-imports.

    const { error } = await supabase
      .from('posts')
      .upsert(payload, { onConflict: 'slug' })
    if (error) {
      console.warn(`  ✗ ${post.slug}: ${error.message}`)
      failed++
    } else {
      inserted++
    }
  }
  console.log(`\nDone — upserted ${inserted}, failed ${failed}.`)
}

main().catch((err) => {
  console.error('Import failed:', err)
  process.exit(1)
})
