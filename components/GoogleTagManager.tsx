/**
 * Google Tag Manager + Consent Mode v2 for blog.onfin.io.
 *
 * The blog previously shipped no GTM/GA of its own — the consent banner only
 * persisted the choice while the main site (onfin.io) enforced it. This wires a
 * real container on the blog subdomain, gated behind NEXT_PUBLIC_GTM_ID so the
 * scripts are emitted ONLY when a container id is configured. With the var
 * unset (local dev, preview, or before the id is provisioned) nothing renders,
 * so this is a safe no-op until the host env is set.
 *
 * Consent Mode v2: <GtmHead/> sets `consent default` to denied for analytics +
 * ad storage BEFORE the container loads, seeding it from the shared `.onfin.io`
 * `onfin_consent` cookie so a visitor who already chose on either subdomain is
 * honored on first paint (no flash of un-consented tags). Live changes from the
 * banner are forwarded by <GtmConsentBridge/> via the `onfin:consent-changed`
 * DOM event (dispatched from lib/attribution `setConsent`).
 *
 * Server component on purpose: the consent-default + container loader must run
 * in document order in <head>, ahead of any client hydration.
 */

// Inline bootstrap: define dataLayer/gtag, seed Consent Mode v2 defaults from
// the existing consent cookie, then start GTM. Kept as a single string so it
// executes synchronously before the container request fires.
function consentDefaultScript(): string {
  return `
(function(){
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  window.gtag = gtag;
  var c = { analytics: false, marketing: false };
  try {
    var m = document.cookie.match(/(?:^|; )onfin_consent=([^;]*)/);
    if (m) {
      var p = JSON.parse(decodeURIComponent(m[1]));
      c.analytics = !!p.analytics;
      c.marketing = !!p.marketing;
    }
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
  gtag('js', new Date());
})();`.trim()
}

function gtmLoaderScript(gtmId: string): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${gtmId}');`
}

export function GtmHead({ gtmId }: { gtmId: string }) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: consentDefaultScript() }} />
      <script dangerouslySetInnerHTML={{ __html: gtmLoaderScript(gtmId) }} />
    </>
  )
}

export function GtmNoScript({ gtmId }: { gtmId: string }) {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${gtmId}`}
        height="0"
        width="0"
        style={{ display: 'none', visibility: 'hidden' }}
        title="gtm"
      />
    </noscript>
  )
}
