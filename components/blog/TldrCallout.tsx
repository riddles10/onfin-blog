import { t, type Locale } from '@/lib/locales'

export default function TldrCallout({
  html,
  locale,
}: {
  html: string
  locale: Locale
}) {
  return (
    <aside
      aria-label={t(locale, 'blog.tldr.aria')}
      className="mb-10 rounded-2xl border border-brand-lime/40 bg-brand-lime/[0.08] p-5 sm:p-6"
    >
      <p className="font-display text-[11px] font-semibold uppercase tracking-[0.22em] text-brand-black/70">
        {t(locale, 'blog.tldr.label')}
      </p>
      <div
        className="mt-3 text-[15px] leading-relaxed text-brand-black/90 sm:text-base [&_a]:text-brand-blue [&_a]:underline [&_strong]:font-semibold"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </aside>
  )
}
