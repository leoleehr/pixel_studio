"""產生「放大圖解」按鈕用的小縮圖：site/assets/teaching/thumbs/<名稱>.webp。

按鈕上的縮圖只有約 100 × 48 CSS 像素，原本直接載入原圖（單張可達 1MB 以上的內嵌點陣 SVG）。
這裡用 Chrome 依 object-fit:contain 繪製成 240 × 96 透明底 WebP（約 2.5 倍螢幕密度）。
teaching-visuals.js 優先讀縮圖，缺檔時退回原圖。

用法：python -X utf8 tools/build_teaching_thumbs.py
需要 Playwright（python -m pip install playwright）與本機 Chrome。更換教學圖後要再執行。
"""
import asyncio, io, json, pathlib, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
TEACH = ROOT / 'site' / 'assets' / 'teaching'
OUT = TEACH / 'thumbs'
W, H = 240, 96


def first_images():
    text = (TEACH / 'manifest.js').read_text(encoding='utf-8')
    data = json.loads(text[text.index('=') + 1:].strip().rstrip(';'))
    groups = data if isinstance(data, list) else data.get('groups', [])
    return sorted({g['images'][0]['src'] for g in groups if g.get('images')})


def thumb_name(src):
    return pathlib.Path(src).stem + '.webp'


async def render(names):
    from playwright.async_api import async_playwright
    from PIL import Image
    OUT.mkdir(exist_ok=True)
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='chrome')
        pg = await b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=1)
        for src in names:
            path = TEACH / src
            if not path.exists():
                print('missing', src); continue
            html = (f'<html><body style="margin:0;background:transparent">'
                    f'<img src="{path.as_uri()}" style="display:block;width:{W}px;height:{H}px;object-fit:contain"></body></html>')
            # 以 file:// 開啟暫存頁，才能讀取本機圖片（about:blank 不允許）
            tmp = pathlib.Path(tempfile.gettempdir()) / 'ps-thumb.html'
            tmp.write_text(html, encoding='utf-8')
            await pg.goto(tmp.as_uri())
            await pg.wait_for_function("document.images[0].complete")
            png = await pg.screenshot(omit_background=True, clip={'x': 0, 'y': 0, 'width': W, 'height': H})
            out = OUT / thumb_name(src)
            Image.open(io.BytesIO(png)).save(out, 'WEBP', quality=82, method=6)
            print(f'{src} -> thumbs/{out.name} ({out.stat().st_size // 1024} KB)')
        await b.close()


def build():
    asyncio.run(render(first_images()))


if __name__ == '__main__':
    build()
