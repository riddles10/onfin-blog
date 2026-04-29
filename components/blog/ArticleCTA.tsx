// Single, restrained CTA at the bottom of an article. One link back to
// the parent marketing site so OnFin always gets a path to conversion
// without the blog feeling like a marketing funnel.

const PARENT_SITE = 'https://onfin.io'

export default function ArticleCTA() {
  return (
    <aside
      aria-label="Get started with OnFin"
      className="mt-16 overflow-hidden rounded-3xl bg-[#0b0b0b] p-8 sm:p-12"
    >
      <div className="relative">
        {/* soft brand glow */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-20 top-1/2 h-60 w-60 -translate-y-1/2 rounded-full bg-brand-lime/15 blur-3xl"
        />
        <div className="relative max-w-2xl">
          <p className="font-display text-xs font-semibold uppercase tracking-[0.22em] text-brand-lime">
            Trade with OnFin
          </p>
          <h2 className="mt-3 font-display text-2xl font-semibold leading-tight tracking-tight text-white sm:text-3xl">
            Put what you just read into practice on a real or demo OnFin account.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-white/70 sm:text-base">
            MT4 and MT5 platforms, 800+ instruments, and the spreads + execution
            you need to act on the analysis you just read. Start with a demo
            account or fund a live one — no obligation either way.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <a
              href={`${PARENT_SITE}/en/account-types`}
              className="inline-flex items-center justify-center gap-2 rounded-pill bg-brand-lime px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-brand-black transition hover:bg-white"
            >
              Open an account
              <span aria-hidden="true">→</span>
            </a>
            <a
              href={`${PARENT_SITE}/en/how`}
              className="inline-flex items-center justify-center gap-2 rounded-pill border border-white/30 px-6 py-3 font-display text-sm font-semibold uppercase tracking-[0.14em] text-white transition hover:border-brand-lime hover:text-brand-lime"
            >
              How OnFin works
            </a>
          </div>
        </div>
      </div>
    </aside>
  )
}
