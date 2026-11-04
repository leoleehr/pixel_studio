"""在每個中文頁面掛上淺色主題：<head> 最前面放一小段內嵌程式，再以 defer 載入 assets/theme.js。

內嵌程式在 CSS 之前執行，第一次繪製就是使用者選的主題：淺色時加上 data-theme 並載入 theme-light.css。
按鈕與標誌切換交給 theme.js，延後執行，不阻擋首屏繪製。
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
OLD_BOOT = re.compile(r'<script data-kit="[^"]*" data-href="[^"]*">.*?</script>\r?\n?', re.S)
BOOT = (r"(function(d){var s=d.currentScript,r=d.documentElement,m=location.pathname.match(/\/(vocal|guitar|piano|songwriting)\//);"
        "r.setAttribute('data-kit',s.getAttribute('data-kit'));if(m)r.setAttribute('data-lab',m[1]);"
        "try{if(localStorage.getItem('ps-theme')==='light'){r.setAttribute('data-theme','light');var l=d.createElement('link');"
        "l.rel='stylesheet';l.id='ps-theme-css';l.href=s.getAttribute('data-href');l.setAttribute('blocking','render');d.head.appendChild(l)}}catch(e){}})(document)")
OLD_CSS = re.compile(r'<link rel="stylesheet" href="[^"]*assets/theme-light\.css[^"]*">\r?\n?')


def ver(name):
    return hashlib.sha1((SITE / 'assets' / name).read_bytes()).hexdigest()[:10]


def css_ver():
    # theme.js 裡的 CSS_V 由 build_theme_light.py 寫入，兩邊用同一個版本號
    return re.search(r"var CSS_V = '([^']*)'", (SITE / 'assets' / 'theme.js').read_text(encoding='utf-8')).group(1)


def main():
    js, cv = ver('theme.js'), css_ver()
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
        script = ('<script data-kit="' + kit + '" data-href="' + prefix + 'assets/theme-light.css?v=' + cv + '">' + BOOT + '</script>' + nl +
                  '<script src="' + prefix + 'assets/theme.js?v=' + js + '" data-kit="' + kit + '" defer></script>')
        new = OLD_CSS.sub('', OLD_JS.sub('', OLD_BOOT.sub('', html)))
        m = re.search(r'<meta name="viewport"[^>]*>\r?\n?', new) or re.search(r'<meta charset[^>]*>\r?\n?', new)
        new = new[:m.end()] + script + nl + new[m.end():]
        if new != html:
            path.write_bytes(new.encode('utf-8'))
            print('themed', rel)


if __name__ == '__main__':
    main()
