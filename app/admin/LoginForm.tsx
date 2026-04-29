'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ADMIN_TITLE } from '@/lib/cms-config'

// Login form rendered by the admin layout when the session cookie is
// missing or invalid. POSTs to /api/admin/auth which compares the
// password against process.env.ADMIN_PASSWORD server-side and (on
// match) sets the httpOnly session cookie.
export default function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitting) return
    setSubmitting(true)
    setError(false)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        // Cookie is now set. router.refresh() re-runs the server layout
        // which sees the cookie and renders the admin shell.
        router.refresh()
        return
      }
      setError(true)
    } catch {
      setError(true)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ink-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl border border-ink-100 bg-white p-8 shadow-sm"
      >
        <h1 className="font-display text-2xl font-semibold text-brand-black">
          {ADMIN_TITLE}
        </h1>
        <p className="mt-1 text-sm text-ink-500">
          Sign in to manage posts, authors, and topics.
        </p>

        <label className="mt-6 block text-sm font-semibold text-brand-black">
          Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={submitting}
          autoFocus
          autoComplete="current-password"
          className="mt-1 w-full rounded-lg border border-ink-200 px-3 py-2 text-sm text-brand-black focus:border-brand-lime focus:outline-none focus:ring-2 focus:ring-brand-lime/30 disabled:opacity-60"
        />
        {error && (
          <p className="mt-2 text-xs text-red-600">Incorrect password.</p>
        )}

        <button
          type="submit"
          disabled={submitting || password.length === 0}
          className="mt-5 w-full rounded-pill bg-brand-lime py-2.5 font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-black transition hover:bg-brand-lime/90 disabled:opacity-50"
        >
          {submitting ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </div>
  )
}
