'use client'

import { useState } from 'react'
import { t, type Locale } from '@/lib/locales'

// Vertical share rail (sticky left of the article body on desktop) and
// inline horizontal version (rendered at the bottom of the body on mobile
// and tablet). 'use client' is needed only for the copy-link state — the
// X / LinkedIn buttons are plain links and would work as a server
// component too, but co-locating them keeps the file simple.

type Variant = 'rail' | 'inline'

export default function ShareRail({
  title,
  url,
  variant = 'rail',
  locale,
}: {
  title: string
  url: string                 // absolute URL of the current article
  variant?: Variant
  locale: Locale
}) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Fallback: open a simple prompt the user can copy from manually.
      // Clipboard permissions can fail in an iframe or after the tab
      // loses focus — degrade gracefully rather than swallow the click.
      window.prompt(t(locale, 'blog.copy_url_prompt'), url)
    }
  }

  const xHref = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    title
  )}&url=${encodeURIComponent(url)}`
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(
    url
  )}`

  // Outer visibility is controlled by the parent in the article page —
  // the rail is wrapped in `hidden xl:block` and the inline variant is
  // wrapped in `xl:hidden`. We only own internal layout here.
  const wrapperCls =
    variant === 'rail'
      ? 'flex flex-col items-center gap-3'
      : 'flex items-center justify-center gap-3'
  const labelHidden = variant === 'rail' ? 'sr-only' : ''

  return (
    <div className={wrapperCls} aria-label={t(locale, 'blog.share_aria')}>
      {variant === 'rail' && (
        <p className="mb-1 [writing-mode:vertical-rl] rotate-180 font-display text-[10px] font-semibold uppercase tracking-[0.32em] text-ink-300">
          {t(locale, 'blog.share')}
        </p>
      )}

      <ShareButton
        href={xHref}
        label={t(locale, 'blog.share_on_x')}
        labelClass={labelHidden}
      >
        <IconX />
      </ShareButton>

      <ShareButton
        href={linkedInHref}
        label={t(locale, 'blog.share_on_linkedin')}
        labelClass={labelHidden}
      >
        <IconLinkedIn />
      </ShareButton>

      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? t(locale, 'blog.link_copied') : t(locale, 'blog.copy_link')}
        className="group grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-500 transition hover:border-brand-black hover:text-brand-black"
      >
        {copied ? <IconCheck /> : <IconLink />}
        <span className={labelHidden}>
          {copied ? t(locale, 'blog.copied') : t(locale, 'blog.copy_link')}
        </span>
      </button>
    </div>
  )
}

function ShareButton({
  href,
  label,
  labelClass,
  children,
}: {
  href: string
  label: string
  labelClass: string
  children: React.ReactNode
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="grid h-10 w-10 place-items-center rounded-full border border-ink-200 bg-white text-ink-500 transition hover:border-brand-black hover:text-brand-black"
    >
      {children}
      <span className={labelClass}>{label}</span>
    </a>
  )
}

function IconX() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M18.244 2H21.5l-7.5 8.572L23 22h-6.875l-5.39-6.99L4.5 22H1.244l8.06-9.213L1 2h7.04l4.875 6.4L18.244 2Zm-2.41 18h1.93L7.295 4H5.235l10.6 16Z" />
    </svg>
  )
}

function IconLinkedIn() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.452 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.137 1.447-2.137 2.94v5.666H9.354V9h3.413v1.561h.046c.477-.9 1.637-1.85 3.368-1.85 3.6 0 4.265 2.37 4.265 5.455v6.286ZM5.337 7.433a2.064 2.064 0 1 1 0-4.128 2.064 2.064 0 0 1 0 4.128ZM7.114 20.452H3.557V9h3.557v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
    </svg>
  )
}

function IconLink() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
