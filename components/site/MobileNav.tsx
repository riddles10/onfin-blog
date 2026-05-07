'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { t, type Locale } from '@/lib/locales'

interface NavLink {
  href: string
  label: string
}

interface NavGroup {
  label: string
  items: NavLink[]
}

// Mobile drawer — ports the off-canvas pattern from onfin.io's Nav.astro.
//
// Open/close state is local React state. The trigger button (rendered
// inside Header.tsx) carries `data-mobile-nav-trigger`; we hook a click
// listener on that element rather than passing a callback so the
// trigger can stay inside a server component.
//
// Body scroll is locked while open. ESC closes. Tapping a link closes
// the drawer so navigation feels responsive even when the target page
// is already loaded.
export default function MobileNav({
  locale,
  groups,
  loginHref,
  registerHref,
}: {
  locale: Locale
  groups: NavGroup[]
  loginHref: string
  registerHref: string
}) {
  const [open, setOpen] = useState(false)

  // Wire up the trigger button + ESC key listener.
  useEffect(() => {
    const trigger = document.querySelector('[data-mobile-nav-trigger]')
    const onTrigger = () => setOpen((o) => !o)
    trigger?.addEventListener('click', onTrigger)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)

    return () => {
      trigger?.removeEventListener('click', onTrigger)
      document.removeEventListener('keydown', onKey)
    }
  }, [])

  // Lock body scroll while the drawer is open.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = open ? 'hidden' : ''
    // Mirror the trigger's aria-expanded for screen readers.
    const trigger = document.querySelector('[data-mobile-nav-trigger]')
    trigger?.setAttribute('aria-expanded', String(open))
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <div
      id="mobile-nav-drawer"
      role="dialog"
      aria-modal="true"
      aria-label="Main menu"
      className={`pointer-events-none fixed inset-0 z-50 transition-opacity duration-200 lg:hidden ${
        open ? 'pointer-events-auto opacity-100 visible' : 'opacity-0 invisible'
      }`}
    >
      {/* backdrop */}
      <button
        type="button"
        aria-label="Close menu"
        onClick={close}
        className="absolute inset-0 bg-black/50"
      />

      {/* panel */}
      <div
        className={`absolute right-0 top-0 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ease-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* drawer header */}
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-ink-100 px-5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-dark.svg" alt="OnFin" width={170} height={40} className="h-8 w-auto" />
          <button
            type="button"
            onClick={close}
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-100 text-brand-black transition hover:bg-ink-50"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M6 6l12 12M6 18L18 6" />
            </svg>
          </button>
        </div>

        {/* nav groups */}
        <div className="flex-1 overflow-y-auto px-5 py-6">
          {groups.map((group) => (
            <div key={group.label} className="mb-7 last:mb-0">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-400">
                {group.label}
              </p>
              <ul className="space-y-1">
                {group.items.map((item) => {
                  const isInternal = item.href.startsWith('/')
                  return (
                    <li key={item.href}>
                      {isInternal ? (
                        <Link
                          href={item.href}
                          onClick={close}
                          className="block rounded-xl px-3 py-2.5 text-base font-medium text-brand-black/85 transition hover:bg-brand-lime/10 hover:text-brand-black"
                        >
                          {item.label}
                        </Link>
                      ) : (
                        <a
                          href={item.href}
                          onClick={close}
                          className="block rounded-xl px-3 py-2.5 text-base font-medium text-brand-black/85 transition hover:bg-brand-lime/10 hover:text-brand-black"
                        >
                          {item.label}
                        </a>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* drawer footer: login + register */}
        <div className="grid shrink-0 grid-cols-2 gap-3 border-t border-ink-100 bg-white p-5">
          <a
            href={loginHref}
            className="inline-flex items-center justify-center rounded-full border border-ink-200 bg-white px-5 py-3 text-sm font-semibold text-brand-black transition hover:border-ink-300"
          >
            {t(locale, 'cta.login')}
          </a>
          <a
            href={registerHref}
            className="inline-flex items-center justify-center rounded-full bg-brand-lime px-5 py-3 text-sm font-semibold text-brand-black transition hover:bg-brand-lime/90"
          >
            {t(locale, 'cta.register')}
          </a>
        </div>
      </div>
    </div>
  )
}
