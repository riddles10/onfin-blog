import type { Metadata } from 'next'
import { getServiceClient } from '@/lib/supabase'
import { isPostCategory, categoryLabel, categoryTagline } from '@/lib/categories'
import BlogHero from '@/components/blog/BlogHero'
import CategoryChips from '@/components/blog/CategoryChips'
import PostCard from '@/components/blog/PostCard'
import Pagination from '@/components/blog/Pagination'

// Public blog index. SEO-clean: every category and page combination has
// a real, crawlable URL via search params, and the SSR response always
// reflects the filter — no client-side gating.

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
}

async function fetchPosts(opts: {
  category: string | null
  page: number
}): Promise<{ posts: IndexPost[]; total: number }> {
  const supabase = getServiceClient()
  const from = (opts.page - 1) * POSTS_PER_PAGE
  const to = from + POSTS_PER_PAGE - 1

  let q = supabase
    .from('posts')
    .select(
      'id, slug, title_en, excerpt_en, body_en, category, cover_image, published_at',
      { count: 'exact' }
    )
    .eq('published', true)
    .order('published_at', { ascending: false })
    .range(from, to)

  if (opts.category) q = q.eq('category', opts.category)

  const { data, error, count } = await q
  if (error) {
    console.error('[blog index] supabase error:', error.message)
    return { posts: [], total: 0 }
  }
  return { posts: (data || []) as IndexPost[], total: count ?? 0 }
}

function parseSearch(search: Search): { category: string | null; page: number } {
  const c = search.category && isPostCategory(search.category) ? search.category : null
  const pageNum = Math.max(1, parseInt(search.page ?? '1', 10) || 1)
  return { category: c, page: pageNum }
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<Params>
  searchParams: Promise<Search>
}): Promise<Metadata> {
  const { lang } = await params
  const sp = await searchParams
  const { category } = parseSearch(sp)
  const title = category
    ? `${categoryLabel(category)} — OnFin Blog`
    : 'OnFin Blog — Editorial coverage for retail traders'
  const description = category
    ? categoryTagline(category)
    : 'Market analysis, trading guides, platform updates, and regulation news from the OnFin editorial desk.'
  const canonical = category ? `/${lang}?category=${category}` : `/${lang}`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      type: 'website',
      url: canonical,
      title,
      description,
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
  const sp = await searchParams
  const { category, page } = parseSearch(sp)
  const { posts, total } = await fetchPosts({ category, page })
  const totalPages = Math.max(1, Math.ceil(total / POSTS_PER_PAGE))

  // Hero copy: when the index is filtered, swap the default tagline for
  // the category-specific one so readers landing from a search engine
  // land on a page that says exactly what it is.
  const heroEyebrow = category ? `Category · ${categoryLabel(category)}` : 'OnFin Editorial'
  const heroTitle = category
    ? categoryLabel(category)
    : 'Market analysis, guides, and news for retail traders'
  const heroTagline = category
    ? categoryTagline(category)
    : "Everything coming out of the OnFin desk — schedule notices, platform updates, regulation explainers, and the occasional long-form trading guide. New writing every week."

  // First page only: lift the most recent post into a wide "featured"
  // tile so the layout doesn't read as a uniform grid the moment readers
  // land. Skipped on filtered or paginated views.
  const lift = !category && page === 1 && posts.length > 0
  const featured = lift ? posts[0] : null
  const rest = lift ? posts.slice(1) : posts

  return (
    <main id="main-content">
      <BlogHero eyebrow={heroEyebrow} title={heroTitle} tagline={heroTagline} />

      <CategoryChips locale={lang} active={category} />

      <section className="container-site py-14 sm:py-20">
        {posts.length === 0 ? (
          <EmptyState category={category} />
        ) : (
          <>
            {featured && (
              <div className="mb-10">
                <PostCard
                  locale={lang}
                  post={toCardData(featured)}
                  variant="featured"
                />
              </div>
            )}

            <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {rest.map((p) => (
                <li key={p.id}>
                  <PostCard locale={lang} post={toCardData(p)} />
                </li>
              ))}
            </ul>

            <Pagination
              basePath={`/${lang}`}
              page={page}
              totalPages={totalPages}
              category={category}
            />
          </>
        )}
      </section>
    </main>
  )
}

function toCardData(p: IndexPost) {
  return {
    id: p.id,
    slug: p.slug,
    title: p.title_en,
    excerpt: p.excerpt_en,
    body: p.body_en,
    category: p.category,
    coverImage: p.cover_image,
    publishedAt: p.published_at,
  }
}

function EmptyState({ category }: { category: string | null }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-ink-200 bg-ink-50 p-10 text-center">
      <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">
        Nothing here yet
      </p>
      <h2 className="mt-3 font-display text-2xl font-semibold text-brand-black">
        {category ? `No ${categoryLabel(category)} articles yet` : 'No articles published yet'}
      </h2>
      <p className="mt-3 text-sm leading-relaxed text-ink-500">
        The OnFin desk is preparing the first batch of articles in this
        category. {category && (
          <>
            Try{' '}
            <a className="text-brand-blue underline" href="./">
              all articles
            </a>{' '}
            or check back soon.
          </>
        )}
      </p>
    </div>
  )
}
