"""將 Songwriting Lab 各堂投影片原稿套上共用頁面框架。

用法：python -X utf8 tools/mkdeck_songwriting.py 1 2 3（不加參數則全部重建）
讀取 tools/songwriting/sNN.html（第一行是「堂名|英文副標|說明」，其餘是 <section class="slide"> 內容），
輸出 site/songwriting/sNN/index.html。
"""
import pathlib
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八']
VER = "20261014z"

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
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;500;700;900&family=Space+Grotesk:wght@500;700&display=swap" rel="stylesheet">
<link rel="stylesheet" href="../../assets/deck.css?v={v}">
<link rel="stylesheet" href="../../assets/interact.css?v={v}">
<link rel="stylesheet" href="../../assets/backend.css?v={v}">
<link rel="stylesheet" href="../../assets/responsive.css?v={v}">
<link rel="stylesheet" href="../../assets/deck-studio.css?v={v}">
<link rel="stylesheet" href="../../assets/youtube.css?v={v}">
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

<script src="../../assets/pixel.js?v={v}"></script>
<script src="../../assets/ui.js?v={v}"></script>
<script src="../../assets/deck.js?v={v}"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
<script src="../../assets/interact.js?v={v}"></script>
<script src="../../assets/config.js?v={v}"></script>
<script src="../../assets/backend.js?v={v}"></script>
<script src="../../assets/ps-audio.js?v={v}"></script>
<script src="../songwriting.js?v={v}"></script>
<script src="../songs.js?v={v}"></script>
<script src="../../assets/youtube.js?v={v}"></script>
</body>
</html>
'''


def build(n):
    nn = '%02d' % n
    src = (ROOT / 'tools' / 'songwriting' / ('s%s.html' % nn)).read_text(encoding='utf-8')
    meta, body = src.split('\n', 1)
    title, _en, desc = meta.split('|')
    fmt = dict(title=title, zh=ZH[n], desc=desc, nn=nn, v=VER)
    out = ROOT / 'site' / 'songwriting' / ('s' + nn)
    out.mkdir(parents=True, exist_ok=True)
    (out / 'index.html').write_text(HEAD.format(**fmt) + body.rstrip() + '\n' + TAIL.format(**fmt), encoding='utf-8', newline='\n')
    print('built', out / 'index.html', body.count('<section class="slide'), 'slides')


if __name__ == '__main__':
    for a in (sys.argv[1:] or [p.stem[1:] for p in sorted((ROOT / 'tools' / 'songwriting').glob('s[0-9][0-9].html'))]):
        build(int(a))
    # 補齊社群分享標籤（og:image 等）
    import subprocess
    subprocess.run([sys.executable, "-X", "utf8", str(ROOT / "tools" / "add_social_meta.py")], check=True)
