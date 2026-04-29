'use client'

import { useState, useEffect } from 'react'
import type { Author } from '@/lib/supabase'

// Authors list + inline CRUD. We keep this on a single page (no /new or
// /[id]/edit sub-routes) because authors are a tiny entity — half a dozen
// at most — and shipping three separate pages would be overkill.
//
// Creating and editing both open the same modal. The default author is
// pinned to the top and gets a badge. Deleting the default is refused
// by the API so the cron always has a valid fallback.

type AuthorDraft = {
  id?: string
  slug: string
  name: string
  name_th: string
  bio_en: string
  bio_th: string
  avatar_url: string
  twitter: string
  linkedin: string
  website: string
  is_default: boolean
}

const emptyDraft: AuthorDraft = {
  slug: '',
  name: '',
  name_th: '',
  bio_en: '',
  bio_th: '',
  avatar_url: '',
  twitter: '',
  linkedin: '',
  website: '',
  is_default: false,
}

export default function AdminAuthorsPage() {
  const [authors, setAuthors] = useState<Author[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<AuthorDraft | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    loadAuthors()
  }, [])

  const loadAuthors = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/authors')
      if (res.ok) {
        setAuthors(await res.json())
      }
    } catch {
      setError('Failed to load authors')
    } finally {
      setLoading(false)
    }
  }

  const openNew = () => {
    setEditing({ ...emptyDraft })
  }

  const openEdit = (author: Author) => {
    setEditing({
      id: author.id,
      slug: author.slug,
      name: author.name,
      name_th: author.name_th || '',
      bio_en: author.bio_en || '',
      bio_th: author.bio_th || '',
      avatar_url: author.avatar_url || '',
      twitter: author.twitter || '',
      linkedin: author.linkedin || '',
      website: author.website || '',
      is_default: author.is_default,
    })
  }

  const update = <K extends keyof AuthorDraft>(key: K, value: AuthorDraft[K]) => {
    if (!editing) return
    setEditing({ ...editing, [key]: value })
  }

  const handleSave = async () => {
    if (!editing) return
    if (!editing.name.trim()) {
      setError('Name is required')
      return
    }
    setSaving(true)
    setError('')
    try {
      const url = editing.id
        ? `/api/admin/authors/${editing.id}`
        : '/api/admin/authors'
      const method = editing.id ? 'PUT' : 'POST'
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Save failed')
      }
      setEditing(null)
      await loadAuthors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (author: Author) => {
    if (author.is_default) {
      alert('Cannot delete the default author. Promote another author first.')
      return
    }
    if (!confirm(`Delete "${author.name}"?`)) return
    try {
      const res = await fetch(`/api/admin/authors/${author.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Delete failed')
      }
      await loadAuthors()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-3xl">Authors</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage the bylines that appear on blog posts. The starred author is used by the daily draft cron.
          </p>
        </div>
        <button
          onClick={openNew}
          className="bg-primary text-white font-heading font-semibold text-sm uppercase px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          + New Author
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : authors.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No authors yet. Create your first one.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Name</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Slug</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Default</th>
                <th className="text-right px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {authors.map((author) => (
                <tr key={author.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {author.avatar_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={author.avatar_url} alt="" className="w-8 h-8 rounded-full object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-500">
                          {author.name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{author.name}</div>
                        {author.name_th && <div className="text-xs text-gray-400">{author.name_th}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{author.slug}</td>
                  <td className="px-4 py-3">
                    {author.is_default ? (
                      <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-xs font-heading font-semibold uppercase px-2 py-0.5 rounded">
                        Default
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => openEdit(author)}
                      className="text-xs text-primary hover:text-primary-dark font-semibold mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(author)}
                      disabled={author.is_default}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-30 disabled:cursor-not-allowed"
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

      {/* Editor modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="font-heading font-bold text-xl">
                {editing.id ? 'Edit Author' : 'New Author'}
              </h2>
              <button
                onClick={() => setEditing(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Name (English)" required>
                  <input
                    type="text"
                    value={editing.name}
                    onChange={(e) => update('name', e.target.value)}
                    className="input"
                    placeholder="e.g. Jane Doe"
                  />
                </Field>
                <Field label="Name (Thai)">
                  <input
                    type="text"
                    value={editing.name_th}
                    onChange={(e) => update('name_th', e.target.value)}
                    className="input"
                  />
                </Field>
              </div>

              <Field label="Slug" hint="Auto-derived from name if left blank. URL-safe, e.g. jane-doe">
                <input
                  type="text"
                  value={editing.slug}
                  onChange={(e) => update('slug', e.target.value)}
                  className="input font-mono"
                  placeholder="jane-doe"
                />
              </Field>

              <Field label="Bio (English)" hint="1-2 sentences, shown under every post they write.">
                <textarea
                  value={editing.bio_en}
                  onChange={(e) => update('bio_en', e.target.value)}
                  rows={3}
                  className="input resize-none"
                />
              </Field>

              <Field label="Bio (Thai)">
                <textarea
                  value={editing.bio_th}
                  onChange={(e) => update('bio_th', e.target.value)}
                  rows={3}
                  className="input resize-none"
                />
              </Field>

              <Field label="Avatar URL">
                <input
                  type="text"
                  value={editing.avatar_url}
                  onChange={(e) => update('avatar_url', e.target.value)}
                  className="input"
                  placeholder="https://..."
                />
              </Field>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Field label="Twitter">
                  <input
                    type="text"
                    value={editing.twitter}
                    onChange={(e) => update('twitter', e.target.value)}
                    className="input"
                    placeholder="@handle"
                  />
                </Field>
                <Field label="LinkedIn">
                  <input
                    type="text"
                    value={editing.linkedin}
                    onChange={(e) => update('linkedin', e.target.value)}
                    className="input"
                    placeholder="https://linkedin.com/in/..."
                  />
                </Field>
                <Field label="Website">
                  <input
                    type="text"
                    value={editing.website}
                    onChange={(e) => update('website', e.target.value)}
                    className="input"
                    placeholder="https://..."
                  />
                </Field>
              </div>

              <label className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  checked={editing.is_default}
                  onChange={(e) => update('is_default', e.target.checked)}
                  className="rounded"
                />
                <span className="text-sm">
                  <span className="font-semibold">Make default author</span>
                  <span className="text-gray-500 ml-1">— the daily draft cron will use this author for new posts.</span>
                </span>
              </label>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button
                onClick={() => setEditing(null)}
                className="text-sm text-gray-600 hover:text-gray-900 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="bg-primary text-white font-heading font-semibold text-sm uppercase px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        :global(.input) {
          width: 100%;
          padding: 0.5rem 0.75rem;
          border: 1px solid rgb(209 213 219);
          border-radius: 0.5rem;
          font-size: 0.875rem;
        }
        :global(.input:focus) {
          outline: none;
          box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  )
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string
  hint?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-semibold mb-1">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-400 mt-1">{hint}</p>}
    </div>
  )
}
