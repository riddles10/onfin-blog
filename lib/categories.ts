import { POST_CATEGORIES, type PostCategory } from '@/lib/cms-config'
import { t, type Locale } from '@/lib/locales'

// Display metadata for each category. Labels and taglines are looked up
// from i18n via `t(locale, 'blog.category.<key>.label/tagline')` so they
// translate consistently with the rest of the blog chrome. Gradients stay
// here as pure presentation data — they don't change across locales.

/** Two stops for a `linear-gradient(135deg, ...)` placeholder cover. */
type Gradient = [string, string]

const GRADIENTS: Record<PostCategory, Gradient> = {
  'market-analysis': ['#0b0b0b', '#2015ff'],
  'trading-guides': ['#0b0b0b', '#9fce10'],
  'platform-updates': ['#0b0b0b', '#444444'],
  'regulation-news': ['#0b0b0b', '#fa876b'],
  strategies: ['#2015ff', '#9fce10'],
  general: ['#444444', '#9fce10'],
}

// i18n keys use snake_case while PostCategory slugs use hyphens (so the
// hyphenated form can stay in URLs / DB rows). This map bridges the two
// so the i18n side of the world can stay convention-consistent with the
// rest of the dictionaries.
const KEY_SLUG: Record<PostCategory, string> = {
  'market-analysis': 'market_analysis',
  'trading-guides': 'trading_guides',
  'platform-updates': 'platform_updates',
  'regulation-news': 'regulation_news',
  strategies: 'strategies',
  general: 'general',
}

export function categoryLabel(slug: string, locale: Locale): string {
  const key = isPostCategory(slug) ? KEY_SLUG[slug] : null
  if (!key) return t(locale, 'blog.category.general.label')
  return t(locale, `blog.category.${key}.label`)
}

export function categoryTagline(slug: string, locale: Locale): string {
  const key = isPostCategory(slug) ? KEY_SLUG[slug] : null
  if (!key) return ''
  return t(locale, `blog.category.${key}.tagline`)
}

export function categoryGradient(slug: string): string {
  const g = isPostCategory(slug) ? GRADIENTS[slug] : null
  if (!g) return 'linear-gradient(135deg, #0b0b0b 0%, #444444 100%)'
  return `linear-gradient(135deg, ${g[0]} 0%, ${g[1]} 100%)`
}

export function isPostCategory(slug: string): slug is PostCategory {
  return (POST_CATEGORIES as readonly string[]).includes(slug)
}

export type LocalizedCategory = {
  slug: PostCategory
  label: string
  tagline: string
  gradient: string
}

/**
 * Build the per-locale view of every category. Used by CategoryChips and
 * any other consumer that needs the full ordered list — replaces the
 * previous static `ALL_CATEGORIES` export, which baked English labels in.
 */
export function categoriesForLocale(locale: Locale): LocalizedCategory[] {
  return (POST_CATEGORIES as readonly PostCategory[]).map((slug) => ({
    slug,
    label: categoryLabel(slug, locale),
    tagline: categoryTagline(slug, locale),
    gradient: categoryGradient(slug),
  }))
}
