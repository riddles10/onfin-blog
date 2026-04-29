import { NextRequest, NextResponse } from 'next/server';
import anthropic, { MODEL } from '@/lib/anthropic';
import { THAI_TRANSLATION_RULES, ENGLISH_TRANSLATION_RULES } from '@/lib/cms-config';

// Vercel Pro plan: up to 300s. Long-form blog bodies are auto-chunked at H2
// boundaries and translated in parallel, so the wall time is bounded by the
// slowest single section (~10-15s on Sonnet) instead of the sum of all
// sections -- but 300s gives us headroom if Anthropic is slow or a chunk retries.
export const maxDuration = 300;

// max_tokens for ONE chunk. A single H2 section is 250-400 English words ->
// ~500-800 prose tokens -> ~1100-1700 Thai tokens. 3000 gives generous headroom
// for one section (or for short content like a listing description / title /
// excerpt) without inviting runaway generation.
const CHUNK_MAX_TOKENS = 3000;

// Threshold for switching from "one big call" to "chunk-by-H2 in parallel".
// Anything below this is fast enough to translate in a single shot.
const CHUNK_THRESHOLD_CHARS = 4000;

const BASE_RULES = `You are a professional translator. Adapt tone and phrasing for natural reading rather than doing a literal word-for-word translation. Return ONLY the translated text with no commentary, no preamble, no "Here is the translation:".`;

const ENGLISH_RULES = `${BASE_RULES}\n\n${ENGLISH_TRANSLATION_RULES}`;

const THAI_RULES = `${BASE_RULES}\n\n${THAI_TRANSLATION_RULES}`;

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
 * Translate one chunk of HTML in a single Anthropic call. Returns the
 * translated text or throws on error.
 */
async function translateChunk(
  chunk: string,
  systemPrompt: string,
  targetLanguage: string,
  contextType: string
): Promise<string> {
  const prompt = `Translate the following ${contextType} to ${targetLanguage}. Return ONLY the translated content, preserving any HTML tags exactly.\n\n${chunk}`;

  const response = await anthropic.messages.create({
    model: MODEL,
    max_tokens: CHUNK_MAX_TOKENS,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const textContent = response.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('Translation chunk returned no text content');
  }
  return textContent.text;
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

    if (!targetLang || !['th', 'en'].includes(targetLang)) {
      return NextResponse.json({ error: 'targetLang must be "th" or "en"' }, { status: 400 });
    }

    const isBlog = context === 'blog';
    const targetLanguage = targetLang === 'th' ? 'Thai' : 'English';
    const contextType = isBlog ? 'blog post HTML' : 'content';
    const systemPrompt = targetLang === 'th' ? THAI_RULES : ENGLISH_RULES;

    // -- Long-form blog body? Chunk by H2 and translate in parallel. ----------
    // Parallel chunking drops wall time from ~50s sequential to ~15s, which
    // keeps Stage 2 of the cron chain well clear of the 300s Pro limit and
    // leaves headroom for the downstream refine + score + notify steps.
    if (isBlog && text.length > CHUNK_THRESHOLD_CHARS) {
      const chunks = chunkByH2(text);
      console.log(
        `[translate] long-form blog body (${text.length} chars) -> ${chunks.length} chunks, parallel`
      );

      // If chunking didn't actually split anything (no H2s in the body),
      // fall through to single-call mode rather than re-translating the
      // whole thing as one "chunk".
      if (chunks.length > 1) {
        const translatedChunks = await Promise.all(
          chunks.map((chunk) =>
            translateChunk(chunk, systemPrompt, targetLanguage, contextType)
          )
        );
        const joined = translatedChunks.join('\n\n');
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
      contextType
    );
    return new Response(single, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('Translate API error:', error);
    const message = error instanceof Error ? error.message : 'Failed to translate text';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
