'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import type { Event } from '@/lib/supabase'

export default function AdminEventsList() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchEvents()
  }, [])

  const fetchEvents = async () => {
    try {
      const res = await fetch('/api/admin/events')
      if (res.ok) {
        const data = await res.json()
        setEvents(data)
      }
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  const deleteEvent = async (id: string) => {
    if (!confirm('Delete this event? This cannot be undone.')) return
    try {
      await fetch(`/api/admin/events/${id}`, { method: 'DELETE' })
      fetchEvents()
    } catch {
      // ignore
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-heading font-bold text-3xl">Events</h1>
        <Link
          href="/admin/events/new"
          className="bg-primary text-white font-heading font-semibold text-sm uppercase px-4 py-2.5 rounded-lg hover:bg-primary-dark transition-colors"
        >
          + Add Event
        </Link>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : events.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center text-gray-500">
          No events yet. Create your first one!
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Title</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Venue</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Date</th>
                <th className="text-left px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Category</th>
                <th className="text-right px-4 py-3 font-heading font-semibold uppercase text-xs text-gray-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/events/${event.id}/edit`} className="font-semibold text-gray-900 hover:text-primary">
                      {event.title_en}
                    </Link>
                    {event.title_th && (
                      <p className="text-xs text-gray-400 mt-0.5">{event.title_th}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {event.venue || '—'}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {new Date(event.event_date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-block bg-gray-100 text-gray-700 text-xs font-heading font-semibold uppercase px-2 py-0.5 rounded">
                      {event.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/events/${event.id}/edit`}
                      className="text-xs text-primary hover:text-primary-dark font-semibold mr-3"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => deleteEvent(event.id)}
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
