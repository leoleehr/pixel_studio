"""Typeset readable labels around the realistic tongue cutaway artwork."""
from pathlib import Path
import base64

ROOT = Path(__file__).resolve().parent.parent / 'site/assets/teaching'


def build():
    artwork = base64.b64encode((ROOT / 'tongue-anatomy.webp').read_bytes()).decode()
    svg = f'''<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="820" viewBox="0 0 1000 820" role="img" aria-labelledby="title desc">
<title id="title">舌尖在前方與稍向後的寫實剖面比較</title>
<desc id="desc">兩張口腔剖面呈現牙齒、硬顎與舌頭。左圖舌尖自然靠前，右圖舌尖稍向後抬起；舌位只作示意，不需用力捲曲。</desc>
<style>text{{font-family:"Microsoft JhengHei","Noto Sans TC",sans-serif;fill:#f4f4f0}}.label{{font-size:46px;font-weight:700}}.small{{font-size:36px}}</style>
<rect width="1000" height="820" fill="#151916"/>
<text class="label" x="55" y="65">舌尖在前方</text>
<text class="label" x="555" y="65">舌尖稍向後</text>
<image href="data:image/webp;base64,{artwork}" x="20" y="95" width="960" height="490" preserveAspectRatio="xMidYMid meet"/>
<text class="small" x="50" y="630">觀察牙齒、硬顎與舌頭的相對位置。</text>
<text class="small" x="50" y="695">舌尖輕移，不需用力過度捲曲。</text>
<text class="small" x="50" y="755">口型與舌位請配合聆聽及老師示範。</text>
</svg>'''
    (ROOT / 'tongue.svg').write_text(svg, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    build()
