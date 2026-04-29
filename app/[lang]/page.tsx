import { getServiceClient } from '@/lib/supabase'
import type { Metadata } from 'next'

// Public blog index — list of every published post, newest first.
//
// Stub. Antigravity owns the visual layout (hero, post grid, category
// chips, pagination/scroll behaviour). This file is just the data
// boundary: it pulls posts from Supabase, hands them to whatever
// component(s) the design pass produces, and emits the metadata that
// search engines consume.
//
// Once the design lands and we get greenlight, the JSX block below is
// replaced with the real components.

export const revalidate = 60                           // ISR: 60s freshness window
export const dynamic = 'force-static'

type Params = { lang: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  return {
    title: 'OnFin Blog',
    description:
      'Market analysis, trading guides, platform updates, and regulation news from OnFin.',
    alternates: {
      canonical: `/${params.lang}`,
    },
    openGraph: {
      type: 'website',
      url: `/${params.lang}`,
      title: 'OnFin Blog',
      description:
        'Market analysis, trading guides, platform updates, and regulation news from OnFin.',
    },
  }
}

type PostListItem = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  category: string
  cover_image: string | null
  published_at: string | null
}

async function fetchPosts(): Promise<PostListItem[]> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, category, cover_image, published_at')
    .eq('published', true)
    .order('published_at', { ascending: false })
    .limit(100)

  if (error) {
    console.error('[blog index] supabase error:', error.message)
    return []
  }
  return (data || []) as PostListItem[]
}

export default async function BlogIndexPage({ params }: { params: Params }) {
  const posts = await fetchPosts()

  // Placeholder layout — replaced wholesale by Antigravity's design pass.
  // Renders semantic HTML so even before the visual layer lands, search
  // engines can index titles, dates, and links.
  return (
    <main>
      <header>
        <p>OnFin</p>
        <h1>Blog</h1>
        <p>
          Market analysis, trading guides, platform updates, and regulation news.
        </p>
      </header>

      <section>
        <ul>
          {posts.map((post) => (
            <li key={post.id}>
              <article>
                {post.published_at && (
                  <time dateTime={post.published_at}>
                    {new Date(post.published_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </time>
                )}
                <h2>
                  <a href={`/${params.lang}/${post.slug}`}>{post.title_en}</a>
                </h2>
                {post.excerpt_en && <p>{post.excerpt_en}</p>}
                <p>{post.category}</p>
              </article>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
