import { NextRequest, NextResponse } from 'next/server'

const ALPHABET = 'abcdefghijklmnopqrstuvwxyz'.split('')
const EN_MODIFIERS = ['best', 'cheap', 'used', 'new', 'review', 'price', 'vs', 'for sale', '2026']
const TH_MODIFIERS = ['ราคา', 'มือสอง', 'รีวิว', 'ดีไหม', 'ใหม่', 'ผ่อน']

async function fetchSuggestions(query: string, hl: 'en' | 'th'): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}&hl=${hl}&gl=th`
    const res = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      // Avoid Next.js fetch caching
      cache: 'no-store',
    })
    if (!res.ok) return []
    const data = await res.json()
    return Array.isArray(data?.[1]) ? (data[1] as string[]) : []
  } catch {
    return []
  }
}

export async function POST(request: NextRequest) {
  try {
    const { seed } = await request.json()

    if (!seed || typeof seed !== 'string') {
      return NextResponse.json({ error: 'seed is required' }, { status: 400 })
    }

    const trimmed = seed.trim()
    if (!trimmed) {
      return NextResponse.json({ error: 'seed is required' }, { status: 400 })
    }

    const enQueries = [
      trimmed,
      ...ALPHABET.map((c) => `${trimmed} ${c}`),
      ...EN_MODIFIERS.map((m) => `${m} ${trimmed}`),
    ]
    const thQueries = [trimmed, ...TH_MODIFIERS.map((m) => `${trimmed} ${m}`)]

    const [enResults, thResults] = await Promise.all([
      Promise.all(enQueries.map((q) => fetchSuggestions(q, 'en'))),
      Promise.all(thQueries.map((q) => fetchSuggestions(q, 'th'))),
    ])

    const enSet = new Set<string>()
    for (const arr of enResults) {
      for (const s of arr) {
        const cleaned = s.toLowerCase().trim()
        if (cleaned) enSet.add(cleaned)
      }
    }

    const thSet = new Set<string>()
    for (const arr of thResults) {
      for (const s of arr) {
        const cleaned = s.trim()
        if (cleaned && !enSet.has(cleaned.toLowerCase())) thSet.add(cleaned)
      }
    }

    const en = Array.from(enSet).sort()
    const th = Array.from(thSet).sort()

    return NextResponse.json({
      en,
      th,
      total: en.length + th.length,
    })
  } catch (error) {
    console.error('expand keywords error:', error)
    return NextResponse.json({ error: 'Failed to expand keywords' }, { status: 500 })
  }
}
