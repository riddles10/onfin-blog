import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

// Authors CRUD — mirrors the pattern used for /api/admin/blog.
// GET lists all authors sorted with the default author first, then by name.
// POST creates a new author. A slug is required; if omitted we derive one
// from the display name using a simple kebab-case transform.

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('authors')
    .select('*')
    .order('is_default', { ascending: false })
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  const body = await request.json()

  const {
    slug: rawSlug,
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

  if (!name) {
    return NextResponse.json({ error: 'Name is required' }, { status: 400 })
  }

  // If no slug provided, derive one from the name so the admin UI doesn't
  // force the user to think about URL-safe identifiers.
  const slug = (rawSlug || slugify(name)).trim()
  if (!slug) {
    return NextResponse.json({ error: 'Slug could not be derived from name' }, { status: 400 })
  }

  // If this row is being marked default, first clear any existing default —
  // the partial unique index would otherwise reject the insert.
  if (is_default) {
    await supabase.from('authors').update({ is_default: false }).eq('is_default', true)
  }

  const { data, error } = await supabase
    .from('authors')
    .insert({
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
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60)
}
