import { notFound, permanentRedirect } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { categoryGradient, categoryLabel } from '@/lib/categories'
import { htmlToExcerpt } from '@/lib/format'
import { annotateH2s } from '@/lib/toc'
import { extractFaqEntries, buildFaqSchema } from '@/lib/faq-schema'
import { isDemoMode } from '@/lib/demo-data'
import {
  type Locale,
  isLocale,
  DEFAULT_LOCALE,
  BCP47,
  t,
} from '@/lib/locales'
import {
  applyTranslation,
  fetchTranslationForPost,
  fetchTranslationsBatch,
  type LocalizedPostView,
} from '@/lib/post-locale'
import { postPath, buildHreflangForPost } from '@/lib/post-path'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import AuthorByline from '@/components/blog/AuthorByline'
import TableOfContents from '@/components/blog/TableOfContents'
import ShareRail from '@/components/blog/ShareRail'
import RelatedPosts from '@/components/blog/RelatedPosts'
import ArticleCTA from '@/components/blog/ArticleCTA'
import TldrCallout from '@/components/blog/TldrCallout'
import EnglishFallbackBanner from '@/components/blog/EnglishFallbackBanner'
import type { PostCardData } from '@/components/blog/PostCard'
import { extractTldr } from '@/lib/tldr'
import { stripEmDashes } from '@/lib/strip-emdash'
import { Fragment } from 'react'
import PipCalculator from '@/components/blog/PipCalculator'

// News detail page — individual service / status notices at
// /[locale]/news/[slug]. Mirrors the article detail page but filters
// by post_type='news' and uses news-prefixed canonical URLs + breadcrumbs.
// Article slugs hitting this route get a 301 back to /[locale]/[slug].

type Params = { lang: string; slug: string }

type PostFull = {
  id: string
  slug: string
  title_en: string
  body_en: string
  excerpt_en: string | null
  category: string
  post_type: string
  cover_image: string | null
  published_at: string | null
  updated_at?: string | null
  blog_author_id: string | null
}

type AuthorRef = {
  id: string
  slug: string
  name: string
  bio_en: string | null
  avatar_url: string | null
  twitter: string | null
  linkedin: string | null
  website: string | null
}

type LocalizedArticle = {
  post: PostFull
  view: LocalizedPostView
  author: AuthorRef | null
}

async function fetchPostUpdatedAt(
  supabase: ReturnType<typeof getServiceClient>,
  postId: string
): Promise<string | null> {
  const { data, error } = await supabase
    .from('posts')
    .select('updated_at')
    .eq('id', postId)
    .maybeSingle()
  if (error || !data) return null
  return (data as { updated_at: string | null }).updated_at ?? null
}

async function fetchArticle(
  slug: string,
  locale: Locale
): Promise<LocalizedArticle | null> {
  // Demo mode has no news-type posts, so this route returns nothing in demo.
  if (isDemoMode()) return null

  const supabase = getServiceClient()
  const { data, error } = await supabase
    .from('posts')
    .select(
      'id, slug, title_en, body_en, excerpt_en, category, post_type, cover_image, published_at, blog_author_id'
    )
    .eq('slug', slug)
    .eq('published', true)
    .eq('post_type', 'news')
    .maybeSingle()

  if (error) {
    console.error('[news article] supabase error:', error.message)
    return null
  }
  if (!data) return null

  const post = data as PostFull

  const [translation, author, updatedAt] = await Promise.all([
    fetchTranslationForPost(supabase, post.id, locale),
    post.blog_author_id
      ? supabase
          .from('authors')
          .select('id, slug, name, bio_en, avatar_url, twitter, linkedin, website')
          .eq('id', post.blog_author_id)
          .maybeSingle()
          .then(({ data: a }) => (a as AuthorRef | null) ?? null)
      : Promise.resolve<AuthorRef | null>(null),
    fetchPostUpdatedAt(supabase, post.id),
  ])
  post.updated_at = updatedAt

  const view = applyTranslation(
    { title_en: post.title_en, body_en: post.body_en, excerpt_en: post.excerpt_en },
    locale,
    translation
  )

  return { post, view, author }
}

async function fetchRelated(
  category: string,
  excludePostId: string,
  excludeSlug: string,
  locale: Locale,
  limit = 3
): Promise<PostCardData[]> {
  if (isDemoMode()) return []

  const supabase = getServiceClient()

  const { data: same } = await supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, body_en, category, post_type, cover_image, published_at')
    .eq('published', true)
    .eq('category', category)
    .neq('id', excludePostId)
    .order('published_at', { ascending: false })
    .limit(limit)

  const collected: PostFull[] = (same ?? []) as unknown as PostFull[]

  if (collected.length < limit) {
    const { data: fill } = await supabase
      .from('posts')
      .select('id, slug, title_en, excerpt_en, body_en, category, post_type, cover_image, published_at')
      .eq('published', true)
      .neq('id', excludePostId)
      .order('published_at', { ascending: false })
      .limit(limit + 2)
    const seen = new Set(collected.map((p) => p.id))
    for (const p of (fill ?? []) as unknown as PostFull[]) {
      if (collected.length >= limit) break
      if (!seen.has(p.id)) collected.push(p)
    }
  }

  const translations = await fetchTranslationsBatch(
    supabase,
    collected.map((p) => p.id),
    locale
  )

  return collected.map((p) => {
    const tr = translations.get(p.id) ?? null
    const view = applyTranslation(
      { title_en: p.title_en, body_en: p.body_en, excerpt_en: p.excerpt_en },
      locale,
      tr
    )
    return {
      id: p.id,
      slug: p.slug,
      title: view.title,
      excerpt: view.excerpt,
      body: view.body,
      category: p.category,
      coverImage: p.cover_image,
      publishedAt: p.published_at,
      postType: p.post_type as 'article' | 'news',
    }
  })
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const result = await fetchArticle(slug, locale)
  if (!result) return { title: 'Not found' }
  const { post, view } = result
  const description = stripEmDashes(
    view.excerpt || htmlToExcerpt(view.body, 160)
  )
  const canonical = postPath(lang, post.slug, 'news')
  return {
    title: view.title,
    description,
    alternates: {
      canonical,
      languages: buildHreflangForPost(post.slug, 'news'),
    },
    openGraph: {
      type: 'article',
      url: canonical,
      title: view.title,
      description,
      publishedTime: post.published_at ?? undefined,
      images: post.cover_image ? [{ url: post.cover_image }] : undefined,
      locale: BCP47[locale],
    },
    twitter: {
      card: 'summary_large_image',
      title: view.title,
      description,
      images: post.cover_image ? [post.cover_image] : undefined,
    },
  }
}

export default async function NewsArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, slug } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const result = await fetchArticle(slug, locale)
  if (!result) {
    // Check whether this slug exists as an article — if so, redirect there.
    // fetchArticle filtered by post_type='news', so a miss could mean it's
    // an article hitting the wrong route.
    const supabase = getServiceClient()
    const { data: articleHit } = await supabase
      .from('posts')
      .select('slug, post_type')
      .eq('slug', slug)
      .eq('published', true)
      .maybeSingle()
    if (articleHit && (articleHit as any).post_type === 'article') {
      permanentRedirect(postPath(lang, slug, 'article'))
    }
    notFound()
  }
  const { post, view, author } = result

  // Article posts hitting this route get a 301 back to /[locale]/[slug].
  if (post.post_type === 'article') {
    permanentRedirect(postPath(lang, post.slug, 'article'))
  }

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const canonicalPath = postPath(lang, post.slug, 'news')
  const canonicalUrl = `${baseUrl}${canonicalPath}`

  const cleanBody = stripEmDashes(view.body)
  const cleanExcerpt = view.excerpt ? stripEmDashes(view.excerpt) : view.excerpt
  const description = cleanExcerpt || htmlToExcerpt(cleanBody, 160)

  const { tldr, body: bodyWithoutTldr } = extractTldr(cleanBody)
  const { html: bodyHtml, items: tocItems } = annotateH2s(bodyWithoutTldr)
  const pipParts = bodyHtml.split(/<p>\s*\[pip-calculator\]\s*<\/p>|\[pip-calculator\]/i)

  const faqSchema = buildFaqSchema(extractFaqEntries(view.body))
  const related = await fetchRelated(post.category, post.id, post.slug, locale, 3)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: view.title,
    description,
    datePublished: post.published_at ?? undefined,
    dateModified: post.updated_at ?? post.published_at ?? undefined,
    inLanguage: BCP47[view.effectiveLocale],
    image: post.cover_image ?? undefined,
    author: author
      ? {
          '@type': 'Person',
          name: author.name,
          url: `${baseUrl}/${lang}/authors/${author.slug}`,
          ...(author.twitter || author.linkedin || author.website
            ? {
                sameAs: [author.twitter, author.linkedin, author.website].filter(
                  (s): s is string => Boolean(s)
                ),
              }
            : {}),
        }
      : { '@type': 'Organization', '@id': 'https://onfin.io/#organization', name: 'OnFin' },
    publisher: {
      '@type': 'Organization',
      '@id': 'https://onfin.io/#organization',
      name: 'OnFin',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.svg` },
    },
    mainEntityOfPage: canonicalUrl,
  }

  // News breadcrumbs: Home > News > Title (not category-based).
  const breadcrumbs = [
    { label: t(locale, 'blog.breadcrumb_root'), href: `/${lang}` },
    {
      label: t(locale, 'news.metadata.title'),
      href: `/${lang}/news`,
    },
    { label: view.title },
  ]

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}

      {view.isFallback && <EnglishFallbackBanner requestedLocale={locale} />}

      <article>
        {/* ── Header ──────────────────────────────────────────────────── */}
        <header className="border-b border-ink-100 bg-white">
          <div className="container-site pt-8 sm:pt-10">
            <Breadcrumbs crumbs={breadcrumbs} baseUrl={baseUrl} />
          </div>
          <div className="container-site pb-12 pt-6 sm:pb-16 sm:pt-8">
            <div className="mx-auto max-w-3xl">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
                {categoryLabel(post.category, locale)}
              </p>
              <h1 className="mt-4 font-display text-3xl font-semibold leading-[1.1] tracking-tight text-brand-black sm:text-4xl lg:text-5xl">
                {view.title}
              </h1>
              {cleanExcerpt && (
                <p className="mt-5 text-base leading-relaxed text-ink-500 sm:text-lg">
                  {cleanExcerpt}
                </p>
              )}
              <div className="mt-7">
                <AuthorByline
                  locale={locale}
                  author={
                    author
                      ? {
                          slug: author.slug,
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
        <CoverImage src={post.cover_image} alt={view.title} category={post.category} />

        {/* ── Body + side rails ──────────────────────────────────────── */}
        <div className="container-site py-12 sm:py-16">
          <div className="mx-auto grid max-w-[1100px] gap-10 xl:grid-cols-[48px_minmax(0,720px)_240px]">
            <div className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
              <ShareRail locale={locale} title={view.title} url={canonicalUrl} variant="rail" />
            </div>

            <div className="min-w-0">
              {tldr && <TldrCallout html={tldr} locale={locale} />}
              {pipParts.length > 1 ? (
                pipParts.map((part, i) => (
                  <Fragment key={i}>
                    <div
                      className="prose-blog"
                      dangerouslySetInnerHTML={{ __html: part }}
                    />
                    {i < pipParts.length - 1 && <PipCalculator />}
                  </Fragment>
                ))
              ) : (
                <div
                  className="prose-blog"
                  dangerouslySetInnerHTML={{ __html: bodyHtml }}
                />
              )}

              <div className="mt-12 border-t border-ink-100 pt-6 xl:hidden">
                <ShareRail locale={locale} title={view.title} url={canonicalUrl} variant="inline" />
              </div>

              <AuthorByline
                locale={locale}
                author={
                  author
                    ? {
                        slug: author.slug,
                        name: author.name,
                        bio: author.bio_en,
                        avatarUrl: author.avatar_url,
                      }
                    : null
                }
                publishedAt={post.published_at}
                variant="full"
              />

              <ArticleCTA locale={locale} />

              <RelatedPosts locale={locale} posts={related} />
            </div>

            <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
              <TableOfContents locale={locale} items={tocItems} />
            </aside>
          </div>
        </div>
      </article>
    </main>
  )
}

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
      <figure className="bg-ink-50">
        <div className="container-site py-6 sm:py-8">
          <div className="mx-auto aspect-[1200/630] max-w-[1100px] overflow-hidden rounded-3xl bg-ink-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              width={1200}
              height={630}
              className="h-full w-full object-cover"
              loading="eager"
              decoding="async"
              fetchPriority="high"
            />
          </div>
        </div>
      </figure>
    )
  }
  return (
    <div className="bg-ink-50">
      <div className="container-site py-6 sm:py-8">
        <div
          className={`mx-auto aspect-[1200/630] max-w-[1100px] rounded-3xl ${categoryGradient(
            category
          )}`}
          aria-hidden="true"
        />
      </div>
    </div>
  )
}
