"""合併 Lab 首頁、講義、問卷各自的本站樣式表，減少阻擋首次繪製的 CSS 請求。

每頁原本依序載入 5–10 個本站 CSS，各自擋住首次繪製；本工具照該頁原本的順序
（層疊順序不變）合併成 site/assets/bundles/<lab>-<page>.css，並改寫 url() 的相對路徑。
本站樣式表之間若夾著 <style>，就在那裡切段，各段分別合併。
合併後的 <link> 以 data-sources 記下來源清單，之後改了任何來源 CSS，重新執行即可；
版本號取內容雜湊，內容沒變就不會更動 HTML。

用法：python -X utf8 tools/build_page_css.py
"""
import hashlib
import posixpath
import re
from pathlib import Path

SITE = Path(__file__).resolve().parents[1] / 'site'
OUT = SITE / 'assets' / 'bundles'
PAGES = [f'{lab}/{page}.html' for lab in ('vocal', 'guitar', 'piano', 'songwriting')
         for page in ('index', 'handbook', 'survey')]

LINK = re.compile(r'<link rel="stylesheet" href="([^"]+)"(?: data-sources="([^"]+)")?>\n?')
URL = re.compile(r'url\((["\']?)(?!data:|https?:|/|#)([^)"\']+)\1\)')
NL = '\n'


def local(href):
    return not href.startswith(('http:', 'https:', '//'))


def rebase(css, src, dest_dir):
    # 來源 CSS 裡的相對路徑，改成相對於 bundles/ 資料夾
    def fix(m):
        target = posixpath.normpath(posixpath.join(posixpath.dirname(src), m.group(2)))
        return 'url(' + m.group(1) + posixpath.relpath(target, dest_dir) + m.group(1) + ')'
    return URL.sub(fix, css)


def bundle(rel, dest, hrefs):
    page_dir = posixpath.dirname(rel)
    parts = ['/* 自動產生：tools/build_page_css.py 依 ' + rel + ' 的載入順序合併。請修改來源檔後重新執行，不要直接編輯本檔。 */' + NL]
    for href in hrefs:
        src = posixpath.normpath(posixpath.join(page_dir, href.split('?')[0]))
        css = (SITE / src).read_text(encoding='utf-8').replace('\r\n', NL)
        assert '@import' not in css and '@charset' not in css, src
        parts.append(NL + '/* ===== ' + src + ' ===== */' + NL + rebase(css, src, 'assets/bundles').rstrip(NL) + NL)
    text = ''.join(parts)
    OUT.mkdir(exist_ok=True)
    out = SITE / dest
    if not out.exists() or out.read_text(encoding='utf-8') != text:
        out.write_text(text, encoding='utf-8', newline=NL)
        print('built', dest, len(text.encode('utf-8')) // 1024, 'KB')
    ver = hashlib.sha1(text.encode('utf-8')).hexdigest()[:10]
    return ('<link rel="stylesheet" href="' + posixpath.relpath(dest, page_dir) + '?v=' + ver +
            '" data-sources="' + '|'.join(hrefs) + '">' + NL)


def build_page(rel):
    path = SITE / rel
    html = path.read_text(encoding='utf-8')
    head = html[:html.index('</head>')]
    links = [m for m in LINK.finditer(head) if local(m.group(1))]
    if not links:
        return
    runs = [[links[0]]]
    for a, b in zip(links, links[1:]):
        if '<style' in head[a.end():b.start()]:
            runs.append([b])
        else:
            runs[-1].append(b)
    base = rel.replace('/', '-').replace('.html', '')
    tags = []
    for i, run in enumerate(runs):
        hrefs = []
        for m in run:  # 已合併過的 <link> 從 data-sources 取回來源
            hrefs += m.group(2).split('|') if m.group(2) else [m.group(1)]
        suffix = '-' + str(i + 1) if len(runs) > 1 else ''
        tags.append(bundle(rel, 'assets/bundles/' + base + suffix + '.css', hrefs))
    # 每段第一個本站樣式表換成該段的合併檔，其餘移除；<style>、Google 字型等其他內容留在原位
    new_head, pos = '', 0
    for run, tag in zip(runs, tags):
        for j, m in enumerate(run):
            new_head += head[pos:m.start()] + (tag if j == 0 else '')
            pos = m.end()
    new_head += head[pos:]
    if new_head != head:
        path.write_text(new_head + html[len(head):], encoding='utf-8', newline=NL)
        print('linked', rel)


def build():
    for rel in PAGES:
        build_page(rel)


if __name__ == '__main__':
    build()
