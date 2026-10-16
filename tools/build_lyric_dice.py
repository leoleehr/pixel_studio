"""以 pinyin-pro（瀏覽器內執行）判斷每個詞句的句尾韻母與字數，輸出歌詞創作骰子的資料檔。"""
import asyncio, io, json, sys
from playwright.async_api import async_playwright

import pathlib
ROOT = pathlib.Path(__file__).resolve().parent.parent
POOL = ROOT / 'tools' / 'lyric-dice-pool.txt'; OUT = ROOT / 'site' / 'songwriting' / 'lyric-dice.js'
# 拼音程式庫的讀音與台灣習慣不同的字詞，直接指定韻腳
FIX = {'執著': 'o'}
words, lines, sec, src, SRC = [], [], None, None, {}
for ln in io.open(POOL, encoding='utf-8').read().splitlines():
    ln = ln.strip()
    if not ln: continue
    if ln.startswith('# '): continue
    if ln.startswith('#'):
        head = ln[1:].split(' ', 1); sec = head[0]; src = head[1] if len(head) > 1 else None
        if src and sec.startswith('style'): src = 'style:' + src  # 作詞家風格（意象詞與仿寫句）
        continue
    for it in (ln.split() if sec.endswith('words') else [ln]):
        if src and src not in SRC.setdefault(it, []): SRC[it].append(src)
        (words if sec.endswith('words') else lines).append(it)

JS = r"""
(items) => {
  function groupOf(py) {
    py = (py || '').toLowerCase().replace(/v/g, 'ü');
    if (/^(zh|ch|sh|r|z|c|s)i$/.test(py)) return 'zi';
    var f = py.replace(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])/, '');
    if (/^[jqxy]u/.test(py) && f[0] === 'u') f = 'ü' + f.slice(1);
    if (py[0] === 'y' && f[0] !== 'i' && f[0] !== 'ü' && f[0] !== 'u') f = 'i' + f;
    if (py[0] === 'w' && f[0] !== 'u') f = 'u' + f;
    if (/(ng|n)$/.test(f) || /(ao|ai|ou|iu|uai)$/.test(f) && !/(ou|iu)$/.test(f)) return '';
    if (/(ou|iu|iou|uo)$/.test(f) || f === 'o') return 'o';
    if (/^(a|ia|ua)$/.test(f)) return 'a';
    if (/(ie|üe|ue|ei|ui|uei)$/.test(f) || f === 'e' || py === 'er') return 'e';
    if (/^(i|ü)$/.test(f)) return 'i';
    if (f === 'u') return 'u';
    return '';
  }
  return items.map(function (w) {
    var han = w.replace(/[^㐀-鿿]/g, '');
    var arr = pinyinPro.pinyin(han, { toneType: 'none', type: 'array' });
    var sym = pinyinPro.pinyin(han, { type: 'array' });
    var last = arr[arr.length - 1];
    return { w: w, n: han.length, v: groupOf(last), py: sym[sym.length - 1] };
  });
}
"""

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(channel='chrome'); pg = await b.new_page()
        await pg.goto('http://localhost:8765/songwriting/index.html')
        await pg.add_script_tag(url='https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js')
        W = await pg.evaluate(JS, words); L = await pg.evaluate(JS, lines)
        await b.close()
    data = {'words': {}, 'lines': {}}
    drop = []
    for kind, rows, lo, hi in (('words', W, 1, 4), ('lines', L, 5, 10)):
        for r in rows:
            r['v'] = FIX.get(r['w'], r['v'])
            if not r['v'] or not (lo <= r['n'] <= hi):
                drop.append((kind, r['w'], r['n'], r['py'])); continue
            data[kind].setdefault(r['v'], {}).setdefault(str(r['n']), [])
            if r['w'] not in data[kind][r['v']][str(r['n'])]:
                data[kind][r['v']][str(r['n'])].append(r['w'])
    for kind, lo, hi in (('words', 1, 4), ('lines', 5, 10)):
        for v in 'aoeiu':
            print(kind, v, ' '.join('%d:%d' % (n, len(data[kind].get(v, {}).get(str(n), []))) for n in range(lo, hi + 1)))
    print('dropped (teacher)', [d for d in drop if d[1] in SRC])
    used = {w for k in data for v in data[k].values() for b in v.values() for w in b}
    import collections
    per = collections.Counter(src for w in used for src in SRC.get(w, []) if src.startswith('style:'))
    print('sourced used', len(used & set(SRC)), 'of', len(SRC)); print('per lyricist', dict(per))
    io.open(OUT, 'w', encoding='utf-8', newline='\n').write(
        '/* ===== Songwriting Lab：歌詞創作骰子的詞庫與金句庫 =====\n'
        ' * 由 tools/build_lyric_dice.py 依照 tools/lyric-dice-pool.txt 產生，請勿手動修改。\n'
        ' * 依句尾字的韻母分成五個母音韻腳：a（ㄚ）、o（ㄛ ㄡ）、e（ㄜ ㄝ ㄟ）、i（ㄧ ㄩ）、u（ㄨ），再依字數分組。\n'
        ' * src：取自老師作品的詞句與歌名。\n'
        ' */\nwindow.PIXEL_LYRIC_DICE = ' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ';\n'
        'window.PIXEL_LYRIC_DICE.src = ' + json.dumps({w: s for w, s in SRC.items() if any(w in b for v in data['lines'].values() for b in v.values())}, ensure_ascii=False, separators=(',', ':')) + ';\n')

asyncio.run(main())
