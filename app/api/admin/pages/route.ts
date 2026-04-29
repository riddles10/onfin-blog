import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('pages')
    .select('*')
    .order('slug', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  const body = await request.json()

  const {
    slug,
    title_en,
    title_th,
    body_en,
    body_th,
    meta_description_en,
    meta_description_th,
    published,
  } = body

  if (!title_en || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('pages')
    .insert({
      slug,
      title_en,
      title_th: title_th || null,
      body_en: body_en || '',
      body_th: body_th || null,
      meta_description_en: meta_description_en || null,
      meta_description_th: meta_description_th || null,
      published: published ?? true,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
