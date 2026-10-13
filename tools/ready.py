"""更新 Guitar Lab 已完成投影片的章節：首頁「投影片」連結與講義的投影片連結。

用法：python -X utf8 tools/ready.py 1 2 3 4
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
ready = sorted(int(a) for a in sys.argv[1:])

home = ROOT / 'site' / 'guitar' / 'index.html'
s = home.read_text(encoding='utf-8')
for n in ready:
    pat = re.compile(r'(<small>Chapter %d・.*?</article>)' % n, re.S)
    m = pat.search(s)
    block = m.group(1).replace('<span>投影片製作中</span>', '<a class="main" href="ch%02d/">投影片</a>' % n)
    s = s[:m.start(1)] + block + s[m.end(1):]
home.write_text(s, encoding='utf-8', newline='\n')

hb = ROOT / 'site' / 'guitar' / 'handbook.html'
h = hb.read_text(encoding='utf-8')
h = re.sub(r'window\.GUITAR_READY = \[[^\]]*\];', 'window.GUITAR_READY = [%s];' % ', '.join(map(str, ready)), h)
hb.write_text(h, encoding='utf-8', newline='\n')
print('ready:', ready)
