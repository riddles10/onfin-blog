# Blog post style guide — blog.onfin.io

Canonical reference for anyone (human or AI agent) drafting and publishing posts on `blog.onfin.io`. If you're an LLM agent in a future session, **read this first.** It captures the patterns established across the existing archive plus the conventions we've since refined.

This guide complements [`lib/cms-config.ts`](../lib/cms-config.ts), which holds the shorter rule set fed into AI-content-generation prompts. When the two disagree, this file is canonical.

---

## 1. When to write a post

The blog is editorial coverage for retail forex / CFD traders. Five categories:

| Category | When to use |
|---|---|
| `platform-updates` | Maintenance, schedule changes, MT4/MT5 news, new instruments, payment channels, leverage changes, prop-trading product news. **Most-used bucket.** |
| `market-analysis` | Recaps, forecasts, instrument-specific commentary, year-in-review pieces, central-bank decisions, NFP/CPI/FOMC interpretations |
| `trading-guides` | How-to / explainer / primer-style long-form articles. Position sizing, strategy mechanics, risk management |
| `regulation-news` | Licensing changes, compliance updates, regulator-specific guidance (ESMA, FCA, MAS, CFTC, MISA, etc.) |
| `strategies` | Specific trading strategies / setups / signal frameworks. Narrower than `trading-guides` |
| `general` | Catch-all only. Aim to keep this near zero. |

**If you're unsure, default to `platform-updates`.** Most operational notices land there.

---

## 2. The blog-post anatomy

Every post stored in `posts` table has:

| Field | Source | Pattern |
|---|---|---|
| `slug` | task creation date | `news_DD_MM_YYYY` — keyed off the date the *source* was filed (e.g. an Asana task), not the event date or publish date. Preserves alignment with the legacy Tilda URL shape. |
| `title_en` | hand-written | One line, sentence case (not title case), specific. See §4. |
| `excerpt_en` | hand-written | First ~180–200 chars of body, plain text, no HTML. Used in cards + OG description. See §5. |
| `body_en` | hand-written HTML | Restricted tag set — see §6. |
| `category` | one of the 5 | See above. |
| `cover_image` | Supabase Storage URL | 1200×630 JPEG. See §7. |
| `published` | true | New posts publish immediately. |
| `published_at` | task creation date | Same date as the slug — backdating is acceptable when filling archive gaps. |
| `blog_author_id` | always default | Always the seeded "OnFin Editorial" author. |

Translations live in `post_translations` keyed on `(post_id, locale)`. They're produced post-insert via `npm run translate:archive -- --slug <slug>`. **Never write translations by hand** — the routes fall back to English with a banner if a locale row is missing.

---

## 3. Voice

Direct, confident, concrete. The OnFin reader is an active retail trader who scans for actionable info and distrusts hype. Write like you're explaining the situation to a colleague who already knows the basics, not selling them on a service.

**Do:**
- Use real numbers — pip values, spreads, leverage ratios, session times, contract specs
- Acknowledge tradeoffs honestly. Every strategy has a downside; name it
- Open with a contextual hook tied to the situation (Easter weekend / Memorial Day / migration window)
- Close with a human, action-oriented line ("Square your Friday positions, see you on the other side", "Plan ahead, decide whether to hold or close")
- Mention OnFin 1–2 times naturally in the body, never more

**Don't:**
- Promise guaranteed profits / "high probability" trades
- Use filler phrases ("in today's fast-paced world", "important to note", "remember that")
- Moralise. The reader is an adult
- Use exclamation marks except in section headers when there's a real reason to
- Translate brand/tech terms — see §9

---

## 4. Title patterns

**Schedule posts:**
- "Trading Schedule for [Month] [Year] Holidays"
- "Holiday Trading Schedule for [Month] [Year]"
- "Important Updates to the Trading Schedule on [Date]"

**Maintenance posts:**
- "[Component] Maintenance Notice — [Date]"
- "Scheduled Maintenance Notice"
- "Centroid Bridge Migration — [Date] Maintenance Notice"

**Product / instrument announcements:**
- "[Instrument] Now Available for Trading"
- "[Number]× Bigger Leverage with [N] [Asset Class] to Trade"
- "Official launch of [Product]"

**Regulation news:**
- "[Action] in OnFin: [Brief context]" (e.g. "Reduced margin requirements for cryptocurrency trading")

Keep titles **under 70 characters** for OG card legibility. Sentence case. Avoid clickbait but make the content scannable.

---

## 5. Excerpt

The first 180–200 characters of the article body, **plain text only**. Strip all HTML tags, decode entities (`&nbsp;` → space), trim trailing whitespace before punctuation.

Used in:
- Index card descriptions (`{post.excerpt}` in JSX, no HTML decoding)
- OG / Twitter card description meta tags
- The article-page lede paragraph below the H1

If the natural opener is shorter than ~180 chars, that's fine — don't pad it. Don't end the excerpt mid-word; cut to the previous space and add `…`.

---

## 6. Body — allowed HTML and structural patterns

### 6.1 Allowed tags

```
<p> <h2> <h3> <ul> <ol> <li> <strong> <em> <blockquote>
<a href="…"> <table> <thead> <tbody> <tr> <th> <td>
```

**Never** use `<h1>`, `<h4>`, `<div>`, `<span>`, `<br>`, `<img>`. Never inline styles or class attributes. The `.prose-blog` stylesheet handles all rendering.

### 6.2 Schedule posts — use a 3-column table

For multi-event schedule announcements (holiday calendars, transition windows), the standard format is a 3-column table:

```html
<table>
<thead>
<tr><th>Date</th><th>Event</th><th>Schedule changes</th></tr>
</thead>
<tbody>
<tr>
<td>Apr 2, 2026</td>
<td>Maundy Thursday</td>
<td><ul><li>ASX200 — early close 16:00</li><li>HK50 — early close 22:00</li></ul></td>
</tr>
</tbody>
</table>
```

Rules:
- One row per (date, event) pair
- Inline `<ul>` inside the third cell when an event affects multiple instrument groups
- First column (Date): keep on one line — `<td>Apr 2, 2026</td>`, never wrap to "April 2nd, 2026"
- For posts spanning multiple distinct events (e.g. Labour Day + Memorial Day in May), use **separate `<h2>` sections each with its own table** rather than one massive table

### 6.3 Maintenance posts — use a "what you need to know" bullet block

For single-event maintenance / outage / migration notices, a table is overkill (single-row tables look anaemic). Use a clean bulleted summary instead:

```html
<p><strong>What you need to know</strong></p>
<ul>
<li><strong>When:</strong> Saturday, April 25, 2026 · 08:00–16:00 UTC</li>
<li><strong>What's affected:</strong> Pricing and trading services offline</li>
<li><strong>Expected duration:</strong> 4–8 hours</li>
</ul>
```

Then explain *why* in one paragraph (infrastructure investment, regulatory compliance, etc.) and close with action guidance for traders ("Square Friday positions if…").

### 6.4 Long-form guides — H2 hierarchy + FAQ

For trading-guides and strategies posts (1500+ words):
- 6–8 `<h2>` sections covering distinct ideas
- 2–4 `<h3>` subsections per `<h2>` for scannability
- Final section is `<h2>FAQ</h2>` with exactly 5 question-style `<h3>`s, each answered in 50–100 words
- See `docs/design/content-samples/article-trading-guide-sample.md` for a worked example

### 6.5 Internal linking and outbound citations

Both rules below are mandatory for long-form trading guides (1500+ words). They are recommended for everything else.

**Internal links — five per article:**

- 2 links to other blog posts on related topics. Anchor text is descriptive (e.g. "what leverage does to your position size"), never "click here" or "read more".
- 3 links to onfin.io product pages. Match topic to destination — a guide on MT5 links to onfin.io/mt5, an article on copy trading links to onfin.io/copytrading, a piece on account funding links to onfin.io/deposit. Don't link to /about as filler.
- Anchor text rotation: the 5 links should not all use the brand name. Mix descriptive anchors with one or two brand-anchored links.
- Don't double-link the same destination from one article — one link per target page.

**Outbound citations — three to five per article, all from authoritative sources:**

- Central banks: Fed (federalreserve.gov), ECB (ecb.europa.eu), BoE (bankofengland.co.uk), BoJ (boj.or.jp), RBA (rba.gov.au)
- Regulators: ESMA (esma.europa.eu), FCA (fca.org.uk), MAS (mas.gov.sg), CFTC (cftc.gov), SEC (sec.gov)
- Multilaterals: BIS (bis.org), IMF (imf.org)
- Government statistics agencies (BLS, Eurostat, ONS) where the article cites macro data

**Sources we never cite:**

- Competitor brokers (Saxo, IG, Pepperstone, AvaTrade, OANDA, etc.) — even when their educational content is good. We are a broker; citing competitors signals their content as more authoritative than ours.
- Affiliate-marketing sites (BrokerChooser, ForexBrokers.com) as authorities — link to their *broker reviews of OnFin* if relevant, but never as a source for trading concepts.
- Wikipedia for facts inside our domain (forex/CFD mechanics) — link to the primary regulator or central bank instead. Wikipedia is OK for tangential definitions only.

**Outbound link attributes:**

- All outbound links open in the same tab (no `target="_blank"`) unless they're sign-in or document downloads.
- Add `rel="noopener"` only for `target="_blank"` links. Don't add `nofollow` to authoritative citations — it suppresses the credibility transfer that makes citations worth including.

### 6.6 Universal structure

Every post, regardless of type:

1. **Opening hook** (1–3 sentences, 50–80 words) — contextual, sets the situation
2. **Time-zone declaration** — for any post mentioning specific times: `<p>All times below are based on the trading terminal server time (EET).</p>` (or UTC for infrastructure posts)
3. **Body content** — table for schedules, bullet block for maintenance, H2 sections for long-form
4. **Closing line** — human, action-oriented, 1–2 sentences. Examples that work:
   - "Set your alarms, square away your Friday positions, and we'll see you back on the other side of Easter Monday."
   - "Plan your trades with these changes in mind — and where positions might roll over a closed session, decide ahead of time whether to hold or close."
   - "Trading resumes when the migration completes. Square weekend positions on Friday's close if you want to manage them actively."

---

## 7. Cover images

- 1200×630 JPEG, stored in Supabase Storage at `cms-images/unsplash-covers/<slug>.jpg`
- Source: Unsplash via the search API, oriented landscape, content-filter "high"
- Trigger Unsplash's `download_location` endpoint per their TOS before downloading the actual image
- Set `posts.cover_image` to the Supabase Storage public URL

Two scripts handle this:
- `scripts/fill-covers-unsplash.ts` — bulk-fill cover-less posts (used once for the archive)
- `scripts/publish-schedule-posts.ts` — single-post publish pipeline that includes cover handling

For new posts: copy the `publish-schedule-posts.ts` template and fill in the new article object. Don't re-download a photo that's already on Supabase Storage.

**Image search queries by category** (from `fill-covers-unsplash.ts`):

| Category | Queries that work |
|---|---|
| platform-updates | "stock market terminal", "forex trading screen", "financial dashboard", "server data center" (for infra posts) |
| trading-guides | "forex trading desk", "investment chart analysis", "trader education" |
| market-analysis | "candlestick chart", "stock market trading", "currency exchange" |
| regulation-news | "financial regulation office", "legal documents desk", "business compliance" |
| strategies | "business strategy planning", "chess strategy desk", "trading whiteboard" |
| general | "modern finance office", "business workspace", "computer monitor charts" |

Photo IDs *are* allowed to repeat across the archive — long-tail posts that share a hero with a newer post is acceptable.

---

## 8. Publishing workflow

Order matters. Always:

1. **Insert the post** with English-canonical fields (`title_en`, `body_en`, `excerpt_en`, `category`, `slug`, `published_at`, `blog_author_id` = default author, `published: true`). No translation rows yet — they fall back to English with a banner.
2. **Set the cover** — download Unsplash photo at 1200×630, upload to Supabase Storage, update `posts.cover_image`. Trigger the TOS download endpoint.
3. **Translate to all 8 non-English locales** — `npm run translate:archive -- --slug <slug>`. ~16 calls per article via the public Google Translate endpoint.
4. **Smoke test** — curl `/en/<slug>`, plus one or two non-English routes. Verify `<h1>` renders, table styles apply, cover loads.
5. **Commit + push** — code goes to `dev` branch. Translation rows live in Supabase, not the repo.

The script `scripts/publish-schedule-posts.ts` handles steps 1, 2, and (with a follow-up command) 3 idempotently. Re-running on the same slug upserts cleanly.

---

## 9. Translation rules

We use machine translation (`google-translate-api-x`, no auth) for all non-English locales. Quality is "rough but publishable" — readers landing on `/ru/...` see a localised page; quality is on par with Google Translate.

**Glossary pass-through** — these terms are wrapped in `<span class="notranslate">` before translation and unwrapped after, so they survive verbatim:

- Brand: `OnFin`
- Platforms: `MT4`, `MT5`, `MetaTrader 4`, `MetaTrader 5`
- Currency pairs: `EUR/USD`, `GBP/USD`, etc. (matched as `^[A-Z]{3}/[A-Z]{3}$`)
- Regulators: `ESMA`, `FCA`, `MAS`, `CFTC`, `MISA`, `CySEC`, `ASIC`, `FINMA`, `SEC`
- Indicators: `NFP`, `FOMC`, `CPI`, `PMI`, `GDP`, `ECB`, `BoE`, `BoJ`, `RBA`, `RBNZ`, `SNB`
- Asset acronyms: `ETF`, `ETFs`, `CFD`, `CFDs`, `FX`
- Products: `copytrading`

If a new term needs preserving, add it to `GLOSSARY` in `scripts/translate-archive.ts:90`.

**Locale set:** en, ru, vi, th, ms, id, es, km, zh — mirrors `lib/locales.ts`. English is canonical (lives on `posts`), all other locales live in `post_translations`.

---

## 10. Backdating posts (filling archive gaps)

When a post is filed late (e.g. an Asana task that was completed but never landed on the blog):

- Slug + `published_at` use the **task creation date**, not today
- The post will render in the index ordered by `published_at`, so it appears in the historical position rather than at the top of "newest"
- This keeps the index timeline coherent — readers don't see a 6-month-old maintenance notice as the newest post
- Translation, cover, smoke test all run as for any other post

---

## 11. Quick checklist before publishing

- [ ] Slug follows `news_DD_MM_YYYY` pattern, derived from source-task creation date
- [ ] Title is sentence-case, under 70 chars, specific
- [ ] Excerpt is 180–200 chars, plain text, no entities
- [ ] Body uses only allowed tags (§6.1)
- [ ] Schedule posts use the 3-col table; maintenance posts use the bullet block; long-form uses H2 + FAQ
- [ ] Long-form: 5 internal links (2 blog + 3 onfin.io) and 3–5 outbound citations to BIS / IMF / central banks / regulators (§6.5)
- [ ] Long-form: visible risk disclosure block via `<RiskDisclosure />` near the article opening
- [ ] Opening hook tied to context (1–3 sentences)
- [ ] Time-zone declaration if times are mentioned
- [ ] Closing line is human + action-oriented
- [ ] OnFin mentioned 1–2 times max
- [ ] Cover image: 1200×630, Unsplash, on Supabase Storage, not re-downloaded if already present
- [ ] `category` set correctly (platform-updates is the safe default)
- [ ] `published: true`, `blog_author_id` = default author
- [ ] After insert: run `translate:archive --slug <slug>` for all 8 non-English locales
- [ ] Smoke-test `/en/<slug>` returns 200, renders body correctly
- [ ] Commit on `dev` branch, push to `origin/dev`
