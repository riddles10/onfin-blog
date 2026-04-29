import type { MetadataRoute } from 'next'
import { getServiceClient } from '@/lib/supabase'

// Built-in Next.js sitemap. Lists the English index plus every published
// post. When more locales come online, add their entries here and emit
// hreflang alternates via the `alternates` field.

export const revalidate = 3600  // 1h — sitemap doesn't need to be hot

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('slug, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })

  if (error) {
    console.error('[sitemap] supabase error:', error.message)
    return [{ url: `${BASE_URL}/en`, lastModified: new Date() }]
  }

  const postEntries: MetadataRoute.Sitemap = (data || []).map((p) => ({
    url: `${BASE_URL}/en/${p.slug}`,
    lastModified: p.published_at ? new Date(p.published_at) : new Date(),
    changeFrequency: 'monthly',
    priority: 0.7,
  }))

  return [
    {
      url: `${BASE_URL}/en`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    ...postEntries,
  ]
}
