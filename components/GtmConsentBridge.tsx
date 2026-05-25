"use client";

/**
 * Forwards live consent changes from the cookie banner to Google Consent
 * Mode v2. lib/attribution `setConsent` dispatches `onfin:consent-changed`
 * with the new state whenever the visitor accepts/rejects/saves; we translate
 * that into a `gtag('consent','update', …)` so GTM-managed tags fire (or stay
 * blocked) without a page reload.
 *
 * Renders nothing. Safe no-op if GTM never loaded (gtag falls back to the
 * dataLayer shim, or is simply absent in dev).
 */

import { useEffect } from "react";
import type { ConsentState } from "@/lib/attribution";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function GtmConsentBridge() {
  useEffect(() => {
    function onChange(e: Event) {
      const detail = (e as CustomEvent<ConsentState>).detail;
      if (!detail || typeof window.gtag !== "function") return;
      window.gtag("consent", "update", {
        ad_storage: detail.marketing ? "granted" : "denied",
        ad_user_data: detail.marketing ? "granted" : "denied",
        ad_personalization: detail.marketing ? "granted" : "denied",
        analytics_storage: detail.analytics ? "granted" : "denied",
      });
    }
    document.addEventListener("onfin:consent-changed", onChange);
    return () => document.removeEventListener("onfin:consent-changed", onChange);
  }, []);

  return null;
}
