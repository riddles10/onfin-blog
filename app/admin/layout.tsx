import Link from 'next/link'
import { ADMIN_TITLE } from '@/lib/cms-config'

// Force dynamic rendering for the entire /admin tree.
//
// The admin pages all read from Supabase at request time and use
// useSearchParams() in BlogEditor — both of which conflict with
// static prerender. Without this, `next build` tries to prerender
// every /admin/* route, hits the useSearchParams() bailout, and
// fails the production build (see Dockerfile RUN npm run build).
//
// Admin pages are operator-facing and never need to be static, so
// opting the whole subtree out is the right move.
export const dynamic = 'force-dynamic'

// Admin shell.
//
// ⚠ Auth is currently DISABLED — the env-var pipeline isn't reliably
//   wiring through to the production container, and the team needs the
//   blog tool urgently. Once DevOps confirms env propagation, re-enable
//   the gate by:
//
//     1. Restore the cookie check from git history (commit 1cdef31).
//     2. Restore middleware.ts at the repo root.
//
//   The supporting code (lib/admin-auth.ts, /api/admin/auth route,
//   LoginForm.tsx, LogoutButton.tsx) is intentionally left in place
//   so re-enabling is a one-revert change.
//
// Until then, anyone who can reach /admin can edit the blog. Make sure
// the container's port stays bound to 127.0.0.1 and Nginx puts at least
// basic-auth in front of /admin/ at the reverse-proxy layer.

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-ink-50">
      <nav className="bg-gray-900 text-white">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <span className="font-display text-xl font-bold text-brand-lime">
                {ADMIN_TITLE}
              </span>
            </Link>
            <Link
              href="/admin/blog"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              Blog
            </Link>
            <Link
              href="/admin/rss"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              RSS
            </Link>
            <Link
              href="/admin/authors"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              Authors
            </Link>
            <Link
              href="/admin/topics"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              Topics
            </Link>
            <Link
              href="/admin/keywords"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              Keywords
            </Link>
            <Link
              href="/admin/events"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              Events
            </Link>
            <Link
              href="/admin/pages"
              className="font-display text-sm font-semibold uppercase text-gray-300 transition-colors hover:text-white"
            >
              Pages
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-xs text-gray-400 transition-colors hover:text-white"
            >
              View site →
            </Link>
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
