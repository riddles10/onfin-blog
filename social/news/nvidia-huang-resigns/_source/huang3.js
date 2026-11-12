/* Jensen Huang / Nvidia board probe (9 Nov 2026): HuangCover (photo + side logo circle + badge) and ProbeChart (closes + dashed out-of-hours leg, question and risk). */
(function () {
  var h = React.createElement, OF = window.OF;
  var SH = "0 2px 18px rgba(0,0,0,0.55), 0 1px 3px rgba(0,0,0,0.6)";
  function rich(t) { var parts = String(t).split("*"); return parts.map(function (s, i) { return i % 2 ? h("span", { key: i, style: { color: "var(--accent)" } }, s) : s; }); }
  function handle(p) {
    return h("div", { style: { position: "absolute", left: 48, top: 46, zIndex: 3, display: "flex", alignItems: "center", gap: 14 } },
      h("img", { src: p.avatar, style: { width: 56, height: 56, borderRadius: "50%", boxShadow: "0 2px 10px rgba(0,0,0,0.35)" } }),
      h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 700, fontSize: 26, color: "#fff", textShadow: SH } }, "@onfinkm"));
  }
  function pill(t) {
    return h("div", { style: { alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 10, padding: "10px 18px", borderRadius: 999, background: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.22)" } },
      h("span", { style: { width: 10, height: 10, borderRadius: 999, background: "var(--accent)" } }),
      h("span", { style: { fontSize: 22, fontWeight: 600, color: "rgba(255,255,255,0.9)" } }, t));
  }
  window.OF.HuangCover = function (p) {
    var d = p.cd || 210;
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.photo, style: { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: p.pos || "50% 30%" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.05) 20%, rgba(0,0,0,0.1) 46%, rgba(0,0,0,0.9) 100%)" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: p.cx || 840, top: p.cy || 720, transform: "translate(-50%,-50%)", zIndex: 2 } },
        h("div", { style: { width: d, height: d, borderRadius: "50%", background: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
          border: "8px solid #fff", boxShadow: "0 0 0 7px rgba(255,92,92,0.95), 0 26px 60px rgba(0,0,0,0.55)" } },
          h("img", { src: p.logo, style: { width: "78%", height: "62%", objectFit: "contain" } })),
        p.badge && h("span", { style: { position: "absolute", left: "50%", bottom: -50, transform: "translateX(-50%)", padding: "12px 24px", borderRadius: 999, background: "var(--down)", color: "#fff",
          fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 42, boxShadow: "0 12px 30px rgba(0,0,0,0.45)", whiteSpace: "nowrap" } }, p.badge)),
      h("div", { style: { position: "absolute", left: 60, right: 60, bottom: 96, zIndex: 2, display: "flex", flexDirection: "column", gap: 22 } },
        p.tag && h("span", { style: { alignSelf: "flex-start", padding: p.tagBig ? "12px 26px" : "10px 20px", borderRadius: 999, background: p.tagBig ? "#e5383b" : "var(--accent)", color: p.tagBig ? "#fff" : "var(--text-on-accent)", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.tagBig ? 34 : 24, letterSpacing: p.tagBig ? "0.02em" : 0 } }, p.tag),
        h("h1", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.hsize || 80, lineHeight: 1.04, letterSpacing: "-0.02em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.headline)),
        p.sub && h("p", { style: { margin: 0, fontSize: p.subsize || 32, fontWeight: 700, lineHeight: 1.25, color: "rgba(255,255,255,0.9)", textShadow: SH } }, p.sub)),
      p.credit && h("span", { style: { position: "absolute", right: 30, bottom: 30, zIndex: 2, fontSize: 15, color: "rgba(255,255,255,0.55)" } }, p.credit));
  };
  /* closes: solid line; last: out-of-hours price drawn as a dashed red leg from the final close */
  window.OF.ProbeChart = function (p) {
    var W = 880, H = 430, pad = 34, all = p.closes.concat([p.last]), n = all.length;
    var mn = Math.min.apply(null, all), mx = Math.max.apply(null, all), lo = mn - (mx - mn) * 0.14, hi = mx + (mx - mn) * 0.16;
    var padR = 250; function X(i) { return pad + i * (W - pad - padR) / (n - 1); } function Y(v) { return pad + (hi - v) * (H - 2 * pad) / (hi - lo); }
    var main = p.closes.map(function (v, i) { return X(i) + "," + Y(v); }).join(" ");
    var k = p.closes.length - 1, im = p.closes.indexOf(Math.max.apply(null, p.closes));
    return h(OF.Canvas, { format: "post" },
      h("img", { src: p.bg, style: { position: "absolute", inset: -40, width: "calc(100% + 80px)", height: "calc(100% + 80px)", objectFit: "cover", objectPosition: p.bgpos || "50% 50%", filter: "blur(26px) brightness(0.45) saturate(1.1)" } }),
      h("div", { style: { position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(0,0,0,0.35), rgba(0,0,0,0.6))" } }),
      handle(p),
      h("div", { style: { position: "absolute", left: 60, right: 60, top: 140, bottom: 56, zIndex: 2, display: "flex", flexDirection: "column", gap: 24, justifyContent: "center" } },
        h("p", { style: { margin: 0, fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.lsize || 58, lineHeight: 1.08, letterSpacing: "-0.015em", color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.line)),
        h("div", { style: { borderRadius: 26, background: "#111", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 24px 60px rgba(0,0,0,0.55)", padding: "24px 30px 18px" } },
          h("div", { style: { display: "flex", justifyContent: "space-between", alignItems: "baseline" } },
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 40, color: "#fff" } }, p.symbol),
            h("span", { style: { fontFamily: "var(--font-display)", fontWeight: 800, fontSize: 42, color: "var(--down)" } }, p.change)),
          h("span", { style: { fontSize: 21, color: "rgba(255,255,255,0.6)" } }, p.sub),
          h("svg", { width: W - 60, height: H, viewBox: "0 0 " + W + " " + H, style: { display: "block", marginTop: 6 } },
            h("polyline", { points: main, fill: "none", stroke: "rgba(255,255,255,0.85)", strokeWidth: 5, strokeLinejoin: "round", strokeLinecap: "round" }),
            h("line", { x1: X(k), y1: Y(p.closes[k]), x2: X(n - 1), y2: Y(p.last), stroke: "#ff5c5c", strokeWidth: 6, strokeDasharray: "10 9", strokeLinecap: "round" }),
            h("circle", { cx: X(im), cy: Y(p.closes[im]), r: 9, fill: "var(--accent)" }),
            h("circle", { cx: X(k), cy: Y(p.closes[k]), r: 9, fill: "#fff" }),
            h("circle", { cx: X(n - 1), cy: Y(p.last), r: 11, fill: "#ff5c5c" }),
            h("text", { x: X(im) + 18, y: Y(p.closes[im]) + 8, fill: "var(--accent)", fontSize: 28, fontWeight: 800, fontFamily: "Montserrat" }, p.highLabel),
            h("text", { x: X(k) + 20, y: Y(p.closes[k]) - 14, fill: "#fff", fontSize: 26, fontWeight: 700, fontFamily: "Montserrat" }, p.closeLabel),
            h("text", { x: X(n - 1) + 22, y: Y(p.last) + 30, fill: "#ff5c5c", fontSize: 26, fontWeight: 800, fontFamily: "Montserrat" }, p.lastLabel)),
          h("div", { style: { display: "flex", justifyContent: "space-between", fontSize: 20, color: "rgba(255,255,255,0.5)", marginTop: 2 } },
            h("span", null, p.startLabel), h("span", null, p.endLabel)),
          p.foot && h("div", { style: { fontSize: 21, color: "rgba(255,255,255,0.65)", lineHeight: 1.35, marginTop: 12 } }, p.foot)),
        pill(p.source),
        p.q && h("p", { style: { margin: "4px 0 0", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: p.qsize || 40, lineHeight: 1.15, color: "#fff", textShadow: SH, textWrap: "balance" } }, rich(p.q)),
        p.risk && h("p", { style: { margin: 0, fontSize: 18, lineHeight: 1.35, color: "rgba(255,255,255,0.6)" } }, p.risk)));
  };
})();
