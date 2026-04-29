import { notFound } from 'next/navigation'
import { getServiceClient } from '@/lib/supabase'
import type { Metadata } from 'next'

// Public blog article page.
//
// Stub. Antigravity owns the visual structure (breadcrumbs, hero, byline,
// table of contents, body, related posts, share rail, CTA blocks). This
// file's responsibility is the data boundary + SEO surface:
//
//   - Fetch the post from Supabase by slug
//   - 404 if missing or unpublished
//   - Emit per-page metadata: title, description, canonical, OG, Twitter
//   - Emit JSON-LD `Article` schema
//   - Render the HTML body so the prose-blog stylesheet applies
//
// Once the design lands the structural wrappers around `<article>` change,
// but the metadata + JSON-LD + body-html boundary stays exactly the same.

export const revalidate = 60
export const dynamic = 'force-static'

type Params = { lang: string; slug: string }

type PostFull = {
  id: string
  slug: string
  title_en: string
  body_en: string
  excerpt_en: string | null
  category: string
  cover_image: string | null
  published_at: string | null
  blog_author_id: string | null
}

type AuthorRef = {
  id: string
  name: string
  bio_en: string | null
  avatar_url: string | null
}

async function fetchPost(slug: string): Promise<{ post: PostFull; author: AuthorRef | null } | null> {
  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select('id, slug, title_en, body_en, excerpt_en, category, cover_image, published_at, blog_author_id')
    .eq('slug', slug)
    .eq('published', true)
    .maybeSingle()

  if (error) {
    console.error('[blog article] supabase error:', error.message)
    return null
  }
  if (!data) return null

  let author: AuthorRef | null = null
  if (data.blog_author_id) {
    const { data: a } = await supabase
      .from('authors')
      .select('id, name, bio_en, avatar_url')
      .eq('id', data.blog_author_id)
      .maybeSingle()
    author = (a as AuthorRef | null) ?? null
  }
  return { post: data as PostFull, author }
}

function plainTextExcerpt(html: string, max = 160): string {
  const plain = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()
  if (plain.length <= max) return plain
  const clipped = plain.slice(0, max)
  const lastSpace = clipped.lastIndexOf(' ')
  return (lastSpace > 60 ? clipped.slice(0, lastSpace) : clipped).trim() + '…'
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const result = await fetchPost(params.slug)
  if (!result) return { title: 'Not found' }
  const { post } = result
  const description = post.excerpt_en || plainTextExcerpt(post.body_en)
  const canonical = `/${params.lang}/${post.slug}`
  return {
    title: post.title_en,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'article',
      url: canonical,
      title: post.title_en,
      description,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title_en,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

export default async function BlogArticlePage({ params }: { params: Params }) {
  const result = await fetchPost(params.slug)
  if (!result) notFound()
  const { post, author } = result
  const description = post.excerpt_en || plainTextExcerpt(post.body_en)
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io'

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title_en,
    description,
    datePublished: post.published_at ?? undefined,
    dateModified: post.published_at ?? undefined,
    inLanguage: 'en-US',
    image: post.cover_image ?? undefined,
    author: author
      ? { '@type': 'Person', name: author.name }
      : { '@type': 'Organization', name: 'OnFin' },
    publisher: {
      '@type': 'Organization',
      name: 'OnFin',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.svg` },
    },
    mainEntityOfPage: `${baseUrl}/${params.lang}/${post.slug}`,
  }

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      {/* Breadcrumbs / hero / byline / share rail are owned by the design pass. */}
      <article>
        <header>
          <p>{post.category}</p>
          <h1>{post.title_en}</h1>
          {post.published_at && (
            <time dateTime={post.published_at}>
              {new Date(post.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          )}
          {author && <p>By {author.name}</p>}
        </header>

        <div
          className="prose-blog"
          dangerouslySetInnerHTML={{ __html: post.body_en }}
        />
      </article>
    </main>
  )
}
