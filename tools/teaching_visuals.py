"""Install shared teaching galleries without changing slide numbering.

已掛好的標籤保留原本的版本與位置，內容相同就不寫檔。要強制升版才用：
python -X utf8 tools/teaching_visuals.py --bump 20261105a
"""
import hashlib
import html
import json
import os
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
TAGGED = re.compile(r'((?:teaching-visuals\.(?:css|js)|teaching/manifest\.js)\?v=)[^"\s>|]+')
BOOK_IMG = re.compile(r'(\.\./assets/teaching/[^"?]+)\?v=([^"]+)"')

def content_version(path):
    """新標籤的版本號取內容雜湊；換行符不同視為相同內容。"""
    return hashlib.sha1(pathlib.Path(path).read_bytes().replace(b'\r\n', b'\n')).hexdigest()[:10]

def save(path, text):
    """內容相同就不寫檔（比較時不計換行符差異）；回傳是否寫入。"""
    path = pathlib.Path(path)
    if path.exists() and path.read_text(encoding='utf-8') == text:
        return False
    path.write_text(text, encoding='utf-8', newline='\n')
    return True

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

def imports(text, page, viewer=True, bump=None):
    """補上缺少的標籤。teaching-visuals.css 可能已合併進 bundle（寫在 data-sources），同樣算已掛。"""
    base = os.path.relpath(ROOT / 'site/assets', page.parent).replace('\\', '/')
    assets = ROOT / 'site/assets'
    if 'teaching-visuals.css' not in text:
        ver = bump or content_version(assets / 'teaching-visuals.css')
        text = text.replace('</head>', f'<link rel="stylesheet" href="{base}/teaching-visuals.css?v={ver}">\n</head>')
    if viewer and not ('teaching/manifest.js' in text and 'teaching-visuals.js' in text):
        text = re.sub(r'<script[^>]*src="[^"]*(?:teaching/manifest|teaching-visuals)\.js[^"]*"[^>]*></script>\s*', '', text)
        # 投影片頁的腳本都用 defer（依序執行、不阻擋解析）；這兩支要跟著 defer，順序才會在 deck.js 之後
        d = ' defer' if re.search(r'<script src="[^"]*deck\.js[^"]*" defer>', text) else ''
        v1, v2 = bump or content_version(assets / 'teaching/manifest.js'), bump or content_version(assets / 'teaching-visuals.js')
        scripts = f'<script src="{base}/teaching/manifest.js?v={v1}"{d}></script>\n<script src="{base}/teaching-visuals.js?v={v2}"{d}></script>\n'
        text = text.replace('</body>', scripts + '</body>')
    if bump:
        text = TAGGED.sub(lambda m: m.group(1) + bump, text)
    return text

def install_all(only=None, bump=None):
    """only：要處理的 (course, lesson) 集合，例如 mkdeck 這次建置的堂次；None 表示全部。"""
    data = manifest()
    save(ROOT / 'site/assets/teaching/manifest.js', 'window.PixelTeachingVisuals = ' + json.dumps(data, ensure_ascii=False) + ';\n')
    # 「放大圖解」按鈕縮圖只補缺檔或來源有變的（需要 Playwright；沒有時保留舊縮圖，頁面會在缺檔時退回原圖）
    try:
        import build_teaching_thumbs
        build_teaching_thumbs.build()
    except ImportError as e:
        print('略過縮圖：', e)
    for (course, lesson), mapping in targets(data).items():
        if only is not None and (course, lesson) not in only:
            continue
        for source in ([False] if course == 'vocal' else [True, False]):
            p = page_path(course, lesson, source)
            if not p.exists():
                raise FileNotFoundError(p)
            text = mark_slides(p.read_text(encoding='utf-8'), mapping)
            if not source:
                text = imports(text, p, bump=bump)
            save(p, text)
    if only is not None:
        return
    for course in ['guitar', 'piano', 'vocal']:
        for filename in ['handbook.html', 'handbook-print.html']:
            p = ROOT / f'site/{course}/{filename}'
            text = imports(p.read_text(encoding='utf-8'), p, viewer=False, bump=bump)
            if bump:
                text = re.sub(r"((?:course-)?handbook\.md\?v=)[^'\"]+", r'\g<1>' + bump, text)
            save(p, text)

def image_version(im, versions, bump=None):
    """圖片版本：明確升版 > 講義裡現有的版本 > 新圖片用內容雜湊。"""
    src = '../assets/teaching/' + im['src']
    return bump or versions.get(src) or content_version(ROOT / 'site/assets/teaching' / im['src'])

def book_path(course):
    return ROOT / 'site' / course / ('course-handbook.md' if course == 'vocal' else 'handbook.md')

def book_block(groups, versions=None, bump=None):
    versions = versions or {}
    lines = ['<!-- teaching-visuals-start -->', '']
    for g in groups:
        lines.append('<div class="teaching-book" data-demo-group="' + g['id'] + '"><h3>' + html.escape(g['title']) + '｜圖解示範</h3><div class="teaching-photo-grid">')
        for im in g['images']:
            src = '../assets/teaching/' + im['src'] + '?v=' + image_version(im, versions, bump)
            cap = html.escape(im['caption'])
            lines.append(f'<figure><img src="{src}" alt="{cap}" loading="eager"><figcaption>{cap}</figcaption></figure>')
        lines.append('</div>')
        if g.get('note'):
            lines.append('<p class="teaching-note">' + html.escape(g['note']) + '</p>')
        if g.get('sources'):
            lines.append('<p class="teaching-sources">' + ' · '.join('<a href="' + x['url'] + '">' + html.escape(x['label']) + '</a>' for x in g['sources']) + '</p>')
        lines.append('</div>\n')
    return '\n'.join(lines) + '\n<!-- teaching-visuals-end -->\n\n'

def enrich_markdown(md, course, previous=None, bump=None):
    """previous：舊版講義，用來保留圖片的 ?v=；沒給時讀 site/ 裡目前的講義。"""
    if previous is None:
        path = book_path(course)
        previous = path.read_text(encoding='utf-8') if path.exists() else ''
    versions = {}
    for text in (md, previous):
        for src, ver in BOOK_IMG.findall(text):
            versions.setdefault(src, ver)
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
            # 圖解排在「互動練習與圖解」（learning-notes）之前；重跑不改變順序
            at = part.find('<!-- learning-notes-start -->')
            before, after = (part, '') if at < 0 else (part[:at], part[at:])
            pieces[i] = before.rstrip() + '\n\n' + book_block(groups, versions, bump) + after
    return ''.join(pieces).rstrip() + '\n'

def update_books(bump=None):
    for course in ['guitar', 'piano', 'vocal']:
        p = book_path(course)
        save(p, enrich_markdown(p.read_text(encoding='utf-8'), course, bump=bump))

if __name__ == '__main__':
    bump = sys.argv[sys.argv.index('--bump') + 1] if '--bump' in sys.argv else None
    install_all(bump=bump)
    update_books(bump=bump)
    print('Teaching visuals installed:', len(manifest()), 'groups')
