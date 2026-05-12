// Extract FAQ Q&A pairs from a blog body so the article page can emit
// FAQPage JSON-LD. Required by the May 2026 SEO audit for long-form
// trading-guide content per BLOG_STYLE_GUIDE.md §6.4.
//
// Convention enforced by BLOG_STYLE_GUIDE.md:
//   <h2>FAQ</h2>          (or "Frequently asked questions" — case-insensitive)
//   <h3>Question?</h3>
//   <p>Answer paragraph (50–100 words)</p>
//   <h3>Next question?</h3>
//   ...
//   <h2>Next section</h2>     ← closes the FAQ block
//
// Anything between an H3 and the next H3-or-H2 is the answer. We strip
// HTML tags from the answer for the schema (Google's FAQPage spec
// accepts plain text — adding HTML inflates payload without helping
// the rich result).

export type FaqEntry = { question: string; answer: string }

const FAQ_HEADING_PATTERN =
  /^\s*(faq|frequently\s+asked\s+questions?|часто\s+задаваемые\s+вопросы|вопросы\s+и\s+ответы|preguntas\s+frecuentes|câu\s+hỏi\s+thường\s+gặp|คำถามที่พบบ่อย|soalan\s+lazim|pertanyaan\s+umum|常见问题|常見問題|សំណួរញឹកញាប់)\s*[:：]?\s*$/i

export function extractFaqEntries(html: string): FaqEntry[] {
  // Find the FAQ H2 first. If none, no FAQ schema to emit.
  const faqHeading = findFaqHeading(html)
  if (faqHeading == null) return []

  // Slice from end of FAQ H2 to start of next H2 (or end of document).
  const sliceStart = faqHeading.endIndex
  const nextH2 = /<h2\b[^>]*>/i.exec(html.slice(sliceStart))
  const sliceEnd = nextH2 ? sliceStart + nextH2.index : html.length
  const block = html.slice(sliceStart, sliceEnd)

  // Walk H3s inside the FAQ block. Each H3's content = question; the
  // text between this H3 and the next H3 (or block end) = answer.
  const entries: FaqEntry[] = []
  const h3Re = /<h3\b[^>]*>([\s\S]*?)<\/h3>/gi
  const h3Positions: Array<{ end: number; q: string }> = []
  let m: RegExpExecArray | null
  while ((m = h3Re.exec(block)) !== null) {
    const q = stripTags(m[1]).trim()
    if (!q) continue
    h3Positions.push({ end: m.index + m[0].length, q })
  }

  for (let i = 0; i < h3Positions.length; i++) {
    const { end, q } = h3Positions[i]
    const stop = i + 1 < h3Positions.length
      ? // Start of next H3 — find its opening tag in the block.
        block.indexOf('<h3', end)
      : block.length
    const rawAnswer = block.slice(end, stop === -1 ? block.length : stop)
    const answer = stripTags(rawAnswer).replace(/\s+/g, ' ').trim()
    if (answer) entries.push({ question: q, answer })
  }

  return entries
}

export function buildFaqSchema(entries: FaqEntry[]): Record<string, unknown> | null {
  if (entries.length === 0) return null
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: entries.map((e) => ({
      '@type': 'Question',
      name: e.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: e.answer,
      },
    })),
  }
}

function findFaqHeading(html: string): { endIndex: number } | null {
  const h2Re = /<h2\b[^>]*>([\s\S]*?)<\/h2>/gi
  let m: RegExpExecArray | null
  while ((m = h2Re.exec(html)) !== null) {
    const text = stripTags(m[1])
    if (FAQ_HEADING_PATTERN.test(text)) {
      return { endIndex: m.index + m[0].length }
    }
  }
  return null
}

function stripTags(s: string): string {
  return s.replace(/<[^>]+>/g, '')
}
