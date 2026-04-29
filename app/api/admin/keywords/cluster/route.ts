import { NextRequest, NextResponse } from 'next/server'
import anthropic, { MODEL } from '@/lib/anthropic'
import { SITE_NAME, POST_CATEGORIES } from '@/lib/cms-config'

// Clustering is a single Sonnet call that takes 10-30s typically. Bump to 120s
// on Vercel Pro to absorb slow Anthropic responses without killing the request.
export const maxDuration = 120

const SYSTEM_PROMPT = `You are an SEO strategist for ${SITE_NAME}.
You are given a raw list of search keywords (mix of English and Thai) related to the site's niche.

Group them into 3-7 article topic clusters. For each cluster, provide:
- A primary keyword (the most valuable search term in the cluster)
- 3-6 secondary keywords from the list that belong to this cluster
- The dominant search intent: "informational" | "commercial" | "transactional" | "navigational"
- A suggested blog article title in English, optimized for this cluster
- The best blog category from this exact set: ${POST_CATEGORIES.join(', ')}
- A brief reason why this cluster matters (1 sentence)

Return ONLY valid JSON (no markdown, no code fences) with this exact structure:
{
  "clusters": [
    {
      "primary": "example keyword",
      "secondary": ["related keyword 1", "related keyword 2"],
      "intent": "commercial",
      "article_title": "Example Article Title",
      "category": "${POST_CATEGORIES[0]}",
      "reason": "High commercial intent -- readers are ready to take action."
    }
  ]
}`

export async function POST(request: NextRequest) {
  try {
    const { keywords } = await request.json()

    if (!Array.isArray(keywords) || keywords.length === 0) {
      return NextResponse.json({ error: 'keywords array required' }, { status: 400 })
    }

    const prompt = `Cluster these keywords into article topics:\n\n${keywords.join('\n')}`

    const response = await anthropic.messages.create({
      model: MODEL,
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: prompt }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'No response from AI' }, { status: 500 })
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(textBlock.text.trim())
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 })
    }

    return NextResponse.json(parsed)
  } catch (error) {
    console.error('cluster keywords error:', error)
    return NextResponse.json({ error: 'Failed to cluster keywords' }, { status: 500 })
  }
}
