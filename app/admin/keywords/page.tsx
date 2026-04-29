'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface SeedData {
  brandModels: string[]
  brands: string[]
  categories: string[]
}

interface ExpandResult {
  en: string[]
  th: string[]
  total: number
}

interface Cluster {
  primary: string
  secondary: string[]
  intent: string
  article_title: string
  category: string
  reason: string
}

export default function KeywordsPage() {
  const router = useRouter()
  const [seeds, setSeeds] = useState<SeedData | null>(null)
  const [seedInput, setSeedInput] = useState('')
  const [expanding, setExpanding] = useState(false)
  const [expanded, setExpanded] = useState<ExpandResult | null>(null)
  const [clustering, setClustering] = useState(false)
  const [clusters, setClusters] = useState<Cluster[] | null>(null)
  const [error, setError] = useState('')
  // Per-cluster state for the "Add to Queue" action so each row can show its
  // own spinner / success / error without blocking the others.
  const [queueState, setQueueState] = useState<Record<number, 'idle' | 'adding' | 'added' | 'error'>>({})

  useEffect(() => {
    fetch('/api/admin/keywords/seeds')
      .then((r) => r.json())
      .then((d) => setSeeds(d))
      .catch(() => {})
  }, [])

  const handleExpand = async () => {
    if (!seedInput.trim()) return
    setExpanding(true)
    setExpanded(null)
    setClusters(null)
    setError('')
    try {
      const res = await fetch('/api/admin/keywords/expand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: seedInput.trim() }),
      })
      if (res.ok) {
        const data = await res.json()
        setExpanded(data)
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to expand keywords')
      }
    } catch {
      setError('Failed to expand keywords')
    } finally {
      setExpanding(false)
    }
  }

  const handleCluster = async () => {
    if (!expanded) return
    setClustering(true)
    setError('')
    try {
      const all = [...expanded.en, ...expanded.th]
      const res = await fetch('/api/admin/keywords/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: all }),
      })
      if (res.ok) {
        const data = await res.json()
        setClusters(data.clusters || [])
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to cluster keywords')
      }
    } catch {
      setError('Failed to cluster keywords')
    } finally {
      setClustering(false)
    }
  }

  const handleUseCluster = (cluster: Cluster) => {
    const params = new URLSearchParams({
      topic: cluster.article_title,
      keywords: [cluster.primary, ...cluster.secondary].join(','),
      category: cluster.category,
    })
    router.push(`/admin/blog/new?${params.toString()}`)
  }

  // Push a cluster into the daily-publish queue instead of generating now.
  const handleAddToQueue = async (cluster: Cluster, index: number) => {
    setQueueState((prev) => ({ ...prev, [index]: 'adding' }))
    setError('')
    try {
      const res = await fetch('/api/admin/topics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: cluster.article_title,
          category: cluster.category,
          keywords: [cluster.primary, ...cluster.secondary],
          priority: 10,
          notes: `From keyword cluster — ${cluster.intent} intent. ${cluster.reason}`,
        }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || `HTTP ${res.status}`)
      }
      setQueueState((prev) => ({ ...prev, [index]: 'added' }))
      // Clear the success indicator after 3s so the button can be re-used
      setTimeout(() => {
        setQueueState((prev) => ({ ...prev, [index]: 'idle' }))
      }, 3000)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to add to queue'
      setError(`Add to queue failed: ${msg}`)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      setQueueState((prev) => ({ ...prev, [index]: 'error' }))
      setTimeout(() => {
        setQueueState((prev) => ({ ...prev, [index]: 'idle' }))
      }, 3000)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-heading font-bold text-3xl">Keyword Research</h1>
        <p className="text-sm text-gray-500 mt-1">
          Find SEO opportunities from real Google search queries, then turn them into blog posts.
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg mb-4">
          {error}
        </div>
      )}

      {/* Step 1 — Seed */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="font-heading font-semibold text-lg mb-1">1. Pick a seed keyword</h2>
        <p className="text-xs text-gray-500 mb-3">
          A short term to start from. We'll fan it out using Google Autocomplete.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={seedInput}
            onChange={(e) => setSeedInput(e.target.value)}
            placeholder="e.g. a topic, brand, or category"
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleExpand()
            }}
          />
          <button
            onClick={handleExpand}
            disabled={expanding || !seedInput.trim()}
            className="bg-primary text-white text-sm font-heading font-semibold uppercase px-5 py-2 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
          >
            {expanding ? 'Expanding...' : 'Expand'}
          </button>
        </div>

        {seeds && (seeds.brandModels.length > 0 || seeds.brands.length > 0) && (
          <div className="mt-4 space-y-3">
            {seeds.brandModels.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">From your listings:</p>
                <div className="flex flex-wrap gap-1.5">
                  {seeds.brandModels.map((bm) => (
                    <button
                      key={bm}
                      onClick={() => setSeedInput(bm)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full"
                    >
                      {bm}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {seeds.brands.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-1.5">Brands:</p>
                <div className="flex flex-wrap gap-1.5">
                  {seeds.brands.map((b) => (
                    <button
                      key={b}
                      onClick={() => setSeedInput(b)}
                      className="text-xs bg-gray-100 hover:bg-gray-200 px-2.5 py-1 rounded-full"
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Step 2 — Expanded raw keywords */}
      {expanded && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between mb-3 gap-3">
            <div>
              <h2 className="font-heading font-semibold text-lg">2. Raw keywords ({expanded.total})</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Real search queries pulled from Google Autocomplete.
              </p>
            </div>
            <button
              onClick={handleCluster}
              disabled={clustering || expanded.total === 0}
              className="bg-blue-600 text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 whitespace-nowrap"
            >
              {clustering ? 'Clustering...' : 'Cluster with AI'}
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                English ({expanded.en.length})
              </h3>
              <div className="text-xs text-gray-700 space-y-1 max-h-72 overflow-y-auto bg-gray-50 rounded-lg p-3 font-mono">
                {expanded.en.length === 0 ? (
                  <p className="text-gray-400">No suggestions found</p>
                ) : (
                  expanded.en.map((k) => <div key={k}>{k}</div>)
                )}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                Thai ({expanded.th.length})
              </h3>
              <div className="text-xs text-gray-700 space-y-1 max-h-72 overflow-y-auto bg-gray-50 rounded-lg p-3 font-mono">
                {expanded.th.length === 0 ? (
                  <p className="text-gray-400">No suggestions found</p>
                ) : (
                  expanded.th.map((k) => <div key={k}>{k}</div>)
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Clusters */}
      {clusters && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="font-heading font-semibold text-lg mb-1">3. Article topic clusters</h2>
          <p className="text-xs text-gray-500 mb-4">
            Grouped by intent. Click <strong>Add to Queue</strong> to send it to the daily auto-publish queue, or <strong>Generate post</strong> to jump into the blog editor right now.
          </p>
          {clusters.length === 0 ? (
            <p className="text-sm text-gray-400">No clusters returned.</p>
          ) : (
            <div className="space-y-3">
              {clusters.map((c, i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex-1">
                      <h3 className="font-heading font-semibold text-base text-gray-900">{c.article_title}</h3>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                          {c.intent}
                        </span>
                        <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                          {c.category}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-stretch">
                      <button
                        onClick={() => handleAddToQueue(c, i)}
                        disabled={queueState[i] === 'adding'}
                        className={`text-xs font-heading font-semibold uppercase px-3 py-2 rounded-lg transition-colors whitespace-nowrap border ${
                          queueState[i] === 'added'
                            ? 'bg-green-50 border-green-200 text-green-700'
                            : queueState[i] === 'error'
                            ? 'bg-red-50 border-red-200 text-red-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {queueState[i] === 'adding' && 'Adding...'}
                        {queueState[i] === 'added' && 'Added'}
                        {queueState[i] === 'error' && 'Failed'}
                        {(!queueState[i] || queueState[i] === 'idle') && '+ Add to Queue'}
                      </button>
                      <button
                        onClick={() => handleUseCluster(c)}
                        className="bg-primary text-white text-xs font-heading font-semibold uppercase px-3 py-2 rounded-lg hover:bg-primary-dark transition-colors whitespace-nowrap"
                      >
                        Generate post
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{c.reason}</p>
                  <div className="text-xs text-gray-500">
                    <span className="font-semibold text-gray-700">Primary:</span> {c.primary}
                  </div>
                  {c.secondary.length > 0 && (
                    <div className="text-xs text-gray-500 mt-1">
                      <span className="font-semibold text-gray-700">Secondary:</span>{' '}
                      {c.secondary.join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
