/* Fact check: $1 trillion added at the US open (9 Nov 2026). FactCover (verdict + one candle chart with the weekend gap) and MathSlide (sourced rows). */
(function () {
  var h = React.createElement, OF = window.OF;
  var UP = "#26a69a", DN = "#ef5350";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff" } }, "@onfinkm"));
  }
  function bg() { return h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 0%, #1b1f12 0%, #0a0a0a 55%, #000 100%)" } }); }
  function fmt(v) { return v.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 }); }
  window.OF.FactCover = function (p) {
    var W = 960, H = 700, axisW = 96, top = 30, bot = 40, gapW = 46;
    var all = p.fri.concat(p.mon), hi = Math.max.apply(null, all.map(function (k) { return k[2]; })), lo = Math.min.apply(null, all.map(function (k) { return k[3]; }));
    var pad = (hi - lo) * 0.08; hi += pad; lo -= pad;
    var cw = W - axisW - 20 - gapW, n = all.length, step = cw / n, bw = Math.max(3, step * 0.62);
    function Y(v) { return top + (hi - v) * (H - top - bot) / (hi - lo); }
    function X(i) { return 10 + i * step + step / 2 + (i >= p.fri.length ? gapW : 0); }
    var ticks = []; for (var t = Math.ceil(lo / 25) * 25; t <= hi; t += 25) ticks.push(t);
    var mark = p.mon.findIndex(function (k) { return k[0] === p.markTime; }) + p.fri.length;
    return h(OF.Canvas, { format: "post" }, bg(), handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 132, display: "flex", flexDirection: "column", gap: 16 } },
        h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 58, lineHeight: 1.06, letterSpacing: "-0.02em", color: "#fff", textWrap: "balance" } }, rich(p.headline)),
        h("div", { style: { alignSelf: "flex-start", display: "flex", gap: 14, alignItems: "center", padding: "12px 22px", borderRadius: 16, background: "rgba(216,255,60,0.12)", border: "2px solid var(--accent)" } },
          h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 28, color: "var(--accent)" } }, p.verdictLabel),
          h("span", { style: { fontSize: 26, fontWeight: 700, color: "#fff" } }, p.verdict))),
      h("div", { style: { position: "absolute", left: 60, top: p.chartTop || 560, width: W, height: H, background: "#050505", borderRadius: 18, border: "1px solid rgba(255,255,255,0.1)", overflow: "hidden" } },
        h("svg", { width: W, height: H, style: { position: "absolute", inset: 0 } },
          ticks.map(function (t, i) {
            return h("g", { key: "t" + i }, h("line", { x1: 0, x2: W - axisW, y1: Y(t), y2: Y(t), stroke: "rgba(255,255,255,0.06)" }),
              h("text", { x: W - 14, y: Y(t) + 6, fill: "rgba(255,255,255,0.55)", fontSize: 18, fontWeight: 600, textAnchor: "end", fontFamily: "Montserrat" }, fmt(t)));
          }),
          h("line", { x1: 0, x2: W - axisW, y1: Y(p.prevClose), y2: Y(p.prevClose), stroke: "rgba(255,255,255,0.45)", strokeWidth: 2, strokeDasharray: "8 8" }),
          h("text", { x: 16, y: Y(p.prevClose) + 28, fill: "rgba(255,255,255,0.75)", fontSize: 20, fontWeight: 700, fontFamily: "Montserrat" }, p.prevLabel),
          h("line", { x1: X(p.fri.length) - step / 2 - gapW / 2, x2: X(p.fri.length) - step / 2 - gapW / 2, y1: top - 10, y2: H - 30, stroke: "rgba(255,255,255,0.18)", strokeWidth: 2 }),
          all.map(function (k, i) {
            var x = X(i), col = k[4] >= k[1] ? UP : DN, y1 = Y(Math.max(k[1], k[4])), y2 = Y(Math.min(k[1], k[4]));
            return h("g", { key: i }, h("line", { x1: x, x2: x, y1: Y(k[2]), y2: Y(k[3]), stroke: col, strokeWidth: 2 }),
              h("rect", { x: x - bw / 2, y: y1, width: bw, height: Math.max(2, y2 - y1), fill: col }));
          }),
          mark >= p.fri.length && h("g", null,
            h("circle", { cx: X(mark), cy: Y(all[mark][4]), r: 10, fill: "none", stroke: "var(--accent)", strokeWidth: 4 }),
            h("text", { x: X(mark) - 18, y: Y(all[mark][4]) - 22, fill: "var(--accent)", fontSize: 24, fontWeight: 800, textAnchor: "end", fontFamily: "Montserrat" }, p.markLabel)),
          h("text", { x: 16, y: H - 12, fill: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: 600, fontFamily: "Montserrat" }, p.leftLabel),
          h("text", { x: X(p.fri.length) - step / 2, y: H - 12, fill: "rgba(255,255,255,0.5)", fontSize: 18, fontWeight: 600, fontFamily: "Montserrat" }, p.rightLabel))),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 40, fontSize: 19, color: "rgba(255,255,255,0.55)" } }, p.foot));
  };
  window.OF.MathSlide = function (p) {
    return h(OF.Canvas, { format: "post" }, bg(), handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 60, display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 58, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", padding: "10px 30px 18px" } },
          p.rows.map(function (r, j) {
            return h("div", { key: j, style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, padding: "20px 0", borderBottom: j < p.rows.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none" } },
              h("span", { style: { fontSize: 27, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.25 } }, r[0]),
              h("span", { style: { fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: r[2] ? "var(--accent)" : "#fff", whiteSpace: "nowrap" } }, r[1]));
          }),
          p.foot && h("div", { style: { fontSize: 20, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.35 } }, p.foot)),
        h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
          h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
          h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, p.source)),
        p.risk && h("p", { style: { margin: 0, fontSize: 18, lineHeight: 1.35, color: "rgba(255,255,255,0.6)" } }, p.risk)));
  };
})();
