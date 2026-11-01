"""Build the slide jobs (cover, overview, 10 companies ranked 10 to 1, close) in EN/MS/RU/ES, render them, then make the reels.
Usage: python3 build.py [--asof YYYY-MM-DD]   (prices for "where it stands" use the latest close in data/max_*.json)"""
import json, os, subprocess, sys, datetime as dt

HERE = os.path.dirname(os.path.abspath(__file__))
os.chdir(HERE)
LANGS = ['en', 'ms', 'ru', 'es']
ORDER = ['NVDA', 'INTC', 'AMD', 'AVGO', 'AAPL', 'MSFT', 'MU', 'GOOGL', 'AMZN', 'DELL']  # rank 1..10 by value lost on 30 Oct
NAMES = {'NVDA': 'Nvidia', 'INTC': 'Intel', 'AMD': 'AMD', 'AVGO': 'Broadcom', 'AAPL': 'Apple', 'MSFT': 'Microsoft', 'MU': 'Micron',
         'GOOGL': 'Alphabet', 'AMZN': 'Amazon', 'DELL': 'Dell'}
LOGO = {'NVDA': 'Nvidia_logo.svg', 'INTC': 'Intel_logo_(2020,_light_blue).svg', 'AMD': 'AMD_Logo.svg', 'AVGO': 'Broadcom_Ltd_Logo.svg',
        'AAPL': 'Apple_logo_black.svg', 'MSFT': 'Microsoft_logo_(2012).svg', 'MU': 'Micron_Technology_logo.svg',
        'GOOGL': 'Alphabet_Inc_Logo_2015.svg', 'AMZN': 'Amazon_logo.svg', 'DELL': 'Dell_Logo.svg'}
MON = {'en': 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec', 'ms': 'Jan Feb Mac Apr Mei Jun Jul Ogos Sep Okt Nov Dis',
       'ru': 'янв фев мар апр мая июн июл авг сен окт ноя дек', 'es': 'ene feb mar abr may jun jul ago sep oct nov dic'}


def dstr(d, l):
    d = dt.date.fromisoformat(d)
    return '%d %s' % (d.day, MON[l].split()[d.month - 1])


def num(x, l, nd=1):
    s = ('%.' + str(nd) + 'f') % x
    return s.replace('.', ',') if l == 'ru' else s


def money(x, l):
    s = '%.2f' % x
    if l == 'ru':
        return '$' + '{:,.2f}'.format(x).replace(',', ' ').replace('.', ',')
    return '$' + '{:,.2f}'.format(x)


def lost(b, l):
    v = int(b + 0.5)
    return {'en': '-$%dB', 'ms': '-$%d bil', 'ru': '-$%d млрд', 'es': '-$%d mil M'}[l] % v


day = {r['t']: r for r in json.load(open('data/day_losses.json'))}
stand = json.load(open('data/stand.json'))
charts = json.load(open('data/chart6m.json'))
T = json.load(open('text.json'))
asof = max(v['last_d'] for v in stand.values())
maxloss = max(-day[t]['loss'] for t in ORDER)

jobs = {l: [] for l in LANGS}
for l in LANGS:
    t = T[l]
    jobs[l].append(dict(kind='cover', tag=t['cover_tag'], h1=t['cover_h1'], h1size=t.get('cover_size', 100), sub=t['cover_sub'],
                        logos=['logos/' + LOGO[k] for k in ORDER], src=t['cover_src']))
    jobs[l].append(dict(kind='overview', tag=t['ov_tag'], big=t['ov_big'], bigLabel=t['ov_label'], stats=t['ov_stats'],
                        whyH=t['ov_whyH'], why=t['ov_why'], chinaH=t['ov_chinaH'], china=t['ov_china'], src=t['ov_src'], note=t['ov_note']))
    for rank in range(10, 0, -1):
        k = ORDER[rank - 1]
        d, s, c = day[k], stand[k], T[l]['co'][k]
        jobs[l].append(dict(kind='company', t=k, name=NAMES[k], logo='logos/' + LOGO[k], rankLabel=t['rank'] % rank,
                            pct='-%s%%' % num(abs(d['pct']), l), usd=lost(-d['loss'], l), dayLabel=t['dayLabel'],
                            rows=charts[k], rec=dict(d=s['rec_d'], p=s['rec'], label=t['recLabel'] % (money(s['rec'], l), dstr(s['rec_d'], l))),
                            lastLabel=t['lastLabel'] % (money(s['last'], l), dstr(s['last_d'], l)),
                            below='-%s%%' % num(abs(s['below']), l) if s['below'] < -0.05 else t['atRecord'],
                            belowLabel=t['belowLabel'] if s['below'] < -0.05 else t['atRecordLabel'],
                            ytd=('+' if s['ytd'] >= 0 else '-') + num(abs(s['ytd']), l) + '%', ytdLabel=t['ytdLabel'],
                            cmp=[dict(h=-day[o]['loss'] / maxloss, on=o == k) for o in ORDER], cmpLabel=t['cmpLabel'],
                            nextH=t['nextH'], next=c['next'], viewH=c.get('viewH', t['viewH']), view=c['view'],
                            src=t['src_prefix'] % dstr(s['last_d'], l) + c['src']))
    jobs[l].append(dict(kind='close', q=t['q'], follow=t['follow'], risk=t['risk']))

os.makedirs('out', exist_ok=True)
flat = []
for l in LANGS:
    for i, j in enumerate(jobs[l], 1):
        j['out'] = 'out/ts-%s-%02d.png' % (l, i)
        flat.append(j)
json.dump(flat, open('jobs.json', 'w'), ensure_ascii=False)
print('asof', asof, 'slides', len(flat))
