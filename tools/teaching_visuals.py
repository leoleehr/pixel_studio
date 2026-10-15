"""Install shared teaching galleries without changing slide numbering."""
import html
import json
import os
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
VERSION = '20261015revision16'

def manifest():
    return json.loads((ROOT / 'tools/teaching_visuals_manifest.json').read_text(encoding='utf-8'))

def page_path(course, lesson, source=False):
    if course == 'vocal':
        return ROOT / f'site/vocal/slides/lesson-{lesson:02d}/index.html'
    if source:
        return ROOT / ('tools/decks' if course == 'guitar' else 'tools/piano') / f'{"ch" if course == "guitar" else "p"}{lesson:02d}.html'
    return ROOT / f'site/{course}/{"ch" if course == "guitar" else "p"}{lesson:02d}/index.html'

def targets(data):
    out = {}
    for g in data:
        for t in g['targets']:
            key = (t.get('course', g['course']), t['lesson'])
            for n in t['slides']:
                out.setdefault(key, {}).setdefault(n, []).append(g['id'])
    return out

def mark_slides(text, mapping):
    n = 0
    def replace(m):
        nonlocal n
        n += 1
        tag = re.sub(r'\sdata-teaching="[^"]*"', '', m.group())
        if n in mapping:
            tag = tag[:-1] + ' data-teaching="' + ' '.join(mapping[n]) + '">'
        return tag
    return re.sub(r'<section\b[^>]*class="[^"]*\bslide\b[^"]*"[^>]*>', replace, text)

def imports(text, page, viewer=True):
    base = os.path.relpath(ROOT / 'site/assets', page.parent).replace('\\', '/')
    text = re.sub(r'<link[^>]*href="[^"]*teaching-visuals\.css[^"]*"[^>]*>\s*', '', text)
    text = text.replace('</head>', f'<link rel="stylesheet" href="{base}/teaching-visuals.css?v={VERSION}">\n</head>')
    if viewer:
        text = re.sub(r'<script[^>]*src="[^"]*(?:teaching/manifest|teaching-visuals)\.js[^"]*"[^>]*></script>\s*', '', text)
        # 投影片頁的腳本都用 defer（依序執行、不阻擋解析）；這兩支要跟著 defer，順序才會在 deck.js 之後
        d = ' defer' if re.search(r'<script src="[^"]*deck\.js[^"]*" defer>', text) else ''
        scripts = f'<script src="{base}/teaching/manifest.js?v={VERSION}"{d}></script>\n<script src="{base}/teaching-visuals.js?v={VERSION}"{d}></script>\n'
        text = text.replace('</body>', scripts + '</body>')
    return text

def install_all():
    data = manifest()
    (ROOT / 'site/assets/teaching/manifest.js').write_text('window.PixelTeachingVisuals = ' + json.dumps(data, ensure_ascii=False) + ';\n', encoding='utf-8')
    # 「放大圖解」按鈕縮圖（需要 Playwright；沒有時保留舊縮圖，頁面會在缺檔時退回原圖）
    try:
        import build_teaching_thumbs
        build_teaching_thumbs.build()
    except ImportError as e:
        print('略過縮圖：', e)
    for (course, lesson), mapping in targets(data).items():
        for source in ([False] if course == 'vocal' else [True, False]):
            p = page_path(course, lesson, source)
            if not p.exists():
                raise FileNotFoundError(p)
            text = mark_slides(p.read_text(encoding='utf-8'), mapping)
            if not source:
                text = imports(text, p)
            p.write_text(text, encoding='utf-8', newline='\n')
    for course in ['guitar', 'piano', 'vocal']:
        for filename in ['handbook.html', 'handbook-print.html']:
            p = ROOT / f'site/{course}/{filename}'
            text = imports(p.read_text(encoding='utf-8'), p, viewer=False)
            text = re.sub(r"((?:course-)?handbook\.md\?v=)[^'\"]+", r'\g<1>' + VERSION, text)
            p.write_text(text, encoding='utf-8', newline='\n')

def book_block(groups):
    lines = ['<!-- teaching-visuals-start -->', '']
    for g in groups:
        lines.append('<div class="teaching-book" data-demo-group="' + g['id'] + '"><h3>' + html.escape(g['title']) + '｜圖解示範</h3><div class="teaching-photo-grid">')
        for im in g['images']:
            src = '../assets/teaching/' + im['src'] + '?v=' + VERSION
            cap = html.escape(im['caption'])
            lines.append(f'<figure><img src="{src}" alt="{cap}" loading="eager"><figcaption>{cap}</figcaption></figure>')
        lines.append('</div>')
        if g.get('note'):
            lines.append('<p class="teaching-note">' + html.escape(g['note']) + '</p>')
        if g.get('sources'):
            lines.append('<p class="teaching-sources">' + ' · '.join('<a href="' + x['url'] + '">' + html.escape(x['label']) + '</a>' for x in g['sources']) + '</p>')
        lines.append('</div>\n')
    return '\n'.join(lines) + '\n<!-- teaching-visuals-end -->\n\n'

def enrich_markdown(md, course):
    md = re.sub(r'<!-- teaching-visuals-start -->.*?<!-- teaching-visuals-end -->\s*', '', md, flags=re.S)
    nums = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '十一': 11, '十二': 12}
    pieces = re.split(r'(?=^## )', md, flags=re.M)
    data = manifest()
    for i, part in enumerate(pieces):
        m = re.match(r'## 第(十一|十二|十|[一二三四五六七八九])(?:章|堂)', part)
        if not m:
            continue
        num = nums[m[1]]
        groups = [g for g in data if any(t.get('course', g['course']) == course and t['lesson'] == num for t in g['targets'])]
        if groups:
            pieces[i] = part.rstrip() + '\n\n' + book_block(groups)
    return ''.join(pieces).rstrip() + '\n'

def update_books():
    for course in ['guitar', 'piano', 'vocal']:
        p = ROOT / 'site' / course / ('course-handbook.md' if course == 'vocal' else 'handbook.md')
        p.write_text(enrich_markdown(p.read_text(encoding='utf-8'), course), encoding='utf-8', newline='\n')

if __name__ == '__main__':
    install_all()
    update_books()
    print('Teaching visuals installed:', len(manifest()), 'groups')
