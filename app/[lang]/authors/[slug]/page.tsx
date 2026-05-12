import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { DEMO_AUTHOR_BY_ID, DEMO_POSTS, isDemoMode } from '@/lib/demo-data'
import {
  type Locale,
  isLocale,
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  t,
} from '@/lib/locales'
import { applyTranslation, fetchTranslationsBatch } from '@/lib/post-locale'
import Breadcrumbs from '@/components/blog/Breadcrumbs'
import PostCard, { type PostCardData } from '@/components/blog/PostCard'

// Author profile page. Two jobs:
//   1. Give every byline a real, crawlable URL — required for E-E-A-T
//      under YMYL (Forex/CFD content). Without this Google can't verify
//      that a human with credentials wrote the piece.
//   2. Emit Person JSON-LD with sameAs links to social profiles so
//      author identity carries across the web.
//
// Renders the author's bio, headshot, and the most recent posts they
// wrote. Posts list is locale-aware (uses translations when available).

type Params = { lang: string; slug: string }

type AuthorRow = {
  id: string
  slug: string
  name: string
  bio_en: string | null
  avatar_url: string | null
  twitter: string | null
  linkedin: string | null
  website: string | null
}

type AuthorPost = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  category: string
  cover_image: string | null
  published_at: string | null
}

async function fetchAuthor(slug: string): Promise<AuthorRow | null> {
  if (isDemoMode()) {
    const a = Object.values(DEMO_AUTHOR_BY_ID).find((x) => x.slug === slug)
    return (a as AuthorRow | undefined) ?? null
  }
  const supabase = getServiceClient()
  const { data } = await supabase
    .from('authors')
    .select('id, slug, name, bio_en, avatar_url, twitter, linkedin, website')
    .eq('slug', slug)
    .maybeSingle()
  return (data as AuthorRow | null) ?? null
}

async function fetchAuthorPosts(
  authorId: string,
  locale: Locale,
  limit = 12
): Promise<PostCardData[]> {
  if (isDemoMode()) {
    return DEMO_POSTS.filter((p) => p.blog_author_id === authorId)
      .slice(0, limit)
      .map((p) => ({
        id: p.id,
        slug: p.slug,
        title: p.title_en,
        excerpt: p.excerpt_en,
        body: p.body_en,
        category: p.category,
        coverImage: p.cover_image,
        publishedAt: p.published_at,
      }))
  }

  const supabase = getServiceClient()
  const { data } = await supabase
    .from('posts')
    .select('id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at')
    .eq('published', true)
    .eq('blog_author_id', authorId)
    .order('published_at', { ascending: false })
    .limit(limit)

  const rows = (data ?? []) as AuthorPost[]
  const translations = await fetchTranslationsBatch(
    supabase,
    rows.map((p) => p.id),
    locale
  )

  return rows.map((p) => {
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
    }
  })
}

function buildHreflang(slug: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    map[loc] = `/${loc}/authors/${slug}`
  }
  map['x-default'] = `/${DEFAULT_LOCALE}/authors/${slug}`
  return map
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang, slug } = await params
  const author = await fetchAuthor(slug)
  if (!author) return { title: 'Not found' }
  const canonical = `/${lang}/authors/${author.slug}`
  return {
    title: author.name,
    description:
      author.bio_en ??
      `Articles by ${author.name} on the OnFin Blog — forex and CFD trading guides, market analysis, and regulation news.`,
    alternates: {
      canonical,
      languages: buildHreflang(author.slug),
    },
    openGraph: {
      type: 'profile',
      url: canonical,
      title: author.name,
      description: author.bio_en ?? undefined,
      images: author.avatar_url ? [{ url: author.avatar_url }] : undefined,
    },
  }
}

export default async function AuthorProfilePage({
  params,
}: {
  params: Promise<Params>
}) {
  const { lang, slug } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const author = await fetchAuthor(slug)
  if (!author) notFound()

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const canonicalPath = `/${lang}/authors/${author.slug}`
  const canonicalUrl = `${baseUrl}${canonicalPath}`

  const sameAs = [author.twitter, author.linkedin, author.website].filter(
    (s): s is string => Boolean(s)
  )

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${canonicalUrl}#person`,
    name: author.name,
    url: canonicalUrl,
    description: author.bio_en ?? undefined,
    image: author.avatar_url ?? undefined,
    worksFor: {
      '@type': 'Organization',
      '@id': 'https://onfin.io/#organization',
      name: 'OnFin',
    },
    ...(sameAs.length ? { sameAs } : {}),
  }

  const posts = await fetchAuthorPosts(author.id, locale, 12)

  const breadcrumbs = [
    { label: t(locale, 'blog.breadcrumb_root'), href: `/${lang}` },
    { label: t(locale, 'blog.author.written_by'), href: undefined },
    { label: author.name },
  ]

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <header className="border-b border-ink-100 bg-white">
        <div className="container-site pt-8 sm:pt-10">
          <Breadcrumbs crumbs={breadcrumbs} baseUrl={baseUrl} />
        </div>
        <div className="container-site pb-12 pt-6 sm:pb-16 sm:pt-8">
          <div className="mx-auto flex max-w-3xl flex-col gap-6 sm:flex-row sm:items-start">
            {author.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={author.avatar_url}
                alt=""
                width={120}
                height={120}
                className="h-24 w-24 shrink-0 rounded-full bg-ink-100 object-cover sm:h-30 sm:w-30"
              />
            ) : (
              <div
                aria-hidden="true"
                className="grid h-24 w-24 shrink-0 place-items-center rounded-full bg-brand-black font-display text-2xl font-semibold text-brand-lime sm:h-30 sm:w-30"
              >
                {initialsOf(author.name)}
              </div>
            )}
            <div>
              <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-blue">
                {t(locale, 'blog.author.written_by')}
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-brand-black sm:text-4xl">
                {author.name}
              </h1>
              {author.bio_en && (
                <p className="mt-4 text-base leading-relaxed text-ink-500">
                  {author.bio_en}
                </p>
              )}
              {sameAs.length > 0 && (
                <ul className="mt-5 flex flex-wrap gap-3 text-xs">
                  {author.twitter && (
                    <li>
                      <a
                        href={author.twitter}
                        rel="me noopener"
                        target="_blank"
                        className="rounded-full border border-ink-200 px-3 py-1.5 font-display font-semibold uppercase tracking-[0.14em] text-brand-black hover:border-ink-300"
                      >
                        X / Twitter
                      </a>
                    </li>
                  )}
                  {author.linkedin && (
                    <li>
                      <a
                        href={author.linkedin}
                        rel="me noopener"
                        target="_blank"
                        className="rounded-full border border-ink-200 px-3 py-1.5 font-display font-semibold uppercase tracking-[0.14em] text-brand-black hover:border-ink-300"
                      >
                        LinkedIn
                      </a>
                    </li>
                  )}
                  {author.website && (
                    <li>
                      <a
                        href={author.website}
                        rel="me noopener"
                        target="_blank"
                        className="rounded-full border border-ink-200 px-3 py-1.5 font-display font-semibold uppercase tracking-[0.14em] text-brand-black hover:border-ink-300"
                      >
                        Website
                      </a>
                    </li>
                  )}
                </ul>
              )}
            </div>
          </div>
        </div>
      </header>

      <section className="container-site py-12 sm:py-16">
        {posts.length === 0 ? (
          <p className="mx-auto max-w-xl text-center text-sm text-ink-500">
            {t(locale, 'blog.empty.body_unfiltered')}
          </p>
        ) : (
          <ul className="mx-auto grid max-w-[1100px] gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard locale={locale} post={p} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  )
}

function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
}
