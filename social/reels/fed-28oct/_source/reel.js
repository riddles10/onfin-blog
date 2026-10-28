/* Market recap reel: Fed holds, 28 Oct 2026. Time-driven: window.setT(seconds) renders one frame. */
var h = React.createElement, OF = window.OF;
var DUR = 25.5;
var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
var ease = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
var p = function (t, s, d) { return ease((t - s) / (d || 0.55)); };

/* blur-in rise, the library's of-rise entrance */
function rise(t, s, extra) {
  var k = p(t, s);
  return Object.assign({ opacity: k, transform: "translateY(" + (1 - k) * 32 + "px)", filter: "blur(" + (1 - k) * 8 + "px)" }, extra);
}
/* scene visibility: fades the whole scene out over its last 0.3s */
function scene(t, s, e, kids) {
  if (t < s - 0.01 || t > e + 0.01) return null;
  var out = clamp((e - t) / 0.3);
  return h("div", { style: { position: "absolute", left: 88, right: 150, top: 330, bottom: 600, opacity: out } }, kids);
}
function accent(parts, size) {
  return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; });
}
var title = function (size) { return { fontSize: size, fontWeight: 700, letterSpacing: "var(--tracking-display)", lineHeight: 1.02, margin: 0 }; };
var label = { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 24, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-tertiary)" };

function S1(t) {
  return scene(t, 0, 4.62, [
    h("div", { key: "k", style: rise(t, 0.05) }, h(OF.Kicker, { live: true, size: 24 }, "Market recap · 28 Oct")),
    h("h1", { key: "t", style: rise(t, 0.15, Object.assign(title(124), { marginTop: 56 })) }, accent(["The Fed ", "held", " rates."])),
    h("div", { key: "n", style: rise(t, 1.95, { marginTop: 120 }) }, [
      h("div", { key: "l", style: label }, "Fed funds target range"),
      h("div", { key: "v", style: { fontSize: 128, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 28, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" } }, "3.75% to 4%"),
      h("span", { key: "c", style: rise(t, 3.0, { display: "inline-flex", alignItems: "center", gap: 14, marginTop: 40, padding: "16px 30px", borderRadius: 100, background: "var(--surface-2)", border: "1.5px solid var(--line-strong)", fontSize: 32, fontWeight: 600 }) }, [
        h("span", { key: "a", style: { color: "var(--text-tertiary)" } }, "→"), "No change"])
    ])
  ]);
}

function S2(t) {
  var dots = [];
  for (var i = 0; i < 12; i++) {
    var hike = i >= 10, appear = p(t, 5.9 + i * 0.05, 0.35), lit = hike ? p(t, 6.9 + (i - 10) * 0.25, 0.3) : 0;
    dots.push(h("div", { key: i, style: { width: 150, height: 75, borderRadius: 75, boxSizing: "border-box", opacity: appear, transform: "scale(" + (0.6 + 0.4 * appear) + ")",
      background: lit ? "rgb(159 206 16 / " + lit + ")" : "var(--surface-2)", border: "1.5px solid " + (lit > 0.5 ? "var(--accent)" : "var(--line-strong)"),
      boxShadow: lit ? "0 0 " + 40 * lit + "px var(--accent-glow)" : "none" } }));
  }
  return scene(t, 4.62, 9.0, [
    h("div", { key: "k", style: rise(t, 4.7) }, h(OF.Kicker, { size: 24 }, "The vote")),
    h("h1", { key: "t", style: rise(t, 4.8, Object.assign(title(112), { marginTop: 56 })) }, accent(["But it wasn't ", "unanimous", "."])),
    h("div", { key: "g", style: { display: "grid", gridTemplateColumns: "repeat(4, 150px)", gap: 28, marginTop: 90 } }, dots),
    h("div", { key: "lg", style: rise(t, 7.2, { display: "flex", flexDirection: "column", gap: 22, marginTop: 70, fontSize: 34, fontWeight: 500 }) }, [
      h("div", { key: "a", style: { display: "flex", alignItems: "center", gap: 20 } }, [h("span", { key: "d", style: { width: 56, height: 28, borderRadius: 28, background: "var(--accent)" } }), h("span", { key: "x" }, "2 voted to hike 0.25 pt")]),
      h("div", { key: "b", style: { display: "flex", alignItems: "center", gap: 20, color: "var(--text-secondary)" } }, [h("span", { key: "d", style: { width: 56, height: 28, borderRadius: 28, background: "var(--surface-2)", border: "1.5px solid var(--line-strong)", boxSizing: "border-box" } }), h("span", { key: "x" }, "10 voted to hold")])
    ])
  ]);
}

function S3(t) {
  var row = function (k, s, when, what, up) {
    return h("div", { key: k, style: rise(t, s, { display: "flex", alignItems: "baseline", gap: 40, padding: "30px 0", borderTop: "1.5px solid var(--line)" }) }, [
      h("span", { key: "w", style: Object.assign({}, label, { width: 230, flex: "none" }) }, when),
      h("span", { key: "x", style: { fontSize: 44, fontWeight: 600, letterSpacing: "var(--tracking-title)" } }, [up ? h("span", { key: "u", style: { color: "var(--up)", marginRight: 16 } }, "↑") : null, what])
    ]);
  };
  return scene(t, 9.0, 14.25, [
    h("div", { key: "k", style: rise(t, 9.1) }, h(OF.Kicker, { size: 24 }, "Fed statement")),
    h("h1", { key: "q", style: rise(t, 9.25, Object.assign(title(104), { marginTop: 56 })) }, accent(["“Inflation remains ", "elevated", ".”"])),
    h("div", { key: "src", style: rise(t, 9.6, Object.assign({}, label, { marginTop: 36, fontSize: 22 })) }, "Source: Federal Reserve, 28 Oct"),
    h("div", { key: "tl", style: { marginTop: 100 } }, [
      row("a", 12.2, "Sep 2026", "Rates raised 0.25 pt", true),
      row("b", 12.9, "Oct 2026", "Held at 3.75% to 4%", false)
    ])
  ]);
}

function S4(t) {
  var card = function (k, s, e, day, what, time) {
    var on = t >= s && t < e;
    return h("div", { key: k, style: rise(t, s, { display: "flex", alignItems: "center", gap: 36, padding: "34px 40px", marginTop: 26, borderRadius: "var(--radius-l)",
      background: "var(--surface-glass)", border: "1.5px solid " + (on ? "var(--accent)" : "var(--line)"), boxShadow: on ? "0 0 48px var(--accent-soft)" : "none" }) }, [
      h("div", { key: "d", style: Object.assign({}, label, { width: 150, flex: "none", color: on ? "var(--accent)" : "var(--text-tertiary)", lineHeight: 1.5 }) }, day),
      h("div", { key: "w", style: { flex: 1, fontSize: 42, fontWeight: 600, letterSpacing: "var(--tracking-title)", lineHeight: 1.1 } }, what),
      h("div", { key: "t", style: { fontSize: 28, fontWeight: 500, color: "var(--text-secondary)", fontVariantNumeric: "tabular-nums" } }, time)
    ]);
  };
  return scene(t, 14.25, 22.45, [
    h("div", { key: "k", style: rise(t, 14.3) }, h(OF.Kicker, { size: 24 }, "Next up")),
    h("h1", { key: "t", style: rise(t, 14.4, Object.assign(title(104), { marginTop: 56, marginBottom: 50 })) }, accent(["Three dates to ", "watch", "."])),
    card("a", 15.1, 17.5, ["Fri", h("br", { key: "b" }), "6 Nov"], "US jobs report (NFP)", "13:30 UTC"),
    card("b", 17.5, 19.45, ["Tue", h("br", { key: "b" }), "10 Nov"], "US CPI inflation", "13:30 UTC"),
    card("c", 19.45, 22.45, ["Wed", h("br", { key: "b" }), "9 Dec"], "Fed rate decision", "19:00 UTC")
  ]);
}

function S5(t) {
  if (t < 22.4) return null;
  return h("div", { key: "o", style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 200 } }, [
    h("div", { key: "k", style: rise(t, 22.5) }, h(OF.Kicker, { size: 24 }, "Follow for more")),
    h("div", { key: "w", style: rise(t, 22.6) }, h(OF.Wordmark, { size: 120 })),
    h("div", { key: "l", style: { width: 360 * p(t, 22.9, 0.7), height: 1.5, background: "var(--line-strong)" } }),
    h("div", { key: "hd", style: rise(t, 23.1, { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 30, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent)" }) }, "@onfin.io"),
    h("div", { key: "d", style: rise(t, 23.4, { position: "absolute", left: 88, right: 150, bottom: 470 }) },
      h(OF.Disclaimer, { kind: "both", size: 22, text: "Source: Federal Reserve FOMC statement, 28 Oct 2026; US BLS release calendar. Not investment advice. CFDs are high-risk; you may lose money." }))
  ]);
}

function Captions(t) {
  if (t >= 22.45) return null;
  var ch = CAPTIONS.find(function (c) { return t >= c.s && t < c.e; });
  if (!ch) return null;
  var active = -1;
  ch.words.forEach(function (w, i) { if (t >= w.s - 0.04) active = i; });
  var k = clamp((t - ch.s) / 0.12);
  return h("div", { style: { position: "absolute", left: 100, right: 170, bottom: 440, opacity: k, transform: "translateY(" + (1 - k) * 10 + "px)" } },
    h(OF.ReelCaption, { text: ch.words.map(function (w) { return w.w; }).join(" "), variant: "highlight", active: active, size: 58 }));
}

function Reel(props) {
  var t = props.t;
  var drift = t / DUR;
  return h(OF.Canvas, { format: "reel", grid: true, motif: false }, [
    /* slow lime glow drifting behind the grid */
    h("div", { key: "glow", style: { position: "absolute", width: 1400, height: 1400, borderRadius: "50%", left: -500 + 300 * drift, top: 900 - 500 * drift,
      background: "radial-gradient(circle, rgb(159 206 16 / 0.10) 0%, transparent 60%)" } }),
    t < 22.4 ? h("div", { key: "wm", style: { position: "absolute", left: 88, top: 240, opacity: 0.9 } }, h(OF.Wordmark, { size: 30 })) : null,
    /* thin progress hairline under the watermark */
    t < 22.4 ? h("div", { key: "pr", style: { position: "absolute", left: 88, right: 150, top: 300, height: 1.5, background: "var(--line)" } },
      h("div", { style: { width: (100 * clamp(t / 22.4)) + "%", height: "100%", background: "var(--accent)" } })) : null,
    h("div", { key: "s1" }, S1(t)), h("div", { key: "s2" }, S2(t)), h("div", { key: "s3" }, S3(t)), h("div", { key: "s4" }, S4(t)), h("div", { key: "s5" }, S5(t)),
    h("div", { key: "cap" }, Captions(t))
  ]);
}

var root = ReactDOM.createRoot(document.getElementById("root"));
window.setT = function (t) {
  ReactDOM.flushSync(function () { root.render(h(Reel, { t: t })); });
  return true;
};
window.REEL_DUR = DUR;
window.REEL_READY = document.fonts.ready.then(function () { window.setT(0); return true; });
