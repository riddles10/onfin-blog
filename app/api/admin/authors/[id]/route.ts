import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Author not found' }, { status: 404 })
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
    name,
    name_th,
    bio_en,
    bio_th,
    avatar_url,
    twitter,
    linkedin,
    website,
    is_default,
  } = body

  // If switching default to this author, clear any previous default first —
  // the partial unique index only allows one is_default=true row.
  if (is_default) {
    await supabase
      .from('authors')
      .update({ is_default: false })
      .eq('is_default', true)
      .neq('id', params.id)
  }

  const { data, error } = await supabase
    .from('authors')
    .update({
      slug,
      name,
      name_th: name_th || null,
      bio_en: bio_en || null,
      bio_th: bio_th || null,
      avatar_url: avatar_url || null,
      twitter: twitter || null,
      linkedin: linkedin || null,
      website: website || null,
      is_default: !!is_default,
      updated_at: new Date().toISOString(),
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
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()

  // Refuse to delete the default author. If the operator really needs to,
  // they should first promote another author to default.
  const { data: existing } = await supabase
    .from('authors')
    .select('is_default')
    .eq('id', params.id)
    .maybeSingle()

  if (existing?.is_default) {
    return NextResponse.json(
      { error: 'Cannot delete the default author. Promote another author first.' },
      { status: 400 }
    )
  }

  const { error } = await supabase.from('authors').delete().eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
