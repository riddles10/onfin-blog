// Unsplash API helper for fetching cover images.
//
// Requires UNSPLASH_ACCESS_KEY in env. Free tier: 50 requests/hour, plenty
// for daily cron use. Returns null on any error so the cron can continue
// without an image rather than failing the whole pipeline.
//
// All returned images are royalty-free under the Unsplash License, which
// allows commercial use without attribution (though attribution is encouraged
// and we surface photographer name + profile link in the post metadata).

import {
  UNSPLASH_KNOWN_TERMS,
  UNSPLASH_FALLBACK_TERM,
  UNSPLASH_FALLBACK_QUERY,
} from '@/lib/cms-config';

const UNSPLASH_API = 'https://api.unsplash.com';

export type UnsplashImage = {
  url: string;              // raw image URL (full size)
  thumbUrl: string;         // smaller thumbnail for previews
  altText: string;          // Unsplash's alt_description, used for image alt
  photographerName: string;
  photographerUrl: string;
  unsplashUrl: string;      // link back to the photo page (per UL guidelines)
  width: number;
  height: number;
};

/**
 * Search Unsplash for a cover image matching the article topic.
 * Returns the first relevant landscape result, or null if not found / API
 * error / no key configured.
 */
export async function fetchCoverImage(query: string): Promise<UnsplashImage | null> {
  const results = await searchImages(query, 1);
  return results[0] || null;
}

/**
 * Search Unsplash for up to `count` relevant landscape images matching the
 * given query. Used by both the daily-translate cron (count=1 cover) and the
 * admin "Add Images" button (count=N inline images).
 *
 * Returns an empty array on any failure so callers can degrade gracefully
 * instead of crashing the page / pipeline.
 */
export async function searchImages(query: string, count = 1): Promise<UnsplashImage[]> {
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) {
    console.warn('UNSPLASH_ACCESS_KEY not set — skipping image fetch');
    return [];
  }

  // Refine the query for better results. If the config defines known terms
  // and a fallback term, append the fallback when none of the known terms
  // appear in the query.
  const refinedQuery = refineQuery(query);
  const perPage = Math.min(Math.max(count, 1), 30);
  const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(refinedQuery)}&orientation=landscape&per_page=${perPage}&content_filter=high`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: `Client-ID ${accessKey}`,
        'Accept-Version': 'v1',
      },
    });

    if (!res.ok) {
      console.warn(`Unsplash search failed: ${res.status} ${res.statusText}`);
      return [];
    }

    const data = (await res.json()) as { results?: UnsplashRawResult[] };
    if (!data.results || data.results.length === 0) {
      // Fallback query: a generic search so the writer never gets
      // an empty result for an obscure topic.
      const fallback = await fetchFallbackImage(accessKey);
      return fallback ? [fallback] : [];
    }

    return data.results.slice(0, count).map(mapPhoto);
  } catch (err) {
    console.warn('Unsplash fetch error:', err);
    return [];
  }
}

async function fetchFallbackImage(accessKey: string): Promise<UnsplashImage | null> {
  const url = `${UNSPLASH_API}/search/photos?query=${encodeURIComponent(UNSPLASH_FALLBACK_QUERY)}&orientation=landscape&per_page=5&content_filter=high`;
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Client-ID ${accessKey}`, 'Accept-Version': 'v1' },
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { results?: UnsplashRawResult[] };
    if (!data.results || data.results.length === 0) return null;
    return mapPhoto(data.results[0]);
  } catch {
    return null;
  }
}

function refineQuery(query: string): string {
  // If no known terms or fallback term are configured, return the query as-is.
  if (UNSPLASH_KNOWN_TERMS.length === 0 || !UNSPLASH_FALLBACK_TERM) return query;
  const lower = query.toLowerCase();
  // If the query already mentions one of the known terms, leave it alone.
  if (UNSPLASH_KNOWN_TERMS.some((t) => lower.includes(t))) return query;
  return `${query} ${UNSPLASH_FALLBACK_TERM}`;
}

type UnsplashRawResult = {
  urls: { raw: string; full: string; regular: string; small: string; thumb: string };
  alt_description: string | null;
  description: string | null;
  user: { name: string; links: { html: string } };
  links: { html: string };
  width: number;
  height: number;
};

function mapPhoto(photo: UnsplashRawResult): UnsplashImage {
  return {
    url: photo.urls.regular,
    thumbUrl: photo.urls.small,
    altText: photo.alt_description || photo.description || '',
    photographerName: photo.user.name,
    photographerUrl: photo.user.links.html,
    unsplashUrl: photo.links.html,
    width: photo.width,
    height: photo.height,
  };
}
