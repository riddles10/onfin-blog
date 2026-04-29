'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { POST_CATEGORIES, SITE_NAME } from '@/lib/cms-config'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

type QaIssue = {
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
}

type QaResult = {
  lang: 'en' | 'th'
  score: number
  grade: 'A' | 'B' | 'C' | 'D' | 'F'
  metrics: {
    wordCount: number
    h2Count: number
    h3Count: number
    paragraphCount: number
    strongCount: number
    avgStrongPerParagraph: number
    thaiCharsInBody: number
    fillerPhrasesFound: number
    s3Mentions: number
    thaiInterWordSpaces?: number
    topKeywords: Array<{ word: string; count: number; density: number }>
  }
  issues: QaIssue[]
  suggestions: string[]
}

type PostData = {
  id?: string
  slug: string
  title_en: string
  title_th: string
  body_en: string
  body_th: string
  excerpt_en: string
  excerpt_th: string
  category: string
  cover_image: string
  published: boolean
  published_at: string | null
  blog_author_id: string | null
}

type AuthorOption = {
  id: string
  name: string
  is_default: boolean
}

const emptyPost: PostData = {
  slug: '',
  title_en: '',
  title_th: '',
  body_en: '',
  body_th: '',
  excerpt_en: '',
  excerpt_th: '',
  category: POST_CATEGORIES[0],
  cover_image: '',
  published: false,
  published_at: null,
  blog_author_id: null,
}

export default function BlogEditor({ initialData }: { initialData?: PostData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditing = !!initialData?.id
  const [post, setPost] = useState<PostData>(() => {
    if (initialData) return initialData
    const category = searchParams?.get('category')
    return category ? { ...emptyPost, category } : emptyPost
  })
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'th'>('en')
  const [error, setError] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateTopic, setGenerateTopic] = useState('')
  const [generateKeywords, setGenerateKeywords] = useState('')
  const [generating, setGenerating] = useState(false)
  const [qa, setQa] = useState<QaResult | null>(null)
  const [qaLoading, setQaLoading] = useState(false)
  // "Add Images" flow — populates cover_image + injects inline <img> tags
  // into the body after the first few H2 sections, all from Unsplash.
  const [imagesState, setImagesState] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle')
  const [imagesMessage, setImagesMessage] = useState('')
  // Manual cover-image upload (jpg/png/gif → /api/upload → Supabase public URL).
  // Separate from the Unsplash "Add Images" flow so authors can use a hand-shot
  // or custom graphic without leaving the editor.
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const [coverUploading, setCoverUploading] = useState(false)
  // Authors dropdown — loaded once on mount from /api/admin/authors.
  // New posts default to the flagged "default" author so the operator
  // doesn't have to pick one every time.
  const [authors, setAuthors] = useState<AuthorOption[]>([])

  useEffect(() => {
    if (isEditing) return
    const topic = searchParams?.get('topic')
    const keywords = searchParams?.get('keywords')
    if (topic || keywords) {
      if (topic) setGenerateTopic(topic)
      if (keywords) setGenerateKeywords(keywords)
      setGenerateOpen(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    // Fetch authors for the byline dropdown. Fire-and-forget — if this
    // fails the user can still save, the cron default will kick in later.
    fetch('/api/admin/authors')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ id: string; name: string; is_default: boolean }>) => {
        setAuthors(data || [])
        // For new posts, pre-select the default author so the byline is
        // never empty on a fresh draft.
        if (!isEditing && !post.blog_author_id) {
          const def = (data || []).find((a) => a.is_default)
          if (def) {
            setPost((prev) => ({ ...prev, blog_author_id: def.id }))
          }
        }
      })
      .catch(() => {
        // ignore — authors are a nice-to-have, not a hard requirement
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const update = (field: keyof PostData, value: string | boolean | null) => {
    setPost((prev) => ({ ...prev, [field]: value }))
  }

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleTitleChange = (value: string) => {
    update('title_en', value)
    if (!isEditing && !post.slug) {
      update('slug', generateSlug(value))
    }
  }

  const translateField = async (field: 'title' | 'body' | 'excerpt') => {
    const sourceField = `${field}_en` as keyof PostData
    const sourceText = post[sourceField] as string
    if (!sourceText) return

    setTranslating(field)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLang: 'th',
          context: 'blog',
        }),
      })
      if (res.ok) {
        const translated = await res.text()
        const targetField = `${field}_th` as keyof PostData
        update(targetField, translated)
      }
    } catch {
      // ignore
    } finally {
      setTranslating(null)
    }
  }

  // Translate title, excerpt, and body to Thai in PARALLEL. Sending these
  // as three concurrent fetches cuts the wall time roughly in 1/3 vs the
  // old sequential loop. The translate route auto-chunks the body by H2
  // boundaries internally, so even a 2500-word body returns in ~15s.
  const translateAll = async () => {
    setTranslating('all')
    setError('')
    const fields: Array<{ key: 'title' | 'excerpt' | 'body'; ctx: 'blog' | 'listing' }> = [
      { key: 'title', ctx: 'listing' },
      { key: 'excerpt', ctx: 'listing' },
      { key: 'body', ctx: 'blog' },
    ]

    type TranslateResult = {
      key: 'title' | 'excerpt' | 'body'
      status: 'ok' | 'skipped' | 'error'
      translated?: string
      error?: string
    }

    const calls: Promise<TranslateResult>[] = fields.map(async ({ key, ctx }): Promise<TranslateResult> => {
      const sourceText = post[`${key}_en` as keyof PostData] as string
      if (!sourceText) return { key, status: 'skipped' }
      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: sourceText, targetLang: 'th', context: ctx }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `HTTP ${res.status}`)
        }
        const translated = await res.text()
        return { key, status: 'ok', translated }
      } catch (err) {
        return { key, status: 'error', error: err instanceof Error ? err.message : 'failed' }
      }
    })

    const results = await Promise.all(calls)

    // Apply all successful results in a single setState so React renders once.
    setPost((prev) => {
      const next = { ...prev }
      for (const r of results) {
        if (r.status === 'ok' && r.translated) {
          ;(next as Record<string, unknown>)[`${r.key}_th`] = r.translated.trim()
        }
      }
      return next
    })

    const failures = results.filter((r) => r.status === 'error')
    if (failures.length > 0) {
      const summary = failures.map((f) => `${f.key}: ${f.error}`).join(', ')
      setError(`Translate failed for: ${summary}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setTranslating(null)
  }

  const runQa = async (html: string, lang: 'en' | 'th' = 'en') => {
    if (!html || !html.trim()) {
      setQa(null)
      return
    }
    setQaLoading(true)
    try {
      const res = await fetch('/api/ai/score-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html, lang }),
      })
      if (res.ok) {
        const data = (await res.json()) as QaResult
        setQa(data)
      }
    } catch {
      // ignore — QA is best-effort
    } finally {
      setQaLoading(false)
    }
  }

  const handleGenerate = async () => {
    if (!generateTopic.trim()) return
    setGenerating(true)
    setError('')

    // Hard timeout in case the serverless function hangs (Vercel max is 60s,
    // but two-stage generation may approach that on slow runs).
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 80_000)

    try {
      const keywords = generateKeywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)
      const res = await fetch('/api/ai/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: generateTopic, category: post.category, keywords }),
        signal: controller.signal,
      })
      if (res.ok) {
        const data = await res.json()
        setPost((prev) => ({
          ...prev,
          title_en: data.title_en,
          slug: data.slug,
          excerpt_en: data.excerpt_en,
          body_en: data.body_en,
        }))
        setGenerateOpen(false)
        // Auto-run QA on the freshly generated body so the writer
        // immediately sees structure / length / Thai-bleed issues.
        runQa(data.body_en)
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Failed to generate post (HTTP ${res.status})`)
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    } catch (err) {
      const msg = err instanceof Error && err.name === 'AbortError'
        ? 'Generation timed out after 80s. Try a narrower topic or retry.'
        : 'Failed to generate post (network error)'
      setError(msg)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } finally {
      clearTimeout(timeoutId)
      setGenerating(false)
    }
  }

  // Stash the current draft into sessionStorage and open the preview page
  // in a named tab so re-clicking Preview reuses the same window. The
  // preview page polls sessionStorage every ~1.5s so it stays in sync as
  // the operator continues editing.
  const handlePreview = () => {
    const draft = {
      slug: post.slug,
      title_en: post.title_en,
      title_th: post.title_th,
      body_en: post.body_en,
      body_th: post.body_th,
      excerpt_en: post.excerpt_en,
      excerpt_th: post.excerpt_th,
      category: post.category,
      cover_image: post.cover_image,
    }
    try {
      sessionStorage.setItem('cms-blog-preview', JSON.stringify(draft))
    } catch {
      // sessionStorage can throw if quota is exceeded — fall through to open anyway
    }
    window.open('/admin/blog/preview', 'cms-blog-preview')
  }

  // Fetch a cover image from the article title and inject up to 3 inline
  // images after the first few H2 sections in the English body. We work on
  // the English body only — the Thai translation is auto-generated later
  // and the <img> tags carry over verbatim during translation.
  const handleAddImages = async () => {
    const titleSeed = post.title_en.trim() || generateTopic.trim()
    if (!titleSeed) {
      setImagesState('error')
      setImagesMessage('Add a title first so we know what to search for.')
      setTimeout(() => setImagesState('idle'), 3000)
      return
    }

    setImagesState('fetching')
    setImagesMessage('Fetching cover image…')
    let coverSet = false
    let inlineAdded = 0

    try {
      // 1. Cover image — based on the title.
      if (!post.cover_image) {
        const coverRes = await fetch('/api/admin/unsplash', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: titleSeed, count: 1 }),
        })
        if (coverRes.ok) {
          const data = await coverRes.json()
          const cover = data.images?.[0]
          if (cover?.url) {
            setPost((prev) => ({ ...prev, cover_image: cover.url }))
            coverSet = true
          }
        }
      }

      // 2. Inline images — one per H2 in the body, capped at 3 to stay
      // well under the Unsplash free-tier 50 req/hour limit and to keep
      // the article from feeling like a stock-photo gallery.
      if (post.body_en) {
        setImagesMessage('Fetching inline images…')
        // Parse the body to extract <h2> headings (and their positions).
        const parser = new DOMParser()
        const doc = parser.parseFromString(`<div id="root">${post.body_en}</div>`, 'text/html')
        const root = doc.getElementById('root')
        const h2s = root ? Array.from(root.querySelectorAll('h2')).slice(0, 3) : []

        for (const h2 of h2s) {
          // Skip the FAQ section — a stock photo there looks weird.
          const headingText = (h2.textContent || '').trim()
          if (!headingText || /^faq/i.test(headingText)) continue

          // Skip if there's already an <img> right after this h2 (idempotent).
          let next: Element | null = h2.nextElementSibling
          // Walk past empty <p> nodes
          while (next && next.tagName === 'P' && (next.textContent || '').trim() === '') {
            next = next.nextElementSibling
          }
          if (next && next.tagName === 'IMG') continue

          const res = await fetch('/api/admin/unsplash', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ query: headingText, count: 1 }),
          })
          if (!res.ok) continue
          const data = await res.json()
          const img = data.images?.[0]
          if (!img?.url) continue

          // Build an <img> element and insert it directly after the H2.
          const imgEl = doc.createElement('img')
          imgEl.setAttribute('src', img.url)
          imgEl.setAttribute('alt', img.altText || headingText)
          h2.parentNode?.insertBefore(imgEl, h2.nextSibling)
          inlineAdded++
        }

        if (inlineAdded > 0 && root) {
          // Re-serialize the body so the editor picks up the new images.
          const updatedHtml = root.innerHTML
          setPost((prev) => ({ ...prev, body_en: updatedHtml }))
        }
      }

      const parts: string[] = []
      if (coverSet) parts.push('cover image set')
      if (inlineAdded > 0) parts.push(`${inlineAdded} inline image${inlineAdded === 1 ? '' : 's'} added`)
      if (parts.length === 0) {
        setImagesState('error')
        setImagesMessage(post.cover_image && !post.body_en ? 'Cover already set. Add body content first.' : 'No images found.')
      } else {
        setImagesState('done')
        setImagesMessage(parts.join(', '))
      }
    } catch (err) {
      setImagesState('error')
      setImagesMessage(err instanceof Error ? err.message : 'Failed to fetch images')
    } finally {
      setTimeout(() => setImagesState('idle'), 4000)
    }
  }

  // Manual cover image upload — shares the /api/upload endpoint with the
  // RichTextEditor's inline image button. On success the returned public
  // URL is written straight into post.cover_image so the preview updates.
  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    // Reset so the same file can be re-picked after an error
    e.target.value = ''
    if (!file) return

    const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/gif']
    if (!ALLOWED_MIME.includes(file.type)) {
      alert('Only JPG, PNG, and GIF images are supported.')
      return
    }
    const MAX_SIZE = 10 * 1024 * 1024
    if (file.size > MAX_SIZE) {
      alert('Image must be under 10 MB.')
      return
    }

    setCoverUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/upload', { method: 'POST', body: formData })
      const data = await res.json()
      if (!res.ok || !data.url) {
        alert(data.error || 'Upload failed')
        return
      }
      update('cover_image', data.url)
    } catch (err) {
      console.error('Cover upload failed:', err)
      alert('Upload failed — check your connection and try again.')
    } finally {
      setCoverUploading(false)
    }
  }

  const handleSave = async (publish?: boolean) => {
    setError('')
    if (!post.title_en || !post.slug) {
      setError('Title and slug are required.')
      return
    }

    setSaving(true)
    const payload = {
      ...post,
      published: publish !== undefined ? publish : post.published,
      published_at: publish ? new Date().toISOString() : post.published_at,
    }

    try {
      const url = isEditing ? `/api/admin/blog/${post.id}` : '/api/admin/blog'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        router.push('/admin/blog')
        router.refresh()
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to save')
      }
    } catch {
      setError('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Generate with AI */}
      <div className="mb-5 border border-blue-200 rounded-lg overflow-hidden">
        <button
          type="button"
          onClick={() => setGenerateOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 bg-blue-50 hover:bg-blue-100 transition-colors text-sm font-semibold text-blue-800"
        >
          <span>Generate with AI</span>
          <span className="text-blue-500 text-xs">{generateOpen ? 'Hide' : 'Expand'}</span>
        </button>
        {generateOpen && (
          <div className="px-4 py-4 bg-white space-y-3">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Topic / Title idea</label>
              <input
                type="text"
                value={generateTopic}
                onChange={(e) => setGenerateTopic(e.target.value)}
                placeholder="e.g. Best practices for getting started in 2026"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">SEO Keywords <span className="font-normal text-gray-400">(comma-separated, optional)</span></label>
              <input
                type="text"
                value={generateKeywords}
                onChange={(e) => setGenerateKeywords(e.target.value)}
                placeholder="e.g. keyword one, keyword two, keyword three"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
            </div>
            <p className="text-xs text-gray-400">Category is taken from the field below. After generating, review and then translate to Thai.</p>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generating || !generateTopic.trim()}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {generating ? 'Generating (~40s)...' : 'Generate Post'}
            </button>
          </div>
        )}
      </div>

      {/* QA Panel — auto-runs after generate, can be re-run manually */}
      {(qa || qaLoading) && (
        <div className="mb-5 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">SEO QA</span>
              {qa && (
                <span
                  className={`inline-flex items-center justify-center text-xs font-bold px-2 py-0.5 rounded ${
                    qa.grade === 'A'
                      ? 'bg-green-100 text-green-800'
                      : qa.grade === 'B'
                      ? 'bg-emerald-100 text-emerald-800'
                      : qa.grade === 'C'
                      ? 'bg-yellow-100 text-yellow-800'
                      : qa.grade === 'D'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {qa.grade} · {qa.score}/100
                </span>
              )}
              {qaLoading && <span className="text-xs text-gray-500">Scoring…</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => runQa(post.body_en, 'en')}
                disabled={qaLoading || !post.body_en}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold disabled:opacity-40"
              >
                Score EN
              </button>
              <span className="text-gray-300">|</span>
              <button
                type="button"
                onClick={() => runQa(post.body_th, 'th')}
                disabled={qaLoading || !post.body_th}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold disabled:opacity-40"
              >
                Score TH
              </button>
            </div>
          </div>
          {qa && (
            <div className="px-4 py-3 space-y-3">
              {/* Metrics row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <Metric label="Words" value={qa.metrics.wordCount} target="2200+" ok={qa.metrics.wordCount >= 2000} />
                <Metric label="H2" value={qa.metrics.h2Count} target="6–8" ok={qa.metrics.h2Count >= 6} />
                <Metric label="H3" value={qa.metrics.h3Count} target="≥4" ok={qa.metrics.h3Count >= 4} />
                <Metric
                  label="Bold/¶"
                  value={qa.metrics.avgStrongPerParagraph}
                  target="≤2"
                  ok={qa.metrics.avgStrongPerParagraph <= 2}
                />
                <Metric label="Thai chars" value={qa.metrics.thaiCharsInBody} target="0" ok={qa.metrics.thaiCharsInBody === 0} />
                <Metric label="Filler" value={qa.metrics.fillerPhrasesFound} target="0" ok={qa.metrics.fillerPhrasesFound === 0} />
                <Metric label="Site mentions" value={qa.metrics.s3Mentions} target="1–2" ok={qa.metrics.s3Mentions >= 1 && qa.metrics.s3Mentions <= 2} />
                <Metric label="Paragraphs" value={qa.metrics.paragraphCount} target="—" ok={true} />
              </div>

              {/* Issues */}
              {qa.issues.length > 0 && (
                <div className="space-y-1.5">
                  {qa.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`text-xs px-3 py-2 rounded border-l-4 ${
                        issue.severity === 'error'
                          ? 'bg-red-50 border-red-400 text-red-800'
                          : issue.severity === 'warning'
                          ? 'bg-yellow-50 border-yellow-400 text-yellow-800'
                          : 'bg-blue-50 border-blue-400 text-blue-800'
                      }`}
                    >
                      <span className="font-semibold mr-1">{issue.category}:</span>
                      {issue.message}
                    </div>
                  ))}
                </div>
              )}

              {/* Suggestions */}
              {qa.suggestions.length > 0 && (
                <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                  {qa.suggestions.map((s, i) => (
                    <span key={i}>✓ {s}</span>
                  ))}
                </div>
              )}

              {/* Top keywords */}
              {qa.metrics.topKeywords.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Top non-stopword density:</div>
                  <div className="flex flex-wrap gap-1.5">
                    {qa.metrics.topKeywords.slice(0, 8).map((k) => (
                      <span
                        key={k.word}
                        className={`text-xs px-2 py-0.5 rounded font-mono ${
                          k.density > 1.8
                            ? 'bg-red-100 text-red-800'
                            : k.density > 1.2
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {k.word} {k.count}× ({k.density}%)
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Title (English)</label>
          <input
            type="text"
            value={post.title_en}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Article title..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Slug</label>
          <input
            type="text"
            value={post.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="article-slug"
          />
        </div>
      </div>

      {/* Category & Cover Image */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Category</label>
          <select
            value={post.category}
            onChange={(e) => update('category', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          >
            {POST_CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1).replace(/-/g, ' ')}
              </option>
            ))}
          </select>
          <div className="mt-3">
            <label className="block text-sm font-semibold mb-1">Author</label>
            <select
              value={post.blog_author_id || ''}
              onChange={(e) => update('blog_author_id', e.target.value || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              <option value="">— No byline —</option>
              {authors.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                  {a.is_default ? ' ⭐' : ''}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">
              <a href="/admin/authors" target="_blank" rel="noreferrer" className="text-primary hover:underline">
                Manage authors →
              </a>
            </p>
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-1 gap-2">
            <label className="block text-sm font-semibold">Cover Image</label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => !coverUploading && coverFileInputRef.current?.click()}
                disabled={coverUploading}
                className="text-xs font-semibold text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
                title="Upload a JPG / PNG / GIF from your computer"
              >
                {coverUploading ? 'Uploading…' : '+ Upload'}
              </button>
              <button
                type="button"
                onClick={handleAddImages}
                disabled={imagesState === 'fetching'}
                className={`text-xs font-semibold transition-colors disabled:opacity-50 ${
                  imagesState === 'done'
                    ? 'text-green-700'
                    : imagesState === 'error'
                    ? 'text-red-700'
                    : 'text-primary hover:text-primary-dark'
                }`}
                title="Fetch a cover image from Unsplash + insert inline images after the first 3 H2 sections"
              >
                {imagesState === 'fetching' && 'Fetching…'}
                {imagesState === 'done' && `✓ ${imagesMessage}`}
                {imagesState === 'error' && `✗ ${imagesMessage}`}
                {imagesState === 'idle' && '+ Add Images'}
              </button>
            </div>
          </div>
          {/* Hidden file input — triggered by the "+ Upload" button above. */}
          <input
            ref={coverFileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,.jpg,.jpeg,.png,.gif"
            className="hidden"
            onChange={handleCoverUpload}
          />
          <input
            type="text"
            value={post.cover_image}
            onChange={(e) => update('cover_image', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Paste a URL or click + Upload"
          />
          {post.cover_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.cover_image}
              alt="Cover preview"
              className="mt-2 w-full h-24 object-cover rounded-lg border border-gray-200"
            />
          )}
        </div>
      </div>

      {/* Excerpt */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold">Excerpt (English)</label>
          <button
            type="button"
            onClick={() => translateField('excerpt')}
            disabled={!!translating}
            className="text-xs text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
          >
            {translating === 'excerpt' ? 'Translating...' : 'Translate to Thai'}
          </button>
        </div>
        <textarea
          value={post.excerpt_en}
          onChange={(e) => update('excerpt_en', e.target.value)}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Short summary for listing cards..."
        />
        {post.excerpt_th && (
          <div className="mt-1">
            <label className="text-xs text-gray-500">Thai excerpt:</label>
            <textarea
              value={post.excerpt_th}
              onChange={(e) => update('excerpt_th', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm resize-none bg-gray-50"
            />
          </div>
        )}
      </div>

      {/* Thai Title */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold">Title (Thai)</label>
          <button
            type="button"
            onClick={() => translateField('title')}
            disabled={!!translating}
            className="text-xs text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
          >
            {translating === 'title' ? 'Translating...' : 'Translate to Thai'}
          </button>
        </div>
        <input
          type="text"
          value={post.title_th}
          onChange={(e) => update('title_th', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Thai title (auto-translate or type manually)"
        />
      </div>

      {/* Body Editor with EN/TH tabs */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1 border border-gray-300 rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setActiveTab('en')}
              className={`px-4 py-1.5 text-sm font-heading font-semibold transition-colors ${
                activeTab === 'en' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('th')}
              className={`px-4 py-1.5 text-sm font-heading font-semibold transition-colors ${
                activeTab === 'th' ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Thai
            </button>
          </div>
          <button
            type="button"
            onClick={translateAll}
            disabled={!!translating}
            className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
          >
            {translating === 'all' ? 'Translating all fields...' : 'Translate all to Thai'}
          </button>
        </div>

        {activeTab === 'en' ? (
          <RichTextEditor
            content={post.body_en}
            onChange={(html) => update('body_en', html)}
            placeholder="Write your article in English..."
          />
        ) : (
          <RichTextEditor
            content={post.body_th}
            onChange={(html) => update('body_th', html)}
            placeholder="เขียนบทความภาษาไทย..."
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={saving}
          className="px-6 py-2.5 border border-gray-300 rounded-lg font-heading font-semibold text-sm uppercase hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save as Draft'}
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={!post.title_en && !post.body_en}
          className="px-6 py-2.5 border border-blue-300 text-blue-700 rounded-lg font-heading font-semibold text-sm uppercase hover:bg-blue-50 transition-colors disabled:opacity-50"
          title="Open the article in a new tab as it will appear on the public site"
        >
          Preview
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving}
          className="bg-primary text-white font-heading font-semibold text-sm uppercase px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Publishing...' : post.published ? 'Update & Publish' : 'Publish'}
        </button>
        <button
          type="button"
          onClick={() => router.push('/admin/blog')}
          className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function Metric({
  label,
  value,
  target,
  ok,
}: {
  label: string
  value: number | string
  target: string
  ok: boolean
}) {
  return (
    <div
      className={`px-2 py-1.5 rounded border ${
        ok ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
      }`}
    >
      <div className="text-[10px] uppercase tracking-wide text-gray-500">{label}</div>
      <div className={`text-sm font-semibold ${ok ? 'text-gray-800' : 'text-red-700'}`}>
        {value} <span className="text-[10px] text-gray-400 font-normal">/ {target}</span>
      </div>
    </div>
  )
}
