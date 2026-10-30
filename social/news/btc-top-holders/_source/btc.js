/* BTC top holders: BtcCover (photo + bitcoin circle + badge) and HolderSlide (rank, holder image, amount, evidence card). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  var ORANGE = "#f7931a";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  function source(t) {
    return h("div", { style: { alignSelf: "center", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
      h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
      h("span", { style: { fontSize: 21, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, t));
  }
  window.OF.BtcCover = function (p) {
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 50%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.1) 22%, rgba(0,0,0,0.15) 45%, rgba(0,0,0,0.9) 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: p.cx || "50%", top: p.cy || 420, transform: "translate(-50%,-50%)", zIndex: 2 } },
        h("div", { style: { width: p.cd || 300, height: p.cd || 300, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          border: "10px solid #fff", boxShadow: "0 0 0 8px " + ORANGE + ", 0 30px 70px rgba(0,0,0,0.55)" } },
          h("img", { src: p.logo, style: { width: "78%", height: "78%", objectFit: "contain" } })),
        p.badge && h("span", { style: { position: "absolute", right: -80, bottom: -6, padding: "14px 26px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 46, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 86, zIndex: 2, display: "flex", flexDirection: "column", gap: 20 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 86, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline)),
        p.sub && h("p", { style: { margin: 0, fontSize: 27, fontWeight: 600, lineHeight: 1.3, color: "rgba(255,255,255,0.85)", textShadow: SH } }, p.sub)),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 28, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)" } }, p.credit));
  };
  window.OF.HolderSlide = function (p) {
    var circle = p.mode === "logo"
      ? h("div", { style: { width: 320, height: 320, borderRadius: "50%", background: p.circleBg || "#fff", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
          boxShadow: "0 0 0 8px " + ORANGE + ", 0 26px 60px rgba(0,0,0,0.6)" } },
          h("img", { src: p.img, style: { width: (p.logoPct || 66) + "%", height: (p.logoPct || 66) + "%", objectFit: "contain" } }))
      : h("div", { style: { width: 320, height: 320, borderRadius: "50%", overflow: "hidden", boxShadow: "0 0 0 8px " + ORANGE + ", 0 26px 60px rgba(0,0,0,0.6)", background: "#222" } },
          h("img", { src: p.img, style: { width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 30%" } }));
    return h(OF.Canvas, { format: "post" },
      h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 70% at 50% 18%, #3a2508 0%, #15100a 45%, #0a0a0a 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", right: 56, top: 30, zIndex: 3, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 104, lineHeight: 1, color: "#fff", letterSpacing: "-0.03em" } },
        h("span", { style: { color: "var(--accent)", fontSize: 64, verticalAlign: "top", marginRight: 4 } }, "#"), p.rank),
      h("div", { style: { position: "absolute", left: 0, right: 0, top: 120, display: "flex", justifyContent: "center", zIndex: 2 } }, circle),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 476, bottom: 64, zIndex: 2, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 } },
        h("span", { style: { padding: "8px 18px", borderRadius: 999, background: "rgba(247,147,26,0.18)", border: "1px solid rgba(247,147,26,0.6)", color: "#ffc46b", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 22, letterSpacing: "0.02em" } }, p.type),
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.nsize || 54, lineHeight: 1.06, color: "#fff", textAlign: "center", textWrap: "balance" } }, p.name),
        h("p", { style: { margin: "2px 0 0", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.bsize || 84, lineHeight: 1, color: "var(--accent)", letterSpacing: "-0.02em", whiteSpace: "nowrap" } }, p.btc),
        h("p", { style: { margin: 0, fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.92)" } }, p.usd),
        h("p", { style: { margin: "-6px 0 4px", fontSize: 19, fontWeight: 500, color: "rgba(255,255,255,0.55)" } }, p.price),
        h("div", { style: { flex: "0 1 auto", width: p.evw || 820, borderRadius: 22, overflow: "hidden", background: "#fff", padding: p.cardPad != null ? p.cardPad : 14, boxShadow: "0 20px 50px rgba(0,0,0,0.55)", maxHeight: p.maxh || 330 } },
          h("img", { src: p.shot, style: { display: "block", width: "100%", height: "auto" } })),
        source(p.source)),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 22, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.5)" } }, p.credit));
  };
})();
