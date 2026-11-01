import json, os, subprocess
HERE = os.path.dirname(os.path.abspath(__file__)); os.chdir(HERE)
T = json.load(open('text.json'))
for l in ([os.environ['ONLY']] if os.environ.get('ONLY') else ['en', 'ms', 'ru', 'es']):
    slides = ['%s/out/ts-%s-%02d.png' % (HERE, l, i) for i in range(1, 14)]
    spec = {'out': '%s/reels/tech-selloff-%s.mp4' % (HERE, l), 'hook': T[l]['hook'], 'slides': slides, 'sec': 4.2, 'cover_sec': 2.8, 'box_scale': 0.8,
            'music': os.path.join(HERE, '..', 'audio', 'quick_news_beat.mp3')}
    json.dump(spec, open('reel-%s.json' % l, 'w'), ensure_ascii=False)
    env = dict(os.environ, MEME_DIR=os.path.join(HERE, '..', 'meme'))
    r = subprocess.run(['python3', os.path.join(HERE,'slideshow_scaled.py'), 'reel-%s.json' % l], env=env, capture_output=True, text=True)
    print(l, r.stdout.strip()[-200:], r.stderr[-400:])
