"""為所有頁面補齊社群分享與基本 head 標籤（og:title、og:description、og:image、twitter:card、description、theme-color）。

用法：python -X utf8 tools/add_social_meta.py
已存在的標籤不覆寫；投影片重建後再執行一次即可。
"""
import html, pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
BASE = 'https://pixel-studio.musicallanding.workers.dev/'
LABS = {'vocal', 'guitar', 'piano', 'songwriting'}
DEFAULT_DESC = '畫素音樂工作坊 Pixel Studio：流行歌唱、民謠吉他、流行鋼琴、詞曲創作四個互動課程。We Perform the Pixel of Music。'

changed = 0
for p in sorted(SITE.rglob('*.html')):
    rel = p.relative_to(SITE).as_posix()
    if rel.startswith('__'):
        continue
    s = p.read_text(encoding='utf-8')
    if '</head>' not in s:
        continue
    lab = rel.split('/')[0] if rel.split('/')[0] in LABS else ''
    title = html.unescape(re.search(r'<title>([^<]*)</title>', s).group(1)).strip() if '<title>' in s else 'Pixel Studio 畫素音樂工作坊'
    m = re.search(r'<meta name="description" content="([^"]*)"', s)
    desc = html.unescape(m.group(1)) if m else DEFAULT_DESC
    image = BASE + (lab + '/' if lab else '') + 'og-image.png'
    add = []
    if not m:
        add.append('<meta name="description" content="%s">' % html.escape(desc, quote=True))
    if 'name="theme-color"' not in s:
        add.append('<meta name="theme-color" content="#101210">')
    if 'property="og:type"' not in s:
        add.append('<meta property="og:type" content="website">')
    if 'property="og:site_name"' not in s:
        add.append('<meta property="og:site_name" content="Pixel Studio 畫素音樂工作坊">')
    if 'property="og:title"' not in s:
        add.append('<meta property="og:title" content="%s">' % html.escape(title, quote=True))
    if 'property="og:description"' not in s:
        add.append('<meta property="og:description" content="%s">' % html.escape(desc, quote=True))
    if 'property="og:image"' not in s:
        add += ['<meta property="og:image" content="%s">' % image,
                '<meta property="og:image:width" content="1200">', '<meta property="og:image:height" content="630">']
    if 'name="twitter:card"' not in s:
        add.append('<meta name="twitter:card" content="summary_large_image">')
    if add:
        s = s.replace('</head>', '\n'.join(add) + '\n</head>', 1)
        p.write_text(s, encoding='utf-8', newline='\n')
        changed += 1
print('pages updated', changed)
