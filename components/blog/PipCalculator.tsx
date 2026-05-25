"use client";

/**
 * PipCalculator — interactive pip-value widget embedded inside blog articles.
 *
 * The blog renders article bodies as raw HTML via dangerouslySetInnerHTML, so
 * there is no MDX/component system. Authors drop the literal token
 * `[pip-calculator]` (on its own line / paragraph) into the article body and
 * the article renderer (app/[lang]/[slug]/page.tsx) splits the HTML on that
 * token and mounts this component in its place.
 *
 * Pip math:
 *   pip size      = 0.01 for JPY-quoted pairs, else 0.0001
 *   pip value     = pipSize × contractSize(100,000) × lots   (in QUOTE currency)
 *   account value = pipValueQuote × usdValue[quote] / usdValue[account]
 *
 * FX/price figures are indicative (embedded table) so the widget stays
 * self-contained — no API, no key, works offline. A disclaimer makes that
 * explicit; the exact figure always depends on the broker's live rate.
 */

import { useMemo, useState } from "react";

type Pair = { sym: string; quote: string; price: number };

// Indicative reference prices (quote per 1 base) — used for the optional
// margin estimate only; pip value itself doesn't depend on them.
const PAIRS: Pair[] = [
  { sym: "EUR/USD", quote: "USD", price: 1.085 },
  { sym: "GBP/USD", quote: "USD", price: 1.27 },
  { sym: "AUD/USD", quote: "USD", price: 0.66 },
  { sym: "NZD/USD", quote: "USD", price: 0.6 },
  { sym: "USD/JPY", quote: "JPY", price: 157.0 },
  { sym: "USD/CHF", quote: "CHF", price: 0.905 },
  { sym: "USD/CAD", quote: "CAD", price: 1.365 },
  { sym: "EUR/JPY", quote: "JPY", price: 170.4 },
  { sym: "GBP/JPY", quote: "JPY", price: 199.4 },
  { sym: "EUR/GBP", quote: "GBP", price: 0.854 },
];

// Value of 1 unit of each currency in USD (indicative).
const USD_VALUE: Record<string, number> = {
  USD: 1,
  EUR: 1.085,
  GBP: 1.27,
  JPY: 1 / 157.0,
  CHF: 1 / 0.905,
  CAD: 1 / 1.365,
  AUD: 0.66,
  NZD: 0.6,
};

const ACCOUNT_CCYS = ["USD", "EUR", "GBP", "JPY"];
const LEVERAGES = [0, 30, 100, 200, 500];
const CONTRACT_SIZE = 100_000;

function fmt(n: number, ccy: string): string {
  const digits = ccy === "JPY" ? 0 : 2;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: ccy,
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(n);
}

export default function PipCalculator() {
  const [sym, setSym] = useState("EUR/USD");
  const [lots, setLots] = useState("1");
  const [account, setAccount] = useState("USD");
  const [leverage, setLeverage] = useState(0);

  const pair = PAIRS.find((p) => p.sym === sym)!;
  const lotsNum = Math.max(0, Number(lots) || 0);

  const { pipValue, marginReq } = useMemo(() => {
    const pipSize = pair.quote === "JPY" ? 0.01 : 0.0001;
    const units = lotsNum * CONTRACT_SIZE;
    const pipValueQuote = pipSize * units;
    const toAccount = (amtQuote: number) =>
      (amtQuote * (USD_VALUE[pair.quote] ?? 1)) / (USD_VALUE[account] ?? 1);
    const pipValue = toAccount(pipValueQuote);
    // notional in quote ccy = units(base) × price(quote/base)
    const notionalAccount = toAccount(units * pair.price);
    const marginReq = leverage > 0 ? notionalAccount / leverage : null;
    return { pipValue, marginReq };
  }, [pair, lotsNum, account, leverage]);

  return (
    <div className="not-prose my-10 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 bg-slate-50 px-5 py-4">
        <h3 className="text-base font-semibold text-slate-900">Pip value calculator</h3>
        <p className="mt-0.5 text-xs text-slate-500">
          Updates live as you type — no submit needed.
        </p>
      </div>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Currency pair
          </span>
          <select
            value={sym}
            onChange={(e) => setSym(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {PAIRS.map((p) => (
              <option key={p.sym} value={p.sym}>
                {p.sym}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Trade size (lots)
          </span>
          <input
            type="number"
            min="0"
            step="0.01"
            value={lots}
            onChange={(e) => setLots(e.target.value)}
            inputMode="decimal"
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          />
          <span className="mt-1 block text-[11px] text-slate-400">
            1 standard lot = 100,000 units
          </span>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Account currency
          </span>
          <select
            value={account}
            onChange={(e) => setAccount(e.target.value)}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {ACCOUNT_CCYS.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
            Leverage (optional)
          </span>
          <select
            value={leverage}
            onChange={(e) => setLeverage(Number(e.target.value))}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            {LEVERAGES.map((l) => (
              <option key={l} value={l}>
                {l === 0 ? "— (skip margin)" : `1:${l}`}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="border-t border-slate-100 bg-emerald-50/60 px-5 py-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="block text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Pip value
            </span>
            <span className="mt-1 block text-3xl font-bold tabular-nums text-slate-900">
              {fmt(pipValue, account)}
            </span>
            <span className="mt-0.5 block text-xs text-slate-500">
              per pip · {lotsNum || 0} lot{lotsNum === 1 ? "" : "s"} of {sym}
            </span>
          </div>
          {marginReq !== null && (
            <div className="text-right">
              <span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Est. margin (1:{leverage})
              </span>
              <span className="mt-1 block text-xl font-semibold tabular-nums text-slate-700">
                {fmt(marginReq, account)}
              </span>
            </div>
          )}
        </div>
      </div>

      <p className="border-t border-slate-100 px-5 py-3 text-[11px] leading-relaxed text-slate-400">
        Figures are indicative and use reference exchange rates for the conversion;
        your broker&apos;s live rate at the moment of the trade determines the exact
        pip value and margin. JPY pairs are calculated at a 0.01 pip; all others at
        0.0001.
      </p>
    </div>
  );
}
