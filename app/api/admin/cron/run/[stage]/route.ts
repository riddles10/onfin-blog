import { NextRequest, NextResponse } from 'next/server';

// Admin-facing proxy that lets the /admin/topics UI kick off a daily-draft
// or daily-translate run on demand without ever seeing the CRON_SECRET
// client-side. The secret stays purely server-side; the admin UI is already
// gated by the password prompt in /app/admin/layout.tsx.
//
// Usage from the client:
//   POST /api/admin/cron/run/draft?topic_id=<uuid>   -> triggers Stage 1
//   POST /api/admin/cron/run/translate               -> triggers Stage 2
//
// The proxy streams back the JSON response from the underlying cron so the
// UI can surface the post id, elapsed time, etc.

// Vercel Pro plan: up to 300s. This proxy just forwards to the underlying
// cron route -- its timeout must be >= the cron's own maxDuration or we'll
// kill the downstream function mid-run.
export const maxDuration = 300;

function getBaseUrl(request: NextRequest): string {
  if (process.env.NEXT_PUBLIC_BASE_URL) return process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, '');
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '');
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  const proto = request.headers.get('x-forwarded-proto') || 'http';
  const host = request.headers.get('host') || 'localhost:3000';
  return `${proto}://${host}`;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { stage: string } }
) {
  const stage = params.stage;
  if (stage !== 'draft' && stage !== 'translate') {
    return NextResponse.json({ error: 'stage must be "draft" or "translate"' }, { status: 400 });
  }

  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: 'CRON_SECRET is not configured on the server' },
      { status: 500 }
    );
  }

  const baseUrl = getBaseUrl(request);
  const topicId = request.nextUrl.searchParams.get('topic_id');
  const cronPath = stage === 'draft' ? '/api/cron/daily-draft' : '/api/cron/daily-translate';
  const query = stage === 'draft' && topicId ? `?topic_id=${encodeURIComponent(topicId)}` : '';
  const url = `${baseUrl}${cronPath}${query}`;

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${secret}`,
      },
    });

    const text = await res.text();
    // Pass-through: if it's JSON we re-wrap, otherwise return as error body
    let payload: unknown;
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { raw: text.slice(0, 500) };
    }

    return NextResponse.json(payload, { status: res.status });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json(
      { error: `Admin cron proxy failed: ${message}` },
      { status: 500 }
    );
  }
}
