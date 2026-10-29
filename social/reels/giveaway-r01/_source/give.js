/* Weekly giveaway reel: prize, this week's question, how to enter, closest price wins, outro.
   Copy comes from window.R (round.js), the chart from window.GOLD (normalised daily closes). window.setT(seconds) renders one frame. */
var h = React.createElement, OF = window.OF;
var clamp = function (x) { return Math.max(0, Math.min(1, x)); };
var ease = function (x) { x = clamp(x); return 1 - Math.pow(1 - x, 3); };
var p = function (t, s, d) { return ease((t - s) / (d || 0.55)); };
var M = { ask: 3.6, how: 8.4, win: 14.2, end: 16.8 }, DUR = 20;

function rise(t, s, extra) {
  var k = p(t, s);
  return Object.assign({ opacity: k, transform: "translateY(" + (1 - k) * 32 + "px)", filter: "blur(" + (1 - k) * 8 + "px)" }, extra);
}
function rich(s) {
  return s.split("*").map(function (part, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, part) : part; });
}
var title = function (size) { return { fontSize: size, fontWeight: 700, letterSpacing: "var(--tracking-display)", lineHeight: 1.04, margin: 0, whiteSpace: "pre-line" }; };
var mono = { fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "var(--tracking-label)", textTransform: "uppercase" };
var chip = function (bg, fg) { return { display: "inline-flex", alignItems: "center", padding: "16px 30px", borderRadius: 100, background: bg, color: fg, fontSize: 32, fontWeight: 600 }; };
function scene(t, s, e, kids) {
  if (t < s - 0.01 || t > e + 0.01) return null;
  return h("div", { style: { position: "absolute", left: 88, right: 150, top: 340, bottom: 600, opacity: clamp((e - t) / 0.3) } }, kids);
}

function Prize(t) {
  var n = Math.round(R.prizeNum * p(t, 0.5, 1.4));
  return scene(t, 0, M.ask, [
    h("div", { key: "k", style: rise(t, 0.05) }, h(OF.Kicker, { size: 26 }, R.kicker)),
    h("h1", { key: "w", style: rise(t, 0.2, Object.assign(title(150), { marginTop: 90 })) }, "Win"),
    h("h1", { key: "n", style: rise(t, 0.35, Object.assign(title(230), { color: "var(--accent)", fontVariantNumeric: "tabular-nums" })) }, "$" + n),
    h("div", { key: "u", style: rise(t, 0.5, Object.assign({}, mono, { fontSize: 64, color: "var(--accent)", marginTop: 10 })) }, R.prizeUnit),
    h("div", { key: "s", style: rise(t, 1.2, { marginTop: 70, fontSize: 44, fontWeight: 500, color: "var(--text-secondary)" }) }, "One winner every week")
  ]);
}

function Ask(t) {
  var s = M.ask, W = 842, H = 470, G = window.GOLD, n = G.length;
  var X = function (i) { return i / (n - 1) * W * 0.64; }, Y = function (v) { return 40 + (1 - v) * (H - 80); };
  var k = p(t, s + 0.6, 1.8), m = Math.max(1, Math.round(k * (n - 1)));
  var d = G.slice(0, m + 1).map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
  var lx = X(n - 1), ly = Y(G[n - 1]), qx = W * 0.9, dash = p(t, s + 2.4, 0.7), q = p(t, s + 2.9, 0.5);
  var pulse = 1 + 0.06 * Math.sin((t - s) * 6) * q;
  return scene(t, s, M.how, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 26 }, "This week's question")),
    h("h1", { key: "t", style: rise(t, s + 0.15, Object.assign(title(104), { marginTop: 50 })) }, rich(R.question)),
    h("div", { key: "c", style: { position: "relative", width: W, height: H, marginTop: 40 } }, [
      h("svg", { key: "svg", width: W, height: H, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, [
        h("path", { key: "l", d: d, fill: "none", stroke: "#fff", strokeWidth: 5, strokeLinejoin: "round", opacity: p(t, s + 0.6, 0.3) }),
        dash > 0 ? h("line", { key: "d", x1: lx, y1: ly, x2: lx + (qx - lx) * dash, y2: ly, stroke: "var(--accent)", strokeWidth: 4, strokeDasharray: "12 12" }) : null,
        k >= 1 ? h("circle", { key: "n", cx: lx, cy: ly, r: 11, fill: "#fff", stroke: "#0b0b0b", strokeWidth: 4 }) : null
      ]),
      h("div", { key: "pl", style: Object.assign({}, mono, { position: "absolute", left: 0, top: -6, fontSize: 24, color: "var(--text-secondary)", opacity: p(t, s + 0.6) }) }, R.pair),
      h("div", { key: "td", style: Object.assign({}, mono, { position: "absolute", left: lx - 50, top: ly + 34, fontSize: 24, color: "#fff", opacity: p(t, s + 2.3) }) }, "Today"),
      h("div", { key: "q", style: { position: "absolute", left: qx - 60, top: ly - 60, width: 120, height: 120, borderRadius: 120, background: "var(--accent)", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 800, opacity: q, transform: "scale(" + (0.6 + 0.4 * q) * pulse + ")" } }, "?"),
      h("div", { key: "tg", style: Object.assign({}, mono, { position: "absolute", right: 0, top: ly + 80, fontSize: 26, color: "var(--accent)", whiteSpace: "nowrap", opacity: p(t, s + 3.1) }) }, R.target)
    ])
  ]);
}

function How(t) {
  var s = M.how;
  return scene(t, s, M.win, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 26 }, "How to enter")),
    h("div", { key: "f", style: { marginTop: 50 } }, R.steps.map(function (txt, i) {
      var at = s + 0.3 + i * 1.3;
      return h("div", { key: i, style: rise(t, at, { display: "flex", alignItems: "center", gap: 30, padding: "34px 34px", marginTop: i ? 24 : 0, background: "var(--surface-2)", border: "1.5px solid " + (t >= at ? "var(--accent-line)" : "var(--line)"), borderRadius: "var(--radius-l)" }) }, [
        h("span", { key: "n", style: { flex: "none", width: 64, height: 64, borderRadius: 64, background: "var(--accent)", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 34, fontWeight: 800 } }, String(i + 1)),
        h("span", { key: "x", style: { fontSize: 40, fontWeight: 600, lineHeight: 1.2 } }, txt)
      ]);
    })),
    h("div", { key: "e", style: rise(t, s + 4.1, { marginTop: 44 }) }, h("span", { style: chip("var(--accent-soft)", "var(--accent)") }, R.example))
  ]);
}

function Win(t) {
  var s = M.win;
  return scene(t, s, M.end, [
    h("div", { key: "k", style: rise(t, s + 0.02) }, h(OF.Kicker, { size: 26 }, R.kicker)),
    h("h1", { key: "t", style: rise(t, s + 0.15, Object.assign(title(120), { marginTop: 60 })) }, rich("The closest\nprice wins\n*$" + R.prizeNum + " " + R.prizeUnit + "*.")),
    h("div", { key: "c", style: rise(t, s + 0.7, { marginTop: 60 }) }, h("span", { style: chip("var(--surface-2)", "#fff") }, R.winner))
  ]);
}

function Outro(t) {
  var E = M.end;
  if (t < E - 0.05) return null;
  return h("div", { key: "o", style: { position: "absolute", inset: 0, opacity: clamp((t - E) / 0.35) } }, [
    h(OF.Canvas, { key: "c", format: "reel", grid: false, motif: true }, h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 260 } }, [
      h("div", { key: "k", style: rise(t, E + 0.1) }, h(OF.Kicker, { size: 26 }, R.eligible)),
      h("div", { key: "w", style: rise(t, E + 0.2) }, h(OF.Wordmark, { size: 120 })),
      h("div", { key: "l", style: { width: 360 * p(t, E + 0.5, 0.7), height: 1.5, background: "var(--line-strong)" } }),
      h("div", { key: "hd", style: rise(t, E + 0.7, Object.assign({}, mono, { fontSize: 34, color: "var(--accent)" })) }, R.handle),
      h("div", { key: "d", style: rise(t, E + 1.0, { position: "absolute", left: 88, right: 150, bottom: 450 }) }, h(OF.Disclaimer, { size: 24, text: R.disclaimer }))
    ]))
  ]);
}

function Reel(props) {
  var t = props.t, E = M.end;
  return h(OF.Canvas, { format: "reel", grid: true, motif: false }, [
    h("div", { key: "wash", style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 60% at 30% 35%, rgb(159 206 16 / " + (0.10 * (1 - 0.5 * p(t, M.ask, 1))) + "), transparent 70%)" } }),
    h("div", { key: "a" }, Prize(t)), h("div", { key: "b" }, Ask(t)), h("div", { key: "c" }, How(t)), h("div", { key: "d" }, Win(t)),
    t < E ? h("div", { key: "wm", style: { position: "absolute", left: 88, top: 240, opacity: 0.95 } }, h(OF.Wordmark, { size: 30 })) : null,
    t < E ? h("div", { key: "pb", style: { position: "absolute", left: 88, right: 150, top: 300, height: 1.5, background: "rgb(255 255 255 / 0.18)" } },
      h("div", { style: { width: (100 * clamp(t / E)) + "%", height: "100%", background: "var(--accent)" } })) : null,
    h("div", { key: "out" }, Outro(t))
  ]);
}

var root = ReactDOM.createRoot(document.getElementById("root"));
var cover = new URLSearchParams(location.search).get("cover");
window.REEL_DUR = DUR;
window.setT = function (t) {
  return new Promise(function (res) {
    root.render(cover ? h(OF.ReelCover, { kicker: R.kicker, title: R.cover, media: false }) : h(Reel, { t: t }));
    requestAnimationFrame(function () { requestAnimationFrame(res); });
  });
};
window.REEL_READY = document.fonts.ready.then(function () { return window.setT(0); });
