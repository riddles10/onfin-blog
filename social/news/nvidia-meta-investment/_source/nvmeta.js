/* Nvidia x Meta carousel extras: two-logo cover, video frame slide (magenta box is replaced by video), chart with a reference line. */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  function bg(p) {
    return [h("img", { key: "b", src: p.bg, style: { position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", objectPosition: p.bgpos || "50% 50%", filter: "blur(26px) brightness(0.45) saturate(1.1)" } }),
            h("div", { key: "o", style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))" } })];
  }
  function source(t) {
    return h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
      h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
      h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, t));
  }
  function circle(logo, d, x, y, z) {
    return h("div", { style: { position: "absolute", left: x - d / 2, top: y - d / 2, width: d, height: d, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      border: "10px solid #fff", boxSizing: "border-box", boxShadow: "0 0 0 8px rgba(118,185,0,0.95), 0 30px 70px rgba(0,0,0,0.55)", zIndex: z } },
      h("img", { src: logo, style: { width: "70%", height: "70%", objectFit: "contain" } }));
  }
  window.OF.NvCover = function (p) {
    var d = p.cd || 280, cx = p.cx || 800, cy = p.cy || 430, off = p.off || 100;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 22%, rgba(0,0,0,0.1) 48%, rgba(0,0,0,0.9) 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", inset: 0, zIndex: 2 } },
        circle(p.logo1, d, cx - off, cy - off * 0.45, 1),
        circle(p.logo2, d, cx + off, cy + off * 0.45, 2),
        p.badge && h("span", { style: { position: "absolute", right: 1080 - (cx + off + d / 2) - 20, top: cy + off * 0.45 + d / 2 - 40, zIndex: 3, padding: "14px 26px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 50, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 86, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)" } }, p.credit));
  };
  /* Same layout as EvidenceSlide, but the card is a 16:9 magenta box that the video is composited into. */
  window.OF.VideoFrame = function (p) {
    return h(OF.Canvas, { format: "post" }, bg(p), handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, overflow: "hidden", background: "#ff00ff", aspectRatio: "16 / 9", width: "100%", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" } }),
        p.note && h("p", { style: { margin: 0, fontSize: 28, fontWeight: 600, lineHeight: 1.3, color: "rgba(255,255,255,0.85)", textShadow: SH } }, p.note),
        source(p.source)));
  };
  /* Price chart with a dashed reference line (e.g. an offering price). */
  window.OF.RefChart = function (p) {
    var W = 880, H = 520, pad = 30, xs = p.closes.length, vals = p.closes.concat([p.refv]), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    var lo = mn - (mx - mn) * 0.14, hi = mx + (mx - mn) * 0.12;
    function X(i) { return pad + i * (W - 2 * pad) / (xs - 1); } function Y(v) { return pad + (hi - v) * (H - 2 * pad) / (hi - lo); }
    var pts = p.closes.map(function (v, i) { return X(i) + "," + Y(v); }).join(" ");
    return h(OF.Canvas, { format: "post" }, bg(p), handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", padding: "26px 30px 18px" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, color: "#fff" } }, p.symbol),
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 44, color: "var(--down)" } }, p.change)),
          h("span", { style: { fontSize: 22, color: "rgba(255,255,255,0.6)" } }, p.sub),
          h("svg", { width: W - 60, height: H, viewBox: "0 0 " + W + " " + H, style: { display: "block", marginTop: 8 } },
            h("line", { x1: pad, x2: W - pad, y1: Y(p.refv), y2: Y(p.refv), stroke: "#d8ff3c", strokeWidth: 4, strokeDasharray: "14 12" }),
            h("text", { x: pad + 6, y: Y(p.refv) + 40, fill: "#d8ff3c", fontSize: 28, fontWeight: 800, fontFamily: "Montserrat" }, p.refLabel),
            h("polyline", { points: pts, fill: "none", stroke: "rgba(255,255,255,0.9)", strokeWidth: 5, strokeLinejoin: "round", strokeLinecap: "round" }),
            h("circle", { cx: X(0), cy: Y(p.closes[0]), r: 9, fill: "#fff" }),
            h("circle", { cx: X(xs - 1), cy: Y(p.closes[xs - 1]), r: 11, fill: "#ff5c5c" }),
            h("text", { x: X(0) + 16, y: Y(p.closes[0]) + 44, fill: "#fff", fontSize: 30, fontWeight: 700, fontFamily: "Montserrat" }, p.fromLabel),
            h("text", { x: X(xs - 1) - 10, y: Y(p.closes[xs - 1]) - 80, fill: "#ff5c5c", fontSize: 30, fontWeight: 800, textAnchor: "end", fontFamily: "Montserrat" }, p.toLabel)),
          h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 4 } },
            h("span", null, p.startLabel), h("span", null, p.endLabel))),
        source(p.source)));
  };
})();
