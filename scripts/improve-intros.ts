/**
 * Rewrite the intro of every published English post using the improved
 * APP + TL;DR formula in lib/cms-config.ts.
 *
 * What it does, per post:
 *   1. Splits body_en at the first <h2>; everything before that is the
 *      "intro region" (the old APP intro + any bold-prefixed TL;DR).
 *   2. Builds a compact context for the LLM: title, excerpt, category,
 *      and the article's H2 outline with a 200-char preview per
 *      section.
 *   3. Asks the LLM for a replacement intro_html (one APP <p> + one
 *      TL;DR <p>) that follows the new SEO_GUIDELINES.
 *   4. Replaces the intro region in body_en and writes back to Supabase.
 *
 * Translations are intentionally NOT updated. The translate-archive
 * pipeline re-runs against any post whose body_en hash changes, so the
 * non-English locales will refresh on the next translation pass.
 *
 * Usage:
 *   npm run improve:intros -- --dry          # plan, write nothing
 *   npm run improve:intros -- --slug=foo     # one post only
 *   npm run improve:intros -- --limit=5      # first N posts
 *   npm run improve:intros -- --apply        # required to actually write
 *
 * Required env: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *               DEEPSEEK_API_KEY (used by lib/anthropic shim).
 */
import { createClient } from '@supabase/supabase-js'
import anthropic, { MODEL } from '../lib/anthropic'
import { BRAND_VOICE, SEO_GUIDELINES, SITE_NAME } from '../lib/cms-config'
import { stripEmDashes } from '../lib/strip-emdash'

type PostRow = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  category: string
}

type Args = {
  dryRun: boolean
  apply: boolean
  slug: string | null
  limit: number | null
}

function parseArgs(): Args {
  const args: Args = { dryRun: false, apply: false, slug: null, limit: null }
  for (const a of process.argv.slice(2)) {
    if (a === '--dry' || a === '--dry-run') args.dryRun = true
    else if (a === '--apply') args.apply = true
    else if (a.startsWith('--slug=')) args.slug = a.slice('--slug='.length)
    else if (a.startsWith('--limit=')) {
      const n = Number(a.slice('--limit='.length))
      if (Number.isFinite(n) && n > 0) args.limit = n
    }
  }
  if (!args.apply) args.dryRun = true
  return args
}

function splitIntroRegion(html: string): { intro: string; rest: string } {
  const idx = html.search(/<h2\b/i)
  if (idx < 0) return { intro: html, rest: '' }
  return { intro: html.slice(0, idx), rest: html.slice(idx) }
}

function summarizeBody(rest: string): string {
  // Extract H2 headings and first ~200 chars of body after each so the
  // LLM has enough context to write a hook without us shipping the full
  // 2500-word body on every call.
  const out: string[] = []
  const sectionRe = /<h2\b[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2\b|$)/gi
  let m: RegExpExecArray | null
  while ((m = sectionRe.exec(rest)) !== null) {
    const heading = m[1].replace(/<[^>]+>/g, '').trim()
    const preview = m[2]
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .slice(0, 220)
    out.push(`H2: ${heading}\n   ${preview}`)
  }
  return out.join('\n\n')
}

const INTRO_TOOL = {
  name: 'submit_intro' as const,
  description:
    'Submit the rewritten intro for the article. Output two <p> blocks: an APP intro paragraph followed by a TL;DR paragraph that begins with <strong>TL;DR.</strong>.',
  input_schema: {
    type: 'object' as const,
    properties: {
      intro_html: {
        type: 'string',
        description:
          'Exactly two <p> tags concatenated with a single newline. First <p>: APP intro, 3 sentences, 50-80 words, opens with a concrete hook (no questions, no definitions, no soft preambles). Second <p>: TL;DR paragraph starting with "<strong>TL;DR.</strong> " then 2-4 sentences (40-80 words) front-loading the single most actionable takeaway with specific numbers, the one tradeoff, and the safe default. NO em-dashes anywhere. NO other tags.',
      },
    },
    required: ['intro_html'],
    additionalProperties: false,
  },
} as const

async function rewriteIntro(post: PostRow): Promise<string | null> {
  const summary = summarizeBody(splitIntroRegion(post.body_en).rest)
  const system = `${BRAND_VOICE}\n\n${SEO_GUIDELINES}\n\nYou are an editor for ${SITE_NAME}. Your job is to rewrite the intro of an existing article so it follows the APP + TL;DR formula above. The rest of the article body is fixed; do not contradict it. Output exactly two <p> blocks via the submit_intro tool. NEVER use em-dashes.`

  const user = [
    `Title: ${post.title_en}`,
    `Category: ${post.category}`,
    post.excerpt_en ? `Excerpt: ${post.excerpt_en}` : '',
    '',
    'Existing article outline (do not contradict):',
    summary || '(no H2 sections found)',
  ]
    .filter(Boolean)
    .join('\n')

  const res = await anthropic.messages.create({
    model: MODEL,
    max_tokens: 800,
    temperature: 0.6,
    system,
    tools: [INTRO_TOOL as unknown as never],
    tool_choice: { type: 'tool', name: 'submit_intro' },
    messages: [{ role: 'user', content: user }],
  })

  const tool = (res.content as Array<{ type: string; name?: string; input?: unknown }>).find(
    (b) => b.type === 'tool_use' && b.name === 'submit_intro'
  )
  if (!tool) {
    console.warn(`  ! ${post.slug}: no tool_use in response`)
    return null
  }
  const input = tool.input as { intro_html?: string }
  if (!input?.intro_html) {
    console.warn(`  ! ${post.slug}: tool response missing intro_html`)
    return null
  }
  return stripEmDashes(input.intro_html)
}

async function main() {
  const args = parseArgs()
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    console.error('NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set')
    process.exit(1)
  }
  if (!process.env.DEEPSEEK_API_KEY) {
    console.error('DEEPSEEK_API_KEY must be set (used by lib/anthropic shim)')
    process.exit(1)
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false },
  })

  let query = supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, body_en, category')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (args.slug) query = query.eq('slug', args.slug)
  if (args.limit) query = query.limit(args.limit)

  const { data, error } = await query
  if (error) {
    console.error('Failed to read posts:', error.message)
    process.exit(1)
  }
  const posts = (data ?? []) as PostRow[]
  console.log(
    `Read ${posts.length} posts${args.slug ? ` matching slug=${args.slug}` : ''}` +
      `${args.limit ? ` (limit ${args.limit})` : ''}`
  )
  if (posts.length === 0) return

  let ok = 0
  let skipped = 0
  let failed = 0
  for (const post of posts) {
    process.stdout.write(`  ${post.slug.padEnd(60)} `)
    try {
      const { intro, rest } = splitIntroRegion(post.body_en)
      if (!rest) {
        console.log('skip (no H2 sections)')
        skipped++
        continue
      }
      const newIntro = await rewriteIntro(post)
      if (!newIntro) {
        failed++
        continue
      }
      const newBody = `${newIntro}\n\n${rest}`
      if (newBody === post.body_en) {
        console.log('no-op')
        skipped++
        continue
      }

      if (args.dryRun) {
        console.log('DRY')
        console.log(
          `\n    OLD INTRO (${intro.length} chars):\n${indent(intro.slice(0, 600))}\n`
        )
        console.log(
          `    NEW INTRO (${newIntro.length} chars):\n${indent(newIntro.slice(0, 600))}\n`
        )
        ok++
        continue
      }

      const { error: upErr } = await supabase
        .from('posts')
        .update({ body_en: newBody })
        .eq('id', post.id)
      if (upErr) {
        console.log(`FAIL ${upErr.message}`)
        failed++
      } else {
        console.log('ok')
        ok++
      }
    } catch (err) {
      console.log(`ERR ${(err as Error).message}`)
      failed++
    }
  }

  console.log(
    `\n${args.dryRun ? 'Dry-run complete' : 'Done'}.` +
      ` ${ok} rewritten, ${skipped} skipped, ${failed} failed.`
  )
  if (args.dryRun) {
    console.log('Re-run with --apply to write the changes.')
  }
}

function indent(s: string, prefix = '      '): string {
  return s
    .split('\n')
    .map((l) => prefix + l)
    .join('\n')
}

main().catch((err) => {
  console.error('improve-intros failed:', err)
  process.exit(1)
})
