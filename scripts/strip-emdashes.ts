/**
 * Strip em-dashes (U+2014) from all post bodies and excerpts, including
 * their translations. Replaces " — " with ", " (the dominant clause-
 * separator usage) and rewrites the row only when the content actually
 * changes.
 *
 * Em-dashes are the strongest LLM-tell in retail-facing copy and the
 * editorial decision is to ban them site-wide. The article renderer
 * already strips em-dashes on the fly via lib/strip-emdash.ts so the
 * live blog is clean today; this script makes the storage layer match
 * so future tools that read the body directly (RSS, sitemaps,
 * translations) don't see them either.
 *
 * En-dashes (U+2013) are preserved because they carry semantic value in
 * numeric ranges like "1500–2200 words".
 *
 * Usage:
 *   npm run strip:emdashes -- --dry   # report what would change
 *   npm run strip:emdashes            # apply
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from '@supabase/supabase-js'
import { stripEmDashes } from '../lib/strip-emdash'

type PostRow = {
  id: string
  slug: string
  body_en: string
  excerpt_en: string | null
}

type TranslationRow = {
  post_id: string
  locale: string
  body: string
  excerpt: string | null
}

function countEmDashes(s: string | null | undefined): number {
  if (!s) return 0
  return (s.match(/—/g) || []).length
}

async function main() {
  const dryRun = process.argv.includes('--dry')

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  // ── posts.body_en / excerpt_en ─────────────────────────────────────────
  const { data: postsData, error: postsErr } = await supabase
    .from('posts')
    .select('id, slug, body_en, excerpt_en')

  if (postsErr) {
    console.error('Failed to read posts:', postsErr.message)
    process.exit(1)
  }
  const posts = (postsData ?? []) as PostRow[]
  console.log(`Read ${posts.length} posts`)

  type PostChange = {
    id: string
    slug: string
    bodyDashes: number
    excerptDashes: number
    body_en: string
    excerpt_en: string | null
  }
  const postChanges: PostChange[] = []
  for (const p of posts) {
    const bodyDashes = countEmDashes(p.body_en)
    const excerptDashes = countEmDashes(p.excerpt_en)
    if (bodyDashes === 0 && excerptDashes === 0) continue
    postChanges.push({
      id: p.id,
      slug: p.slug,
      bodyDashes,
      excerptDashes,
      body_en: stripEmDashes(p.body_en),
      excerpt_en: p.excerpt_en ? stripEmDashes(p.excerpt_en) : p.excerpt_en,
    })
  }

  // ── post_translations.body / excerpt ──────────────────────────────────
  const { data: trData, error: trErr } = await supabase
    .from('post_translations')
    .select('post_id, locale, body, excerpt')

  if (trErr) {
    console.error('Failed to read post_translations:', trErr.message)
    process.exit(1)
  }
  const translations = (trData ?? []) as TranslationRow[]
  console.log(`Read ${translations.length} translations`)

  type TrChange = {
    post_id: string
    locale: string
    bodyDashes: number
    excerptDashes: number
    body: string
    excerpt: string | null
  }
  const trChanges: TrChange[] = []
  for (const t of translations) {
    const bodyDashes = countEmDashes(t.body)
    const excerptDashes = countEmDashes(t.excerpt)
    if (bodyDashes === 0 && excerptDashes === 0) continue
    trChanges.push({
      post_id: t.post_id,
      locale: t.locale,
      bodyDashes,
      excerptDashes,
      body: stripEmDashes(t.body),
      excerpt: t.excerpt ? stripEmDashes(t.excerpt) : t.excerpt,
    })
  }

  // ── Report ────────────────────────────────────────────────────────────
  const totalPostDashes = postChanges.reduce(
    (n, c) => n + c.bodyDashes + c.excerptDashes,
    0
  )
  const totalTrDashes = trChanges.reduce(
    (n, c) => n + c.bodyDashes + c.excerptDashes,
    0
  )
  console.log(
    `\nPosts to update:        ${postChanges.length.toString().padStart(4)}` +
      `   (${totalPostDashes} em-dashes)`
  )
  console.log(
    `Translations to update: ${trChanges.length.toString().padStart(4)}` +
      `   (${totalTrDashes} em-dashes)`
  )

  if (postChanges.length === 0 && trChanges.length === 0) {
    console.log('\nNothing to do, archive is already em-dash free.')
    return
  }

  // Show the top-10 worst offenders so the operator can spot anomalies
  // before running for real.
  const topPosts = [...postChanges]
    .sort((a, b) => b.bodyDashes + b.excerptDashes - (a.bodyDashes + a.excerptDashes))
    .slice(0, 10)
  if (topPosts.length > 0) {
    console.log('\nTop posts by em-dash count:')
    for (const c of topPosts) {
      console.log(
        `  ${(c.bodyDashes + c.excerptDashes).toString().padStart(4)}` +
          `   ${c.slug}`
      )
    }
  }

  if (dryRun) {
    console.log('\nDry run, no writes.')
    return
  }

  // ── Apply ─────────────────────────────────────────────────────────────
  let postsOk = 0
  let postsFail = 0
  for (const c of postChanges) {
    const { error } = await supabase
      .from('posts')
      .update({ body_en: c.body_en, excerpt_en: c.excerpt_en })
      .eq('id', c.id)
    if (error) {
      console.warn(`  posts ${c.slug}: ${error.message}`)
      postsFail++
    } else {
      postsOk++
    }
  }
  console.log(`\nposts:               ${postsOk} updated, ${postsFail} failed`)

  let trOk = 0
  let trFail = 0
  for (const c of trChanges) {
    const { error } = await supabase
      .from('post_translations')
      .update({ body: c.body, excerpt: c.excerpt })
      .eq('post_id', c.post_id)
      .eq('locale', c.locale)
    if (error) {
      console.warn(`  ${c.locale} ${c.post_id}: ${error.message}`)
      trFail++
    } else {
      trOk++
    }
  }
  console.log(`post_translations:   ${trOk} updated, ${trFail} failed`)
}

main().catch((err) => {
  console.error('strip-emdashes failed:', err)
  process.exit(1)
})
