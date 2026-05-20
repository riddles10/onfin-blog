"use client";

/**
 * ConsentBanner — granular cookie consent for blog.onfin.io.
 *
 * Mirrors the onfin.io banner (categories + UX) so a visitor's choice on
 * either subdomain is honored on the other via the shared `.onfin.io`
 * `onfin_consent` cookie. Unlike the main site, the blog has no GTM/GA
 * scripts of its own, so this banner only persists the choice — there's
 * no Consent Mode v2 dataLayer to update here.
 *
 * Also calls captureFromCurrentUrl() on mount so first-touch UTM /
 * click-id / referral params are captured into `onfin_attr` even when
 * the user lands on the blog before the main site.
 *
 * Layout
 * ------
 * Desktop (>=sm): bottom-left corner card, max-w-md (~448px). Mobile (<sm):
 * edge-to-edge bottom sheet so page content stays visible above.
 *
 * Two-step disclosure
 * -------------------
 * Step 1: short intro + GDPR link + Accept/Reject/Customize.
 * Step 2: Necessary/Analytics/Marketing toggles + Back/Save.
 * Re-opens via the footer button land directly on step 2 so users see
 * their current toggle state.
 *
 * Timing: 800ms delay before first-time show; instant for footer re-opens.
 *
 * i18n: every string flows through t(locale, "consent.*"); locale is read
 * from the first path segment so /ru/* renders in Russian. Locale backfill
 * for the consent.* keys tracked in Asana subtask 1214789803211093.
 */

import { useEffect, useState } from "react";
import {
  captureFromCurrentUrl,
  getConsent,
  setConsent,
  type ConsentState,
} from "@/lib/attribution";
import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  isLocale,
  t,
  type Locale,
} from "@/lib/locales";

type Choice = { analytics: boolean; marketing: boolean };
type Step = "1" | "2";

const FIRST_PAINT_DELAY_MS = 800;

function detectLocaleFromPath(): Locale {
  if (typeof window === "undefined") return DEFAULT_LOCALE;
  const seg = window.location.pathname.split("/").filter(Boolean)[0];
  return seg && isLocale(seg) ? seg : DEFAULT_LOCALE;
}

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("1");
  const [locale, setLocale] = useState<Locale>(DEFAULT_LOCALE);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    setLocale(detectLocaleFromPath());
    captureFromCurrentUrl();
    const existing: ConsentState | null = getConsent();
    if (!existing) {
      const id = window.setTimeout(() => setOpen(true), FIRST_PAINT_DELAY_MS);
      // Re-open handler still wired even when first-paint open is pending.
      const reopen = () => {
        const e = getConsent();
        setAnalytics(!!e?.analytics);
        setMarketing(!!e?.marketing);
        setStep("2");
        setOpen(true);
      };
      document.addEventListener("onfin:open-consent", reopen);
      return () => {
        window.clearTimeout(id);
        document.removeEventListener("onfin:open-consent", reopen);
      };
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    const reopen = () => {
      const e = getConsent();
      setAnalytics(!!e?.analytics);
      setMarketing(!!e?.marketing);
      setStep("2");
      setOpen(true);
    };
    document.addEventListener("onfin:open-consent", reopen);
    return () => document.removeEventListener("onfin:open-consent", reopen);
  }, []);

  function decide(c: Choice) {
    setConsent(c);
    setOpen(false);
    // Reset to step 1 so the next re-open via accept-all/reject-all flows
    // starts at the entry screen if a fresh visitor lands here later.
    setStep("1");
  }

  if (!open) return null;

  const gdprHref = `/${locale}/documents/gdpr-policy`;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      data-step={step}
      className="pointer-events-auto fixed inset-x-0 bottom-0 z-[70] px-3 pb-3 sm:inset-auto sm:bottom-4 sm:left-4 sm:px-0 sm:pb-0"
    >
      <div className="w-full rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:max-w-md sm:p-6">
        <h2
          id="consent-title"
          className="text-base font-semibold text-slate-900 sm:text-lg"
        >
          {t(locale, "consent.title")}
        </h2>

        {step === "1" ? (
          <>
            <p
              id="consent-desc"
              className="mt-2 text-sm leading-relaxed text-slate-600"
            >
              {t(locale, "consent.intro_short")}{" "}
              <a
                href={gdprHref}
                className="underline hover:text-slate-900"
              >
                {t(locale, "consent.gdpr_link")}
              </a>
              .
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => decide({ analytics: false, marketing: false })}
                className="flex-1 rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {t(locale, "consent.btn.reject")}
              </button>
              <button
                type="button"
                onClick={() => setStep("2")}
                className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
              >
                {t(locale, "consent.btn.customize")}
              </button>
              <button
                type="button"
                onClick={() => decide({ analytics: true, marketing: true })}
                className="flex-1 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-500"
              >
                {t(locale, "consent.btn.accept")}
              </button>
            </div>
          </>
        ) : (
          <>
            <p className="mt-2 text-xs text-slate-500">
              {t(locale, "consent.intro_full")}
            </p>

            <div className="mt-4 space-y-2">
              <label className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 opacity-75">
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {t(locale, "consent.cat.necessary.label")}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t(locale, "consent.cat.necessary.desc")}
                  </span>
                </span>
                <Toggle checked disabled />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-slate-300">
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {t(locale, "consent.cat.analytics.label")}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t(locale, "consent.cat.analytics.desc")}
                  </span>
                </span>
                <Toggle
                  checked={analytics}
                  onChange={(v) => setAnalytics(v)}
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between gap-3 rounded-xl border border-slate-200 p-3 transition hover:border-slate-300">
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-slate-900">
                    {t(locale, "consent.cat.marketing.label")}
                  </span>
                  <span className="mt-0.5 block text-xs text-slate-500">
                    {t(locale, "consent.cat.marketing.desc")}
                  </span>
                </span>
                <Toggle
                  checked={marketing}
                  onChange={(v) => setMarketing(v)}
                />
              </label>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setStep("1")}
                className="rounded-full border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
              >
                {t(locale, "consent.btn.back")}
              </button>
              <button
                type="button"
                onClick={() => decide({ analytics, marketing })}
                className="flex-1 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-500"
              >
                {t(locale, "consent.btn.save")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function Toggle({
  checked,
  disabled,
  onChange,
}: {
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}) {
  return (
    <span className="relative inline-flex shrink-0 items-center">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span
        className={`block h-6 w-11 rounded-full transition ${
          checked ? "bg-emerald-400" : "bg-slate-300"
        }`}
      />
      <span
        className={`pointer-events-none absolute top-1 h-4 w-4 rounded-full bg-white transition ${
          checked ? "left-6" : "left-1"
        }`}
      />
    </span>
  );
}
