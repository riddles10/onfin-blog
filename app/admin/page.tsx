'use client'

import Link from 'next/link'

export default function AdminDashboard() {
  return (
    <div>
      <h1 className="font-heading font-bold text-3xl mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link
          href="/admin/blog"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
        >
          <h2 className="font-heading font-semibold text-lg">Blog Posts</h2>
          <p className="text-sm text-gray-500 mt-1">Create, edit, and manage blog content with AI translation</p>
        </Link>
        <Link
          href="/admin/authors"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
        >
          <h2 className="font-heading font-semibold text-lg">Authors</h2>
          <p className="text-sm text-gray-500 mt-1">Manage author profiles and bylines</p>
        </Link>
        <Link
          href="/admin/topics"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
        >
          <h2 className="font-heading font-semibold text-lg">Topics</h2>
          <p className="text-sm text-gray-500 mt-1">Manage the topic queue for scheduled publishing</p>
        </Link>
        <Link
          href="/admin/keywords"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
        >
          <h2 className="font-heading font-semibold text-lg">Keywords</h2>
          <p className="text-sm text-gray-500 mt-1">SEO keyword research and clustering</p>
        </Link>
        <Link
          href="/admin/events"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
        >
          <h2 className="font-heading font-semibold text-lg">Events</h2>
          <p className="text-sm text-gray-500 mt-1">Create and manage events</p>
        </Link>
        <Link
          href="/admin/pages"
          className="bg-white rounded-xl border border-gray-200 p-6 hover:border-gray-400 transition-colors"
        >
          <h2 className="font-heading font-semibold text-lg">Pages</h2>
          <p className="text-sm text-gray-500 mt-1">Manage static CMS pages</p>
        </Link>
      </div>
    </div>
  )
}
