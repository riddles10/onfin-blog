#!/usr/bin/env node
/**
 * One-off: produce the zh-tw counterpart of i18n/zh.json via opencc-js
 * (Simplified -> Traditional with Taiwan vocabulary, s2twp profile).
 *
 * Run once: `node scripts/convert-zh-to-twp.mjs`. Idempotent — re-runs
 * overwrite the output file. Use convert-zh-translations-to-twp.ts for
 * the post_translations rows in Supabase.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import * as OpenCC from 'opencc-js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

const convert = OpenCC.Converter({ from: 'cn', to: 'twp' })

function walk(value) {
  if (typeof value === 'string') return convert(value)
  if (Array.isArray(value)) return value.map(walk)
  if (value && typeof value === 'object') {
    const out = {}
    for (const [k, v] of Object.entries(value)) out[k] = walk(v)
    return out
  }
  return value
}

const input = JSON.parse(readFileSync(join(ROOT, 'i18n/zh.json'), 'utf8'))
const output = walk(input)
writeFileSync(join(ROOT, 'i18n/zh-tw.json'), JSON.stringify(output, null, 2) + '\n', 'utf8')
console.log('wrote i18n/zh-tw.json')
