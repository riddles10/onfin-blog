import { NextRequest, NextResponse } from 'next/server'
import { ADMIN_COOKIE_NAME, validateAdminCookie } from '@/lib/admin-auth'

// Guards every route under `/api/admin/*` with the admin session cookie.
// `/api/admin/auth` is exempt — that's the login endpoint, and it has
// its own server-side password check.
//
// Page-level gating (`/admin/*`) lives in app/admin/layout.tsx as a
// server-component cookie check, because rendering the login form
// inline produces a smoother UX than a redirect bounce.

export const config = {
  matcher: ['/api/admin/:path*'],
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Login endpoint is the one place that runs without a cookie.
  if (path === '/api/admin/auth') {
    return NextResponse.next()
  }

  const cookie = request.cookies.get(ADMIN_COOKIE_NAME)?.value
  if (await validateAdminCookie(cookie)) {
    return NextResponse.next()
  }

  return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
}
