import { NextRequest, NextResponse } from 'next/server'
import {
  ADMIN_COOKIE_NAME,
  expectedSessionToken,
} from '@/lib/admin-auth'

// Login + logout for the admin panel.
//
// POST   { password } → if it matches process.env.ADMIN_PASSWORD, set
//                       the session cookie and return { ok: true }.
// DELETE                → clear the cookie.
//
// This is the ONLY admin-prefixed route excluded from the middleware
// guard (see middleware.ts). Everything else under /api/admin/* requires
// a valid cookie.

export const runtime = 'nodejs'

const COOKIE_LIFETIME_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function POST(request: NextRequest) {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    // No password configured = deny everything. Explicit failure mode
    // is safer than allowing a default.
    return NextResponse.json(
      { ok: false, error: 'admin password not configured' },
      { status: 500 }
    )
  }

  let body: unknown = {}
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 })
  }
  const submitted =
    body && typeof body === 'object' && 'password' in body
      ? (body as { password?: unknown }).password
      : undefined

  if (typeof submitted !== 'string' || submitted !== expected) {
    return NextResponse.json({ ok: false }, { status: 401 })
  }

  const token = await expectedSessionToken()
  if (!token) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }

  const res = NextResponse.json({ ok: true })
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: COOKIE_LIFETIME_SECONDS,
    path: '/',
  })
  return res
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true })
  res.cookies.delete(ADMIN_COOKIE_NAME)
  return res
}
