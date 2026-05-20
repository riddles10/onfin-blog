"use client";

/**
 * Small client island used inside the server-rendered Footer — keeps the
 * onClick handler client-side so the rest of the Footer can stay SSR.
 * Dispatches `onfin:open-consent` which ConsentBanner listens for.
 */
import { t, type Locale } from "@/lib/locales";

export default function CookiePreferencesButton({
  locale,
}: {
  locale: Locale;
}) {
  return (
    <button
      type="button"
      className="text-xs text-ink-400 underline-offset-2 hover:text-brand-black hover:underline"
      onClick={() =>
        document.dispatchEvent(new CustomEvent("onfin:open-consent"))
      }
    >
      {t(locale, "consent.cookie_prefs_label")}
    </button>
  );
}
