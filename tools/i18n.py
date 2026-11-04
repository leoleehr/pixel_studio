"""英文版網站：把 site/ 的中文抽成翻譯單位，依對照表產生 site/en/。

用法（在專案根目錄執行）：
  python -X utf8 tools/i18n.py status [路徑片段…]      各檔翻譯進度
  python -X utf8 tools/i18n.py todo 路徑片段 [--limit N]  列出尚未翻譯的單位（id<TAB>中文）
  python -X utf8 tools/i18n.py build                     產生 site/en/

對照表放在 i18n/en/*.json，格式 {"id": "English"}，可以分成多個檔案，產生時全部合併。
id 是正規化後中文原文的 SHA-1 前 10 碼，所以同一句中文全站共用一個翻譯；
值為 "=" 表示刻意保留中文（歌名、歌詞、中文詞庫）。中文改了 id 就會變，todo 會再列出來。

翻譯單位：
- HTML：內容只有文字與行內標籤的元素，整段內文（含 <b>、<a> 等標籤）算一個單位；
  可見屬性（alt、title、aria-label、placeholder、meta content、data-*）各自一個單位；
  <script> 內的字串常值、<style> 內的 content 字串另外處理。
- JS：含中文的字串常值與樣板字串的靜態片段（不動註解與正規表示式）。
- CSS：content:"…"。
- Markdown：每一行（表格逐格）。
英文頁的相對路徑：指向有英文版的檔案就維持原樣，否則改指回中文版那一份（圖片、字型、PDF 等共用資源）。
"""
import hashlib, json, os, pathlib, re, sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SITE = ROOT / 'site'
OUT = SITE / 'en'
DICT_DIR = ROOT / 'i18n' / 'en'
PROD = 'https://pixel-studio.musicallanding.workers.dev/'
CJK = re.compile(r'[㐀-鿿豈-﫿]')
TEXT_EXT = {'.html', '.js', '.css', '.md', '.webmanifest', '.svg'}
# 不翻譯的檔案：產生器資料、說明文件
SKIP = {'assets/teaching/README.md', 'songwriting/lyric-dice.js', 'assets/lang.js', 'assets/theme.js'}
# 品牌標誌的中文字標依 CI 規範不重打，整個資料夾不翻
SKIP_DIRS = ('assets/brand/',)
LANG_JS = 'assets/lang.js?v=20261104a'

# 英文版 JS 載入相對資源時要改指回中文版的路徑（檔案 → [(原字串, 新字串)]）
FIXUPS = {
    'assets/deck.js': [("ME.replace(/deck\\.js(\\?.*)?$/, 'brand/')", "ME.replace(/en\\/assets\\/deck\\.js(\\?.*)?$/, 'assets/brand/')")],
    # 圖解：有英文版的 SVG 讀 en/assets/teaching/，其餘照片讀中文版資料夾（清單在 build 時填入）
    'assets/teaching-visuals.js': [("var base = new URL('teaching/', script.src);",
                                    "var base = new URL('../../assets/teaching/', script.src), enBase = new URL('teaching/', script.src), EN_FILES = __EN_TEACHING__;"),
                                   ("var resolved = new URL(src, base);",
                                    "var resolved = new URL(src, EN_FILES.indexOf(src.split('?')[0]) > -1 ? enBase : base);")],
    'guitar/guitar.js': [("new URL('../assets/guitar/', guitarScript.src)", "new URL('../../assets/guitar/', guitarScript.src)"),
                         ("new URL('../assets/teaching/', guitarScript.src)", "new URL('../../assets/teaching/', guitarScript.src)")],
}

VOID = {'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'}
INLINE = {'a', 'abbr', 'b', 'bdi', 'bdo', 'br', 'cite', 'code', 'data', 'dfn', 'em', 'i', 'kbd', 'mark', 'q', 'rp', 'rt', 'ruby', 's',
          'samp', 'small', 'span', 'strong', 'sub', 'sup', 'time', 'u', 'var', 'wbr', 'img'}
ATTRS = {'alt', 'title', 'aria-label', 'placeholder', 'label', 'value', 'aria-description', 'aria-roledescription'}
KEEP_ATTRS = {'data-song', 'data-id', 'data-key', 'data-answer', 'data-compare', 'data-lines', 'data-teaching'}
URL_ATTRS = {'src', 'href', 'poster', 'action', 'data-src', 'data-href', 'data-pdf'}


def norm(s):
    return re.sub(r'\s+', ' ', s).strip()


def hid(s):
    return hashlib.sha1(norm(s).encode('utf-8')).hexdigest()[:10]


def load_dict():
    d = {}
    for f in sorted(DICT_DIR.glob('*.json')):
        d.update(json.loads(f.read_text(encoding='utf-8')))
    return d


# ---------------------------------------------------------------- JS
REGEX_PREV = set('(,=:[!&|?{};+-*%<>~^') | {''}
REGEX_WORDS = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await'}


def js_strings(src):
    """回傳 [(start, end, quote, raw)]：含中文的字串常值或樣板字串片段（start/end 不含引號）。"""
    out, i, n, prev, word = [], 0, len(src), '', ''
    stack = []  # 樣板字串巢狀的 ${ 深度

    def template(i):
        # i 指向 ` 之後；回傳結束後的位置
        start = i
        while i < n:
            c = src[i]
            if c == '\\':
                i += 2; continue
            if c == '`':
                if CJK.search(src[start:i]): out.append((start, i, '`', src[start:i]))
                return i + 1
            if c == '$' and i + 1 < n and src[i + 1] == '{':
                if CJK.search(src[start:i]): out.append((start, i, '`', src[start:i]))
                i = code(i + 2, True)
                start = i
                continue
            i += 1
        return i

    def code(i, in_tpl):
        nonlocal prev, word
        depth = 0
        while i < n:
            c = src[i]
            if c in ' \t\r\n':
                i += 1; continue
            if c == '/' and src.startswith('//', i):
                j = src.find('\n', i); i = n if j < 0 else j; continue
            if c == '/' and src.startswith('/*', i):
                j = src.find('*/', i + 2); i = n if j < 0 else j + 2; continue
            if c in '\'"':
                j = i + 1
                while j < n and src[j] != c:
                    if src[j] == '\\': j += 1
                    elif src[j] == '\n': break
                    j += 1
                if CJK.search(src[i + 1:j]): out.append((i + 1, j, c, src[i + 1:j]))
                i = j + 1; prev, word = 'str', ''; continue
            if c == '`':
                i = template(i + 1); prev, word = 'str', ''; continue
            if c == '/':
                if prev in REGEX_PREV or word in REGEX_WORDS:
                    j, cls = i + 1, False
                    while j < n:
                        if src[j] == '\\': j += 2; continue
                        if src[j] == '[': cls = True
                        elif src[j] == ']': cls = False
                        elif src[j] == '/' and not cls: break
                        elif src[j] == '\n': break
                        j += 1
                    i = j + 1
                    while i < n and src[i].isalpha(): i += 1
                    prev, word = 'regex', ''; continue
                i += 1; prev, word = '/', ''; continue
            if c.isalnum() or c in '_$':
                j = i
                while j < n and (src[j].isalnum() or src[j] in '_$'): j += 1
                word = src[i:j]; prev = 'id' if word not in REGEX_WORDS else ''
                i = j; continue
            if in_tpl:
                if c == '{': depth += 1
                elif c == '}':
                    if depth == 0: return i + 1
                    depth -= 1
            prev, word = c, ''
            i += 1
        return i

    code(0, False)
    return out


PUNCT = {'，': ', ', '、': ', ', '：': ': ', '；': '; ', '。': '. ', '（': ' (', '）': ')', '！': '! ', '？': '? '}


def js_punct(src):
    """英文版程式裡只剩中文標點的字串（拼接句子用的「，」「（」等）換成英文標點。"""
    def fix(m):
        q, body = m.group(1), m.group(2)
        t = ''.join(PUNCT.get(c, c) for c in body)
        return q + re.sub(r'  +', ' ', t) + q
    return re.sub(r"(?<!split\()(?<!join\()(['\"])([\s，、：；。（）！？]*[，、：；。（）！？][\s，、：；。（）！？]*)\1", fix, src)


def js_escape(s, q):
    if q == '`':
        return s.replace('`', '\\`').replace('${', '\\${')
    return re.sub(r'(?<!\\)' + re.escape(q), '\\' + q, s).replace('\n', '\\n')


def js_units(src):
    return [(a, b, raw, q) for a, b, q, raw in js_strings(src)]


# ---------------------------------------------------------------- CSS
CSS_CONTENT = re.compile(r'(content\s*:\s*)(["\'])((?:(?!\2).)*?[㐀-鿿](?:(?!\2).)*?)\2')


def css_units(src):
    out = []
    for m in CSS_CONTENT.finditer(src):
        out.append((m.start(3), m.end(3), m.group(3), m.group(2)))
    return out


# ---------------------------------------------------------------- HTML
TOKEN = re.compile(r'<!--.*?-->|<(script|style|textarea|title)\b[^>]*>.*?</\1\s*>|<!\w[^>]*>|</?[a-zA-Z][\w-]*(?:"[^"]*"|\'[^\']*\'|[^\'">])*>|[^<]+|<', re.S | re.I)
ATTR = re.compile(r'([\w:-]+)(?:\s*=\s*("[^"]*"|\'[^\']*\'|[^\s>]+))?')


class El:
    def __init__(self, name, start, open_end):
        self.name, self.start, self.open_end, self.close_start, self.end, self.kids = name, start, open_end, None, None, []


def parse_html(src):
    root = El('#root', 0, 0)
    stack = [root]
    for m in TOKEN.finditer(src):
        tok = m.group(0)
        if tok.startswith('<!--') or tok.startswith('<!'):
            continue
        if m.group(1):  # script/style/textarea/title raw element
            name = m.group(1).lower()
            el = El(name, m.start(), m.start() + tok.index('>') + 1)
            el.close_start = m.start() + tok.lower().rindex('</')
            el.end = m.end()
            stack[-1].kids.append(el)
            continue
        if tok.startswith('</'):
            name = tok[2:].strip('> \n').lower()
            for k in range(len(stack) - 1, 0, -1):
                if stack[k].name == name:
                    for e in stack[k:]:
                        if e.close_start is None:
                            e.close_start = m.start() if e is stack[k] else m.start()
                            e.end = m.end() if e is stack[k] else m.start()
                    del stack[k:]
                    break
            continue
        if tok.startswith('<') and len(tok) > 1:
            name = re.match(r'<([\w-]+)', tok).group(1).lower()
            el = El(name, m.start(), m.end())
            stack[-1].kids.append(el)
            if name in VOID or tok.endswith('/>'):
                el.close_start = el.end = m.end()
            else:
                stack.append(el)
            continue
        stack[-1].kids.append(('text', m.start(), m.end()))
    for e in stack[1:]:
        e.close_start = e.end = len(src)
    root.close_start = root.end = len(src)
    return root


def inline_only(el):
    for k in el.kids:
        if isinstance(k, tuple): continue
        if k.name not in INLINE or k.name in ('script', 'style'): return False
        if not inline_only(k): return False
    return True


def html_units(src):
    """回傳 [(start, end, raw, kind)]，kind = 'html' | 'attr' | 'js' | 'css'；依位置排序、不重疊。"""
    out = []
    root = parse_html(src)

    def attrs(el):
        tag = src[el.start:el.open_end]
        head = re.match(r'<[\w-]+', tag).end()
        meta_name = ''
        for m in ATTR.finditer(tag, head):
            if m.group(1).lower() in ('name', 'property', 'itemprop') and m.group(2):
                meta_name = m.group(2).strip('"\'')
        for m in ATTR.finditer(tag, head):
            k, v = m.group(1).lower(), m.group(2)
            if not v or not CJK.search(v): continue
            if k in KEEP_ATTRS: continue
            if k in ATTRS or (k.startswith('data-')) or (el.name == 'meta' and k == 'content'):
                q = 1 if v[0] in '"\'' else 0
                a = el.start + m.start(2) + q
                out.append((a, a + len(v) - 2 * q, v[q:len(v) - q] if q else v, 'attr'))

    def walk(el):
        if el.name == 'script':
            t = src[el.open_end:el.close_start]
            if 'application/ld+json' in src[el.start:el.open_end] or not re.search(r'type=["\']?(text/template|text/html)', src[el.start:el.open_end]):
                for a, b, raw, q in js_units(t):
                    out.append((el.open_end + a, el.open_end + b, raw, 'js:' + q))
            return
        if el.name == 'style':
            t = src[el.open_end:el.close_start]
            for a, b, raw, q in css_units(t):
                out.append((el.open_end + a, el.open_end + b, raw, 'css:' + q))
            return
        if el.name in ('title', 'textarea'):
            t = src[el.open_end:el.close_start]
            if CJK.search(t): out.append((el.open_end, el.close_start, t, 'html'))
            return
        if el.name != '#root':
            attrs(el)
        if el.name not in INLINE and el.name != '#root' and inline_only(el):
            inner = src[el.open_end:el.close_start]
            if CJK.search(re.sub(r'<[^>]*>', '', inner)):
                out.append((el.open_end, el.close_start, inner, 'html'))
                # 單位內的行內標籤屬性一起翻在單位裡；但 data-song 等保留屬性本來就不會動
                return
            for k in el.kids:
                if not isinstance(k, tuple): sub(k)
            return
        run = []

        def flush():
            if not run: return
            a, b = run[0][0], run[-1][1]
            raw = src[a:b]
            if CJK.search(re.sub(r'<[^>]*>', '', raw)):
                out.append((a, b, raw, 'html'))
            else:
                for k in run:
                    if k[2] is not None: sub(k[2])
            run.clear()

        for k in el.kids:
            if isinstance(k, tuple):
                run.append((k[1], k[2], None))
            elif k.name in INLINE and inline_only(k):
                run.append((k.start, k.end, k))
            else:
                flush(); walk(k)
        flush()

    def sub(el):
        # 單位外的行內元素（沒有中文內文）仍要檢查屬性
        attrs(el)
        for k in el.kids:
            if not isinstance(k, tuple): sub(k)

    walk(root)
    # 去掉空白邊界，讓前後空白留在原處
    fixed = []
    for a, b, raw, kind in out:
        if kind == 'html':
            l = len(raw) - len(raw.lstrip()); r = len(raw.rstrip())
            a, b, raw = a + l, a + r, raw.strip()
        fixed.append((a, b, raw, kind))
    fixed.sort()
    return fixed


# ---------------------------------------------------------------- Markdown
MD_PREFIX = re.compile(r'^(\s*(?:#{1,6}\s+|[-*+]\s+(?:\[[ xX]\]\s+)?|\d+\.\s+|>\s*)*)')


def md_units(src):
    out, pos, fence = [], 0, False
    for line in src.splitlines(keepends=True):
        body = line.rstrip('\r\n')
        if body.lstrip().startswith('```'):
            fence = not fence
        elif not fence and CJK.search(body):
            if body.lstrip().startswith('|'):
                for m in re.finditer(r'(?<=\|)([^|]+)(?=\|)', body):
                    cell = m.group(1)
                    if CJK.search(cell):
                        l = len(cell) - len(cell.lstrip())
                        out.append((pos + m.start(1) + l, pos + m.start(1) + l + len(cell.strip()), cell.strip(), 'md'))
            else:
                l = MD_PREFIX.match(body).end()
                text = body[l:]
                out.append((pos + l, pos + l + len(text.rstrip()), text.rstrip(), 'md'))
        pos += len(line)
    return out


def svg_units(src):
    """SVG 圖解：<text>／<tspan>／<title> 的文字節點，以及 aria-label 等可見屬性；<style> 不動。"""
    masked = re.sub(r'<(style|script)\b.*?</\1>', lambda m: ' ' * len(m.group(0)), src, flags=re.S)
    out = []
    for m in re.finditer(r'>([^<]+)<', masked):
        raw = m.group(1)
        if CJK.search(raw):
            l = len(raw) - len(raw.lstrip())
            out.append((m.start(1) + l, m.start(1) + l + len(raw.strip()), raw.strip(), 'svg'))
    for m in re.finditer(r'\b(aria-label|aria-description|title|alt)="([^"]*)"', masked):
        if CJK.search(m.group(2)):
            out.append((m.start(2), m.end(2), m.group(2), 'attr'))
    return sorted(out)


# ---------------------------------------------------------------- 檔案
def code_table():
    """i18n/code_en.py 的 CODE：{檔案: [(中文版程式片段, 英文版程式片段)]}，處理語序不同、由片段拼成的句子。"""
    f = ROOT / 'i18n' / 'code_en.py'
    if not f.exists(): return {}
    ns = {}
    exec(compile(f.read_text(encoding='utf-8'), str(f), 'exec'), ns)
    return ns.get('CODE', {})


CODE = None


def prep(rel, src):
    """翻譯前的整理：先套用 code_en.py 的整句替換；講義頁的預先渲染內容改由英文 Markdown 在瀏覽器端轉換，不逐句翻 HTML。"""
    global CODE
    if CODE is None: CODE = code_table()
    # interact.js 拆成分塊後，整句替換仍寫在同一組；每個片段只會落在其中一個檔案，所以這組不提示對不上
    if rel == 'assets/interact.js' or rel.startswith('assets/interact/'):
        for a, b in CODE.get('assets/interact.js', []):
            src = src.replace(a, b)
        return src
    for a, b in CODE.get(rel, []):
        if a not in src and b not in src: print('code_en: not found in', rel, '::', a[:60], file=sys.stderr)
        src = src.replace(a, b)
    if rel.endswith('/handbook.html'):
        src = re.sub(r'(<main\b[^>]*?)\s+data-prerendered="[^"]*"([^>]*>).*?(</main>)', r'\1\2\3', src, count=1, flags=re.S)
    return src


def units_of(path, src):
    src = prep(path.relative_to(SITE).as_posix(), src)
    ext = path.suffix
    if ext == '.html': return html_units(src)
    if ext in ('.js', '.webmanifest'): return [(a, b, raw, 'js:' + q) for a, b, raw, q in js_units(src)]
    if ext == '.css': return [(a, b, raw, 'css:' + q) for a, b, raw, q in css_units(src)]
    if ext == '.md': return md_units(src)
    if ext == '.svg': return svg_units(src)
    return []


def sources():
    files = []
    for p in sorted(SITE.rglob('*')):
        if not p.is_file() or p.suffix not in TEXT_EXT: continue
        rel = p.relative_to(SITE).as_posix()
        if rel.startswith('en/') or rel in SKIP or rel.startswith(SKIP_DIRS): continue
        files.append(p)
    return files


def has_cjk(p):
    return bool(CJK.search(p.read_text(encoding='utf-8', errors='ignore')))


def translated_set():
    """英文版會產生的檔案（相對 site/）：每個 HTML 頁面，以及有中文字串（不只是註解）的文字檔。"""
    s = set()
    for p in sources():
        if p.suffix == '.html' or (has_cjk(p) and units_of(p, p.read_text(encoding='utf-8'))):
            s.add(p.relative_to(SITE).as_posix())
    return s


def rewrite_ref(val, src_rel, en_set):
    """src_rel：來源檔相對 site/ 的路徑。回傳英文版應寫的相對路徑。"""
    if not val or re.match(r'^(?:[a-z][\w+.-]*:|//|#|/|\{|\$)', val, re.I):
        return val
    m = re.match(r'([^?#]*)(.*)', val, re.S)
    path, tail = m.group(1), m.group(2)
    if not path:
        return val
    base = pathlib.PurePosixPath(src_rel).parent
    target = os.path.normpath((base / path).as_posix()).replace('\\', '/')
    if target.startswith('..'):
        return val
    check = target
    if path.endswith('/') or (SITE / target).is_dir():
        check = (target.rstrip('/') + '/index.html').lstrip('/')
    # 英文版另有實體檔（例如英文講義 PDF）時也留在 en/
    if check in en_set or (OUT / check).is_file():
        return val
    # 指回中文版：英文頁位於 en/ 底下，多一層
    return os.path.relpath(SITE / target, (OUT / src_rel).parent).replace('\\', '/') + ('/' if path.endswith('/') else '') + tail


def translate_file(p, d, en_set, missing=None):
    rel = p.relative_to(SITE).as_posix()
    src = prep(rel, p.read_text(encoding='utf-8'))
    us = units_of(p, src)
    parts, last = [], 0
    for a, b, raw, kind in us:
        if a < last: continue
        t = d.get(hid(raw) + '@' + rel) or d.get(hid(raw))
        if t is None or t == '' or t == '=':
            if missing is not None and t != '=': missing.append((rel, hid(raw), raw))
            continue
        lead = raw[:len(raw) - len(raw.lstrip())]; trail = raw[len(raw.rstrip()):]
        if lead: t = t.lstrip()
        if trail: t = t.rstrip()
        if kind.startswith('js:'):
            t = js_escape(t, kind[3:])
        elif kind.startswith('css:'):
            t = t.replace(kind[4:], '\\' + kind[4:])
        elif kind == 'attr':
            t = t.replace('"', '&quot;')
        elif kind == 'svg':
            t = re.sub(r'&(?![#\w]+;)', '&amp;', t).replace('<', '&lt;')
        parts.append(src[last:a]); parts.append(lead + t + trail); last = b
    parts.append(src[last:])
    out = ''.join(parts)
    if p.suffix == '.js':
        out = js_punct(out)
    elif p.suffix == '.html':
        out = re.sub(r'(<script\b[^>]*>)(.*?)(</script>)', lambda m: m.group(1) + js_punct(m.group(2)) + m.group(3), out, flags=re.S)
    if p.suffix == '.html':
        out = html_paths(out, rel, en_set)
    elif p.suffix == '.md':
        # Markdown 由頁面在瀏覽器端轉換，圖片與連結相對於頁面所在的資料夾，和這份 md 相同
        out = re.sub(r'(\]\()([^)\s]+)', lambda m: m.group(1) + rewrite_ref(m.group(2), rel, en_set), out)
        out = re.sub(r'((?:src|href)=")([^"]+)', lambda m: m.group(1) + rewrite_ref(m.group(2), rel, en_set), out)
    elif p.suffix == '.css':
        out = re.sub(r'url\(\s*(["\']?)([^"\')]+)\1\s*\)', lambda m: 'url(' + m.group(1) + rewrite_ref(m.group(2), rel, en_set) + m.group(1) + ')', out)
    elif p.suffix == '.webmanifest':
        # 圖示沒有英文版，路徑要指回中文版的 assets/
        out = re.sub(r'("(?:src|start_url)":\s*")([^"]+)', lambda m: m.group(1) + rewrite_ref(m.group(2), rel, en_set), out)
    for a, b in FIXUPS.get(rel, []):
        assert a in out, (rel, a)
        out = out.replace(a, b)
    if '__EN_TEACHING__' in out:
        names = sorted(r[len('assets/teaching/'):] for r in en_set if r.startswith('assets/teaching/') and r.endswith('.svg'))
        out = out.replace('__EN_TEACHING__', json.dumps(names))
    return out


def page_url(rel, en):
    rel = re.sub(r'(^|/)index\.html$', r'\1', rel)
    return PROD + ('en/' if en else '') + rel


def html_paths(out, rel, en_set):
    def fix_tag(m):
        tag = m.group(0)

        def fix_attr(a):
            k, q, v = a.group(1), a.group(2), a.group(3)
            if k.lower() in URL_ATTRS:
                v = rewrite_ref(v, rel, en_set)
            elif k.lower() == 'srcset':
                v = ', '.join(' '.join([rewrite_ref(x.split()[0], rel, en_set)] + x.split()[1:]) for x in v.split(',') if x.strip())
            elif k.lower() == 'style' and 'url(' in v:
                v = re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', lambda u: 'url(' + u.group(1) + rewrite_ref(u.group(2), rel, en_set) + u.group(1) + ')', v)
            return k + '=' + q + v + q
        return re.sub(r'([\w:-]+)=(["\'])(.*?)\2', fix_attr, tag, flags=re.S)
    out = re.sub(r'<(?!script\b|style\b|!)[a-zA-Z][\w-]*\s[^>]*>', fix_tag, out)
    out = re.sub(r'<script\b[^>]*>', fix_tag, out)
    # <style> 裡的 url()
    out = re.sub(r'(<style\b[^>]*>)(.*?)(</style>)', lambda m: m.group(1) + re.sub(r'url\(\s*([\'"]?)([^\'")]+)\1\s*\)', lambda u: 'url(' + u.group(1) + rewrite_ref(u.group(2), rel, en_set) + u.group(1) + ')', m.group(2)) + m.group(3), out, flags=re.S)
    out = re.sub(r'<html([^>]*)\blang="[^"]*"', r'<html\1lang="en"', out, count=1)
    # 正式網址、語言對照
    # canonical 與 og:url 指向英文網址；hreflang 對照兩邊相同，不動
    out = re.sub(r'(<link rel="canonical" href="|<meta property="og:url" content=")' + re.escape(PROD) + r'(?!en/)', r'\1' + PROD + 'en/', out)
    out = re.sub(r'<meta property="og:locale" content="zh_TW">', '<meta property="og:locale" content="en_US">', out)
    return out


def cmd_status(args):
    d = load_dict()
    tot_u = tot_m = 0
    for p in sources():
        rel = p.relative_to(SITE).as_posix()
        if args and not any((rel == a[1:]) if a.startswith('=') else (a in rel) for a in args): continue
        us = units_of(p, p.read_text(encoding='utf-8'))
        if not us: continue
        keep = sum(1 for u in us if d.get(hid(u[2])) == '=')
        miss = sum(1 for u in us if not d.get(hid(u[2]) + '@' + rel) and not d.get(hid(u[2])))
        tot_u += len(us); tot_m += miss
        print(f'{len(us) - miss:5d}/{len(us):<5d} keep {keep:<4d} {rel}')
    print(f'TOTAL {tot_u - tot_m}/{tot_u} translated, {tot_m} missing')


def cmd_todo(args):
    limit = 10 ** 9
    if '--limit' in args:
        i = args.index('--limit'); limit = int(args[i + 1]); args = args[:i] + args[i + 2:]
    d = load_dict()
    seen, n = set(), 0
    for p in sources():
        rel = p.relative_to(SITE).as_posix()
        if args and not any((rel == a[1:]) if a.startswith('=') else (a in rel) for a in args): continue
        for a, b, raw, kind in units_of(p, p.read_text(encoding='utf-8')):
            h = hid(raw)
            if h in seen or d.get(h) or d.get(h + '@' + rel): continue
            seen.add(h)
            print(h + '\t' + norm(raw).replace('\t', ' '))
            n += 1
            if n >= limit: return


def cmd_build(args):
    d = load_dict()
    en_set = translated_set()
    missing = []
    written = 0
    for p in sources():
        rel = p.relative_to(SITE).as_posix()
        if rel not in en_set: continue
        out = translate_file(p, d, en_set, missing)
        dst = OUT / rel
        dst.parent.mkdir(parents=True, exist_ok=True)
        if not dst.exists() or dst.read_text(encoding='utf-8') != out:
            dst.write_text(out, encoding='utf-8', newline='')
            written += 1
    # 已經沒有中文來源的舊英文檔
    for p in OUT.rglob('*'):
        if p.is_file() and p.suffix in TEXT_EXT and p.relative_to(OUT).as_posix() not in en_set:
            p.unlink()
    print(f'en/: {written} files written, {len(en_set)} total, {len(missing)} untranslated units')
    write_sitemap(en_set)


def write_sitemap(en_set):
    """sitemap.xml 由 add_social_meta.py 產生中文網址；這裡補上英文網址與 hreflang 對照。"""
    sm = SITE / 'sitemap.xml'
    zh = [u for u in re.findall(r'<loc>([^<]+)</loc>', sm.read_text(encoding='utf-8')) if not u.startswith(PROD + 'en/')]

    def rel_of(u):
        r = u[len(PROD):]
        return r + 'index.html' if r == '' or r.endswith('/') else r + '.html'

    def entry(loc, pair):
        alt = ''.join('<xhtml:link rel="alternate" hreflang="%s" href="%s"/>' % (k, v) for k, v in pair)
        return '  <url><loc>%s</loc>%s</url>\n' % (loc, alt)
    rows = []
    for u in zh:
        en = PROD + 'en/' + u[len(PROD):] if rel_of(u) in en_set else None
        pair = [('zh-Hant', u), ('en', en), ('x-default', u)] if en else []
        rows.append(entry(u, pair))
        if en:
            rows.append(entry(en, pair))
    text = ('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" '
            'xmlns:xhtml="http://www.w3.org/1999/xhtml">\n' + ''.join(rows) + '</urlset>\n')
    if sm.read_text(encoding='utf-8') != text:
        sm.write_text(text, encoding='utf-8', newline='\n')
    print('sitemap URLs', len(rows))


def cmd_tag(args):
    """在中文頁加上語言切換腳本與 hreflang 對照（可重複執行）。英文頁由 build 從中文頁產生，自然帶著。"""
    n = 0
    for p in sources():
        if p.suffix != '.html': continue
        rel = p.relative_to(SITE).as_posix()
        src = p.read_text(encoding='utf-8')
        out = src
        depth = '../' * rel.count('/')
        tag = '<script src="' + depth + LANG_JS + '" defer></script>'
        out = re.sub(r'<script src="(?:\.\./)*assets/lang\.js[^"]*" defer></script>', tag, out)
        if 'assets/lang.js' not in out:
            out = out.replace('</head>', tag + '\n</head>', 1)
        m = re.search(r'<link rel="canonical" href="' + re.escape(PROD) + r'([^"]*)">', out)
        if m and 'hreflang=' not in out:
            path = m.group(1)
            alt = ('\n<link rel="alternate" hreflang="zh-Hant" href="{0}{1}">\n<link rel="alternate" hreflang="en" href="{0}en/{1}">'
                   '\n<link rel="alternate" hreflang="x-default" href="{0}{1}">').format(PROD, path)
            out = out[:m.end()] + alt + out[m.end():]
        if out != src:
            p.write_text(out, encoding='utf-8', newline='')
            n += 1
    print(f'tagged {n} pages')


if __name__ == '__main__':
    cmd = sys.argv[1] if len(sys.argv) > 1 else 'status'
    {'status': cmd_status, 'todo': cmd_todo, 'build': cmd_build, 'tag': cmd_tag}[cmd](sys.argv[2:])
