import { NextRequest, NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'
import { POST_CATEGORIES } from '@/lib/cms-config'

const VALID_CATEGORIES: readonly string[] = POST_CATEGORIES
const VALID_STATUSES = ['pending', 'used', 'skipped', 'failed']

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = getServiceClient()
  const body = await request.json()

  const update: Record<string, unknown> = {}

  if (typeof body.topic === 'string' && body.topic.trim()) update.topic = body.topic.trim()
  if (typeof body.category === 'string' && VALID_CATEGORIES.includes(body.category))
    update.category = body.category
  if (typeof body.status === 'string' && VALID_STATUSES.includes(body.status))
    update.status = body.status
  if (Number.isFinite(body.priority)) update.priority = Number(body.priority)
  if (Array.isArray(body.keywords)) {
    update.keywords = body.keywords.filter(
      (k: unknown): k is string => typeof k === 'string' && k.trim().length > 0
    )
  }
  if (typeof body.notes === 'string') update.notes = body.notes.trim() || null

  if (Object.keys(update).length === 0) {
    return NextResponse.json({ error: 'no valid fields to update' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('topic_queue')
    .update(update)
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
    .from('topic_queue')
    .delete()
    .eq('id', params.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
