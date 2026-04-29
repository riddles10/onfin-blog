// Deterministic, instant QA scorer for blog post HTML.
//
// No LLM call — runs in <50ms even on 3000-word articles. Returns a 0-100
// score plus a categorized list of issues so the editor UI can show specific
// fixes rather than a vague "improve quality" message.
//
// Lives in /cms/lib so it can be imported by both the public API route AND the
// daily cron pipeline (Next.js doesn't allow non-handler exports from route
// files, so the route just re-exports the function from here).

import { SITE_MENTION_PATTERN, SITE_NAME } from '@/lib/cms-config';

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const FILLER_PHRASES = [
  "it's important to note",
  'it is important to note',
  'by following this guide',
  'by following these steps',
  'trust your instincts',
  'in conclusion',
  'to sum up',
  'at the end of the day',
  'needless to say',
  'as mentioned earlier',
  'as we discussed',
  'in this article',
  'in this guide',
  'remember that',
];

const STOP_WORDS = new Set([
  // Functional words
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'should',
  'could', 'may', 'might', 'must', 'can', 'shall', 'to', 'of', 'in', 'for', 'on',
  'with', 'at', 'by', 'from', 'up', 'about', 'into', 'through', 'during', 'before',
  'after', 'above', 'below', 'between', 'under', 'this', 'that', 'these', 'those',
  'it', 'its', 'they', 'them', 'their', 'what', 'which', 'who', 'whom', 'whose',
  'as', 'if', 'then', 'than', 'so', 'how', 'when', 'where', 'why', 'you', 'your',
  'we', 'our', 'us', 'i', 'me', 'my', 'he', 'she', 'his', 'her', 'also', 'just',
  'like', 'one', 'two', 'three', 'first', 'second', 'third', 'most', 'more', 'some',
  'any', 'all', 'each', 'every', 'no', 'not', 'only', 'own', 'same', 'such', 'too',
  'very', 'now', 'still', 'even', 'well', 'good', 'great', 'best',
  // Units & currencies — these legitimately repeat in price-heavy articles and
  // are not "keywords" for SEO purposes.
  'thb', 'baht', 'usd', 'eur', 'km', 'kms', 'kmh', 'mph', 'cc', 'ccm', 'kg', 'kgs',
  'liter', 'litre', 'liters', 'litres', 'hp', 'bhp', 'rpm', 'mm', 'cm',
]);

const THAI_RE = /[\u0E00-\u0E7F]/g;
const DISALLOWED_TAGS = ['h1', 'h4', 'h5', 'h6', 'div', 'span', 'br', 'img', 'iframe', 'script'];

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type Severity = 'error' | 'warning' | 'info';
export type Lang = 'en' | 'th';

export type Issue = {
  severity: Severity;
  category: string;
  message: string;
};

export type ScoreResult = {
  lang: Lang;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  metrics: {
    wordCount: number;
    h2Count: number;
    h3Count: number;
    paragraphCount: number;
    strongCount: number;
    avgStrongPerParagraph: number;
    thaiCharsInBody: number;
    fillerPhrasesFound: number;
    siteMentions: number;
    /** Thai mode only: number of suspect inter-word ASCII spaces inside Thai prose */
    thaiInterWordSpaces?: number;
    topKeywords: Array<{ word: string; count: number; density: number }>;
  };
  issues: Issue[];
  suggestions: string[];
};

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

function plainText(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function countTags(html: string, tag: string): number {
  const re = new RegExp(`<${tag}\\b[^>]*>`, 'gi');
  return (html.match(re) || []).length;
}

function topKeywords(text: string, n: number): Array<{ word: string; count: number; density: number }> {
  const words = text.toLowerCase().match(/[a-z][a-z0-9'-]{2,}/g) || [];
  const total = words.length;
  if (total === 0) return [];
  const counts = new Map<string, number>();
  for (const w of words) {
    if (STOP_WORDS.has(w)) continue;
    counts.set(w, (counts.get(w) || 0) + 1);
  }
  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
    .map(([word, count]) => ({
      word,
      count,
      density: Math.round((count / total) * 10000) / 100, // percent with 2 decimals
    }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Scorer
// ─────────────────────────────────────────────────────────────────────────────

export function scorePostHtml(html: string, lang: Lang = 'en'): ScoreResult {
  const text = plainText(html);
  const lowerText = text.toLowerCase();
  // Thai script has no spaces between words, so word count must be measured
  // by character density rather than whitespace splits.
  const wordCount =
    lang === 'th'
      ? Math.round((text.match(/[\u0E00-\u0E7F]/g) || []).length / 4) // ~4 Thai chars per word
      : (text ? text.split(/\s+/).filter(Boolean).length : 0);
  const h2Count = countTags(html, 'h2');
  const h3Count = countTags(html, 'h3');
  const paragraphCount = countTags(html, 'p');
  const strongCount = countTags(html, 'strong');

  // Disallowed tags
  const disallowedFound = DISALLOWED_TAGS.filter((t) => countTags(html, t) > 0);

  // Thai script presence
  const thaiMatches = html.match(THAI_RE);
  const thaiCharsInBody = thaiMatches ? thaiMatches.length : 0;

  // Inter-word Thai spaces — a common Thai-translation bug. Pattern: a Thai
  // character, one or more ASCII spaces, then another Thai character. This is
  // wrong unless the space is inside an English insert, brand name, or number.
  let thaiInterWordSpaces = 0;
  if (lang === 'th') {
    const plainNoTags = text;
    const re = /[\u0E00-\u0E7F]\s+[\u0E00-\u0E7F]/g;
    const matches = plainNoTags.match(re);
    thaiInterWordSpaces = matches ? matches.length : 0;
  }

  // Filler phrases (English only)
  const fillerHits: string[] = [];
  if (lang === 'en') {
    for (const phrase of FILLER_PHRASES) {
      if (lowerText.includes(phrase)) fillerHits.push(phrase);
    }
  }

  // Site-name mentions — only if a pattern is configured
  let siteMentions = 0;
  if (SITE_MENTION_PATTERN) {
    const siteMatches = lowerText.match(new RegExp(SITE_MENTION_PATTERN.source, 'gi'));
    siteMentions = siteMatches ? siteMatches.length : 0;
  }

  // Bolding density
  const avgStrongPerParagraph =
    paragraphCount > 0 ? Math.round((strongCount / paragraphCount) * 100) / 100 : 0;

  // Top keywords (English only — Thai tokenization is non-trivial without
  // a dedicated tokenizer and would produce noise on a per-character split)
  const top = lang === 'en' ? topKeywords(text, 8) : [];

  // ──────────────────────────────────────────
  // Build issues + score
  // ──────────────────────────────────────────
  const issues: Issue[] = [];
  let score = 100;

  // Word count — Thai targets are slightly lower (Thai is more compact per
  // word and translations typically run 80-90% of English word count).
  const minWords = lang === 'th' ? 1300 : 1500;
  const targetMinWords = lang === 'th' ? 1700 : 2000;
  const targetMaxWords = lang === 'th' ? 3000 : 3500;
  if (wordCount < minWords) {
    issues.push({
      severity: 'error',
      category: 'Length',
      message: `Article is only ${wordCount} words. Minimum is ${minWords}.`,
    });
    score -= 25;
  } else if (wordCount < targetMinWords) {
    issues.push({
      severity: 'warning',
      category: 'Length',
      message: `Article is ${wordCount} words. Below ${targetMinWords} — expand 1–2 sections.`,
    });
    score -= 10;
  } else if (wordCount > targetMaxWords) {
    issues.push({
      severity: 'warning',
      category: 'Length',
      message: `Article is ${wordCount} words — likely some repetition. Trim slightly.`,
    });
    score -= 5;
  }

  // H2 structure
  if (h2Count < 5) {
    issues.push({
      severity: 'error',
      category: 'Structure',
      message: `Only ${h2Count} H2 sections. Should have 6–8 (plus FAQ).`,
    });
    score -= 15;
  } else if (h2Count < 6) {
    issues.push({
      severity: 'warning',
      category: 'Structure',
      message: `${h2Count} H2 sections. Add 1–2 more for full topic coverage.`,
    });
    score -= 5;
  }

  // H3 usage
  if (h3Count === 0 && wordCount > 1500) {
    issues.push({
      severity: 'warning',
      category: 'Structure',
      message: 'No H3 subsections. Long sections are easier to scan with H3 sub-headings.',
    });
    score -= 5;
  }

  // Disallowed tags
  if (disallowedFound.length > 0) {
    issues.push({
      severity: 'error',
      category: 'HTML',
      message: `Disallowed tags found: ${disallowedFound.map((t) => `<${t}>`).join(', ')}.`,
    });
    score -= 15;
  }

  // Language: in English mode, Thai script is forbidden. In Thai mode,
  // Thai script is REQUIRED (a Thai post with no Thai chars is broken),
  // and inter-word ASCII spaces inside Thai prose are a translation bug.
  if (lang === 'en') {
    if (thaiCharsInBody > 0) {
      issues.push({
        severity: 'error',
        category: 'Language',
        message: `Found ${thaiCharsInBody} Thai characters in the English body. The English version must be 100% English.`,
      });
      score -= 20;
    }
  } else {
    if (thaiCharsInBody < 200) {
      issues.push({
        severity: 'error',
        category: 'Language',
        message: `Only ${thaiCharsInBody} Thai characters detected. The Thai version is missing or untranslated.`,
      });
      score -= 30;
    }
    if (thaiInterWordSpaces > 5) {
      issues.push({
        severity: 'error',
        category: 'Thai Spacing',
        message: `${thaiInterWordSpaces} suspect spaces between Thai words detected. Thai is written without inter-word spaces.`,
      });
      score -= 15;
    } else if (thaiInterWordSpaces > 0) {
      issues.push({
        severity: 'warning',
        category: 'Thai Spacing',
        message: `${thaiInterWordSpaces} possible inter-word spaces in Thai prose. Verify these aren't sentence breaks.`,
      });
      score -= 4;
    }
  }

  // Bolding density
  if (avgStrongPerParagraph > 2) {
    issues.push({
      severity: 'warning',
      category: 'Bolding',
      message: `Average ${avgStrongPerParagraph} <strong> per paragraph. Limit is 2 — drop low-impact bolds.`,
    });
    score -= 8;
  }

  // Filler phrases (English only — Thai version's filler list is different
  // and would need its own dictionary; skip for now)
  if (lang === 'en' && fillerHits.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'Voice',
      message: `Filler phrases found: "${fillerHits.slice(0, 3).join('", "')}"${fillerHits.length > 3 ? '…' : ''}. Remove or rewrite.`,
    });
    score -= 4 * Math.min(fillerHits.length, 4);
  }

  // Keyword stuffing — English only (Thai needs a real tokenizer)
  const stuffed = top.filter((k) => k.density > 2.5);
  if (lang === 'en' && stuffed.length > 0) {
    issues.push({
      severity: 'warning',
      category: 'Keyword Density',
      message: `Keyword stuffing risk: ${stuffed.map((k) => `"${k.word}" (${k.density}%)`).join(', ')}. Vary phrasing.`,
    });
    score -= 5 * stuffed.length;
  }

  // Site mentions — only check if SITE_MENTION_PATTERN is configured
  if (SITE_MENTION_PATTERN) {
    if (siteMentions === 0 && wordCount > 1500) {
      issues.push({
        severity: 'info',
        category: 'Internal Linking',
        message: `${SITE_NAME} is not mentioned. Add 1–2 natural references to the marketplace.`,
      });
      score -= 3;
    } else if (siteMentions > 4) {
      issues.push({
        severity: 'warning',
        category: 'Internal Linking',
        message: `${SITE_NAME} mentioned ${siteMentions} times — feels promotional. Cut to 1–2.`,
      });
      score -= 4;
    }
  }

  // FAQ section (Thai equivalent: คำถามที่พบบ่อย / FAQ)
  const hasFaq =
    /<h2[^>]*>\s*FAQ\b/i.test(html) ||
    /<h2[^>]*>.*frequently asked.*<\/h2>/i.test(html) ||
    /<h2[^>]*>[^<]*คำถามที่พบบ่อย[^<]*<\/h2>/i.test(html);
  if (!hasFaq && wordCount > minWords) {
    issues.push({
      severity: 'warning',
      category: 'Structure',
      message: 'No FAQ section detected. Add an FAQ block with 5 question-style H3s for featured snippets.',
    });
    score -= 6;
  }

  // ──────────────────────────────────────────
  // Suggestions (positive prompts)
  // ──────────────────────────────────────────
  const suggestions: string[] = [];
  if (h2Count >= 6 && h3Count >= 4) suggestions.push('Strong heading structure for SEO scannability.');
  if (wordCount >= targetMinWords && wordCount <= targetMaxWords)
    suggestions.push('Word count is in the sweet spot for ranking.');
  if (lang === 'en' && thaiCharsInBody === 0)
    suggestions.push('Clean English body — no Thai script bleed.');
  if (lang === 'th' && thaiCharsInBody >= 200 && thaiInterWordSpaces === 0)
    suggestions.push('Clean Thai prose — no inter-word spacing bugs.');
  if (lang === 'en' && fillerHits.length === 0)
    suggestions.push('No filler phrases — voice is direct.');
  if (SITE_MENTION_PATTERN && siteMentions >= 1 && siteMentions <= 2)
    suggestions.push(`Balanced ${SITE_NAME} mentions.`);

  // Final clamp + grade
  score = Math.max(0, Math.min(100, score));
  let grade: ScoreResult['grade'];
  if (score >= 90) grade = 'A';
  else if (score >= 80) grade = 'B';
  else if (score >= 70) grade = 'C';
  else if (score >= 60) grade = 'D';
  else grade = 'F';

  return {
    lang,
    score,
    grade,
    metrics: {
      wordCount,
      h2Count,
      h3Count,
      paragraphCount,
      strongCount,
      avgStrongPerParagraph,
      thaiCharsInBody,
      fillerPhrasesFound: fillerHits.length,
      siteMentions,
      thaiInterWordSpaces: lang === 'th' ? thaiInterWordSpaces : undefined,
      topKeywords: top,
    },
    issues,
    suggestions,
  };
}
