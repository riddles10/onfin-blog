'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { POST_CATEGORIES, POST_TYPES } from '@/lib/cms-config'
import {
  SUPPORTED_LOCALES,
  LOCALE_NAMES,
  DEFAULT_LOCALE,
  type Locale,
} from '@/lib/locales'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

type QaIssue = {
  severity: 'error' | 'warning' | 'info'
  category: string
  message: string
}

type QaResult = {
  lang: Locale
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
    siteMentions: number
    thaiInterWordSpaces?: number
    topKeywords: Array<{ word: string; count: number; density: number }>
  }
  issues: QaIssue[]
  suggestions: string[]
}

// English fields live canonically on `posts`. Legacy `title_th` / `body_th`
// / `excerpt_th` columns are kept in this shape so they pass through the
// PUT handler unchanged (soft migration — see the TH-tab read fallback in
// `getLocaleContent`).
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
  post_type: string
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

type TranslationRow = {
  locale: Exclude<Locale, 'en'>
  title: string
  body: string
  excerpt: string | null
  source: 'manual' | 'ai' | 'imported'
  qa_score: number | null
  updated_at: string | null
  dirty: boolean
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
  post_type: 'article',
  cover_image: '',
  published: false,
  published_at: null,
  blog_author_id: null,
}

function emptyTranslation(locale: Exclude<Locale, 'en'>): TranslationRow {
  return {
    locale,
    title: '',
    body: '',
    excerpt: null,
    source: 'manual',
    qa_score: null,
    updated_at: null,
    dirty: false,
  }
}

export default function BlogEditor({ initialData }: { initialData?: PostData }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const isEditing = !!initialData?.id
  const [post, setPost] = useState<PostData>(() => {
    if (initialData) return { ...emptyPost, ...initialData }
    const category = searchParams?.get('category')
    return category ? { ...emptyPost, category } : emptyPost
  })
  const [saving, setSaving] = useState(false)
  // `translating` is "<locale>:<field>" while a single-field call is in-flight,
  // or "<locale>:all" while the bulk translate-all is running.
  const [translating, setTranslating] = useState<string | null>(null)
  const [activeLocale, setActiveLocale] = useState<Locale>(DEFAULT_LOCALE)
  const [error, setError] = useState('')
  const [generateOpen, setGenerateOpen] = useState(false)
  const [generateTopic, setGenerateTopic] = useState('')
  const [generateKeywords, setGenerateKeywords] = useState('')
  const [generating, setGenerating] = useState(false)
  const [qa, setQa] = useState<QaResult | null>(null)
  const [qaLoading, setQaLoading] = useState(false)
  // Translations for every non-English locale. Hydrated once on mount from
  // /api/admin/blog/[id]/translations. Locales without a row in the pivot
  // table fall back to legacy `posts.*_th` (Thai only) or stay empty.
  const [translations, setTranslations] = useState<
    Record<Exclude<Locale, 'en'>, TranslationRow>
  >(() => {
    const init: Partial<Record<Exclude<Locale, 'en'>, TranslationRow>> = {}
    for (const loc of SUPPORTED_LOCALES) {
      if (loc === 'en') continue
      init[loc] = emptyTranslation(loc)
    }
    return init as Record<Exclude<Locale, 'en'>, TranslationRow>
  })
  // "Add Images" flow — same as before.
  const [imagesState, setImagesState] = useState<'idle' | 'fetching' | 'done' | 'error'>('idle')
  const [imagesMessage, setImagesMessage] = useState('')
  const coverFileInputRef = useRef<HTMLInputElement>(null)
  const [coverUploading, setCoverUploading] = useState(false)
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
    fetch('/api/admin/authors')
      .then((res) => (res.ok ? res.json() : []))
      .then((data: Array<{ id: string; name: string; is_default: boolean }>) => {
        setAuthors(data || [])
        if (!isEditing && !post.blog_author_id) {
          const def = (data || []).find((a) => a.is_default)
          if (def) {
            setPost((prev) => ({ ...prev, blog_author_id: def.id }))
          }
        }
      })
      .catch(() => {
        // ignore — authors are a nice-to-have
      })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Hydrate per-locale translations from the pivot table.
  useEffect(() => {
    if (!post.id) return
    fetch(`/api/admin/blog/${post.id}/translations`)
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: Array<Omit<TranslationRow, 'dirty' | 'locale'> & { locale: Locale }>) => {
        setTranslations((prev) => {
          const next = { ...prev }
          for (const row of rows) {
            if (row.locale === 'en') continue
            next[row.locale as Exclude<Locale, 'en'>] = {
              locale: row.locale as Exclude<Locale, 'en'>,
              title: row.title || '',
              body: row.body || '',
              excerpt: row.excerpt ?? null,
              source: row.source || 'manual',
              qa_score: row.qa_score ?? null,
              updated_at: row.updated_at ?? null,
              dirty: false,
            }
          }
          return next
        })
      })
      .catch(() => {
        // ignore — empty translations are fine for new posts
      })
  }, [post.id])

  const update = (field: keyof PostData, value: string | boolean | null) => {
    setPost((prev) => ({ ...prev, [field]: value }))
  }

  // ---------------------------------------------------------------------------
  // Locale-aware content helpers. For non-English locales, content lives in the
  // `translations` state (pivot table). Thai also falls back to legacy
  // `posts.*_th` columns when no pivot row exists yet — soft migration: the
  // legacy value is surfaced for editing, and saving promotes it into the pivot.
  // ---------------------------------------------------------------------------

  type LocaleContent = {
    title: string
    body: string
    excerpt: string
    source: 'manual' | 'ai' | 'imported' | null
    qa_score: number | null
  }

  const getLocaleContent = useCallback(
    (locale: Locale): LocaleContent => {
      if (locale === 'en') {
        return {
          title: post.title_en,
          body: post.body_en,
          excerpt: post.excerpt_en,
          source: null,
          qa_score: null,
        }
      }
      const t = translations[locale as Exclude<Locale, 'en'>]
      const hasPivot = t && (t.title || t.body || t.excerpt)
      if (hasPivot) {
        return {
          title: t.title,
          body: t.body,
          excerpt: t.excerpt ?? '',
          source: t.source,
          qa_score: t.qa_score,
        }
      }
      // Thai legacy fallback — surfaces pre-pivot data so the operator can
      // review/edit and have the next save promote it into post_translations.
      if (locale === 'th' && (post.title_th || post.body_th || post.excerpt_th)) {
        return {
          title: post.title_th,
          body: post.body_th,
          excerpt: post.excerpt_th,
          source: 'imported',
          qa_score: null,
        }
      }
      return { title: '', body: '', excerpt: '', source: null, qa_score: null }
    },
    [post, translations]
  )

  const setLocaleField = (
    locale: Locale,
    field: 'title' | 'body' | 'excerpt',
    value: string
  ) => {
    if (locale === 'en') {
      const map: Record<typeof field, keyof PostData> = {
        title: 'title_en',
        body: 'body_en',
        excerpt: 'excerpt_en',
      }
      update(map[field], value)
      return
    }
    setTranslations((prev) => {
      const cur = prev[locale as Exclude<Locale, 'en'>]
      // If editing a locale whose content was loaded from the TH legacy
      // fallback, seed the pivot row with that fallback the moment the user
      // types — otherwise the user's edit appears on top of empty state.
      let seeded = cur
      const isUnseededThaiFallback =
        locale === 'th' &&
        !cur.title &&
        !cur.body &&
        !cur.excerpt &&
        (post.title_th || post.body_th || post.excerpt_th)
      if (isUnseededThaiFallback) {
        seeded = {
          ...cur,
          title: post.title_th,
          body: post.body_th,
          excerpt: post.excerpt_th || null,
          source: 'imported',
        }
      }
      const updated: TranslationRow = {
        ...seeded,
        dirty: true,
        source: 'manual', // any keystroke flips AI / imported → manual
      }
      if (field === 'title') updated.title = value
      else if (field === 'body') updated.body = value
      else updated.excerpt = value
      return { ...prev, [locale]: updated }
    })
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
    if (activeLocale === 'en') {
      update('title_en', value)
      if (!isEditing && !post.slug) {
        update('slug', generateSlug(value))
      }
    } else {
      setLocaleField(activeLocale, 'title', value)
    }
  }

  // ---------------------------------------------------------------------------
  // Per-locale translation. Calls /api/ai/translate with the active locale's
  // targetLang. Operates on the EN canonical fields as source.
  // ---------------------------------------------------------------------------

  const translateField = async (
    locale: Exclude<Locale, 'en'>,
    field: 'title' | 'body' | 'excerpt'
  ) => {
    const sourceMap: Record<typeof field, string> = {
      title: post.title_en,
      body: post.body_en,
      excerpt: post.excerpt_en,
    }
    const sourceText = sourceMap[field]
    if (!sourceText) return

    setTranslating(`${locale}:${field}`)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLang: locale,
          context: field === 'body' ? 'blog' : 'listing',
        }),
      })
      if (res.ok) {
        const translated = (await res.text()).trim()
        setTranslations((prev) => ({
          ...prev,
          [locale]: {
            ...prev[locale],
            [field]: field === 'excerpt' ? translated : translated,
            source: 'ai',
            dirty: true,
          },
        }))
      } else {
        const data = await res.json().catch(() => ({}))
        setError(data.error || `Translate to ${locale} failed (HTTP ${res.status})`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translate failed')
    } finally {
      setTranslating(null)
    }
  }

  const translateAllForLocale = async (locale: Exclude<Locale, 'en'>) => {
    setTranslating(`${locale}:all`)
    setError('')

    type Field = 'title' | 'excerpt' | 'body'
    const fields: Array<{ key: Field; ctx: 'blog' | 'listing'; source: string }> = [
      { key: 'title', ctx: 'listing', source: post.title_en },
      { key: 'excerpt', ctx: 'listing', source: post.excerpt_en },
      { key: 'body', ctx: 'blog', source: post.body_en },
    ]

    type Result = { key: Field; status: 'ok' | 'skipped' | 'error'; translated?: string; error?: string }

    const calls: Promise<Result>[] = fields.map(async ({ key, ctx, source }): Promise<Result> => {
      if (!source) return { key, status: 'skipped' }
      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: source, targetLang: locale, context: ctx }),
        })
        if (!res.ok) {
          const data = await res.json().catch(() => ({}))
          throw new Error(data.error || `HTTP ${res.status}`)
        }
        const translated = (await res.text()).trim()
        return { key, status: 'ok', translated }
      } catch (err) {
        return { key, status: 'error', error: err instanceof Error ? err.message : 'failed' }
      }
    })

    const results = await Promise.all(calls)

    setTranslations((prev) => {
      const cur = prev[locale]
      const next: TranslationRow = { ...cur, source: 'ai', dirty: true }
      for (const r of results) {
        if (r.status === 'ok' && r.translated !== undefined) {
          if (r.key === 'title') next.title = r.translated
          else if (r.key === 'body') next.body = r.translated
          else next.excerpt = r.translated
        }
      }
      return { ...prev, [locale]: next }
    })

    const failures = results.filter((r) => r.status === 'error')
    if (failures.length > 0) {
      const summary = failures.map((f) => `${f.key}: ${f.error}`).join(', ')
      setError(`Translate to ${locale} failed for: ${summary}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    setTranslating(null)
  }

  const clearLocale = async (locale: Exclude<Locale, 'en'>) => {
    if (!confirm(`Clear the ${LOCALE_NAMES[locale]} translation? This cannot be undone.`)) return
    setTranslations((prev) => ({ ...prev, [locale]: emptyTranslation(locale) }))
    // If a pivot row exists on the server, DELETE it too. Best-effort —
    // the next save would create an empty row that would fail the NOT NULL
    // checks, so we delete eagerly here.
    if (post.id) {
      await fetch(`/api/admin/blog/${post.id}/translations/${locale}`, {
        method: 'DELETE',
      }).catch(() => {
        // ignore — local state already cleared
      })
    }
  }

  const runQa = async (locale: Locale) => {
    const { body } = getLocaleContent(locale)
    if (!body || !body.trim()) {
      setQa(null)
      return
    }
    setQaLoading(true)
    try {
      const res = await fetch('/api/ai/score-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html: body, lang: locale }),
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
        // Always score the freshly generated EN body so the writer sees
        // structure / length issues immediately.
        setActiveLocale('en')
        runQa('en')
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
      // sessionStorage can throw if quota is exceeded — fall through anyway
    }
    window.open('/admin/blog/preview', 'cms-blog-preview')
  }

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

      if (post.body_en) {
        setImagesMessage('Fetching inline images…')
        const parser = new DOMParser()
        const doc = parser.parseFromString(`<div id="root">${post.body_en}</div>`, 'text/html')
        const root = doc.getElementById('root')
        const h2s = root ? Array.from(root.querySelectorAll('h2')).slice(0, 3) : []

        for (const h2 of h2s) {
          const headingText = (h2.textContent || '').trim()
          if (!headingText || /^faq/i.test(headingText)) continue
          let next: Element | null = h2.nextElementSibling
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

          const imgEl = doc.createElement('img')
          imgEl.setAttribute('src', img.url)
          imgEl.setAttribute('alt', img.altText || headingText)
          h2.parentNode?.insertBefore(imgEl, h2.nextSibling)
          inlineAdded++
        }

        if (inlineAdded > 0 && root) {
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

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
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

  // ---------------------------------------------------------------------------
  // Save flow
  //   1. PUT /api/admin/blog/[id]  — canonical EN + legacy *_th passthrough so
  //      pre-pivot Thai data isn't nuked on save.
  //   2. For every dirty non-EN translation, PUT
  //      /api/admin/blog/[id]/translations/[locale] in parallel.
  // ---------------------------------------------------------------------------

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

      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to save')
        setSaving(false)
        return
      }

      const saved = (await res.json()) as PostData
      const postId = saved.id || post.id
      if (!postId) {
        // Shouldn't happen — the API returns the created/updated row.
        router.push('/admin/blog')
        router.refresh()
        return
      }

      // Persist every dirty non-EN translation in parallel.
      const dirty = Object.values(translations).filter((t) => t.dirty && (t.title || t.body))
      const failures: string[] = []
      if (dirty.length > 0) {
        await Promise.all(
          dirty.map(async (t) => {
            try {
              const r = await fetch(
                `/api/admin/blog/${postId}/translations/${t.locale}`,
                {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title: t.title,
                    body: t.body,
                    excerpt: t.excerpt || undefined,
                    source: t.source,
                    qa_score: t.qa_score,
                  }),
                }
              )
              if (!r.ok) {
                const data = await r.json().catch(() => ({}))
                failures.push(`${t.locale}: ${data.error || `HTTP ${r.status}`}`)
              }
            } catch (err) {
              failures.push(
                `${t.locale}: ${err instanceof Error ? err.message : 'failed'}`
              )
            }
          })
        )
      }

      if (failures.length > 0) {
        setError(`Saved EN, but translation save failed for: ${failures.join('; ')}`)
        setSaving(false)
        return
      }

      router.push('/admin/blog')
      router.refresh()
    } catch {
      setError('Failed to save')
      setSaving(false)
    }
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const activeContent = getLocaleContent(activeLocale)
  const activeIsEn = activeLocale === 'en'
  const activeTr = activeIsEn ? null : translations[activeLocale as Exclude<Locale, 'en'>]
  const hasContent = (loc: Locale): boolean => {
    const c = getLocaleContent(loc)
    return Boolean(c.title || c.body || c.excerpt)
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
            <p className="text-xs text-gray-400">Category is taken from the field below. After generating EN, switch to a locale tab and click Translate.</p>
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

      {/* QA Panel */}
      {(qa || qaLoading) && (
        <div className="mb-5 border border-gray-200 rounded-lg overflow-hidden bg-white">
          <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gray-700">SEO QA</span>
              {qa && (
                <>
                  <span className="text-xs uppercase font-mono text-gray-500">{qa.lang}</span>
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
                </>
              )}
              {qaLoading && <span className="text-xs text-gray-500">Scoring…</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => runQa(activeLocale)}
                disabled={qaLoading || !activeContent.body}
                className="text-xs text-blue-700 hover:text-blue-900 font-semibold disabled:opacity-40"
              >
                Score {activeLocale.toUpperCase()}
              </button>
            </div>
          </div>
          {qa && (
            <div className="px-4 py-3 space-y-3">
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
                <Metric label="Thai chars" value={qa.metrics.thaiCharsInBody} target={qa.lang === 'th' ? '200+' : '0'} ok={qa.lang === 'th' ? qa.metrics.thaiCharsInBody >= 200 : qa.metrics.thaiCharsInBody === 0} />
                <Metric label="Filler" value={qa.metrics.fillerPhrasesFound} target="0" ok={qa.metrics.fillerPhrasesFound === 0} />
                <Metric label="Site mentions" value={qa.metrics.siteMentions} target="1–2" ok={qa.metrics.siteMentions >= 1 && qa.metrics.siteMentions <= 2} />
                <Metric label="Paragraphs" value={qa.metrics.paragraphCount} target="—" ok={true} />
              </div>
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
              {qa.suggestions.length > 0 && (
                <div className="text-xs text-gray-600 flex flex-wrap gap-x-3 gap-y-1">
                  {qa.suggestions.map((s, i) => (
                    <span key={i}>✓ {s}</span>
                  ))}
                </div>
              )}
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

      {/* Slug + Category + Author + Cover — only on EN (these are post-level
         fields, not per-locale). */}
      {activeIsEn && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
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
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-semibold mb-1">Content type</label>
              <select
                value={post.post_type}
                onChange={(e) => update('post_type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              >
                {POST_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt === 'news' ? 'News / notice (News section)' : 'Article (main blog)'}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                News items appear in /news, not the main blog feed.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
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
        </>
      )}

      {/* Locale tabs */}
      <div className="mb-2 flex items-center gap-2 flex-wrap border-b border-gray-200 pb-2">
        {SUPPORTED_LOCALES.map((loc) => {
          const isActive = activeLocale === loc
          const filled = hasContent(loc)
          const isDirty = loc !== 'en' && translations[loc as Exclude<Locale, 'en'>]?.dirty
          return (
            <button
              key={loc}
              type="button"
              onClick={() => setActiveLocale(loc)}
              className={`relative px-3 py-1.5 text-sm font-heading font-semibold rounded-lg border transition-colors ${
                isActive
                  ? 'bg-primary text-white border-primary'
                  : filled
                  ? 'bg-white text-gray-800 border-gray-300 hover:bg-gray-50'
                  : 'bg-gray-50 text-gray-400 border-gray-200 hover:bg-gray-100'
              }`}
              title={`${LOCALE_NAMES[loc]} ${filled ? '(has content)' : '(empty)'}`}
            >
              <span className="uppercase tracking-wide text-xs mr-1">{loc}</span>
              <span className="text-[10px] opacity-80">{LOCALE_NAMES[loc]}</span>
              {isDirty && (
                <span
                  className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"
                  title="Unsaved changes"
                />
              )}
            </button>
          )
        })}
      </div>

      {/* Per-locale toolbar — translation controls + status badge */}
      {!activeIsEn && (
        <div className="mb-3 flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-gray-500">Status:</span>
            <StatusBadge
              source={activeTr?.source ?? null}
              hasContent={Boolean(activeContent.title || activeContent.body)}
              dirty={Boolean(activeTr?.dirty)}
            />
            {activeContent.qa_score !== null && (
              <span className="text-gray-500">
                QA: <strong className="text-gray-800">{activeContent.qa_score}</strong>
              </span>
            )}
            {activeTr?.updated_at && (
              <span className="text-gray-400">
                · saved {new Date(activeTr.updated_at).toLocaleDateString()}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => translateAllForLocale(activeLocale as Exclude<Locale, 'en'>)}
              disabled={!!translating || !post.body_en}
              className="bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
            >
              {translating === `${activeLocale}:all`
                ? 'Translating…'
                : `Translate from EN`}
            </button>
            {(activeContent.title || activeContent.body) && (
              <button
                type="button"
                onClick={() => clearLocale(activeLocale as Exclude<Locale, 'en'>)}
                className="text-xs text-gray-500 hover:text-red-700 px-2 py-1.5"
                title="Delete this translation"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Title */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold">
            Title ({LOCALE_NAMES[activeLocale]})
          </label>
          {!activeIsEn && (
            <button
              type="button"
              onClick={() => translateField(activeLocale as Exclude<Locale, 'en'>, 'title')}
              disabled={!!translating || !post.title_en}
              className="text-xs text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
            >
              {translating === `${activeLocale}:title` ? 'Translating…' : 'Translate from EN'}
            </button>
          )}
        </div>
        <input
          type="text"
          value={activeContent.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder={activeIsEn ? 'Article title…' : `Translated title in ${LOCALE_NAMES[activeLocale]}…`}
        />
      </div>

      {/* Excerpt */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1">
          <label className="text-sm font-semibold">
            Excerpt ({LOCALE_NAMES[activeLocale]})
          </label>
          {!activeIsEn && (
            <button
              type="button"
              onClick={() => translateField(activeLocale as Exclude<Locale, 'en'>, 'excerpt')}
              disabled={!!translating || !post.excerpt_en}
              className="text-xs text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
            >
              {translating === `${activeLocale}:excerpt` ? 'Translating…' : 'Translate from EN'}
            </button>
          )}
        </div>
        <textarea
          value={activeContent.excerpt}
          onChange={(e) => {
            if (activeIsEn) update('excerpt_en', e.target.value)
            else setLocaleField(activeLocale, 'excerpt', e.target.value)
          }}
          rows={2}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Short summary for listing cards…"
        />
      </div>

      {/* Body */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-semibold">
            Body ({LOCALE_NAMES[activeLocale]})
          </label>
          {!activeIsEn && (
            <button
              type="button"
              onClick={() => translateField(activeLocale as Exclude<Locale, 'en'>, 'body')}
              disabled={!!translating || !post.body_en}
              className="text-xs text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
            >
              {translating === `${activeLocale}:body` ? 'Translating…' : 'Translate body from EN'}
            </button>
          )}
        </div>
        {/* Use a unique key per locale so the underlying RichTextEditor
            remounts cleanly when switching tabs — otherwise the editor
            state from the previous locale would bleed across. */}
        <RichTextEditor
          key={`body-${activeLocale}`}
          content={activeContent.body}
          onChange={(html) => {
            if (activeIsEn) update('body_en', html)
            else setLocaleField(activeLocale, 'body', html)
          }}
          placeholder={
            activeIsEn
              ? 'Write your article in English…'
              : `Translate or write directly in ${LOCALE_NAMES[activeLocale]}…`
          }
        />
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

function StatusBadge({
  source,
  hasContent,
  dirty,
}: {
  source: 'manual' | 'ai' | 'imported' | null
  hasContent: boolean
  dirty: boolean
}) {
  if (!hasContent) {
    return (
      <span className="px-2 py-0.5 rounded text-xs font-mono bg-gray-100 text-gray-500">
        none
      </span>
    )
  }
  const label =
    source === 'ai'
      ? 'ai-generated'
      : source === 'imported'
      ? 'legacy (imported)'
      : 'manual'
  const cls =
    source === 'ai'
      ? 'bg-blue-100 text-blue-800'
      : source === 'imported'
      ? 'bg-amber-100 text-amber-800'
      : 'bg-green-100 text-green-800'
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-mono ${cls}`}>
      {label}
      {dirty && <span className="ml-1 text-orange-600">●</span>}
    </span>
  )
}
