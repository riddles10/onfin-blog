import { slugifyHeading } from '@/lib/format'

// Walk an article's HTML, decorate every <h2> with a stable `id`, and
// return the list of headings paired with their ids so the TOC can
// scroll-link to them. Run server-side so the rendered HTML and the TOC
// are in sync from the first byte.
//
// Deliberately regex-based (no JSDOM) to keep the server bundle light —
// the imported HTML uses a narrow tag subset (the prose-blog rules in
// globals.css enumerate it), so a regex is sufficient.

export type TocItem = { id: string; label: string }

export function annotateH2s(html: string): { html: string; items: TocItem[] } {
  const items: TocItem[] = []
  const seen = new Set<string>()

  const out = html.replace(
    /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi,
    (_match, attrs: string | undefined, inner: string) => {
      const text = inner.replace(/<[^>]+>/g, '').trim()
      if (!text) return _match

      let base = slugifyHeading(text)
      if (!base) base = `section-${items.length + 1}`
      let id = base
      let i = 2
      while (seen.has(id)) {
        id = `${base}-${i++}`
      }
      seen.add(id)
      items.push({ id, label: text })

      // If the original tag already carried an id, respect it; otherwise
      // inject ours.
      const attrString = attrs ?? ''
      if (/\sid=["']/i.test(attrString)) {
        return `<h2${attrString}>${inner}</h2>`
      }
      // `scroll-mt-24` keeps the heading clear of the sticky header when
      // the user clicks a TOC link — Tailwind's scroll-margin utility.
      return `<h2 id="${id}" class="scroll-mt-24"${attrString}>${inner}</h2>`
    }
  )

  return { html: out, items }
}
