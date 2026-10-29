/* Myth vs Fact series, episodes 02 to 05. Same frame as episode 01: myth, fact, proof (per episode), takeaway, outro.
   Copy and timings come from window.EP (ep<NN>_<lang>.js). window.setT(seconds) renders one frame. */
var h = React.createElement, OF = window.OF, T = EP.txt, MK = EP.marks, END = EP.end, DUR = EP.dur;
var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
var ease = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
var p = function (t, s, d) { return ease((t - s) / (d || 0.55)); };
var lerp = function (a, b, k) { return a + (b - a) * k; };

function rise(t, s, extra) {
  var k = p(t, s);
  return Object.assign({ opacity: k, transform: "translateY(" + (1 - k) * 32 + "px)", filter: "blur(" + (1 - k) * 8 + "px)" }, extra);
}
function rich(s, color) {
  return s.split("*").map(function (part, i) { return i % 2 ? h("span", { key: i, style: { color: color || "var(--accent)" } }, part) : part; });
}
/* largest size (max px) at which every explicit line of a takeaway fits the column on one row */
var _ctx;
function fitSize(txt, max, width) {
  _ctx = _ctx || document.createElement("canvas").getContext("2d");
  _ctx.font = "700 " + max + "px Montserrat";
  var widest = Math.max.apply(null, txt.replace(/\*/g, "").split("\n").map(function (l) { return _ctx.measureText(l).width - 0.035 * max * l.length; }));
  return Math.min(max, Math.floor(max * width * 0.97 / widest));
}
var title = function (size) { return { fontSize: size, fontWeight: 700, letterSpacing: "var(--tracking-display)", lineHeight: 1.04, margin: 0, whiteSpace: "pre-line" }; };
var label = { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 24, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--text-secondary)" };
var card = { background: "var(--surface-2)", border: "1.5px solid var(--line)", borderRadius: "var(--radius-l)" };
var pill = function (bg, fg) { return { display: "inline-flex", alignItems: "center", padding: "14px 30px", borderRadius: 100, background: bg, color: fg, fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 30, letterSpacing: "var(--tracking-label)", textTransform: "uppercase" }; };
var chip = function (bg, fg) { return { display: "inline-flex", alignItems: "center", gap: 12, padding: "14px 26px", borderRadius: 100, background: bg, color: fg, fontSize: 30, fontWeight: 600 }; };

function scene(t, s, e, kids) {
  if (t < s - 0.01 || t > e + 0.01) return null;
  return h("div", { style: { position: "absolute", left: 88, right: 150, top: 340, bottom: 600, opacity: clamp((e - t) / 0.3) } }, kids);
}

function S1(t) {
  var e = MK.fact, strike = p(t, e - 0.45, 0.4), size = T.myth_text.length > 52 ? 84 : 100;
  return scene(t, 0, e, [
    h("div", { key: "k", style: rise(t, 0.05) }, h(OF.Kicker, { size: 24, tone: "down" }, T.kicker)),
    h("div", { key: "p", style: rise(t, 0.15, { marginTop: 60 }) }, h("span", { style: pill("var(--down)", "#0b0b0b") }, T.myth)),
    h("div", { key: "m", style: { position: "relative", marginTop: 50 } }, [
      h("h1", { key: "t", style: rise(t, 0.3, Object.assign(title(size), { opacity: p(t, 0.3) * (1 - 0.6 * strike) })) }, T.myth_text),
      h("div", { key: "x", style: { position: "absolute", left: -10, top: "46%", height: 12, borderRadius: 12, background: "var(--down)", width: (100 * strike) + "%", transform: "rotate(-9deg)", transformOrigin: "left center", boxShadow: "0 0 30px var(--down-soft)" } })
    ])
  ]);
}

function S2(t) {
  var s = MK.fact, e = MK.proof;
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24 }, T.kicker)),
    h("div", { key: "p", style: rise(t, s + 0.05, { marginTop: 60 }) }, h("span", { style: pill("var(--accent)", "#0b0b0b") }, T.fact)),
    h("h1", { key: "t", style: rise(t, s + 0.2, Object.assign(title(T.fact_text.length > 56 ? 92 : 108), { marginTop: 50 })) }, rich(T.fact_text))
  ]);
}

/* ---------- 02: a stop becomes a market order; weekend gap past the stop ---------- */
function P2(t) {
  var s = MK.proof, e = MK.take, mid = MK.gap;
  var flow = T.flow.map(function (f, i) {
    var at = [MK.proof, MK.becomes, MK.next][i], on = t >= at;
    return h("div", { key: i }, [
      i ? h("div", { key: "a", style: { height: 46, marginLeft: 46, borderLeft: "3px solid " + (on ? "var(--accent)" : "var(--line-strong)"), opacity: p(t, at - 0.2) } }) : null,
      h("div", { key: "c", style: rise(t, at, Object.assign({}, card, { display: "flex", alignItems: "center", gap: 26, padding: "30px 32px", border: "1.5px solid " + (on ? "var(--accent)" : "var(--line)") })) }, [
        h("span", { key: "n", style: { width: 60, height: 60, borderRadius: 60, flex: "none", background: "var(--accent)", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 30, fontWeight: 700 } }, String(i + 1)),
        h("span", { key: "x", style: { fontSize: 42, fontWeight: 600, lineHeight: 1.15 } }, f)
      ])
    ]);
  });
  var A = t < mid ? [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24 }, T.kicker)),
    h("div", { key: "f", style: { marginTop: 50 } }, flow),
    t >= MK.most ? h("div", { key: "u", style: rise(t, MK.most, { marginTop: 40 }) }, h("span", { style: chip("var(--accent-soft)", "var(--accent)") }, T.usually)) : null
  ] : null;
  /* chart: Friday drift, weekend gap, Monday reopen below the stop */
  var W = 842, H = 620, lo = 1.0880, hi = 1.1040;
  var X = function (f) { return f * W; }, Y = function (v) { return H - (v - lo) / (hi - lo) * H; };
  var fri = [[0, 1.1000], [0.06, 1.1006], [0.12, 1.0996], [0.18, 1.1003], [0.24, 1.0990], [0.30, 1.0995], [0.36, 1.0984], [0.42, 1.0988]];
  var mon = [[0.64, 1.0920], [0.70, 1.0914], [0.76, 1.0922], [0.84, 1.0908], [0.92, 1.0912], [1.0, 1.0902]];
  var path = function (pts, k) { var n = Math.max(1, Math.round(k * (pts.length - 1))); return pts.slice(0, n + 1).map(function (q, i) { return (i ? "L" : "M") + X(q[0]).toFixed(1) + " " + Y(q[1]).toFixed(1); }).join(" "); };
  var kf = p(t, mid + 0.3, 2.5), km = p(t, MK.opens + 1.2, 1.2), stopOn = p(t, MK.say + 0.6, 0.5), fill = p(t, MK.fills + 0.2, 0.6);
  var tag = function (k, x, y, txt, col, a) { return h("div", { key: k, style: { position: "absolute", left: x, top: y - 18, opacity: a, fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 24, letterSpacing: "0.1em", textTransform: "uppercase", color: col, whiteSpace: "nowrap", background: "rgb(11 11 11 / 0.85)", padding: "4px 8px", borderRadius: 6 } }, txt); };
  var B = t >= mid ? [
    h("div", { key: "k", style: rise(t, mid + 0.02) }, h(OF.Kicker, { size: 24, tone: "muted" }, T.hypo)),
    h("div", { key: "c", style: { position: "relative", width: W, height: H + 50, marginTop: 50 } }, [
      h("svg", { key: "svg", width: W, height: H + 50, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, [
        h("rect", { key: "wk", x: X(0.44), y: 0, width: X(0.18), height: H, fill: "rgb(255 255 255 / 0.05)", opacity: p(t, mid + 1.5) }),
        h("line", { key: "en", x1: 0, x2: W, y1: Y(1.1), y2: Y(1.1), stroke: "rgb(255 255 255 / 0.45)", strokeWidth: 2, strokeDasharray: "10 10", opacity: p(t, mid + 0.4) }),
        h("line", { key: "st", x1: 0, x2: W, y1: Y(1.095), y2: Y(1.095), stroke: "var(--down)", strokeWidth: 3, strokeDasharray: "14 10", opacity: stopOn }),
        h("path", { key: "fr", d: path(fri, kf), fill: "none", stroke: "#fff", strokeWidth: 5, strokeLinejoin: "round" }),
        km > 0 ? h("path", { key: "mo", d: path(mon, km), fill: "none", stroke: "var(--down)", strokeWidth: 5, strokeLinejoin: "round" }) : null,
        km > 0 ? h("circle", { key: "od", cx: X(0.64), cy: Y(1.092), r: 12 * km, fill: "var(--down)", stroke: "#0b0b0b", strokeWidth: 4 }) : null,
        fill > 0 ? h("line", { key: "br", x1: X(0.64) - 40, x2: X(0.64) - 40, y1: Y(1.095), y2: lerp(Y(1.095), Y(1.092), fill), stroke: "var(--down)", strokeWidth: 8, strokeLinecap: "round" }) : null,
        h("text", { key: "f", x: X(0.2), y: H + 40, fill: "#999", fontSize: 22, fontFamily: "Montserrat", fontWeight: 600, textAnchor: "middle" }, T.fri),
        h("text", { key: "m", x: X(0.82), y: H + 40, fill: "#999", fontSize: 22, fontFamily: "Montserrat", fontWeight: 600, textAnchor: "middle" }, T.mon)
      ]),
      tag("te", 0, Y(1.1) - 26, T.entry + " " + T.p_entry, "#ddd", p(t, mid + 0.4)),
      tag("ts", 0, Y(1.095) + 30, T.stop + " " + T.p_stop, "var(--down)", stopOn),
      tag("tg", X(0.44) + 10, 40, T.gap, "#bbb", p(t, mid + 1.5)),
      tag("to", X(0.66) + 10, Y(1.092) + 40, T.reopen + " " + T.p_open, "var(--down)", km),
      fill > 0 ? h("div", { key: "sl", style: rise(t, MK.fills + 0.4, { position: "absolute", right: W - X(0.64) + 64, top: Y(1.092) - 30 }) }, h("span", { style: Object.assign(chip("var(--down)", "#0b0b0b"), { whiteSpace: "nowrap" }, T.slip.length > 20 ? { fontSize: 26, padding: "12px 22px" } : {}) }, T.slip)) : null
    ])
  ] : null;
  return scene(t, s, e, [h("div", { key: "a" }, A), h("div", { key: "b" }, B)]);
}

/* ---------- 03: averaging down doubles the exposure ---------- */
function P3(t) {
  var s = MK.proof, e = MK.take;
  var row = function (k, at, lab, val, hl) {
    return h("div", { key: k, style: rise(t, at, Object.assign({}, card, { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "36px 36px", marginTop: 22, border: "1.5px solid " + (hl ? "var(--accent)" : "var(--line)") })) }, [
      h("span", { key: "l", style: Object.assign({}, label, { fontSize: 26, color: hl ? "var(--accent)" : "var(--text-secondary)" }) }, lab),
      h("span", { key: "v", style: { fontSize: 60, fontWeight: 700, fontVariantNumeric: "tabular-nums", color: hl ? "var(--accent)" : "#fff" } }, val)
    ]);
  };
  _ctx = _ctx || document.createElement("canvas").getContext("2d");
  _ctx.font = "600 34px Montserrat";
  var lw = Math.max(240, Math.ceil(Math.max(_ctx.measureText(T.hold1).width, _ctx.measureText(T.added).width)) + 8);
  var bars = t >= MK.fall ? h("div", { key: "bars", style: rise(t, MK.fall, { marginTop: 56 }) }, [
    h("div", { key: "d", style: Object.assign({}, label, { fontSize: 24, marginBottom: 22 }) }, T.down),
    [[T.hold1, T.l1000, 2 / 3, "rgb(250 135 107 / 0.55)"], [T.added, T.l1500, 1, "var(--down)"]].map(function (r, i) {
      var k = p(t, MK.fall + 0.4 + i * 0.5, 0.8);
      return h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 22, marginTop: 14 } }, [
        h("span", { key: "l", style: { width: lw, flex: "none", whiteSpace: "nowrap", fontSize: 34, fontWeight: 600, color: "var(--text-secondary)" } }, r[0]),
        h("div", { key: "b", style: { width: 300 * r[2] * k, height: 56, borderRadius: 56, background: r[3] } }),
        h("span", { key: "v", style: { fontSize: 54, fontWeight: 700, color: "var(--down)", opacity: k, whiteSpace: "nowrap" } }, r[1])
      ]);
    })
  ]) : null;
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24, tone: "muted" }, T.hypo + " · EUR/USD")),
    h("div", { key: "rows", style: { marginTop: 30 } }, [
      row("a", s + 0.1, T.lot1, T.p1),
      t >= MK.drop ? row("b", MK.drop + 0.3, T.lot2, T.p2) : null,
      t >= MK.avg ? row("c", MK.avg + 0.2, T.avg, T.pavg, true) : null
    ]),
    t >= MK.but ? h("div", { key: "pp", style: rise(t, MK.but + 0.3, { marginTop: 40, transform: "scale(1.2)", transformOrigin: "left center" }) }, h("span", { style: chip("var(--down-soft)", "var(--down)") }, T.perpip + ": " + T.m10 + "  →  " + T.m20)) : null,
    bars
  ]);
}

/* ---------- 04: break-even win rate depends on reward to risk ---------- */
function P4(t) {
  var s = MK.proof, e = MK.take;
  var tr = function (k, at, fillAt, name, risk, reward, pct, col) {
    var f = p(t, fillAt + 0.2, 1.0);
    return h("div", { key: k, style: rise(t, at, Object.assign({}, card, { padding: "40px 38px", marginTop: 30 })) }, [
      h("div", { key: "n", style: { fontSize: 56, fontWeight: 700 } }, name),
      h("div", { key: "r", style: { display: "flex", gap: 40, marginTop: 18, fontSize: 38, fontWeight: 600, color: "var(--text-secondary)" } }, [
        h("span", { key: "a" }, [T.risk + " ", h("span", { key: "v", style: { color: "var(--down)" } }, risk)]),
        h("span", { key: "b" }, [T.reward + " ", h("span", { key: "v", style: { color: "var(--accent)" } }, reward)])
      ]),
      h("div", { key: "l", style: Object.assign({}, label, { fontSize: 23, marginTop: 32 }) }, T.need),
      h("div", { key: "g", style: { display: "flex", alignItems: "center", gap: 24, marginTop: 14 } }, [
        h("div", { key: "tr", style: { position: "relative", flex: 1, height: 40, borderRadius: 40, background: "rgb(255 255 255 / 0.08)" } },
          h("div", { style: { position: "absolute", left: 0, top: 0, bottom: 0, width: (pct * f) + "%", borderRadius: 40, background: col } })),
        h("span", { key: "v", style: { width: 170, textAlign: "right", fontSize: 72, fontWeight: 700, color: col, opacity: f } }, Math.round(pct * f) + "%")
      ])
    ]);
  };
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24, tone: "muted" }, T.note)),
    tr("a", s + 0.1, MK.aneed, T.ta, "$150", "$50", 75, "var(--down)"),
    t >= MK.b ? tr("b", MK.b + 0.1, MK.bneed, T.tb, "$100", "$200", 33, "var(--accent)") : null
  ]);
}

/* ---------- 05: clone sites copy licence numbers; check the register ---------- */
function P5(t) {
  var s = MK.proof, e = MK.take, mid = MK.check;
  var firm = function (k, at, name, col) {
    return h("div", { key: k, style: rise(t, at, Object.assign({}, card, { flex: 1, padding: "40px 30px", border: "1.5px solid " + col })) }, [
      h("div", { key: "n", style: Object.assign({}, label, { fontSize: 23, color: col === "var(--down)" ? col : "var(--text-secondary)" }) }, name),
      h("div", { key: "l", style: { fontSize: 40, fontWeight: 700, marginTop: 20, lineHeight: 1.2 } }, T.lic)
    ]);
  };
  var A = t < mid ? [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24, tone: "muted" }, T.hypo)),
    h("div", { key: "f", style: { display: "flex", gap: 22, marginTop: 50 } }, [firm("a", s + 0.2, T.real, "var(--line-strong)"), firm("b", s + 1.0, T.clone, "var(--down)")]),
    h("h2", { key: "s", style: rise(t, s + 2.0, Object.assign(title(80), { marginTop: 60, color: "var(--down)" })) }, T.same)
  ] : null;
  var B = t >= mid ? [
    h("div", { key: "k", style: rise(t, mid + 0.02) }, h(OF.Kicker, { size: 24 }, T.kicker)),
    h("div", { key: "st", style: { marginTop: 40 } }, T.steps.map(function (txt, i) {
      var at = [MK.s1, MK.s2, MK.s3][i], on = t >= at;
      return h("div", { key: i, style: rise(t, at - 0.1, Object.assign({}, card, { display: "flex", alignItems: "center", gap: 26, padding: "40px 34px", marginTop: 24, border: "1.5px solid " + (on ? "var(--accent)" : "var(--line)") })) }, [
        h("span", { key: "n", style: { width: 64, height: 64, borderRadius: 64, flex: "none", background: "var(--accent)", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 700 } }, String(i + 1)),
        h("span", { key: "x", style: { fontSize: 48, fontWeight: 600, lineHeight: 1.15 } }, txt)
      ]);
    }))
  ] : null;
  return scene(t, s, e, [h("div", { key: "a" }, A), h("div", { key: "b" }, B)]);
}

function S5(t) {
  var s = MK.take, e = END;
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 24 }, T.kicker)),
    h("h1", { key: "t", style: rise(t, s + 0.1, Object.assign(title(fitSize(T.takeaway, 120, 842)), { marginTop: 60 })) }, rich(T.takeaway))
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
  /* ReelCaption splits on spaces, so "50 pips" counts as two words: split here too and step through the parts */
  var flat = [];
  ch.words.forEach(function (w) {
    var parts = w.w.split(/\s+/);
    parts.forEach(function (pt, j) { flat.push({ w: pt, s: w.s + j * (w.e - w.s) / parts.length }); });
  });
  var active = -1;
  flat.forEach(function (w, i) { if (t >= w.s - 0.04) active = i; });
  var k = clamp((t - ch.s) / 0.12);
  return h("div", { style: { position: "absolute", left: 100, right: 170, bottom: 440, opacity: k, transform: "translateY(" + (1 - k) * 10 + "px)" } },
    h(OF.ReelCaption, { text: flat.map(function (w) { return w.w; }).join(" "), variant: "highlight", active: active, size: 56 }));
}

var PROOF = { 2: P2, 3: P3, 4: P4, 5: P5 };
function Reel(props) {
  var t = props.t;
  var wash = t < MK.fact ? "rgb(250 135 107 / " + (0.10 * p(t, 0)) + ")" : "rgb(159 206 16 / " + (0.08 * (1 - p(t, MK.proof, 1.0))) + ")";
  return h(OF.Canvas, { format: "reel", grid: true, motif: false }, [
    h("div", { key: "wash", style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 60% at 30% 35%, " + wash + ", transparent 70%)" } }),
    h("div", { key: "s1" }, S1(t)), h("div", { key: "s2" }, S2(t)), h("div", { key: "pr" }, PROOF[EP.ep](t)), h("div", { key: "s5" }, S5(t)),
    t < END ? h("div", { key: "wm", style: { position: "absolute", left: 88, top: 240, opacity: 0.95 } }, h(OF.Wordmark, { size: 30 })) : null,
    t < END ? h("div", { key: "pb", style: { position: "absolute", left: 88, right: 150, top: 300, height: 1.5, background: "rgb(255 255 255 / 0.18)" } },
      h("div", { style: { width: (100 * clamp(t / END)) + "%", height: "100%", background: "var(--accent)" } })) : null,
    h("div", { key: "cap" }, Captions(t)),
    h("div", { key: "out" }, Outro(t))
  ]);
}

var root = ReactDOM.createRoot(document.getElementById("root"));
window.setT = function (t) { ReactDOM.flushSync(function () { root.render(h(Reel, { t: t })); }); return true; };
window.REEL_DUR = DUR;
window.REEL_READY = document.fonts.ready.then(function () { return window.setT(0); });
