/* Google AI summaries carousel: GCover = SocialCover with a movable logo circle (cx, cy) and badge side. */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  window.OF.GCover = function (p) {
    var cd = p.cd || 280;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.42) 0%, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.9) 100%)" } }),
      h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
        h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm")),
      h("div", { style: { position: "absolute", left: p.cx || 540, top: p.cy || 420, transform: "translate(-50%,-50%)", zIndex: 2 } },
        h("div", { style: { width: cd, height: cd, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          border: "10px solid #fff", boxShadow: "0 0 0 8px rgba(255,92,92,0.95), 0 30px 70px rgba(0,0,0,0.55)" } },
          h("img", { src: p.logo, style: { width: "62%", height: "62%", objectFit: "contain" } })),
        p.badge && h("span", { style: Object.assign({ position: "absolute", bottom: -10, padding: "12px 24px", borderRadius: 999, background: "var(--down)", color: "#fff",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 44, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" }, p.badgeLeft ? { left: -60 } : { right: -60 }) }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 84, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.6)" } }, p.credit));
  };
})();
