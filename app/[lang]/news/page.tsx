import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { isDemoMode } from '@/lib/demo-data'
import { type Locale, isLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE, BCP47, t } from '@/lib/locales'
import { applyTranslation, fetchTranslationsBatch } from '@/lib/post-locale'
import BlogHero from '@/components/blog/BlogHero'
import PostCard from '@/components/blog/PostCard'
import Pagination from '@/components/blog/Pagination'

// Dedicated News section — service / status notices (post_type = 'news'),
// kept OUT of the main blog feed. Individual notices still live at
// /[locale]/[slug]; only the listing surface is separate, so no existing
// post URLs change. Locale + translation handling mirrors the blog index.

const POSTS_PER_PAGE = 12

type Params = { lang: string }
type Search = { page?: string }

type IndexPost = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  category: string
  cover_image: string | null
  published_at: string | null
}

type LocalizedIndexPost = IndexPost & {
  title: string
  body: string
  excerpt: string | null
  isFallback: boolean
}

async function fetchNews(opts: {
  locale: Locale
  page: number
}): Promise<{ posts: LocalizedIndexPost[]; total: number }> {
  // Demo content is article-only, so the News section is empty in demo mode.
  if (isDemoMode()) return { posts: [], total: 0 }

  const supabase = getServiceClient()
  const from = (opts.page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  const { data, error, count } = await supabase
    .from('posts')
    .select(
      'id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at',
      { count: 'exact' }
    )
    .eq('published', true)
    .eq('post_type', 'news')
    .order('published_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('[news index] supabase error:', error.message)
    return { posts: [], total: 0 }
  }
  const rawPosts = (data ?? []) as IndexPost[]

  const translations = await fetchTranslationsBatch(
    supabase,
    rawPosts.map((p) => p.id),
    opts.locale
  )

  const posts: LocalizedIndexPost[] = rawPosts.map((p) => {
    const tr = translations.get(p.id) ?? null
    const view = applyTranslation(
      { title_en: p.title_en, body_en: p.body_en, excerpt_en: p.excerpt_en },
      opts.locale,
      tr
    )
    return {
      ...p,
      title: view.title,
      body: view.body,
      excerpt: view.excerpt,
      isFallback: view.isFallback,
    }
  })

  return { posts, total: count ?? 0 }
}

function parsePage(search: Search): number {
  return Math.max(1, parseInt(search.page ?? '1', 10) || 1)
}

function buildHreflang(pathSuffix: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) map[loc] = `/${loc}${pathSuffix}`
  map['x-default'] = `/${DEFAULT_LOCALE}${pathSuffix}`
  return map
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const title = { absolute: t(locale, 'news.metadata.title') }
  const description = t(locale, 'news.metadata.description')
  const canonical = `/${lang}/news`
  return {
    title,
    description,
    alternates: { canonical, languages: buildHreflang('/news') },
    openGraph: { type: 'website', url: canonical, title, description, locale: lang },
  }
}

export default async function NewsIndexPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const sp = await searchParams
  const page = parsePage(sp)
  const { posts, total } = await fetchNews({ locale, page })
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  const heroEyebrow = t(locale, 'blog.hero.eyebrow')
  const heroTitle = t(locale, 'news.hero.title')
  const heroTagline = t(locale, 'news.hero.tagline')

  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const listingUrl = `${baseUrl}/${lang}/news`
  const listingSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${baseUrl}/${lang}/news#news`,
        url: listingUrl,
        name: t(locale, 'news.metadata.title'),
        description: t(locale, 'news.metadata.description'),
        inLanguage: BCP47[locale],
        publisher: { '@id': 'https://onfin.io/#organization' },
      },
      ...(posts.length > 0
        ? [
            {
              '@type': 'ItemList',
              itemListOrder: 'https://schema.org/ItemListOrderDescending',
              numberOfItems: posts.length,
              itemListElement: posts.map((p, i) => ({
                '@type': 'ListItem',
                position: (page - 1) * POSTS_PER_PAGE + i + 1,
                url: `${baseUrl}/${lang}/${p.slug}`,
                name: p.title,
              })),
            },
          ]
        : []),
    ],
  }

  return (
    <main id="main-content">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(listingSchema) }}
      />
      <BlogHero eyebrow={heroEyebrow} title={heroTitle} tagline={heroTagline} />

      <section className="container-site py-14 sm:py-20">
        {posts.length === 0 ? (
          <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center">
            <h2 className="font-display text-2xl font-semibold text-brand-black">
              {t(locale, 'blog.empty.title')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-ink-500">
              {t(locale, 'blog.empty.body_unfiltered')}
            </p>
          </div>
        ) : (
          <>
            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard locale={locale} post={toCardData(p)} />
                </li>
              ))}
            </ul>

            <Pagination
              basePath={`/${lang}/news`}
              page={page}
              totalPages={totalPages}
              category={null}
              locale={locale}
            />
          </>
        )}
      </section>
    </main>
  )
}

function toCardData(p: LocalizedIndexPost) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    body: p.body,
    category: p.category,
    coverImage: p.cover_image,
    publishedAt: p.published_at,
  }
}
