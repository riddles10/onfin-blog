import PostCard, { type PostCardData } from '@/components/blog/PostCard'

// Three-card "Read next" rail at the bottom of an article. Reuses
// PostCard so the visual language matches the index. Hidden when there's
// nothing related to surface — never render a section that says "Read
// next" with one or zero cards under it.

export default function RelatedPosts({
  locale,
  posts,
}: {
  locale: string
  posts: PostCardData[]
}) {
  if (posts.length < 2) return null
  const top = posts.slice(0, 3)

  return (
    <section
      aria-labelledby="related-posts-heading"
      className="mt-20 border-t border-ink-100 pt-12"
    >
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-ink-400">
            Read next
          </p>
          <h2
            id="related-posts-heading"
            className="mt-2 font-display text-2xl font-semibold text-brand-black sm:text-3xl"
          >
            More from the OnFin desk
          </h2>
        </div>
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {top.map((post) => (
          <li key={post.id}>
            <PostCard locale={locale} post={post} variant="compact" />
          </li>
        ))}
      </ul>
    </section>
  )
}
