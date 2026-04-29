import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { categoryGradient, categoryLabel } from '@/lib/categories'
import { htmlToExcerpt } from '@/lib/format'
import { annotateH2s } from '@/lib/toc'
import { DEMO_POSTS, DEMO_AUTHOR_BY_ID, isDemoMode } from '@/lib/demo-data'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorByline from '@/components/blog/AuthorByline'
import TableOfContents from '@/components/blog/TableOfContents'
import ShareRail from '@/components/blog/ShareRail'
import RelatedPosts from '@/components/blog/RelatedPosts'
import ArticleCTA from '@/components/blog/ArticleCTA'
import type { PostCardData } from '@/components/blog/PostCard'

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

async function fetchPost(slug: string): Promise<{
  post: PostFull
  author: AuthorRef | null
} | null> {
  if (isDemoMode()) {
    const p = DEMO_POSTS.find((x) => x.slug === slug)
    if (!p) return null
    const a = DEMO_AUTHOR_BY_ID[p.blog_author_id]
    return {
      post: p as unknown as PostFull,
      author: a ?? null,
    }
  }

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, slug, title_en, body_en, excerpt_en, category, cover_image, published_at, blog_author_id'
    )
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

async function fetchRelated(
  category: string,
  excludeSlug: string,
  limit = 3
): Promise<PostCardData[]> {
  if (isDemoMode()) {
    const same = DEMO_POSTS.filter((p) => p.category === category && p.slug !== excludeSlug)
    const fill = DEMO_POSTS.filter((p) => p.slug !== excludeSlug && !same.find((s) => s.id === p.id))
    return [...same, ...fill].slice(0, limit).map(toCardData)
  }

  const supabase = getServiceClient()
  // Same-category first; pad with newest from any category if there
  // aren't enough siblings yet.
  const { data: same } = await supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at')
    .eq('published', true)
    .eq('category', category)
    .neq('slug', excludeSlug)
    .order('published_at', { ascending: false })
    .limit(limit)

  let pool = (same ?? []).map(toCardData)
  if (pool.length < limit) {
    const { data: fill } = await supabase
      .from('posts')
      .select('id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at')
      .eq('published', true)
      .neq('slug', excludeSlug)
      .order('published_at', { ascending: false })
      .limit(limit + 2) // overshoot to leave room for de-duping
    const seen = new Set(pool.map((p) => p.id))
    for (const p of fill ?? []) {
      if (pool.length >= limit) break
      if (!seen.has(p.id)) pool.push(toCardData(p))
    }
  }
  return pool
}

function toCardData(row: {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  category: string
  cover_image: string | null
  published_at: string | null
}): PostCardData {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title_en,
    excerpt: row.excerpt_en,
    body: row.body_en,
    category: row.category,
    coverImage: row.cover_image,
    publishedAt: row.published_at,
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const result = await fetchPost(slug)
  if (!result) return { title: 'Not found' }
  const { post } = result
  const description = post.excerpt_en || htmlToExcerpt(post.body_en, 160)
  const canonical = `/${lang}/${post.slug}`
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

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, slug } = await params
  const result = await fetchPost(slug)
  if (!result) notFound()
  const { post, author } = result

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const canonicalPath = `/${lang}/${post.slug}`
  const canonicalUrl = `${baseUrl}${canonicalPath}`
  const description = post.excerpt_en || htmlToExcerpt(post.body_en, 160)

  // Decorate H2s with stable ids and pull the list out for the TOC.
  const { html: bodyHtml, items: tocItems } = annotateH2s(post.body_en)

  const related = await fetchRelated(post.category, post.slug, 3)

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
      ? {
          '@type': 'Person',
          name: author.name,
        }
      : { '@type': 'Organization', name: 'OnFin' },
    publisher: {
      '@type': 'Organization',
      name: 'OnFin',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.svg` },
    },
    mainEntityOfPage: canonicalUrl,
  }

  const breadcrumbs = [
    { label: 'Blog', href: `/${lang}` },
    {
      label: categoryLabel(post.category),
      href: `/${lang}?category=${post.category}`,
    },
    { label: post.title_en },
  ]

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <article>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="border-b border-ink-100 bg-white">
          <div className="container-site pt-8 sm:pt-10">
            <Breadcrumbs crumbs={breadcrumbs} baseUrl={baseUrl} />
          </div>

          <div className="container-site pb-12 pt-6 sm:pb-16 sm:pt-8">
            <div className="mx-auto max-w-3xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
                {categoryLabel(post.category)}
              </p>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-brand-black sm:text-4xl lg:text-5xl">
                {post.title_en}
              </h1>
              {post.excerpt_en && (
                <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
                  {post.excerpt_en}
                </p>
              )}
              <div className="mt-7">
                <AuthorByline
                  author={
                    author
                      ? {
                          name: author.name,
                          bio: author.bio_en,
                          avatarUrl: author.avatar_url,
                        }
                      : null
                  }
                  publishedAt={post.published_at}
                />
              </div>
            </div>
          </div>
        </header>

        {/* ── Cover image ─────────────────────────────────────────────── */}
        <CoverImage src={post.cover_image} alt={post.title_en} category={post.category} />

        {/* ── Body + side rails ──────────────────────────────────────── */}
        <div className="container-site py-12 sm:py-16">
          {/*
            Three-column at xl (1280+): share-rail | body (720px) | TOC (260px)
            One-column below xl. The desktop rails are gracefully replaced by
            the inline share row + the heading list at the bottom of the body
            on tablet and mobile.
          */}
          <div className="mx-auto grid max-w-[1100px] gap-10 xl:grid-cols-[48px_minmax(0,720px)_240px]">
            {/* Left rail — sticky share buttons on desktop */}
            <div className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
              <ShareRail title={post.title_en} url={canonicalUrl} variant="rail" />
            </div>

            {/* Body */}
            <div className="min-w-0">
              <div
                className="prose-blog"
                dangerouslySetInnerHTML={{ __html: bodyHtml }}
              />

              {/* Inline share row at the end of the body — replaces the
                  sticky rail below xl, where there's no spare horizontal
                  real estate. */}
              <div className="mt-12 border-t border-ink-100 pt-6 xl:hidden">
                <ShareRail title={post.title_en} url={canonicalUrl} variant="inline" />
              </div>

              <AuthorByline
                author={
                  author
                    ? {
                        name: author.name,
                        bio: author.bio_en,
                        avatarUrl: author.avatar_url,
                      }
                    : null
                }
                publishedAt={post.published_at}
                variant="full"
              />

              <ArticleCTA />

              <RelatedPosts locale={lang} posts={related} />
            </div>

            {/* Right rail — sticky table of contents on desktop */}
            <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
              <TableOfContents items={tocItems} />
            </aside>
          </div>
        </div>
      </article>
    </main>
  )
}

/**
 * Cover image hero strip. Falls back to a category-coloured gradient
 * panel when no image is set so short notice posts (most platform-update
 * posts) still feel intentional rather than empty.
 */
function CoverImage({
  src,
  alt,
  category,
}: {
  src: string | null
  alt: string
  category: string
}) {
  if (src) {
    return (
      <div className="bg-ink-100">
        <div className="container-site py-6 sm:py-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={alt}
            // The cover is the LCP element on most articles → prioritise it.
            // `fetchPriority` is the right knob; `loading="eager"` reinforces it.
            fetchPriority="high"
            loading="eager"
            decoding="async"
            className="mx-auto block aspect-[16/9] w-full max-w-5xl rounded-2xl object-cover"
          />
        </div>
      </div>
    )
  }
  return (
    <div
      aria-hidden="true"
      className="h-32 w-full sm:h-40"
      style={{ backgroundImage: categoryGradient(category) }}
    />
  )
}
