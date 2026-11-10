/* Thanksgiving 2026 trading schedule: ScheduleCard in post (1080x1350) or story (1080x1920) format. */
(function () {
  var h = React.createElement, OF = window.OF;
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function day(d, story) {
    return h("div", { style: { borderRadius: 22, background: "#111", border: "1px solid rgba(255,255,255,0.12)", padding: story ? "22px 28px 12px" : "16px 26px 8px" } },
      h("div", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: story ? 36 : 30, color: "var(--accent)", marginBottom: 4 } }, d.title),
      d.rows.map(function (r, i) {
        var closed = r[2];
        return h("div", { key: i, style: { display: "flex", justifyContent: "space-between", alignItems: "center", gap: 18, padding: story ? "13px 0" : "9px 0", borderTop: i ? "1px solid rgba(255,255,255,0.08)" : "none" } },
          h("span", { style: { fontSize: story ? 25 : 22, fontWeight: 600, color: "rgba(255,255,255,0.88)", lineHeight: 1.25 } }, r[0]),
          h("span", { style: { fontFamily: "var(--font-display)", fontSize: story ? 30 : 26, fontWeight: 800, color: closed ? "#ff6b6b" : "#fff", whiteSpace: "nowrap" } }, r[1]));
      }));
  }
  window.OF.ScheduleCard = function (p) {
    var story = p.format === "story";
    return h(OF.Canvas, { format: p.format || "post" },
      h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(120% 80% at 50% 0%, #1b1f12 0%, #0a0a0a 55%, #000 100%)" } }),
      h("div", { style: { position: "absolute", left: 48, top: story ? 120 : 46, display: "flex", alignItems: "center", gap: 14 } },
        h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%" } }),
        h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff" } }, "@onfinkm")),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: story ? 230 : 128, bottom: story ? 300 : 40, display: "flex", flexDirection: "column", gap: story ? 22 : 14 } },
        h("span", { style: { alignSelf: "flex-start", padding: "10px 20px", borderRadius: 999, background: "var(--accent)", color: "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 24 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || (story ? 64 : 52), lineHeight: 1.06, letterSpacing: "-0.02em", color: "#fff", textWrap: "balance" } }, rich(p.headline)),
        h("p", { style: { margin: 0, fontSize: story ? 26 : 22, fontWeight: 600, color: "rgba(255,255,255,0.7)" } }, p.sub),
        p.days.map(function (d, i) { return h("div", { key: i }, day(d, story)); }),
        h("p", { style: { margin: "2px 0 0", fontSize: story ? 21 : 18, lineHeight: 1.35, color: "rgba(255,255,255,0.6)" } }, p.risk)));
  };
})();
