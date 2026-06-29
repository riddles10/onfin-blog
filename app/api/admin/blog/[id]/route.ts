import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
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
    slug,
    title_en,
    title_th,
    body_en,
    body_th,
    excerpt_en,
    excerpt_th,
    category,
    post_type,
    cover_image,
    published,
    published_at,
    blog_author_id,
  } = body

  const { data, error } = await supabase
    .from('posts')
    .update({
      slug,
      title_en,
      title_th: title_th || null,
      body_en: body_en || '',
      body_th: body_th || null,
      excerpt_en: excerpt_en || null,
      excerpt_th: excerpt_th || null,
      category: category || 'tips',
      ...(post_type !== undefined ? { post_type: post_type === 'news' ? 'news' : 'article' } : {}),
      cover_image: cover_image || null,
      published,
      published_at,
      blog_author_id: blog_author_id || null,
    })
    .eq('id', params.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()
  const body = await request.json()

  const { data, error } = await supabase
    .from('posts')
    .update(body)
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
    .from('posts')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
