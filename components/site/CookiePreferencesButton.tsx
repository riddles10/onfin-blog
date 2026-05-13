"use client";

/**
 * Small client island used inside the server-rendered Footer — keeps the
 * onClick handler client-side so the rest of the Footer can stay SSR.
 * Dispatches `onfin:open-consent` which ConsentBanner listens for.
 */
export default function CookiePreferencesButton() {
  return (
    <button
      type="button"
      className="text-xs text-ink-400 underline-offset-2 hover:text-brand-black hover:underline"
      onClick={() =>
        document.dispatchEvent(new CustomEvent("onfin:open-consent"))
      }
    >
      Cookie preferences
    </button>
  );
}
