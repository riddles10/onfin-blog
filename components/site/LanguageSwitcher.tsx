'use client'

import { usePathname } from 'next/navigation'
import {
  LOCALE_NAMES,
  SUPPORTED_LOCALES,
  switchLocaleInPath,
  type Locale,
} from '@/lib/locales'

// Locale switcher — ports onfin.io/components/LanguageSwitcher.astro.
//
// Native <details> element for zero-runtime disclosure (works without JS;
// 'use client' is here only because we read the current pathname for the
// switch links). Each option swaps the locale prefix on the current path
// via `switchLocaleInPath()`, preserving the rest of the URL so a reader
// on /ru/news_X jumps to /th/news_X rather than /th.

// Display order mirrors onfin.io. Flag code is the ISO country code used
// by flagcdn.com — not always the same as the locale code (en→gb, vi→vn).
const LOCALE_DISPLAY: { code: Locale; flag: string }[] = [
  { code: 'en', flag: 'gb' },
  { code: 'id', flag: 'id' },
  { code: 'es', flag: 'es' },
  { code: 'th', flag: 'th' },
  { code: 'ms', flag: 'my' },
  { code: 'vi', flag: 'vn' },
  { code: 'ru', flag: 'ru' },
  { code: 'km', flag: 'kh' },
  { code: 'zh', flag: 'cn' },
]

export default function LanguageSwitcher({ locale }: { locale: Locale }) {
  const pathname = usePathname() || `/${locale}`
  const currentFlag = LOCALE_DISPLAY.find((l) => l.code === locale)?.flag ?? 'gb'

  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-ink-100 px-3 py-1.5 text-xs font-medium text-brand-black/80 hover:text-brand-black [&::-webkit-details-marker]:hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://flagcdn.com/w40/${currentFlag}.png`}
          srcSet={`https://flagcdn.com/w80/${currentFlag}.png 2x`}
          width={16}
          height={12}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="h-3 w-4 rounded-[2px] object-cover"
        />
        <span className="uppercase">{locale}</span>
        <span className="transition group-open:rotate-180" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div className="absolute right-0 top-full mt-2 min-w-[180px] rounded-xl border border-ink-100 bg-white p-2 shadow-lg z-50">
        {SUPPORTED_LOCALES.map((loc) => {
          const display = LOCALE_DISPLAY.find((l) => l.code === loc)!
          return (
            <a
              key={loc}
              href={switchLocaleInPath(pathname, loc)}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm hover:bg-ink-50 ${
                loc === locale
                  ? 'font-semibold text-brand-black'
                  : 'text-brand-black/70 hover:text-brand-black'
              }`}
              aria-current={loc === locale ? 'true' : undefined}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://flagcdn.com/w40/${display.flag}.png`}
                srcSet={`https://flagcdn.com/w80/${display.flag}.png 2x`}
                width={20}
                height={15}
                alt=""
                aria-hidden="true"
                loading="lazy"
                className="h-[15px] w-5 shrink-0 rounded-[2px] object-cover"
              />
              <span>{LOCALE_NAMES[loc]}</span>
            </a>
          )
        })}
      </div>
    </details>
  )
}
