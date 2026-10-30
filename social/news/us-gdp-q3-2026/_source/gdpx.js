/* GDP and Nvidia fork extras: CoverX (cover with configurable circle position, ring and badge colours, filled logo) and VideoFrame (slide frame with a box for a composited clip). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  function source(t) {
    return h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
      h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
      h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, t));
  }
  window.OF.CoverX = function (p) {
    var ring = p.ring || "rgba(255,92,92,0.95)";
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: p.photoStyle || { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 22%, rgba(0,0,0,0.1) 48%, rgba(0,0,0,0.88) 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: p.cx || "50%", top: p.cy || 420, transform: "translate(-50%,-50%)", zIndex: 2 } },
        h("div", { style: { width: p.cd || 300, height: p.cd || 300, borderRadius: "50%", background: p.circleBg || "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          border: "10px solid #fff", boxShadow: "0 0 0 8px " + ring + ", 0 30px 70px rgba(0,0,0,0.55)" } },
          h("img", { src: p.logo, style: p.logoFill ? { width: "100%", height: "100%", objectFit: "cover", objectPosition: p.logoPos || "50% 50%" } : { width: "62%", height: "62%", objectFit: "contain" } })),
        p.badge && h("span", { style: { position: "absolute", right: p.badgeRight != null ? p.badgeRight : -70, bottom: -6, padding: "14px 24px", borderRadius: 999, background: p.badgeBg || "var(--down)", color: p.badgeColor || "#fff",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 46, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 86, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)" } }, p.credit));
  };
  /* VideoFrame: line at top, a transparent box (left 60, top boxTop, 960 x boxH) for ffmpeg to composite a clip into, source pill below. Rendered with a magenta key box. */
  window.OF.VideoFrame = function (p) {
    var top = p.boxTop || 430, bh = p.boxH || 540;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.bg, style: { position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", objectPosition: p.bgpos || "50% 50%", filter: "blur(26px) brightness(0.45) saturate(1.1)" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))" } }),
      handle(p),
      h("p", { style: { position: "absolute", left: 60, right: 60, bottom: 1350 - top + 34, margin: 0, zIndex: 2, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
      h("div", { style: { position: "absolute", left: 60, top: top, width: 960, height: bh, borderRadius: 26, background: p.key || "#ff00ff", boxShadow: "0 24px 60px rgba(0,0,0,0.55)" } }),
      h("div", { style: { position: "absolute", left: 60, top: top + bh + 30, zIndex: 2 } }, source(p.source)));
  };
})();
/* BarSlide: real data bars (values array, labels array), last bar in lime with its value, source pill. */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  window.OF.BarSlide = function (p) {
    var W = 900, H = 470, n = p.values.length, mx = Math.max.apply(null, p.values) * 1.18, bw = 96, gap = (W - n * bw) / (n + 1);
    var bars = p.values.map(function (v, i) {
      var x = gap + i * (bw + gap), bh = v / mx * (H - 60), y = H - bh, last = i === n - 1;
      return h("g", { key: i },
        h("rect", { x: x, y: y, width: bw, height: Math.max(bh, 4), rx: 10, fill: last ? "var(--accent)" : "rgba(255,255,255,0.55)" }),
        h("text", { x: x + bw / 2, y: y - 16, fill: last ? "var(--accent)" : "#fff", fontSize: last ? 44 : 34, fontWeight: 800, textAnchor: "middle", fontFamily: "Montserrat" }, p.fmt[i]));
    });
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.bg, style: { position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", objectPosition: p.bgpos || "50% 50%", filter: "blur(26px) brightness(0.45) saturate(1.1)" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))" } }),
      h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
        h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm")),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", padding: "26px 30px 20px" } },
          h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "#fff" } }, p.title),
          h("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.6)", marginTop: 4 } }, p.sub),
          h("svg", { width: W, height: H + 10, viewBox: "0 -10 " + W + " " + (H + 10), style: { display: "block", marginTop: 14 } },
            h("line", { x1: 0, x2: W, y1: H, y2: H, stroke: "rgba(255,255,255,0.3)", strokeWidth: 2 }), bars),
          h("div", { style: { display: "flex", justifyContent: "space-around", fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.75)", marginTop: 10 } },
            p.labels.map(function (s, i) { return h("span", { key: i, style: { width: bw, textAlign: "center" } }, s); }))),
        h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
          h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
          h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, p.source))));
  };
})();
