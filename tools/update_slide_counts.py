"""在各 Lab 課程首頁的課程標籤後面加上投影片張數，例如「Session 1・3 小時・34 Slides」。

用法：python -X utf8 tools/update_slide_counts.py（可重複執行；mkdeck 系列產生投影片後會自動呼叫）
張數依照每堂投影片頁裡 <section class="slide"> 的數量計算。
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
LABS = ['vocal', 'guitar', 'piano', 'songwriting']
ARTICLE = re.compile(r'(<article class="lesson"[^>]*>)(.*?)(</article>)', re.S)
SMALL = re.compile(r'<small>(.*?)</small>')
MAIN = re.compile(r'<a class="main" href="([^"]+)"')


def count(deck):
    if deck.is_dir():
        deck = deck / 'index.html'
    if not deck.exists():
        return 0
    return len(re.findall(r'<section class="slide[" ]', deck.read_text(encoding='utf-8')))


def update(lab):
    page = ROOT / 'site' / lab / 'index.html'
    s = page.read_text(encoding='utf-8')

    def fix(m):
        body = m.group(2)
        link = MAIN.search(body)
        if not link:
            return m.group(0)
        n = count(page.parent / link.group(1))
        if not n:
            return m.group(0)

        def label(sm):
            text = re.sub(r'・\d+ Slides$', '', sm.group(1))
            return '<small>%s・%d Slides</small>' % (text, n)
        return m.group(1) + SMALL.sub(label, body, count=1) + m.group(3)

    t = ARTICLE.sub(fix, s)
    if t != s:
        page.write_text(t, encoding='utf-8', newline='\n')
    print(lab, re.findall(r'<small>([^<]*Slides)</small>', t)[:2], '…')


if __name__ == '__main__':
    for lab in LABS:
        update(lab)
