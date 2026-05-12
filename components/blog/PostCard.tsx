import Link from 'next/link'
import { categoryGradient, categoryLabel } from '@/lib/categories'
import { formatDate, htmlToExcerpt } from '@/lib/format'
import { t, type Locale } from '@/lib/locales'

// Single article tile. The whole card is one `<a>` so the entire surface
// is clickable; nested elements use `pointer-events: none` for fine
// hover detail (the arrow at the bottom). Renders a category-coloured
// gradient block when no cover image is set, so cards never have a hole.

export type PostCardData = {
  id: string
  slug: string
  title: string
  excerpt?: string | null
  body?: string                       // optional — used to derive an excerpt fallback
  category: string
  coverImage?: string | null
  publishedAt: string | null
}

export default function PostCard({
  locale,
  post,
  variant = 'default',
}: {
  locale: Locale
  post: PostCardData
  variant?: 'default' | 'featured' | 'compact'
}) {
  const excerpt =
    post.excerpt && post.excerpt.length > 0
      ? post.excerpt
      : post.body
      ? htmlToExcerpt(post.body, 160)
      : ''

  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'

  return (
    <article className="group h-full">
      <Link
        href={`/${locale}/${post.slug}`}
        className={[
          'flex h-full flex-col overflow-hidden rounded-2xl border border-ink-100 bg-white transition',
          'hover:-translate-y-0.5 hover:border-brand-lime hover:shadow-[0_18px_36px_-24px_rgba(0,0,0,0.25)]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-lime focus-visible:ring-offset-2',
          isFeatured ? 'sm:flex-row' : '',
        ].join(' ')}
      >
        {/* Cover image / gradient placeholder */}
        <div
          className={[
            'relative shrink-0 overflow-hidden bg-ink-100',
            isFeatured
              ? 'aspect-[16/10] sm:aspect-auto sm:h-full sm:w-1/2'
              : isCompact
              ? 'aspect-[16/9]'
              : 'aspect-[16/10]',
          ].join(' ')}
          style={
            !post.coverImage
              ? { backgroundImage: categoryGradient(post.category) }
              : undefined
          }
        >
          {post.coverImage ? (
            // Plain <img> avoids needing every Tilda/Supabase/Unsplash host
            // in next.config remotePatterns. Native lazy loading is enough
            // for editorial cover images.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={post.coverImage}
              alt=""
              loading="lazy"
              decoding="async"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
            />
          ) : (
            // When no cover, place the category label as a soft watermark
            // so the empty block still earns its space.
            <div className="absolute inset-0 flex items-end p-5">
              <span className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-white/70">
                {categoryLabel(post.category, locale)}
              </span>
            </div>
          )}
        </div>

        {/* Body */}
        <div
          className={[
            'flex flex-1 flex-col gap-3',
            isFeatured ? 'p-7 sm:p-9' : 'p-6',
          ].join(' ')}
        >
          <div className="flex flex-wrap items-center gap-3 text-xs">
            <span className="font-display font-semibold uppercase tracking-[0.18em] text-brand-blue">
              {categoryLabel(post.category, locale)}
            </span>
            {post.publishedAt && (
              <>
                <span aria-hidden="true" className="text-ink-300">·</span>
                <time
                  dateTime={post.publishedAt}
                  className="text-ink-400"
                >
                  {formatDate(post.publishedAt)}
                </time>
              </>
            )}
          </div>

          <h3
            className={[
              'font-display font-semibold leading-snug tracking-tight text-brand-black transition',
              'group-hover:text-ink-700',
              isFeatured ? 'text-2xl sm:text-3xl' : isCompact ? 'text-lg' : 'text-xl',
            ].join(' ')}
          >
            {post.title}
          </h3>

          {excerpt && !isCompact && (
            <p className="line-clamp-3 text-sm leading-relaxed text-ink-500">
              {excerpt}
            </p>
          )}

          <span className="mt-auto inline-flex items-center gap-1.5 pt-2 font-display text-xs font-semibold uppercase tracking-[0.14em] text-brand-black">
            {t(locale, 'blog.read_article')}
            <span aria-hidden="true" className="transition group-hover:translate-x-1">→</span>
          </span>
        </div>
      </Link>
    </article>
  )
}
