// Strip em-dashes (U+2014) from rendered article content. Em-dashes are
// the single most over-used LLM-tell and the editorial decision is to ban
// them site-wide. This runs at render time so old posts cleaned out via
// the one-shot migration AND any future imports stay clean without code
// changes downstream.
//
// Replacement strategy:
//   " — "  → ", "    (clause separator — the dominant case)
//   "X—Y"  → "X, Y"  (no-space variant; rare but seen in tables)
//   leading/trailing em-dash on a token → strip with surrounding space
//
// We also catch the three HTML entity forms (`&mdash;`, `&#8212;`,
// `&#x2014;`) because the AI generator occasionally emits entities
// rather than raw codepoints, and a few legacy Tilda imports carry
// them in body_en. Without this, an entity slips past the regex and
// lands in the rendered DOM as a U+2014 character.
//
// Note: we deliberately do NOT touch en-dashes (U+2013), which are used
// for numeric ranges ("1500–2200 words") and should be preserved.

const EM_DASH_PATTERN = /\s*(?:—|&mdash;|&#8212;|&#x2014;)\s*/g

export function stripEmDashes(input: string): string {
  if (!input) return input
  if (!EM_DASH_PATTERN.test(input)) return input
  EM_DASH_PATTERN.lastIndex = 0 // reset after `.test`
  return input.replace(EM_DASH_PATTERN, ', ')
}
