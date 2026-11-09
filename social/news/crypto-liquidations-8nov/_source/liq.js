/* Crypto liquidation flush (8 Nov 2026): LiqCover (headline + 2x2 grid of 1-minute candle charts) and LiqTable (before / low / now + question + risk). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  var UP = "#26a69a", DN = "#ef5350";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  function fmt(v, dp, loc) { return v.toLocaleString(loc || "en-US", { minimumFractionDigits: dp, maximumFractionDigits: dp }); }
  /* one candle panel: c = [[o,h,l,c],...] */
  function panel(pp, W, H) {
    var axisW = 112, top = 64, bot = 14, cw = W - axisW - 14, chH = H - top - bot;
    var hi = Math.max.apply(null, pp.c.map(function (k) { return k[1]; })), lo = Math.min.apply(null, pp.c.map(function (k) { return k[2]; }));
    var padv = (hi - lo) * 0.06; hi += padv; lo -= padv;
    function Y(v) { return top + (hi - v) * chH / (hi - lo); }
    var n = pp.c.length, step = cw / n, bw = Math.max(2, step * 0.62);
    var ticks = [], tstep = pp.tick, t0 = Math.ceil(lo / tstep) * tstep;
    for (var t = t0; t <= hi; t += tstep) ticks.push(t);
    return h("div", { style: { position: "relative", width: W, height: H, background: "#050505", borderRadius: 18, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" } },
      h("svg", { width: W, height: H, style: { position: "absolute", inset: 0 } },
        ticks.map(function (t, i) {
          return h("g", { key: "t" + i },
            h("line", { x1: 0, x2: cw + 8, y1: Y(t), y2: Y(t), stroke: "rgba(255,255,255,0.06)", strokeWidth: 1 }),
            h("text", { x: W - 12, y: Y(t) + 6, fill: "rgba(255,255,255,0.55)", fontSize: 17, fontWeight: 600, textAnchor: "end", fontFamily: "Montserrat" }, fmt(t, pp.dp, pp.loc)));
        }),
        pp.c.map(function (k, i) {
          var x = 6 + i * step + step / 2, col = k[3] >= k[0] ? UP : DN, y1 = Y(Math.max(k[0], k[3])), y2 = Y(Math.min(k[0], k[3]));
          return h("g", { key: i },
            h("line", { x1: x, x2: x, y1: Y(k[1]), y2: Y(k[2]), stroke: col, strokeWidth: 1.6 }),
            h("rect", { x: x - bw / 2, y: y1, width: bw, height: Math.max(1.5, y2 - y1), fill: col }));
        })),
      h("div", { style: { position: "absolute", left: 18, top: 14, right: 18, display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 30, color: "#fff" } }, pp.sym),
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: DN } }, pp.move)),
      h("div", { style: { position: "absolute", left: 18, bottom: 14, fontSize: 19, fontWeight: 700, color: "rgba(255,255,255,0.8)", background: "rgba(0,0,0,0.55)", padding: "4px 10px", borderRadius: 8 } }, pp.low));
  }
  window.OF.LiqCover = function (p) {
    var PW = 468, PH = 384;
    return h(OF.Canvas, { format: "post" },
      h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 0%, #1b1f12 0%, #0a0a0a 55%, #000 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 136, display: "flex", flexDirection: "column", gap: 18 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 66, lineHeight: 1.05, letterSpacing: "-0.02em", color: "#fff", textWrap: "balance" } }, rich(p.headline))),
      h("div", { style: { position: "absolute", left: 60, top: p.gridTop || 424, display: "grid", gridTemplateColumns: PW + "px " + PW + "px", gap: 24 } },
        p.panels.map(function (pp, i) { return h("div", { key: i }, panel(pp, PW, PH)); })),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 40, fontSize: 19, color: "rgba(255,255,255,0.55)" } }, p.foot));
  };
  window.OF.LiqTable = function (p) {
    return h(OF.Canvas, { format: "post" },
      h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 0%, #1b1f12 0%, #0a0a0a 55%, #000 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 60, display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 58, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", padding: "18px 30px 14px" } },
          h("div", { style: { display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 1fr", padding: "10px 0 14px", fontSize: 21, fontWeight: 700, color: "rgba(255,255,255,0.55)", borderBottom: "1px solid rgba(255,255,255,0.12)" } },
            p.cols.map(function (c, i) { return h("span", { key: i, style: { textAlign: i ? "right" : "left" } }, c); })),
          p.rows.map(function (r, j) {
            return h("div", { key: j, style: { display: "grid", gridTemplateColumns: "1.1fr 1fr 1fr 1fr", padding: "18px 0", borderBottom: j < p.rows.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none", alignItems: "baseline" } },
              h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: "#fff" } }, r[0]),
              h("span", { style: { textAlign: "right", fontSize: 29, fontWeight: 600, color: "rgba(255,255,255,0.85)" } }, r[1]),
              h("span", { style: { textAlign: "right", fontSize: 29, fontWeight: 800, color: DN } }, r[2]),
              h("span", { style: { textAlign: "right", fontSize: 29, fontWeight: 800, color: "#fff" } }, r[3]));
          }),
          p.foot && h("div", { style: { fontSize: 20, color: "rgba(255,255,255,0.55)", marginTop: 10, lineHeight: 1.35 } }, p.foot)),
        h("p", { style: { margin: "8px 0 0", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.qsize || 46, lineHeight: 1.12, color: "#fff", textWrap: "balance" } }, rich(p.q)),
        h("p", { style: { margin: 0, fontSize: 26, fontWeight: 600, color: "rgba(255,255,255,0.8)" } }, p.follow),
        h("p", { style: { margin: 0, fontSize: 18, lineHeight: 1.35, color: "rgba(255,255,255,0.6)" } }, p.risk)));
  };
})();
