'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Post } from '@/lib/supabase'

export default function AdminBlogList() {
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async () => {
    try {
      const res = await fetch('/api/admin/blog')
      if (res.ok) {
        const data = await res.json()
        setPosts(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const togglePublish = async (post: Post) => {
    try {
      await fetch(`/api/admin/blog/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          published: !post.published,
          published_at: !post.published ? new Date().toISOString() : post.published_at,
        }),
      })
      fetchPosts()
    } catch {
      // ignore
    }
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return
    try {
      await fetch(`/api/admin/blog/${id}`, { method: 'DELETE' })
      fetchPosts()
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-3xl">Blog Posts</h1>
        <Link
          href="/admin/blog/new"
          className="bg-primary text-white font-heading font-semibold text-sm uppercase px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          + New Post
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No posts yet. Create your first one!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Category</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Thai</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Status</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Date</th>
                <th className="text-right px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/blog/${post.id}/edit`} className="font-semibold text-gray-900 hover:text-primary">
                      {post.title_en}
                    </Link>
                    <p className="text-xs text-gray-400 mt-0.5">/{post.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-heading font-semibold uppercase px-2 py-0.5 rounded">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {post.title_th && post.body_th ? (
                      <span className="text-green-600 text-xs font-semibold">Translated</span>
                    ) : (
                      <span className="text-amber-600 text-xs font-semibold">Missing</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(post)}
                      className={`text-xs font-heading font-semibold uppercase px-2 py-0.5 rounded transition-colors ${
                        post.published
                          ? 'bg-green-100 text-green-800 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {post.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
                      : '—'}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${post.id}/edit`}
                      className="text-xs text-primary hover:text-primary-dark font-semibold mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deletePost(post.id)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
