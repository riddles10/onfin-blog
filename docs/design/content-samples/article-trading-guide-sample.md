---
title: "How to Size Positions for Forex Risk Management"
category: trading-guides
publishedAt: 2026-04-15
author: OnFin Editorial
excerpt: "A practical position-sizing framework for retail traders: fixed-fractional, ATR-scaled, and how to pick between them without overthinking it."
---

Most traders blow up their first account because position sizes drift. They start at 0.5 lots on EUR/USD, take a few losses, and slowly creep up to 2 lots trying to recover. By the third red trade in a row, the math no longer works. This guide walks through a position-sizing framework that holds up regardless of what your win rate looks like, and shows you how to pick between the two approaches retail traders actually use.

## Fixed-fractional sizing — the default for a reason

Fixed-fractional risks the same percentage of equity per trade. With a $10,000 account and a 1% risk cap, you put $100 at risk per position, full stop. When the account grows to $11,000, the risk grows in step to $110. When it shrinks to $9,000, it drops to $90.

The math here is what keeps you alive through losing streaks. A trader risking 2% per trade survives twenty consecutive losses with 66% of their account intact. The same trader risking 5% loses 64% of their stack on the same losing streak.

### Picking the right fraction

Most retail traders settle on 0.5–2% per trade. Below 0.5% and your wins barely move the needle; above 2% and a normal losing streak will rattle you out of the strategy.

### What "1% risk" actually means

It is not 1% of the position size. It is 1% of equity going to zero if your stop loss is hit. On EUR/USD with a 30-pip stop and $5 per pip, that's $150 of risk — so on a $15,000 account, that one trade is exactly 1%.

## ATR-scaled sizing for volatile pairs

A 30-pip stop is reasonable on EUR/USD. On GBP/JPY during London open, it gets you stopped out before the trade has a chance to develop. ATR-scaled sizing flips the calculation: you decide how many ATR units the stop should sit beyond entry, then back into a position size that respects your risk cap.

The mechanics are straightforward. Compute the 14-period Average True Range on your trade timeframe. Set the stop at 1.5–2.0 ATR beyond entry. Then size the position so that the distance from entry to stop equals your dollar risk cap.

## Why most retail traders quietly under-size

Risk management literature pushes 1–2% per trade. In practice, most retail accounts are too small for that to feel meaningful — a $1,000 account risking 1% is wagering $10 per trade, which doesn't pay rent. The pull is to bump it to 5% or more so the wins matter.

The honest answer is that small accounts are emotional accounts. Either trade them as if they are a learning sandbox (risking small, losing small, building skill) or fund them properly. Mid-strategy account size changes break the math you spent weeks calibrating.

## Where stops actually belong

A stop loss is a structural decision, not a percentage decision. The cleanest stops sit just beyond a level the market would have to violate to invalidate your thesis — the prior swing low for a long, the high of the consolidation for a short. Once you know where the structural stop lives, position sizing becomes the second step, not the first.

If the structural stop sits 80 pips away on a $5,000 account, and your 1% risk cap is $50, then EUR/USD's $5 per pip puts you at 0.10 lots. Trying to force a "normal" lot size on that setup means moving the stop tighter, which means the trade is probably wrong.

## Common position-sizing mistakes

The five mistakes that kill retail accounts:

1. Increasing size after a loss to "win it back faster"
2. Decreasing size after a win and missing the trade that pays for the week
3. Sizing off account balance instead of equity (open trades count)
4. Ignoring the spread on news-event trades — a 5-pip spread on EUR/USD becomes 25 pips during NFP
5. Using leverage as the sizing input instead of the sizing output

OnFin's MT5 position calculator handles the arithmetic; the discipline is the part you have to bring.

## When to override the rules

Two scenarios where a trader should risk less than their normal cap: any trade taken in conditions outside their tested setup, and any trade taken on a day they're emotionally compromised — fight with a partner, sick, exhausted, drunk.

Two scenarios where risking more is defensible: a high-conviction trade where the structural stop is naturally tight (so the dollar risk doesn't actually rise much), and a series of trades on a tight cluster of correlated pairs where the effective exposure is one trade in three positions.

## How OnFin sizes execution into position-sizing decisions

Spread, slippage, and commissions all eat into the math above. On a 30-pip ATR-scaled stop, a 2-pip spread is 7% of your stop distance — meaning your effective risk-reward is materially worse than the chart screenshot suggests. Run the math with realistic execution costs, not idealised ones.

## FAQ

### How much should a beginner risk per trade?

Start at 0.5% per trade for the first 50 trades. The goal isn't to get rich; it's to learn whether your strategy actually works. At 0.5% you can lose ten in a row and still be at 95% of starting equity, which keeps you in the game long enough to learn.

### Is 1% risk too conservative for a small account?

For small accounts under $500, 1% risk produces dollar amounts that aren't worth the screen time. Either trade demo until the account is funded properly, or accept that you're paying tuition rather than expecting income.

### Should I scale into positions?

Scaling in works when the structural stop is far enough away that a partial entry preserves your risk cap. It does not work when used as a way to "average down" a losing trade.

### What's the ideal stop loss size?

There is no ideal — it depends on the timeframe, the pair, and the setup. The right stop sits at the price level that invalidates your thesis. Position size is what you adjust to keep the dollar risk constant.

### Does ATR-scaled sizing work for indices and crypto?

It works anywhere there's volatility. Crypto in particular benefits because the volatility regime shifts faster than retail traders adjust. ATR-scaled sizing forces the position to shrink when the market is wild, which is exactly when undisciplined sizing kills accounts.
