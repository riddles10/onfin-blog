/* Giveaway round 1 as a 5-slide carousel (1080x1350). ?s=1..5 picks the slide, ?p=fb swaps in the Facebook copy. */
var h = React.createElement, OF = window.OF, Q = new URLSearchParams(location.search);
var S = +(Q.get("s") || 1), FB = Q.get("p") === "fb", N = 5;
var C = {
  kicker: "Weekly giveaway · Cambodia",
  follow: FB ? "Follow our page" : "Follow @onfinkm",
  contact: FB ? "We only message winners from *this page* or *@onfinkm*." : "We only message winners from *@onfinkm*.",
  platform: FB ? "Facebook" : "Instagram"
};
function rich(s) { return s.split("*").map(function (p, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, p) : p; }); }
var mono = { fontFamily: "var(--font-mono)", fontWeight: 600, letterSpacing: "var(--tracking-label)", textTransform: "uppercase" };
var title = function (size) { return { fontSize: size, fontWeight: 700, letterSpacing: "var(--tracking-display)", lineHeight: 1.04, margin: 0, whiteSpace: "pre-line" }; };
var card = { display: "flex", alignItems: "center", gap: 30, padding: "32px 34px", background: "var(--surface-2)", border: "1.5px solid var(--line)", borderRadius: "var(--radius-l)" };
var num = function (n) { return h("span", { style: { flex: "none", width: 62, height: 62, borderRadius: 62, background: "var(--accent)", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 32, fontWeight: 800 } }, String(n)); };

function Frame(kids) {
  return h(OF.Canvas, { format: "post", grid: true, motif: false }, [
    h("div", { key: "wash", style: { position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 60% at 25% 30%, rgb(159 206 16 / 0.09), transparent 70%)" } }),
    h("div", { key: "wm", style: { position: "absolute", left: 88, top: 80 } }, h(OF.Wordmark, { size: 30 })),
    h("div", { key: "pg", style: Object.assign({}, mono, { position: "absolute", right: 88, top: 86, fontSize: 22, color: "var(--text-tertiary)" }) }, S + " / " + N),
    h("div", { key: "body", style: { position: "absolute", left: 88, right: 88, top: 190, bottom: 110 } }, kids)
  ]);
}

function Cover() {
  return Frame([
    h(OF.Kicker, { key: "k", size: 26 }, C.kicker),
    h("h1", { key: "w", style: Object.assign(title(130), { marginTop: 70 }) }, "Win"),
    h("h1", { key: "n", style: Object.assign(title(260), { color: "var(--accent)" }) }, "$50"),
    h("div", { key: "u", style: Object.assign({}, mono, { fontSize: 60, color: "var(--accent)", marginTop: 8 }) }, "USDT"),
    h("p", { key: "s", style: { margin: "64px 0 0", fontSize: 50, fontWeight: 600, lineHeight: 1.2, whiteSpace: "pre-line" } }, rich("Predict the *gold* price.\nThe closest guess wins.")),
    h("div", { key: "sw", style: Object.assign({}, mono, { position: "absolute", left: 0, bottom: 0, fontSize: 26, color: "var(--text-secondary)" }) }, "Swipe to enter  →")
  ]);
}

function Question() {
  var G = window.GOLD, n = G.length, W = 904, H = 470;
  var X = function (i) { return i / (n - 1) * W * 0.66; }, Y = function (v) { return 40 + (1 - v) * (H - 80); };
  var d = G.map(function (v, i) { return (i ? "L" : "M") + X(i).toFixed(1) + " " + Y(v).toFixed(1); }).join(" ");
  var lx = X(n - 1), ly = Y(G[n - 1]), qx = W * 0.9;
  return Frame([
    h(OF.Kicker, { key: "k", size: 26 }, "This week's question"),
    h("h1", { key: "t", style: Object.assign(title(72), { marginTop: 50 }) }, rich("Where will gold be\non *Tuesday 3 Nov*,\n20:00 Cambodia time?")),
    h("div", { key: "c", style: { position: "relative", width: W, height: H, marginTop: 50 } }, [
      h("svg", { key: "s", width: W, height: H, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, [
        h("path", { key: "l", d: d, fill: "none", stroke: "#fff", strokeWidth: 5, strokeLinejoin: "round" }),
        h("line", { key: "d", x1: lx, y1: ly, x2: qx, y2: ly, stroke: "var(--accent)", strokeWidth: 4, strokeDasharray: "12 12" }),
        h("circle", { key: "n", cx: lx, cy: ly, r: 11, fill: "#fff", stroke: "#0b0b0b", strokeWidth: 4 })
      ]),
      h("div", { key: "pl", style: Object.assign({}, mono, { position: "absolute", left: 0, top: -6, fontSize: 24, color: "var(--text-secondary)" }) }, "XAU/USD, last 3 months"),
      h("div", { key: "td", style: Object.assign({}, mono, { position: "absolute", left: lx - 50, top: ly + 34, fontSize: 24 }) }, "Today"),
      h("div", { key: "q", style: { position: "absolute", left: qx - 60, top: ly - 60, width: 120, height: 120, borderRadius: 120, background: "var(--accent)", color: "#0b0b0b", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 76, fontWeight: 800 } }, "?"),
      h("div", { key: "tg", style: Object.assign({}, mono, { position: "absolute", right: 0, top: ly + 80, fontSize: 26, color: "var(--accent)" }) }, "Tue 3 Nov, 20:00")
    ])
  ]);
}

function Enter() {
  var steps = [C.follow, "Comment your gold price prediction, e.g. 4052.75", "Enter by Sun 1 Nov, 23:59 Cambodia time"];
  return Frame([
    h(OF.Kicker, { key: "k", size: 26 }, "How to enter"),
    h("div", { key: "f", style: { marginTop: 56 } }, steps.map(function (s, i) {
      return h("div", { key: i, style: Object.assign({}, card, { marginTop: i ? 24 : 0 }) }, [num(i + 1), h("span", { key: "x", style: { fontSize: 44, fontWeight: 600, lineHeight: 1.2 } }, s)]);
    })),
    h("p", { key: "n", style: { margin: "56px 0 0", fontSize: 38, lineHeight: 1.35, color: "var(--text-secondary)" } }, "Comments on this post and on our giveaway reel both count. One entry per person across Instagram and Facebook.")
  ]);
}

function Rules() {
  var items = [
    ["The closest prediction wins", "$50 USDT, one winner in total."],
    ["The price that decides it", "XAU/USD bid on OnFin MT5 at 20:00 Cambodia time on Tue 3 Nov, from the opening price of that one-minute candle. We'll post a screenshot."],
    ["A tie?", "The earlier comment wins."],
    ["Winner announced Thu 5 Nov", "Paid in USDT (TRC-20) within 7 days of confirming."]
  ];
  return Frame([
    h(OF.Kicker, { key: "k", size: 26 }, "How we pick the winner"),
    h("div", { key: "l", style: { marginTop: 50 } }, items.map(function (it, i) {
      return h("div", { key: i, style: { padding: "28px 0", borderTop: i ? "1.5px solid var(--line)" : "none" } }, [
        h("div", { key: "a", style: { fontSize: 46, fontWeight: 700, lineHeight: 1.15 } }, it[0]),
        h("div", { key: "b", style: { fontSize: 34, lineHeight: 1.35, color: "var(--text-secondary)", marginTop: 10 } }, it[1])
      ]);
    }))
  ]);
}

function Safe() {
  var items = ["Cambodia residents aged 18 or over", "No purchase, account or deposit needed", "Full rules in the caption"];
  return Frame([
    h(OF.Kicker, { key: "k", size: 26 }, "Before you enter"),
    h("h2", { key: "t", style: Object.assign(title(76), { marginTop: 50 }) }, rich(C.contact)),
    h("p", { key: "b", style: { margin: "34px 0 0", fontSize: 40, lineHeight: 1.3, color: "var(--text-secondary)" } }, "We will never ask for a payment, a deposit, your password or card details."),
    h("div", { key: "l", style: { marginTop: 50, display: "flex", flexDirection: "column", gap: 18 } }, items.map(function (s, i) {
      return h("div", { key: i, style: { display: "flex", alignItems: "center", gap: 20, fontSize: 38, fontWeight: 600 } }, [h("span", { key: "d", style: { width: 14, height: 14, borderRadius: 14, background: "var(--accent)", flex: "none" } }), s]);
    })),
    h("div", { key: "d", style: { position: "absolute", left: 0, right: 0, bottom: 0 } }, h(OF.Disclaimer, { size: 24, text: "Not sponsored by or associated with " + C.platform + ". A prediction game, not investment advice. CFDs are high-risk; you may lose money." }))
  ]);
}

var root = ReactDOM.createRoot(document.getElementById("root"));
root.render([Cover, Question, Enter, Rules, Safe][S - 1]());
window.READY = document.fonts.ready.then(function () { return new Promise(function (r) { requestAnimationFrame(function () { requestAnimationFrame(r); }); }); });
