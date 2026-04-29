'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('@/components/RichTextEditor'), { ssr: false })

type PageData = {
  slug: string
  title_en: string
  title_th: string
  body_en: string
  body_th: string
  meta_description_en: string
  meta_description_th: string
  published: boolean
}

const emptyPage: PageData = {
  slug: '',
  title_en: '',
  title_th: '',
  body_en: '',
  body_th: '',
  meta_description_en: '',
  meta_description_th: '',
  published: true,
}

export default function PageEditor({ initialData, isEditing }: { initialData?: PageData; isEditing?: boolean }) {
  const router = useRouter()
  const [page, setPage] = useState<PageData>(initialData || emptyPage)
  const [saving, setSaving] = useState(false)
  const [translating, setTranslating] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'en' | 'th'>('en')
  const [error, setError] = useState('')

  const update = (field: keyof PageData, value: string | boolean) => {
    setPage((prev) => ({ ...prev, [field]: value }))
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
    if (!isEditing && !page.slug) {
      update('slug', generateSlug(value))
    }
  }

  const translateField = async (field: 'title' | 'body' | 'meta_description') => {
    const sourceField = `${field}_en` as keyof PageData
    const sourceText = page[sourceField] as string
    if (!sourceText) return

    setTranslating(field)
    try {
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          targetLang: 'th',
          context: 'page',
        }),
      })
      if (res.ok) {
        const translated = await res.text()
        const targetField = `${field}_th` as keyof PageData
        update(targetField, translated)
      }
    } catch {
      // ignore
    } finally {
      setTranslating(null)
    }
  }

  const translateAll = async () => {
    setTranslating('all')
    for (const field of ['title', 'meta_description', 'body'] as const) {
      const sourceField = `${field}_en` as keyof PageData
      const sourceText = page[sourceField] as string
      if (!sourceText) continue

      try {
        const res = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: sourceText,
            targetLang: 'th',
            context: 'page',
          }),
        })
        if (res.ok) {
          const translated = await res.text()
          const targetField = `${field}_th` as keyof PageData
          update(targetField, translated)
        }
      } catch {
        // ignore
      }
    }
    setTranslating(null)
  }

  const handleSave = async () => {
    setError('')
    if (!page.title_en || !page.slug) {
      setError('Title and slug are required.')
      return
    }

    setSaving(true)
    try {
      const url = isEditing ? `/api/admin/pages/${page.slug}` : '/api/admin/pages'
      const method = isEditing ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(page),
      })

      if (res.ok) {
        router.push('/admin/pages')
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

  const handleDelete = async () => {
    if (!confirm('Delete this page? This cannot be undone.')) return
    try {
      await fetch(`/api/admin/pages/${page.slug}`, { method: 'DELETE' })
      router.push('/admin/pages')
      router.refresh()
    } catch {
      setError('Failed to delete')
    }
  }

  return (
    <div className="max-w-4xl">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Title & Slug */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Title (English)</label>
          <input
            type="text"
            value={page.title_en}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Page title..."
          />
        </div>
        <div>
          <label className="block text-sm font-semibold mb-1">Slug</label>
          <input
            type="text"
            value={page.slug}
            onChange={(e) => update('slug', e.target.value)}
            disabled={isEditing}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary disabled:bg-gray-100 disabled:text-gray-500"
            placeholder="page-slug"
          />
          {isEditing && (
            <p className="text-xs text-gray-400 mt-0.5">Slug cannot be changed after creation</p>
          )}
        </div>
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
          value={page.title_th}
          onChange={(e) => update('title_th', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          placeholder="Thai title (auto-translate or type manually)"
        />
      </div>

      {/* Meta Descriptions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold">Meta Description (English)</label>
          </div>
          <textarea
            value={page.meta_description_en}
            onChange={(e) => update('meta_description_en', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="SEO meta description..."
          />
        </div>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-sm font-semibold">Meta Description (Thai)</label>
            <button
              type="button"
              onClick={() => translateField('meta_description')}
              disabled={!!translating}
              className="text-xs text-primary hover:text-primary-dark font-semibold disabled:opacity-50"
            >
              {translating === 'meta_description' ? 'Translating...' : 'Translate'}
            </button>
          </div>
          <textarea
            value={page.meta_description_th}
            onChange={(e) => update('meta_description_th', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            placeholder="Thai meta description..."
          />
        </div>
      </div>

      {/* Published toggle */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
          <input
            type="checkbox"
            checked={page.published}
            onChange={(e) => update('published', e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary/30"
          />
          Published
        </label>
        <p className="text-xs text-gray-400 mt-0.5">Unpublished pages are only visible in admin</p>
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
            content={page.body_en}
            onChange={(html) => update('body_en', html)}
            placeholder="Write page content in English..."
          />
        ) : (
          <RichTextEditor
            content={page.body_th}
            onChange={(html) => update('body_th', html)}
            placeholder="Write page content in Thai..."
          />
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 border-t border-gray-200 pt-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="bg-primary text-white font-heading font-semibold text-sm uppercase px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : isEditing ? 'Update Page' : 'Create Page'}
        </button>
        {isEditing && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-6 py-2.5 border border-red-300 text-red-600 rounded-lg font-heading font-semibold text-sm uppercase hover:bg-red-50 transition-colors"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/admin/pages')}
          className="text-sm text-gray-500 hover:text-gray-700 ml-auto"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
