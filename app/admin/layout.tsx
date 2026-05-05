import { cookies } from 'next/headers'
import Link from 'next/link'
import { ADMIN_TITLE } from '@/lib/cms-config'
import { ADMIN_COOKIE_NAME, validateAdminCookie } from '@/lib/admin-auth'
import LoginForm from './LoginForm'
import LogoutButton from './LogoutButton'

// Force dynamic rendering for the entire /admin tree.
//
// The admin pages all read from Supabase at request time and use
// useSearchParams() in BlogEditor — both of which conflict with
// static prerender. Without this, `next build` tries to prerender
// every /admin/* route, hits the useSearchParams() bailout, and
// fails the production build.
export const dynamic = 'force-dynamic'

// Admin shell.
//
// Reads the session cookie before rendering anything — if it's missing
// or invalid, the visitor sees the login form and never receives the
// admin children in their response. The shared root layout already
// provides <html><body> + fonts + globals.css, so this nested layout
// just contributes content.
//
// The cookie is set by /api/admin/auth on a successful POST { password };
// every other /api/admin/* route is guarded by middleware.ts which
// validates the same cookie.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isAuthed = await validateAdminCookie(
    cookieStore.get(ADMIN_COOKIE_NAME)?.value
  )

  if (!isAuthed) {
    return <LoginForm />
  }

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
            <LogoutButton />
          </div>
        </div>
      </nav>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
