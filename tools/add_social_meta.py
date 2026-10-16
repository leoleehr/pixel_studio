"""為所有頁面補齊社群分享與基本 head 標籤（og:title、og:description、og:image、twitter:card、description、theme-color）。

用法：python -X utf8 tools/add_social_meta.py
既有文案不覆寫；canonical 與 og:url 依正式路徑更新，並重建 sitemap。
問卷、資料移轉與錯誤頁不收錄搜尋；列印副本指向正式講義。
投影片重建後再執行一次即可。
"""
import html, pathlib, re
from urllib.parse import quote
from build_home_css import build as build_home_css

build_home_css()

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
BASE = 'https://pixel-studio.musicallanding.workers.dev/'
LABS = {'vocal', 'guitar', 'piano', 'songwriting'}
DEFAULT_DESC = '畫素音樂工作坊 Pixel Studio：流行歌唱、民謠吉他、流行鋼琴、詞曲創作四個互動課程。We Perform the Pixel of Music。'

changed = 0
sitemap_urls = []
for p in sorted(SITE.rglob('*.html')):
    rel = p.relative_to(SITE).as_posix()
    if rel.startswith('__'):
        continue
    s = p.read_text(encoding='utf-8')
    original = s
    if '</head>' not in s:
        continue
    lab = rel.split('/')[0] if rel.split('/')[0] in LABS else ''
    title = html.unescape(re.search(r'<title>([^<]*)</title>', s).group(1)).strip() if '<title>' in s else 'Pixel Studio 畫素音樂工作坊'
    m = re.search(r'<meta name="description" content="([^"]*)"', s)
    desc = html.unescape(m.group(1)) if m else DEFAULT_DESC
    image = BASE + (lab + '/' if lab else '') + 'og-image.png'
    add = []
    # Cloudflare 靜態資產使用 clean URL；列印版與入場頁指向完整內容。
    route = rel[:-10] if rel.endswith('index.html') else rel[:-5]
    if rel == 'index.html':
        route = 'studio'
    if p.name == 'handbook-print.html':
        route = route.replace('handbook-print', 'handbook')
    canonical = BASE + quote(route)
    utility = p.name in ('404.html', 'survey.html', 'data-transfer.html')
    if p.name != '404.html':
        tag = '<link rel="canonical" href="%s">' % canonical
        if re.search(r'<link\b[^>]*rel="canonical"[^>]*>', s):
            s = re.sub(r'<link\b[^>]*rel="canonical"[^>]*>', tag, s)
        else:
            add.append(tag)
        og_url = '<meta property="og:url" content="%s">' % canonical
        if 'property="og:url"' in s:
            s = re.sub(r'<meta\b[^>]*property="og:url"[^>]*>', og_url, s)
        else:
            add.append(og_url)
    if utility and 'name="robots"' not in s:
        add.append('<meta name="robots" content="noindex, follow">')
    if not utility and p.name != 'handbook-print.html' and rel != 'index.html':
        sitemap_urls.append(canonical)
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
    if s != original:
        p.write_text(s, encoding='utf-8', newline='\n')
        changed += 1
print('pages updated', changed)
# 不虛構 lastmod：此檔沒有可靠的內容日期來源，省略選填欄位。
sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
sitemap += ''.join('  <url><loc>%s</loc></url>\n' % html.escape(url) for url in sitemap_urls)
sitemap += '</urlset>\n'
(SITE / 'sitemap.xml').write_text(sitemap, encoding='utf-8', newline='\n')
print('sitemap URLs', len(sitemap_urls))
