// Single source of truth for which locales blog.onfin.io serves.
//
// Mirrors onfin.io/astro.config.mjs so cross-domain navigation works end
// to end. If a locale is added or dropped on the parent site, update
// both files — the `parentSiteUrl()` helper in lib/onfin-links.ts has
// its own copy of the parent's locale set so the blog can support a
// locale the parent doesn't (rare, but handled).

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
  km: 'ខ្មែរ',
  zh: '简体中文',
}
