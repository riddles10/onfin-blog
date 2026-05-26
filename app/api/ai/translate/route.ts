import { NextRequest, NextResponse } from 'next/server';
import anthropic, { MODEL } from '@/lib/anthropic';
import { THAI_TRANSLATION_RULES, ENGLISH_TRANSLATION_RULES } from '@/lib/cms-config';
import { SUPPORTED_LOCALES, isLocale, type Locale } from '@/lib/locales';
import { repairAnchors } from '@/lib/repair-anchors';

// Vercel Pro plan: up to 300s. Long-form blog bodies are auto-chunked at H2
// boundaries and translated in parallel, so the wall time is bounded by the
// slowest single section, not the sum.
export const maxDuration = 300;

// max_tokens for ONE chunk. A single H2 section is 250-400 English words ->
// ~500-800 prose tokens -> ~1100-1700 tokens for verbose target languages
// (e.g. Thai, Russian). 3000 gives generous headroom.
const CHUNK_MAX_TOKENS = 3000;

// Threshold for switching from "one big call" to "chunk-by-H2 in parallel".
const CHUNK_THRESHOLD_CHARS = 4000;

// English-language names for the AI prompt. We deliberately use English
// here (not the endonyms from lib/locales.LOCALE_NAMES) because the system
// prompt itself is English — a model is more reliable being told to
// "translate to Vietnamese" than "translate to Tiếng Việt".
const TARGET_LANGUAGE_NAMES: Record<Locale, string> = {
  en: 'English',
  ru: 'Russian',
  vi: 'Vietnamese',
  th: 'Thai',
  ms: 'Malay',
  id: 'Indonesian',
  es: 'Spanish',
  km: 'Khmer',
  zh: 'Simplified Chinese',
  tr: 'Turkish',
};

// Locale-specific quirks that benefit from explicit instruction. Most of
// these are "don't insert/remove spaces in non-spaced scripts" rules and
// region-targeting (e.g. Spanish → LatAm rather than Castilian Spanish to
// match the existing es-419 BCP47 setting).
const LOCALE_SPECIFIC_RULES: Partial<Record<Locale, string>> = {
  ru: '- Use modern Russian as written in 21st-century financial media. Prefer transliteration over translation for English-origin trading terms when those are the industry standard in Russian-language broker copy (e.g. «трейдер», «спред», «пипс»).',
  vi: '- Use natural, modern Vietnamese with appropriate diacritics. Keep technical trading terms in English when they are the conventional usage in Vietnamese-language broker copy.',
  ms: '- Use standard Bahasa Melayu (Malaysian, not Indonesian). Keep English trading and platform terminology when standard in Malaysian financial media.',
  id: '- Use standard Bahasa Indonesia. Keep English trading and platform terminology when standard in Indonesian financial media.',
  es: '- Use neutral Latin-American Spanish (es-419), not Castilian. Avoid regional slang from any single country. Trading terms commonly used in English (e.g. "spread", "pip", "lot") may stay in English when natural.',
  km: '- Khmer has no inter-word spaces — do not insert ASCII spaces between Khmer words. Use spaces only after punctuation and around English/numeric tokens. Khmer numbers may be used or Arabic numerals — be consistent within the article.',
  zh: '- Use Simplified Chinese (Mainland conventions). Chinese has no inter-word spaces — do not insert ASCII spaces between Chinese characters. Translate punctuation to its full-width Chinese equivalent (。, ,, ;, : ) where appropriate, except inside HTML tags.',
};

// Brand and technical terms that must stay in English in every locale.
// Mirrors the GLOSSARY regex list in scripts/translate-archive.ts — kept
// here in plain-prose form because we're prompting an LLM, not running a
// regex pre-pass.
const BRAND_GLOSSARY = `KEEP THE FOLLOWING TERMS IN ENGLISH (do not translate or transliterate them):
- Brand: OnFin
- Platforms: MT4, MT5, MetaTrader, MetaTrader 4, MetaTrader 5
- Currency pair tickers (e.g. EUR/USD, GBP/JPY, XAU/USD) — keep the 3-letter ISO codes
- Regulators: ESMA, FCA, MAS, CFTC, MISA, CySEC, ASIC, FINMA, SEC
- Economic indicators / central banks: NFP, FOMC, CPI, PMI, GDP, ECB, BoE, BoJ, RBA, RBNZ, SNB
- Asset classes: ETF, CFD, FX
- Product names: copytrading`;

const BASE_RULES = `You are a professional translator working on a forex trading blog. Adapt tone and phrasing for natural reading rather than producing a literal word-for-word translation. Return ONLY the translated text — no commentary, no preamble, no "Here is the translation:". Preserve all HTML tags exactly (<h2>, <h3>, <p>, <ul>, <li>, <strong>, <em>, <a>, <aside>, <blockquote>); only the text content between tags is translated. URLs in href attributes are not translated.`;

// Hard cap on the rendered output length for listing context (titles +
// excerpts). Enforced both via the prompt below and via a server-side
// truncate-at-word-boundary fallback in `translateChunk`. Chosen to
// comfortably fit a card excerpt without designing for any specific locale
// — 260 chars is ~30–40 Latin/Cyrillic words and several full sentences in
// Chinese, both of which exceed normal excerpt prose.
const LISTING_CHAR_CAP = 260;

// Listing-context addendum. Without this, Deepseek treats short excerpts
// as a "topic to expand on" and returns multi-section HTML articles. The
// rules below force a near-1:1 translation with explicit structural and
// length bounds.
const LISTING_RULES = `LISTING-CONTEXT RULES (titles and excerpts)
- Translate ONLY the input. Do NOT add information, examples, sections, headings, sub-points, lists, or commentary that is not present in the source.
- The output must be the same shape as the input: if the input is one sentence, output one sentence. If it is plain text, output plain text (no <h1>/<h2>/<h3>/<ul>/<ol>/<blockquote>/<aside> wrappers — even if the source mentions topics that could be expanded).
- Match the source length within roughly ±30%. HARD CAP: ${LISTING_CHAR_CAP} characters total. If a faithful translation would exceed that, tighten the phrasing; do not drop facts.
- Output sentence count must equal the input sentence count.`;

// Blog-context addendum. Long-form bodies should preserve HTML structure
// section-by-section; this is the existing behaviour, written down so the
// model can't drift toward listing-style truncation either.
const BLOG_RULES = `BLOG-BODY RULES
- Translate the full HTML body with no structural changes: every <h2>, <h3>, <p>, <ul>, <ol>, <li>, <strong>, <em>, <a>, <aside>, <blockquote> in the input must appear in the output, in the same order.
- Translate the text content of every tag; do not skip or summarise sections.
- Do not add new sections or sub-headings that aren't in the source.`;

type Context = 'blog' | 'listing';

function buildSystemPrompt(locale: Locale, context: Context): string {
  const contextRules = context === 'listing' ? LISTING_RULES : BLOG_RULES;

  // Preserve the existing prompt structure verbatim for the two pre-existing
  // locales so behaviour is identical for current callers (daily-translate
  // cron, translate-archive script test paths) — but layer the new
  // context-specific addendum on top, which is the missing piece that lets
  // Deepseek behave on short excerpts.
  if (locale === 'th') {
    return `${BASE_RULES}\n\n${THAI_TRANSLATION_RULES}\n\n${contextRules}\n\n${BRAND_GLOSSARY}`;
  }
  if (locale === 'en') {
    return `${BASE_RULES}\n\n${ENGLISH_TRANSLATION_RULES}\n\n${contextRules}\n\n${BRAND_GLOSSARY}`;
  }

  // Generic per-locale rules for the 7 new locales.
  const langName = TARGET_LANGUAGE_NAMES[locale];
  const specifics = LOCALE_SPECIFIC_RULES[locale] ?? '';
  const rules = [
    `${langName.toUpperCase()} TRANSLATION RULES`,
    `- Write natural, fluent ${langName} as a native financial-media writer would.`,
    `- Translate all heading text (H2/H3) fully into ${langName}.`,
    `- Keep HTML structure, attributes, and link targets unchanged.`,
    specifics,
    `- The translation should read natively, not as a word-for-word render of the English source.`,
  ]
    .filter(Boolean)
    .join('\n');

  return `${BASE_RULES}\n\n${rules}\n\n${contextRules}\n\n${BRAND_GLOSSARY}`;
}

/**
 * Truncate a listing-context translation that overran the hard cap. We
 * trust the prompt to do most of the work but enforce server-side as a
 * belt-and-braces — Deepseek occasionally still over-produces.
 * Truncation walks back to the nearest sentence/word boundary so the
 * result reads as a clean sentence end rather than mid-word.
 */
function enforceListingCap(text: string): string {
  if (text.length <= LISTING_CHAR_CAP) return text;
  // Strip any block-level HTML the model invented despite being told not to.
  const stripped = text
    .replace(/<\/?(?:h[1-6]|ul|ol|li|blockquote|aside|table|thead|tbody|tr|td|th)[^>]*>/gi, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (stripped.length <= LISTING_CHAR_CAP) return stripped;
  const sliced = stripped.slice(0, LISTING_CHAR_CAP);
  // Prefer cutting at a sentence boundary, then a word boundary; fall back
  // to the raw slice rather than emit empty if neither exists.
  const lastSentence = Math.max(
    sliced.lastIndexOf('. '),
    sliced.lastIndexOf('! '),
    sliced.lastIndexOf('? '),
    sliced.lastIndexOf('。'),
    sliced.lastIndexOf('!'),
    sliced.lastIndexOf('?')
  );
  if (lastSentence > LISTING_CHAR_CAP * 0.5) return sliced.slice(0, lastSentence + 1).trim();
  const lastSpace = sliced.lastIndexOf(' ');
  if (lastSpace > LISTING_CHAR_CAP * 0.5) return sliced.slice(0, lastSpace).trim() + '…';
  return sliced.trim() + '…';
}

/**
 * Split a long blog HTML body into chunks at H2 boundaries. Each chunk
 * starts with its <h2> tag (or, for the first chunk, with the intro
 * paragraphs that come before the first H2). Empty chunks are dropped.
 */
function chunkByH2(html: string): string[] {
  const parts = html.split(/(?=<h2[\s>])/i);
  return parts.map((p) => p.trim()).filter((p) => p.length > 0);
}

/**
 * Translate one chunk of HTML in a single AI call.
 */
async function translateChunk(
  chunk: string,
  systemPrompt: string,
  targetLanguage: string,
  context: Context
): Promise<string> {
  const contextLabel = context === 'blog' ? 'blog post HTML' : 'short text';
  // Source-length signal in the user prompt — gives the model a concrete
  // anchor when the system prompt's "match source length" rule isn't enough.
  const lengthHint =
    context === 'listing'
      ? ` The source is ${chunk.length} characters; aim to land within ${LISTING_CHAR_CAP} characters, single-paragraph plain text.`
      : '';
  const prompt = `Translate the following ${contextLabel} to ${targetLanguage}. Return ONLY the translated content, preserving any HTML tags exactly.${lengthHint}\n\n${chunk}`;

  // For listing context we want the model to stop early — capping
  // max_tokens is a second safety rail beneath the prompt-level cap.
  const maxTokens = context === 'listing' ? 400 : CHUNK_MAX_TOKENS;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Translation chunk returned no text content');
  }
  const raw = textContent.text;
  return context === 'listing' ? enforceListingCap(raw) : raw;
}

export async function POST(request: NextRequest) {
  try {
    const { text, targetLang, context } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Text is required' }, { status: 400 });
    }

    if (text.length > 50000) {
      return NextResponse.json(
        { error: 'Text must be 50000 characters or fewer' },
        { status: 400 }
      );
    }

    if (typeof targetLang !== 'string' || !isLocale(targetLang)) {
      return NextResponse.json(
        {
          error: `targetLang must be one of: ${SUPPORTED_LOCALES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const ctx: Context = context === 'blog' ? 'blog' : 'listing';
    const targetLanguage = TARGET_LANGUAGE_NAMES[targetLang];
    const systemPrompt = buildSystemPrompt(targetLang, ctx);

    // -- Long-form blog body? Chunk by H2 and translate in parallel. ----------
    if (ctx === 'blog' && text.length > CHUNK_THRESHOLD_CHARS) {
      const chunks = chunkByH2(text);
      console.log(
        `[translate] long-form blog body (${text.length} chars) -> ${chunks.length} chunks, parallel → ${targetLang}`
      );

      if (chunks.length > 1) {
        const translatedChunks = await Promise.all(
          chunks.map((chunk) =>
            translateChunk(chunk, systemPrompt, targetLanguage, ctx)
          )
        );
        const joined = repairAnchors(translatedChunks.join('\n\n'));
        return new Response(joined, {
          headers: { 'Content-Type': 'text/plain; charset=utf-8' },
        });
      }
    }

    // -- Short-form (titles, excerpts, or H2-less bodies) --------------------
    const single = await translateChunk(
      text,
      systemPrompt,
      targetLanguage,
      ctx
    );
    return new Response(repairAnchors(single), {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Translate API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to translate text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
