"use client";

/**
 * Forwards live consent-banner choices to Google Consent Mode v2 (GA4).
 * lib/attribution `setConsent` dispatches `onfin:consent-changed` with the new
 * state; we translate it into `gtag('consent','update', …)` so GA4 reacts
 * without a page reload. Renders nothing; safe no-op if gtag never loaded.
 */

import { useEffect } from "react";
import type { ConsentState } from "@/lib/attribution";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export default function GaConsentBridge() {
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
