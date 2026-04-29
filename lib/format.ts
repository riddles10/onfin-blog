// Small formatting helpers reused across the public blog surfaces.

export function formatDate(iso: string | null | undefined, locale = 'en-US'): string {
  if (!iso) return ''
  const d = iso.length === 10 ? new Date(iso + 'T00:00:00Z') : new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  }).format(d)
}

/**
 * Strip HTML and trim to a sentence-aware excerpt. Used as a fallback
 * when a post has no `excerpt_en` set.
 */
export function htmlToExcerpt(html: string, max = 180): string {
  const plain = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (plain.length <= max) return plain
  const clipped = plain.slice(0, max)
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 80 ? clipped.slice(0, lastSpace) : clipped).trim() + '…'
}

/**
 * Slug-safe id from a heading's text content. Used by the table of
 * contents to link H2s in the article body without round-tripping through
 * the DOM each time.
 */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}
