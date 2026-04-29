'use client'

import { useRouter } from 'next/navigation'

// Small client island for the admin nav. Calls DELETE /api/admin/auth
// to clear the session cookie, then refreshes the layout which will
// flip back to the LoginForm.
export default function LogoutButton() {
  const router = useRouter()

  async function handleLogout() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.refresh()
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="text-xs text-gray-400 hover:text-white transition-colors"
    >
      Logout
    </button>
  )
}
