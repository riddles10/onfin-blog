import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

export default anthropic

// Default high-quality model for long-form prose, translations, listings.
export const MODEL = 'claude-sonnet-4-20250514'

// Faster, cheaper model for short structured tasks (outlines, clustering,
// keyword extraction). ~2–3× faster than Sonnet for the same prompt.
export const FAST_MODEL = 'claude-haiku-4-5'
