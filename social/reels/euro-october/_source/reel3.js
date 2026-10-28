/* Reel: the euro's rough October, published 29 Oct 2026 before the ECB decision. window.setT(seconds) renders one frame. */
var h = React.createElement, OF = window.OF;
var DUR = 40.5, END = 37.2; /* END: voiceover body ends, outro starts */
var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
var ease = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
var p = function (t, s, d) { return ease((t - s) / (d || 0.55)); };
var lerp = function (a, b, k) { return a + (b - a) * k; };

function rise(t, s, extra) {
  var k = p(t, s);
  return Object.assign({ opacity: k, transform: "translateY(" + (1 - k) * 32 + "px)", filter: "blur(" + (1 - k) * 8 + "px)" }, extra);
}
function accent(parts) {
  return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; });
}
var title = function (size) { return { fontSize: size, fontWeight: 700, letterSpacing: "var(--tracking-display)", lineHeight: 1.02, margin: 0, whiteSpace: "pre-line", textShadow: "0 2px 30px rgb(0 0 0 / 0.5)" }; };
var label = { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 24, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-secondary)" };
var glass = { background: "var(--surface-glass)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1.5px solid var(--line)", borderRadius: "var(--radius-l)" };
var big = function (size, extra) { return Object.assign({ fontSize: size, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textShadow: "0 2px 30px rgb(0 0 0 / 0.5)" }, extra); };
/* counts a number up from `from` over d seconds */
var count = function (t, s, d, from, to, dec) { return lerp(from, to, ease((t - s) / d)).toFixed(dec); };

function Photo(t, s, e, src, from, to) {
  if (t < s - 0.01 || t > e + 0.4) return null;
  var k = clamp((t - s) / (e - s)), fade = clamp((t - s) / 0.35);
  return h("div", { key: "ph" + s, style: { position: "absolute", inset: 0, opacity: fade, overflow: "hidden" } }, [
    h("img", { key: "i", src: src, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
      transform: "scale(" + lerp(from || 1.02, to || 1.12, k) + ")", filter: "brightness(0.56) saturate(0.85) contrast(1.05)" } }),
    h("div", { key: "g", style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgb(11 11 11 / 0.75) 0%, rgb(11 11 11 / 0.15) 32%, rgb(11 11 11 / 0.25) 55%, rgb(11 11 11 / 0.92) 100%)" } })
  ]);
}
function scene(t, s, e, kids) {
  if (t < s - 0.01 || t > e + 0.01) return null;
  return h("div", { style: { position: "absolute", left: 88, right: 150, top: 330, bottom: 600, opacity: clamp((e - t) / 0.3) } }, kids);
}

/* S1 0 to 3.25: hook */
function S1(t) {
  var e = 3.25;
  return [Photo(t, 0, e, "img/euro-macro.jpg", 1.1, 1.0), scene(t, 0, e, [
    h("div", { key: "k", style: rise(t, 0.05) }, h(OF.Kicker, { live: true, size: 24 }, "EUR/USD · 28 Oct")),
    h("h1", { key: "a", style: rise(t, 0.2, Object.assign(title(132), { marginTop: 50 })) }, accent(["The euro\nhit a ", "2026 low", "."]))
  ])];
}

/* S2 3.25 to 10.45: the year so far, ECB reference rates */
function S2(t) {
  var s = 3.25, e = 10.45;
  if (t < s - 0.01 || t > e + 0.01) return null;
  var W = 842, H = 520, lo = 1.10, hi = 1.20, n = FX.length;
  var X = function (i) { return i / (n - 1) * W; }, Y = function (v) { return H - (v - lo) / (hi - lo) * H; };
  var octStart = FX.findIndex(function (q) { return q[0] >= "2026-10-01"; });
  var drawn = Math.floor(lerp(0, n - 1, ease((t - 3.5) / 3.6)));
  var pts = FX.slice(0, drawn + 1);
  var line = function (from, to) { return FX.slice(from, to + 1).map(function (q, j) { return (j ? "L" : "M") + X(from + j).toFixed(1) + " " + Y(q[1]).toFixed(1); }).join(" "); };
  var hiIdx = FX.reduce(function (b, q, i) { return q[1] > FX[b][1] ? i : b; }, 0);
  var months = ["Jan", "Mar", "May", "Jul", "Sep"].map(function (m, j) { var i = FX.findIndex(function (q) { return q[0] >= "2026-" + String(1 + j * 2).padStart(2, "0") + "-01"; }); return [m, i]; });
  var last = FX[n - 1];
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.05) }, h(OF.Kicker, { size: 24 }, "EUR/USD in 2026")),
    h("div", { key: "v", style: rise(t, 3.4, big(150, { marginTop: 36 })) }, count(t, 3.5, 3.6, 1.1721, last[1], 4)),
    h("div", { key: "l", style: rise(t, 3.6, Object.assign({}, label, { fontSize: 21, marginTop: 18 })) }, "ECB reference rate · lowest of 2026"),
    h("div", { key: "c", style: { position: "relative", width: W, height: H, marginTop: 56 } }, [
      h("svg", { key: "svg", width: W, height: H + 40, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, [
        [1.10, 1.15, 1.20].map(function (v) { return h("g", { key: "y" + v }, [
          h("line", { key: "l", x1: 0, x2: W, y1: Y(v), y2: Y(v), stroke: "rgb(255 255 255 / 0.08)", strokeWidth: 1.5 }),
          h("text", { key: "t", x: W + 12, y: Y(v) + 8, fill: "#999", fontSize: 21, fontFamily: "Montserrat", fontWeight: 600 }, v.toFixed(2))]); }),
        months.map(function (m) { return h("text", { key: m[0], x: X(m[1]), y: H + 36, fill: "#999", fontSize: 21, fontFamily: "Montserrat", fontWeight: 600 }, m[0]); }),
        h("path", { key: "a", d: line(0, Math.min(drawn, octStart)), fill: "none", stroke: "rgb(255 255 255 / 0.85)", strokeWidth: 4, strokeLinejoin: "round" }),
        drawn > octStart ? h("path", { key: "b", d: line(octStart, drawn), fill: "none", stroke: "var(--down)", strokeWidth: 6, strokeLinejoin: "round" }) : null,
        h("circle", { key: "dot", cx: X(drawn), cy: Y(FX[drawn][1]), r: 10, fill: drawn > octStart ? "var(--down)" : "#fff", stroke: "#0b0b0b", strokeWidth: 4 }),
        t >= 5.2 ? h("g", { key: "hi", opacity: p(t, 5.2) }, [
          h("circle", { key: "c", cx: X(hiIdx), cy: Y(FX[hiIdx][1]), r: 7, fill: "#fff" }),
          h("text", { key: "t", x: X(hiIdx) + 16, y: Y(FX[hiIdx][1]) + 8, fill: "#ccc", fontSize: 24, fontFamily: "Montserrat", fontWeight: 600 }, "High " + FX[hiIdx][1].toFixed(4) + " · Jan")]) : null
      ]),
      h("span", { key: "oct", style: rise(t, 7.1, { position: "absolute", right: 0, top: -6, display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 24px", borderRadius: 100, background: "var(--down-soft)", color: "var(--down)", fontSize: 30, fontWeight: 600 }) },
        "October ↓ 2.0%"),
      h("div", { key: "wk", style: rise(t, 5.5, Object.assign({}, label, { position: "absolute", left: 0, top: Y(1.115) + 10, fontSize: 21, color: "var(--text-secondary)" })) }, "Weakest major currency this month")
    ])
  ]);
}

/* S3 10.45 to 20.7: France */
function S3(t) {
  var s = 10.45, e = 20.7;
  return [Photo(t, s, e, "img/france-flag.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.05) }, h(OF.Kicker, { size: 24 }, "The biggest reason")),
    h("h1", { key: "t", style: rise(t, 11.9, Object.assign(title(150), { marginTop: 40 })) }, accent(["", "France", "."])),
    h("div", { key: "l", style: rise(t, 13.3, Object.assign({}, label, { marginTop: 70, fontSize: 22 })) }, "10-year yield gap: France vs Germany"),
    h("div", { key: "v", style: rise(t, 15.9, big(150, { marginTop: 20 })) }, [count(t, 16.0, 1.5, 0.5, 1.75, 2), h("span", { key: "u", style: { fontSize: 64, marginLeft: 18, letterSpacing: "-0.02em" } }, "pts")]),
    h("span", { key: "c", style: rise(t, 18.7, { display: "inline-flex", alignItems: "center", gap: 12, marginTop: 30, padding: "14px 26px", borderRadius: 100, background: "var(--down-soft)", color: "var(--down)", fontSize: 30, fontWeight: 600 }) }, "Widest since 2011"),
    h("div", { key: "m", style: rise(t, 19.4, Object.assign({}, glass, { marginTop: 50, padding: "24px 30px" })) }, [
      h("div", { key: "a", style: Object.assign({}, label, { fontSize: 19 }) }, "Moody's · 23 Oct"),
      h("div", { key: "b", style: { fontSize: 34, fontWeight: 600, marginTop: 8 } }, "France kept at Aa3, outlook negative")
    ])
  ])];
}

/* S4 20.7 to 23.35: energy */
function S4(t) {
  var s = 20.7, e = 23.35;
  return [Photo(t, s, e, "img/refinery.jpg", 1.04, 1.14), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.05) }, h(OF.Kicker, { size: 24, tone: "down" }, "Also weighing")),
    h("h1", { key: "t", style: rise(t, 20.85, Object.assign(title(124), { marginTop: 40 })) }, ["Higher\n", h("span", { key: "e", style: { color: "var(--down)" } }, "energy"), "\nprices."])
  ])];
}

/* S5 23.35 to 28.15: hedge fund positioning */
function S5(t) {
  var s = 23.35, e = 28.15;
  return [Photo(t, s, e, "img/euro-cash.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.05) }, h(OF.Kicker, { size: 24 }, "Hedge funds")),
    h("h1", { key: "t", style: rise(t, 23.5, Object.assign(title(96), { marginTop: 40 })) }, accent(["Biggest bet\nagainst the euro\nsince ", "March 2020", "."])),
    h("div", { key: "v", style: rise(t, 24.9, big(150, { marginTop: 60 })) }, "€" + count(t, 25.0, 1.4, 4, 11.8, 1) + "bn"),
    h("div", { key: "l", style: rise(t, 25.3, Object.assign({}, label, { fontSize: 20, marginTop: 20, lineHeight: 1.5, whiteSpace: "pre-line" })) }, "Net short bets, week to 20 Oct\nCFTC data via Bloomberg")
  ])];
}

/* S6 28.15 to 37.2: the ECB today */
function S6(t) {
  var s = 28.15, e = END;
  var row = function (k, at, lab, val) {
    return h("div", { key: k, style: rise(t, at, Object.assign({}, glass, { padding: "26px 32px", marginTop: 20 })) }, [
      h("div", { key: "a", style: Object.assign({}, label, { fontSize: 19 }) }, lab),
      h("div", { key: "b", style: { fontSize: 38, fontWeight: 600, marginTop: 8, lineHeight: 1.15, whiteSpace: "pre-line" } }, val)
    ]);
  };
  return [Photo(t, s, e, "img/columns.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.05) }, h(OF.Kicker, { live: true, size: 24 }, "Today · 29 Oct")),
    h("h1", { key: "t", style: rise(t, 28.3, Object.assign(title(112), { marginTop: 40, marginBottom: 30 })) }, accent(["The ECB\n", "decides", "."])),
    row("a", 29.6, "Decision · press conference", "13:15 and 13:45 UTC\n20:15 and 20:45 Cambodia"),
    row("b", 31.6, "Expected", "Hold, deposit rate 2.50%\n70 of 73 economists (Reuters poll)"),
    row("c", 34.6, "Watch for", "Any hint of a December hike")
  ])];
}

function S7(t) {
  if (t < END - 0.05) return null;
  return h("div", { key: "o", style: { position: "absolute", inset: 0, opacity: clamp((t - END) / 0.35) } }, [
    h(OF.Canvas, { key: "c", format: "reel", grid: false, motif: true }, h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 260 } }, [
      h("div", { key: "k", style: rise(t, END + 0.1) }, h(OF.Kicker, { size: 24 }, "Follow for more")),
      h("div", { key: "w", style: rise(t, END + 0.2) }, h(OF.Wordmark, { size: 120 })),
      h("div", { key: "l", style: { width: 360 * p(t, END + 0.5, 0.7), height: 1.5, background: "var(--line-strong)" } }),
      h("div", { key: "hd", style: rise(t, END + 0.7, { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 32, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent)" }) }, "@onfinkm"),
      h("div", { key: "d", style: rise(t, END + 1.0, { position: "absolute", left: 88, right: 150, bottom: 450 }) },
        h(OF.Disclaimer, { size: 21, text: "Sources: ECB reference rates (to 28 Oct 2026); MUFG; CFTC data via Bloomberg; Moody's; Reuters poll. Images: Freepik. Music: Suno. Not investment advice. CFDs are high-risk; you may lose money." }))
    ]))
  ]);
}

function Captions(t) {
  if (t >= END) return null;
  var ch = CAPTIONS.find(function (c) { return t >= c.s && t < c.e; });
  if (!ch) return null;
  var active = -1;
  ch.words.forEach(function (w, i) { if (t >= w.s - 0.04) active = i; });
  var k = clamp((t - ch.s) / 0.12);
  return h("div", { style: { position: "absolute", left: 100, right: 170, bottom: 440, opacity: k, transform: "translateY(" + (1 - k) * 10 + "px)" } },
    h(OF.ReelCaption, { text: ch.words.map(function (w) { return w.w; }).join(" "), variant: "highlight", active: active, size: 56 }));
}

function Reel(props) {
  var t = props.t;
  return h(OF.Canvas, { format: "reel", grid: t >= 3.2 && t < 10.5, motif: false }, [
    h("div", { key: "s1" }, S1(t)), h("div", { key: "s2" }, S2(t)), h("div", { key: "s3" }, S3(t)), h("div", { key: "s4" }, S4(t)),
    h("div", { key: "s5" }, S5(t)), h("div", { key: "s6" }, S6(t)),
    t < END ? h("div", { key: "wm", style: { position: "absolute", left: 88, top: 240, opacity: 0.95 } }, h(OF.Wordmark, { size: 30 })) : null,
    t < END ? h("div", { key: "pr", style: { position: "absolute", left: 88, right: 150, top: 300, height: 1.5, background: "rgb(255 255 255 / 0.18)" } },
      h("div", { style: { width: (100 * clamp(t / END)) + "%", height: "100%", background: "var(--accent)" } })) : null,
    h("div", { key: "cap" }, Captions(t)),
    h("div", { key: "s7" }, S7(t))
  ]);
}

var root = ReactDOM.createRoot(document.getElementById("root"));
window.setT = async function (t) {
  ReactDOM.flushSync(function () { root.render(h(Reel, { t: t })); });
  await Promise.all(Array.from(document.images).map(function (i) { return i.decode().catch(function () {}); }));
  return true;
};
window.REEL_DUR = DUR;
window.REEL_READY = document.fonts.ready.then(function () { return window.setT(0); });
