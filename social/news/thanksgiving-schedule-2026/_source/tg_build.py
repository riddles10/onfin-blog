"""US Thanksgiving 2026 trading schedule (Asana: Trading schedule Nov 2026). Post card (1080x1350) in EN, MS, RU, ES and an Instagram story (EN).
python3 tg_build.py"""
import json, os, subprocess, sys
sys.path.insert(0, "/tmp/claude-0/-home-user-onfin-blog/42b2fa22-784d-52c4-a9a8-6ec4971d0812/scratchpad/wk")
from common import Week, S

M = f"{S}/tgiving"
AV = f"file://{S}/meme/logo/avatar-bolt.jpg"
IDX = "S&P 500, Nasdaq 100, Dow Jones 30, Nikkei 225, Russell 2000"
EU = "ASX 200, Euro Stoxx 50, CAC 40, DAX 40, FTSE 100"


def days(d26, d27, metals, shares, closed):
    return [dict(title=d26, rows=[[IDX, "20:00"], [EU, "23:00"], [metals, "21:30"], ["NGAS, Brent", "20:30"], ["HK50", "21:00"], [shares, closed, True]]),
            dict(title=d27, rows=[[IDX, "20:15"], [EU, "23:00"], [metals, "21:45"], ["Brent", "22:00"], ["NGAS", "20:30"], ["HK50", "21:00"], [shares, "20:00"]])]


T = {
 "en": dict(tag="Trading schedule", head="US Thanksgiving: *early closes* on 26 and 27 Nov", sub="Closing times in server time (EET, UTC+2)",
            days=days("Thursday 26 November", "Friday 27 November", "Metals, WTI", "US share CFDs", "Closed"),
            risk="Not investment advice. CFDs are high-risk; you may lose money."),
 "ms": dict(tag="Jadual dagangan", head="Thanksgiving AS: *tutup awal* pada 26 dan 27 Nov", sub="Waktu tutup mengikut waktu pelayan (EET, UTC+2)",
            days=days("Khamis 26 November", "Jumaat 27 November", "Logam, WTI", "CFD saham AS", "Ditutup"),
            risk="Bukan nasihat pelaburan. CFD berisiko tinggi; anda mungkin kehilangan wang."),
 "ru": dict(tag="Расписание торгов", head="День благодарения в США: *раннее закрытие* 26 и 27 ноября", sub="Время закрытия по серверному времени (EET, UTC+2)",
            days=days("Четверг, 26 ноября", "Пятница, 27 ноября", "Металлы, WTI", "CFD на акции США", "Закрыты"),
            risk="Не является инвестиционной рекомендацией. CFD относятся к высокорисковым инструментам; вы можете потерять деньги."),
 "es": dict(tag="Horario de trading", head="Acción de Gracias en EE. UU.: *cierre anticipado* el 26 y 27 de nov", sub="Horas de cierre en hora del servidor (EET, UTC+2)",
            days=days("Jueves 26 de noviembre", "Viernes 27 de noviembre", "Metales, WTI", "CFD de acciones de EE. UU.", "Cerrado"),
            risk="No es asesoramiento de inversión. Los CFD son de alto riesgo; puedes perder dinero."),
}


def render():
    W = Week("tgiving")
    for l, t in T.items():
        W.lib("ScheduleCard", dict(avatar=AV, format="post", tag=t["tag"], headline=t["head"], sub=t["sub"], days=t["days"], risk=t["risk"], hsize=50 if l == "en" else 44), f"tg-{l}-post.png")
    t = T["en"]
    W.lib("ScheduleCard", dict(avatar=AV, format="story", tag=t["tag"], headline=t["head"], sub=t["sub"], days=t["days"], risk=t["risk"]), "tg-en-story.png")
    W.save()
    for j in W.lib_jobs:
        if any(ch in json.dumps(j["props"], ensure_ascii=False) for ch in "–—!"):
            print("BAD CHAR", j["out"])
    page = f"{S}/iglib/library/render_tgiving.html"
    src = open(f"{S}/iglib/library/render_antspacex.html").read()
    open(page, "w").write(src.replace(f"{S}/antspacex/antspacex.js", f"{M}/sched.js"))
    r = subprocess.run(["node", "render_page.js", f"{M}/lib_jobs.json"], cwd=f"{S}/igtools", env={**os.environ, "LIB": f"{S}/iglib/library", "PAGE": "render_tgiving.html"}, capture_output=True, text=True)
    print(r.stdout[-120:], r.stderr[-600:])


if __name__ == "__main__":
    render()
