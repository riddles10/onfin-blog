/**
 * One-off + re-runnable cleanup: repair malformed anchors in already-published
 * translations (post_translations.body) across all locales.
 *
 * The AI/Google translation step sometimes left an unbalanced/over-extended
 * <a> in a translated body, so the browser rendered whole following paragraphs
 * as a link (Asana 1215116376756788). repairAnchors() caps every anchor at the
 * nearest block boundary and balances open/close tags. EN source bodies are
 * already clean, so this only touches translations that actually need it.
 *
 *   npm run repair:anchors -- --dry   # report only
 *   npm run repair:anchors            # apply
 */
import { createClient } from '@supabase/supabase-js'
import { repairAnchors } from '../lib/repair-anchors'

const PAGE = 500

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }
  const DRY = process.argv.includes('--dry') || process.argv.includes('--dry-run')
  const sb = createClient(url, key)

  let from = 0
  let scanned = 0
  let total = 0
  const perLocale: Record<string, number> = {}

  for (;;) {
    const { data, error } = await sb
      .from('post_translations')
      .select('id, locale, body')
      .range(from, from + PAGE - 1)
    if (error) {
      console.error('fetch error:', error.message)
      process.exit(1)
    }
    if (!data || data.length === 0) break
    for (const row of data) {
      scanned++
      if (!row.body) continue
      const repaired = repairAnchors(row.body)
      if (repaired !== row.body) {
        total++
        perLocale[row.locale] = (perLocale[row.locale] || 0) + 1
        if (!DRY) {
          const { error: upErr } = await sb
            .from('post_translations')
            .update({ body: repaired })
            .eq('id', row.id)
          if (upErr) console.warn(`  ✗ ${row.id} (${row.locale}): ${upErr.message}`)
        }
      }
    }
    if (data.length < PAGE) break
    from += PAGE
  }

  console.log(`${DRY ? '[DRY] ' : ''}scanned ${scanned} translation rows`)
  console.log(
    `${DRY ? 'would repair' : 'repaired'}: ${total} rows ${JSON.stringify(perLocale)}`
  )
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
