// Local-dev demo content. Returned by the page-level fetch helpers when
// `NEXT_PUBLIC_SUPABASE_URL` is missing or set to the placeholder, so the
// design is reviewable end-to-end without a database round trip.
//
// Removed automatically the moment a real Supabase URL is set.

import { type PostCategory } from '@/lib/cms-config'

export function isDemoMode(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  return !url || url.includes('placeholder')
}

export type DemoPost = {
  id: string
  slug: string
  title_en: string
  excerpt_en: string | null
  body_en: string
  category: PostCategory
  post_type?: string
  cover_image: string | null
  published_at: string
  blog_author_id: string
}

const DEMO_AUTHOR = {
  id: 'demo-author',
  slug: 'onfin-editorial',
  name: 'OnFin Editorial',
  bio_en:
    'The OnFin editorial desk covers market analysis, trading guides, platform updates, and regulation news for retail forex and CFD traders.',
  avatar_url: null,
  twitter: null,
  linkedin: null,
  website: null,
}

export const DEMO_AUTHOR_BY_ID: Record<string, typeof DEMO_AUTHOR> = {
  'demo-author': DEMO_AUTHOR,
}

// Article HTML used by the demo posts. Kept above the post array so
// module evaluation order doesn't hit the temporal dead zone.
const TRADING_GUIDE_BODY = `
<p>Most traders blow up their first account because position sizes drift. They start at 0.5 lots on EUR/USD, take a few losses, and slowly creep up to 2 lots trying to recover. By the third red trade in a row, the math no longer works. This guide walks through a position-sizing framework that holds up regardless of what your win rate looks like, and shows you how to pick between the two approaches retail traders actually use.</p>
<h2>Fixed-fractional sizing — the default for a reason</h2>
<p>Fixed-fractional risks the same percentage of equity per trade. With a $10,000 account and a 1% risk cap, you put $100 at risk per position, full stop. When the account grows to $11,000, the risk grows in step to $110. When it shrinks to $9,000, it drops to $90.</p>
<p>The math here is what keeps you alive through losing streaks. A trader risking 2% per trade survives twenty consecutive losses with 66% of their account intact. The same trader risking 5% loses 64% of their stack on the same streak.</p>
<h3>Picking the right fraction</h3>
<p>Most retail traders settle on 0.5–2% per trade. Below 0.5% and your wins barely move the needle; above 2% and a normal losing streak will rattle you out of the strategy.</p>
<h3>What "1% risk" actually means</h3>
<p>It is not 1% of the position size. It is 1% of equity going to zero if your stop loss is hit. On EUR/USD with a 30-pip stop and $5 per pip, that's $150 of risk — so on a $15,000 account, that one trade is exactly 1%.</p>
<h2>ATR-scaled sizing for volatile pairs</h2>
<p>A 30-pip stop is reasonable on EUR/USD. On GBP/JPY during London open, it gets you stopped out before the trade has a chance to develop. ATR-scaled sizing flips the calculation: you decide how many ATR units the stop should sit beyond entry, then back into a position size that respects your risk cap.</p>
<p>The mechanics are straightforward. Compute the 14-period Average True Range on your trade timeframe. Set the stop at 1.5–2.0 ATR beyond entry. Then size the position so that the distance from entry to stop equals your dollar risk cap.</p>
<h2>Why most retail traders quietly under-size</h2>
<p>Risk management literature pushes 1–2% per trade. In practice, most retail accounts are too small for that to feel meaningful — a $1,000 account risking 1% is wagering $10 per trade, which doesn't pay rent. The pull is to bump it to 5% or more so the wins matter.</p>
<p>The honest answer is that small accounts are emotional accounts. Either trade them as if they are a learning sandbox (risking small, losing small, building skill) or fund them properly. Mid-strategy account size changes break the math you spent weeks calibrating.</p>
<h2>Where stops actually belong</h2>
<p>A stop loss is a structural decision, not a percentage decision. The cleanest stops sit just beyond a level the market would have to violate to invalidate your thesis — the prior swing low for a long, the high of the consolidation for a short. Once you know where the structural stop lives, position sizing becomes the second step, not the first.</p>
<h2>Common position-sizing mistakes</h2>
<p>The five mistakes that kill retail accounts:</p>
<ol>
  <li>Increasing size after a loss to "win it back faster"</li>
  <li>Decreasing size after a win and missing the trade that pays for the week</li>
  <li>Sizing off account balance instead of equity (open trades count)</li>
  <li>Ignoring the spread on news-event trades — a 5-pip spread on EUR/USD becomes 25 pips during NFP</li>
  <li>Using leverage as the sizing input instead of the sizing output</li>
</ol>
<p>OnFin's MT5 position calculator handles the arithmetic; the discipline is the part you have to bring.</p>
<h2>FAQ</h2>
<h3>How much should a beginner risk per trade?</h3>
<p>Start at 0.5% per trade for the first 50 trades. The goal isn't to get rich; it's to learn whether your strategy actually works. At 0.5% you can lose ten in a row and still be at 95% of starting equity, which keeps you in the game long enough to learn.</p>
<h3>Is 1% risk too conservative for a small account?</h3>
<p>For small accounts under $500, 1% risk produces dollar amounts that aren't worth the screen time. Either trade demo until the account is funded properly, or accept that you're paying tuition rather than expecting income.</p>
<h3>Should I scale into positions?</h3>
<p>Scaling in works when the structural stop is far enough away that a partial entry preserves your risk cap. It does not work when used as a way to "average down" a losing trade.</p>
<h3>What's the ideal stop loss size?</h3>
<p>There is no ideal — it depends on the timeframe, the pair, and the setup. The right stop sits at the price level that invalidates your thesis. Position size is what you adjust to keep the dollar risk constant.</p>
<h3>Does ATR-scaled sizing work for indices and crypto?</h3>
<p>It works anywhere there's volatility. Crypto in particular benefits because the volatility regime shifts faster than retail traders adjust. ATR-scaled sizing forces the position to shrink when the market is wild, which is exactly when undisciplined sizing kills accounts.</p>
`

const MARKET_BODY = `
<p>The May ECB meeting reshaped retail spreads on EUR/USD in a way most traders only noticed days later. Headline policy held flat, but the press conference language on disinflation pace tightened the band on overnight quotes — and when London opened the next morning, retail spreads had widened.</p>
<h2>What changed in the spread, in pips</h2>
<p>The pre-meeting Frankfurt spread sat at a steady 0.4–0.6 pips during the European session. Within an hour of the press conference, retail aggregators were quoting 1.2–1.4 pips. By the NY close it had walked back to about 0.8 pips and stayed there for the rest of the week.</p>
<h2>Why the widening took 60 minutes to land</h2>
<p>Liquidity providers don't tighten quotes back the moment volatility eases. They wait for two consecutive sessions of stable two-way flow before re-tightening, because a single quiet session is often a head-fake.</p>
<h2>Practical implications for retail orders</h2>
<p>If you scalp EUR/USD with a 5-pip target, an extra 0.6 pip of spread is a 12% drag on your gross. Either widen targets to 8 pips during weeks like this, or skip the pair until liquidity normalises.</p>
<h2>FAQ</h2>
<h3>Does this affect MT5 orders differently from MT4?</h3>
<p>Spreads come from the broker's liquidity feed, not from the platform. Both MT4 and MT5 see the same widening — execution model determines slippage, not spread.</p>
<h3>Should I switch to fixed spreads after meetings?</h3>
<p>Fixed-spread accounts pay a constant premium for the certainty. Whether that's a good trade depends on how often you trade through high-volatility windows.</p>
`

const PLATFORM_BODY = `
<p>We would like to inform you that scheduled maintenance will take place on <strong>May 1, 2026</strong>. Some services will be temporarily unavailable during the maintenance period from approximately <strong>08:30 to 10:30 UTC</strong>.</p>
<p>The following services will be offline for the duration of the maintenance:</p>
<ul>
  <li>copytrading.onfin.group</li>
  <li>client.onfin.io</li>
</ul>
<p>However, the following services will remain fully operational:</p>
<ul>
  <li>MetaTrader 4 and MetaTrader 5 platforms</li>
  <li>Paylib service</li>
  <li>Main website onfin.io</li>
</ul>
<p>Please plan your activities accordingly by taking these temporary disruptions into account.</p>
`

const STRATEGIES_BODY = `
<p>Most retail traders place stop orders on the chart and assume that's the end of it. The order sits on your terminal until price triggers it. That is not how server-side stops work, and the difference matters more during volatile sessions than during quiet ones.</p>
<h2>Chart stops vs server-side stops</h2>
<p>A chart stop is a client-side intent: it lives on your machine. Close the platform, lose connection, the stop disappears. A server-side stop is registered with the broker's order book and fires regardless of whether your terminal is online.</p>
<h2>Why slippage looks different on each</h2>
<p>Server-side stops convert to market orders the instant price touches the level — slippage is the difference between the trigger price and the execution price. On chart stops, the platform sends the market order, which adds round-trip latency on top of the slippage.</p>
<h2>The execution-time gap during news</h2>
<p>During NFP or central-bank events, that round-trip latency can mean 3–5 extra pips of slippage. Server-side stops don't fix slippage entirely — liquidity is still the binding constraint — but they remove the latency component, which is the part you can control.</p>
<h2>FAQ</h2>
<h3>Do all brokers support server-side stops?</h3>
<p>Most ECN-style brokers do; some retail-only brokers don't. Check your account type's documentation.</p>
<h3>Should I always use server-side stops?</h3>
<p>For positions held longer than a single session, yes. For very short scalp positions where you intend to manage manually, the latency difference is negligible.</p>
`

const REGULATION_BODY = `
<p>ESMA's 2026 guidance on proprietary trading programmes adds three new disclosure requirements for firms running retail-facing prop challenges. Most operators will absorb the cost; a few will exit the segment.</p>
<h2>The three new disclosures</h2>
<p>Profit-share ratio over the prior 12 months by trader cohort, average drawdown that triggered an account reset, and a plain-language summary of the challenge's pass rate. All three sit on the firm's marketing page; deep-bury in a PDF is not compliant.</p>
<h2>What this means for traders</h2>
<p>You can now compare programmes apples-to-apples. The pass rate disclosure in particular kills the marketing claim that everyone passes — actual cohort data tells a different story.</p>
`

const GENERAL_BODY = `
<p>Most retail traders pick the leverage first and back into the position size. That ordering is exactly backwards.</p>
<p>The right sequence: decide what your dollar risk per trade is. Locate where the structural stop belongs on the chart. Compute the position size that satisfies both. The leverage that emerges is the leverage you actually used — it's the output, not the input.</p>
<p>When leverage is the input, the trade is being designed around the broker's offer, not around the market. That's why account blow-ups cluster on the highest-leverage accounts.</p>
`

export const DEMO_POSTS: DemoPost[] = [
  {
    id: '1',
    slug: 'how-to-size-positions-for-forex-risk-management',
    title_en: 'How to size positions for forex risk management',
    excerpt_en:
      'A practical position-sizing framework for retail traders: fixed-fractional, ATR-scaled, and how to pick between them without overthinking it.',
    body_en: TRADING_GUIDE_BODY,
    category: 'trading-guides',
    cover_image: null,
    published_at: '2026-04-15T00:00:00.000Z',
    blog_author_id: 'demo-author',
  },
  {
    id: '2',
    slug: 'eurusd-spread-shifts-after-may-ecb-meeting',
    title_en: 'EUR/USD spread shifts after the May ECB meeting',
    excerpt_en:
      'How the post-meeting volatility window reshaped retail spreads on EUR/USD across the London and NY sessions.',
    body_en: MARKET_BODY,
    category: 'market-analysis',
    cover_image: null,
    published_at: '2026-04-22T00:00:00.000Z',
    blog_author_id: 'demo-author',
  },
  {
    id: '3',
    slug: 'news_30_04_2026',
    title_en: 'Scheduled maintenance notice — May 1, 2026',
    excerpt_en:
      'Scheduled maintenance on the copytrading and client portals. MT4 and MT5 platforms remain online throughout.',
    body_en: PLATFORM_BODY,
    category: 'platform-updates',
    cover_image: null,
    published_at: '2026-04-30T00:00:00.000Z',
    blog_author_id: 'demo-author',
  },
  {
    id: '4',
    slug: 'mt5-server-side-stops-explained',
    title_en: 'MT5 server-side stops explained',
    excerpt_en:
      'Why server-side stop orders behave differently from chart stops, and what that means for execution during volatile sessions.',
    body_en: STRATEGIES_BODY,
    category: 'strategies',
    cover_image: null,
    published_at: '2026-04-08T00:00:00.000Z',
    blog_author_id: 'demo-author',
  },
  {
    id: '5',
    slug: 'eu-prop-firm-licensing-changes-2026',
    title_en: 'EU prop firm licensing changes for 2026',
    excerpt_en:
      'A short explainer on the new ESMA guidance for proprietary trading programmes and how it filters down to retail challenges.',
    body_en: REGULATION_BODY,
    category: 'regulation-news',
    cover_image: null,
    published_at: '2026-04-02T00:00:00.000Z',
    blog_author_id: 'demo-author',
  },
  {
    id: '6',
    slug: 'why-leverage-is-not-the-input',
    title_en: 'Why leverage is not the input',
    excerpt_en:
      "Leverage is the output of a position-sizing decision, not the lever you pull first. A short read on getting the order right.",
    body_en: GENERAL_BODY,
    category: 'general',
    cover_image: null,
    published_at: '2026-03-28T00:00:00.000Z',
    blog_author_id: 'demo-author',
  },
]
