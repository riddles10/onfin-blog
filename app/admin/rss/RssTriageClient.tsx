'use client'

import { useState, useTransition } from 'react'

// RSS triage UI. Three sections:
//   1. Webhook config (saved to cms_settings.rss_triage_webhook_url)
//   2. News feed list — Article / Carousel / Skip per item
//   3. Reels paste form — manual URL + headline → Reel button
//
// Each triage button POSTs to /api/admin/rss/triage which fires the
// configured webhook server-side and records the action in topic_queue
// so the item disappears from the news list on next refresh.

type FeedItem = {
  title: string
  link: string | null
  pubDate: string | null
  source: string
  category: string
}

type Props = {
  initialItems: FeedItem[]
  initialWebhookUrl: string
}

type Status = 'idle' | 'busy' | 'ok' | 'error'

type ItemState = {
  status: Status
  hint?: string
  hidden?: boolean
}

export default function RssTriageClient({ initialItems, initialWebhookUrl }: Props) {
  const [items, setItems] = useState<FeedItem[]>(initialItems)
  const [itemStates, setItemStates] = useState<Record<string, ItemState>>({})
  const [refreshing, startRefresh] = useTransition()

  // Webhook config
  const [webhookUrl, setWebhookUrl] = useState(initialWebhookUrl)
  const [webhookSavedUrl, setWebhookSavedUrl] = useState(initialWebhookUrl)
  const [webhookStatus, setWebhookStatus] = useState<Status>('idle')
  const [webhookMsg, setWebhookMsg] = useState<string>('')

  // Reels paste form
  const [reelUrl, setReelUrl] = useState('')
  const [reelHeadline, setReelHeadline] = useState('')
  const [reelStatus, setReelStatus] = useState<Status>('idle')
  const [reelMsg, setReelMsg] = useState('')

  const itemKey = (it: FeedItem) => `${it.source}::${it.link ?? it.title}`

  // ── Webhook config ──────────────────────────────────────────────────────
  async function saveWebhook() {
    setWebhookStatus('busy')
    setWebhookMsg('')
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rss_triage_webhook_url: webhookUrl.trim() || null }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setWebhookStatus('error')
        setWebhookMsg(data?.error || `HTTP ${res.status}`)
        return
      }
      setWebhookSavedUrl(webhookUrl.trim())
      setWebhookStatus('ok')
      setWebhookMsg('Saved')
      setTimeout(() => setWebhookStatus('idle'), 1800)
    } catch (err) {
      setWebhookStatus('error')
      setWebhookMsg(err instanceof Error ? err.message : 'failed to save')
    }
  }

  // ── Refresh feeds ───────────────────────────────────────────────────────
  function refreshFeeds() {
    startRefresh(async () => {
      try {
        const res = await fetch('/api/admin/rss/feed', { cache: 'no-store' })
        const data = await res.json()
        if (Array.isArray(data?.items)) {
          setItems(data.items)
          setItemStates({})
        }
      } catch (err) {
        console.warn('refresh failed', err)
      }
    })
  }

  // ── Triage one news item ────────────────────────────────────────────────
  async function triageItem(
    it: FeedItem,
    type: 'article' | 'carousel' | 'skip'
  ) {
    const key = itemKey(it)
    setItemStates((s) => ({ ...s, [key]: { status: 'busy' } }))
    try {
      const res = await fetch('/api/admin/rss/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          headline: it.title,
          link: it.link,
          source: it.source,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setItemStates((s) => ({
          ...s,
          [key]: { status: 'error', hint: data?.error || `HTTP ${res.status}` },
        }))
        return
      }
      // Skip → just hide. Otherwise show success then hide.
      setItemStates((s) => ({
        ...s,
        [key]: {
          status: 'ok',
          hint: type === 'skip'
            ? 'Skipped'
            : data?.webhook?.ok === false
            ? `Webhook: ${data.webhook.error || 'failed'}`
            : `Sent as #${type}`,
          hidden: false,
        },
      }))
      setTimeout(() => {
        setItemStates((s) => ({ ...s, [key]: { ...s[key], hidden: true } }))
      }, 900)
    } catch (err) {
      setItemStates((s) => ({
        ...s,
        [key]: {
          status: 'error',
          hint: err instanceof Error ? err.message : 'request failed',
        },
      }))
    }
  }

  // ── Reels paste form ────────────────────────────────────────────────────
  async function submitReel(e: React.FormEvent) {
    e.preventDefault()
    if (reelStatus === 'busy') return
    if (!reelUrl.trim() || !reelHeadline.trim()) {
      setReelStatus('error')
      setReelMsg('URL and headline are required')
      return
    }
    setReelStatus('busy')
    setReelMsg('')
    try {
      const res = await fetch('/api/admin/rss/triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'reel',
          headline: reelHeadline.trim(),
          link: reelUrl.trim(),
          source: 'manual paste',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setReelStatus('error')
        setReelMsg(data?.error || `HTTP ${res.status}`)
        return
      }
      setReelStatus('ok')
      setReelMsg(
        data?.webhook?.ok === false
          ? `Recorded, but webhook failed: ${data.webhook.error || 'unknown'}`
          : 'Sent as #reel'
      )
      setReelUrl('')
      setReelHeadline('')
      setTimeout(() => {
        setReelStatus('idle')
        setReelMsg('')
      }, 2500)
    } catch (err) {
      setReelStatus('error')
      setReelMsg(err instanceof Error ? err.message : 'request failed')
    }
  }

  const visibleItems = items.filter((it) => !itemStates[itemKey(it)]?.hidden)

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-bold text-brand-black">
          RSS triage
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Pull the latest forex headlines, route each to a blog article, an
          Instagram carousel, or skip. Reels get a manual paste form below
          since RSS doesn&apos;t carry video.
        </p>
      </header>

      {/* ── Webhook config ─────────────────────────────────────────────── */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-black">
          Webhook URL
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Where every triage decision is sent. Body format is plain text:{' '}
          <code className="rounded bg-ink-50 px-1 py-0.5 text-xs">#article</code>{' '}
          /{' '}
          <code className="rounded bg-ink-50 px-1 py-0.5 text-xs">#carousel</code>{' '}
          /{' '}
          <code className="rounded bg-ink-50 px-1 py-0.5 text-xs">#reel</code>,
          then headline, then link.
        </p>
        <div className="mt-4 flex gap-2">
          <input
            type="url"
            inputMode="url"
            placeholder="https://hooks.example.com/services/..."
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            className="flex-1 rounded-lg border border-ink-200 px-3 py-2 text-sm text-brand-black focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-lime/30"
          />
          <button
            type="button"
            onClick={saveWebhook}
            disabled={webhookStatus === 'busy' || webhookUrl === webhookSavedUrl}
            className="rounded-pill bg-brand-lime px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-brand-black transition hover:bg-brand-lime/90 disabled:opacity-50"
          >
            {webhookStatus === 'busy' ? 'Saving…' : 'Save'}
          </button>
        </div>
        {webhookStatus !== 'idle' && webhookMsg && (
          <p
            className={`mt-2 text-xs ${
              webhookStatus === 'error' ? 'text-red-600' : 'text-emerald-700'
            }`}
          >
            {webhookMsg}
          </p>
        )}
        {!webhookSavedUrl && (
          <p className="mt-2 text-xs text-amber-700">
            No webhook configured yet — triage actions will record but
            won&apos;t fire downstream until you save a URL.
          </p>
        )}
      </section>

      {/* ── News (Articles + Carousels) ───────────────────────────────── */}
      <section className="rounded-2xl border border-ink-100 bg-white">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <div>
            <h2 className="font-display text-lg font-semibold text-brand-black">
              News — Articles &amp; Carousels
            </h2>
            <p className="mt-0.5 text-xs text-ink-500">
              Live pull from Investing.com, FXStreet, ForexLive. Already-triaged
              items are filtered out for 30 days.
            </p>
          </div>
          <button
            type="button"
            onClick={refreshFeeds}
            disabled={refreshing}
            className="rounded-pill border border-ink-200 bg-white px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-black transition hover:border-brand-lime hover:bg-brand-lime/5 disabled:opacity-50"
          >
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {visibleItems.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-ink-500">
            No fresh items right now. Try Refresh in a few minutes — feeds
            update on their own schedule.
          </div>
        ) : (
          <ul className="divide-y divide-ink-100">
            {visibleItems.map((it) => {
              const key = itemKey(it)
              const state = itemStates[key] || { status: 'idle' as Status }
              return (
                <li key={key} className="px-6 py-5">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      {it.link ? (
                        <a
                          href={it.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-display text-base font-semibold text-brand-black hover:text-brand-blue"
                        >
                          {it.title}
                        </a>
                      ) : (
                        <span className="font-display text-base font-semibold text-brand-black">
                          {it.title}
                        </span>
                      )}
                      <p className="mt-1 text-xs text-ink-400">
                        <span className="font-semibold text-ink-500">{it.source}</span>
                        {it.pubDate && (
                          <>
                            {' · '}
                            <time dateTime={it.pubDate}>
                              {new Date(it.pubDate).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </time>
                          </>
                        )}
                      </p>
                      {state.hint && (
                        <p
                          className={`mt-1 text-xs ${
                            state.status === 'error' ? 'text-red-600' : 'text-emerald-700'
                          }`}
                        >
                          {state.hint}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => triageItem(it, 'article')}
                        disabled={state.status === 'busy'}
                        className="rounded-pill bg-brand-lime px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-black transition hover:bg-brand-lime/90 disabled:opacity-50"
                      >
                        Article
                      </button>
                      <button
                        type="button"
                        onClick={() => triageItem(it, 'carousel')}
                        disabled={state.status === 'busy'}
                        className="rounded-pill border border-brand-lime bg-brand-lime/10 px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-brand-black transition hover:bg-brand-lime/20 disabled:opacity-50"
                      >
                        Carousel
                      </button>
                      <button
                        type="button"
                        onClick={() => triageItem(it, 'skip')}
                        disabled={state.status === 'busy'}
                        className="rounded-pill border border-ink-200 bg-white px-4 py-1.5 font-display text-xs font-semibold uppercase tracking-[0.12em] text-ink-500 transition hover:border-ink-400 hover:text-brand-black disabled:opacity-50"
                      >
                        Skip
                      </button>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </section>

      {/* ── Reels (manual paste) ──────────────────────────────────────── */}
      <section className="rounded-2xl border border-ink-100 bg-white p-6">
        <h2 className="font-display text-lg font-semibold text-brand-black">
          Reels — manual paste
        </h2>
        <p className="mt-1 text-sm text-ink-500">
          Found a forex video on TikTok / YouTube / IG / Twitter? Drop the URL
          and a one-line headline. Click <strong>Reel</strong> to send it to
          the webhook.
        </p>
        <form onSubmit={submitReel} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Video URL
            </label>
            <input
              type="url"
              inputMode="url"
              placeholder="https://www.tiktok.com/@..."
              value={reelUrl}
              onChange={(e) => setReelUrl(e.target.value)}
              disabled={reelStatus === 'busy'}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-brand-black focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-lime/30 disabled:opacity-60"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">
              Headline
            </label>
            <input
              type="text"
              placeholder="What's this video about, in one line?"
              value={reelHeadline}
              onChange={(e) => setReelHeadline(e.target.value)}
              disabled={reelStatus === 'busy'}
              className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-brand-black focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-lime/30 disabled:opacity-60"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={
                reelStatus === 'busy' || !reelUrl.trim() || !reelHeadline.trim()
              }
              className="rounded-pill bg-brand-lime px-5 py-2 font-display text-sm font-semibold uppercase tracking-[0.12em] text-brand-black transition hover:bg-brand-lime/90 disabled:opacity-50"
            >
              {reelStatus === 'busy' ? 'Sending…' : 'Reel'}
            </button>
            {reelMsg && (
              <span
                className={`text-xs ${
                  reelStatus === 'error' ? 'text-red-600' : 'text-emerald-700'
                }`}
              >
                {reelMsg}
              </span>
            )}
          </div>
        </form>
      </section>
    </div>
  )
}
