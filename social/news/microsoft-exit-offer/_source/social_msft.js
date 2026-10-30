/* OnFin social carousel v2 (PostHuman-style): full-bleed photo, one hook or one line, small corner handle. */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH, letterSpacing: "0.01em" } }, "@onfinkm"));
  }
  function rich(t) {  /* *word* -> lime accent */
    var parts = String(t).split("*");
    return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; });
  }
  window.OF.SocialSlide = function (p) {
    var cover = !!p.headline;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0," + (p.top || 0.35) + ") 0%, rgba(0,0,0,0) 20%, rgba(0,0,0,0) " + (cover ? 42 : 52) + "%, rgba(0,0,0," + (p.dark || 0.82) + ") 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: p.bottom || 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: p.tagColor || "var(--accent)", color: p.tagText || "var(--text-on-accent)",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24, letterSpacing: "0.02em" } }, p.tag),
        cover
          ? h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 88, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))
          : h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 64, lineHeight: 1.1, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        p.sub && h("p", { style: { margin: 0, fontSize: 32, fontWeight: 600, lineHeight: 1.3, color: "rgba(255,255,255,0.88)", textShadow: SH } }, p.sub),
        p.risk && h("p", { style: { margin: "6px 0 0", fontSize: 18, lineHeight: 1.35, color: "rgba(255,255,255,0.6)" } }, p.risk)),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)", textShadow: SH } }, p.credit));
  };
})();
/* v2.1: evidence-led slides. EvidenceSlide (screenshot card), ChartSlide (real price data), SocialCover with a centre logo cutout. */
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
  window.OF.EvidenceSlide = function (p) {
    return h(OF.Canvas, { format: "post" }, bg(p), handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, overflow: "hidden", background: "#fff", padding: p.cardPad != null ? p.cardPad : 22, boxShadow: "0 24px 60px rgba(0,0,0,0.55)", transform: p.tilt ? "rotate(" + p.tilt + "deg)" : "none", maxHeight: p.maxh || 760 } },
          h("img", { src: p.shot, style: { display: "block", width: "100%", height: "auto" } })),
        source(p.source)));
  };
  window.OF.ChartSlide = function (p) {
    var W = 880, H = 520, pad = 30, xs = p.closes.length, mn = Math.min.apply(null, p.closes), mx = Math.max.apply(null, p.closes);
    var lo = mn - (mx - mn) * 0.12, hi = mx + (mx - mn) * 0.12;
    function X(i) { return pad + i * (W - 2 * pad) / (xs - 1); } function Y(v) { return pad + (hi - v) * (H - 2 * pad) / (hi - lo); }
    var pts = p.closes.map(function (v, i) { return X(i) + "," + Y(v); });
    var main = pts.slice(0, xs - 1).join(" "), last = pts.slice(xs - 2).join(" ");
    return h(OF.Canvas, { format: "post" }, bg(p), handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", padding: "26px 30px 18px" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, color: "#fff" } }, p.symbol),
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 44, color: "var(--down)" } }, p.change)),
          h("span", { style: { fontSize: 22, color: "rgba(255,255,255,0.6)" } }, p.sub),
          h("svg", { width: W - 60, height: H, viewBox: "0 0 " + W + " " + H, style: { display: "block", marginTop: 8 } },
            h("polyline", { points: main, fill: "none", stroke: "rgba(255,255,255,0.85)", strokeWidth: 5, strokeLinejoin: "round", strokeLinecap: "round" }),
            h("polyline", { points: last, fill: "none", stroke: "#ff5c5c", strokeWidth: 7, strokeLinecap: "round" }),
            h("circle", { cx: X(xs - 2), cy: Y(p.closes[xs - 2]), r: 9, fill: "#fff" }),
            h("circle", { cx: X(xs - 1), cy: Y(p.closes[xs - 1]), r: 11, fill: "#ff5c5c" }),
            h("text", { x: X(xs - 2) - 14, y: Y(p.closes[xs - 2]) - 22, fill: "#fff", fontSize: 30, fontWeight: 700, textAnchor: "end", fontFamily: "Montserrat" }, p.fromLabel),
            h("text", { x: X(xs - 1) - 14, y: Y(p.closes[xs - 1]) + 46, fill: "#ff5c5c", fontSize: 30, fontWeight: 800, textAnchor: "end", fontFamily: "Montserrat" }, p.toLabel)),
          h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 4 } },
            h("span", null, p.startLabel), h("span", null, p.endLabel))),
        source(p.source)));
  };
  window.OF.SocialCover = function (p) {
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.05) 22%, rgba(0,0,0,0.1) 48%, rgba(0,0,0,0.88) 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: "50%", top: p.cy || 420, transform: "translate(-50%,-50%)", zIndex: 2 } },
        h("div", { style: { width: p.cd || 300, height: p.cd || 300, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          border: "10px solid #fff", boxShadow: "0 0 0 8px rgba(255,92,92,0.95), 0 30px 70px rgba(0,0,0,0.55)" } },
          h("img", { src: p.logo, style: { width: "62%", height: "62%", objectFit: "contain" } })),
        p.badge && h("span", { style: { position: "absolute", right: -70, bottom: -6, padding: "14px 24px", borderRadius: 999, background: p.badgeBg || "var(--down)", color: p.badgeFg || "#fff",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 46, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 86, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)" } }, p.credit));
  };
})();
