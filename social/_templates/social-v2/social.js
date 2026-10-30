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
