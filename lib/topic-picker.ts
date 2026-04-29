// Topic picker for the daily draft cron.
//
// Strategy: hybrid manual queue with live keyword research fallback.
//
// 1. Pull the highest-priority pending row from `topic_queue`.
//    Manual queue exists so the operator can pre-load themed series, plan
//    around launches, react to news, etc.
// 2. If the queue is empty, run a quick live keyword research pass against
//    Google autocomplete on a curated set of evergreen seeds and synthesise
//    a topic from the most promising suggestion.
//
// Either path returns a TopicPick with everything the generator needs:
// topic title, suggested keywords, category, source label, and (when
// applicable) the queue row id so the cron can mark it consumed.

import { getServiceClient } from '@/lib/supabase';
import { FALLBACK_SEEDS, PostCategory } from '@/lib/cms-config';

export type TopicSource = 'queue' | 'keyword-research' | 'manual';

export type TopicPick = {
  topic: string;
  keywords: string[];
  category: PostCategory;
  source: TopicSource;
  queueId: string | null;     // populated when source === 'queue'
  notes: string | null;
};

/**
 * Pick the next topic to draft. Tries the manual queue first, falls back to
 * live keyword research when nothing is queued.
 */
export async function pickNextTopic(): Promise<TopicPick> {
  const queued = await pickFromQueue();
  if (queued) return queued;
  return pickFromKeywordResearch();
}

/**
 * Pick a specific queue row by id. Used by the "Publish Now" admin action
 * so the operator can trigger the daily pipeline on demand for a chosen
 * topic instead of waiting for the 8 AM cron to pop the highest-priority
 * row. Throws if the row doesn't exist, isn't pending, or can't be read.
 */
export async function pickTopicById(queueId: string): Promise<TopicPick> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('topic_queue')
    .select('id, topic, keywords, category, notes, status')
    .eq('id', queueId)
    .maybeSingle();

  if (error) throw new Error(`topic_queue read failed: ${error.message}`);
  if (!data) throw new Error(`Topic ${queueId} not found`);
  if (data.status !== 'pending') {
    throw new Error(`Topic is ${data.status}, not pending — refusing to re-process`);
  }

  return {
    topic: data.topic,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    category: data.category as PostCategory,
    source: 'queue',
    queueId: data.id,
    notes: data.notes ?? null,
  };
}

async function pickFromQueue(): Promise<TopicPick | null> {
  const supabase = getServiceClient();
  const { data, error } = await supabase
    .from('topic_queue')
    .select('id, topic, keywords, category, notes')
    .eq('status', 'pending')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn('topic_queue read failed:', error.message);
    return null;
  }
  if (!data) return null;

  return {
    topic: data.topic,
    keywords: Array.isArray(data.keywords) ? data.keywords : [],
    category: data.category as PostCategory,
    source: 'queue',
    queueId: data.id,
    notes: data.notes ?? null,
  };
}

async function pickFromKeywordResearch(): Promise<TopicPick> {
  // Rotate seeds by day-of-year so we don't hit the same seed twice in a row.
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86_400_000
  );
  const seedEntry = FALLBACK_SEEDS[dayOfYear % FALLBACK_SEEDS.length];

  // Try to get suggestions from Google autocomplete. If it fails (rate limit,
  // network blip), fall back to the static templates.
  let suggestions: string[] = [];
  try {
    suggestions = await fetchGoogleSuggestions(seedEntry.seed);
  } catch (err) {
    console.warn('Keyword research fetch failed, using static templates:', err);
  }

  // Filter suggestions to ones that look like real questions / long-tail.
  const longTail = suggestions
    .filter((s) => s.length > seedEntry.seed.length + 4)
    .filter((s) => !/[?#@]/.test(s)) // strip suggestions with weird chars
    .slice(0, 8);

  let topic: string;
  let keywords: string[];

  if (longTail.length > 0) {
    // Pick the first long-tail suggestion as the topic, use the rest as
    // related keywords for the generator's keyword cluster context.
    const headline = capitalizeFirst(longTail[0]);
    topic = headline;
    keywords = [seedEntry.seed, ...longTail.slice(1, 6)];
  } else {
    // Pure fallback: rotate through the static templates so we still ship
    // an article even when Google autocomplete is unreachable.
    const template = seedEntry.templates[dayOfYear % seedEntry.templates.length];
    topic = template.replace('{seed}', seedEntry.seed);
    keywords = [seedEntry.seed];
  }

  return {
    topic,
    keywords,
    category: seedEntry.category,
    source: 'keyword-research',
    queueId: null,
    notes: `Seed: ${seedEntry.seed}`,
  };
}

/**
 * Lightweight Google autocomplete fetch. Returns suggestion strings.
 * Mirrors the helper used in /api/admin/keywords/expand but lives in lib/
 * so the cron job can call it without going through an HTTP route.
 */
async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&hl=en&gl=th`;
  const res = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    },
    cache: 'no-store',
  });
  if (!res.ok) return [];
  const data = (await res.json()) as unknown;
  if (Array.isArray(data) && Array.isArray((data as unknown[])[1])) {
    return (data as [string, string[]])[1];
  }
  return [];
}

function capitalizeFirst(s: string): string {
  if (!s) return s;
  return s[0].toUpperCase() + s.slice(1);
}

/**
 * Mark a queue row as consumed. Called by the cron after a successful draft.
 */
export async function markQueueRowUsed(queueId: string, postId: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('topic_queue')
    .update({
      status: 'used',
      used_at: new Date().toISOString(),
      used_post_id: postId,
    })
    .eq('id', queueId);

  if (error) {
    console.warn('Failed to mark topic_queue row as used:', error.message);
  }
}

/**
 * Mark a queue row as failed with a reason. Used when generation explodes
 * mid-pipeline so the operator can re-queue or fix.
 */
export async function markQueueRowFailed(queueId: string, reason: string): Promise<void> {
  const supabase = getServiceClient();
  const { error } = await supabase
    .from('topic_queue')
    .update({
      status: 'failed',
      failure_reason: reason.slice(0, 500),
    })
    .eq('id', queueId);

  if (error) {
    console.warn('Failed to mark topic_queue row as failed:', error.message);
  }
}
