// Pull a TL;DR paragraph out of an article's body HTML so the page can
// render it as a styled callout instead of a plain bold-prefixed sentence.
//
// We scan only the chunk before the first <h2> (article intro region) and
// look for the first <p> whose text starts with TL;DR / TL:DR / TLDR. The
// label and any wrapping <strong>/<b> are stripped so the callout owns
// the eyebrow; the remaining inner HTML becomes the callout body.

const TLDR_PARAGRAPH =
  /<p\b[^>]*>([\s\S]*?)<\/p>/i

const TLDR_PREFIX =
  /^\s*(?:<(?:strong|b)\b[^>]*>\s*)?TL[\s;:]?DR\b[.:;]?\s*(?:<\/(?:strong|b)>)?\s*/i

export function extractTldr(html: string): { tldr: string | null; body: string } {
  if (!html) return { tldr: null, body: html }

  const h2Idx = html.search(/<h2\b/i)
  const head = h2Idx >= 0 ? html.slice(0, h2Idx) : html

  let cursor = 0
  while (cursor < head.length) {
    const slice = head.slice(cursor)
    const m = slice.match(TLDR_PARAGRAPH)
    if (!m) break
    const matchStart = cursor + (m.index ?? 0)
    const matchEnd = matchStart + m[0].length
    const inner = m[1]
    if (TLDR_PREFIX.test(inner)) {
      const stripped = inner.replace(TLDR_PREFIX, '').trim()
      if (stripped) {
        const body = html.slice(0, matchStart) + html.slice(matchEnd)
        return { tldr: stripped, body }
      }
    }
    cursor = matchEnd
  }

  return { tldr: null, body: html }
}
