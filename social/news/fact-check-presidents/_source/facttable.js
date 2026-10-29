/* FactTable: fact-check verdict table in the OnFin carousel style (plain React.createElement, uses window.OF core parts). */
(function () {
  var h = React.createElement, OF = window.OF;
  var MONO = { fontWeight: "var(--weight-label)", fontFamily: "var(--font-mono)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-tertiary)" };
  var PILL = {
    bad: { color: "var(--down)", border: "var(--hairline) solid var(--down)", background: "transparent" },
    ok: { color: "var(--accent)", border: "var(--hairline) solid var(--accent)", background: "transparent" },
    unk: { color: "var(--text-secondary)", border: "var(--hairline) solid var(--text-tertiary)", background: "transparent" },
    yes: { color: "var(--text-on-accent)", border: "var(--hairline) solid var(--accent)", background: "var(--accent)" }
  };
  function pill(text, kind) {
    return h("span", { style: Object.assign({ display: "inline-block", padding: "10px 16px", borderRadius: "var(--radius-pill)", fontWeight: "var(--weight-label)", fontSize: 17, whiteSpace: "nowrap",
      letterSpacing: "var(--tracking-label)", textTransform: "uppercase", lineHeight: 1.15, textAlign: "center" }, PILL[kind]) }, text);
  }
  window.OF.FactTable = function (p) {
    var tpl = "minmax(0,1.15fr) minmax(0,1fr) " + (p.pw || 300) + "px";
    return h(OF.Canvas, { format: "post" },
      h(OF.MetaBar, { right: p.meta }),
      h("div", { style: { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)", top: 165, display: "flex", flexDirection: "column", gap: 30 } },
        h(OF.Kicker, { tone: "muted" }, p.kicker),
        h("h2", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: "var(--weight-display)", letterSpacing: "var(--tracking-display)", lineHeight: "var(--leading-tight)",
          fontSize: p.hsize || 60, whiteSpace: "pre-line", textWrap: "balance" } }, h(OF.Rich, null, p.heading)),
        h("div", { style: { display: "flex", flexDirection: "column" } },
          h("div", { style: { display: "grid", gridTemplateColumns: tpl, gap: 18, paddingBottom: 16 } },
            p.columns.map(function (c, i) { return h("span", { key: i, style: Object.assign({}, MONO, { fontSize: 18, textAlign: i === 2 ? "right" : "left", color: i === 2 ? "var(--accent)" : "var(--text-tertiary)" }) }, c); })),
          p.rows.map(function (r, ri) {
            return h("div", { key: ri, style: { display: "grid", gridTemplateColumns: tpl, gap: 18, alignItems: "center", padding: "16px 0", borderTop: "var(--hairline) solid var(--line)" } },
              h("div", { style: { display: "flex", flexDirection: "column", gap: 6 } },
                h("span", { style: { fontSize: 33, fontWeight: 700, lineHeight: 1.1, color: "var(--text-primary)" } }, r.name),
                h("span", { style: Object.assign({}, MONO, { fontSize: 18 }) }, r.years)),
              h("span", { style: { fontSize: 27, fontWeight: 500, lineHeight: 1.2, color: "var(--text-secondary)" } }, r.claim),
              h("div", { style: { textAlign: "right" } }, pill(r.verdict, r.kind)));
          }),
          h("div", { style: { borderTop: "var(--hairline) solid var(--line)" } })),
        p.footnote && h("p", { style: { margin: 0, fontSize: 22, lineHeight: 1.4, color: "var(--text-tertiary)", textWrap: "pretty" } }, p.footnote),
        p.risk && h("p", { style: { margin: "-12px 0 0", fontSize: 20, lineHeight: 1.35, color: "var(--text-tertiary)", opacity: 0.85 } }, p.risk)),
      h(OF.Signature, { handle: p.handle, index: p.index, total: p.total }));
  };
})();
