"""Keep the air-path diagram's projection labels at twice their original size."""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parent.parent


def refine(svg):
    svg = svg.replace('.label{font-size:23px', '.label{font-size:46px')
    svg = svg.replace('.small{font-size:18px', '.small{font-size:36px')
    start = svg.index('<text class="label" x="520"')
    return svg[:start] + '''<text class="label" x="510" y="110">1 肺部供應氣流</text>
<text class="label" x="510" y="200">2 氣流經過氣管</text>
<text class="label" x="510" y="290">3 喉部聲帶振動</text>
<text class="label" x="510" y="380">4 聲音進入聲道</text>
<text class="small muted" x="510" y="445">咽腔、口腔與鼻腔</text>
<text class="small muted" x="510" y="490">共同改變聲音。</text>
<text class="small muted" x="510" y="550">橫膈膜與呼吸肌</text>
<text class="small muted" x="510" y="595">協助肺部通氣。</text>
<text class="small" x="90" y="665">橫膈膜（肺部下方）</text>
<text class="small muted" x="510" y="665">簡化構造示意</text></svg>'''


if __name__ == '__main__':
    path = ROOT / 'site/assets/teaching/airflow.svg'
    path.write_text(refine(path.read_text(encoding='utf-8')), encoding='utf-8', newline='\n')
