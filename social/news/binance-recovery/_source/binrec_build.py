"""Binance recovery update (31 Oct to 1 Nov 2026): evidence-led carousel in EN, MS, RU, ES. python3 binrec_build.py"""
import json, os, subprocess, sys, datetime as dt
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

M = os.path.dirname(os.path.abspath(__file__))
E = lambda f: f"file://{M}/{f}"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
PH = E("photo/teng.jpg")
CREDIT = {"en": "Photo: Binance co-CEO Richard Teng, 2023. Binance, CC BY 4.0, Wikimedia Commons",
          "ms": "Foto: Ketua Pegawai Eksekutif bersama Binance Richard Teng, 2023. Binance, CC BY 4.0, Wikimedia Commons",
          "ru": "Фото: сооснователь-гендиректор Binance Ричард Тенг, 2023. Binance, CC BY 4.0, Wikimedia Commons".replace("сооснователь-гендиректор", "со-CEO"),
          "es": "Foto: Richard Teng, codirector ejecutivo de Binance, 2023. Binance, CC BY 4.0, Wikimedia Commons"}
d = json.load(open(f"{M}/bnb_h.json"))["chart"]["result"][0]
rows = [(dt.datetime.fromtimestamp(t, dt.UTC), c) for t, c in zip(d["timestamp"], d["indicators"]["quote"][0]["close"]) if c]
rows = [r for r in rows if r[0] >= dt.datetime(2026, 10, 26, tzinfo=dt.UTC)]
closes = [round(c, 2) for _, c in rows]
mark = [i for i, (t, _) in enumerate(rows) if t == dt.datetime(2026, 10, 29, tzinfo=dt.UTC)][0]
assert closes[mark] == 754.91 and closes[-1] == 703.64, (closes[mark], closes[-1])
chg = (closes[-1] / closes[mark] - 1) * 100  # -6.79
T = {
 "en": dict(tag="Crypto news", head="Binance says *95%* of the stolen crypto is now covered.",
            l2="Binance, 31 Oct: *90%* replenished.", l3="Late Saturday: *95%*, Reuters reports.", l4="Still missing: *less liquid tokens*.",
            l5="Paid with Binance's money, *not users'*.", l6="Withdrawals: phase one *from 1 Nov*.", l7="Proof of reserves: *not verified yet*.",
            l8="FBI: *North Korea* was behind it.", l9="BNB is still *below its pre-hack price*.",
            chg="%.1f%%" % chg, sub="Hourly (UTC). Change since 29 Oct, 00:00 UTC", fr="$754.91", to="$703.64", sl="26 Oct", el="1 Nov, 05:00 UTC", mk="29 Oct: hack",
            q="Would you keep funds on an exchange *after a hack like this?*", follow="Follow @onfinkm for daily market stories.",
            s_x="Binance on X, 31 Oct 2026, 14:30 UTC", s_r="Reuters via The Korea Times, 1 Nov 2026", s_ct="Cointelegraph, 31 Oct 2026", s_data="Data: Yahoo Finance",
            risk="Not investment advice. Crypto and CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Berita kripto", head="Binance kata *95%* kripto yang dicuri kini telah diganti.",
            l2="Binance, 31 Okt: *90%* telah diganti.", l3="Lewat Sabtu: *95%*, lapor Reuters.", l4="Masih belum: *token kurang cair*.",
            l5="Dibayar dengan wang Binance, *bukan pengguna*.", l6="Pengeluaran: fasa pertama *dari 1 Nov*.", l7="Bukti rizab: *belum disahkan*.",
            l8="FBI: *Korea Utara* di sebaliknya.", l9="BNB masih *di bawah harga sebelum godaman*.",
            chg="%.1f%%" % chg, sub="Setiap jam (UTC). Perubahan sejak 29 Okt, 00:00 UTC", fr="$754.91", to="$703.64", sl="26 Okt", el="1 Nov, 05:00 UTC", mk="29 Okt: godaman",
            q="Adakah anda akan simpan dana di bursa *selepas godaman begini?*", follow="Ikuti @onfinkm untuk berita pasaran harian.",
            s_x="Binance di X, 31 Okt 2026, 14:30 UTC", s_r="Reuters melalui The Korea Times, 1 Nov 2026", s_ct="Cointelegraph, 31 Okt 2026", s_data="Data: Yahoo Finance",
            risk="Bukan nasihat pelaburan. Kripto dan CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Крипто-новости", head="Binance: *95%* украденной криптовалюты уже возмещено.",
            l2="Binance, 31 окт.: возмещено *90%*.", l3="Поздно в субботу: *95%*, сообщает Reuters.", l4="Ещё не хватает *менее ликвидных токенов*.",
            l5="Платит Binance, *а не пользователи*.", l6="Выводы: первый этап *с 1 ноября*.", l7="Подтверждение резервов: *пока не проверено*.",
            l8="ФБР: за атакой стоит *Северная Корея*.", l9="BNB всё ещё *ниже цены до взлома*.",
            chg=("%.1f%%" % chg).replace(".", ","), sub="По часам (UTC). Изменение с 29 окт., 00:00 UTC", fr="$754,91", to="$703,64", sl="26 окт.", el="1 нояб., 05:00 UTC", mk="29 окт.: взлом",
            q="Стали бы вы хранить средства на бирже *после такого взлома?*", follow="Подписывайтесь на @onfinkm: новости рынков каждый день.",
            s_x="Binance в X, 31 окт. 2026, 14:30 UTC", s_r="Reuters через The Korea Times, 1 нояб. 2026", s_ct="Cointelegraph, 31 окт. 2026", s_data="Данные: Yahoo Finance",
            risk="Не является инвестиционной рекомендацией. Криптовалюты и CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Noticias cripto", head="Binance dice que ya cubrió el *95%* de las criptos robadas.",
            l2="Binance, 31 oct: *90%* repuesto.", l3="El sábado por la noche: *95%*, según Reuters.", l4="Aún falta: *tokens menos líquidos*.",
            l5="Lo paga Binance, *no los usuarios*.", l6="Retiros: primera fase *desde el 1 nov*.", l7="Prueba de reservas: *aún sin verificar*.",
            l8="FBI: *Corea del Norte* estuvo detrás.", l9="BNB sigue *por debajo de su precio previo al hackeo*.",
            chg="%.1f%%" % chg, sub="Por hora (UTC). Cambio desde el 29 oct, 00:00 UTC", fr="$754.91", to="$703.64", sl="26 oct", el="1 nov, 05:00 UTC", mk="29 oct: hackeo",
            q="¿Dejarías tus fondos en un exchange *tras un hackeo así?*", follow="Sigue a @onfinkm para noticias del mercado cada día.",
            s_x="Binance en X, 31 oct 2026, 14:30 UTC", s_r="Reuters vía The Korea Times, 1 nov 2026", s_ct="Cointelegraph, 31 oct 2026", s_data="Datos: Yahoo Finance",
            risk="No es asesoramiento de inversión. Las criptomonedas y los CFD son de alto riesgo; puedes perder dinero."),
}
HS = {"en": 80, "ms": 76, "ru": 76, "es": 74}
LS = {"en": 58, "ms": 54, "ru": 54, "es": 54}
W = Week("binrec")
W.out = f"{M}/out"
for l, t in T.items():
    c = dict(avatar=AV, bg=PH, bgpos="40% 40%", lsize=LS[l])
    W.lib("BCover", dict(avatar=AV, photo=PH, pos="45% 50%", logo=E("ev/bnb_logo_t.png"), badge="95%", cx=800, cy=560, cd=250,
          tag=t["tag"], headline=t["head"], credit=CREDIT[l], hsize=HS[l]), f"br-{l}-01.png")
    W.lib("EvidenceSlide", dict(c, line=t["l2"], shot=E("ev/x_card.png"), cardPad=6, maxh=880, source=t["s_x"]), f"br-{l}-02.png")
    W.lib("EvidenceSlide", dict(c, line=t["l3"], shot=E("ev/kt_95.png"), cardPad=10, source=t["s_r"]), f"br-{l}-03.png")
    W.lib("EvidenceSlide", dict(c, line=t["l4"], shot=E("ev/kt_5.png"), cardPad=10, source=t["s_r"]), f"br-{l}-04.png")
    W.lib("EvidenceSlide", dict(c, line=t["l5"], shot=E("ev/ct_fundabsorb.png"), cardPad=10, source=t["s_ct"]), f"br-{l}-05.png")
    W.lib("EvidenceSlide", dict(c, line=t["l6"], shot=E("ev/kt_time.png"), cardPad=10, source=t["s_r"]), f"br-{l}-06.png")
    W.lib("EvidenceSlide", dict(c, line=t["l7"], shot=E("ev/ct_por.png"), cardPad=10, source=t["s_ct"]), f"br-{l}-07.png")
    W.lib("EvidenceSlide", dict(c, line=t["l8"], shot=E("ev/kt_fbi.png"), cardPad=10, source=t["s_r"]), f"br-{l}-08.png")
    W.lib("BChart", dict(c, line=t["l9"], closes=closes, mark=mark, markLabel=t["mk"], symbol="BNB", change=t["chg"], sub=t["sub"], fromLabel=t["fr"],
          toLabel=t["to"], startLabel=t["sl"], endLabel=t["el"], source=t["s_data"]), f"br-{l}-09.png")
    W.lib("SocialSlide", dict(avatar=AV, photo=PH, pos="45% 30%", top=0.5, dark=0.92, line=t["q"], sub=t["follow"], risk=t["risk"], lsize=60 if l != "en" else 64), f"br-{l}-10.png")
json.dump(W.lib_jobs, open(f"{M}/lib_jobs.json", "w"), ensure_ascii=False)
for j in W.lib_jobs:
    txt = json.dumps(j["props"], ensure_ascii=False)
    if any(ch in txt for ch in "–—!"):
        print("BAD CHAR", j["out"])
r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools",
                   env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_binrec.html"}, capture_output=True, text=True)
print(r.stdout[-200:], r.stderr[-600:])
