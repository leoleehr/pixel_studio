"""把投影片共用的 6 個樣式表合併成 site/assets/deck-bundle.css。

投影片原本在 <head> 載入 6 個共用 CSS（每個都會擋住首次繪製、各自一次請求），
合併後只剩一個。來源檔照舊維護；改了任何一個來源檔都要重新執行本工具
（tools/mkdeck*.py 產生投影片前會自動執行）。

用法：python -X utf8 tools/build_deck_css.py
"""
import pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent
ASSETS = ROOT / 'site' / 'assets'
# 與投影片產生器原本的 <link> 順序相同（層疊順序不變）
SOURCES = ['deck.css', 'interact.css', 'backend.css', 'responsive.css', 'deck-studio.css', 'youtube.css']
OUT = ASSETS / 'deck-bundle.css'


def build():
    from build_home_css import build as build_home
    build_home()
    parts = ['/* 自動產生：由 tools/build_deck_css.py 合併 ' + '、'.join(SOURCES) + '。請修改來源檔後重新執行，不要直接編輯本檔。 */\n']
    for name in SOURCES:
        css = (ASSETS / name).read_text(encoding='utf-8').replace('\r\n', '\n')
        assert '@import' not in css and '@charset' not in css, name
        parts.append(f'\n/* ===== {name} ===== */\n' + css.rstrip('\n') + '\n')
    text = ''.join(parts)
    if not OUT.exists() or OUT.read_text(encoding='utf-8') != text:
        OUT.write_text(text, encoding='utf-8', newline='\n')
        print('built', OUT.name, len(text) // 1024, 'KB')
    return text


if __name__ == '__main__':
    build()
