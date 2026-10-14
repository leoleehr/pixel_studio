"""由各章投影片原稿產生 Guitar Lab 講義與教案（第二章起），第一章與課程總覽保留手寫內容。

用法：python -X utf8 tools/build_handbook.py
讀取 tools/decks/chNN.html 與 site/guitar/surveys.js，改寫 site/guitar/handbook.md。
"""
import html
import json
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent
MD = ROOT / 'site' / 'guitar' / 'handbook.md'
ZH = ['', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二']
SEG = {'t-qi': ('起', '00:00–00:20'), 't-cheng': ('承', '00:20–00:55'), 'rest': ('休', '00:55–01:05'), 't-zhuan': ('轉', '01:05–01:40'), 't-he': ('合', '01:40–02:00')}

# 講義擴充：每章的重點知識（手寫）
NOTES = {
2: """### 講義擴充：音高與譜表

- 五線譜越往上音越高；高音譜號（G 譜號）的中心在第二線，那條線是 G。超出五線的音用加線，中央 C 在下加一線。
- 吉他譜習慣寫高八度：譜上的中央 C，實際彈出來低一個八度。

| 級數 | Ⅰ 主音 | Ⅱ 上主音 | Ⅲ 中音 | Ⅳ 下屬音 | Ⅴ 屬音 | Ⅵ 下中音 | Ⅶ 導音 | Ⅷ 主音 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 音名 | C | D | E | F | G | A | B | C |
| 唱名 | Do | Re | Mi | Fa | Sol | La | Si | Do |
| 簡譜 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 1̇ |

大調音階的距離為「全、全、半、全、全、全、半」；吉他上一格是一個半音。

### 講義擴充：時值、休止符與拍號

| 音符 | 4/4 中的拍數 | 休止符 |
| --- | --- | --- |
| 全音符 | 4 拍 | 全休止符 |
| 二分音符 | 2 拍 | 二分休止符 |
| 四分音符 | 1 拍 | 四分休止符 |
| 八分音符 | ½ 拍 | 八分休止符 |
| 十六分音符 | ¼ 拍 | 十六分休止符 |

- 附點：長度再加原本的一半，例如附點四分音符 = 1.5 拍。
- 拍號上方是每小節拍數、下方是以幾分音符為一拍。2/4 強弱；3/4 強弱弱；4/4 強弱次強弱；6/8 兩大拍、每拍三份。

### 講義擴充：六線譜與熱手

- 六線譜最上面一條線是最細的 1 弦，數字是格數，0 是空弦，上下疊在一起的數字同時彈。
- 左手按弦：靠近琴衍、指尖立起來、拇指在琴頸背面中線、剛好按響就好。
- 爬格子 1-2-3-4 與 1-3-2-4：一指一格，右手彈片下上交替；連續兩輪都穩再加 4 BPM，原講義的 BPM 100 是目標而非起點。
- 五格調音法：6、5、4、2 弦的第 5 格等於下一條空弦，只有 3 弦是第 4 格（大三度）。
""",
3: """### 講義擴充：和弦與和弦圖

- 三個以上的音同時響就是和弦。C 和弦五條弦只有 C、E、G 三種音（Do、Mi、Sol）。
- 和弦圖：直線是弦（左 6 右 1）、橫線是琴衍、圓點內是手指編號，○ 空弦要彈、× 不彈。

| 和弦 | 按法（6→1 弦） | 重點 |
| --- | --- | --- |
| C | x 3 2 0 1 0 | 從無名指開始由低到高放手指 |
| Am | x 0 2 2 1 0 | 和 C 只差無名指 |
| G | 3 2 0 0 0 3 | 手腕放低，六條弦都響 |
| F（小 F） | x x 3 2 1 1 | 食指平壓 1、2 弦，只彈 4 到 1 弦 |

### 講義擴充：換和弦與級數

- 換和弦祕訣：最後一拍就開始動、手指整組一起落下、來不及就先刷空弦，拍子不停。
- C ↔ Am 只動無名指；Am → F 整手平移一條弦；F → G 先放最遠的中指；G → C 無名指從 1 弦移到 5 弦。
- C 調順階和弦：C（I）、Dm（ii）、Em（iii）、F（IV）、G（V）、Am（vi）、Bdim（vii°）。C → G → Am → F 就是 I–V–vi–IV。
""",
4: """### 講義擴充：刷奏符號

| 符號 | 名稱 | 動作 |
| --- | --- | --- |
| ↓ | 下刷 | 從粗弦往細弦刷，落在拍點 |
| ↑ | 上刷 | 從細弦往粗弦，只刷高音 3、4 條弦，落在半拍 |
| 空心箭頭 | 空刷 | 手照樣擺動但不碰弦 |

- 華語教材常見標示：X「蹦」往下撥低音弦、↓「洽」往下刷高音弦、↑「拉」往上刷高音弦；有些教材箭頭方向與西方相反，先看圖例。
- 刷奏靠手腕，手肘為支點；彈片斜一點擦過弦。手永遠在擺動，碰不碰弦才是節奏。

### 講義擴充：基本拍型

| 拍型 | 1 & 2 & 3 & 4 & | 說明 |
| --- | --- | --- |
| 四分音符 | ↓ · ↓ · ↓ · ↓ · | 每拍一下 |
| 8 Beats | ↓ ↑ ↓ ↑ ↓ ↑ ↓ ↑ | 八下平均，下重上輕 |
| 切分 Folk Rock | ↓ · ↓ ↑ · ↑ ↓ ↑ | 第 2 拍後半延音到第 3 拍；口訣「下、下上、上下上」 |
| 16 Beats | 每拍 1 e & a | 正拍保留下刷、反拍加入上刷；60 BPM 的手速等於 8 Beats 120 BPM |
""",
5: """### 講義擴充：拍子系統

- 二拍子系統：2/4（強弱）、4/4（強弱次強弱）。三拍子系統：3/4（強弱弱）。
- 單拍子每拍分兩半（1 & 2 &）；複拍子 6/8、12/8 每大拍分三份（1 & a 2 & a），有搖擺感。3/4 有三個拍點，6/8 只有兩大拍。

### 講義擴充：低音與伴奏型

| 和弦 | 低音（根音） | 交替低音 |
| --- | --- | --- |
| C | 5 弦第 3 格 | 4 弦第 2 格 E 或 6 弦第 3 格 G |
| Am | 5 弦空弦 | 4 弦第 2 格 E |
| G | 6 弦第 3 格 | 5 弦第 2 格 B 或 4 弦空弦 D |
| Em | 6 弦空弦 | 5 弦第 2 格 B |
| F（小 F） | 4 弦第 3 格 | 3 弦第 2 格 A |
| D | 4 弦空弦 | 3 弦第 2 格 A |

| 伴奏型 | 拍號 | 寫法 |
| --- | --- | --- |
| 蹦洽拉 | 4/4 | X · ↓ ↑ x · ↓ ↑ |
| 華爾滋 | 3/4 | X · ↓ · ↓ · |
| 蹦洽拉洽拉 | 3/4 | X · ↓ ↑ ↓ ↑ |
| 6/8 搖擺 | 6/8 | X ↓ ↑ x ↓ ↑ |
| 12/8 慢板 | 12/8 | 每拍 X ↓ ↑ |

依歌曲選伴奏：抒情慢歌 60–80 BPM 用 12/8、蹦洽拉；中板 8 Beats；輕快流行用切分、16 Beats；圓舞曲用 3/4。
""",
6: """### 講義擴充：流行歌曲曲式

| 段落 | 任務 | 建議伴奏 |
| --- | --- | --- |
| 前奏 Intro | 告訴大家速度與調 | 四分音符下刷，或副歌和弦一輪 |
| 主歌 Verse（A） | 說故事，讓歌詞被聽清楚 | 蹦洽拉、四分音符、指法 |
| 導歌 Pre-chorus | 慢慢升溫 | 8 Beats，越刷越密 |
| 副歌 Chorus（B） | 全曲最高點、Hook | 切分或 16 Beats |
| 橋段 Bridge（C） | 製造對比 | 換刷法、停頓、長音 |
| 尾奏 Outro | 收尾 | 放慢，最後一刷讓和弦響完 |

常見順序：前奏 → A → 導歌 → B → 間奏 → A → B → C → B → 尾奏。

### 講義擴充：移調夾 Capo

- Capo 是可以移動的上弦枕，每往上夾一格，所有弦升一個半音；左手照原本的指型按。
- 「Key: F　Play: C　Capo: 5」：用 C 指型夾第 5 格，彈出 F 調。
- 換算：目標調 − 指型調 = Capo 格數。歌手想唱 D 調、用 C 指型 → Capo 2；Capo 3 Play G → Bb 調。

### 講義擴充：期中評量

穩定（拍子不斷）、和弦（清楚準時）、段落（主副歌有對比）、彈唱（一起進行）、台風（開頭結尾與互動）。比完整，不比難度。
""",
7: """### 講義擴充：音程

| 半音數 | 音程 | 協和度 |
| --- | --- | --- |
| 0 | 完全一度 | 完全協和 |
| 1 | 小二度 | 不協和 |
| 2 | 大二度 | 不協和 |
| 3 | 小三度 | 不完全協和 |
| 4 | 大三度 | 不完全協和 |
| 5 | 完全四度 | 完全協和 |
| 6 | 增四度／減五度 | 不協和 |
| 7 | 完全五度 | 完全協和 |
| 8 | 小六度 | 不完全協和 |
| 9 | 大六度 | 不完全協和 |
| 10 | 小七度 | 不協和 |
| 11 | 大七度 | 不協和 |
| 12 | 完全八度 | 完全協和 |

### 講義擴充：三和弦

| 和弦 | 組成 | C 為根音 | 寫法 |
| --- | --- | --- | --- |
| 大三和弦 | 大三度＋小三度 | C E G | C、Cmaj |
| 小三和弦 | 小三度＋大三度 | C Eb G | Cm、Cmin、C- |
| 增三和弦 | 大三度＋大三度 | C E G# | Caug、C+ |
| 減三和弦 | 小三度＋小三度 | C Eb Gb | Cdim、C° |
| 掛四和弦 | 四度取代三度 | C F G | Csus4 |

屬七和弦（例如 G7 = G B D F）含不協和的增四度，強烈地想解決到主和弦。

### 講義擴充：指法

- 拇指 T 管 4–6 弦低音，食指 1、中指 2、無名指 3 分別管 3、2、1 弦；手腕微拱、手指往掌心勾。
- 指法（一）T-1-2-3；指法（二）T-1-2-1-3-1-2-1；指法（三）夾弦 Pinch，拇指與無名指同時彈並加入交替低音。
""",
8: """### 講義擴充：G 大調

- G 大調音階：G A B C D E F# G，一個升記號（F#）。第一把位：6 弦 3 格 G、5 弦 0/2/3、4 弦 0/2/4、3 弦 0/2、2 弦 0/1/3、1 弦 0/2/3。
- 大調順階和弦的性質固定為「大、小、小、大、大、小、減」。

| 級數 | I | ii | iii | IV | V | vi | vii° |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C 大調 | C | Dm | Em | F | G | Am | Bdim |
| G 大調 | G | Am | Bm | C | D | Em | F#dim |

### 講義擴充：封閉和弦

- 封閉和弦＝食指當 Capo：E 型往上移一格並封第 1 格成為 F（1 3 3 2 1 1）；Am 型往上移兩格並封第 2 格成為 Bm（x 2 4 4 3 2）。
- 祕訣：用食指靠拇指一側、緊貼琴衍、用手臂重量往後拉、拇指放低在中指後方、逐弦檢查。3 弦最常悶，挪動食指避開關節縫。
- 每天「壓 5 秒、放 5 秒」×10 次；還壓不響時先用小 F 與 Bm（4–1 弦）把歌彈下去。
""",
9: """### 講義擴充：分數和弦

斜線前是和弦、斜線後是低音（唸作 C over G）。組成音不變，最低音改變，和弦的感覺跟著改變。

| 和弦 | 按法（6→1 弦） | 低音 |
| --- | --- | --- |
| C/G | 3 3 2 0 1 0 | G |
| C/E | 0 3 2 0 1 0 | E |
| G/B | x 2 0 0 0 3 | B |
| Am/G | 3 0 2 2 1 0 | G |
| D/F# | 2 x 0 2 3 2 | F# |

### 講義擴充：低音線

- 複根音與替代根音：低音在根音與五度音之間交替，例如 C 的 5 弦 3 格與 6 弦 3 格、G 的 6 弦 3 格與 4 弦空弦。
- 下行低音：C → G/B → Am → Am/G → F → C/E → Dm → G，低音 C B A G F E D G 一步一步往下，帶出懷念、感傷的情緒。
- 上行低音：C → C/E → F → G，常用在導歌把氣氛推進副歌。
- 經過音：放在換和弦前的最後一拍，用音階上的音走過去；每四小節一兩次就好。
""",
10: """### 講義擴充：級數與和弦功能

| 級數 | 名稱 | 功能 |
| --- | --- | --- |
| Ⅰ | 主和弦 | 主：穩定、回家 |
| ii | 上主和弦 | 下屬：出發 |
| iii | 中和弦 | 主（較弱） |
| Ⅳ | 下屬和弦 | 下屬：出發 |
| Ⅴ | 屬和弦 | 屬：緊張、想回家 |
| vi | 下中和弦 | 主（關係小調） |
| vii° | 導和弦 | 屬 |

### 講義擴充：常見和弦進行

| 名稱 | 級數 | C 大調 |
| --- | --- | --- |
| 流行四和弦 | I–V–vi–IV | C G Am F |
| 悲傷版四和弦 | vi–IV–I–V | Am F C G |
| 五〇年代進行 | I–vi–IV–V | C Am F G |
| 卡農進行 | I–V–vi–iii–IV–I–IV–V | C G Am Em F C F G |
| Ⅱ–Ⅴ–Ⅰ | ii–V–I | Dm G C |

- 代理和弦：C 可換 Am、Em；F 可換 Dm；G 可換 G7。關係大小調共用同一組和弦（C 大調與 A 小調）。
- 七和弦色彩：Cmaj7、Fmaj7、Am7、Dm7、Em7 讓聲音更柔和。
- 配和弦：看每小節重拍的旋律音屬於哪個和弦；最後一句回到 I。《小星星》：｜C｜F C｜F C｜G C｜。

### 講義擴充：基本編曲入門

原講義此章僅有綱要，以下依課堂實作整理：前奏用副歌和弦、主歌用指法或蹦洽拉加低音線、導歌用上行低音並越刷越密、副歌用切分或 16 Beats 並以 V7 結尾、尾奏放慢讓 I 或 Imaj7 響完。
""",
11: """### 講義擴充：旋律演奏技巧

| 技巧 | 記號 | 動作 |
| --- | --- | --- |
| 搥弦 Hammer-on | H | 撥出低音後，左手手指敲到更高的格 |
| 勾弦 Pull-off | P | 撥出高音後，左手手指往下勾離開弦 |
| 滑弦 Slide | S | 按著弦不放，滑到另一格 |

過門放在小節最後一兩拍，用下一個和弦裡的音或音階上相鄰的音，以搥、勾、滑連起來。

### 講義擴充：音色技巧（原講義第八、九章僅有綱要，本章補上動作）

| 技巧 | 動作 | 常用在 |
| --- | --- | --- |
| 悶音 Palm Mute | 右手掌側邊輕放在下弦枕旁的弦上再撥 | 主歌、搖滾低音 |
| 切音 Chuck | 刷下去的同時用手掌把聲音切斷，發出「恰」 | 第 2、4 拍 |
| 打板 Slap | 拇指或手掌拍打弦或琴身 | 指彈、Funk |
| 泛音 Harmonic | 輕觸第 12、7、5 格琴衍正上方，撥完立刻放開 | 前奏、尾奏 |
| 推弦 Bend | 按住弦往上推，音變高；木吉他推半音最常用 | 長音、主奏 |
| 鬆弦 Release | 推上去後慢慢放回 | 接在推弦後 |
| 揉音 Vibrato | 手指壓著弦小幅晃動，讓音微微波動 | 長音 |
| 顫音 Trill | 兩個音快速連續搥、勾 | 裝飾音 |
""",
12: """### 講義擴充：移調與定調

- 移調：每個和弦移動相同的半音數，或用 Capo 讓指型不變。用級數思考最快：I–V–vi–IV 在任何調都一樣。
- 定調四步驟：① 找歌的最高音 ② 測自己能輕鬆唱的最高音 ③ 算兩者相差幾個半音，整首移幾個半音 ④ 選最好彈的指型加 Capo。

### 講義擴充：其他調性

| 調 | 記號 | I | ii | iii | IV | V | vi |
| --- | --- | --- | --- | --- | --- | --- | --- |
| C | 無 | C | Dm | Em | F | G | Am |
| G | 1 個 # | G | Am | Bm | C | D | Em |
| D | 2 個 # | D | Em | F#m | G | A | Bm |
| A | 3 個 # | A | Bm | C#m | D | E | F#m |
| E | 4 個 # | E | F#m | G#m | A | B | C#m |
| F | 1 個 b | F | Gm | Am | Bb | C | Dm |

### 講義擴充：詞曲創作概論

- 主題與故事：人、事、時、地、物，越具體越動人。人稱立場決定聽眾站在哪裡。
- 押韻：句尾用同韻的字，可一韻到底或段落換韻（例如ㄡ韻：走、手、久、後）。
- 曲式：主歌說故事、副歌說重點；先有和弦循環再哼旋律，重拍音落在和弦音上。
- 記錄保存與修正回饋：靈感立刻錄音記下；寫完放一天，唱給別人聽再修改。
- 歌曲企劃單：主題與故事、人稱、調性、速度（BPM）、主律動、音域、押韻方式。

### 參考區：木吉他保養與換弦

- 指板：換弦時清潔，玫瑰木、黑檀木指板一年上一兩次指板油。琴身：彈完擦去手汗，避開日曬、高溫、潮濕，濕度約 45–55%。
- 琴弦：聲音變悶或生鏽就換；磷青銅溫暖耐用、80/20 黃銅明亮、鍍膜弦壽命長。
- 換弦：一次換一條、弦釘固定弦尾、留兩三格長度繞旋鈕、同方向捲、調音後拉一拉弦再調一次。
""",
}


def clean(t):
    t = re.sub(r'<[^>]+>', '', t)
    return html.unescape(re.sub(r'\s+', ' ', t)).strip()


def slides_of(n):
    src = (ROOT / 'tools' / 'decks' / ('ch%02d.html' % n)).read_text(encoding='utf-8')
    meta, body = src.split('\n', 1)
    title, en, _ = meta.split('|')
    secs = re.findall(r'<section class="slide[^"]*">(.*?)</section>', body, re.S)
    out = []
    for i, s in enumerate(secs, 1):
        tag = re.search(r'class="tag (t-\w+)"', s)
        seg = tag.group(1) if tag else ('rest' if 'id="timer"' in s else None)
        h = re.search(r'<h[12][^>]*>(.*?)</h[12]>', s, re.S) or re.search(r'<p class="quote">(.*?)</p>', s, re.S)
        ix = re.search(r'<div class="ix-tag"><b>互動</b>(.*?)</div>', s)
        checks = re.findall(r'<li>(.*?)</li>', re.search(r'<ul class="checks"[^>]*>(.*?)</ul>', s, re.S).group(1), re.S) if 'class="checks"' in s else []
        goals = re.findall(r'<li>(.*?)</li>', s, re.S) if i == 2 else []
        out.append(dict(no=i, seg=seg, h=clean(h.group(1)) if h else '', ix=clean(ix.group(1)) if ix else '', checks=[clean(c) for c in checks], goals=[clean(g) for g in goals], timer='id="timer"' in s))
    return title, en, out


def surveys():
    js = (ROOT / 'site' / 'guitar' / 'surveys.js').read_text(encoding='utf-8')
    out = {}
    for m in re.finditer(r"id: 'g-pre-(\d+)'.*?questions: \[(.*?)\n  \] \}", js, re.S):
        out[int(m.group(1))] = re.findall(r"\{ q: '([^']*)'", m.group(2))
    return out


PNAME = {'Q': '四分音符 下刷', 'A': '八分音符 8 Beats', 'B': '切分 Folk Rock', 'S': '十六分音符 16 Beats', 'P': '蹦洽拉 Bass & Strum',
         'W': '華爾滋 3/4 蹦洽洽', 'W2': '3/4 蹦洽拉洽拉', 'E6': '6/8 搖擺', 'K': '切音 Chuck', 'T12': '12/8 慢板'}
SET0 = {'prog': 'C', 'fifties': 'C', 'C': 'C', 'G': 'G', 'open': 'open', 'Em': 'Em', 'gkey': 'G', 'waltz': 'C', 'minor': 'Am', 'bass': 'C'}
CNAME = {'open': '空弦'}


def scores(n):
    """從投影片原稿收集本章所有刷法與六線譜，輸出「譜例」段落（講義頁由 guitar.js 畫成五線譜＋六線譜）。"""
    src = (ROOT / 'tools' / 'decks' / ('ch%02d.html' % n)).read_text(encoding='utf-8')
    pats, seen = [], set()
    for m in re.finditer(r'<div (data-strum-player="([^"]+)"[^>]*|data-pattern-grid="([^"]+)"[^>]*)>', src):
        attrs = m.group(1)
        keys = (m.group(2) or m.group(3)).split()
        ch = re.search(r'data-chord="([^"]+)"', attrs)
        chords = re.search(r'data-chords="([^"]+)"', attrs)
        chord = ch.group(1) if ch else SET0.get(chords.group(1).split()[0], chords.group(1).split()[0].split(',')[0]) if chords else 'C'
        for k in keys:  # 每種刷法只列一次；先遇到空弦、之後有真正的和弦時改用和弦
            if k not in seen:
                seen.add(k); pats.append((k, chord))
            elif chord != 'open':
                pats = [(a, chord if a == k and b == 'open' else b) for a, b in pats]
    tabs, tseen = [], set()
    for m in re.finditer(r'<div data-tab="([^"]+)"([^>]*)>', src):
        if m.group(1) in tseen:
            continue
        tseen.add(m.group(1))
        title = re.search(r'data-title="([^"]*)"', m.group(2)); per = re.search(r'data-per-row="(\d+)"', m.group(2))
        tabs.append((m.group(1), html.unescape(title.group(1)) if title else '', per.group(1) if per else '4'))
    if not pats and not tabs:
        return ''
    L = ['### 譜例：五線譜＋六線譜', '', '本章用到的刷法與指法。上方五線譜看音高與音符長短，下方六線譜看弦與格；刷法下方的箭頭是右手方向。', '']
    for k, c in pats:
        L += ['<div class="hb-score"><p class="hb-cap"><b>%s</b>（%s 和弦）</p><div data-pattern-grid="%s" data-chord="%s"></div></div>' % (PNAME[k], CNAME.get(c, c), k, c), '']
    for t, title, per in tabs:
        L += ['<div class="hb-score"><div data-tab="%s" data-per-row="%s" data-title="%s"></div></div>' % (t, per, html.escape(title, quote=True).replace('&#x27;', "'")), '']
    return '\n'.join(L).rstrip() + '\n'


def chapter(n, sv):
    title, en, sl = slides_of(n)
    L = ['## 第%s章｜%s %s' % (ZH[n], title, en.replace(' · ', ' & ')), '']
    goals = sl[1]['goals']
    L.append('本章目標：' + '；'.join(re.sub(r'；?掃這張.*$', '', g).rstrip('；。') for g in goals) + '。')
    L += ['', '### 課前問卷', '']
    L += ['- ' + q for q in sv.get(n, [])]
    L += ['', '### 課程綱要（120 分鐘）', '', '| 段落 | 時間 | 內容 | 投影片 |', '| --- | --- | --- | --- |']
    order = ['t-qi', 't-cheng', 'rest', 't-zhuan', 't-he']
    for key in order:
        group = [s for s in sl if s['seg'] == key]
        if not group:
            continue
        names = '、'.join(s['h'] for s in group if s['h'] and not s['timer']) or '休息十分鐘'
        rng = '%d–%d' % (group[0]['no'], group[-1]['no']) if len(group) > 1 else str(group[0]['no'])
        L.append('| %s | %s | %s | %s |' % (SEG[key][0], SEG[key][1], names, rng))
    tail = [s for s in sl if s['seg'] is None and s['no'] > 2]
    if tail:
        L.append('| 收尾 | 課後 | 三句話總結、每日練習紀錄、課後練習與下章預告 | %s |' % '、'.join(str(s['no']) for s in tail))
    sc = scores(n)
    L += ['', NOTES[n].strip()] + (['', sc.strip()] if sc else []) + ['', '### 課堂互動（網站簡報）', '', '| 投影片 | 互動 | 內容 |', '| --- | --- | --- |']
    for s in sl:
        if s['ix']:
            L.append('| %d | %s | %s |' % (s['no'], s['ix'], s['h']))
    checks = [c for s in sl for c in s['checks']]
    if checks:
        L += ['', '### 課後練習', ''] + ['- [ ] ' + c for c in checks]
    return '\n'.join(L) + '\n'


def main():
    md = MD.read_text(encoding='utf-8')
    head = md[:md.index('## 第二章')]
    head = re.sub(r'\| 教案草案（原教材部分為綱要） \|', '| 投影片完成 |', head)
    head = head.replace('| 教案草案 |', '| 投影片完成 |')
    # 第一章為手寫內容：在「課堂互動」前放入（或更新）譜例
    head = re.sub(r'<!-- scores:1 -->.*?<!-- /scores:1 -->\n\n', '', head, flags=re.S)
    i1 = head.index('### 課堂互動（網站簡報）', head.index('## 第一章'))
    head = head[:i1] + '<!-- scores:1 -->\n\n' + scores(1) + '\n<!-- /scores:1 -->\n\n' + head[i1:]
    sv = surveys()
    body = '\n'.join(chapter(n, sv) for n in range(2, 13))
    MD.write_text(head + body, encoding='utf-8', newline='\n')
    print('handbook chapters 2-12 written', len(head + body))


if __name__ == '__main__':
    main()
