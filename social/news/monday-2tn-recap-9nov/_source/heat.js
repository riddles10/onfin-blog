/* Monday 9 Nov 2026 recap: HeatCover (headline + verdict + grid heatmap of big US stocks with one big highlighted tile). */
(function () {
  var h = React.createElement, OF = window.OF;
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function col(v) {
    var a = Math.min(1, Math.abs(v) / 6);
    return v >= 0 ? "rgba(" + Math.round(20 + 10 * (1 - a)) + "," + Math.round(110 + 70 * a) + "," + Math.round(60 + 20 * a) + ",1)" : "rgba(" + Math.round(150 + 80 * a) + ",50,55,1)";
  }
  window.OF.HeatCover = function (p) {
    var cols = 5, gw = 600, cell = gw / cols, tiles = p.tiles, rows = Math.ceil(tiles.length / cols), gh = rows * cell;
    return h(OF.Canvas, { format: "post" },
      h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 0%, #1b1f12 0%, #0a0a0a 55%, #000 100%)" } }),
      h("div", { style: { position: "absolute", left: 48, top: 46, display: "flex", alignItems: "center", gap: 14 } },
        h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%" } }),
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff" } }, "@onfinkm")),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 132, display: "flex", flexDirection: "column", gap: 16 } },
        h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 56, lineHeight: 1.06, letterSpacing: "-0.02em", color: "#fff", textWrap: "balance" } }, rich(p.headline)),
        h("div", { style: { alignSelf: "flex-start", padding: "12px 22px", borderRadius: 16, background: "rgba(216,255,60,0.12)", border: "2px solid var(--accent)", fontSize: 25, fontWeight: 700, color: "#fff", lineHeight: 1.3 } },
          h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, color: "var(--accent)", marginRight: 10 } }, p.verdictLabel), p.verdict)),
      h("div", { style: { position: "absolute", left: 60, top: p.gridTop || 470, display: "flex", gap: 12 } },
        h("div", { style: { width: gw, height: gh, display: "grid", gridTemplateColumns: "repeat(" + cols + ", 1fr)", gap: 4 } },
          tiles.map(function (t, i) {
            return h("div", { key: i, style: { background: col(t[1]), borderRadius: 6, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#fff" } },
              h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, t[0]),
              h("span", { style: { fontSize: 20, fontWeight: 700, opacity: 0.92 } }, (t[1] >= 0 ? "+" : "") + t[1].toFixed(2).replace(".", p.dec || ".") + "%"));
          })),
        h("div", { style: { width: 1080 - 120 - gw - 12, height: gh, background: "#d9363e", borderRadius: 10, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 18, color: "#fff" } },
          h("div", { style: { width: 150, height: 150, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center" } },
            h("img", { src: p.bigLogo, style: { width: "78%", height: "60%", objectFit: "contain" } })),
          h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 48 } }, p.bigSym),
          h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 64 } }, p.bigMove),
          h("span", { style: { fontSize: 22, fontWeight: 600, opacity: 0.9, textAlign: "center", padding: "0 18px", lineHeight: 1.3 } }, p.bigNote))),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 40, fontSize: 19, color: "rgba(255,255,255,0.55)", lineHeight: 1.35 } }, p.foot));
  };
})();
