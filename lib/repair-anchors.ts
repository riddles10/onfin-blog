/**
 * repairAnchors — sanitize anchor tags in article HTML so a link can never
 * bleed across block boundaries.
 *
 * The AI / machine-translation step sometimes drops an `</a>` or extends an
 * anchor past its sentence, leaving an unbalanced `<a>` in a translated body.
 * The browser then renders every following paragraph/heading as part of the
 * link (whole paragraphs turn blue + underlined — see Asana 1215116376756788).
 *
 * This pass walks the HTML and enforces two invariants:
 *   1. An open `<a>` is force-closed before any block-level tag (`<p>`, `<h2>`,
 *      `<li>`, `<br>`, …) — so a link is confined to a single block and can
 *      never bleed into the next paragraph.
 *   2. Anchor open/close tags balance — a dangling open is closed at the next
 *      block boundary (or end of input); an orphan `</a>` is dropped.
 *
 * Inline tags (`<strong>`, `<em>`, `<code>`) are left untouched inside anchors.
 * English bodies are already clean, so running this on them is a no-op.
 */

const ANCHOR_OPEN = /^<a\b/i
const ANCHOR_CLOSE = /^<\/a\s*>/i
const BLOCK_TAG =
  /^<\/?(?:p|h[1-6]|ul|ol|li|blockquote|pre|table|thead|tbody|tfoot|tr|td|th|div|section|article|aside|header|footer|figure|figcaption|hr|br)\b/i

export function repairAnchors(html: string): string {
  if (!html || !html.includes('<a')) return html

  // Split into tokens, keeping tags as their own tokens.
  const tokens = html.split(/(<[^>]+>)/)
  let out = ''
  let inAnchor = false

  for (const tok of tokens) {
    if (!tok) continue
    if (tok[0] !== '<') {
      out += tok // text node
      continue
    }
    if (ANCHOR_OPEN.test(tok)) {
      if (inAnchor) out += '</a>' // close a dangling anchor before a new one
      out += tok
      inAnchor = true
    } else if (ANCHOR_CLOSE.test(tok)) {
      if (inAnchor) {
        out += tok
        inAnchor = false
      }
      // else: orphan </a> — drop it
    } else if (BLOCK_TAG.test(tok)) {
      if (inAnchor) {
        out += '</a>' // a link must not span a block boundary
        inAnchor = false
      }
      out += tok
    } else {
      out += tok // inline tag — fine inside an anchor
    }
  }
  if (inAnchor) out += '</a>'
  return out
}
