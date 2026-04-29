'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import '@/app/globals.css'
import { ADMIN_TITLE, ADMIN_SESSION_KEY, ADMIN_PASSWORD_ENV } from '@/lib/cms-config'

const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin2026'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [authenticated, setAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(ADMIN_SESSION_KEY)
    if (stored === 'true') setAuthenticated(true)
    setChecking(false)
  }, [])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true')
      setAuthenticated(true)
      setError(false)
    } else {
      setError(true)
    }
  }

  if (checking) {
    return (
      <html lang="en">
        <body className="font-body bg-gray-50" />
      </html>
    )
  }

  if (!authenticated) {
    return (
      <html lang="en">
        <body className="font-body bg-gray-50 min-h-screen flex items-center justify-center">
          <form onSubmit={handleLogin} className="bg-white rounded-xl border border-gray-200 p-8 w-full max-w-sm shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <span className="font-heading font-extrabold text-2xl text-primary">{ADMIN_TITLE}</span>
            </div>
            <label className="block text-sm font-semibold mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
              autoFocus
            />
            {error && <p className="text-red-500 text-xs mt-1">Incorrect password</p>}
            <button
              type="submit"
              className="mt-4 w-full bg-primary text-white font-heading font-semibold text-sm uppercase py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
            >
              Sign in
            </button>
          </form>
        </body>
      </html>
    )
  }

  return (
    <html lang="en">
      <body className="font-body bg-gray-50 min-h-screen">
        {/* Admin navbar */}
        <nav className="bg-gray-900 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="flex items-center gap-2">
                <span className="font-heading font-extrabold text-xl text-primary">{ADMIN_TITLE}</span>
              </Link>
              <Link href="/admin/blog" className="text-sm text-gray-300 hover:text-white transition-colors font-heading font-semibold uppercase">
                Blog
              </Link>
              <Link href="/admin/authors" className="text-sm text-gray-300 hover:text-white transition-colors font-heading font-semibold uppercase">
                Authors
              </Link>
              <Link href="/admin/topics" className="text-sm text-gray-300 hover:text-white transition-colors font-heading font-semibold uppercase">
                Topics
              </Link>
              <Link href="/admin/keywords" className="text-sm text-gray-300 hover:text-white transition-colors font-heading font-semibold uppercase">
                Keywords
              </Link>
              <Link href="/admin/events" className="text-sm text-gray-300 hover:text-white transition-colors font-heading font-semibold uppercase">
                Events
              </Link>
              <Link href="/admin/pages" className="text-sm text-gray-300 hover:text-white transition-colors font-heading font-semibold uppercase">
                Pages
              </Link>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xs text-gray-400 hover:text-white transition-colors">
                View site &rarr;
              </Link>
              <button
                onClick={() => {
                  sessionStorage.removeItem(ADMIN_SESSION_KEY)
                  setAuthenticated(false)
                }}
                className="text-xs text-gray-400 hover:text-white transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  )
}
