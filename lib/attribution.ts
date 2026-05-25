/**
 * First-touch attribution + consent helpers for the blog (blog.onfin.io).
 *
 * Mirrors the implementation in onfin.io (the main marketing site) so that
 * both subdomains read/write the same `.onfin.io` cookies. A visitor who
 * lands on the blog from a Meta ad gets `onfin_attr` set here; later when
 * they navigate to onfin.io and click MT5 register, the chooser there picks
 * up the same cookie and forwards the UTMs to the CRM signup URL.
 *
 * Cookies:
 *   onfin_attr     90 days   utm_* + fbclid/gclid/msclkid/ttclid + referral
 *   onfin_consent 365 days   analytics + marketing booleans
 *
 * The consent choice persisted here drives Google Consent Mode v2 on the
 * blog (when NEXT_PUBLIC_GTM_ID is set): setConsent dispatches
 * `onfin:consent-changed`, forwarded to gtag by GtmConsentBridge. It is also
 * shared with the main site via the `.onfin.io` cookie.
 */

export const ATTR_COOKIE = "onfin_attr";
export const CONSENT_COOKIE = "onfin_consent";
export const ATTR_TTL_DAYS = 90;
export const CONSENT_TTL_DAYS = 365;

export const ATTR_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "fbclid",
  "gclid",
  "msclkid",
  "ttclid",
  "referral",
] as const;

export type AttributionKey = (typeof ATTR_KEYS)[number];
export type Attribution = Partial<Record<AttributionKey, string>> & { ts?: string };

export type ConsentState = {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  ts: string;
};

function cookieDomainAttr(): string {
  if (typeof window === "undefined") return "";
  const h = window.location.hostname;
  if (h === "onfin.io" || h.endsWith(".onfin.io")) return "; Domain=.onfin.io";
  return "";
}

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&");
  const match = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days: number) {
  if (typeof document === "undefined") return;
  const expires = new Date(Date.now() + days * 86400000).toUTCString();
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie =
    `${name}=${encodeURIComponent(value)}; Expires=${expires}; Path=/; SameSite=Lax${secure}${cookieDomainAttr()}`;
}

export function parseAttribution(search: string): Attribution {
  const out: Attribution = {};
  const qs = search.startsWith("?") ? search : "?" + search;
  const params = new URLSearchParams(qs);
  for (const key of ATTR_KEYS) {
    const v = params.get(key);
    if (v) out[key] = v;
  }
  return out;
}

export function getAttribution(): Attribution | null {
  const raw = readCookie(ATTR_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed !== null ? parsed : null;
  } catch {
    return null;
  }
}

function hasAnyAttribution(a: Attribution | null): boolean {
  if (!a) return false;
  for (const k of ATTR_KEYS) {
    if (a[k]) return true;
  }
  return false;
}

export function setAttributionIfNew(attr: Attribution): boolean {
  const incomingKeys = (Object.keys(attr) as AttributionKey[]).filter((k) => attr[k]);
  if (incomingKeys.length === 0) return false;
  if (hasAnyAttribution(getAttribution())) return false;
  const value: Attribution = { ts: new Date().toISOString() };
  for (const k of incomingKeys) value[k] = attr[k];
  writeCookie(ATTR_COOKIE, JSON.stringify(value), ATTR_TTL_DAYS);
  return true;
}

export function captureFromCurrentUrl(): boolean {
  if (typeof window === "undefined") return false;
  return setAttributionIfNew(parseAttribution(window.location.search));
}

export function getConsent(): ConsentState | null {
  const raw = readCookie(CONSENT_COOKIE);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed !== "object" || parsed === null) return null;
    return {
      necessary: true,
      analytics: !!parsed.analytics,
      marketing: !!parsed.marketing,
      ts: typeof parsed.ts === "string" ? parsed.ts : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

export function setConsent(input: { analytics: boolean; marketing: boolean }): ConsentState {
  const value: ConsentState = {
    necessary: true,
    analytics: !!input.analytics,
    marketing: !!input.marketing,
    ts: new Date().toISOString(),
  };
  writeCookie(CONSENT_COOKIE, JSON.stringify(value), CONSENT_TTL_DAYS);
  // Notify Google Consent Mode v2 (GtmConsentBridge) so GTM-managed tags react
  // to the new choice without a reload. No-op when GTM isn't loaded.
  if (typeof document !== "undefined") {
    document.dispatchEvent(new CustomEvent("onfin:consent-changed", { detail: value }));
  }
  return value;
}
