import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { scorePostHtml } from '@/lib/score-post'
import { fetchCoverImage } from '@/lib/unsplash'
import { postDraftNotification, postFailureAlert } from '@/lib/slack'
import { injectBodyImages } from '@/lib/inject-body-images'
import { SECONDARY_LANG } from '@/lib/cms-config'

// ---------------------------------------------------------------------------
// Daily-translate cron — Stage 2 of 2
// ---------------------------------------------------------------------------
//
// Runs at 01:30 UTC every day, 30 minutes after the daily-draft cron. Picks
// up the most recent post with generation_status = 'en_drafted' and finishes
// the pipeline.
//
// Behaviour depends on SECONDARY_LANG in cms-config.ts:
//
// SECONDARY_LANG === null  (English-only — current OnFin setup)
//   1. Inject inline H2 images in the English body
//   2. Score the English body
//   3. Fetch a cover image from Unsplash
//   4. Persist with generation_status = 'draft_ready'
//   5. Notify Slack with edit/preview buttons
//
// SECONDARY_LANG !== null  (bilingual — original ba-cms behaviour)
//   1. Inject inline H2 images
//   2. Translate body + title + excerpt to the secondary language
//   3. Refine the secondary body
//   4. Score both languages
//   5. Fetch cover image
//   6. Persist with translation fields populated
//   7. Notify Slack with both score lines
//
// The post is always left as `published=false`. The operator clicks the
// Edit button in Slack, reviews, then publishes manually.

export const maxDuration = 300

function getBaseUrl(request: NextRequest): string {
  // Respect NEXT_PUBLIC_BASE_URL first so the cron worker hitting the app
  // over the docker network can produce canonical public URLs in
  // notifications. Fall back to the request's host header for local dev.
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '')
  }
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

function getInternalBaseUrl(request: NextRequest): string {
  // For server-to-server sub-requests inside the cron flow we want the
  // in-network address (http://app:3000 in compose), not the public URL —
  // the public URL forces a round-trip back through the reverse proxy and
  // can hit auth/CSRF middleware.
  if (process.env.INTERNAL_BASE_URL) {
    return process.env.INTERNAL_BASE_URL.replace(/\/$/, '')
  }
  const proto = request.headers.get('x-forwarded-proto') || 'http'
  const host = request.headers.get('host') || 'localhost:3000'
  return `${proto}://${host}`
}

function authorize(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.warn('CRON_SECRET not set — refusing to run cron')
    return false
  }
  const auth = request.headers.get('authorization') || ''
  if (auth === `Bearer ${secret}`) return true
  const querySecret = request.nextUrl.searchParams.get('secret')
  if (querySecret === secret) return true
  return false
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  }

  const publicBaseUrl = getBaseUrl(request)
  const internalBaseUrl = getInternalBaseUrl(request)
  const startedAt = Date.now()
  const supabase = getServiceClient()

  let postId = '<none>'
  let postTitle = '<unknown>'

  try {
    // -- 1. Find the most recent en_drafted post --------------------------
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: post, error: findError } = await supabase
      .from('posts')
      .select('*')
      .eq('generation_status', 'en_drafted')
      .gte('created_at', yesterday)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (findError) throw new Error(`Failed to query en_drafted posts: ${findError.message}`)
    if (!post) {
      console.log('[daily-translate] No en_drafted posts in last 24h — nothing to do.')
      return NextResponse.json({ ok: true, skipped: true, reason: 'no_drafts' })
    }

    postId = post.id
    postTitle = post.title_en
    console.log(`[daily-translate] Picked up "${post.title_en}" (${post.id})`)

    await supabase
      .from('posts')
      .update({ generation_status: 'translating' })
      .eq('id', post.id)

    // -- 2. Inject inline H2 images BEFORE optional translation -----------
    const inject = await injectBodyImages(post.body_en, 3)
    let bodyEnWithImages = post.body_en
    if (inject.inserted > 0) {
      bodyEnWithImages = inject.html
      console.log(
        `[daily-translate] Injected ${inject.inserted} inline images (skipped ${inject.skippedFaq} FAQ, ${inject.skippedExisting} already-had-img)`
      )
      await supabase
        .from('posts')
        .update({ body_en: bodyEnWithImages })
        .eq('id', post.id)
    }

    // -- 3. Translate (only when a secondary language is configured) ------
    let bodyTh: string | null = null
    let titleTh: string | null = null
    let excerptTh: string | null = null

    if (SECONDARY_LANG) {
      const translateOne = (text: string, ctx: 'blog' | 'listing') =>
        fetch(`${internalBaseUrl}/api/ai/translate`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: SECONDARY_LANG, context: ctx }),
        })

      const [bodyRes, titleRes, excerptRes] = await Promise.all([
        translateOne(bodyEnWithImages, 'blog'),
        translateOne(post.title_en, 'listing'),
        post.excerpt_en ? translateOne(post.excerpt_en, 'listing') : Promise.resolve(null),
      ])

      if (!bodyRes.ok) {
        const text = await bodyRes.text()
        throw new Error(`translate (body) failed: ${bodyRes.status} — ${text.slice(0, 300)}`)
      }
      const rawBodyTh = await bodyRes.text()
      titleTh = titleRes.ok ? (await titleRes.text()).trim() : post.title_en
      excerptTh = excerptRes && excerptRes.ok ? (await excerptRes.text()).trim() : null

      // Refine the secondary body
      try {
        const refineRes = await fetch(`${internalBaseUrl}/api/ai/refine-post`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ html: rawBodyTh, lang: SECONDARY_LANG }),
        })
        if (refineRes.ok) {
          const data = (await refineRes.json()) as { html?: string }
          bodyTh = data.html || rawBodyTh
        } else {
          bodyTh = rawBodyTh
        }
      } catch {
        bodyTh = rawBodyTh
      }
    }

    // -- 4. Cover image + scoring (parallel) ------------------------------
    const [scoreEn, scoreTh, cover] = await Promise.all([
      Promise.resolve(scorePostHtml(bodyEnWithImages, 'en')),
      bodyTh
        ? Promise.resolve(scorePostHtml(bodyTh, (SECONDARY_LANG || 'en') as 'en' | 'th'))
        : Promise.resolve(null),
      fetchCoverImage(post.title_en),
    ])

    console.log(
      `[daily-translate] QA: EN ${scoreEn.score}/${scoreEn.grade}` +
        (scoreTh ? ` | secondary ${scoreTh.score}/${scoreTh.grade}` : '')
    )

    // -- 5. Persist final draft ------------------------------------------
    const updatePayload: Record<string, unknown> = {
      cover_image: cover?.url || null,
      generation_status: 'draft_ready',
      qa_score_en: scoreEn.score,
    }
    if (bodyTh && titleTh) {
      updatePayload.title_th = titleTh
      updatePayload.body_th = bodyTh
      updatePayload.excerpt_th = excerptTh
      if (scoreTh) updatePayload.qa_score_th = scoreTh.score
    }

    const { error: updateError } = await supabase
      .from('posts')
      .update(updatePayload)
      .eq('id', post.id)

    if (updateError) throw new Error(`Failed to persist final draft: ${updateError.message}`)

    // -- 6. Resolve topic source for the Slack message --------------------
    let topicSource: 'queue' | 'keyword-research' | 'rss' | 'manual' = 'manual'
    let topicLabel = post.title_en
    if (post.generation_topic_id) {
      const { data: queueRow } = await supabase
        .from('topic_queue')
        .select('topic, notes')
        .eq('id', post.generation_topic_id)
        .maybeSingle()
      if (queueRow) {
        // Notes starting with "RSS:" mark RSS-sourced topics; everything
        // else is a manual queue entry.
        topicSource = queueRow.notes?.startsWith('RSS:') ? 'rss' : 'queue'
        topicLabel = queueRow.topic
      }
    } else {
      topicSource = 'keyword-research'
    }

    // -- 7. Notify Slack -------------------------------------------------
    await postDraftNotification({
      title: post.title_en,
      titleSecondary: titleTh ?? undefined,
      slug: post.slug,
      topic: topicLabel,
      topicSource,
      category: post.category,
      wordCountEn: scoreEn.metrics.wordCount,
      wordCountSecondary: scoreTh?.metrics.wordCount,
      qaScoreEn: scoreEn.score,
      qaScoreSecondary: scoreTh?.score,
      qaGradeEn: scoreEn.grade,
      qaGradeSecondary: scoreTh?.grade,
      coverImageUrl: cover?.thumbUrl || null,
      photographerName: cover?.photographerName || null,
      baseUrl: publicBaseUrl,
      postId: post.id,
    })

    const elapsedSec = Math.round((Date.now() - startedAt) / 1000)
    console.log(`[daily-translate] Done in ${elapsedSec}s — draft ready for review`)

    return NextResponse.json({
      ok: true,
      post_id: post.id,
      slug: post.slug,
      score_en: scoreEn.score,
      score_secondary: scoreTh?.score ?? null,
      cover: cover?.url || null,
      elapsed_sec: elapsedSec,
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[daily-translate] failed:', message)

    if (postId !== '<none>') {
      await supabase
        .from('posts')
        .update({ generation_status: 'failed' })
        .eq('id', postId)
    }

    await postFailureAlert(`Daily translate (Stage 2) failed: ${message}`, {
      post_id: postId,
      title: postTitle,
      stage: 'daily-translate',
      elapsed_sec: Math.round((Date.now() - startedAt) / 1000),
    })

    return NextResponse.json({ error: message }, { status: 500 })
  }
}

// The cron worker inside docker compose POSTs to the same path. Forward
// POSTs to the same handler so both flows work without duplication.
export async function POST(request: NextRequest) {
  return GET(request)
}
