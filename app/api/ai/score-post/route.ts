import { NextRequest, NextResponse } from 'next/server';
import { scorePostHtml, type Lang } from '@/lib/score-post';
import { isLocale } from '@/lib/locales';

// Thin HTTP wrapper around the deterministic QA scorer in /lib/score-post.ts.
// All scoring logic lives in lib/ so the daily cron pipeline can call it
// without an HTTP roundtrip (Next.js doesn't allow non-handler exports from
// route files).

export const maxDuration = 10;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, lang } = body as { html?: string; lang?: Lang };
    if (typeof html !== 'string') {
      return NextResponse.json({ error: 'html is required' }, { status: 400 });
    }
    const targetLang: Lang = typeof lang === 'string' && isLocale(lang) ? lang : 'en';
    const result = scorePostHtml(html, targetLang);
    return NextResponse.json(result);
  } catch (error) {
    console.error('score-post error:', error);
    const message = error instanceof Error ? error.message : 'Failed to score post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
