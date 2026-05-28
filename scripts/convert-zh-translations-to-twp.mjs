#!/usr/bin/env node
/**
 * One-off: clone every `zh` row in `public.post_translations` into a
 * matching `zh-tw` row, converting title/body/excerpt from Simplified
 * to Traditional Chinese with Taiwan vocabulary via opencc-js (s2twp).
 *
 * Idempotent: upserts on (post_id, locale) so re-runs replace existing
 * zh-tw rows rather than duplicating them. `source` is preserved from
 * the zh row (manual/ai/imported stays — converting AI Simplified to
 * Traditional doesn't make it manual).
 *
 * Env required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY
 * (loaded from .env.local automatically).
 *
 * Run: `node scripts/convert-zh-translations-to-twp.mjs`
 *      `node scripts/convert-zh-translations-to-twp.mjs --dry` for a preview.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as OpenCC from 'opencc-js'
import { createClient } from '@supabase/supabase-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

// Minimal .env.local loader so we don't drag in dotenv.
function loadEnvLocal() {
  try {
    const text = readFileSync(join(ROOT, '.env.local'), 'utf8')
    for (const line of text.split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (!m) continue
      const [, k, raw] = m
      if (process.env[k]) continue
      // Strip optional surrounding quotes.
      const v = raw.replace(/^['"]|['"]$/g, '')
      process.env[k] = v
    }
  } catch {
    // No .env.local — caller must have set the vars another way.
  }
}
loadEnvLocal()

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!url || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const dryRun = process.argv.includes('--dry')
const convert = OpenCC.Converter({ from: 'cn', to: 'twp' })

const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const PAGE_SIZE = 200

async function fetchAllZhRows() {
  const rows = []
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from('post_translations')
      .select('post_id, title, body, excerpt, source')
      .eq('locale', 'zh')
      .range(from, from + PAGE_SIZE - 1)
    if (error) throw new Error(error.message)
    if (!data || data.length === 0) break
    rows.push(...data)
    if (data.length < PAGE_SIZE) break
  }
  return rows
}

async function main() {
  const zhRows = await fetchAllZhRows()
  console.log(`fetched ${zhRows.length} zh rows`)

  const twRows = zhRows.map((r) => ({
    post_id: r.post_id,
    locale: 'zh-tw',
    title: convert(r.title ?? ''),
    body: convert(r.body ?? ''),
    excerpt: r.excerpt == null ? null : convert(r.excerpt),
    source: r.source,
  }))

  if (dryRun) {
    console.log('--dry; first row preview:')
    console.log(JSON.stringify(twRows[0], null, 2))
    return
  }

  // Upsert in chunks to stay well under PostgREST payload limits.
  for (let i = 0; i < twRows.length; i += 50) {
    const chunk = twRows.slice(i, i + 50)
    const { error } = await supabase
      .from('post_translations')
      .upsert(chunk, { onConflict: 'post_id,locale' })
    if (error) throw new Error(`upsert ${i}-${i + chunk.length}: ${error.message}`)
    console.log(`upserted ${i + chunk.length} / ${twRows.length}`)
  }
  console.log(`done — ${twRows.length} zh-tw rows written`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
