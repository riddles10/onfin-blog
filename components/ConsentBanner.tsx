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
 * English-only copy for v1. Translation tracked in a follow-up Asana task.
 */

import { useEffect, useState } from "react";
import {
  captureFromCurrentUrl,
  getConsent,
  setConsent,
  type ConsentState,
} from "@/lib/attribution";

type Choice = { analytics: boolean; marketing: boolean };

export default function ConsentBanner() {
  const [open, setOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    captureFromCurrentUrl();
    const existing: ConsentState | null = getConsent();
    if (!existing) {
      setOpen(true);
    } else {
      setAnalytics(existing.analytics);
      setMarketing(existing.marketing);
    }
    const reopen = () => {
      const e = getConsent();
      setAnalytics(!!e?.analytics);
      setMarketing(!!e?.marketing);
      setOpen(true);
    };
    document.addEventListener("onfin:open-consent", reopen);
    return () => document.removeEventListener("onfin:open-consent", reopen);
  }, []);

  function decide(c: Choice) {
    setConsent(c);
    setOpen(false);
  }

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      aria-describedby="consent-desc"
      className="fixed inset-x-0 bottom-0 z-[70] flex justify-center px-4 pb-4 sm:px-6 sm:pb-6"
    >
      <div className="w-full max-w-4xl rounded-2xl bg-white p-5 shadow-2xl ring-1 ring-slate-200 sm:p-7">
        <h2 id="consent-title" className="text-lg font-semibold text-slate-900 sm:text-xl">
          We use cookies
        </h2>
        <p id="consent-desc" className="mt-2 text-sm text-slate-600">
          OnFin uses cookies to keep the site working, measure how visitors find
          us, and (when you allow it) personalise marketing. You can accept
          everything, reject non-essential cookies, or pick categories below.
          Your choice is shared with the main onfin.io site. You can change it
          any time via the "Cookie preferences" link in the footer.
        </p>

        <div className="mt-5 space-y-3">
          <label className="flex items-start justify-between gap-4 rounded-xl border border-slate-200 p-3 opacity-75">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-900">Necessary</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Required for the site to function and for first-party attribution
                (so we know which ad brought you in). Always on.
              </span>
            </span>
            <Toggle checked disabled />
          </label>

          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3 transition hover:border-slate-300">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-900">Analytics</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Google Analytics (on the main site) so we can understand traffic
                patterns and improve content.
              </span>
            </span>
            <Toggle
              checked={analytics}
              onChange={(v) => setAnalytics(v)}
            />
          </label>

          <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-slate-200 p-3 transition hover:border-slate-300">
            <span className="flex-1">
              <span className="block text-sm font-semibold text-slate-900">Marketing</span>
              <span className="mt-0.5 block text-xs text-slate-500">
                Meta, Google and TikTok ad pixels (on the main site) used to
                measure ad performance and serve relevant campaigns.
              </span>
            </span>
            <Toggle
              checked={marketing}
              onChange={(v) => setMarketing(v)}
            />
          </label>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => decide({ analytics: false, marketing: false })}
            className="rounded-full border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Reject all
          </button>
          <button
            type="button"
            onClick={() => decide({ analytics, marketing })}
            className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-slate-50"
          >
            Save preferences
          </button>
          <button
            type="button"
            onClick={() => decide({ analytics: true, marketing: true })}
            className="rounded-full bg-emerald-400 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-emerald-500"
          >
            Accept all
          </button>
        </div>
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
