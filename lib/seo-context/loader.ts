// Dynamic SEO context loader.
// Pulls live data from Supabase so the AI writer has fresh exemplars
// (top published posts) and a real internal-link map (live listing
// categories and popular models). Cached in-memory per server instance
// for 10 minutes to keep generate-post fast.

import { getServiceClient } from '@/lib/supabase';
import { BRAND_VOICE } from './brand-voice';
import { SEO_GUIDELINES } from './seo-guidelines';
import { SITE_NAME } from '@/lib/cms-config';

const TEN_MINUTES = 10 * 60 * 1000;

type CacheEntry<T> = { value: T; expires: number };
const cache: Record<string, CacheEntry<unknown>> = {};

function getCached<T>(key: string): T | null {
  const entry = cache[key] as CacheEntry<T> | undefined;
  if (!entry) return null;
  if (Date.now() > entry.expires) {
    delete cache[key];
    return null;
  }
  return entry.value;
}

function setCached<T>(key: string, value: T, ttlMs = TEN_MINUTES): void {
  cache[key] = { value, expires: Date.now() + ttlMs };
}

// ─────────────────────────────────────────────────────────────────────────────
// Seed posts — 3 published exemplars from the posts table
// ─────────────────────────────────────────────────────────────────────────────

type SeedPost = {
  title: string;
  excerpt: string;
  category: string;
  // first ~600 chars of body, plain text
  preview: string;
};

async function fetchSeedPosts(category?: string): Promise<SeedPost[]> {
  const cacheKey = `seeds:${category || 'any'}`;
  const cached = getCached<SeedPost[]>(cacheKey);
  if (cached) return cached;

  try {
    const supabase = getServiceClient();
    let query = supabase
      .from('posts')
      .select('title_en, excerpt_en, category, body_en')
      .eq('published', true)
      .order('created_at', { ascending: false })
      .limit(6);

    if (category) {
      // Prefer same-category exemplars but fall back to any if none exist
      const { data: sameCat } = await query.eq('category', category);
      if (sameCat && sameCat.length >= 2) {
        const seeds = sameCat.slice(0, 3).map(toSeed);
        setCached(cacheKey, seeds);
        return seeds;
      }
    }

    const { data } = await query;
    const seeds = (data || []).slice(0, 3).map(toSeed);
    setCached(cacheKey, seeds);
    return seeds;
  } catch {
    return [];
  }
}

function toSeed(row: {
  title_en: string;
  excerpt_en: string | null;
  category: string;
  body_en: string;
}): SeedPost {
  const plain = (row.body_en || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    title: row.title_en,
    excerpt: row.excerpt_en || '',
    category: row.category,
    preview: plain.slice(0, 500),
  };
}

function formatSeedPosts(seeds: SeedPost[]): string {
  if (seeds.length === 0) return '';
  const blocks = seeds.map(
    (s, i) =>
      `Exemplar ${i + 1} — category: ${s.category}\nTitle: ${s.title}\nExcerpt: ${s.excerpt}\nOpening preview: ${s.preview}`
  );
  return `RECENT PUBLISHED EXEMPLARS FROM ${SITE_NAME.toUpperCase()} (match this tone and depth):\n\n${blocks.join('\n\n')}`;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal-link map — popular brands/models/categories from listings
// ─────────────────────────────────────────────────────────────────────────────

type InternalLinks = {
  brands: string[];
  models: string[];
  categories: string[];
  topListings: Array<{ title: string; brand: string; model: string }>;
};

async function fetchInternalLinks(): Promise<InternalLinks> {
  const cacheKey = 'links:all';
  const cached = getCached<InternalLinks>(cacheKey);
  if (cached) return cached;

  const empty: InternalLinks = { brands: [], models: [], categories: [], topListings: [] };

  try {
    const supabase = getServiceClient();
    const { data } = await supabase
      .from('listings')
      .select('title, brand, model, category')
      .eq('is_active', true)
      .order('views', { ascending: false })
      .limit(50);

    if (!data || data.length === 0) {
      setCached(cacheKey, empty);
      return empty;
    }

    const brandSet = new Set<string>();
    const modelSet = new Set<string>();
    const categorySet = new Set<string>();
    const topListings: InternalLinks['topListings'] = [];

    for (const row of data) {
      if (row.brand) brandSet.add(row.brand);
      if (row.brand && row.model) modelSet.add(`${row.brand} ${row.model}`);
      if (row.category) categorySet.add(row.category);
      if (topListings.length < 8) {
        topListings.push({ title: row.title, brand: row.brand, model: row.model });
      }
    }

    const links: InternalLinks = {
      brands: Array.from(brandSet).slice(0, 12),
      models: Array.from(modelSet).slice(0, 15),
      categories: Array.from(categorySet),
      topListings,
    };
    setCached(cacheKey, links);
    return links;
  } catch {
    return empty;
  }
}

function formatInternalLinks(links: InternalLinks): string {
  if (links.brands.length === 0) return '';
  const parts = [
    `LIVE INVENTORY ON ${SITE_NAME.toUpperCase()} (use these names — they map to real listing pages):`,
    `Brands currently for sale: ${links.brands.join(', ')}`,
    `Specific models for sale: ${links.models.join(', ')}`,
    `Listing categories: ${links.categories.join(', ')}`,
  ];
  if (links.topListings.length > 0) {
    parts.push(
      `Currently popular listings: ${links.topListings.map((l) => `${l.brand} ${l.model}`).join(' · ')}`
    );
  }
  parts.push(
    `When recommending models, prefer the ones above so readers can immediately find them on the site. Mention "${SITE_NAME}" naturally 1–2 times in the article.`
  );
  return parts.join('\n');
}

// ─────────────────────────────────────────────────────────────────────────────
// Public API — assemble the full context block
// ─────────────────────────────────────────────────────────────────────────────

export type SeoContext = {
  brandVoice: string;
  seoGuidelines: string;
  exemplars: string;
  internalLinks: string;
  /** All four blocks joined with double newlines, ready to inject into a system prompt. */
  combined: string;
};

export async function loadSeoContext(category?: string): Promise<SeoContext> {
  const [seeds, links] = await Promise.all([fetchSeedPosts(category), fetchInternalLinks()]);
  const exemplars = formatSeedPosts(seeds);
  const internalLinks = formatInternalLinks(links);
  const combined = [BRAND_VOICE, SEO_GUIDELINES, exemplars, internalLinks]
    .filter(Boolean)
    .join('\n\n');
  return {
    brandVoice: BRAND_VOICE,
    seoGuidelines: SEO_GUIDELINES,
    exemplars,
    internalLinks,
    combined,
  };
}
