// Server-side HTML image injection for blog post bodies.
//
// Walks the first N H2 headings in an HTML blog body and inserts an <img>
// sourced from Unsplash immediately after each one, keyed to the heading
// text. Used by the daily-translate cron to auto-illustrate drafts.
//
// Why regex instead of DOMParser? Two reasons:
//   1. DOMParser is a browser API — it's not available in Node / Vercel's
//      Edge or Node serverless runtimes. We'd need to pull in jsdom just
//      to parse 3 headings, which is overkill and slow.
//   2. Our blog HTML is hand-written by the AI using a tight set of tags
//      (<h2>, <p>, <img>, <ul>, <strong>, etc.), so a targeted regex is
//      reliable enough here. The AI never produces weird nested H2s.
//
// This helper is idempotent: if an <img> already sits immediately after an
// H2 (ignoring whitespace and empty <p> tags), that heading is skipped.

import { searchImages } from '@/lib/unsplash';

export type InjectResult = {
  html: string;
  inserted: number;
  skippedFaq: number;
  skippedExisting: number;
};

/**
 * Inject up to `maxImages` Unsplash images after the first H2 sections of
 * an HTML body. Skips FAQ sections and any H2 that already has an image.
 *
 * @param html     The English (or post-translation) blog body HTML
 * @param maxImages Hard cap on how many <img> tags to add (defaults to 3)
 */
export async function injectBodyImages(
  html: string,
  maxImages = 3
): Promise<InjectResult> {
  if (!html) {
    return { html, inserted: 0, skippedFaq: 0, skippedExisting: 0 };
  }

  // Match each H2 block: the opening tag, heading text, closing tag.
  // We capture the inner text so we can (a) search Unsplash with it and
  // (b) detect "FAQ" headings to skip. The 'g' flag + exec loop gives us
  // the position of each match so we can decide "is there already an img
  // right after this?".
  const h2Regex = /<h2[^>]*>([\s\S]*?)<\/h2>/gi;

  type H2Match = {
    full: string;         // the full <h2>...</h2> match
    text: string;         // the inner text with tags/entities stripped
    indexStart: number;   // where in html the match begins
    indexEnd: number;     // one past the match
  };

  const matches: H2Match[] = [];
  let m: RegExpExecArray | null;
  while ((m = h2Regex.exec(html)) !== null) {
    matches.push({
      full: m[0],
      text: stripHtmlEntities(m[1]).trim(),
      indexStart: m.index,
      indexEnd: m.index + m[0].length,
    });
  }

  if (matches.length === 0) {
    return { html, inserted: 0, skippedFaq: 0, skippedExisting: 0 };
  }

  // Candidate = first `maxImages` H2s that survive FAQ/existing-img filters.
  // We pre-filter before hitting Unsplash so we don't burn API credits on
  // headings we're going to skip anyway.
  const candidates: Array<{ h2: H2Match; query: string }> = [];
  let skippedFaq = 0;
  let skippedExisting = 0;

  for (const h2 of matches) {
    if (candidates.length >= maxImages) break;

    // Skip FAQ sections — stock photos there look weird and break the scan.
    if (/^faq\b/i.test(h2.text) || /frequently asked/i.test(h2.text)) {
      skippedFaq++;
      continue;
    }

    // Skip if the very next visible element is already an <img>. Walk past
    // whitespace and any empty paragraph tags first (the AI sometimes emits
    // an empty <p></p> as a visual spacer).
    if (alreadyHasImageAfter(html, h2.indexEnd)) {
      skippedExisting++;
      continue;
    }

    // Skip empty headings (shouldn't happen but be safe).
    if (!h2.text) continue;

    candidates.push({ h2, query: h2.text });
  }

  if (candidates.length === 0) {
    return { html, inserted: 0, skippedFaq, skippedExisting };
  }

  // Fetch all candidate images in parallel. Each search pulls the top 1
  // landscape result. If a particular heading returns nothing we just
  // drop it rather than inserting a wrong image.
  const images = await Promise.all(
    candidates.map((c) =>
      searchImages(c.query, 1)
        .then((arr) => arr[0] || null)
        .catch(() => null)
    )
  );

  // Build the new HTML by walking candidates in REVERSE index order — this
  // way earlier insertions don't shift the offsets of later ones. Each
  // insertion is a simple string splice at h2.indexEnd.
  let out = html;
  let inserted = 0;
  const insertionPairs: Array<{ at: number; snippet: string }> = [];

  for (let i = 0; i < candidates.length; i++) {
    const img = images[i];
    const c = candidates[i];
    if (!img?.url) continue;

    const alt = escapeHtmlAttr(img.altText || c.query);
    // Full-width, lazy-loaded inline figure. No figure/figcaption wrapper —
    // we let the prose styles (LanguageToggle > prose) render it centered.
    const snippet = `\n<img src="${img.url}" alt="${alt}" loading="lazy" />\n`;
    insertionPairs.push({ at: c.h2.indexEnd, snippet });
    inserted++;
  }

  // Sort descending by position then splice from end to start.
  insertionPairs.sort((a, b) => b.at - a.at);
  for (const p of insertionPairs) {
    out = out.slice(0, p.at) + p.snippet + out.slice(p.at);
  }

  return { html: out, inserted, skippedFaq, skippedExisting };
}

/**
 * Returns true if the next non-empty element after `from` is an <img> tag.
 * Walks past whitespace and any empty <p></p> placeholder tags.
 */
function alreadyHasImageAfter(html: string, from: number): boolean {
  // Slice a reasonable window — we only need the first ~200 chars to decide.
  const window = html.slice(from, from + 400);
  // Strip leading whitespace and any empty paragraph tags before the test.
  const stripped = window
    .replace(/^\s+/, '')
    .replace(/^(<p[^>]*>\s*<\/p>\s*)+/i, '')
    .replace(/^\s+/, '');
  return /^<(?:img|figure)\b/i.test(stripped);
}

/** Strip inner-HTML tags and decode the small set of entities the AI emits. */
function stripHtmlEntities(s: string): string {
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');
}

/** Escape a string so it's safe inside an HTML attribute. */
function escapeHtmlAttr(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
