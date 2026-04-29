import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase';
import { pickNextTopic, pickTopicById, markQueueRowUsed, markQueueRowFailed } from '@/lib/topic-picker';
import { postFailureAlert } from '@/lib/slack';
import { seedTopicQueueFromRss } from '@/lib/rss-topics';

// ---------------------------------------------------------------------------
// Daily-draft cron -- Stage 1 of 2
// ---------------------------------------------------------------------------
//
// Runs at 01:00 UTC (08:00 Bangkok time) every day.
//
// Pipeline:
//   1. Pick the next topic (manual queue -> fallback to live keyword research)
//   2. Generate the English draft via /api/ai/generate-post (~35s)
//   3. Refine the English draft via /api/ai/refine-post (~6s)
//   4. Persist as a draft post with generation_status='en_drafted'
//   5. Mark the topic-queue row as used (if applicable)
//
// Stage 2 (`/api/cron/daily-translate`) runs 30 minutes later, picks up the
// en_drafted row, translates to Thai, scores both languages, fetches a cover
// image, and notifies Slack. We chain via DB rows instead of fire-and-forget
// fetches because DB chaining means no work is ever lost if a Stage 2 retry
// is needed.

// Vercel Pro plan: functions can run up to 300s (5 min). We budget ~120s
// realistic wall time for Stage 1 (outline + 8 parallel sections + refine +
// DB write) and leave the rest as headroom for retries.
export const maxDuration = 300;

function getBaseUrl(request: NextRequest): string {
  // Prefer the public site URL so internal sub-requests bypass Vercel
  // deployment protection (which guards the *.vercel.app preview URLs).
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  // Local dev fallback -- derive from the inbound request
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

function authorize(request: NextRequest): boolean {
  // Vercel cron triggers send Authorization: Bearer <CRON_SECRET>.
  // For local manual testing we also accept ?secret= query param.
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    console.warn('CRON_SECRET not set -- refusing to run cron (set it in env)');
    return false;
  }
  const auth = request.headers.get('authorization') || '';
  if (auth === `Bearer ${secret}`) return true;
  const querySecret = request.nextUrl.searchParams.get('secret');
  if (querySecret === secret) return true;
  return false;
}

export async function GET(request: NextRequest) {
  if (!authorize(request)) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  const baseUrl = getBaseUrl(request);
  const startedAt = Date.now();
  let topicQueueId: string | null = null;
  let topicLabel = '<unknown>';

  // Optional explicit topic id for "Publish Now" admin flow. When present,
  // skip the picker and use this specific queue row. Must still be pending.
  const explicitTopicId = request.nextUrl.searchParams.get('topic_id');

  try {
    // -- 0. Refresh the topic queue from RSS -----------------------------------
    // Skip when an explicit topic_id is supplied (Publish Now flow) — the
    // operator already chose; no need to widen the queue first.
    if (!explicitTopicId) {
      try {
        const seed = await seedTopicQueueFromRss();
        console.log(
          `[daily-draft] RSS seed: queued ${seed.inserted} new topics from ${seed.fetched} feeds (${seed.candidates} candidates considered)`
        );
      } catch (err) {
        // Never fail the cron just because RSS feeds are flaky.
        console.warn('[daily-draft] RSS seed step threw, continuing:', err);
      }
    }

    // -- 1. Pick a topic -------------------------------------------------------
    const pick = explicitTopicId
      ? await pickTopicById(explicitTopicId)
      : await pickNextTopic();
    topicQueueId = pick.queueId;
    topicLabel = pick.topic;
    console.log(`[daily-draft] Picked topic: "${pick.topic}" (source=${pick.source}, category=${pick.category})`);

    // -- 2. Generate English draft ---------------------------------------------
    const genRes = await fetch(`${baseUrl}/api/ai/generate-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        topic: pick.topic,
        category: pick.category,
        keywords: pick.keywords,
      }),
    });

    if (!genRes.ok) {
      const text = await genRes.text();
      throw new Error(`generate-post failed: ${genRes.status} -- ${text.slice(0, 300)}`);
    }

    const generated = (await genRes.json()) as {
      title_en?: string;
      slug?: string;
      excerpt_en?: string;
      body_en?: string;
      _meta?: { wordCount?: number; sectionCount?: number; residualThai?: number };
    };

    if (!generated.title_en || !generated.slug || !generated.body_en) {
      throw new Error('generate-post returned incomplete payload');
    }

    console.log(
      `[daily-draft] Generated draft "${generated.title_en}" -- ${generated._meta?.wordCount} words in ${(Date.now() - startedAt) / 1000}s`
    );

    // -- 3. Refine English draft -----------------------------------------------
    const refineRes = await fetch(`${baseUrl}/api/ai/refine-post`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        html: generated.body_en,
        lang: 'en',
      }),
    });

    let refinedHtml = generated.body_en;
    let refineSummary = 'skipped (refine failed)';
    if (refineRes.ok) {
      const refineData = (await refineRes.json()) as { html?: string; changes_summary?: string };
      if (refineData.html) {
        refinedHtml = refineData.html;
        refineSummary = refineData.changes_summary || 'refined';
      }
    } else {
      console.warn(`[daily-draft] refine-post failed (${refineRes.status}) -- using unrefined draft`);
    }
    console.log(`[daily-draft] Refine result: ${refineSummary}`);

    // -- 4. Persist as draft ---------------------------------------------------
    const supabase = getServiceClient();

    // Make sure slug is unique (collision-safe)
    const slug = await ensureUniqueSlug(supabase, generated.slug);

    // Pick the flagged default author for the byline. If none exists, we
    // leave it null and the article page falls back to a blank byline -- no
    // reason to hard-fail the cron just because no author is set up yet.
    const { data: defaultAuthor } = await supabase
      .from('authors')
      .select('id')
      .eq('is_default', true)
      .maybeSingle();
    const defaultAuthorId = defaultAuthor?.id || null;

    const { data: post, error: insertError } = await supabase
      .from('posts')
      .insert({
        slug,
        title_en: generated.title_en,
        title_th: null,
        body_en: refinedHtml,
        body_th: null,
        excerpt_en: generated.excerpt_en || null,
        excerpt_th: null,
        category: pick.category,
        cover_image: null,
        published: false,
        published_at: null,
        generation_status: 'en_drafted',
        generation_topic_id: pick.queueId,
        blog_author_id: defaultAuthorId,
      })
      .select()
      .single();

    if (insertError || !post) {
      throw new Error(`Supabase insert failed: ${insertError?.message || 'unknown'}`);
    }

    // -- 5. Mark queue row consumed --------------------------------------------
    if (pick.queueId) {
      await markQueueRowUsed(pick.queueId, post.id);
    }

    const elapsedSec = Math.round((Date.now() - startedAt) / 1000);
    console.log(`[daily-draft] Draft created (${post.id}) in ${elapsedSec}s -- handing off to daily-translate`);

    return NextResponse.json({
      ok: true,
      post_id: post.id,
      slug,
      title: generated.title_en,
      word_count: generated._meta?.wordCount || 0,
      elapsed_sec: elapsedSec,
      next_stage: 'daily-translate (runs at 01:30 UTC)',
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[daily-draft] failed:', message);

    if (topicQueueId) {
      await markQueueRowFailed(topicQueueId, message);
    }
    await postFailureAlert(`Daily draft (Stage 1) failed: ${message}`, {
      topic: topicLabel,
      stage: 'daily-draft',
      elapsed_sec: Math.round((Date.now() - startedAt) / 1000),
    });

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * Ensure the slug doesn't collide with an existing post. Appends -2, -3, etc.
 * up to 50 attempts before giving up.
 */
async function ensureUniqueSlug(
  supabase: ReturnType<typeof getServiceClient>,
  baseSlug: string
): Promise<string> {
  const sanitized = baseSlug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80) || `post-${Date.now()}`;

  let candidate = sanitized;
  for (let i = 2; i < 50; i++) {
    const { data, error } = await supabase
      .from('posts')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle();
    if (error) throw new Error(`slug check failed: ${error.message}`);
    if (!data) return candidate;
    candidate = `${sanitized}-${i}`;
  }
  // Last-ditch fallback
  return `${sanitized}-${Date.now()}`;
}

// The self-hosted cron worker POSTs to the same path. Forward POST to GET
// so both invocation modes work without duplicating logic.
export async function POST(request: NextRequest) {
  return GET(request);
}
