"""將 Songwriting Lab 各堂投影片原稿套上共用頁面框架。

用法：python -X utf8 tools/mkdeck_songwriting.py 1 2 3（不加參數則全部重建）
讀取 tools/songwriting/sNN.html（第一行是「堂名|英文副標|說明」，其餘是 <section class="slide"> 內容），
輸出 site/songwriting/sNN/index.html。
"""
import pathlib
import sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
from deck_cover import static_cover
from build_deck_css import build as build_deck_css

ROOT = pathlib.Path(__file__).resolve().parent.parent
ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八']
VER = "20261016a"

HEAD = '''<!doctype html>
<html lang="zh-Hant">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}｜第{zh}堂｜Songwriting Lab</title>
<meta name="description" content="Pixel Studio Songwriting Lab 第{zh}堂課堂投影片：{desc}">
<link rel="icon" href="../../assets/favicon.ico?v=2" sizes="any">
<link rel="icon" type="image/png" sizes="48x48" href="../../assets/favicon.png?v=2">
<link rel="icon" type="image/png" sizes="192x192" href="../../assets/favicon-192.png?v=2">
<link rel="apple-touch-icon" href="../../assets/apple-touch-icon.png?v=2">
<meta name="theme-color" content="#101210">
<link rel="preload" href="../../assets/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="../../assets/brand/pixel-studio-symbol-color.svg" as="image" fetchpriority="high">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<script>/* 中文字型策略：首次造訪用系統中文字型（符合 CI：正黑體／蘋方），不在首屏重排；載入完成 5 秒後，利用閒置時間逐一把本頁用得到的 Noto Sans TC 分組下載進快取，之後每頁一開始就套用 */(function(){{var K="ps-font",U="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400..900&display=swap";function apply(){{var l=document.createElement("link");l.rel="stylesheet";l.href=U;document.head.appendChild(l)}}var c=0;try{{c=localStorage.getItem(K)}}catch(e){{}}if(c){{apply();return}}var n=navigator.connection;if(n&&(n.saveData||/2g/.test(n.effectiveType||"")))return;var idle=window.requestIdleCallback||function(f){{return setTimeout(f,300)}};function inRange(r,cps){{return r.split(",").some(function(p){{var m=p.trim().replace(/^U\\+/i,"").split("-"),a=parseInt(m[0],16),b=m[1]?parseInt(m[1],16):a;return cps.some(function(x){{return x>=a&&x<=b}})}})}}function warm(){{if(!window.FontFace||!window.fetch)return;var seen={{}},cps=[],t=document.body.textContent;for(var i=0;i<t.length;i++){{var x=t.charCodeAt(i);if(x>=0x2E80&&!seen[x]){{seen[x]=1;cps.push(x)}}}}fetch(U).then(function(r){{return r.text()}}).then(function(css){{var q=[];css.replace(/@font-face\\s*\\{{([^}}]*)\\}}/g,function(_,b){{var s=/url\\(([^)]+)\\)/.exec(b),r=/unicode-range:\\s*([^;]+)/.exec(b);if(s&&r&&inRange(r[1],cps))q.push([s[1],r[1]]);return _}});function next(){{if(!q.length){{try{{localStorage.setItem(K,"1")}}catch(e){{}}return}}var j=q.shift();new FontFace("Noto Sans TC","url("+j[0]+")",{{weight:"400 900",unicodeRange:j[1]}}).load().then(function(){{idle(next,{{timeout:3000}})}},function(){{idle(next,{{timeout:3000}})}})}}idle(next,{{timeout:3000}})}}).catch(function(){{}})}}var painted=0,loaded=0,started=0;function go(){{if(painted&&loaded&&!started){{started=1;setTimeout(function(){{idle(warm,{{timeout:5000}})}},5000)}}}}try{{new PerformanceObserver(function(l){{if(!painted&&l.getEntriesByName("first-contentful-paint").length){{painted=1;go()}}}}).observe({{type:"paint",buffered:true}})}}catch(e){{painted=1}}addEventListener("load",function(){{loaded=1;setTimeout(function(){{painted=1;go()}},3000);go()}})}})()</script>
<link rel="stylesheet" href="../../assets/deck-bundle.css?v={v}">
<link rel="stylesheet" href="../theme.css?v={v}">
</head>
<body data-title="第{zh}堂｜{title}" data-course="songwriting" data-lesson="s{nn}" data-home="../index.html#lessons">
<div class="progress" id="progress"></div>
<main class="deck" id="deck">
<div class="stage" id="stage">
'''

TAIL = '''</div>
</main>

<nav class="ui" aria-label="投影片控制">
  <button type="button" id="prev" aria-label="上一張">← 上一張</button>
  <span class="counter" id="counter">1 / 1</span>
  <button type="button" id="next" aria-label="下一張">下一張 →</button>
  <button type="button" id="full">全螢幕</button>
  <a href="../index.html">課程首頁</a>
</nav>

<script src="../../assets/pixel.js?v={v}" defer></script>
<script src="../../assets/ui.js?v={v}" defer></script>
<script src="../../assets/deck.js?v={v}" defer></script>
<script src="../../assets/vendor/qrcode.min.js" defer></script>
<script src="../../assets/interact.js?v={v}" defer></script>
<script src="../../assets/config.js?v={v}" defer></script>
<script src="../../assets/backend.js?v={v}" defer></script>
<script src="../../assets/ps-audio.js?v={v}" defer></script>
<script src="../songwriting.js?v={v}" defer></script>
<script src="../songs.js?v={v}" defer></script>
<script src="../../assets/youtube.js?v={v}" defer></script>
</body>
</html>
'''


def build(n):
    nn = '%02d' % n
    src = (ROOT / 'tools' / 'songwriting' / ('s%s.html' % nn)).read_text(encoding='utf-8')
    meta, body = src.split('\n', 1)
    body = static_cover(body, '../../')  # 封面主視覺寫進 HTML（最大內容元素）
    title, _en, desc = meta.split('|')
    fmt = dict(title=title, zh=ZH[n], desc=desc, nn=nn, v=VER)
    out = ROOT / 'site' / 'songwriting' / ('s' + nn)
    out.mkdir(parents=True, exist_ok=True)
    (out / 'index.html').write_text(HEAD.format(**fmt) + body.rstrip() + '\n' + TAIL.format(**fmt), encoding='utf-8', newline='\n')
    print('built', out / 'index.html', body.count('<section class="slide'), 'slides')


if __name__ == '__main__':
    build_deck_css()  # 投影片共用樣式合併成 assets/deck-bundle.css
    for a in (sys.argv[1:] or [p.stem[1:] for p in sorted((ROOT / 'tools' / 'songwriting').glob('s[0-9][0-9].html'))]):
        build(int(a))
    # 補齊社群分享標籤（og:image 等）
    import subprocess
    subprocess.run([sys.executable, "-X", "utf8", str(ROOT / "tools" / "add_social_meta.py")], check=True)
