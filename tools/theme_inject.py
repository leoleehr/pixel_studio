"""在每個中文頁面掛上淺色主題：<head> 最前面同步載入 assets/theme.js。

theme.js 要在 CSS 之前執行，第一次繪製就是使用者選的主題；淺色時由它載入 theme-light.css。
data-kit 標明這頁用哪一套樣式：投影片 deck、入口頁 entry、隱私權頁 plain，其餘 site。
已經掛過的頁面只更新版本號。en/ 由 tools/i18n.py 從中文頁產生，跑完本工具再重建英文版。
handbook-print.html 是白底列印版，不掛。

用法：python -X utf8 tools/theme_inject.py
"""
import hashlib
import re
from pathlib import Path

SITE = Path(__file__).resolve().parents[1] / 'site'
SKIP = ('handbook-print.html',)
OLD_JS = re.compile(r'<script src="[^"]*assets/theme\.js[^"]*"[^>]*></script>\r?\n?')
OLD_CSS = re.compile(r'<link rel="stylesheet" href="[^"]*assets/theme-light\.css[^"]*">\r?\n?')


def ver(name):
    return hashlib.sha1((SITE / 'assets' / name).read_bytes()).hexdigest()[:10]


def main():
    js = ver('theme.js')
    for path in sorted(SITE.rglob('*.html')):
        rel = path.relative_to(SITE).as_posix()
        if rel.startswith('en/') or path.name in SKIP:
            continue
        html = path.read_bytes().decode('utf-8')
        if '</head>' not in html:
            continue
        nl = '\r\n' if '\r\n' in html else '\n'
        # 404 頁可能出現在任何路徑，沿用它原本的絕對路徑
        prefix = '/' if rel == '404.html' else '../' * rel.count('/')
        kit = ('deck' if 'deck-bundle.css' in html else 'entry' if rel == 'index.html'
               else 'plain' if rel == 'privacy.html' else 'site')
        script = '<script src="' + prefix + 'assets/theme.js?v=' + js + '" data-kit="' + kit + '"></script>'
        new = OLD_CSS.sub('', OLD_JS.sub('', html))
        m = re.search(r'<meta name="viewport"[^>]*>\r?\n?', new) or re.search(r'<meta charset[^>]*>\r?\n?', new)
        new = new[:m.end()] + script + nl + new[m.end():]
        if new != html:
            path.write_bytes(new.encode('utf-8'))
            print('themed', rel)


if __name__ == '__main__':
    main()
