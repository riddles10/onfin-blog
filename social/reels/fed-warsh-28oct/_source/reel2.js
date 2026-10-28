/* Reel: the Fed holds, 28 Oct 2026. Real photos + FRED chart + official transcript quote. window.setT(seconds) renders one frame. */
var h = React.createElement, OF = window.OF;
var DUR = 56.5, END = 52.05; /* END: voiceover body ends, outro starts */
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

/* full-bleed photo with slow push-in, neutral grade and protection gradient; fades in over 0.35s */
function Photo(t, s, e, src, from, to) {
  if (t < s - 0.01 || t > e + 0.4) return null;
  var k = clamp((t - s) / (e - s)), fade = clamp((t - s) / 0.35);
  return h("div", { key: "ph" + s, style: { position: "absolute", inset: 0, opacity: fade, overflow: "hidden" } }, [
    h("img", { key: "i", src: src, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover",
      transform: "scale(" + lerp(from || 1.02, to || 1.12, k) + ")", filter: "brightness(0.58) saturate(0.85) contrast(1.05)" } }),
    h("div", { key: "g", style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgb(11 11 11 / 0.75) 0%, rgb(11 11 11 / 0.15) 32%, rgb(11 11 11 / 0.25) 55%, rgb(11 11 11 / 0.92) 100%)" } })
  ]);
}
/* scene content area: inside the reel safe zones, fades out over its last 0.3s */
function scene(t, s, e, kids, top) {
  if (t < s - 0.01 || t > e + 0.01) return null;
  return h("div", { style: { position: "absolute", left: 88, right: 150, top: top || 330, bottom: 600, opacity: clamp((e - t) / 0.3) } }, kids);
}

/* S1 0 to 4.3: hook over real flag footage */
function S1(t) {
  var e = 4.3;
  var bg = t < e + 0.4 ? h("div", { key: "v", style: { position: "absolute", inset: 0 } }, [
    h("img", { key: "f", src: "vframes/f" + String(Math.min(144, Math.floor(t * 30) + 1)).padStart(3, "0") + ".jpg",
      style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.62) saturate(0.9)" } }),
    h("div", { key: "g", style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgb(11 11 11 / 0.7) 0%, transparent 35%, rgb(11 11 11 / 0.35) 60%, rgb(11 11 11 / 0.95) 100%)" } })
  ]) : null;
  return [bg, scene(t, 0, e, [
    h("div", { key: "k", style: rise(t, 0.05) }, h(OF.Kicker, { live: true, size: 24 }, "Fed decision · 28 Oct")),
    h("h1", { key: "a", style: rise(t, 0.2, Object.assign(title(140), { marginTop: 50 })) }, accent(["The Fed ", "held", "."])),
    h("h1", { key: "b", style: rise(t, 2.1, Object.assign(title(104), { marginTop: 40 })) }, accent(["But two wanted\na ", "hike", "."]))
  ])];
}

/* S2 4.3 to 12.3: the decision over Washington */
function S2(t) {
  var s = 4.3, e = 12.3;
  return [Photo(t, s, e, "img/dc.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.1) }, h(OF.Kicker, { size: 24 }, "The decision")),
    h("div", { key: "l", style: rise(t, 4.6, Object.assign({}, label, { marginTop: 70 })) }, "Fed funds target range"),
    h("div", { key: "v", style: rise(t, 5.7, { fontSize: 132, fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, marginTop: 24, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums", textShadow: "0 2px 30px rgb(0 0 0 / 0.5)" }) }, "3.75% to 4%"),
    h("span", { key: "c", style: rise(t, 7.3, { display: "inline-flex", alignItems: "center", gap: 14, marginTop: 36, padding: "16px 30px", borderRadius: 100, background: "var(--surface-glass)", border: "1.5px solid var(--line-strong)", fontSize: 32, fontWeight: 600 }) }, [
      h("span", { key: "a", style: { color: "var(--text-tertiary)" } }, "→"), "Unchanged"]),
    h("div", { key: "sep", style: rise(t, 8.5, Object.assign({}, glass, { marginTop: 90, padding: "30px 36px", display: "flex", gap: 28, alignItems: "center" })) }, [
      h("span", { key: "u", style: { fontSize: 56, color: "var(--up)", fontWeight: 700, lineHeight: 1 } }, "↑"),
      h("div", { key: "x" }, [
        h("div", { key: "a", style: Object.assign({}, label, { fontSize: 20 }) }, "September 2026"),
        h("div", { key: "b", style: { fontSize: 38, fontWeight: 600, marginTop: 10, letterSpacing: "var(--tracking-title)" } }, "First hike in more than 3 years")
      ])
    ])
  ])];
}

/* S3 12.3 to 20.95: the path of rates since 2021, upper bound of the target range (FRED DFEDTARU) */
function S3(t) {
  var s = 12.3, e = 20.95;
  if (t < s - 0.01 || t > e + 0.01) return null;
  var W = 842, H = 520, x0 = Date.parse("2021-01-01"), x1 = Date.parse("2026-11-15");
  var X = function (d) { return (Date.parse(d) - x0) / (x1 - x0) * W; }, Y = function (v) { return H - v / 6 * H; };
  /* drawing progress follows the voiceover: peak in 2023, cuts through 2025, hike in September */
  var keys = [[12.6, "2021-01-01"], [15.6, "2023-08-01"], [18.3, "2026-01-01"], [20.2, "2026-10-28"]];
  var now = x0;
  for (var i = 0; i < keys.length; i++) {
    if (t >= keys[i][0]) now = Date.parse(keys[i][1]);
    else { var a = keys[i - 1] || [12.6, "2021-01-01"]; var k = clamp((t - a[0]) / (keys[i][0] - a[0])); now = lerp(Date.parse(a[1]), Date.parse(keys[i][1]), ease(k)); break; }
  }
  var d = "", last = null;
  RATES.forEach(function (r) {
    var tx = Date.parse(r[0]); if (tx > now) return;
    d += (d ? " L" + X(r[0]) + " " + Y(last) + " L" : "M") + X(r[0]) + " " + Y(r[1]); last = r[1];
  });
  if (last != null) d += " L" + (now - x0) / (x1 - x0) * W + " " + Y(last);
  var nx = (now - x0) / (x1 - x0) * W;
  var ann = function (k, at, x, y, lines, up) {
    return h("div", { key: k, style: rise(t, at, { position: "absolute", left: Math.min(x, W - 250), top: y, width: 260 }) }, [
      h("div", { key: "a", style: Object.assign({}, label, { fontSize: 19, color: up ? "var(--accent)" : "var(--text-tertiary)" }) }, lines[0]),
      h("div", { key: "b", style: { fontSize: 40, fontWeight: 700, marginTop: 6 } }, lines[1])
    ]);
  };
  var years = ["2021", "2022", "2023", "2024", "2025", "2026"];
  return scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.1) }, h(OF.Kicker, { size: 24 }, "The path")),
    h("h1", { key: "t", style: rise(t, s + 0.2, Object.assign(title(96), { marginTop: 40 })) }, accent(["Up, down,\nand ", "up again", "."])),
    h("div", { key: "src", style: rise(t, s + 0.6, Object.assign({}, label, { fontSize: 18, marginTop: 28, color: "var(--text-tertiary)", letterSpacing: "0.12em" })) },
      "Upper bound of the target range · Federal Reserve via FRED"),
    h("div", { key: "c", style: { position: "relative", width: W, height: H, marginTop: 56 } }, [
      h("svg", { key: "svg", width: W, height: H + 40, style: { position: "absolute", left: 0, top: 0, overflow: "visible" } }, [
        [0, 2, 4, 6].map(function (v) { return h("g", { key: "y" + v }, [
          h("line", { key: "l", x1: 0, x2: W, y1: Y(v), y2: Y(v), stroke: "rgb(255 255 255 / 0.08)", strokeWidth: 1.5 }),
          h("text", { key: "t", x: W + 12, y: Y(v) + 8, fill: "#999", fontSize: 22, fontFamily: "Montserrat", fontWeight: 600 }, v + "%")]); }),
        years.map(function (y) { return h("text", { key: y, x: X(y + "-07-01"), y: H + 36, fill: "#999", fontSize: 21, fontFamily: "Montserrat", fontWeight: 600, textAnchor: "middle" }, y); }),
        h("path", { key: "area", d: d ? d + " L" + nx + " " + H + " L0 " + H + " Z" : "", fill: "rgb(159 206 16 / 0.10)" }),
        h("path", { key: "line", d: d, fill: "none", stroke: "var(--accent)", strokeWidth: 6, strokeLinejoin: "round" }),
        last != null ? h("circle", { key: "dot", cx: nx, cy: Y(last), r: 11, fill: "var(--accent)", stroke: "#0b0b0b", strokeWidth: 4 }) : null
      ]),
      t >= 15.2 ? ann("pk", 15.2, 0, 0, ["Peak · Jul 2023", "5.5%"], false) : null,
      t >= 15.2 ? h("div", { key: "pkl", style: { position: "absolute", left: 230, top: Y(5.5), width: Math.max(0, (X("2023-07-27") - 236) * p(t, 15.3, 0.5)), borderTop: "2px dashed rgb(255 255 255 / 0.35)" } }) : null,
      t >= 18.0 ? ann("cut", 18.0, X("2025-12-11") - 330, Y(3.75) + 150, ["Low · Dec 2025", "3.75%"], false) : null,
      t >= 19.9 ? ann("hk", 19.9, W - 250, Y(4) + 44, ["Hike · Sep 2026", "4%"], true) : null
    ])
  ], 330);
}

/* S4 20.95 to 28: the vote */
function S4(t) {
  var s = 20.95, e = 28.0, dots = [];
  for (var i = 0; i < 12; i++) {
    var hike = i >= 10, appear = p(t, 21.6 + i * 0.05, 0.35), lit = hike ? p(t, i === 10 ? 23.4 : 25.5, 0.3) : 0;
    dots.push(h("div", { key: i, style: { width: 150, height: 75, borderRadius: 75, boxSizing: "border-box", opacity: appear, transform: "scale(" + (0.6 + 0.4 * appear) + ")",
      background: lit ? "rgb(159 206 16 / " + lit + ")" : "rgb(26 26 26 / 0.85)", border: "1.5px solid " + (lit > 0.5 ? "var(--accent)" : "var(--line-strong)"),
      boxShadow: lit ? "0 0 " + 40 * lit + "px var(--accent-glow)" : "none" } }));
  }
  var who = function (k, at, name, role) {
    return h("div", { key: k, style: rise(t, at, Object.assign({}, glass, { padding: "24px 30px", display: "flex", alignItems: "center", gap: 24, marginTop: 20 })) }, [
      h("span", { key: "d", style: { width: 56, height: 28, borderRadius: 28, background: "var(--accent)", flex: "none" } }),
      h("div", { key: "x" }, [h("div", { key: "n", style: { fontSize: 38, fontWeight: 600 } }, name), h("div", { key: "r", style: Object.assign({}, label, { fontSize: 19, marginTop: 8 }) }, role)])
    ]);
  };
  return [Photo(t, s, e, "img/columns.jpg", 1.12, 1.02), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.1) }, h(OF.Kicker, { size: 24 }, "The vote")),
    h("h1", { key: "t", style: rise(t, 21.7, Object.assign(title(150), { marginTop: 40 })) }, accent(["10 to ", "2", "."])),
    h("div", { key: "g", style: { display: "grid", gridTemplateColumns: "repeat(4, 150px)", gap: 24, marginTop: 50 } }, dots),
    h("div", { key: "w", style: { marginTop: 50 } }, [
      who("a", 23.3, "Lisa Cook", "Governor · wanted +0.25 pt"),
      who("b", 24.9, "Beth Hammack", "Cleveland Fed President · wanted +0.25 pt")
    ])
  ])];
}

/* S5 28 to 37.1: Warsh, in his own words (official transcript) */
function S5(t) {
  var s = 28.0, e = 37.1;
  var row = function (k, at, big, small) {
    return h("div", { key: k, style: rise(t, at, { display: "flex", alignItems: "baseline", gap: 26, padding: "26px 0", borderTop: "1.5px solid var(--line-strong)" }) }, [
      h("span", { key: "b", style: { fontSize: 56, fontWeight: 700, color: "var(--accent)", minWidth: 150, letterSpacing: "-0.03em" } }, big),
      h("span", { key: "s", style: { fontSize: 34, fontWeight: 500, lineHeight: 1.25 } }, small)
    ]);
  };
  return [Photo(t, s, e, "img/franklin.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.1) }, h(OF.Kicker, { size: 24 }, "Chair Kevin Warsh")),
    h("h1", { key: "q", style: rise(t, 30.0, Object.assign(title(118), { marginTop: 50 })) }, accent(["“Inflation is\ntoo ", "high", ".”"])),
    h("div", { key: "src", style: rise(t, 30.6, Object.assign({}, label, { fontSize: 20, marginTop: 30 })) }, "Press conference · 28 Oct 2026"),
    h("div", { key: "rows", style: { marginTop: 80 } }, [
      row("a", 32.1, "~6 yrs", "Inflation above the Fed's 2% goal"),
      row("b", 35.0, "↑", "Energy prices moving higher again")
    ])
  ])];
}

/* S6 37.1 to 44.5: the 2027 meeting change */
function S6(t) {
  var s = 37.1, e = 44.5;
  var pill = function (k, at, on, txt) {
    return h("span", { key: k, style: { width: 78, height: 40, borderRadius: 40, boxSizing: "border-box", opacity: p(t, at, 0.3),
      background: on ? "var(--accent)" : "rgb(26 26 26 / 0.85)", border: "1.5px solid " + (on ? "var(--accent)" : "var(--line-strong)") } });
  };
  var pills = []; for (var i = 0; i < 8; i++) pills.push(pill(i, 40.0 + i * 0.06, i === 7 && t >= 41.6));
  return [Photo(t, s, e, "img/magnifier.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.1) }, h(OF.Kicker, { size: 24 }, "New from 2027")),
    h("h1", { key: "t", style: rise(t, 39.1, Object.assign(title(104), { marginTop: 50 })) }, accent(["One meeting\na year for\n", "strategy", "."])),
    h("div", { key: "p", style: { display: "flex", gap: 14, marginTop: 70 } }, pills),
    h("div", { key: "l", style: rise(t, 40.3, Object.assign({}, label, { fontSize: 20, marginTop: 20 })) }, "8 meetings a year · 1 for strategy only"),
    h("div", { key: "n", style: rise(t, 43.0, { fontSize: 40, fontWeight: 600, marginTop: 60, letterSpacing: "var(--tracking-title)" }) }, "No rate vote. No policy statement.")
  ])];
}

/* S7 44.5 to 52.05: what is next for the dollar */
function S7(t) {
  var s = 44.5, e = END;
  var card = function (k, a, b, day, what, time) {
    var on = t >= a && t < b;
    return h("div", { key: k, style: rise(t, a, Object.assign({}, glass, { display: "flex", alignItems: "center", gap: 32, padding: "32px 36px", marginTop: 24,
      border: "1.5px solid " + (on ? "var(--accent)" : "var(--line)"), boxShadow: on ? "0 0 48px var(--accent-soft)" : "none" })) }, [
      h("div", { key: "d", style: Object.assign({}, label, { width: 140, flex: "none", color: on ? "var(--accent)" : "var(--text-tertiary)", lineHeight: 1.5 }) }, day),
      h("div", { key: "w", style: { flex: 1, fontSize: 40, fontWeight: 600, lineHeight: 1.1 } }, what),
      h("div", { key: "t", style: { fontSize: 26, fontWeight: 500, color: "var(--text-secondary)" } }, time)
    ]);
  };
  return [Photo(t, s, e, "img/eurodollar.jpg"), scene(t, s, e, [
    h("div", { key: "k", style: rise(t, s + 0.1) }, h(OF.Kicker, { size: 24 }, "Next for the dollar")),
    h("h1", { key: "t", style: rise(t, 44.7, Object.assign(title(104), { marginTop: 50, marginBottom: 40 })) }, accent(["Three dates\nto ", "watch", "."])),
    card("a", 45.8, 47.55, ["Fri", h("br", { key: "b" }), "6 Nov"], "US jobs report (NFP)", "13:30 UTC"),
    card("b", 47.55, 49.35, ["Tue", h("br", { key: "b" }), "10 Nov"], "US CPI inflation", "13:30 UTC"),
    card("c", 49.35, 60, ["Wed", h("br", { key: "b" }), "9 Dec"], "Fed rate decision", "19:00 UTC")
  ])];
}

/* S8 outro */
function S8(t) {
  if (t < END - 0.05) return null;
  return h("div", { key: "o", style: { position: "absolute", inset: 0, opacity: clamp((t - END) / 0.35) } }, [
    h(OF.Canvas, { key: "c", format: "reel", grid: false, motif: true }, h("div", { style: { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 56, paddingBottom: 260 } }, [
      h("div", { key: "k", style: rise(t, END + 0.1) }, h(OF.Kicker, { size: 24 }, "Follow for more")),
      h("div", { key: "w", style: rise(t, END + 0.2) }, h(OF.Wordmark, { size: 120 })),
      h("div", { key: "l", style: { width: 360 * p(t, END + 0.5, 0.7), height: 1.5, background: "var(--line-strong)" } }),
      h("div", { key: "hd", style: rise(t, END + 0.7, { fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: 32, letterSpacing: "var(--tracking-label)", textTransform: "uppercase", color: "var(--accent)" }) }, "@onfinkm"),
      h("div", { key: "d", style: rise(t, END + 1.0, { position: "absolute", left: 88, right: 150, bottom: 450 }) },
        h(OF.Disclaimer, { size: 21, text: "Sources: Federal Reserve FOMC statement and Chair Warsh's press conference transcript, 28 Oct 2026; Federal Reserve via FRED; US BLS release calendar. Images: Freepik. Not investment advice. CFDs are high-risk; you may lose money." }))
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
  return h(OF.Canvas, { format: "reel", grid: false, motif: false }, [
    h("div", { key: "s1" }, S1(t)), h("div", { key: "s2" }, S2(t)), h("div", { key: "s3" }, S3(t)), h("div", { key: "s4" }, S4(t)),
    h("div", { key: "s5" }, S5(t)), h("div", { key: "s6" }, S6(t)), h("div", { key: "s7" }, S7(t)),
    t < END ? h("div", { key: "wm", style: { position: "absolute", left: 88, top: 240, opacity: 0.95 } }, h(OF.Wordmark, { size: 30 })) : null,
    t < END ? h("div", { key: "pr", style: { position: "absolute", left: 88, right: 150, top: 300, height: 1.5, background: "rgb(255 255 255 / 0.18)" } },
      h("div", { style: { width: (100 * clamp(t / END)) + "%", height: "100%", background: "var(--accent)" } })) : null,
    h("div", { key: "cap" }, Captions(t)),
    h("div", { key: "s8" }, S8(t))
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
