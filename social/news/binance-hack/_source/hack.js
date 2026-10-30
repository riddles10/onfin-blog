/* Breaking-news slides for the Binance hack (OnFin style): HackCover, HackStat, HackList, HackMovers, HackCard (single infographic). */
(function () {
  var h = React.createElement, OF = window.OF;
  var DISP = { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.98, margin: 0 };
  var MONO = { fontFamily: "var(--font-mono)", fontWeight: "var(--weight-label)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" };
  var BOX = { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)" };
  function pill(t, bg, fg) { return h("span", { style: { display: "inline-block", padding: "12px 22px", borderRadius: 999, background: bg, color: fg, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 26, letterSpacing: "0.04em", textTransform: "uppercase", lineHeight: 1 } }, t); }
  function glow() { return h("div", { style: { position: "absolute", inset: 0, background: "radial-gradient(circle at 80% 18%, rgba(255,92,92,0.28) 0%, rgba(255,92,92,0) 45%)" } }); }
  function chrome(p) { return [h(OF.MetaBar, { key: "m", right: p.meta }), h(OF.Signature, { key: "s", handle: p.handle, index: p.index, total: p.total })]; }
  window.OF.HackCover = function (p) {
    return h(OF.Canvas, { format: "post" }, glow(),
      h("div", { style: Object.assign({}, BOX, { top: 210, display: "flex", flexDirection: "column", gap: 30 }) },
        h("div", { style: { display: "flex", gap: 14 } }, pill(p.kicker, "var(--down)", "#fff"), p.asof && pill(p.asof, "rgba(255,255,255,0.1)", "rgba(255,255,255,0.8)")),
        h("p", { style: Object.assign({}, DISP, { fontSize: 280, color: "var(--down)", letterSpacing: "-0.05em", lineHeight: 0.9 }) }, p.big),
        h("p", { style: Object.assign({}, MONO, { margin: "-8px 0 0", fontSize: 24, color: "rgba(255,255,255,0.7)" }) }, p.bigLabel),
        h("h1", { style: Object.assign({}, DISP, { fontSize: 100, color: "#fff", marginTop: 40 }) }, h(OF.Rich, null, p.title)),
        h("p", { style: { margin: 0, fontSize: 40, fontWeight: 600, color: "rgba(255,255,255,0.75)" } }, p.subtitle)),
      chrome(p));
  };
  window.OF.HackStat = function (p) {
    return h(OF.Canvas, { format: "post" }, glow(),
      h("div", { style: Object.assign({}, BOX, { top: 220, display: "flex", flexDirection: "column", gap: 34 }) },
        h(OF.Kicker, { tone: "muted" }, p.kicker),
        p.rows.map(function (r, i) {
          return h("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 8, paddingTop: i ? 50 : 10, borderTop: i ? "var(--hairline) solid var(--line)" : "none" } },
            h("p", { style: Object.assign({}, DISP, { fontSize: 200, color: r.color || "#fff", letterSpacing: "-0.04em" }) }, r.value),
            h("p", { style: { margin: 0, fontSize: 44, fontWeight: 700, color: "#fff", lineHeight: 1.2 } }, r.label),
            r.note && h("p", { style: Object.assign({}, MONO, { margin: 0, fontSize: 19, color: "var(--text-tertiary)" }) }, r.note));
        })),
      chrome(p));
  };
  window.OF.HackList = function (p) {
    return h(OF.Canvas, { format: "post" },
      h("div", { style: Object.assign({}, BOX, { top: 210, display: "flex", flexDirection: "column", gap: 40 }) },
        h(OF.Kicker, { tone: "muted" }, p.kicker),
        h("h2", { style: Object.assign({}, DISP, { fontSize: 100, color: "#fff" }) }, h(OF.Rich, null, p.heading)),
        h("div", { style: { display: "flex", flexDirection: "column", gap: 28 } },
          p.items.map(function (t, i) {
            return h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 26, padding: (p.pad || 40) + "px 36px", borderRadius: 24, background: "rgba(255,255,255,0.06)", border: "var(--hairline) solid var(--line)" } },
              h("span", { style: { flex: "0 0 auto", width: 22, height: 22, borderRadius: 999, background: p.dot || "var(--accent)" } }),
              h("span", { style: { fontSize: 46, fontWeight: 700, color: "#fff", lineHeight: 1.2 } }, t));
          })),
        p.note && h("p", { style: Object.assign({}, MONO, { margin: 0, fontSize: 19, color: "var(--text-tertiary)" }) }, p.note)),
      p.risk && h("p", { style: Object.assign({}, BOX, { bottom: 118, margin: 0, fontSize: 20, color: "var(--text-tertiary)" }) }, p.risk),
      chrome(p));
  };
  window.OF.HackMovers = function (p) {
    return h(OF.Canvas, { format: "post" },
      h("div", { style: Object.assign({}, BOX, { top: 210, display: "flex", flexDirection: "column", gap: 34 }) },
        h(OF.Kicker, { tone: "muted" }, p.kicker),
        h("h2", { style: Object.assign({}, DISP, { fontSize: 100, color: "#fff" }) }, h(OF.Rich, null, p.heading)),
        h("div", { style: { display: "flex", flexDirection: "column" } },
          p.rows.map(function (r, i) {
            return h("div", { key: i, style: { display: "grid", gridTemplateColumns: "1fr auto", alignItems: "center", padding: "48px 0", borderTop: "var(--hairline) solid var(--line)" } },
              h("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                h("span", { style: Object.assign({}, DISP, { fontSize: 80, color: "#fff" }) }, r.sym),
                h("span", { style: Object.assign({}, MONO, { fontSize: 20, color: "var(--text-tertiary)" }) }, r.price)),
              h("span", { style: Object.assign({}, DISP, { fontSize: 120, color: "var(--down)" }) }, r.chg));
          }),
          h("div", { style: { borderTop: "var(--hairline) solid var(--line)" } })),
        h("p", { style: Object.assign({}, MONO, { margin: 0, fontSize: 19, color: "var(--text-tertiary)" }) }, p.note)),
      chrome(p));
  };
  /* Single infographic for Facebook / Telegram */
  window.OF.HackCard = function (p) {
    return h(OF.Canvas, { format: "post" }, glow(),
      h(OF.MetaBar, { right: p.meta }),
      h("div", { style: Object.assign({}, BOX, { top: 140, display: "flex", flexDirection: "column", gap: 18 }) },
        h("div", { style: { display: "flex", gap: 12, flexWrap: "wrap" } }, pill(p.kicker, "var(--down)", "#fff"), pill(p.asof, "rgba(255,255,255,0.1)", "rgba(255,255,255,0.8)")),
        h("h1", { style: Object.assign({}, DISP, { fontSize: p.tsize || 66, color: "#fff" }) }, h(OF.Rich, null, p.title)),
        h("div", { style: { display: "flex", alignItems: "baseline", gap: 22, marginTop: 4, flexWrap: "wrap" } },
          h("span", { style: Object.assign({}, DISP, { fontSize: p.bsize || 170, color: "var(--down)", letterSpacing: "-0.05em", lineHeight: 0.9, whiteSpace: "nowrap" }) }, p.big),
          h("span", { style: { fontSize: 30, fontWeight: 700, color: "rgba(255,255,255,0.85)", lineHeight: 1.2, maxWidth: 420 } }, p.bigLabel)),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 } },
          p.tiles.map(function (t, i) {
            return h("div", { key: i, style: { padding: "20px 22px", borderRadius: 20, background: "rgba(255,255,255,0.06)", border: "var(--hairline) solid var(--line)", display: "flex", flexDirection: "column", gap: 8, minHeight: 124 } },
              h("span", { style: Object.assign({}, DISP, { fontSize: 42, color: t.color || "#fff" }) }, t.value),
              h("span", { style: { fontSize: 24, fontWeight: 600, color: "rgba(255,255,255,0.8)", lineHeight: 1.25 } }, t.label));
          })),
        h("p", { style: { margin: "4px 0 0", fontSize: 25, fontWeight: 700, color: "var(--accent)", lineHeight: 1.3 } }, p.tip),
        h("p", { style: { margin: 0, fontSize: 20, lineHeight: 1.4, color: "var(--text-tertiary)" } }, p.footnote),
        h("p", { style: { margin: "-8px 0 0", fontSize: 19, lineHeight: 1.35, color: "var(--text-tertiary)", opacity: 0.85 } }, p.risk)),
      h(OF.Signature, { handle: p.handle }));
  };
})();
