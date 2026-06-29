import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('created_at', { ascending: false })

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
    excerpt_en,
    excerpt_th,
    category,
    post_type,
    cover_image,
    published,
    published_at,
    blog_author_id,
  } = body

  if (!title_en || !slug) {
    return NextResponse.json({ error: 'Title and slug are required' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('posts')
    .insert({
      slug,
      title_en,
      title_th: title_th || null,
      body_en: body_en || '',
      body_th: body_th || null,
      excerpt_en: excerpt_en || null,
      excerpt_th: excerpt_th || null,
      category: category || 'tips',
      post_type: post_type === 'news' ? 'news' : 'article',
      cover_image: cover_image || null,
      published: published || false,
      published_at: published_at || null,
      blog_author_id: blog_author_id || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
