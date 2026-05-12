import Link from 'next/link'
import { formatDate } from '@/lib/format'
import { t, type Locale } from '@/lib/locales'

export type Author = {
  // `slug` enables the byline link to the author profile page (E-E-A-T
  // signal). Optional because demo data and legacy posts may not carry it.
  slug?: string | null
  name: string
  bio?: string | null
  avatarUrl?: string | null
}

// Two-variant author byline.
//   `compact` — the inline strip below the article H1 (avatar + name + date)
//   `full`   — the larger card at the bottom of the article (bio + larger avatar)

export default function AuthorByline({
  author,
  publishedAt,
  variant = 'compact',
  locale,
}: {
  author: Author | null
  publishedAt: string | null
  variant?: 'compact' | 'full'
  locale: Locale
}) {
  if (!author && !publishedAt) return null

  const profileHref = author?.slug ? `/${locale}/authors/${author.slug}` : null

  if (variant === 'full') {
    return (
      <aside className="mt-16 rounded-2xl border border-ink-100 bg-ink-50 p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="shrink-0">
            <Avatar author={author} size={72} />
          </div>
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
              {t(locale, 'blog.author.written_by')}
            </p>
            <p className="mt-1 font-display text-xl font-semibold text-brand-black">
              {profileHref ? (
                <Link href={profileHref} className="hover:text-brand-blue">
                  {author?.name ?? t(locale, 'blog.author.default_name')}
                </Link>
              ) : (
                author?.name ?? t(locale, 'blog.author.default_name')
              )}
            </p>
            {author?.bio && (
              <p className="mt-3 text-sm leading-relaxed text-ink-500">
                {author.bio}
              </p>
            )}
          </div>
        </div>
      </aside>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-3 text-sm text-ink-500">
      <Avatar author={author} size={36} />
      {author?.name && (
        profileHref ? (
          <Link
            href={profileHref}
            className="font-display font-semibold text-brand-black hover:text-brand-blue"
          >
            {author.name}
          </Link>
        ) : (
          <span className="font-display font-semibold text-brand-black">
            {author.name}
          </span>
        )
      )}
      {publishedAt && (
        <>
          <span aria-hidden="true" className="text-ink-300">·</span>
          <time dateTime={publishedAt}>{formatDate(publishedAt)}</time>
        </>
      )}
    </div>
  )
}

function Avatar({
  author,
  size,
}: {
  author: Author | null
  size: number
}) {
  if (author?.avatarUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={author.avatarUrl}
        alt=""
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className="rounded-full bg-ink-100 object-cover"
        style={{ width: size, height: size }}
      />
    )
  }
  // Initials fallback so we always show something even when the author
  // doesn't have an avatar configured yet.
  const initials = (author?.name ?? 'O F')
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? '')
    .join('')
  return (
    <span
      aria-hidden="true"
      className="grid shrink-0 place-items-center rounded-full bg-brand-black font-display text-xs font-semibold text-brand-lime"
      style={{ width: size, height: size }}
    >
      {initials}
    </span>
  )
}
