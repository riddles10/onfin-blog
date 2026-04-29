'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import BlogEditor from '@/components/BlogEditor'

export default function EditBlogPost() {
  const params = useParams()
  const id = params.id as string
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/admin/blog/${id}`)
        if (res.ok) {
          const data = await res.json()
          setPost(data)
        } else {
          setError('Post not found')
        }
      } catch {
        setError('Failed to load post')
      } finally {
        setLoading(false)
      }
    }
    fetchPost()
  }, [id])

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <h1 className="font-heading font-bold text-3xl mb-6">Edit Post</h1>
      <BlogEditor initialData={post} />
    </div>
  )
}
