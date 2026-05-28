// Single source of truth for which locales blog.onfin.io serves AND
// for the i18n string lookup the chrome (Header/Footer/CTAs) uses.
//
// Mirrors onfin.io/astro.config.mjs and onfin.io/src/lib/i18n.ts so
// cross-domain navigation works end-to-end and the blog's chrome reads
// in the same language as the parent site. The dictionaries under
// `i18n/<locale>.json` are copies of onfin.io's i18n files — keep them
// in sync if onfin.io changes its keys.

import en from '@/i18n/en.json'
import ru from '@/i18n/ru.json'
import vi from '@/i18n/vi.json'
import th from '@/i18n/th.json'
import ms from '@/i18n/ms.json'
import id from '@/i18n/id.json'
import es from '@/i18n/es.json'
import km from '@/i18n/km.json'
import zh from '@/i18n/zh.json'
import zhTw from '@/i18n/zh-tw.json'
import tr from '@/i18n/tr.json'

export const SUPPORTED_LOCALES = [
  'en',
  'ru',
  'vi',
  'th',
  'ms',
  'id',
  'es',
  'km',
  'zh',
  'zh-tw',
  'tr',
] as const

export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

export function isLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value)
}

/**
 * BCP 47 codes for `Intl.DateTimeFormat` and the `lang` attribute on
 * `<html>`. The route-segment locale is the short ISO code; this map
 * upgrades it to the canonical regional form for each locale.
 */
export const BCP47: Record<Locale, string> = {
  en: 'en-US',
  ru: 'ru-RU',
  vi: 'vi-VN',
  th: 'th-TH',
  ms: 'ms-MY',
  id: 'id-ID',
  es: 'es-419',
  km: 'km-KH',
  zh: 'zh-Hans',
  'zh-tw': 'zh-Hant',
  tr: 'tr-TR',
}

/**
 * Human-readable names for the locale switcher / footer / language picker.
 * Names are written in their own language (endonyms) so a Russian reader
 * sees "Русский" rather than "Russian".
 */
export const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  ru: 'Русский',
  vi: 'Tiếng Việt',
  th: 'ไทย',
  ms: 'Bahasa Melayu',
  id: 'Bahasa Indonesia',
  es: 'Español',
  km: 'ភាសាខ្មែរ',
  zh: '简体中文',
  'zh-tw': '繁體中文',
  tr: 'Türkçe',
}

// ─────────────────────────────────────────────────────────────────────────────
// i18n string lookup
// ─────────────────────────────────────────────────────────────────────────────

type Dict = Record<string, unknown>

const DICTS: Record<Locale, Dict> = {
  en: en as Dict,
  ru: ru as Dict,
  vi: vi as Dict,
  th: th as Dict,
  ms: ms as Dict,
  id: id as Dict,
  es: es as Dict,
  km: km as Dict,
  zh: zh as Dict,
  'zh-tw': zhTw as Dict,
  tr: tr as Dict,
}

function lookup(dict: Dict, key: string): string | undefined {
  // Allow both flat keys ("nav.about") and nested objects.
  if (key in dict) {
    const flat = dict[key]
    if (typeof flat === 'string') return flat
  }
  const parts = key.split('.')
  let cur: unknown = dict
  for (const part of parts) {
    if (cur && typeof cur === 'object' && part in (cur as Dict)) {
      cur = (cur as Dict)[part]
    } else {
      return undefined
    }
  }
  return typeof cur === 'string' ? cur : undefined
}

/**
 * Translate a key for a given locale, falling back to English if the
 * locale is missing the key. Returns the raw key (with a console warning
 * in dev) when even the English fallback is missing — surfaces typos
 * quickly without blowing up the page.
 */
export function t(locale: Locale, key: string): string {
  const direct = lookup(DICTS[locale], key)
  if (direct !== undefined) return direct
  const fallback = lookup(DICTS[DEFAULT_LOCALE], key)
  if (fallback !== undefined) return fallback
  if (process.env.NODE_ENV !== 'production') {
    console.warn(`[i18n] Missing key "${key}" for locale "${locale}" (and fallback "en")`)
  }
  return key
}

/**
 * Like `t()`, but interpolates `{name}` tokens in the looked-up string
 * with values from `vars`. Tokens that don't have a matching var are left
 * untouched — same failure mode as `t()` for a missing key, makes typos
 * easy to spot in dev.
 */
export function tf(
  locale: Locale,
  key: string,
  vars: Record<string, string | number>
): string {
  return t(locale, key).replace(/\{(\w+)\}/g, (m, name) => {
    const v = vars[name]
    return v === undefined ? m : String(v)
  })
}

/**
 * Build a localized path. Always returns a prefixed path — the blog
 * uses `prefixDefaultLocale: true` semantics so /en/... is canonical.
 */
export function localizedPath(locale: Locale, path: string = '/'): string {
  const clean = path.startsWith('/') ? path : `/${path}`
  if (clean === '/') return `/${locale}`
  return `/${locale}${clean}`
}

/**
 * Given a path like "/en/news_30_03_2026", return the locale prefix.
 * Returns null if the path isn't locale-prefixed (e.g. "/sitemap.xml").
 */
export function localeFromPath(pathname: string): Locale | null {
  // Match the longest locale prefix first so "zh-tw" beats the shorter "zh".
  for (const loc of [...SUPPORTED_LOCALES].sort((a, b) => b.length - a.length)) {
    if (pathname === `/${loc}` || pathname.startsWith(`/${loc}/`)) {
      return loc
    }
  }
  return null
}

/**
 * Swap the locale prefix on a given path. Used by the language switcher
 * — preserves the rest of the URL so a reader on /ru/news_X jumps to
 * /th/news_X.
 */
export function switchLocaleInPath(pathname: string, to: Locale): string {
  const current = localeFromPath(pathname)
  if (current) {
    return pathname.replace(`/${current}`, `/${to}`)
  }
  return `/${to}${pathname === '/' ? '' : pathname}`
}
