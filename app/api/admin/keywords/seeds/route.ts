import { NextResponse } from 'next/server'
import { getServiceClient } from '@/lib/supabase'

export async function GET() {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('listings')
    .select('brand, model, category')
    .eq('is_active', true)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const brandModels = new Set<string>()
  const brands = new Set<string>()
  const categories = new Set<string>()

  for (const row of data ?? []) {
    if (row.brand && row.model) brandModels.add(`${row.brand} ${row.model}`)
    if (row.brand) brands.add(row.brand)
    if (row.category) categories.add(row.category)
  }

  return NextResponse.json({
    brandModels: Array.from(brandModels).sort(),
    brands: Array.from(brands).sort(),
    categories: Array.from(categories).sort(),
  })
}
