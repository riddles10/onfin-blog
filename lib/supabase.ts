import { createClient, SupabaseClient } from '@supabase/supabase-js'

const rawUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseUrl = rawUrl.startsWith('http') ? rawUrl : 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder'

// These clients run only in the long-lived Next.js server process for stateless
// renders and API routes — never for per-user browser auth (that path uses
// lib/supabase-browser.ts). So GoTrue session persistence and token auto-refresh
// are pure overhead: they register background timers/locks that keep each client
// alive. Creating a fresh client per request (see getServiceClient below) leaked
// those cumulatively and drove the container into OOM (kill 137) under traffic.
const serverAuthOpts = {
  auth: { persistSession: false, autoRefreshToken: false },
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl,
  supabaseAnonKey,
  serverAuthOpts
)

// Cached across requests: the service client holds no per-user state (it uses the
// service-role key), so a single process-wide instance is both safe and the
// recommended pattern. Callers keep calling getServiceClient() unchanged.
let serviceClient: SupabaseClient | null = null

export function getServiceClient(): SupabaseClient {
  if (!serviceClient) {
    serviceClient = createClient(
      supabaseUrl,
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
      serverAuthOpts
    )
  }
  return serviceClient
}

export type Post = {
  id: string
  author_id: string | null
  blog_author_id: string | null
  slug: string
  title_en: string
  title_th: string | null
  body_en: string
  body_th: string | null
  excerpt_en: string | null
  excerpt_th: string | null
  category:
    | 'market-analysis'
    | 'trading-guides'
    | 'platform-updates'
    | 'regulation-news'
    | 'strategies'
    | 'general'
  post_type: 'article' | 'news'                      // content-type axis (migration 0004)
  cover_image: string | null
  published: boolean
  published_at: string | null
  views: number
  generation_status:
    | 'queued'
    | 'en_drafted'
    | 'translating'
    | 'draft_ready'
    | 'failed'
    | null
  qa_score_en: number | null
  qa_score_th: number | null
  generation_topic_id: string | null
  created_at: string
  updated_at: string | null                          // real last-edit time (migration 0003)
}

export type Author = {
  id: string
  slug: string
  name: string
  name_th: string | null
  bio_en: string | null
  bio_th: string | null
  avatar_url: string | null
  twitter: string | null
  linkedin: string | null
  website: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export type Event = {
  id: string
  title_en: string
  title_th: string | null
  description_en: string | null
  description_th: string | null
  venue: string | null
  event_date: string
  registration_url: string | null
  cover_image: string | null
  category: 'webinar' | 'workshop' | 'conference' | 'meetup'
  created_at: string
}

export type Profile = {
  id: string
  display_name: string | null
  phone: string | null
  location: string | null
  avatar_url: string | null
  line_id: string | null
  whatsapp: string | null
  created_at: string
}

export type Page = {
  slug: string
  title_en: string
  title_th: string | null
  body_en: string
  body_th: string | null
  meta_description_en: string | null
  meta_description_th: string | null
  published: boolean
  updated_at: string
}
