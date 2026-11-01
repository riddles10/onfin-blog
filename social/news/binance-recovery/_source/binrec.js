/* Binance recovery carousel: BCover (photo + dark logo circle + badge, movable), BChart (hourly line with an event marker). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle() {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: window.BR_AV, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  window.OF.BCover = function (p) {
    window.BR_AV = p.avatar; var cd = p.cd || 270;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.1) 45%, rgba(0,0,0,0.92) 100%)" } }),
      handle(),
      h("div", { style: { position: "absolute", left: p.cx || 540, top: p.cy || 420, transform: "translate(-50%,-50%)", zIndex: 2 } },
        h("div", { style: { width: cd, height: cd, borderRadius: "50%", background: "#0b0e11", display: "flex", alignItems: "center", justifyContent: "center",
          border: "10px solid #fff", boxShadow: "0 0 0 8px rgba(240,185,11,0.95), 0 30px 70px rgba(0,0,0,0.55)" } },
          h("img", { src: p.logo, style: { width: "64%", height: "64%", objectFit: "contain" } })),
        p.badge && h("span", { style: { position: "absolute", left: -70, bottom: -10, padding: "12px 24px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 48, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 84, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, left: 30, textAlign: "right", zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.6)" } }, p.credit));
  };
  window.OF.BChart = function (p) {
    var W = 880, H = 500, pad = 34, n = p.closes.length, mn = Math.min.apply(null, p.closes), mx = Math.max.apply(null, p.closes);
    var lo = mn - (mx - mn) * 0.15, hi = mx + (mx - mn) * 0.15;
    function X(i) { return pad + i * (W - 2 * pad) / (n - 1); } function Y(v) { return pad + (hi - v) * (H - 2 * pad) / (hi - lo); }
    var m = p.mark, pre = p.closes.slice(0, m + 1).map(function (v, i) { return X(i) + "," + Y(v); }).join(" ");
    var post = p.closes.slice(m).map(function (v, i) { return X(i + m) + "," + Y(v); }).join(" ");
    var bg = [h("img", { key: "b", src: p.bg, style: { position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", objectPosition: p.bgpos || "50% 50%", filter: "blur(26px) brightness(0.45) saturate(1.1)" } }),
              h("div", { key: "o", style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))" } })];
    window.BR_AV = p.avatar;
    return h(OF.Canvas, { format: "post" }, bg, handle(),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", padding: "26px 30px 18px" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, color: "#fff" } }, p.symbol),
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 44, color: "var(--down)" } }, p.change)),
          h("span", { style: { fontSize: 22, color: "rgba(255,255,255,0.6)" } }, p.sub),
          h("svg", { width: W - 60, height: H, viewBox: "0 0 " + W + " " + H, style: { display: "block", marginTop: 8 } },
            h("line", { x1: X(m), x2: X(m), y1: 10, y2: H - 10, stroke: "rgba(255,255,255,0.35)", strokeWidth: 3, strokeDasharray: "10 10" }),
            h("text", { x: X(m) + 14, y: 36, fill: "rgba(255,255,255,0.75)", fontSize: 26, fontWeight: 700, fontFamily: "Montserrat" }, p.markLabel),
            h("polyline", { points: pre, fill: "none", stroke: "rgba(255,255,255,0.85)", strokeWidth: 5, strokeLinejoin: "round", strokeLinecap: "round" }),
            h("polyline", { points: post, fill: "none", stroke: "#ff5c5c", strokeWidth: 6, strokeLinejoin: "round", strokeLinecap: "round" }),
            h("circle", { cx: X(m), cy: Y(p.closes[m]), r: 10, fill: "#fff" }),
            h("circle", { cx: X(n - 1), cy: Y(p.closes[n - 1]), r: 11, fill: "#ff5c5c" }),
            h("text", { x: X(m) - 16, y: Y(p.closes[m]) - 48, fill: "#fff", fontSize: 30, fontWeight: 700, textAnchor: "end", fontFamily: "Montserrat" }, p.fromLabel),
            h("text", { x: X(n - 1) - 6, y: Y(p.closes[n - 1]) - 26, fill: "#ff5c5c", fontSize: 30, fontWeight: 800, textAnchor: "end", fontFamily: "Montserrat" }, p.toLabel)),
          h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 4 } },
            h("span", null, p.startLabel), h("span", null, p.endLabel))),
        h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
          h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
          h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, p.source))));
  };
})();
