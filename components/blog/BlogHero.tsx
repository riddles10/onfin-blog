// Dark hero for the blog index. Restrained: an eyebrow, an H1, and one
// short tagline — no CTAs competing for attention. Two soft brand-lime
// glow blobs nod at onfin.io's marketing pages without copying them.

export default function BlogHero({
  eyebrow,
  title,
  tagline,
}: {
  eyebrow: string
  title: string
  tagline: string
}) {
  return (
    <section
      className="relative overflow-hidden bg-[#0b0b0b]"
      aria-labelledby="blog-hero-title"
    >
      {/* Decorative glows — purely visual, not in the a11y tree */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-32 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-lime/15 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-32 bottom-0 h-80 w-80 rounded-full bg-brand-blue/15 blur-3xl"
      />

      <div className="container-site relative py-20 sm:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-5 font-display text-xs font-semibold uppercase tracking-[0.28em] text-brand-lime">
            {eyebrow}
          </p>
          <h1
            id="blog-hero-title"
            className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            {title}
          </h1>
          <p className="mt-6 text-base leading-relaxed text-white/70 sm:text-lg">
            {tagline}
          </p>
        </div>
      </div>
    </section>
  )
}
