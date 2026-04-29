import { POST_CATEGORIES, type PostCategory } from '@/lib/cms-config'

// Display metadata for each category — the public-facing label, a tagline
// for the index hero when filtered, and a CSS gradient used as a fallback
// "cover image" when a post doesn't have one. Centralised here so the
// chips, breadcrumbs, post cards, and category landing pages all stay in
// sync.

type CategoryMeta = {
  slug: PostCategory
  label: string
  tagline: string
  /** Two stops for a `linear-gradient(135deg, ...)` placeholder cover. */
  gradient: [string, string]
}

const META: Record<PostCategory, CategoryMeta> = {
  'market-analysis': {
    slug: 'market-analysis',
    label: 'Market analysis',
    tagline: 'Macro, currency, and rate moves explained for retail traders.',
    gradient: ['#0b0b0b', '#2015ff'],
  },
  'trading-guides': {
    slug: 'trading-guides',
    label: 'Trading guides',
    tagline: 'Hands-on walkthroughs from order types to position sizing.',
    gradient: ['#0b0b0b', '#9fce10'],
  },
  'platform-updates': {
    slug: 'platform-updates',
    label: 'Platform updates',
    tagline: 'Maintenance windows, schedule changes, and MT4/MT5 release notes.',
    gradient: ['#0b0b0b', '#444444'],
  },
  'regulation-news': {
    slug: 'regulation-news',
    label: 'Regulation news',
    tagline: 'Licensing, compliance, and what regulator changes mean for traders.',
    gradient: ['#0b0b0b', '#fa876b'],
  },
  strategies: {
    slug: 'strategies',
    label: 'Strategies',
    tagline: 'Setups, frameworks, and risk-management patterns under real conditions.',
    gradient: ['#2015ff', '#9fce10'],
  },
  general: {
    slug: 'general',
    label: 'OnFin desk',
    tagline: 'Editorial notes, longer reads, and team perspectives.',
    gradient: ['#444444', '#9fce10'],
  },
}

export function categoryLabel(slug: string): string {
  return META[slug as PostCategory]?.label ?? 'Article'
}

export function categoryTagline(slug: string): string {
  return META[slug as PostCategory]?.tagline ?? ''
}

export function categoryGradient(slug: string): string {
  const m = META[slug as PostCategory]
  if (!m) return 'linear-gradient(135deg, #0b0b0b 0%, #444444 100%)'
  return `linear-gradient(135deg, ${m.gradient[0]} 0%, ${m.gradient[1]} 100%)`
}

export function isPostCategory(slug: string): slug is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(slug)
}

export const ALL_CATEGORIES: CategoryMeta[] = POST_CATEGORIES.map((s) => META[s])
