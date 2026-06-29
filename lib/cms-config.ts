// ─────────────────────────────────────────────────────────────────────────────
// CMS Configuration — single file to customize for blog.onfin.io
// ─────────────────────────────────────────────────────────────────────────────
//
// Every site-specific value lives here. Other parts of the CMS read from this
// module so this is the only file that should change between sites.

// ── Site identity ────────────────────────────────────────────────────────────

export const SITE_NAME = 'OnFin'
export const SITE_DOMAIN = 'blog.onfin.io'
export const ADMIN_TITLE = 'OnFin Blog Admin'

/** Session-storage key used by the admin auth gate. */
export const ADMIN_SESSION_KEY = 'cms_admin_auth'

/** The env var name that holds the admin password. */
export const ADMIN_PASSWORD_ENV = 'ADMIN_PASSWORD'

// ── Content categories ───────────────────────────────────────────────────────
//
// Mirrors the existing onfin.io blog category set so old links and the new
// CMS share the same taxonomy.

export const POST_CATEGORIES = [
  'market-analysis',
  'trading-guides',
  'platform-updates',
  'regulation-news',
  'strategies',
  'general',
] as const
export type PostCategory = (typeof POST_CATEGORIES)[number]

// Content-type axis, orthogonal to category. 'article' = editorial content
// (the main blog feed); 'news' = service / status notices shown in the
// dedicated /news section and kept out of the main feed.
export const POST_TYPES = ['article', 'news'] as const
export type PostType = (typeof POST_TYPES)[number]

export const EVENT_CATEGORIES = [
  'webinar',
  'workshop',
  'conference',
  'meetup',
] as const
export type EventCategory = (typeof EVENT_CATEGORIES)[number]

// ── AI content generation ────────────────────────────────────────────────────

export const BRAND_VOICE = `${SITE_NAME} BRAND VOICE & AUDIENCE

WHO WE ARE
${SITE_NAME} is a multi-asset broker focused on forex and CFD trading. The
${SITE_NAME} blog is the editorial home for traders who want clear, practical
analysis: schedule notices, platform updates, regulation explainers, market
recaps, and how-to guides.

AUDIENCE
- Active retail forex / CFD traders, mostly in MT4 and MT5
- Mix of beginners learning the platform and experienced traders looking for
  edges, schedules, and execution detail
- Reads quickly, scans for actionable info, distrusts hype

VOICE
- Direct, confident, concrete.
- Use real numbers (pip values, spreads, leverage ratios, session times,
  contract specs) instead of vague qualifiers.
- Acknowledge tradeoffs honestly. Every strategy has a downside; name it.
- Never moralize, never use "important to note", "remember", "in conclusion".
- Never promise guaranteed profits. Trading involves risk, full stop.
- Never use em-dashes ("—") in any output. They are the strongest AI-tell
  in retail-facing copy and ${SITE_NAME} bans them site-wide. Use a comma,
  a colon, a pair of parentheses, or two shorter sentences instead.

WE ARE NOT
- A finfluencer pushing trade ideas
- A marketing channel for promo bonuses (those live on onfin.io, not here)
- A source of investment advice; we explain mechanics and process, the
  reader decides.

We are an editorial platform. Our job is to help traders make confident,
well-informed decisions about their own positions.`

export const SEO_GUIDELINES = `${SITE_NAME} BLOG SEO & STRUCTURAL GUIDELINES

CANONICAL STYLE GUIDE
The full editorial standard (voice, structural patterns, slug rules,
table format, cover-image conventions, translation glossary) lives in
docs/BLOG_STYLE_GUIDE.md. Read that first if you're authoring or
publishing a post; the rules below are the AI-generation-prompt
subset.

ARTICLE LENGTH
- Target 2200 to 2800 words for guides and strategy articles
- Target 1500 to 2200 words for market-analysis and regulation-news pieces
- 800 to 1200 words is acceptable for short platform-updates and schedule notices
- Below the floor for the type is a failure. Google ranks long-form for
  guide and strategy queries.

HOOK TAXONOMY (pick ONE for the intro, do not stack them)
1. Specific-Number Promise (e.g. "five spread mistakes that cost a typical
   EUR/USD scalper $40 a session")
2. Counter-Intuitive Claim (something the reader thinks is true that isn't)
3. Money or Time Stake (a concrete dollar amount, pip count, or session)
4. Stakes / Threat (margin call, slippage, liquidity gap, regulator action)
5. Concrete Scenario (a real setup, chart pattern, or news event)
Banned hooks: rhetorical questions ("Have you ever wondered..."), soft
preambles ("In today's fast-moving market..."), and definitions
("Leverage is...") as the opening sentence.

INTRO FORMULA — APP (Agree, Promise, Preview)
The intro is the most-edited part of the piece. Every word earns its
place. Three sentences, 50 to 80 words total, no headings inside.
- Agree (1 sentence): name what the reader already knows or fears, in
  concrete terms. Use the chosen hook here. Specific numbers beat
  qualifiers every time.
- Promise (1 sentence): state what the reader will be able to DO after
  finishing the article, not what you will "cover". Example:
  "By the end you will size a 1:500 position without blowing past
  your daily loss limit."
- Preview (1 sentence): name the 2 to 3 anchors the body will hit so
  the reader knows it is worth scrolling.

TL;DR (REQUIRED for guides and strategies)
Immediately after the intro paragraph, on a new line, emit a paragraph
that begins with the literal string "TL;DR." followed by a space. It
renders as a styled callout, so do not wrap the label in any tags
beyond the surrounding <p> and a leading <strong>.

Format:
<p><strong>TL;DR.</strong> [Direct answer in one sentence.] [Mechanic with
specific numbers, the rate, the session, or the contract spec.] [The one
tradeoff that matters.] [The safe default for a typical retail trader.]</p>

Rules:
- 2 to 4 sentences, 40 to 80 words total
- Plain prose; no bullets, no headings, no further <strong> tags
- First sentence is the single most actionable takeaway
- Front-load specifics; if there is no number, the TL;DR is too vague

H2 SECTION RULES
- 6 to 8 H2 sections per guide (not counting FAQ)
- Each H2 must be SPECIFIC and BENEFIT-FOCUSED
- Each H2 should target 250 to 400 words of body
- Avoid generic H2s like "What is forex?"; assume reader basics

H3 SUBSECTION RULES
- Use H3 for sub-points within an H2 section
- 2 to 4 H3s per H2 is ideal for scannability

FAQ SECTION (REQUIRED for guides and strategies, last section)
- Single <h2>FAQ</h2>
- Exactly 5 question-style H3s
- Each answer 50 to 100 words

SCHEDULE-NOTICE STRUCTURE (for posts about holiday trading hours,
DST transitions, multi-event calendars)
- 3-column table: Date | Event | Schedule changes
- One row per (date, event) pair
- Inline <ul> in the third cell when an event affects multiple
  instrument groups
- For posts spanning distinct events (e.g. Labour Day + Memorial Day
  in May), use separate <h2> sections each with its own table

MAINTENANCE-NOTICE STRUCTURE (for single-event downtime / migration /
outage notices, where single-row tables look anaemic)
- Bullet block under "What you need to know":
    <p><strong>What you need to know</strong></p>
    <ul>
      <li><strong>When:</strong> [date · time window UTC or EET]</li>
      <li><strong>What's affected:</strong> [services]</li>
      <li><strong>Expected duration:</strong> [hours]</li>
    </ul>
- One paragraph explaining why (infrastructure investment, regulatory
  compliance, etc.)
- One closing line with action guidance for traders

UNIVERSAL CLOSING
- One human, action-oriented sentence
- Examples: "Square Friday positions on the close if you want to
  manage them actively", "Plan ahead and decide whether to hold or
  close", "Set your alarms, see you back at the desk"

LINKING & ENTITIES
- Mention ${SITE_NAME} 1 to 2 times naturally in the body, never more
- Link out to authoritative neutral sources for facts (BIS, IOSCO, central
  bank releases, CFTC, FCA, MAS), never to competitor brokers

ANTI-PATTERNS (auto-fail)
- Em-dashes (U+2014, the long dash "—") anywhere in body copy. This is
  the single most over-used AI-tell and is banned outright. Use commas,
  colons, parentheses, or two shorter sentences instead. En-dashes
  (U+2013) for numeric ranges like "1500–2200 words" are fine.
- Keyword stuffing: no single keyword appears more than ~1.5% density
- Excessive bolding: max 2 <strong> per paragraph (TL;DR label excluded)
- Generic filler phrases ("in today's fast-paced world")
- Made-up statistics, fabricated quotes
- Promises of guaranteed returns or profitability claims
- Anything that reads like investment advice for a specific instrument

ALLOWED HTML TAGS
<p>, <h2>, <h3>, <ul>, <ol>, <li>, <strong>, <em>, <blockquote>,
<a> (with href attribute), <table>, <thead>, <tbody>, <tr>, <th>, <td>.
Never <h1>, <h4>, <div>, <span>, <br>, <img>.

WHEN TO USE A TABLE
Use a <table> for any structured data the reader will scan rather
than read top-to-bottom: trading schedules, instrument specs,
fee comparisons, regulator-by-regulator deadlines. Standard shape:
3 columns. Header row in <thead>; data rows in <tbody>. The first
column is the row identifier (date, instrument, or regulator).
Don't use tables for layout. Don't nest tables.`

export const CONTENT_RULES = `CONTENT RULES FOR ${SITE_NAME} BLOG
- Write in English. No Thai or other languages in the body.
- Never fabricate quotes or attribute statements to named individuals,
  central bank officials, or regulators.
- Every claim that could be verified (rates, schedule changes, regulation
  text, contract specs) must be plausibly accurate. When in doubt, leave
  it out.
- Do not state or imply guaranteed profits, "high probability" trades, or
  any specific buy/sell call on a live instrument.
- Do not include meta-commentary about the writing process.
- Avoid jargon without a one-line definition on first use.`

// ── Topic picker fallback seeds ──────────────────────────────────────────────
//
// Used when the manual topic queue and the RSS feeds both come up empty.
// Day-of-year rotation keeps the pipeline fresh across the year.

export const FALLBACK_SEEDS: Array<{
  seed: string
  category: PostCategory
  templates: string[]
}> = [
  {
    seed: 'forex risk management',
    category: 'trading-guides',
    templates: [
      'How to size positions for {seed}',
      'A practical guide to {seed} for retail traders',
      '{seed} mistakes that drain accounts',
    ],
  },
  {
    seed: 'mt4 vs mt5',
    category: 'platform-updates',
    templates: [
      '{seed}: which platform should you actually use',
      '{seed} compared for active traders',
    ],
  },
  {
    seed: 'major currency pairs',
    category: 'market-analysis',
    templates: [
      'Trading the {seed}: spreads, sessions, and gotchas',
      '{seed} explained for new forex traders',
    ],
  },
  {
    seed: 'forex trading strategies',
    category: 'strategies',
    templates: [
      '{seed} that survive choppy markets',
      'Five {seed} ranked by win-rate vs drawdown',
    ],
  },
  {
    seed: 'forex regulation',
    category: 'regulation-news',
    templates: [
      'What changing {seed} means for retail traders',
      '{seed} explained: licensing tiers and what they actually mean',
    ],
  },
]

// ── RSS feeds for topic seeding ──────────────────────────────────────────────
//
// The daily cron pulls headlines from these feeds when the manual topic queue
// is empty, runs them through the topic picker, and queues a draft. Add or
// remove feeds here without touching code.

export const TOPIC_RSS_FEEDS: Array<{
  url: string
  source: string                  // human label shown in admin / Slack
  defaultCategory: PostCategory
}> = [
  {
    url: 'https://www.investing.com/rss/news_25.rss',
    source: 'Investing.com — Forex News',
    defaultCategory: 'market-analysis',
  },
  {
    url: 'https://www.fxstreet.com/rss/news',
    source: 'FXStreet — News',
    defaultCategory: 'market-analysis',
  },
  {
    url: 'https://www.forexlive.com/feed/news',
    source: 'ForexLive — News',
    defaultCategory: 'market-analysis',
  },
]

// ── Unsplash image search ────────────────────────────────────────────────────

/**
 * Terms that, if found in a search query, mean it's already specific enough
 * for Unsplash. If none match, `UNSPLASH_FALLBACK_TERM` is appended.
 */
export const UNSPLASH_KNOWN_TERMS: string[] = [
  'forex',
  'trading',
  'chart',
  'currency',
  'finance',
  'market',
  'stock',
  'crypto',
  'screen',
  'monitor',
]

/** Appended to Unsplash queries that don't contain any known term. */
export const UNSPLASH_FALLBACK_TERM = 'finance'

/** Fallback Unsplash query when a specific search returns zero results. */
export const UNSPLASH_FALLBACK_QUERY = 'trading desk'

// ── QA scoring ───────────────────────────────────────────────────────────────

/**
 * A regex pattern to count site-name mentions in scored posts.
 * Set to null to disable the site-mention check entirely.
 */
export const SITE_MENTION_PATTERN: RegExp | null = /\bonfin\b/gi

// ── Slack notifications ──────────────────────────────────────────────────────

/** Bot username shown in Slack messages. */
export const SLACK_BOT_NAME = `${SITE_NAME} Blog Bot`

/** Preview URL pattern. {slug} placeholder. Locale-prefixed for blog.onfin.io. */
export const PREVIEW_URL_PATTERN = '/en/{slug}?preview=1'

/** Edit URL pattern. {id} placeholder. */
export const EDIT_URL_PATTERN = '/admin/blog/{id}/edit'

// ── Supabase storage ─────────────────────────────────────────────────────────

/** The Supabase Storage bucket name for uploaded images. */
export const STORAGE_BUCKET = 'cms-images'

// ── Locale support ───────────────────────────────────────────────────────────

/** The primary language. Content is generated in this language first. */
export const PRIMARY_LANG = 'en'

/**
 * Secondary language for translation. Set to null to keep blog English-only.
 * blog.onfin.io is currently English-only; if/when other locales come online
 * for the broader site, set this to the appropriate ISO code.
 */
export const SECONDARY_LANG: string | null = null

/**
 * Language-specific translation rules. Only used when SECONDARY_LANG is set.
 * Kept here in case the secondary locale is later turned on without code edits.
 */
export const THAI_TRANSLATION_RULES = `THAI TRANSLATION RULES
- Write natural, fluent Thai — not transliteration of English.
- Thai has no spaces between words. Only use spaces after punctuation marks,
  before opening brackets, and between Thai and English/number tokens.
- Keep English brand names, ticker symbols, and technical terms in English.
- Translate headings (H2/H3) fully into Thai.
- Keep the same HTML structure as the original.
- The translation should feel like it was written by a native Thai speaker.`

export const ENGLISH_TRANSLATION_RULES = `ENGLISH TRANSLATION RULES
- Write natural, fluent English.
- Keep brand names and technical terms consistent.
- Translate headings (H2/H3) fully.
- The translation should read natively, not as a word-for-word translation.`
