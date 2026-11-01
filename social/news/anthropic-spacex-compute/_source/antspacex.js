/* Anthropic x SpaceX compute deal: DuoCover (photo + two logo circles + badge) and HBarSlide (sourced horizontal bars). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  function circle(src, d, imgw) {
    return h("div", { style: { width: d, height: d, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
      border: "8px solid #fff", boxShadow: "0 0 0 7px var(--accent), 0 26px 60px rgba(0,0,0,0.55)" } },
      h("img", { src: src, style: { width: imgw || "62%", height: "62%", objectFit: "contain" } }));
  }
  window.OF.DuoCover = function (p) {
    var d = p.cd || 250;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.08) 24%, rgba(0,0,0,0.12) 48%, rgba(0,0,0,0.9) 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: "50%", top: p.cy || 470, transform: "translate(-50%,-50%)", zIndex: 2, display: "flex", alignItems: "center", gap: 34 } },
        circle(p.logoA, d), circle(p.logoB, d, "78%"),
        p.badge && h("span", { style: { position: "absolute", left: "50%", bottom: -58, transform: "translateX(-50%)", padding: "14px 28px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 48, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 82, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline))),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)" } }, p.credit));
  };
  /* rows: [{label, note, value (number), text, hi}] */
  window.OF.HBarSlide = function (p) {
    var mx = Math.max.apply(null, p.rows.map(function (r) { return r.value; })) * 1.02;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.bg, style: { position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", objectPosition: p.bgpos || "50% 50%", filter: "blur(26px) brightness(0.45) saturate(1.1)" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.55))" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 150, bottom: 70, zIndex: 2, display: "flex", flexDirection: "column", gap: 30, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 60, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", padding: "28px 32px 26px", display: "flex", flexDirection: "column", gap: 24 } },
          h("div", null,
            h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 34, color: "#fff" } }, p.title),
            p.sub && h("div", { style: { fontSize: 22, color: "rgba(255,255,255,0.6)", marginTop: 4 } }, p.sub)),
          p.rows.map(function (r, i) {
            return h("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 8 } },
              h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 16 } },
                h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 28, color: r.hi ? "var(--accent)" : "#fff" } }, r.label,
                  r.note && h("span", { style: { fontWeight: 500, fontSize: 21, color: "rgba(255,255,255,0.55)", marginLeft: 10 } }, r.note)),
                h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 32, color: r.hi ? "var(--accent)" : "#fff", whiteSpace: "nowrap" } }, r.text)),
              h("div", { style: { height: 26, borderRadius: 13, background: "rgba(255,255,255,0.08)" } },
                h("div", { style: { width: (r.value / mx * 100) + "%", height: "100%", borderRadius: 13, background: r.hi ? "var(--accent)" : "rgba(255,255,255,0.55)" } })));
          }),
          p.foot && h("div", { style: { fontSize: 21, color: "rgba(255,255,255,0.6)", lineHeight: 1.35 } }, p.foot)),
        h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
          h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
          h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, p.source))));
  };
})();
