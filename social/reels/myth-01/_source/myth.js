/* Myth vs Fact series, episode 01 (lose 50%, gain 50%). Scene timings and copy come from window.EP (ep01_<lang>.js).
   window.setT(seconds) renders one frame. */
var h = React.createElement, OF = window.OF, T = EP.txt, MK = EP.marks, END = EP.end, DUR = EP.dur;
var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
var ease = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
var p = function (t, s, d) { return ease((t - s) / (d || 0.55)); };
var lerp = function (a, b, k) { return a + (b - a) * k; };

function rise(t, s, extra) {
  var k = p(t, s);
  return Object.assign({ opacity: k, transform: "translateY(" + (1 - k) * 32 + "px)", filter: "blur(" + (1 - k) * 8 + "px)" }, extra);
}
/* *word* in copy = lime accent */
function rich(s, color) {
  return s.split("*").map(function (part, i) { return i % 2 ? h("span", { key: i, style: { color: color || "var(--accent)" } }, part) : part; });
}
var title = function (size) { return { fontSize: size, fontWeight: 700, letterSpacing: "var(--tracking-display)", lineHeight: 1.04, margin: 0, whiteSpace: "pre-line" }; };
var label = { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 24, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-secondary)" };
var glass = { background: "var(--surface-2)", border: "1.5px solid var(--line)", borderRadius: "var(--radius-l)" };
var pill = function (bg, fg) { return { display: "inline-flex", alignItems: "center", padding: "14px 30px", borderRadius: 100, background: bg, color: fg, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 30, letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }; };
var money = function (v) { return T.m1000.replace(/1.000/, String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, T.m1000.charAt(2))); };

function scene(t, s, e, kids) {
  if (t < s - 0.01 || t > e + 0.01) return null;
  return h("div", { style: { position: "absolute", left: 88, right: 150, top: 340, bottom: 600, opacity: clamp((e - t) / 0.3) } }, kids);
}

/* S1: the myth, struck through as the voice says "Fact" */
function S1(t) {
  var e = MK.fact, strike = p(t, e - 0.45, 0.4);
  return scene(t, 0, e, [
    h("div", { key: "k", style: rise(t, 0.05) }, h(OF.Kicker, { size: 24, tone: "down" }, T.kicker)),
    h("div", { key: "p", style: rise(t, 0.15, { marginTop: 60 }) }, h("span", { style: pill("var(--down)", "#0b0b0b") }, T.myth)),
    h("div", { key: "m", style: { position: "relative", marginTop: 50 } }, [
      h("h1", { key: "t", style: rise(t, 0.3, Object.assign(title(T.myth_text.length > 52 ? 86 : 100), { opacity: p(t, 0.3) * (1 - 0.6 * strike) })) }, T.myth_text),
      h("div", { key: "x", style: { position: "absolute", left: -10, top: "46%", height: 12, borderRadius: 10, background: "var(--down)", width: (100 * strike) + "%", transform: "rotate(-9deg)", transformOrigin: "left center", boxShadow: "0 0 30px var(--down-soft)" } })
    ])
  ]);
}

/* S2: the fact */
function S2(t) {
  var s = MK.fact, e = MK.start;
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24 }, T.kicker)),
    h("div", { key: "p", style: rise(t, s + 0.05, { marginTop: 60 }) }, h("span", { style: pill("var(--accent)", "#0b0b0b") }, T.fact)),
    h("h1", { key: "t", style: rise(t, s + 0.2, Object.assign(title(120), { marginTop: 50 })) }, rich(T.fact_text))
  ]);
}

/* S3: the $1,000 example */
function S3(t) {
  var s = MK.start, e = MK.bigger;
  var v = 1000, col = "var(--text-primary)";
  if (t >= MK.lose) { v = lerp(1000, 500, ease((t - MK.lose - 0.3) / 0.9)); col = "var(--down)"; }
  if (t >= MK.gain50) { v = lerp(500, 750, ease((t - MK.gain50 - 0.3) / 0.9)); col = "var(--accent)"; }
  if (t >= MK.need100) { v = lerp(750, 1000, ease((t - MK.need100 - 1.6) / 0.9)); }
  var W = 842, fill = v / 1000 * W;
  var step = function (k, at, lab, from, to, color) {
    var on = t >= at;
    return h("div", { key: k, style: rise(t, at, Object.assign({}, glass, { display: "flex", alignItems: "center", gap: 24, padding: "30px 32px", marginTop: 20 })) }, [
      h("span", { key: "l", style: Object.assign({}, label, { fontSize: 22, width: 290, flex: "none", color: color }) }, lab),
      h("span", { key: "v", style: { fontSize: 44, fontWeight: 600, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" } }, from + "  →  " + to)
    ]);
  };
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.05) }, h(OF.Kicker, { size: 24, tone: "muted" }, T.hypo)),
    h("div", { key: "v", style: rise(t, s + 0.15, { fontSize: 170, fontWeight: 700, letterSpacing: "-0.045em", lineHeight: 1, marginTop: 40, color: col, fontVariantNumeric: "tabular-nums" }) }, money(v)),
    h("div", { key: "bar", style: rise(t, s + 0.3, { position: "relative", width: W, height: 34, marginTop: 40, borderRadius: 34, background: "rgb(255 255 255 / 0.08)" }) }, [
      h("div", { key: "f", style: { position: "absolute", left: 0, top: 0, bottom: 0, width: fill, borderRadius: 34, background: col } }),
      t >= MK.gain50 + 1.0 && t < MK.need100 + 1.6 ? h("div", { key: "gap", style: { position: "absolute", left: 750 / 1000 * W, top: -6, bottom: -6, width: 250 / 1000 * W, borderRadius: 34, border: "3px dashed var(--down)", opacity: p(t, MK.gain50 + 1.0, 0.4) } }) : null
    ]),
    h("div", { key: "sh", style: { height: 40, marginTop: 14, textAlign: "right" } },
      t >= MK.gain50 + 1.0 && t < MK.need100 + 1.6 ? h("span", { style: rise(t, MK.gain50 + 1.0, Object.assign({}, label, { fontSize: 22, color: "var(--down)" })) }, T.short) : null),
    h("div", { key: "steps", style: { marginTop: 20 } }, [
      step("a", MK.lose, T.lose, T.m1000, T.m500, "var(--down)"),
      t >= MK.gain50 ? step("b", MK.gain50, T.gain50, T.m500, T.m750, "var(--accent)") : null,
      t >= MK.need100 ? step("c", MK.need100 + 0.2, T.gain100, T.m500, T.m1000, "var(--accent)") : null
    ])
  ]);
}

/* S4: the recovery table */
function S4(t) {
  var s = MK.bigger, e = MK.protect;
  var rows = [[10, 11], [25, 33], [50, 100], [75, 300]];
  var BW = 360;
  return scene(t, s, e, [
    h("div", { key: "hd", style: rise(t, s + 0.05, { display: "flex", gap: 30, paddingBottom: 18, borderBottom: "1.5px solid var(--line-strong)" }) }, [
      h("span", { key: "a", style: Object.assign({}, label, { width: 190, flex: "none" }) }, T.loss),
      h("span", { key: "b", style: Object.assign({}, label, { lineHeight: 1.3 }) }, T.need)
    ]),
    rows.map(function (r, i) {
      var at = s + 0.3 + i * 0.35, hi = t >= MK.lose75 && i === 3, dim = t >= MK.lose75 && i !== 3;
      var w = BW * r[1] / 300 * p(t, at + 0.15, 0.7);
      return h("div", { key: i, style: rise(t, at, { display: "flex", alignItems: "center", gap: 30, padding: "42px 0", borderBottom: "1.5px solid var(--line)", opacity: p(t, at) * (dim ? 0.45 : 1) }) }, [
        h("span", { key: "l", style: { width: 190, flex: "none", fontSize: 64, fontWeight: 700, color: "var(--down)", letterSpacing: "-0.03em" } }, "-" + r[0] + "%"),
        h("div", { key: "b", style: { display: "flex", alignItems: "center", gap: 22 } }, [
          h("div", { key: "bar", style: { width: Math.max(10, w), height: 30, borderRadius: 30, background: "var(--accent)", boxShadow: hi ? "0 0 40px var(--accent-glow)" : "none" } }),
          h("span", { key: "v", style: { fontSize: hi ? 64 : 56, fontWeight: 700, color: "var(--accent)", whiteSpace: "nowrap", letterSpacing: "-0.03em" } }, "+" + r[1] + "%")
        ])
      ]);
    })
  ]);
}

/* S5: the takeaway */
function S5(t) {
  var s = MK.protect, e = END;
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24 }, T.kicker)),
    h("h1", { key: "t", style: rise(t, s + 0.1, Object.assign(title(124), { marginTop: 60 })) }, rich(T.takeaway))
  ]);
}

function Outro(t) {
  if (t < END - 0.05) return null;
  return h("div", { key: "o", style: { position: "absolute", inset: 0, opacity: clamp((t - END) / 0.35) } }, [
    h(OF.Canvas, { key: "c", format: "reel", grid: false, motif: true }, h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 260 } }, [
      h("div", { key: "k", style: rise(t, END + 0.1) }, h(OF.Kicker, { size: 24 }, T.follow)),
      h("div", { key: "w", style: rise(t, END + 0.2) }, h(OF.Wordmark, { size: 120 })),
      h("div", { key: "l", style: { width: 360 * p(t, END + 0.5, 0.7), height: 1.5, background: "var(--line-strong)" } }),
      h("div", { key: "hd", style: rise(t, END + 0.7, { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 32, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent)" }) }, T.handle),
      h("div", { key: "d", style: rise(t, END + 1.0, { position: "absolute", left: 88, right: 150, bottom: 450 }) }, h(OF.Disclaimer, { size: 22, text: T.disclaimer }))
    ]))
  ]);
}

function Captions(t) {
  if (t >= END) return null;
  var ch = EP.captions.find(function (c) { return t >= c.s && t < c.e; });
  if (!ch) return null;
  var active = -1;
  ch.words.forEach(function (w, i) { if (t >= w.s - 0.04) active = i; });
  var k = clamp((t - ch.s) / 0.12);
  return h("div", { style: { position: "absolute", left: 100, right: 170, bottom: 440, opacity: k, transform: "translateY(" + (1 - k) * 10 + "px)" } },
    h(OF.ReelCaption, { text: ch.words.map(function (w) { return w.w; }).join(" "), variant: "highlight", active: active, size: 56 }));
}

function Reel(props) {
  var t = props.t;
  /* faint coral wash while the myth is on screen, lime wash for the fact */
  var wash = t < MK.fact ? "rgb(250 135 107 / " + (0.10 * p(t, 0)) + ")" : "rgb(159 206 16 / " + (0.08 * (1 - p(t, MK.start, 1.0))) + ")";
  return h(OF.Canvas, { format: "reel", grid: true, motif: false }, [
    h("div", { key: "wash", style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 60% at 30% 35%, " + wash + ", transparent 70%)" } }),
    h("div", { key: "s1" }, S1(t)), h("div", { key: "s2" }, S2(t)), h("div", { key: "s3" }, S3(t)), h("div", { key: "s4" }, S4(t)), h("div", { key: "s5" }, S5(t)),
    t < END ? h("div", { key: "wm", style: { position: "absolute", left: 88, top: 240, opacity: 0.95 } }, h(OF.Wordmark, { size: 30 })) : null,
    t < END ? h("div", { key: "pr", style: { position: "absolute", left: 88, right: 150, top: 300, height: 1.5, background: "rgb(255 255 255 / 0.18)" } },
      h("div", { style: { width: (100 * clamp(t / END)) + "%", height: "100%", background: "var(--accent)" } })) : null,
    h("div", { key: "cap" }, Captions(t)),
    h("div", { key: "out" }, Outro(t))
  ]);
}

var root = ReactDOM.createRoot(document.getElementById("root"));
window.setT = function (t) { ReactDOM.flushSync(function () { root.render(h(Reel, { t: t })); }); return true; };
window.REEL_DUR = DUR;
window.REEL_READY = document.fonts.ready.then(function () { return window.setT(0); });
