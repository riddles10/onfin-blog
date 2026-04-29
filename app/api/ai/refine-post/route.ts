import { NextRequest, NextResponse } from 'next/server';
import anthropic, { FAST_MODEL } from '@/lib/anthropic';
import { SITE_NAME } from '@/lib/cms-config';

// Combined refine + proofread pass for blog post HTML.
// Takes the article body, an optional list of QA issues to focus on, and
// returns a cleaned version. Uses Haiku because the changes are surgical
// (typo fixes, sentence rewrites, structural cleanup) -- Sonnet quality
// would be wasted on a pass like this.
//
// Cost: ~$0.015 per pass on a 2600-word article.
// Wall time: 4-8 seconds.

// Vercel Pro plan: up to 300s. Refine is a single Haiku call on one article
// (~4-8s typical) so we only need a modest budget, but bump from 30 to 120
// to absorb occasional slow Haiku responses without killing the cron chain.
export const maxDuration = 120;

const REFINE_SYSTEM = `You are a senior editor for ${SITE_NAME}. Your job is to take a draft article and produce a cleaner version of it. You make surgical edits -- you do NOT rewrite the whole thing.

WHAT TO FIX:
- Grammar mistakes, typos, awkward phrasing
- Filler phrases ("It's important to note", "By following this guide", "Trust your instincts", "In conclusion", "As mentioned earlier")
- Repetitive sentence structures (3+ sentences in a row starting the same way)
- Empty paragraphs or sections that say nothing concrete
- Run-on sentences over ~30 words -- split them
- Excessive bolding (limit: max 2 <strong> tags per paragraph)
- Hedging weasel words ("might possibly", "could potentially", "in some cases maybe")
- Any flagged QA issues passed in the user message -- fix those first

WHAT NOT TO TOUCH:
- Real prices, model years, technical specs, place names
- The overall section structure (do not delete or merge H2/H3 sections)
- The FAQ section's question wording
- Brand and model names -- leave exactly as-is
- The article's voice or argument

ALLOWED HTML TAGS ONLY: <p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>
Never introduce <h1>, <h4>, <div>, <span>, <br>, <img>.

LANGUAGE: keep the article in its original language. If it's English, no Thai script. If it's Thai, use proper Thai prose without inter-word ASCII spaces.

OUTPUT: Call the submit_refined_html tool with the cleaned article body. Do not add commentary.`;

const ALLOWED_TAGS = new Set(['p', 'h2', 'h3', 'ul', 'ol', 'li', 'strong', 'em', 'blockquote']);

function sanitizeHtml(html: string): string {
  return html.replace(/<\/?([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g, (match, tag: string) =>
    ALLOWED_TAGS.has(tag.toLowerCase()) ? match : ''
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { html, issues, lang } = body as {
      html?: string;
      issues?: Array<{ category: string; message: string }>;
      lang?: 'en' | 'th';
    };

    if (typeof html !== 'string' || !html.trim()) {
      return NextResponse.json({ error: 'html is required' }, { status: 400 });
    }
    if (html.length > 80_000) {
      return NextResponse.json({ error: 'html too large (>80KB)' }, { status: 400 });
    }

    const issueList =
      Array.isArray(issues) && issues.length > 0
        ? `\n\nFOCUS -- fix these specific QA issues first:\n${issues
            .map((i, idx) => `${idx + 1}. [${i.category}] ${i.message}`)
            .join('\n')}`
        : '';
    const langNote =
      lang === 'th'
        ? '\n\nThis article is in THAI. Preserve Thai script everywhere. Remove any inter-word ASCII spaces between Thai words.'
        : '\n\nThis article is in ENGLISH. There must be ZERO Thai script characters in the output.';

    const userMessage = `Refine and proofread the following article. Fix grammar, typos, filler phrases, and any issues listed below. Preserve structure and meaning.${langNote}${issueList}\n\nARTICLE HTML:\n${html}\n\nNow call submit_refined_html with the cleaned article.`;

    const response = await anthropic.messages.create({
      model: FAST_MODEL,
      max_tokens: 12000,
      temperature: 0.3,
      system: REFINE_SYSTEM,
      tools: [
        {
          name: 'submit_refined_html',
          description: 'Submit the cleaned article HTML.',
          input_schema: {
            type: 'object',
            properties: {
              html: {
                type: 'string',
                description:
                  'The full refined article body, HTML format. Same structure as input, with grammar/filler/typo fixes applied.',
              },
              changes_summary: {
                type: 'string',
                description: 'A 1-line summary of what was changed (e.g. "Fixed 4 typos, removed 2 filler phrases, split 3 run-on sentences").',
              },
            },
            required: ['html'],
          },
        },
      ],
      tool_choice: { type: 'tool', name: 'submit_refined_html' },
      messages: [{ role: 'user', content: userMessage }],
    });

    const toolUse = response.content.find((b) => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      return NextResponse.json(
        { error: 'Refine stage did not return structured output' },
        { status: 500 }
      );
    }

    const result = toolUse.input as { html?: string; changes_summary?: string };
    if (!result.html) {
      return NextResponse.json({ error: 'Refine returned empty HTML' }, { status: 500 });
    }

    return NextResponse.json({
      html: sanitizeHtml(result.html),
      changes_summary: result.changes_summary || '',
    });
  } catch (error) {
    console.error('refine-post error:', error);
    const message = error instanceof Error ? error.message : 'Failed to refine post';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
