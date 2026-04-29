import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .order('event_date', { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  const body = await request.json()

  const {
    title_en,
    title_th,
    description_en,
    description_th,
    venue,
    event_date,
    registration_url,
    category,
    cover_image,
  } = body

  if (!title_en || !event_date) {
    return NextResponse.json({ error: 'Title and event date are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('events')
    .insert({
      title_en,
      title_th: title_th || null,
      description_en: description_en || null,
      description_th: description_th || null,
      venue: venue || null,
      event_date,
      registration_url: registration_url || null,
      category: category || 'webinar',
      cover_image: cover_image || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
