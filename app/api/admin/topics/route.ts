import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { POST_CATEGORIES } from '@/lib/cms-config'

// CRUD for the topic_queue table.
// Operator uses this from /admin/topics to pre-load themed series, planned
// content for launches, news reactions, etc. The daily-draft cron pops the
// highest-priority pending row each morning.

const VALID_CATEGORIES: readonly string[] = POST_CATEGORIES
const VALID_STATUSES = ['pending', 'used', 'skipped', 'failed']

export async function GET(request: NextRequest) {
  const supabase = getServiceClient()
  const status = request.nextUrl.searchParams.get('status')

  let query = supabase
    .from('topic_queue')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false })

  if (status && VALID_STATUSES.includes(status)) {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data)
}

export async function POST(request: NextRequest) {
  const supabase = getServiceClient()
  const body = await request.json()

  const topic = typeof body.topic === 'string' ? body.topic.trim() : ''
  if (!topic) {
    return NextResponse.json({ error: 'topic is required' }, { status: 400 })
  }

  const category =
    typeof body.category === 'string' && VALID_CATEGORIES.includes(body.category)
      ? body.category
      : POST_CATEGORIES[0]

  const keywords =
    Array.isArray(body.keywords)
      ? body.keywords.filter((k: unknown): k is string => typeof k === 'string' && k.trim().length > 0)
      : []

  const priority = Number.isFinite(body.priority) ? Number(body.priority) : 0
  const notes = typeof body.notes === 'string' ? body.notes.trim() || null : null

  const { data, error } = await supabase
    .from('topic_queue')
    .insert({
      topic,
      category,
      keywords,
      priority,
      notes,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json(data, { status: 201 })
}
