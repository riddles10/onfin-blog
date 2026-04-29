import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .eq('slug', params.slug)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = getServiceClient()
  const body = await request.json()

  const {
    title_en,
    title_th,
    body_en,
    body_th,
    meta_description_en,
    meta_description_th,
    published,
  } = body

  const { data, error } = await supabase
    .from('pages')
    .update({
      title_en,
      title_th: title_th || null,
      body_en: body_en || '',
      body_th: body_th || null,
      meta_description_en: meta_description_en || null,
      meta_description_th: meta_description_th || null,
      published: published ?? true,
      updated_at: new Date().toISOString(),
    })
    .eq('slug', params.slug)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  const supabase = getServiceClient()

  const { error } = await supabase
    .from('pages')
    .delete()
    .eq('slug', params.slug)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
