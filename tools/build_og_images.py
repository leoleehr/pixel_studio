"""產生首頁與各 Lab 的社群分享圖（1200 × 630），版型沿用 Vocal Lab 的 og-image。

用法：python -X utf8 tools/build_og_images.py
需要本機 Chrome；輸出 site/og-image.png 與 site/<lab>/og-image.png。
"""
import base64, pathlib, subprocess, tempfile

ROOT = pathlib.Path(__file__).resolve().parent.parent
CHROME = r'C:/Program Files/Google/Chrome/Application/chrome.exe'
LOGO = base64.b64encode((ROOT / 'site/assets/brand/pixel-studio-horizontal.svg').read_bytes()).decode()
SPECTRUM = 'linear-gradient(90deg,#f2836f,#ee7fae,#b993e8,#86a8f2,#7cccf0,#9bd57f,#e3ea6f,#f7c06a)'
ITEMS = [
    ('og-image.png', 'Music Studio / 畫素音樂工作坊', '找到音樂裡的每個畫素。', None),
    ('vocal/og-image.png', 'Vocal Lab / 聲樂實驗室', '找到屬於自己的聲音。', '#f4a62a'),
    ('guitar/og-image.png', 'Guitar Lab / 民謠吉他', '從第一個和弦，到自己的歌曲。', '#6cbb4b'),
    ('piano/og-image.png', 'Piano Lab / 流行鋼琴', '從第一個琴鍵，到自彈自唱。', '#45b3e6'),
    ('songwriting/og-image.png', 'Songwriting Lab / 詞曲創作', '從一個念頭，到自己的歌曲。', '#e2407f'),
]
TPL = '''<!doctype html><meta charset="utf-8"><style>*{box-sizing:border-box}html,body{margin:0;width:1200px;height:630px;overflow:hidden;background:#101210;color:#f1f0e8;font-family:Arial,"Microsoft JhengHei",sans-serif}
.meta{position:absolute;left:85px;right:85px;top:57px;display:flex;justify-content:space-between;font-size:17px;letter-spacing:3px;border-bottom:1px solid #495244;padding-bottom:23px}
.logo{position:absolute;left:90px;top:141px;width:1020px;height:306px;object-fit:contain}
.slogan{position:absolute;left:85px;right:85px;bottom:74px;border-top:1px solid #495244;padding-top:26px;display:flex;justify-content:space-between;align-items:center}
.slogan b{font-size:26px;font-weight:400}.slogan span{font-size:21px;letter-spacing:2px}
.c{%s}</style>
<div class="meta"><span class="c">%s</span><span class="c">Pixel Studio · Since 2008</span></div>
<img class="logo" src="data:image/svg+xml;base64,%s"><div class="slogan"><b>We Perform the Pixel of Music</b><span class="c">%s</span></div>'''

for out, label, line, color in ITEMS:
    style = 'color:%s' % color if color else 'background:%s;-webkit-background-clip:text;background-clip:text;color:transparent' % SPECTRUM
    with tempfile.NamedTemporaryFile('w', suffix='.html', delete=False, encoding='utf-8') as f:
        f.write(TPL % (style, label, LOGO, line))
        src = f.name
    target = ROOT / 'site' / out
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars', '--force-device-scale-factor=1',
                    '--window-size=1200,630', '--screenshot=%s' % target, pathlib.Path(src).as_uri()],
                   check=True, capture_output=True)
    print('wrote', out, target.stat().st_size)
