// Server-side password gate for the admin panel + admin API routes.
//
// Why: the upstream ba-cms package shipped a client-only gate that read
// `NEXT_PUBLIC_ADMIN_PASSWORD` (which is bundled into the public JS at
// build time) and never enforced anything on the server. That meant the
// password was visible in the page source and `/api/admin/*` was wide
// open. This module fixes both problems by:
//
//   1. Reading `ADMIN_PASSWORD` server-side only (no NEXT_PUBLIC prefix).
//   2. Issuing an httpOnly session cookie whose value is a deterministic
//      SHA-256 of the password — when the password rotates, every cookie
//      stops validating, which logs everyone out.
//   3. Validating that cookie in middleware on every `/api/admin/*` call
//      and in the admin layout's server component for `/admin/*` pages.
//
// Implementation uses the Web Crypto API (no `node:crypto`) so the same
// helper runs in both Edge middleware and Node route handlers without
// runtime-specific shims.

export const ADMIN_COOKIE_NAME = 'cms_admin_auth'

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  )
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

/**
 * The cookie value the server expects. Returns null if the env var
 * isn't configured — callers should treat that as "auth disabled, deny
 * everything," not "anyone can log in."
 */
export async function expectedSessionToken(): Promise<string | null> {
  const pwd = process.env.ADMIN_PASSWORD
  if (!pwd || pwd.length === 0) return null
  // Versioned salt-like prefix so the token format can be invalidated
  // wholesale by changing the prefix in a future release.
  return sha256Hex(`onfin-admin-v1:${pwd}`)
}

/**
 * Constant-time compare of the cookie a client sent against what the
 * server expects. Safe against timing-based password recovery on the
 * cookie value (which is a hash of the password).
 */
export async function validateAdminCookie(
  cookieValue: string | undefined
): Promise<boolean> {
  if (!cookieValue) return false
  const expected = await expectedSessionToken()
  if (!expected) return false
  if (cookieValue.length !== expected.length) return false
  let diff = 0
  for (let i = 0; i < cookieValue.length; i++) {
    diff |= cookieValue.charCodeAt(i) ^ expected.charCodeAt(i)
  }
  return diff === 0
}
