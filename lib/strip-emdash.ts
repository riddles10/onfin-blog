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
// Note: we deliberately do NOT touch en-dashes (U+2013), which are used
// for numeric ranges ("1500–2200 words") and should be preserved.

const EM_DASH_WITH_SURROUNDING_SPACE = /\s*—\s*/g

export function stripEmDashes(input: string): string {
  if (!input) return input
  if (!input.includes('—')) return input
  return input.replace(EM_DASH_WITH_SURROUNDING_SPACE, ', ')
}
