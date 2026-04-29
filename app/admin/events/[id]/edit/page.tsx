'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { EVENT_CATEGORIES } from '@/lib/cms-config'

export default function EditEvent() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [titleEn, setTitleEn] = useState('')
  const [titleTh, setTitleTh] = useState('')
  const [descriptionEn, setDescriptionEn] = useState('')
  const [descriptionTh, setDescriptionTh] = useState('')
  const [venue, setVenue] = useState('')
  const [eventDate, setEventDate] = useState('')
  const [registrationUrl, setRegistrationUrl] = useState('')
  const [category, setCategory] = useState<string>(EVENT_CATEGORIES[0])
  const [coverImage, setCoverImage] = useState('')

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await fetch(`/api/admin/events/${id}`)
        if (res.ok) {
          const data = await res.json()
          setTitleEn(data.title_en || '')
          setTitleTh(data.title_th || '')
          setDescriptionEn(data.description_en || '')
          setDescriptionTh(data.description_th || '')
          setVenue(data.venue || '')
          setEventDate(data.event_date ? data.event_date.split('T')[0] : '')
          setRegistrationUrl(data.registration_url || '')
          setCategory(data.category || EVENT_CATEGORIES[0])
          setCoverImage(data.cover_image || '')
        } else {
          setError('Event not found')
        }
      } catch {
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }
    fetchEvent()
  }, [id])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')

    try {
      const res = await fetch(`/api/admin/events/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title_en: titleEn,
          title_th: titleTh,
          description_en: descriptionEn,
          description_th: descriptionTh,
          venue,
          event_date: eventDate,
          registration_url: registrationUrl,
          category,
          cover_image: coverImage,
        }),
      })

      if (res.ok) {
        router.push('/admin/events')
      } else {
        const data = await res.json()
        setError(data.error || 'Failed to update event')
      }
    } catch {
      setError('Failed to update event')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      if (res.ok) {
        router.push('/admin/events')
      }
    } catch {
      setError('Failed to delete event')
    }
  }

  if (loading) return <div className="text-gray-500">Loading...</div>
  if (error && !titleEn) return <div className="text-red-500">{error}</div>

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin/events" className="text-gray-400 hover:text-gray-600 text-sm font-semibold">
          &larr; Back
        </Link>
        <h1 className="font-heading font-bold text-3xl">Edit Event</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 max-w-3xl space-y-5">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Title (English) *</label>
            <input
              type="text"
              value={titleEn}
              onChange={(e) => setTitleEn(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Title (Thai)</label>
            <input
              type="text"
              value={titleTh}
              onChange={(e) => setTitleTh(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description (English)</label>
          <textarea
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Description (Thai)</label>
          <textarea
            value={descriptionTh}
            onChange={(e) => setDescriptionTh(e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Venue</label>
            <input
              type="text"
              value={venue}
              onChange={(e) => setVenue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Event Date *</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-semibold mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary bg-white"
            >
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Registration URL</label>
            <input
              type="url"
              value={registrationUrl}
              onChange={(e) => setRegistrationUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Cover Image URL</label>
          <input
            type="url"
            value={coverImage}
            onChange={(e) => setCoverImage(e.target.value)}
            placeholder="https://..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary text-white font-heading font-semibold text-sm uppercase px-6 py-2.5 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <Link href="/admin/events" className="text-sm text-gray-500 hover:text-gray-700 font-semibold">
              Cancel
            </Link>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="text-sm text-red-500 hover:text-red-700 font-semibold"
          >
            Delete Event
          </button>
        </div>
      </form>
    </div>
  )
}
