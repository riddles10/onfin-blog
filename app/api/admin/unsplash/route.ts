import { NextRequest, NextResponse } from 'next/server';
import { searchImages } from '@/lib/unsplash';

// Admin-facing Unsplash search proxy. Used by the BlogEditor "Add Images"
// button to fetch a cover image based on the article title and (optionally)
// inline images for the first few H2 sections.
//
// Body: { query: string, count?: number }
//   - query: free-text search term (article title, H2 heading, etc.)
//   - count: how many images to return (1-10, defaults to 1)
//
// Returns: { images: UnsplashImage[] }
//
// The route is gated by the admin layout's password prompt -- there's no
// secret to leak here, just a friendlier wrapper around the Unsplash API
// so the client doesn't need an access key.

export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { query?: string; count?: number };
    const query = (body.query || '').trim();
    if (!query) {
      return NextResponse.json({ error: 'query is required' }, { status: 400 });
    }
    const count = Math.min(Math.max(body.count || 1, 1), 10);

    const images = await searchImages(query, count);
    return NextResponse.json({ images });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
