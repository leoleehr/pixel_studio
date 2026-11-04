"""三支 mkdeck 共用的投影片建置流程：只更新 stage 內容，頁面外框留在已發布的頁面裡。

版本號、淺色主題、GA、語言切換、hreflang 都由各自的工具寫進 site/<lab>/<page>/index.html，
這裡不另外保存一份範本，重建投影片才不會把它們蓋回舊版。
原稿第一行「堂名|英文副標|說明」會同步到 title、description、og 與 data-title。
頁面還不存在時，從同 Lab 最接近的一堂複製外框。

用法：python -X utf8 tools/mkdeck.py [1 2 3]（三支相同，不加參數則全部重建）
"""
import html
import pathlib
import re
import subprocess
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from deck_cover import static_cover, lazy_images
from teaching_visuals import content_version, save

ROOT = pathlib.Path(__file__).resolve().parent.parent
STAGE = '<div class="stage" id="stage">'
DIGIT = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九']
LABS = {
    'guitar': dict(src='decks', pre='ch', unit='章', name='Guitar Lab', teaching=True),
    'piano': dict(src='piano', pre='p', unit='堂', name='Piano Lab', teaching=True),
    'songwriting': dict(src='songwriting', pre='s', unit='堂', name='Songwriting Lab', teaching=False,
                        # 詞庫約 270 KB，只在有骰子的投影片載入：(檔名, 需要它的標記, 插在哪支腳本前)
                        optional=[('lyric-dice.js', 'class="lyricdice"', 'works-lab.js')]),
}


def zh_num(n):
    if n <= 10:
        return '十' if n == 10 else DIGIT[n]
    return (DIGIT[n // 10] if n >= 20 else '') + '十' + DIGIT[n % 10]


def page_of(lab, n):
    return ROOT / 'site' / lab / ('%s%02d' % (LABS[lab]['pre'], n)) / 'index.html'


def lessons_of(lab):
    cfg = LABS[lab]
    found = (ROOT / 'tools' / cfg['src']).glob(cfg['pre'] + '[0-9][0-9].html')
    return sorted(int(p.stem[len(cfg['pre']):]) for p in found)


def clone_shell(lab, n):
    """新堂次：複製最接近的一堂，換掉路徑。hreflang 拿掉，由 i18n.py tag 依新網址補上。"""
    cfg = LABS[lab]
    pages = [k for k in lessons_of(lab) if k != n and page_of(lab, k).exists()]
    if not pages:
        raise FileNotFoundError('%s 沒有可複製外框的投影片' % lab)
    near = min(pages, key=lambda k: abs(k - n))
    text = page_of(lab, near).read_text(encoding='utf-8')
    old, new = '%s%02d' % (cfg['pre'], near), '%s%02d' % (cfg['pre'], n)
    end = text.index('<div class="progress"')
    head = text[:end].replace('/%s/%s/' % (lab, old), '/%s/%s/' % (lab, new)).replace('data-lesson="%s"' % old, 'data-lesson="%s"' % new)
    head = re.sub(r'<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n', '', head)
    print('new page, shell cloned from', old)
    return head + text[end:]


def set_identity(text, cfg, n, title, desc):
    zh = zh_num(n)
    full = '%s｜第%s%s｜%s' % (title, zh, cfg['unit'], cfg['name'])
    about = 'Pixel Studio %s 第%s%s課堂投影片：%s' % (cfg['name'], zh, cfg['unit'], desc)
    social = lambda s: html.escape(html.unescape(s), quote=True)  # 與 add_social_meta.py 相同的跳脫方式
    for pattern, value in ((r'<title>[^<]*</title>', '<title>%s</title>' % full),
                           (r'<meta name="description" content="[^"]*">', '<meta name="description" content="%s">' % about),
                           (r'<meta property="og:title" content="[^"]*">', '<meta property="og:title" content="%s">' % social(full)),
                           (r'<meta property="og:description" content="[^"]*">', '<meta property="og:description" content="%s">' % social(about)),
                           (r'(?<=\sdata-title=")[^"]*(?=")', '第%s%s｜%s' % (zh, cfg['unit'], title))):
        text = re.sub(pattern, lambda m: value, text, count=1)
    return text


def sync_optional(text, cfg, body, page):
    for name, marker, before in cfg.get('optional', []):
        tag = re.compile(r'<script src="[^"]*' + re.escape(name) + r'[^"]*" defer></script>\n')
        if marker not in body:
            text = tag.sub('', text)
        elif not tag.search(text):
            ver = content_version(page.parent.parent / name)
            new = '<script src="../%s?v=%s" defer></script>\n' % (name, ver)
            text = text.replace('<script src="../' + before, new + '<script src="../' + before, 1)
    return text


def build(lab, n):
    cfg = LABS[lab]
    src = (ROOT / 'tools' / cfg['src'] / ('%s%02d.html' % (cfg['pre'], n))).read_text(encoding='utf-8')
    meta, body = src.split('\n', 1)
    title, _en, desc = meta.split('|')
    body = lazy_images(static_cover(body, '../../'))  # 封面主視覺寫進 HTML；畫面外的圖延遲載入
    page = page_of(lab, n)
    text = page.read_text(encoding='utf-8') if page.exists() else clone_shell(lab, n)
    a, b = text.index(STAGE) + len(STAGE), text.rindex('</main>')
    text = text[:a] + '\n' + body.rstrip() + '\n</div>\n' + text[b:]
    text = sync_optional(set_identity(text, cfg, n, title, desc), cfg, body, page)
    page.parent.mkdir(parents=True, exist_ok=True)
    changed = save(page, text)
    print('built' if changed else 'unchanged', page.relative_to(ROOT).as_posix(), body.count('<section class="slide'), 'slides')


def run(lab):
    from build_deck_css import build as build_deck_css
    from teaching_visuals import install_all
    from update_slide_counts import update as update_slide_counts
    lessons = [int(a) for a in sys.argv[1:]] or lessons_of(lab)
    build_deck_css()  # 投影片共用樣式合併成 assets/deck-bundle.css
    for n in lessons:
        build(lab, n)
    # 補齊新頁面的社群分享標籤（既有文案不覆寫）
    subprocess.run([sys.executable, '-X', 'utf8', str(ROOT / 'tools' / 'add_social_meta.py')], check=True)
    if LABS[lab]['teaching']:
        install_all(only={(lab, n) for n in lessons})  # 只處理這次建置的堂次
    update_slide_counts(lab)  # 課程首頁的投影片張數
