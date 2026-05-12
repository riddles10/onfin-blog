'use client'

import { useEffect, useRef, useState } from 'react'
import { t, type Locale } from '@/lib/locales'

// Sticky right-rail table of contents on desktop. The list is built
// server-side from the article's H2s (passed as `items`) so search
// engines see it in the initial HTML; the active-section highlighting
// runs in the browser via IntersectionObserver. Hidden on small screens
// where there's no spare horizontal real estate.

export type TocItem = { id: string; label: string }

export default function TableOfContents({
  items,
  locale,
}: {
  items: TocItem[]
  locale: Locale
}) {
  const [activeId, setActiveId] = useState<string | null>(items[0]?.id ?? null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (items.length === 0) return

    // Resolve the heading elements once. The article body lives in a
    // sibling tree, not in this component, so we look them up by id.
    const headings = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el)
    if (headings.length === 0) return

    // Trigger when a heading crosses 30% from the top of the viewport.
    // That gives the highlight a natural feel: it switches as the
    // heading scrolls past the upper third, before it leaves the
    // viewport entirely.
    const obs = new IntersectionObserver(
      (entries) => {
        // Pick the topmost intersecting heading for stability — multiple
        // can intersect simultaneously when the user scrolls fast.
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]?.target.id) setActiveId(visible[0].target.id)
      },
      { rootMargin: '0px 0px -65% 0px', threshold: 0 }
    )
    headings.forEach((h) => obs.observe(h))
    return () => obs.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <nav
      ref={containerRef}
      aria-label={t(locale, 'blog.toc_aria')}
    >
      <p className="mb-4 font-display text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
        {t(locale, 'blog.toc_heading')}
      </p>
      <ol className="space-y-2 border-l border-ink-100 pl-4 text-sm">
        {items.map((it) => {
          const isActive = it.id === activeId
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                className={[
                  '-ml-[17px] block border-l-2 pl-4 transition',
                  isActive
                    ? 'border-brand-lime font-medium text-brand-black'
                    : 'border-transparent text-ink-500 hover:text-brand-black',
                ].join(' ')}
              >
                {it.label}
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
