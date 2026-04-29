'use client'

// Draft preview page. Renders an unsaved draft from the BlogEditor as it
// would appear on the public blog post page, without ever touching the DB.
//
// Flow:
//   1. BlogEditor stashes the current draft into sessionStorage under
//      'cms-blog-preview' before opening this page in a new tab.
//   2. This page reads the draft on mount and renders it with the same
//      layout, .prose styling, EN/TH toggle, and cover image as the live
//      blog post page.
//   3. Re-clicking "Preview" in the editor reuses this same tab via the
//      target name 'cms-blog-preview' so the operator gets a single
//      always-up-to-date preview window.
//
// Note: this page is under /admin so it inherits the admin password gate
// from app/admin/layout.tsx — no extra auth needed.

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { POST_CATEGORIES } from '@/lib/cms-config'

type DraftPreview = {
  slug: string
  title_en: string
  title_th: string
  body_en: string
  body_th: string
  excerpt_en: string
  excerpt_th: string
  category: string
  cover_image: string
}

export default function BlogPreviewPage() {
  const [draft, setDraft] = useState<DraftPreview | null>(null)
  const [lang, setLang] = useState<'en' | 'th'>('en')
  const [missing, setMissing] = useState(false)

  useEffect(() => {
    // Read once on mount.
    const raw = typeof window !== 'undefined' ? sessionStorage.getItem('cms-blog-preview') : null
    if (!raw) {
      setMissing(true)
      return
    }
    try {
      setDraft(JSON.parse(raw) as DraftPreview)
    } catch {
      setMissing(true)
    }

    // Live-update: if the editor stashes a new draft into sessionStorage,
    // pick it up so the operator can keep editing in one tab and watch
    // the preview update in another. We poll because storage events don't
    // fire in the same tab/window context reliably across browsers.
    const interval = setInterval(() => {
      const next = sessionStorage.getItem('cms-blog-preview')
      if (!next) return
      try {
        const parsed = JSON.parse(next) as DraftPreview
        setDraft((prev) => {
          // Avoid re-renders if nothing changed
          if (prev && JSON.stringify(prev) === next) return prev
          return parsed
        })
      } catch {
        // ignore
      }
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  if (missing) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading font-bold text-2xl mb-3">No draft to preview</h1>
        <p className="text-gray-600 mb-6">
          Open this page from the blog editor's <strong>Preview</strong> button — it stashes the
          current draft into sessionStorage and opens this tab.
        </p>
        <Link
          href="/admin/blog"
          className="inline-block bg-primary text-white font-heading font-semibold uppercase text-sm px-5 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          Back to blog admin
        </Link>
      </div>
    )
  }

  if (!draft) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">Loading draft...</div>
    )
  }

  const title = lang === 'th' && draft.title_th ? draft.title_th : draft.title_en
  const body = lang === 'th' && draft.body_th ? draft.body_th : draft.body_en
  const excerpt = lang === 'th' && draft.excerpt_th ? draft.excerpt_th : draft.excerpt_en
  const hasBoth = !!(draft.title_th && draft.body_th)

  return (
    <div>
      {/* Preview banner — makes it crystal-clear this is not the live page. */}
      <div className="bg-amber-100 border-b border-amber-300 px-4 py-2 text-center text-xs text-amber-900 font-semibold">
        DRAFT PREVIEW · Not published · Updates from editor every ~1.5s
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Cover Image */}
        {draft.cover_image && (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-8 bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={draft.cover_image}
              alt={title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Category badge + Slug + EN/TH toggle */}
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-3">
            {draft.category && (
              <span className="text-xs font-heading font-semibold uppercase px-2.5 py-1 rounded bg-gray-100 text-gray-800">
                {draft.category}
              </span>
            )}
            {draft.slug && (
              <span className="text-xs text-gray-400 font-mono">/blog/{draft.slug}</span>
            )}
          </div>

          {hasBoth && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1 text-xs font-heading font-semibold rounded-lg transition-colors ${
                  lang === 'en'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => setLang('th')}
                className={`px-3 py-1 text-xs font-heading font-semibold rounded-lg transition-colors ${
                  lang === 'th'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                ภาษาไทย
              </button>
            </div>
          )}
        </div>

        {/* Title */}
        <h1 className="font-heading font-bold text-3xl sm:text-4xl text-gray-900 mb-4">
          {title || <span className="text-gray-300">(no title yet)</span>}
        </h1>

        {/* Excerpt — shown above the body so the operator can sanity-check
            the meta description visible to social-media unfurls. */}
        {excerpt && (
          <p className="text-gray-500 text-base mb-6 italic">{excerpt}</p>
        )}

        {/* Body — uses the same .prose hook as the public blog page so
            heading sizes, paragraph spacing, lists, links, etc. all match. */}
        {body ? (
          <div
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: body }}
          />
        ) : (
          <p className="text-gray-300 italic">(no body content yet)</p>
        )}
      </div>
    </div>
  )
}
