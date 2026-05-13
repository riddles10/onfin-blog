import { NextRequest, NextResponse } from 'next/server';
import anthropic, { MODEL, FAST_MODEL } from '@/lib/anthropic';
import { loadSeoContext } from '@/lib/seo-context';
import { CONTENT_RULES } from '@/lib/cms-config';
import { stripEmDashes } from '@/lib/strip-emdash';

// Two-stage generation. Stage 1 (outline) ~10s. Stage 2 (parallel sections) ~25s.
// Typical wall time ~35-45s. On Vercel Pro we budget the full 300s so a
// second outline retry + 8 parallel Sonnet section calls can't be killed by
// the platform even on slow Anthropic days.
export const maxDuration = 300;

// ---------------------------------------------------------------------------
// Shared rules -- pulled from cms-config so each site can customize
// ---------------------------------------------------------------------------

const SHARED_RULES = CONTENT_RULES;

// ---------------------------------------------------------------------------
// Stage 1: Outline
// ---------------------------------------------------------------------------

const OUTLINE_SYSTEM = `${SHARED_RULES}

You are planning a long-form, in-depth article (target: 2000-2500 words). You must produce a structured outline that another writer will fill in section by section.

Your outline must include:
- A compelling SEO title (50-65 characters)
- A URL slug
- A meta description (140-160 characters)
- An intro paragraph following the APP formula (Agree, Promise, Preview): 3 sentences, 50 to 80 words, plain HTML (no heading), opens with a concrete hook from the HOOK TAXONOMY. NEVER open with a rhetorical question, a definition, or a soft preamble. NEVER use em-dashes anywhere; use commas, colons, or two shorter sentences.
- Immediately after the intro, a TL;DR paragraph: <p><strong>TL;DR.</strong> ...</p>. 2 to 4 sentences, 40 to 80 words. The first sentence is the single most actionable takeaway. Subsequent sentences give specific numbers (rates, sessions, contract specs), the one tradeoff that matters, and the safe default. The TL;DR is part of intro_html, appended after the APP paragraph.
- 6-8 H2 sections (NOT including FAQ)
  - Each section heading must be specific and benefit-focused, never generic ("Understanding the Market" X, "What Used Models Actually Cost" Y)
  - Each section gets 250-400 target words
  - Each section gets a brief "what to cover" with 3-5 concrete points
- A final FAQ section with 5 question-style H3 subsections (50-100 words per answer)

Call the submit_outline tool with the result. Do not output any other text.`;

const SECTION_SYSTEM = `${SHARED_RULES}

You are writing ONE section of a longer article. Stay focused on this section's heading and "what to cover" points. Do not introduce the article, do not summarize at the end, do not write a conclusion -- another writer is handling those.

Output the section as HTML starting with the H2 heading you were given. Use H3 subsections, lists, and short paragraphs for scannability. Hit the target word count. Call the submit_section tool with the HTML.`;

const FAQ_SYSTEM = `${SHARED_RULES}

You are writing the FAQ section for an article. Write 5 question-style H3 subsections under a single <h2>FAQ</h2> heading. Each answer should be 50-100 words and directly answer the question (great for Google featured snippets). Format as:

<h2>FAQ</h2>
<h3>Question text?</h3>
<p>Direct answer...</p>
<h3>Next question?</h3>
<p>Direct answer...</p>

Call the submit_section tool with the HTML.`;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Outline = {
  title_en: string;
  slug: string;
  excerpt_en: string;
  intro_html: string;
  sections: Array<{
    heading: string;
    what_to_cover: string[];
    target_words: number;
  }>;
  faq_questions: string[];
};

const CATEGORY_CONTEXT: Record<string, string> = {
  'buying-guide': 'an in-depth buying guide that helps readers make a confident purchase decision',
  tips: 'a practical tips & how-to article packed with specific, actionable advice',
  news: 'a substantive news/analysis article about the latest developments in the field',
  events: 'a detailed article about upcoming events, culture, or activities',
  review: 'a thorough, honest review with real-world observations and specific details',
  guide: 'a comprehensive guide that walks the reader through the topic step by step',
  general: 'a well-researched article covering the topic in depth',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const ALLOWED_TAGS = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote']);

function sanitizeHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) =>
    ALLOWED_TAGS.has(tag.toLowerCase()) ? match : ''
  );
}

// Belt-and-suspenders: strip Thai script and any parenthetical that becomes
// empty as a result. The English article should be 100% English regardless
// of what the model produces.
const THAI_RE = /[\u0E00-\u0E7F]+/g;

function stripThaiScript(html: string): string {
  let cleaned = html.replace(THAI_RE, '').replace(/\s{2,}/g, ' ');
  // Drop parentheses that became empty: "(  )", "(/)", "( / )"
  cleaned = cleaned.replace(/\(\s*[\/,\s]*\s*\)/g, '');
  // Drop hanging "called '' locally" style fragments
  cleaned = cleaned.replace(/\bcalled\s*['"]\s*['"]\s*locally/gi, '');
  // Tidy whitespace before punctuation
  cleaned = cleaned.replace(/\s+([.,;:!?])/g, '$1');
  return cleaned;
}

function countWords(html: string): number {
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.split(/\s+/).filter(Boolean).length;
}

function countThaiChars(html: string): number {
  const matches = html.match(THAI_RE);
  return matches ? matches.reduce((sum, m) => sum + m.length, 0) : 0;
}

// ---------------------------------------------------------------------------
// Stage 1 -- generate the outline
// ---------------------------------------------------------------------------

// Outline tool schema -- extracted so both the primary attempt and the
// retry use the exact same definition (and so the file is easier to read).
const OUTLINE_TOOL = {
  name: 'submit_outline' as const,
  description: 'Submit the article outline. The article will then be written section by section.',
  input_schema: {
    type: 'object' as const,
    properties: {
      title_en: {
        type: 'string',
        description: 'SEO-optimized title, 50-65 characters.',
      },
      slug: {
        type: 'string',
        description: 'URL slug. Lowercase letters, numbers, hyphens only.',
      },
      excerpt_en: {
        type: 'string',
        description: 'Meta description, 140-160 characters.',
      },
      intro_html: {
        type: 'string',
        description:
          'Two <p> blocks back-to-back. First <p>: APP intro, 3 sentences, 50-80 words, opens with a concrete hook (no questions, no definitions, no soft preambles). Second <p>: TL;DR paragraph starting with "<strong>TL;DR.</strong> " then 2-4 sentences (40-80 words) front-loading the single most actionable takeaway with specific numbers. No em-dashes anywhere.',
      },
      sections: {
        type: 'array',
        description: '6-8 H2 sections (not counting the FAQ). Required, must contain at least 6 entries.',
        minItems: 6,
        items: {
          type: 'object',
          properties: {
            heading: {
              type: 'string',
              description: 'H2 heading text. Specific and benefit-focused.',
            },
            what_to_cover: {
              type: 'array',
              items: { type: 'string' },
              description: '3-5 concrete bullet points the writer should cover.',
            },
            target_words: {
              type: 'integer',
              description: 'Target word count for this section, 250-400.',
            },
          },
          required: ['heading', 'what_to_cover', 'target_words'],
        },
      },
      faq_questions: {
        type: 'array',
        items: { type: 'string' },
        description: '5 questions for the FAQ section.',
      },
    },
    required: ['title_en', 'slug', 'excerpt_en', 'intro_html', 'sections', 'faq_questions'],
  },
};

/**
 * Try the outline tool call once. Returns either a valid Outline or null
 * (so the caller can retry / escalate). Logs full diagnostics on every
 * failure mode so we can see what's happening in production.
 */
async function attemptOutline(
  model: string,
  topic: string,
  categoryCtx: string,
  keywordList: string,
  contextBlock: string,
  attemptLabel: string
): Promise<{ outline: Outline | null; stopReason: string; outputTokens: number; rawInput: string }> {
  const response = await anthropic.messages.create({
    model,
    // 2500 leaves headroom for 8 sections x (heading + 5 bullets + target_words)
    // + 5 FAQ questions + intro + metadata + tool-call envelope.
    max_tokens: 2500,
    temperature: 0.5,
    system: `${OUTLINE_SYSTEM}\n\n${contextBlock}`,
    tools: [OUTLINE_TOOL],
    tool_choice: { type: 'tool', name: 'submit_outline' },
    messages: [
      {
        role: 'user',
        content: `Plan ${categoryCtx} on the following topic. Aim for 6-8 well-differentiated H2 sections that together cover the topic in real depth (not surface-level). The sections array MUST contain at least 6 entries -- do not return an empty list.

TOPIC: ${topic}${keywordList}

Now call submit_outline with all required fields filled in.`,
      },
    ],
  });

  const stopReason = String(response.stop_reason || 'unknown');
  const outputTokens = response.usage?.output_tokens || 0;
  const toolUse = response.content.find((b) => b.type === 'tool_use');

  if (!toolUse || toolUse.type !== 'tool_use') {
    console.warn(
      `[generate-post] ${attemptLabel} (${model}): no tool_use block. stop_reason=${stopReason}, output_tokens=${outputTokens}`
    );
    return { outline: null, stopReason, outputTokens, rawInput: '' };
  }

  const rawInput = JSON.stringify(toolUse.input);
  const parsed = toolUse.input as Outline;

  if (!parsed.sections || !Array.isArray(parsed.sections) || parsed.sections.length === 0) {
    console.warn(
      `[generate-post] ${attemptLabel} (${model}): empty sections. stop_reason=${stopReason}, output_tokens=${outputTokens}, raw=${rawInput.slice(0, 400)}`
    );
    return { outline: null, stopReason, outputTokens, rawInput: rawInput.slice(0, 400) };
  }

  // Sanity-check the rest of the required fields. If any are missing, fall
  // back to safe defaults rather than fail the whole pipeline.
  if (!parsed.title_en) parsed.title_en = topic;
  if (!parsed.slug) {
    parsed.slug = topic
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 80) || `post-${Date.now()}`;
  }
  if (!parsed.excerpt_en) parsed.excerpt_en = `${parsed.title_en} -- a complete guide.`;
  if (!parsed.intro_html) parsed.intro_html = `<p>${parsed.excerpt_en}</p>`;
  if (!parsed.faq_questions || parsed.faq_questions.length === 0) {
    parsed.faq_questions = [
      `What should I know about ${topic}?`,
      `How much does ${topic} cost?`,
      `Where can I find more about ${topic}?`,
      `Is ${topic} worth it?`,
      `What are the common issues with ${topic}?`,
    ];
  }

  return { outline: parsed, stopReason, outputTokens, rawInput: rawInput.slice(0, 200) };
}

async function generateOutline(
  topic: string,
  categoryCtx: string,
  keywords: string[],
  contextBlock: string
): Promise<Outline> {
  const keywordList =
    keywords.length > 0
      ? `\n\nPrimary and secondary keywords to weave in naturally (do not stuff): ${keywords.join(', ')}`
      : '';

  // Attempt 1 -- Sonnet
  const first = await attemptOutline(MODEL, topic, categoryCtx, keywordList, contextBlock, 'attempt 1');
  if (first.outline) return first.outline;

  // Attempt 2 -- same model, slightly higher temperature so the retry isn't
  // a deterministic re-roll of the failure case.
  console.warn('[generate-post] attempt 1 returned no outline -- retrying with same model');
  const second = await attemptOutline(MODEL, topic, categoryCtx, keywordList, contextBlock, 'attempt 2');
  if (second.outline) return second.outline;

  // Both attempts failed. Surface everything we know in the error message
  // so the alert is actionable instead of cryptic.
  throw new Error(
    `Outline failed after 2 attempts. Last: stop_reason=${second.stopReason}, output_tokens=${second.outputTokens}, raw_preview=${second.rawInput || '(empty)'}`
  );
}

// ---------------------------------------------------------------------------
// Stage 2a -- write a single body section
// ---------------------------------------------------------------------------

async function writeSection(
  topic: string,
  heading: string,
  whatToCover: string[],
  targetWords: number,
  positionInfo: string,
  contextBlock: string
): Promise<string> {
  const response = await anthropic.messages.create({
    model: MODEL,
    // 250-400 words ~ 600 tokens of prose; 1536 leaves headroom for HTML
    // tags and the tool-call envelope without inviting runaway generation.
    max_tokens: 1536,
    temperature: 0.7,
    system: `${SECTION_SYSTEM}\n\n${contextBlock}`,
    tools: [
      {
        name: 'submit_section',
        description: 'Submit the finished HTML for this section.',
        input_schema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description:
                'The section HTML, starting with <h2>. Allowed tags: <p>, <h2>, <h3>, <ul>, <li>, <ol>, <strong>, <em>, <blockquote>.',
            },
          },
          required: ['html'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_section' },
    messages: [
      {
        role: 'user',
        content: `ARTICLE TOPIC: ${topic}
${positionInfo}

WRITE THIS SECTION:
H2 heading: ${heading}
Target word count: ${targetWords}
Cover these points specifically:
${whatToCover.map((p) => `- ${p}`).join('\n')}

Write only this section. Do not introduce the article or write a conclusion. Start with the <h2> heading. Now call submit_section.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error(`Section "${heading}" did not return structured output`);
  }
  const result = toolUse.input as { html?: string };
  if (!result.html) throw new Error(`Section "${heading}" returned empty HTML`);
  return stripThaiScript(sanitizeHtml(result.html));
}

// ---------------------------------------------------------------------------
// Stage 2b -- write the FAQ section
// ---------------------------------------------------------------------------

async function writeFaq(
  topic: string,
  questions: string[],
  contextBlock: string
): Promise<string> {
  const response = await anthropic.messages.create({
    // FAQ is 5 short answers (50-100 words each) -- Haiku handles this well
    // and saves ~5-8s vs Sonnet on the critical-path parallel branch.
    model: FAST_MODEL,
    max_tokens: 1536,
    temperature: 0.6,
    system: `${FAQ_SYSTEM}\n\n${contextBlock}`,
    tools: [
      {
        name: 'submit_section',
        description: 'Submit the finished FAQ section HTML.',
        input_schema: {
          type: 'object',
          properties: {
            html: {
              type: 'string',
              description: 'The FAQ section HTML, starting with <h2>FAQ</h2>.',
            },
          },
          required: ['html'],
        },
      },
    ],
    tool_choice: { type: 'tool', name: 'submit_section' },
    messages: [
      {
        role: 'user',
        content: `ARTICLE TOPIC: ${topic}

Write the FAQ section answering these 5 questions:
${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Each answer 50-100 words. Format as an <h2>FAQ</h2> followed by <h3>question</h3><p>answer</p> blocks. Now call submit_section.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('FAQ section did not return structured output');
  }
  const result = toolUse.input as { html?: string };
  if (!result.html) throw new Error('FAQ section returned empty HTML');
  return stripThaiScript(sanitizeHtml(result.html));
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

export async function POST(request: NextRequest) {
  try {
    const { topic, category, keywords } = await request.json();

    if (!topic || typeof topic !== 'string') {
      return NextResponse.json({ error: 'topic is required' }, { status: 400 });
    }

    const categoryCtx =
      CATEGORY_CONTEXT[category] || 'a substantial article covering the topic in depth';
    const keywordsArr: string[] = Array.isArray(keywords) ? keywords : [];

    // Load brand voice + SEO guidelines + seed exemplars + live internal-link
    // map. Cached in-memory for 10 minutes so subsequent calls are ~free.
    const seoContext = await loadSeoContext(category);
    const contextBlock = seoContext.combined;

    // Stage 1: outline (uses context for hook taxonomy + section style).
    // generateOutline now throws with stop_reason/usage embedded in the
    // error message if sections comes back empty -- no secondary guard needed.
    const outline = await generateOutline(topic, categoryCtx, keywordsArr, contextBlock);

    // Stage 2: write all body sections + FAQ in parallel
    const totalSections = outline.sections.length;
    const bodyPromises = outline.sections.map((section, idx) =>
      writeSection(
        topic,
        section.heading,
        section.what_to_cover,
        section.target_words,
        `Section ${idx + 1} of ${totalSections}.`,
        contextBlock
      )
    );
    const faqPromise = writeFaq(topic, outline.faq_questions || [], contextBlock);

    const [bodySections, faqHtml] = await Promise.all([
      Promise.all(bodyPromises),
      faqPromise,
    ]);

    // Assemble final article. stripThaiScript runs on every chunk so the
    // English body is guaranteed to be Thai-script-free even if the model slips.
    // stripEmDashes is a second backstop alongside the prompt rule banning
    // em-dashes; if the model still slips one in, we never persist it.
    const introHtml = stripEmDashes(stripThaiScript(sanitizeHtml(outline.intro_html)));
    const fullBody = stripEmDashes(
      [introHtml, ...bodySections, faqHtml].join('\n\n')
    );
    const wordCount = countWords(fullBody);
    const residualThai = countThaiChars(fullBody);

    if (wordCount < 1500) {
      console.warn(`generate-post: short article (${wordCount} words) for topic "${topic}"`);
    }
    if (residualThai > 0) {
      console.warn(`generate-post: ${residualThai} Thai chars survived stripping for topic "${topic}"`);
    }

    return NextResponse.json({
      title_en: stripEmDashes(stripThaiScript(outline.title_en)),
      slug: outline.slug,
      excerpt_en: stripEmDashes(stripThaiScript(outline.excerpt_en)),
      body_en: fullBody,
      _meta: {
        wordCount,
        sectionCount: outline.sections.length,
        residualThai,
      },
    });
  } catch (error) {
    console.error('generate-post error:', error);
    const message = error instanceof Error ? error.message : 'Failed to generate post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
