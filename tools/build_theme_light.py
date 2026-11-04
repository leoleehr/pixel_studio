"""產生淺色主題 site/assets/theme-light.css。

全站原本只有深色版，顏色散在十幾個樣式表裡。本工具逐條讀原始樣式表，把每條規則裡跟顏色有關的宣告
（color、background、border、shadow、fill、自訂色彩變數…）抄一份出來，換成淺色底適用的顏色，
選擇器前面加上 html[data-theme="light"][data-kit=…]。加上的前綴讓權重固定多 (0,2,1)，
原本的層疊先後照樣成立；沒有寫顏色、只用 var() 的宣告也一起抄，才不會被抬高權重的規則蓋掉。

換色原則：
- 中性色（灰、近黑、近白）：底色與分隔線明暗對調，深色底變紙白；字色對調後仍保有對比。
  深色版裡的亮底（白卡、米色區塊）與壓在上面的深色字維持原樣。
- 品牌色當底色（按鈕、色塊、彩虹漸層）保持原色；當字色或細線時加深到在紙白底讀得清楚，色相不變。
- 品牌色變數（--amber、--accent、--c…）拿來當字色時，用 color-mix 加深。
- 規則本身有品牌色底時，上面的深色字維持深色。
- 陰影保留深色、降低濃度；白色光暈改成淡淡的深色。

最後接上 tools/theme/light-manual.css 的手動微調（按鈕、標誌、個別元件）。
theme.js 只在淺色模式載入本檔，深色模式完全不受影響。

用法：python -X utf8 tools/build_theme_light.py，然後 python -X utf8 tools/theme_inject.py 更新各頁版本號。
"""
import colorsys
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SITE = ROOT / 'site'
A = 'assets/'
KITS = [
    ('site', [A + 'site.css', A + 'backend.css', A + 'responsive.css', A + 'studio.css', A + 'home-art-direction.css',
              A + 'youtube.css', A + 'hub.css', A + 'teaching-visuals.css', A + 'learning-tools.css',
              'vocal/survey.html', 'guitar/survey.html', 'vocal/data-transfer.html']),
    ('deck', [A + 'deck.css', A + 'interact.css', A + 'backend.css', A + 'responsive.css', A + 'deck-studio.css',
              A + 'youtube.css', A + 'teaching-visuals.css', A + 'learning-tools.css']),
    ('entry', ['index.html']),
    ('plain', ['privacy.html']),
]
LABS = ['guitar', 'piano', 'songwriting']
MANUAL = ROOT / 'tools' / 'theme' / 'light-manual.css'
OUT = SITE / 'assets' / 'theme-light.css'

PAPER = (0xf4 / 255, 0xf4 / 255, 0xf0 / 255)
# 品牌色當字色時和黑色混合的比例：在紙白底上至少 4.8:1（小字 AA 4.5 再留一點餘裕給帶色卡片）
BRAND_VARS = {'amber': 57, 'accent': 57, 'c': 56, 'lab': 56, 'red': 80, 'green': 61, 'blue': 72, 'navy': 72,
              'gold': 48, 'yellow': 48, 'pink': 80, 'purple': 85, 'cyan': 62, 'lime': 48, 'h': 56,
              'pixel-amber': 57, 'pixel-green': 61, 'pixel-cyan': 62, 'pixel-pink': 80, 'pixel-lime': 48,
              'pixel-red': 80, 'pixel-blue': 85, 'pixel-purple': 85}
TEXT_MIN = 4.8
DARK_VARS = ('bg', 'paper', 'black', 'pixel-black', 'surface', 'card')
# 中性底色變數；background 用到其他變數（--amber、--c、--sc…）就當成品牌色塊
NEUTRAL_VARS = DARK_VARS + ('card-2', 'line', 'line-2', 'frame', 'ink', 'muted', 'faint', 'home-paper', 'spectrum-light')
COLOR_PROPS = re.compile(r'^(-webkit-text-fill-color|-webkit-text-stroke(-color)?|color|caret-color|accent-color|'
                         r'text-decoration(-color)?|text-emphasis-color|background(-color|-image)?|border(-(top|right|bottom|left|block|inline)(-(start|end))?)?(-color)?|'
                         r'outline(-color)?|column-rule(-color)?|box-shadow|text-shadow|filter|fill|stroke|stop-color|scrollbar-color)$')
TEXT_PROPS = {'color', '-webkit-text-fill-color', 'caret-color', 'text-decoration', 'text-decoration-color', 'text-emphasis-color'}
RELMIX = re.compile(r'color-mix\(in srgb,(var\(--[a-z-]+[^()]*(?:\([^()]*\))?[^()]*\)) \d+%,#000\)')
COLOR = re.compile(r'#[0-9a-fA-F]{3,8}\b|rgba?\([^()]*\)|\b(white|black)\b')
NAMED = {'white': '#ffffff', 'black': '#000000'}


# ---------- 顏色 ----------
def parse(tok):
    tok = NAMED.get(tok.lower(), tok)
    if tok.startswith('#'):
        h = tok[1:]
        if len(h) in (3, 4):
            h = ''.join(c * 2 for c in h)
        r, g, b = (int(h[i:i + 2], 16) / 255 for i in (0, 2, 4))
        a = int(h[6:8], 16) / 255 if len(h) == 8 else 1.0
        return r, g, b, a
    nums = re.findall(r'[-\d.]+%?', tok)
    if len(nums) < 3 or 'var' in tok:
        return None
    def ch(v):
        return float(v[:-1]) / 100 if v.endswith('%') else float(v) / 255
    a = nums[3] if len(nums) > 3 else '1'
    return ch(nums[0]), ch(nums[1]), ch(nums[2]), (float(a[:-1]) / 100 if a.endswith('%') else float(a))


def fmt(r, g, b, a):
    r, g, b = (max(0, min(255, round(v * 255))) for v in (r, g, b))
    if a >= 0.999:
        return '#%02x%02x%02x' % (r, g, b)
    return 'rgba(%d,%d,%d,%s)' % (r, g, b, ('%.3f' % a).rstrip('0').rstrip('.'))


def lum(r, g, b):
    f = lambda c: c / 12.92 if c <= 0.03928 else ((c + 0.055) / 1.055) ** 2.4
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)


def contrast(c1, c2):
    l1, l2 = sorted((lum(*c1), lum(*c2)), reverse=True)
    return (l1 + 0.05) / (l2 + 0.05)


def chromatic(r, g, b):
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    return s >= 0.18 and 0.08 < l < 0.93


def darken_to(r, g, b, target):
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    while l > 0.05 and contrast(colorsys.hls_to_rgb(h, l, s), PAPER) < target:
        l -= 0.01
    return colorsys.hls_to_rgb(h, l, s)


def neutral_flip(r, g, b, ctx):
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    if ctx == 'bg' and l <= 0.22:
        nl = min(1.0, 0.945 + l * 0.45)  # 深色底：越亮的卡片在淺色版越白
    else:
        nl = 1 - l
    return colorsys.hls_to_rgb(h, nl, s * 0.6)


def map_color(tok, ctx, keep_dark_text=False):
    c = parse(tok)
    if c is None:
        return tok
    r, g, b, a = c
    if ctx == 'shadow':
        if chromatic(r, g, b):
            return fmt(r, g, b, a * 0.7)
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        if l < 0.5:
            return fmt(r, g, b, a * 0.45)
        return fmt(0.067, 0.075, 0.082, a * 0.35)
    if chromatic(r, g, b):
        h, l, s = colorsys.rgb_to_hls(r, g, b)
        if ctx in ('text', 'border'):
            if keep_dark_text and l < 0.35:
                return tok
            if a < 0.5 and ctx == 'border':
                return fmt(*darken_to(r, g, b, 2.0), min(1, a * 1.6))
            return fmt(*darken_to(r, g, b, TEXT_MIN if ctx == 'text' else 2.2), a)
        # 底色：品牌色塊保持；很深的帶色底當成中性底處理
        if l < 0.25:
            return fmt(*neutral_flip(r, g, b, 'bg'), a)
        if a < 0.4:
            return fmt(r, g, b, min(1, a * 1.25))
        return tok
    h, l, s = colorsys.rgb_to_hls(r, g, b)
    # 深色版的深色字一定壓在亮底上（例如米白工具區），亮底不翻，字也不翻
    if ctx == 'text' and (keep_dark_text or l < 0.42):
        return tok
    if ctx == 'bg' and l > 0.6:
        return tok
    nr, ng, nb = neutral_flip(r, g, b, ctx)
    if ctx == 'text' and a >= 0.3 and lum(nr, ng, nb) < lum(*PAPER):
        # 字色疊在紙白底上的實際顏色至少 4.6:1；半透明字先加深，不夠再提高不透明度
        h, l, s = colorsys.rgb_to_hls(nr, ng, nb)
        on = lambda c, al: tuple(x * al + p * (1 - al) for x, p in zip(c, PAPER))
        while contrast(on((nr, ng, nb), a), PAPER) < 4.6:
            if l > 0.05:
                l -= 0.01
                nr, ng, nb = colorsys.hls_to_rgb(h, l, s)
            elif a < 1:
                a = min(1, a + 0.02)
            else:
                break
    if ctx == 'border' and a < 1:
        a = min(1, a * 1.1)
    return fmt(nr, ng, nb, a)


def brand_var(name):
    # 中性變數已有淺色值；其他變數（--gc、--sc 這類元件自訂色）一律當品牌色加深
    if name in NEUTRAL_VARS or name.startswith(('accent-rgb', 'display', 'sans')):
        return None
    return BRAND_VARS.get(name, 70)


def map_value(prop, val, ctx, fill_block):
    keep = fill_block and ctx == 'text'
    out = COLOR.sub(lambda m: map_color(m.group(0), ctx, keep), val)
    if ctx == 'text' and prop in TEXT_PROPS:
        if fill_block:  # 品牌色底上的字：原本用底色變數表示深色字，維持深色
            out = re.sub(r'var\(--(%s)(,[^()]*)?\)' % '|'.join(DARK_VARS), '#111315', out)
        else:
            def mix(m):
                pct = brand_var(m.group(1))
                return m.group(0) if pct is None else 'color-mix(in srgb,%s %d%%,#000)' % (m.group(0), pct)
            out = re.sub(r'var\(--([a-z-]+)(?:,[^()]*(?:\([^()]*\))?[^()]*)?\)', mix, out)
    return out


# ---------- CSS 解析 ----------
def strip_comments(css):
    return re.sub(r'/\*.*?\*/', '', css, flags=re.S)


def blocks(css):
    """依最外層大括號切出 (前導, 內容)。"""
    i, n, out = 0, len(css), []
    while i < n:
        j = css.find('{', i)
        if j < 0:
            break
        depth, k, q = 1, j + 1, None
        while k < n and depth:
            ch = css[k]
            if q:
                if ch == q and css[k - 1] != '\\':
                    q = None
            elif ch in '"\'':
                q = ch
            elif ch == '{':
                depth += 1
            elif ch == '}':
                depth -= 1
            k += 1
        head = css[i:j].strip()
        if ';' in head and head.startswith('@'):  # @charset/@import 之類的單行規則
            head = head[head.rfind(';') + 1:].strip()
        out.append((head, css[j + 1:k - 1]))
        i = k
    return out


def split_top(s, sep):
    parts, depth, q, cur = [], 0, None, ''
    for ch in s:
        if q:
            if ch == q:
                q = None
        elif ch in '"\'':
            q = ch
        elif ch == '(':
            depth += 1
        elif ch == ')':
            depth -= 1
        elif ch == sep and depth == 0:
            parts.append(cur)
            cur = ''
            continue
        cur += ch
    parts.append(cur)
    return parts


def prefix_sel(sel, pre):
    sel = sel.strip()
    if not sel:
        return None
    if sel.startswith(':root'):
        return pre + sel[5:]
    m = re.match(r'html(?![\w-])', sel)
    if m:
        return pre + sel[4:]
    return pre + ' ' + sel


def convert(css, pre):
    out = []
    for head, body in blocks(strip_comments(css)):
        if head.startswith('@'):
            low = head.lower()
            if low.startswith(('@media', '@supports', '@container', '@layer')) and 'print' not in low:
                inner = convert(body, pre)
                if inner:
                    out.append(head + '{' + inner + '}')
            continue
        decls = [d.strip() for d in split_top(body, ';') if ':' in d]
        props = []
        for d in decls:
            p, v = d.split(':', 1)
            props.append((p.strip().lower(), v.strip()))
        clip_text = any(p.endswith('background-clip') and 'text' in v for p, v in props)
        fill_block = any(p.startswith('background') and (
            re.search(r'var\(--(?!(%s)\)|accent-rgb)[\w-]+' % '|'.join(NEUTRAL_VARS), v) or
            re.search(r'rgba\(var\(--accent-rgb[^)]*\),\s*\.?[6-9]', v) or
            any(chromatic(*c[:3]) and c[3] > 0.6 for c in filter(None, (parse(t.group(0)) for t in COLOR.finditer(v)))))
            for p, v in props)
        keep = []
        # background 簡寫會把 clip、size、position 重設回預設值，同一條規則裡的這些長寫要跟著抄
        shorthand = any(p == 'background' and 'url(' not in v for p, v in props)
        for p, v in props:
            if 'url(' in v:
                continue
            if shorthand and re.match(r'^(-webkit-)?background-(clip|size|position|repeat|origin|attachment|blend-mode)$', p):
                keep.append(p + ':' + v)
                continue
            if p.startswith('--'):
                # 只換介面用的底色、字色、線條變數；--sc、--gc 這類元件色票保持原色
                ui = re.search(r'bg|surface|card|paper|black|ink|muted|faint|line|frame|panel|border|text|fg|shadow|glow', p)
                if ui and COLOR.search(v) and not re.search(r'^[\d.]+(px|rem|em|%)?$', v):
                    ctx = 'text' if p in ('--ink', '--muted', '--faint') else 'bg'
                    if re.search(r'line|frame|border', p):
                        ctx = 'border'
                    keep.append(p + ':' + map_value(p, v, ctx, False))
                continue
            if not COLOR_PROPS.match(p):
                continue
            if p.startswith('background') and clip_text:
                ctx = 'text'
            elif p.startswith('background') or p in ('fill', 'stop-color'):
                ctx = 'bg'
            elif p in ('box-shadow', 'text-shadow', 'filter'):
                ctx = 'shadow'
            elif p.startswith(('border', 'outline', 'column-rule', 'stroke', '-webkit-text-stroke')):
                ctx = 'border'
            else:
                ctx = 'text'
            mv = map_value(p, v, ctx, fill_block)
            keep.append(p + ':' + mv)
            if ctx == 'text' and 'color-mix(in srgb,var(--' in mv:
                # 支援相對色彩語法的瀏覽器改用 OKLCH 亮度上限，各色相對比一致（≥5:1）
                keep.append(p + ':' + RELMIX.sub(lambda m: 'oklch(from %s min(l, 0.5) c h)' % m.group(1), mv))
        if not keep:
            continue
        sels = [prefix_sel(s, pre) for s in split_top(head, ',')]
        sels = [s for s in sels if s]
        if sels:
            out.append(','.join(sels) + '{' + ';'.join(keep) + '}')
    return '\n'.join(out)


def source_css(rel):
    text = (SITE / rel).read_text(encoding='utf-8')
    if rel.endswith('.html'):
        return '\n'.join(re.findall(r'<style[^>]*>(.*?)</style>', text, flags=re.S))
    return text


def build():
    parts = ['/* 自動產生：tools/build_theme_light.py。請修改來源樣式表或 tools/theme/light-manual.css 後重新執行，不要直接編輯本檔。 */\n']
    for kit, files in KITS:
        pre = 'html[data-theme="light"][data-kit="%s"]' % kit
        for rel in files:
            body = convert(source_css(rel), pre)
            if body:
                parts.append('\n/* ===== %s · %s ===== */\n%s\n' % (kit, rel, body))
    for lab in LABS:
        pre = 'html[data-theme="light"][data-lab="%s"]' % lab
        parts.append('\n/* ===== %s/theme.css ===== */\n%s\n' % (lab, convert(source_css(lab + '/theme.css'), pre)))
    parts.append('\n/* ===== 手動微調：tools/theme/light-manual.css ===== */\n' + MANUAL.read_text(encoding='utf-8'))
    text = ''.join(parts)
    if not OUT.exists() or OUT.read_text(encoding='utf-8') != text:
        OUT.write_text(text, encoding='utf-8', newline='\n')
        print('built', OUT.relative_to(ROOT), len(text.encode('utf-8')) // 1024, 'KB')
    # theme.js 依版本號載入本檔
    ver = hashlib.sha1(text.encode('utf-8')).hexdigest()[:10]
    js = SITE / 'assets' / 'theme.js'
    src = js.read_text(encoding='utf-8')
    new = re.sub(r"var CSS_V = '[^']*';", "var CSS_V = '%s';" % ver, src)
    if new != src:
        js.write_text(new, encoding='utf-8', newline='\n')


if __name__ == '__main__':
    build()
