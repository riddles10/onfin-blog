'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Page } from '@/lib/supabase'

export default function AdminPagesList() {
  const [pages, setPages] = useState<Page[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPages()
  }, [])

  const fetchPages = async () => {
    try {
      const res = await fetch('/api/admin/pages')
      if (res.ok) {
        const data = await res.json()
        setPages(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const deletePage = async (slug: string) => {
    if (!confirm('Delete this page? This cannot be undone.')) return
    try {
      await fetch(`/api/admin/pages/${slug}`, { method: 'DELETE' })
      fetchPages()
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-3xl">CMS Pages</h1>
        <Link
          href="/admin/pages/new"
          className="bg-primary text-white font-heading font-semibold text-sm uppercase px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          + New Page
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : pages.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No pages yet. Create your first one!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Slug</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Thai</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Updated</th>
                <th className="text-right px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.slug} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <span className="font-mono text-xs text-gray-600">/{page.slug}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/pages/${page.slug}/edit`} className="font-semibold text-gray-900 hover:text-primary">
                      {page.title_en}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    {page.title_th && page.body_th ? (
                      <span className="text-green-600 text-xs font-semibold">Translated</span>
                    ) : (
                      <span className="text-amber-600 text-xs font-semibold">Missing</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-heading font-semibold uppercase px-2 py-0.5 rounded ${
                        page.published
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {page.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {page.updated_at
                      ? new Date(page.updated_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/pages/${page.slug}/edit`}
                      className="text-xs text-primary hover:text-primary-dark font-semibold mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePage(page.slug)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
