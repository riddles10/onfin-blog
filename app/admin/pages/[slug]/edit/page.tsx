'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import PageEditor from '@/components/PageEditor'

export default function EditPage() {
  const params = useParams()
  const slug = params.slug as string
  const [page, setPage] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPage = async () => {
      try {
        const res = await fetch(`/api/admin/pages/${slug}`)
        if (res.ok) {
          const data = await res.json()
          setPage(data)
        } else {
          setError('Page not found')
        }
      } catch {
        setError('Failed to load page')
      } finally {
        setLoading(false)
      }
    }
    fetchPage()
  }, [slug])

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (error) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <h1 className="font-heading font-bold text-3xl mb-6">Edit Page</h1>
      <PageEditor initialData={page} isEditing />
    </div>
  )
}
