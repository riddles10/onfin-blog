'use client'

import { useEffect, useState } from 'react'
import { POST_CATEGORIES } from '@/lib/cms-config'

type TopicRow = {
  id: string
  topic: string
  category: string
  keywords: string[]
  status: 'pending' | 'used' | 'skipped' | 'failed'
  priority: number
  notes: string | null
  used_at: string | null
  used_post_id: string | null
  failure_reason: string | null
  created_at: string
}

const STATUS_FILTERS = ['pending', 'used', 'skipped', 'failed'] as const

export default function AdminTopicsPage() {
  const [rows, setRows] = useState<TopicRow[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>('pending')

  // New-row form state
  const [newTopic, setNewTopic] = useState('')
  const [newCategory, setNewCategory] = useState<string>(POST_CATEGORIES[0])
  const [newKeywords, setNewKeywords] = useState('')
  const [newPriority, setNewPriority] = useState(0)
  const [newNotes, setNewNotes] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Per-row state for the "Publish Now" button so each row can show its own
  // progress (Stage 1 / Stage 2 / done / failed) without blocking others.
  type PublishState = 'idle' | 'drafting' | 'translating' | 'done' | 'error'
  const [publishState, setPublishState] = useState<Record<string, PublishState>>({})
  const [publishMessage, setPublishMessage] = useState<Record<string, string>>({})

  async function fetchRows(status: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/topics?status=${status}`)
      if (res.ok) {
        const data = await res.json()
        setRows(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows(filter)
  }, [filter])

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!newTopic.trim()) {
      setError('Topic is required')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: newTopic.trim(),
          category: newCategory,
          keywords: newKeywords
            .split(',')
            .map((k) => k.trim())
            .filter(Boolean),
          priority: newPriority,
          notes: newNotes.trim() || null,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        setError(data.error || 'Failed to add topic')
        return
      }
      setNewTopic('')
      setNewKeywords('')
      setNewNotes('')
      setNewPriority(0)
      fetchRows(filter)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this topic? This cannot be undone.')) return
    await fetch(`/api/admin/topics/${id}`, { method: 'DELETE' })
    fetchRows(filter)
  }

  async function handleStatusChange(id: string, status: string) {
    await fetch(`/api/admin/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    fetchRows(filter)
  }

  async function handlePriorityChange(id: string, priority: number) {
    await fetch(`/api/admin/topics/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ priority }),
    })
    fetchRows(filter)
  }

  // Publish a specific topic right now instead of waiting for the cron.
  // Runs the same two-stage pipeline the cron runs, just on demand.
  //
  // Stage 1 (~45s): generate + refine English, save as en_drafted
  // Stage 2 (~35s): score, Unsplash cover, Slack notify (translation
  // step is skipped while SECONDARY_LANG is null in cms-config.ts)
  //
  // Each stage is a separate serverless function, so we chain them
  // sequentially from the client.
  async function handlePublishNow(id: string, topic: string) {
    if (
      !confirm(
        `Publish "${topic}" now?\n\nThis will run the full draft + finalise pipeline (~80s total) and notify Slack when done.`
      )
    )
      return

    setPublishState((s) => ({ ...s, [id]: 'drafting' }))
    setPublishMessage((m) => ({ ...m, [id]: 'Generating English draft (~45s)...' }))

    try {
      // Stage 1 — draft
      const draftRes = await fetch(
        `/api/admin/cron/run/draft?topic_id=${encodeURIComponent(id)}`,
        { method: 'POST' }
      )
      const draftData = await draftRes.json()
      if (!draftRes.ok || draftData.error) {
        throw new Error(draftData.error || `Stage 1 failed (${draftRes.status})`)
      }

      setPublishState((s) => ({ ...s, [id]: 'translating' }))
      setPublishMessage((m) => ({
        ...m,
        [id]: `Translating + fetching cover image (~35s)...`,
      }))

      // Stage 2 — translate + image + notify
      const translateRes = await fetch('/api/admin/cron/run/translate', {
        method: 'POST',
      })
      const translateData = await translateRes.json()
      if (!translateRes.ok || translateData.error) {
        throw new Error(translateData.error || `Stage 2 failed (${translateRes.status})`)
      }

      setPublishState((s) => ({ ...s, [id]: 'done' }))
      setPublishMessage((m) => ({
        ...m,
        [id]: `Done — check Slack for the edit link`,
      }))
      // Refresh the list so the row flips from pending to used
      fetchRows(filter)
    } catch (err) {
      setPublishState((s) => ({ ...s, [id]: 'error' }))
      setPublishMessage((m) => ({
        ...m,
        [id]: err instanceof Error ? err.message : String(err),
      }))
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-heading font-bold text-3xl">Topic Queue</h1>
          <p className="text-gray-500 text-sm mt-1">
            The daily-draft cron pops the highest-priority pending row each morning.
          </p>
        </div>
      </div>

      {/* New topic form */}
      <form
        onSubmit={handleCreate}
        className="bg-white rounded-xl border border-gray-200 p-5 mb-8 shadow-sm"
      >
        <h2 className="font-heading font-semibold text-lg mb-4">Add a topic</h2>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-6">
            <label className="block text-xs font-heading font-semibold uppercase text-gray-500 mb-1">
              Topic *
            </label>
            <input
              type="text"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
              placeholder="e.g. Best practices for getting started"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-heading font-semibold uppercase text-gray-500 mb-1">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            >
              {POST_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-heading font-semibold uppercase text-gray-500 mb-1">
              Priority
            </label>
            <input
              type="number"
              value={newPriority}
              onChange={(e) => setNewPriority(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="md:col-span-12">
            <label className="block text-xs font-heading font-semibold uppercase text-gray-500 mb-1">
              Keywords (comma-separated)
            </label>
            <input
              type="text"
              value={newKeywords}
              onChange={(e) => setNewKeywords(e.target.value)}
              placeholder="keyword one, keyword two, keyword three"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div className="md:col-span-12">
            <label className="block text-xs font-heading font-semibold uppercase text-gray-500 mb-1">
              Notes (optional)
            </label>
            <textarea
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              rows={2}
              placeholder="Internal notes about this topic..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>
        {error && <p className="text-red-500 text-xs mt-3">{error}</p>}
        <div className="mt-4 flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            className="bg-primary text-white font-heading font-semibold text-sm uppercase px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {submitting ? 'Adding...' : '+ Add Topic'}
          </button>
        </div>
      </form>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {STATUS_FILTERS.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`text-xs font-heading font-semibold uppercase px-3 py-1.5 rounded-lg transition-colors ${
              filter === s
                ? 'bg-gray-900 text-white'
                : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Topic list */}
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : rows.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No topics with status &ldquo;{filter}&rdquo; yet.
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">
                  Topic
                </th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">
                  Category
                </th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">
                  Keywords
                </th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">
                  Priority
                </th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">
                  Status
                </th>
                <th className="text-right px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => (
                <tr key={row.id} className="hover:bg-gray-50 align-top">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-gray-900">{row.topic}</div>
                    {row.notes && (
                      <div className="text-xs text-gray-500 mt-0.5">{row.notes}</div>
                    )}
                    {row.failure_reason && (
                      <div className="text-xs text-red-500 mt-0.5">{row.failure_reason}</div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-heading font-semibold uppercase px-2 py-0.5 rounded">
                      {row.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {row.keywords && row.keywords.length > 0 ? (
                        row.keywords.slice(0, 4).map((k) => (
                          <span
                            key={k}
                            className="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded"
                          >
                            {k}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                      {row.keywords && row.keywords.length > 4 && (
                        <span className="text-xs text-gray-400">
                          +{row.keywords.length - 4}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="number"
                      defaultValue={row.priority}
                      onBlur={(e) => {
                        const next = Number(e.target.value)
                        if (next !== row.priority) handlePriorityChange(row.id, next)
                      }}
                      className="w-16 px-2 py-1 border border-gray-200 rounded text-xs"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={row.status}
                      onChange={(e) => handleStatusChange(row.id, e.target.value)}
                      className="text-xs border border-gray-200 rounded px-2 py-1 bg-white"
                    >
                      {STATUS_FILTERS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                    {row.used_post_id && (
                      <a
                        href={`/admin/blog/${row.used_post_id}/edit`}
                        className="block text-xs text-primary mt-1 hover:underline"
                      >
                        View post
                      </a>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex flex-col items-end gap-1.5">
                      {row.status === 'pending' && (
                        <button
                          onClick={() => handlePublishNow(row.id, row.topic)}
                          disabled={
                            publishState[row.id] === 'drafting' ||
                            publishState[row.id] === 'translating'
                          }
                          className={`text-xs font-heading font-semibold uppercase px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                            publishState[row.id] === 'done'
                              ? 'bg-green-100 text-green-800 border border-green-200'
                              : publishState[row.id] === 'error'
                              ? 'bg-red-50 text-red-700 border border-red-200'
                              : publishState[row.id] === 'drafting' ||
                                publishState[row.id] === 'translating'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-primary text-white hover:bg-primary-dark'
                          }`}
                        >
                          {publishState[row.id] === 'drafting' && 'Stage 1...'}
                          {publishState[row.id] === 'translating' && 'Stage 2...'}
                          {publishState[row.id] === 'done' && 'Done'}
                          {publishState[row.id] === 'error' && 'Failed'}
                          {(!publishState[row.id] || publishState[row.id] === 'idle') &&
                            'Publish Now'}
                        </button>
                      )}
                      {publishMessage[row.id] && (
                        <span
                          className={`text-[10px] max-w-[180px] text-right leading-tight ${
                            publishState[row.id] === 'error'
                              ? 'text-red-500'
                              : publishState[row.id] === 'done'
                              ? 'text-green-600'
                              : 'text-gray-500'
                          }`}
                          title={publishMessage[row.id]}
                        >
                          {publishMessage[row.id].slice(0, 80)}
                        </span>
                      )}
                      <button
                        onClick={() => handleDelete(row.id)}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold"
                      >
                        Delete
                      </button>
                    </div>
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
