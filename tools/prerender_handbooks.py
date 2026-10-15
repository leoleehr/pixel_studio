"""把四個 Lab 的講義 Markdown 預先轉成 HTML，寫進 site/<lab>/handbook.html。

講義原本在瀏覽器下載 Markdown 後才用 marked 轉換，首屏要等兩次網路往返與整份轉換。
這支工具在建置時完成轉換，並照頁面腳本的規則先做好章節標題（lesson-head）、
h3 錨點與目錄列；頁面腳本看到 main[data-prerendered] 就略過下載與轉換，
其餘互動（本堂歌曲、歌名播放鈕、譜例）照常由 JS 掛上。

用法：python -X utf8 tools/prerender_handbooks.py [vocal guitar piano songwriting]
需要 Node（npx marked@12.0.2，與頁面備援用的版本相同）。
修改 handbook.md 或重產講義後要再執行一次，否則網頁會顯示舊內容。
"""
import hashlib, html, pathlib, re, subprocess, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
MARKED = 'marked@12.0.2'
CDN = 'https://cdnjs.cloudflare.com/ajax/libs/marked/12.0.2/marked.min.js'

CN = {'一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10, '十一': 11, '十二': 12}
LABS = {
    'vocal': dict(match=r'第([一二三四五六])堂', strip=r'^第.堂｜', unit='堂', prefix='lesson', label='Lesson'),
    'guitar': dict(match=r'第(十[一二]?|[一二三四五六七八九])章', strip=r'^第.{1,2}章｜', unit='章', prefix='chapter', label='Chapter'),
    'piano': dict(match=r'第(十[一二]?|[一二三四五六七八九])堂', strip=r'^第.{1,2}堂｜', unit='堂', prefix='session', label='Session'),
    'songwriting': dict(match=r'第([一二三四五六七八])堂', strip=r'^第.堂｜', unit='堂', prefix='session', label='Session'),
}


def text_of(fragment):
    return html.unescape(re.sub(r'<[^>]+>', '', fragment))


def esc(s):
    return html.escape(s, quote=True)


def md_to_html(md_path):
    npx = 'npx.cmd' if sys.platform == 'win32' else 'npx'
    out = subprocess.run([npx, '-y', MARKED, '--gfm', '-i', str(md_path)], capture_output=True, check=True)
    return out.stdout.decode('utf-8')


def image_size(path):
    """回傳圖片原始寬高；延遲載入的圖片要先寫好寬高，載入時版面才不會跳。"""
    if path.suffix == '.svg':
        head = path.read_text(encoding='utf-8', errors='ignore')[:2000]
        tag = re.search(r'<svg\b[^>]*>', head).group(0)
        w, h = re.search(r'\bwidth="([\d.]+)', tag), re.search(r'\bheight="([\d.]+)', tag)
        if w and h:
            return round(float(w.group(1))), round(float(h.group(1)))
        vb = re.search(r'viewBox="[\d.\s-]+?\s([\d.]+)\s([\d.]+)"', tag)
        return round(float(vb.group(1))), round(float(vb.group(2)))
    from PIL import Image
    with Image.open(path) as im:
        return im.size


def sized(m, base):
    src = m.group(2)
    path = (base / src.split('?')[0]).resolve()
    if not path.exists():
        return m.group(0)
    w, h = image_size(path)
    return f'<img {m.group(1)}src="{src}" width="{w}" height="{h}"'


def transform(body, cfg, colors, base):
    """照頁面腳本的規則改寫 h2／h3，回傳 (HTML, 目錄列)。"""
    heads, chips, count = [], [], 0

    def repl(m):
        nonlocal count
        tag, inner = m.group(1), m.group(2)
        text = text_of(inner)
        if tag == 'h3':
            hid = (heads[-1] if heads else 'sec') + '-' + str(count + 1)
            count += 1
            return f'<h3 id="{hid}">{inner}</h3>'
        mm = re.search(cfg['match'], text)
        n = CN[mm.group(1)] if mm else 0
        hid = f"{cfg['prefix']}-{n}" if n else 'overview'
        parts = re.split(r'\s(?=[A-Z])', text)
        title = re.sub(cfg['strip'], '', parts[0]).strip()
        small = f'<small>{esc(" ".join(parts[1:]))}</small>' if len(parts) > 1 else ''
        no = f"{cfg['label']} {n:02d}" if n else 'Overview'
        item = f"第{mm.group(1)}{cfg['unit']}　{title}" if n else '課程總覽'
        style = f' style="--c: {colors[n]};" data-dot="{colors[n]}"' if n else ''
        heads.append(hid)
        chips.append(f'<a href="#{hid}" data-id="{hid}">' + (f"第{mm.group(1)}{cfg['unit']}" if n else '課程總覽') + '</a>')
        count += 1
        return (f'<div class="lesson-head" id="{hid}"{style} data-item="{esc(item)}">'
                f'<div class="lh-no">{no}</div><h2>{esc(title)}{small}</h2></div>')

    body = re.sub(r'<(h2|h3)>(.*?)</\1>', repl, body, flags=re.S)
    body = body.replace(' loading="eager"', ' loading="lazy" decoding="async"')
    body = re.sub(r'<img (?![^>]*\bwidth=)([^>]*?)src="([^"]+)"', lambda m: sized(m, base), body)
    # 每章包成 section（content-visibility:auto），第一次排版就只計算畫面內的章節
    first, *rest = re.split(r'(?=<div class="lesson-head")', body)
    body = first + ''.join(f'<section class="hb-sec">{part}</section>\n' for part in rest)
    return body, ''.join(chips)


def patch_script(page):
    """頁面腳本改為：有預先產生的內容就略過下載與 marked；沒有才動態載入 marked。"""
    if "main.hasAttribute('data-prerendered')" in page:
        return page
    page = page.replace(f'<script src="{CDN}"></script>\n', '')
    page, k = re.subn(
        r"  fetch\('([^']+)'\)\n    \.then\(function \(r\) \{ if \(!r\.ok\) throw new Error\(r\.status\); return r\.text\(\); \}\)",
        lambda m: ("  var pre = main.hasAttribute('data-prerendered');\n"
                   "  function loadMarked() { return window.marked ? Promise.resolve() : new Promise(function (ok, no) { var s = document.createElement('script'); s.src = '" + CDN + "'; s.onload = ok; s.onerror = no; document.head.appendChild(s); }); }\n"
                   "  (pre ? Promise.resolve(null) : loadMarked().then(function () { return fetch('" + m.group(1) + "'); }).then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }))"),
        page)
    assert k == 1, 'fetch chain not found'
    old = 'main.innerHTML = marked.parse(md, { gfm: true });'
    assert page.count(old) == 1
    page = page.replace(old, 'if (md !== null) ' + old)
    loop = "      main.querySelectorAll('h2,h3').forEach(function (h) {\n"
    assert page.count(loop) == 1
    page = page.replace(loop, (
        "      if (pre) main.querySelectorAll('.lesson-head,h3').forEach(function (h) {\n"
        "        if (h.tagName === 'H3') { items.push({ href: '#' + h.id, label: h.textContent.trim(), sub: true }); return; }\n"
        "        heads.push(h); items.push({ href: '#' + h.id, label: h.getAttribute('data-item'), dot: h.getAttribute('data-dot') });\n"
        "      });\n"
        "      else " + loop.lstrip()))
    return page


def patch_wrap(page):
    """章節已在 HTML 裡包好時，頁面腳本不必再包一次。"""
    w = "      heads.forEach(function (h) { var sec = document.createElement('section');"
    if w in page and 'if (!pre) heads.forEach(function (h) { var sec' not in page:
        page = page.replace(w, "      if (!pre) heads.forEach(function (h) { var sec = document.createElement('section');")
    return page


def patch_defer(page):
    """預先產生的內容先畫出來，掛上影片卡、歌名播放鈕等互動元件的工作排到首次繪製之後。"""
    old = "(pre ? Promise.resolve(null) : loadMarked()"
    if old in page:
        page = page.replace(old, "(pre ? new Promise(function (ok) { requestAnimationFrame(function () { setTimeout(function () { ok(null); }, 0); }); }) : loadMarked()")
    # 帶錨點進入（例如 #lesson-3）時立即處理，避免捲到章節後內容才被插入而跳動
    a = "(pre ? new Promise(function (ok) {"
    if a in page and "(pre ? (location.hash ? Promise.resolve(null) :" not in page:
        page = page.replace("(pre ? new Promise(function (ok) { requestAnimationFrame(function () { setTimeout(function () { ok(null); }, 0); }); }) : loadMarked()",
                            "(pre ? (location.hash ? Promise.resolve(null) : new Promise(function (ok) { requestAnimationFrame(function () { setTimeout(function () { ok(null); }, 0); }); })) : loadMarked()")
    return page


DEEP = "<script>/* 從章節錨點進入時完整排版，落點才精準 */if(location.hash)document.documentElement.classList.add('hb-deep')</script>\n"


def patch_deep(page):
    if 'hb-deep' not in page:
        page = page.replace('</head>', DEEP + '</head>', 1)
    return page


def build(lab):
    cfg = LABS[lab]
    page_path = ROOT / 'site' / lab / 'handbook.html'
    page = page_path.read_text(encoding='utf-8')
    md_name = re.search(r"fetch\('([^'?]+)", page).group(1)
    colors = [c.strip(" '") for c in re.search(r'var COLOR = \[([^\]]*)\]', page).group(1).split(',')]
    md_path = ROOT / 'site' / lab / md_name
    body, chips = transform(md_to_html(md_path), cfg, colors, md_path.parent)
    digest = hashlib.sha1(md_path.read_bytes()).hexdigest()[:10]
    page = patch_deep(patch_defer(patch_wrap(patch_script(page))))
    page, k1 = re.subn(r'<main class="wrap md" id="content"[^>]*>.*?</main>',
                       lambda m: f'<main class="wrap md" id="content" data-prerendered="{digest}">\n{body}</main>', page, flags=re.S)
    page, k2 = re.subn(r'<div class="wrap" id="toc">.*?</div>', lambda m: f'<div class="wrap" id="toc">{chips}</div>', page, flags=re.S)
    assert k1 == 1 and k2 == 1, (lab, k1, k2)
    page_path.write_text(page, encoding='utf-8', newline='\n')
    print(f'{lab}: {md_name} -> handbook.html ({len(body) // 1024} KB, {chips.count("<a ")} 章節)')


def measure(labs):
    """以 Chrome 量每章在手機（412px）與桌機（1440px）的實際高度，寫成 section 的佔位高度。

    content-visibility 會用佔位高度代替畫面外章節；佔位越準，捲軸與跳轉越穩。
    需要 Playwright；沒有時保留預設佔位（CSS 的 2400px）。
    """
    try:
        import asyncio
        from playwright.async_api import async_playwright
    except ImportError:
        print('略過章節量測：沒有 Playwright')
        return

    async def run():
        async with async_playwright() as p:
            b = await p.chromium.launch(channel='chrome')
            for lab in labs:
                page_path = ROOT / 'site' / lab / 'handbook.html'
                hs = {}
                for key, w in (('m', 412), ('d', 1440)):
                    pg = await b.new_page(viewport={'width': w, 'height': 900})
                    # 帶錨點開啟＝完整排版並立即掛上所有影片卡與譜例
                    await pg.goto(page_path.as_uri() + '#overview', wait_until='load')
                    await pg.wait_for_timeout(2500)
                    hs[key] = await pg.evaluate("[...document.querySelectorAll('.hb-sec')].map(s=>Math.round(s.getBoundingClientRect().height))")
                    await pg.close()
                text = page_path.read_text(encoding='utf-8')
                parts = text.split('<section class="hb-sec"')
                assert len(parts) - 1 == len(hs['m']) == len(hs['d']), (lab, len(parts) - 1, len(hs['m']))
                out = parts[0]
                for i, rest in enumerate(parts[1:]):
                    rest = re.sub(r'^ style="[^"]*"', '', rest)
                    out += f'<section class="hb-sec" style="--ch-m:{hs["m"][i]}px;--ch-d:{hs["d"][i]}px"' + rest
                page_path.write_text(out, encoding='utf-8', newline='\n')
                print(f'{lab}: 章節高度 手機 {hs["m"]} 桌機 {hs["d"]}')
            await b.close()
    asyncio.run(run())


if __name__ == '__main__':
    labs = sys.argv[1:] or list(LABS)
    for lab in labs:
        build(lab)
    measure(labs)
