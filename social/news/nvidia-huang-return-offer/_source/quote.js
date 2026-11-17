/* Huang offers to return (17 Nov 2026): QuoteCover (photo top, big quote, attribution, context pill). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  window.OF.QuoteCover = function (p) {
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", left: 0, top: 0, width: "100%", height: 860, objectFit: "cover", objectPosition: p.pos || "50% 22%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 18%, rgba(0,0,0,0.15) 38%, rgba(0,0,0,0.92) 58%, #000 70%)" } }),
      h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
        h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%" } }),
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm")),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 20 } },
        h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("div", { style: { fontFamily: "Georgia, serif", fontSize: 120, lineHeight: 0.6, height: 50, color: "var(--accent)" } }, "“"),
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.qsize || 46, lineHeight: 1.18, letterSpacing: "-0.01em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.quote)),
        h("div", { style: { height: 3, width: 140, background: "var(--accent)", borderRadius: 2, marginTop: 6 } }),
        h("p", { style: { margin: 0, fontSize: 26, fontWeight: 700, color: "rgba(255,255,255,0.85)" } }, p.attrib),
        h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 12, padding: "12px 20px", borderRadius: 14, background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.22)", marginTop: 4 } },
          h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "#ff6b6b", flex: "none" } }),
          h("span", { style: { fontSize: 23, fontWeight: 600, color: "rgba(255,255,255,0.92)", lineHeight: 1.3 } }, p.context))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 26, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.5)" } }, p.credit));
  };
})();
