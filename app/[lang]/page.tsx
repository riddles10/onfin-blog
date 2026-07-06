import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { isPostCategory, categoryLabel, categoryTagline } from '@/lib/categories'
import { DEMO_POSTS, isDemoMode } from '@/lib/demo-data'
import { type Locale, isLocale, SUPPORTED_LOCALES, DEFAULT_LOCALE, BCP47, t, tf } from '@/lib/locales'
import { applyTranslation, fetchTranslationsBatch } from '@/lib/post-locale'
import { postUrl } from '@/lib/post-path'
import BlogHero from '@/components/blog/BlogHero'
import CategoryChips from '@/components/blog/CategoryChips'
import PostCard from '@/components/blog/PostCard'
import Pagination from '@/components/blog/Pagination'

// Public blog index. SEO-clean: every category and page combination has
// a real, crawlable URL via search params, and the SSR response always
// reflects the filter — no client-side gating.
//
// Locale handling: posts are fetched with their English columns, then
// translations for the requested locale are batch-loaded from
// post_translations and zipped on. Posts without a translation fall
// back to English (with a banner on the article page; cards on the
// index just show the English title — no banner, since a card showing
// "this card is in English" inside a localised list would be more
// noisy than helpful).

const POSTS_PER_PAGE = 12

type Params = { lang: string }
type Search = { category?: string; page?: string }

type IndexPost = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  category: string
  cover_image: string | null
  published_at: string | null
  post_type: string
}

type LocalizedIndexPost = IndexPost & {
  // Resolved view: title/body/excerpt are already in the requested
  // locale (or English fallback). isFallback flags whether we had to
  // fall back so the design can render an indicator if it wants to.
  title: string
  body: string
  excerpt: string | null
  isFallback: boolean
}

async function fetchPosts(opts: {
  locale: Locale
  category: string | null
  page: number
}): Promise<{ posts: LocalizedIndexPost[]; total: number }> {
  // Local-dev path: render the design with fixture data when no real
  // Supabase is configured. Removed automatically once env vars point at
  // a live instance. Demo posts are English-only — every locale falls
  // back so locale routing can be visually verified without translations.
  if (isDemoMode()) {
    const all = opts.category
      ? DEMO_POSTS.filter((p) => p.category === opts.category)
      : DEMO_POSTS
    const from = (opts.page - 1) * POSTS_PER_PAGE
    const slice = all.slice(from, from + POSTS_PER_PAGE)
    const isFallback = opts.locale !== DEFAULT_LOCALE
    return {
      posts: slice.map((p) => ({
        ...(p as unknown as IndexPost),
        title: p.title_en,
        body: p.body_en,
        excerpt: p.excerpt_en,
        isFallback,
      })),
      total: all.length,
    }
  }

  const supabase = getServiceClient()
  const from = (opts.page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  let q = supabase
    .from('posts')
    .select(
      'id, slug, title_en, excerpt_en, body_en, category, post_type, cover_image, published_at',
      { count: 'exact' }
    )
    .eq('published', true)
    .eq('post_type', 'article')                       // news notices live in /news, not the main feed
    .order('published_at', { ascending: false })
    .range(from, to)

  if (opts.category) q = q.eq('category', opts.category)

  const { data, error, count } = await q
  if (error) {
    console.error('[blog index] supabase error:', error.message)
    return { posts: [], total: 0 }
  }
  const rawPosts = (data ?? []) as IndexPost[]

  // Batch-fetch translations for the visible page.
  const translations = await fetchTranslationsBatch(
    supabase,
    rawPosts.map((p) => p.id),
    opts.locale
  )

  const posts: LocalizedIndexPost[] = rawPosts.map((p) => {
    const t = translations.get(p.id) ?? null
    const view = applyTranslation(
      { title_en: p.title_en, body_en: p.body_en, excerpt_en: p.excerpt_en },
      opts.locale,
      t
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

function parseSearch(search: Search): { category: string | null; page: number } {
  const c = search.category && isPostCategory(search.category) ? search.category : null
  const pageNum = Math.max(1, parseInt(search.page ?? '1', 10) || 1)
  return { category: c, page: pageNum }
}

/**
 * Build the alternates.languages map for a given canonical path. Emits
 * `<link rel="alternate" hreflang="..">` tags so Google treats the
 * locale variants as the same content rather than duplicate pages.
 * `x-default` points at English.
 */
function buildHreflang(pathSuffix: string): Record<string, string> {
  const map: Record<string, string> = {}
  for (const loc of SUPPORTED_LOCALES) {
    map[loc] = `/${loc}${pathSuffix}`
  }
  map['x-default'] = `/${DEFAULT_LOCALE}${pathSuffix}`
  return map
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}): Promise<Metadata> {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const sp = await searchParams
  const { category } = parseSearch(sp)
  // Filtered views (?category=…) get the standard `<label> | OnFin Blog`
  // template treatment. The unfiltered homepage gets an absolute title so
  // the carefully-tuned brand-first SEO string isn't suffixed with
  // "| OnFin Blog" by the root template.
  const title = category
    ? tf(locale, 'blog.metadata.title_filtered', { label: categoryLabel(category, locale) })
    : { absolute: t(locale, 'blog.metadata.title') }
  const description = category
    ? categoryTagline(category, locale)
    : t(locale, 'blog.metadata.description')
  const pathSuffix = category ? `?category=${category}` : ''
  const canonical = `/${lang}${pathSuffix}`
  return {
    title,
    description,
    alternates: {
      canonical,
      languages: buildHreflang(pathSuffix),
    },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
      locale: lang,
    },
  }
}

export default async function BlogIndexPage({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}) {
  const { lang } = await params
  const locale: Locale = isLocale(lang) ? lang : DEFAULT_LOCALE
  const sp = await searchParams
  const { category, page } = parseSearch(sp)
  const { posts, total } = await fetchPosts({ locale, category, page })
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  // Hero copy: when the index is filtered, swap the default tagline for
  // the category-specific one so readers landing from a search engine
  // land on a page that says exactly what it is.
  const heroEyebrow = category
    ? tf(locale, 'blog.hero.eyebrow_filtered', { label: categoryLabel(category, locale) })
    : t(locale, 'blog.hero.eyebrow')
  const heroTitle = category
    ? categoryLabel(category, locale)
    : t(locale, 'blog.hero.title')
  const heroTagline = category
    ? categoryTagline(category, locale)
    : t(locale, 'blog.hero.tagline')

  // First page only: lift the most recent post into a wide "featured"
  // tile so the layout doesn't read as a uniform grid the moment readers
  // land. Skipped on filtered or paginated views.
  const lift = !category && page === 1 && posts.length > 0
  const featured = lift ? posts[0] : null
  const rest = lift ? posts.slice(1) : posts

  // Blog + ItemList JSON-LD so search engines and answer engines can parse
  // the listing as a feed (and the posts as ordered entries) rather than an
  // opaque grid. The Blog node reuses the Organization @id declared in the
  // root layout so crawlers read one publisher entity, not a duplicate.
  // ItemList positions are page-aware so pagination reads as one continuous
  // ordered list.
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://blog.onfin.io').replace(/\/$/, '')
  const listingUrl = category ? `${baseUrl}/${lang}?category=${category}` : `${baseUrl}/${lang}`
  const listingSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Blog',
        '@id': `${baseUrl}/${lang}#blog`,
        url: listingUrl,
        name: t(locale, 'blog.metadata.title'),
        description: t(locale, 'blog.metadata.description'),
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
                url: postUrl(baseUrl, lang, p.slug, 'article'),
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

      <CategoryChips locale={locale} active={category} />

      <section className="container-site py-14 sm:py-20">
        {posts.length === 0 ? (
          <EmptyState category={category} locale={locale} />
        ) : (
          <>
            {featured && (
              <div className="mb-10">
                <PostCard
                  locale={locale}
                  post={toCardData(featured)}
                  variant="featured"
                />
              </div>
            )}

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <li key={p.id}>
                  <PostCard locale={locale} post={toCardData(p)} />
                </li>
              ))}
            </ul>

            <Pagination
              basePath={`/${lang}`}
              page={page}
              totalPages={totalPages}
              category={category}
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
    postType: p.post_type as 'article' | 'news',
  }
}

function EmptyState({
  category,
  locale,
}: {
  category: string | null
  locale: Locale
}) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">
        {t(locale, 'blog.empty.kicker')}
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-brand-black">
        {category
          ? tf(locale, 'blog.empty.title_filtered', {
              label: categoryLabel(category, locale),
            })
          : t(locale, 'blog.empty.title')}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        {category ? (
          <>
            {t(locale, 'blog.empty.body_filtered_intro')}{' '}
            {t(locale, 'blog.empty.body_filtered_try')}{' '}
            <a className="text-brand-blue underline" href="./">
              {t(locale, 'blog.empty.body_filtered_all')}
            </a>{' '}
            {t(locale, 'blog.empty.body_filtered_or_check')}
          </>
        ) : (
          t(locale, 'blog.empty.body_unfiltered')
        )}
      </p>
    </div>
  )
}
