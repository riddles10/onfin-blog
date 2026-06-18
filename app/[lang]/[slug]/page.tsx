import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { categoryGradient, categoryLabel } from '@/lib/categories'
import { htmlToExcerpt } from '@/lib/format'
import { annotateH2s } from '@/lib/toc'
import { extractFaqEntries, buildFaqSchema } from '@/lib/faq-schema'
import { DEMO_POSTS, DEMO_AUTHOR_BY_ID, isDemoMode } from '@/lib/demo-data'
import {
  type Locale,
  isLocale,
  SUPPORTED_LOCALES,
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
  updated_at?: string | null                        // real last-edit time (migration 0003); optional until applied
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
  view: LocalizedPostView                           // localised title/body/excerpt + isFallback
  author: AuthorRef | null
}

// Fetched on its own and error-tolerant so the article keeps rendering even in
// an environment where migration 0003 (posts.updated_at) hasn't been applied
// yet — selecting a missing column would otherwise fail the whole query. Until
// the column exists this returns null and dateModified falls back to
// published_at, exactly as before.
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
  if (isDemoMode()) {
    const p = DEMO_POSTS.find((x) => x.slug === slug)
    if (!p) return null
    const a = DEMO_AUTHOR_BY_ID[p.blog_author_id]
    const view = applyTranslation(
      { title_en: p.title_en, body_en: p.body_en, excerpt_en: p.excerpt_en },
      locale,
      null
    )
    return { post: p as unknown as PostFull, view, author: a ?? null }
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
  if (isDemoMode()) {
    const same = DEMO_POSTS.filter((p) => p.category === category && p.slug !== excludeSlug)
    const fill = DEMO_POSTS.filter((p) => p.slug !== excludeSlug && !same.find((s) => s.id === p.id))
    return [...same, ...fill].slice(0, limit).map(toCardDataFromEnglish)
  }

  const supabase = getServiceClient()

  // Same-category first; pad with newest from any category if there
  // aren't enough siblings yet.
  const { data: same } = await supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at')
    .eq('published', true)
    .eq('category', category)
    .neq('id', excludePostId)
    .order('published_at', { ascending: false })
    .limit(limit)

  const collected: PostFull[] = (same ?? []) as unknown as PostFull[]

  if (collected.length < limit) {
    const { data: fill } = await supabase
      .from('posts')
      .select('id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at')
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

  // Batch the translations for the related cards in one round trip.
  const translations = await fetchTranslationsBatch(
    supabase,
    collected.map((p) => p.id),
    locale
  )

  return collected.map((p) => {
    const t = translations.get(p.id) ?? null
    const view = applyTranslation(
      { title_en: p.title_en, body_en: p.body_en, excerpt_en: p.excerpt_en },
      locale,
      t
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
    }
  })
}

function toCardDataFromEnglish(row: {
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

/**
 * Build the alternates.languages map for `<link rel="alternate" hreflang>`.
 * Every locale points to its own URL; x-default points at English.
 */
function buildHreflang(slug: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    map[loc] = `/${loc}/${slug}`
  }
  map['x-default'] = `/${DEFAULT_LOCALE}/${slug}`
  return map
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
  const canonical = `/${lang}/${post.slug}`
  return {
    title: view.title,
    description,
    alternates: {
      canonical,
      languages: buildHreflang(post.slug),
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

export default async function BlogArticlePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, slug } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const result = await fetchArticle(slug, locale)
  if (!result) notFound()
  const { post, view, author } = result

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const canonicalPath = `/${lang}/${post.slug}`
  const canonicalUrl = `${baseUrl}${canonicalPath}`

  // Em-dashes are banned in body copy (the dominant LLM-tell) and stripped
  // at render time so legacy posts in the archive stay clean alongside the
  // one-shot DB migration. Excerpt gets the same treatment.
  const cleanBody = stripEmDashes(view.body)
  const cleanExcerpt = view.excerpt ? stripEmDashes(view.excerpt) : view.excerpt
  const description = cleanExcerpt || htmlToExcerpt(cleanBody, 160)

  // Lift the TL;DR paragraph out of the body so it can render as a
  // distinct callout above the prose instead of a bold-prefixed sentence
  // buried in the intro.
  const { tldr, body: bodyWithoutTldr } = extractTldr(cleanBody)

  // Decorate H2s with stable ids and pull the list out for the TOC.
  const { html: bodyHtml, items: tocItems } = annotateH2s(bodyWithoutTldr)

  // Split the body on the `[pip-calculator]` author token so the interactive
  // widget mounts inline where it was placed. No token → body renders as one
  // block exactly as before.
  const pipParts = bodyHtml.split(/<p>\s*\[pip-calculator\]\s*<\/p>|\[pip-calculator\]/i)

  // FAQPage schema — only emitted when the body has a recognisable FAQ
  // section (long-form trading guides). Operational notice posts don't
  // carry FAQs, so this is a no-op for them.
  const faqSchema = buildFaqSchema(extractFaqEntries(view.body))

  const related = await fetchRelated(post.category, post.id, post.slug, locale, 3)

  // The schema's inLanguage tells crawlers what language the rendered
  // body is actually in — important when we fall back to English for a
  // non-English route, otherwise Google would treat the page as
  // mismatched-locale duplicate content.
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
          // Linking the byline to a profile URL is the YMYL E-E-A-T signal
          // Google reads to verify a human authored the piece.
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
      // Match the @id declared in the root layout's Organization schema
      // so Google reads them as the same entity, not two duplicates.
      '@id': 'https://onfin.io/#organization',
      name: 'OnFin',
      logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.svg` },
    },
    mainEntityOfPage: canonicalUrl,
  }

  const breadcrumbs = [
    { label: t(locale, 'blog.breadcrumb_root'), href: `/${lang}` },
    {
      label: categoryLabel(post.category, locale),
      href: `/${lang}?category=${post.category}`,
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
            {/* Left rail — sticky share buttons on desktop */}
            <div className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
              <ShareRail locale={locale} title={view.title} url={canonicalUrl} variant="rail" />
            </div>

            {/* Body */}
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

              {/* Inline share row at the end of the body — replaces the
                  sticky rail below xl, where there's no spare horizontal
                  real estate. */}
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

            {/* Right rail — sticky table of contents on desktop */}
            <aside className="hidden xl:block xl:sticky xl:top-28 xl:self-start">
              <TableOfContents locale={locale} items={tocItems} />
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
