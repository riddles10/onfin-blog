import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Event not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const { data, error } = await supabase
    .from('events')
    .update({
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
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()

  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
