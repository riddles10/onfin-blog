/**
 * Google Analytics 4 (gtag.js) + Consent Mode v2 for blog.onfin.io.
 *
 * Loads GA4 directly via gtag.js with a Measurement ID (default
 * G-B8Q4JMTLGY) — not a GTM container. Consent Mode v2 defaults are set
 * BEFORE `config`, seeded from the shared `.onfin.io` `onfin_consent` cookie
 * so a visitor who already chose on either subdomain is honored on first
 * paint (no flash of un-consented tags). Live banner changes are forwarded by
 * <GaConsentBridge/> via the `onfin:consent-changed` DOM event (dispatched
 * from lib/attribution `setConsent`).
 *
 * Server component: the inline consent-default + config must run in document
 * order in <head>, ahead of the async gtag.js request and any hydration.
 */

// Inline bootstrap: define dataLayer/gtag, seed Consent Mode v2 defaults from
// the existing consent cookie (denied unless the visitor opted in), then
// `js` + `config`. Runs synchronously before the async gtag.js processes the
// queue.
function bootScript(ga4Id: string): string {
  return `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
window.gtag = gtag;
(function(){
  var c = { analytics: false, marketing: false };
  try {
    var m = document.cookie.match(/(?:^|; )onfin_consent=([^;]*)/);
    if (m) { var p = JSON.parse(decodeURIComponent(m[1])); c.analytics = !!p.analytics; c.marketing = !!p.marketing; }
  } catch (e) { /* malformed cookie — fall back to denied */ }
  gtag('consent', 'default', {
    ad_storage: c.marketing ? 'granted' : 'denied',
    ad_user_data: c.marketing ? 'granted' : 'denied',
    ad_personalization: c.marketing ? 'granted' : 'denied',
    analytics_storage: c.analytics ? 'granted' : 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
})();
gtag('js', new Date());
gtag('config', '${ga4Id}');`.trim()
}

export function Ga4Head({ ga4Id }: { ga4Id: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: bootScript(ga4Id) }} />
      <script async src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} />
    </>
  )
}
