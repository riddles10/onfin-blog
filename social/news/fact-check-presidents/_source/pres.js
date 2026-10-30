/* Photo-led fact-check slides (OnFin carousel style): PresCover, PresSlide, PresVs, PresGrid. Plain React.createElement on window.OF core parts. */
(function () {
  var h = React.createElement, OF = window.OF;
  var DISP = { fontFamily: "var(--font-display)", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 0.95, textTransform: "uppercase", margin: 0 };
  var MONO = { fontFamily: "var(--font-mono)", fontWeight: "var(--weight-label)", letterSpacing: "var(--tracking-label)", textTransform: "uppercase" };
  var V = {
    bad: { color: "#fff", background: "var(--down)", border: "3px solid var(--down)" },
    ok: { color: "var(--text-on-accent)", background: "var(--accent)", border: "3px solid var(--accent)" },
    unk: { color: "#fff", background: "rgba(255,255,255,0.12)", border: "3px solid rgba(255,255,255,0.7)" },
    yes: { color: "var(--text-on-accent)", background: "var(--accent)", border: "3px solid var(--accent)" }
  };
  function stamp(text, kind, size) {
    return h("span", { style: Object.assign({ display: "inline-block", padding: (size || 40) * 0.32 + "px " + (size || 40) * 0.6 + "px", borderRadius: 14, fontFamily: "var(--font-display)",
      fontWeight: 800, fontSize: size || 40, letterSpacing: "0.02em", textTransform: "uppercase", lineHeight: 1, whiteSpace: "nowrap" }, V[kind]) }, text);
  }
  function photo(src, pos, fade, shift) {
    var sh = shift || 0;
    return [
      h("img", { key: "i", src: src, style: { position: "absolute", left: 0, top: -sh, width: "100%", height: "calc(100% + " + sh + "px)", objectFit: "cover", objectPosition: pos || "50% 20%" } }),
      h("div", { key: "g", style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0) 18%, rgba(10,10,10,0) " + (fade || 38) + "%, rgba(10,10,10,0.92) " + ((fade || 38) + 24) + "%, #0a0a0a 100%)" } })
    ];
  }
  function chrome(p) {
    return [h("div", { key: "m", style: { position: "absolute", inset: 0, zIndex: 3 } }, h(OF.MetaBar, { right: p.meta })),
            h("div", { key: "s", style: { position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" } }, h(OF.Signature, { handle: p.handle, index: p.index, total: p.total }))];
  }
  window.OF.PresSlide = function (p) {
    return h(OF.Canvas, { format: "post" },
      photo(p.photo, p.pos, p.fade, p.shift),
      h("div", { style: { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)", bottom: 150, zIndex: 2, display: "flex", flexDirection: "column", gap: 18 } },
        h("p", { style: Object.assign({}, MONO, { margin: 0, fontSize: 24, color: "rgba(255,255,255,0.75)" }) }, p.claimLabel + ": ", h("span", { style: { color: "#fff" } }, p.claim)),
        h("h2", { style: Object.assign({}, DISP, { fontSize: p.nsize || 104, color: "#fff" }) }, p.name),
        h("p", { style: Object.assign({}, DISP, { fontSize: 46, color: "var(--accent)", letterSpacing: "0" }) }, p.years),
        h("div", { style: { display: "flex", alignItems: "center", gap: 22, marginTop: 10, flexWrap: "wrap" } },
          stamp(p.verdict, p.kind, 44),
          p.big && h("span", { style: Object.assign({}, DISP, { fontSize: 64, color: "#fff" }) }, p.big)),
        h("p", { style: { margin: 0, fontSize: 34, fontWeight: 600, lineHeight: 1.25, color: "rgba(255,255,255,0.92)", maxWidth: 900 } }, p.line),
        p.source && h("p", { style: Object.assign({}, MONO, { margin: "6px 0 0", fontSize: 17, color: "rgba(255,255,255,0.55)" }) }, p.source)),
      chrome(p));
  };
  window.OF.PresCover = function (p) {
    var n = p.photos.length;
    return h(OF.Canvas, { format: "post" },
      h("div", { style: { position: "absolute", left: 0, right: 0, top: 0, height: 700, display: "flex" } },
        p.photos.map(function (s, i) {
          return h("div", { key: i, style: { flex: 1, position: "relative", overflow: "hidden", borderRight: i < n - 1 ? "3px solid #0a0a0a" : "none" } },
            h("img", { src: s.src, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: s.pos || "50% 15%" } }));
        })),
      h("div", { style: { position: "absolute", left: 0, right: 0, top: 0, height: 700, background: "linear-gradient(180deg, rgba(10,10,10,0.75) 0%, rgba(10,10,10,0) 20%, rgba(10,10,10,0) 60%, #0a0a0a 100%)" } }),
      h("div", { style: { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)", top: 610, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        h("div", null, stamp(p.kicker, "yes", 30)),
        h("h1", { style: Object.assign({}, DISP, { fontSize: 100, color: "#fff" }) }, h(OF.Rich, null, p.title)),
        h("p", { style: { margin: 0, fontSize: 36, fontWeight: 600, lineHeight: 1.25, color: "rgba(255,255,255,0.85)" } }, p.subtitle)),
      chrome(p));
  };
  window.OF.PresVs = function (p) {
    var max = Math.max.apply(null, p.bars.map(function (b) { return b.value; }));
    return h(OF.Canvas, { format: "post" },
      h("div", { style: { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)", top: 200, display: "flex", flexDirection: "column", gap: 40 } },
        h("h2", { style: Object.assign({}, DISP, { fontSize: 96, color: "#fff" }) }, h(OF.Rich, null, p.heading)),
        h("div", { style: { display: "flex", flexDirection: "column", gap: 34, marginTop: 20 } },
          p.bars.map(function (b, i) {
            return h("div", { key: i, style: { display: "flex", flexDirection: "column", gap: 12 } },
              h("div", { style: { display: "flex", alignItems: "center", gap: 20 } },
                b.photo && h("img", { src: b.photo, style: { width: 84, height: 84, borderRadius: "50%", objectFit: "cover", objectPosition: "50% 18%", border: "3px solid " + (b.hi ? "var(--accent)" : "rgba(255,255,255,0.4)") } }),
                h("span", { style: { fontSize: 34, fontWeight: 700, color: "#fff" } }, b.label)),
              h("div", { style: { display: "flex", alignItems: "center", gap: 22 } },
                h("div", { style: { height: 64, width: (b.value / max * 640) + "px", borderRadius: 12, background: b.hi ? "var(--accent)" : "rgba(255,255,255,0.28)" } }),
                h("span", { style: Object.assign({}, DISP, { fontSize: 64, color: b.hi ? "var(--accent)" : "#fff" }) }, b.text)));
          })),
        h("p", { style: Object.assign({}, MONO, { margin: "10px 0 0", fontSize: 19, color: "var(--text-tertiary)" }) }, p.source),
        h("p", { style: { margin: "30px 0 0", fontSize: 34, fontWeight: 700, color: "#fff" } }, p.cta)),
      p.risk && h("p", { style: { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)", bottom: 120, margin: 0, fontSize: 20, color: "var(--text-tertiary)" } }, p.risk),
      chrome(p));
  };
  /* Single-image infographic: title + 2x3 grid of portrait tiles with verdict stamps. */
  window.OF.PresGrid = function (p) {
    return h(OF.Canvas, { format: "post" },
      h(OF.MetaBar, { right: p.meta }),
      h("div", { style: { position: "absolute", left: "var(--margin-canvas)", right: "var(--margin-canvas)", top: 140, display: "flex", flexDirection: "column", gap: 22 } },
        h("h2", { style: Object.assign({}, DISP, { fontSize: p.tsize || 60, color: "#fff" }) }, h(OF.Rich, null, p.title)),
        h("div", { style: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14 } },
          p.tiles.map(function (t, i) {
            return h("div", { key: i, style: { position: "relative", height: p.th || 350, borderRadius: 18, overflow: "hidden", background: "#151515" } },
              h("img", { src: t.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: t.pos || "50% 15%" } }),
              h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(10,10,10,0) 30%, rgba(10,10,10,0.95) 72%)" } }),
              h("div", { style: { position: "absolute", left: 16, right: 12, bottom: 16, display: "flex", flexDirection: "column", gap: 6 } },
                h("span", { style: Object.assign({}, DISP, { fontSize: 32, color: "#fff" }) }, t.name),
                h("span", { style: Object.assign({}, MONO, { fontSize: 15, color: "var(--accent)" }) }, t.years),
                h("span", { style: { fontSize: 19, fontWeight: 600, color: "rgba(255,255,255,0.8)", } }, t.claim),
                h("div", { style: { marginTop: 4 } }, stamp(t.verdict, t.kind, t.vsize || 21))));
          })),
        h("p", { style: { margin: 0, fontSize: 21, lineHeight: 1.4, color: "var(--text-tertiary)" } }, p.footnote),
        p.risk && h("p", { style: { margin: "-10px 0 0", fontSize: 19, lineHeight: 1.35, color: "var(--text-tertiary)", opacity: 0.85 } }, p.risk)),
      h(OF.Signature, { handle: p.handle }));
  };
})();
