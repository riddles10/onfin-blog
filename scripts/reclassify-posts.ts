/**
 * Re-run `classifyCategory()` against every post in Supabase and
 * UPDATE rows whose categorisation would now change.
 *
 * Use after tightening classifyCategory in lib/tilda-parse.ts so the
 * archive lines up with the new heuristics without needing a full
 * re-import of the Tilda HTML files.
 *
 * Usage:
 *   npm run reclassify              # apply changes
 *   npm run reclassify -- --dry     # show diff, don't write
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 */
import { createClient } from '@supabase/supabase-js'
import { classifyCategory } from '../lib/tilda-parse'

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

  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title_en, category')
    .order('published_at', { ascending: false })

  if (error) {
    console.error('Failed to read posts:', error.message)
    process.exit(1)
  }

  type Row = { id: string; slug: string; title_en: string; category: string }
  const posts = (data ?? []) as Row[]
  console.log(`Read ${posts.length} posts`)

  type Change = { id: string; slug: string; title: string; from: string; to: string }
  const changes: Change[] = []
  for (const p of posts) {
    const next = classifyCategory(p.title_en)
    if (next !== p.category) {
      changes.push({
        id: p.id,
        slug: p.slug,
        title: p.title_en,
        from: p.category,
        to: next,
      })
    }
  }

  if (changes.length === 0) {
    console.log('No category changes — DB already matches the classifier.')
    return
  }

  console.log(`\n${changes.length} posts will move:`)
  for (const c of changes) {
    console.log(`  ${c.from.padEnd(18)} → ${c.to.padEnd(18)}  ${c.slug.padEnd(22)}  ${c.title}`)
  }

  // Distribution preview
  const beforeCounts: Record<string, number> = {}
  const afterCounts: Record<string, number> = {}
  for (const p of posts) {
    beforeCounts[p.category] = (beforeCounts[p.category] || 0) + 1
    const next = changes.find((c) => c.id === p.id)?.to ?? p.category
    afterCounts[next] = (afterCounts[next] || 0) + 1
  }
  console.log('\nDistribution before:', beforeCounts)
  console.log('Distribution after: ', afterCounts)

  if (dryRun) {
    console.log('\nDry run — no writes.')
    return
  }

  // Apply: one UPDATE per row. Could be batched by category but the
  // archive is small enough that the loop is fine.
  let ok = 0
  let fail = 0
  for (const c of changes) {
    const { error: upErr } = await supabase
      .from('posts')
      .update({ category: c.to })
      .eq('id', c.id)
    if (upErr) {
      console.warn(`  ✗ ${c.slug}: ${upErr.message}`)
      fail++
    } else {
      ok++
    }
  }
  console.log(`\nWrote ${ok} updates, ${fail} failed.`)
}

main().catch((err) => {
  console.error('Reclassify failed:', err)
  process.exit(1)
})
