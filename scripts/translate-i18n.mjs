#!/usr/bin/env node
/**
 * Machine-translate the UI copy in src/i18n/en.json into a target locale's
 * flat key→string file (src/i18n/<locale>.json).
 *
 * Sibling of scripts/translate-legal-docs.mjs — same Deepseek plumbing,
 * glossary and locale rules, but for the marketing/UI string map rather than
 * the structured legal documents. Keys are sent in chunks; the model returns
 * the same keys with translated values. HTML tags/attributes and
 * {placeholders} are preserved verbatim; glossary terms stay in English.
 *
 * Env: DEEPSEEK_MAIN (or DEEPSEEK_API_KEY). Pass inline:
 *   DEEPSEEK_MAIN=sk-... node scripts/translate-i18n.mjs --locale tr
 *
 * Existing-key merge: by default only MISSING keys are translated and merged
 * into any existing <locale>.json (so re-runs are cheap and won't clobber
 * hand-tuned copy). Pass --overwrite to retranslate every key.
 */
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(__dirname, '..');
const EN_PATH = join(REPO_ROOT, 'i18n/en.json');

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com';
const DEEPSEEK_MODEL = 'deepseek-chat';
const KEYS_PER_CHUNK = 50;
const MAX_OUTPUT_TOKENS = 8000;

const TARGET_LANGUAGE_NAMES = {
  ru: 'Russian',
  vi: 'Vietnamese',
  th: 'Thai',
  ms: 'Malay',
  id: 'Indonesian',
  es: 'Spanish (neutral Latin American, es-419)',
  km: 'Khmer',
  zh: 'Simplified Chinese',
  tr: 'Turkish',
};

const LOCALE_RULES = {
  ru: '- Use modern Russian as written in 21st-century financial marketing.',
  vi: '- Use natural, modern Vietnamese with appropriate diacritics.',
  th: '- Thai has no inter-word spaces. Use spaces only after punctuation and around English/numeric tokens.',
  ms: '- Use standard Bahasa Melayu (Malaysian, not Indonesian).',
  id: '- Use standard Bahasa Indonesia.',
  es: '- Use neutral Latin-American Spanish (es-419), not Castilian.',
  km: '- Khmer has no inter-word spaces. Do not insert ASCII spaces between Khmer words.',
  zh: '- Use Simplified Chinese (Mainland conventions). Chinese has no inter-word spaces; use full-width punctuation outside HTML/JSON tokens.',
  tr: '- Use modern, fluent Turkish marketing copy. Apply correct Turkish suffixation and vowel harmony; keep the dotted/dotless i distinction (İ/i, I/ı).',
};

const GLOSSARY_BLOCK = `KEEP THE FOLLOWING TERMS IN ENGLISH (do not translate or transliterate them):
- Brand: OnFin, OnFin Ltd, ECN.Broker
- Platforms: MT4, MT5, MetaTrader, MetaTrader 4, MetaTrader 5
- Currency pair tickers (e.g. EUR/USD, GBP/JPY, XAU/USD) — keep the 3-letter ISO codes
- Asset classes / terms: ECN, CFD, FX, Forex, ETF, copytrading, spread, lot, pip, leverage, swap
- Regulators / licenses: MISA, M.I.S.A., license numbers (e.g. BFX2024038)
- Product / promo names: iPhone 17 Pro Max, Bizon
- Email addresses, URLs and domain names`;

const BASE_RULES = `You translate short UI and marketing strings for OnFin, an online forex/CFD broker. Keep the tone clear and persuasive but accurate. Return ONLY valid JSON — no commentary, no markdown fences.`;

function buildSystemPrompt(locale) {
  const langName = TARGET_LANGUAGE_NAMES[locale];
  const specifics = LOCALE_RULES[locale] ?? '';
  return [
    BASE_RULES,
    '',
    `${langName.toUpperCase()} TRANSLATION RULES`,
    `- Write natural, fluent ${langName}.`,
    specifics,
    '- Preserve EVERY HTML tag and its attributes verbatim (e.g. <strong class="text-white">…</strong>, <br>, <a href="…">). Translate only the human-readable text between tags.',
    '- Preserve placeholders verbatim, including curly-brace tokens like {n}, {amount}, {count} and any %s / %d.',
    '- Numbers, dates, currency symbols and identifiers stay verbatim.',
    '',
    GLOSSARY_BLOCK,
  ]
    .filter(Boolean)
    .join('\n');
}

function getApiKey() {
  const key = process.env.DEEPSEEK_API_KEY || process.env.DEEPSEEK_MAIN;
  if (!key) {
    console.error('Missing DEEPSEEK_API_KEY or DEEPSEEK_MAIN in environment.');
    process.exit(1);
  }
  return key;
}

async function translateChunk(map, locale) {
  const systemPrompt = buildSystemPrompt(locale);
  const langName = TARGET_LANGUAGE_NAMES[locale];
  const userPrompt = `Translate the string VALUES of this JSON object to ${langName}. Return a JSON object with the EXACT same keys (verbatim) and translated values. Do not add, drop or rename keys.

Output ONLY the JSON object, no markdown fences, no commentary.

INPUT:
${JSON.stringify(map, null, 2)}`;

  const body = {
    model: DEEPSEEK_MODEL,
    max_tokens: MAX_OUTPUT_TOKENS,
    temperature: 0.2,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };

  const res = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getApiKey()}` },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Deepseek ${res.status}: ${(await res.text()).slice(0, 300)}`);
  }
  const data = await res.json();
  if (data.choices?.[0]?.finish_reason === 'length') {
    throw new Error('Output hit max_tokens — reduce KEYS_PER_CHUNK');
  }
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`No content: ${JSON.stringify(data).slice(0, 200)}`);
  const cleaned = content.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');
  return JSON.parse(cleaned);
}

async function main() {
  getApiKey();
  const args = process.argv.slice(2);
  const li = args.indexOf('--locale');
  const locale = li >= 0 ? args[li + 1] : null;
  const overwrite = args.includes('--overwrite');
  if (!locale || !TARGET_LANGUAGE_NAMES[locale]) {
    console.error('Usage: node scripts/translate-i18n.mjs --locale <code> [--overwrite]');
    console.error('Known locales:', Object.keys(TARGET_LANGUAGE_NAMES).join(', '));
    process.exit(1);
  }

  const en = JSON.parse(readFileSync(EN_PATH, 'utf8'));
  const outPath = join(REPO_ROOT, `i18n/${locale}.json`);
  const existing = !overwrite && existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : {};

  const allKeys = Object.keys(en);
  const todo = allKeys.filter((k) => typeof en[k] === 'string' && (overwrite || typeof existing[k] !== 'string'));
  console.log(`${locale} (${TARGET_LANGUAGE_NAMES[locale]}): ${allKeys.length} keys total, ${todo.length} to translate`);

  const out = { ...existing };
  // Carry over any non-string values untouched.
  for (const k of allKeys) if (typeof en[k] !== 'string' && !(k in out)) out[k] = en[k];

  for (let i = 0; i < todo.length; i += KEYS_PER_CHUNK) {
    const slice = todo.slice(i, i + KEYS_PER_CHUNK);
    const map = {};
    for (const k of slice) map[k] = en[k];
    let res;
    try {
      res = await translateChunk(map, locale);
    } catch (err) {
      console.warn(`  chunk ${i}-${i + slice.length} FAILED: ${err.message.slice(0, 160)} — falling back to EN for these`);
      res = {};
    }
    for (const k of slice) out[k] = typeof res[k] === 'string' ? res[k] : en[k];
    console.log(`  ${Math.min(i + KEYS_PER_CHUNK, todo.length)}/${todo.length}`);
  }

  // Write keys in en.json order for a stable, reviewable diff.
  const ordered = {};
  for (const k of allKeys) ordered[k] = out[k];
  writeFileSync(outPath, JSON.stringify(ordered, null, 2) + '\n');
  console.log(`Wrote ${outPath} — ${Object.keys(ordered).length} keys`);
}

main();
