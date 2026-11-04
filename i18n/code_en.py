"""英文版的整句程式替換：中文由片段拼成、英文語序不同的地方，直接換成英文的寫法。
格式：CODE = {'site 底下的檔案路徑': [(中文版原始碼片段, 英文版原始碼片段), ...]}
中文原始碼改動後片段對不上，build 會在 stderr 提示。"""
CODE = {
    'assets/interact.js': [
        ("'第 ' + (k + 1) + ' 組'", "'Group ' + (k + 1)"),
        ("'第 ' + (si + 1) + ' / 8 音：'", "'Note ' + (si + 1) + ' / 8: '"),
        ("'第 ' + (round + 1) + ' 輪・'", "'Round ' + (round + 1) + ' · '"),
        ("'・第 ' + (round + 1) + ' 輪'", "' · Round ' + (round + 1)"),
        ("'<span class=\"sf-no\">第 ' + (k + 1) + ' / ' + bars + ' 小節</span>", "'<span class=\"sf-no\">Bar ' + (k + 1) + ' / ' + bars + '</span>"),
        ("'第 ' + (Math.min(bars - 1, Math.max(0, Math.floor(beat / 4))) + 1) + ' / ' + bars + ' 小節・'", "'Bar ' + (Math.min(bars - 1, Math.max(0, Math.floor(beat / 4))) + 1) + ' / ' + bars + ' · '"),
        ("'\">第 ' + (k + 1) + ' 位　'", "'\">#' + (k + 1) + '　'"),
        ("'<tr><td>第 ' + (d + 1) + ' 天</td>'", "'<tr><td>Day ' + (d + 1) + '</td>'"),
        ("aria-label=\"第 ' + (d + 1) + ' 天 '", "aria-label=\"Day ' + (d + 1) + ' '"),
        ("(loop ? '第 ' + round + ' 位　' : '')", "(loop ? 'Person ' + round + '　' : '')"),
    ],
    'assets/learning/bass-map.js': [
        ("n+'弦'", "'String '+n"),
        ("n[0]+'弦'+(n[1]?'第'+n[1]+'格':'空弦')", "'string '+n[0]+(n[1]?', fret '+n[1]:', open')"),
        ("i===0?'根':'替'", "i===0?'R':'A'"),
    ],
    'vocal/handbook.html': [
        ("h.textContent.match(/第([一二三四五六])堂/), n = m ? NUM[m[1]] : 0", r"h.textContent.match(/^Lesson (\d+)/), n = m ? +m[1] : 0"),
        (r"h.textContent.split(/\s(?=[A-Z])/)", "[h.textContent]"),
        (".replace(/^第.堂｜/, '')", r".replace(/^Lesson \d+｜/, '')"),
        ("'第' + m[1] + '堂　'", "'Lesson ' + m[1] + '　'"),
        ("'第' + m[1] + '堂'", "'Lesson ' + m[1]"),
        ("'填寫第 ' + n + ' 堂課前問卷 →'", "'Lesson ' + n + ' pre-class survey →'"),
    ],
    'piano/handbook.html': [
        ("h.textContent.match(/第(十[一二]?|[一二三四五六七八九])堂/), n = m ? NUM[m[1]] : 0", r"h.textContent.match(/^Lesson (\d+)/), n = m ? +m[1] : 0"),
        (r"h.textContent.split(/\s(?=[A-Z])/)", "[h.textContent]"),
        (".replace(/^第.{1,2}堂｜/, '')", r".replace(/^Lesson \d+｜/, '')"),
        ("'第' + m[1] + '堂　'", "'Lesson ' + m[1] + '　'"),
        ("'第' + m[1] + '堂'", "'Lesson ' + m[1]"),
        ("'\">填寫第 ' + n + ' 堂課前問卷 →</a>", "'\">Lesson ' + n + ' pre-class survey →</a>"),
        ("'/\">開啟第 ' + n + ' 堂投影片 →</a>'", "'/\">Lesson ' + n + ' slides →</a>'"),
    ],
    'songwriting/handbook.html': [
        ("h.textContent.match(/第([一二三四五六七八])堂/), n = m ? NUM[m[1]] : 0", r"h.textContent.match(/^Lesson (\d+)/), n = m ? +m[1] : 0"),
        (r"h.textContent.split(/\s(?=[A-Z])/)", "[h.textContent]"),
        (".replace(/^第.堂｜/, '')", r".replace(/^Lesson \d+｜/, '')"),
        ("'第' + m[1] + '堂　'", "'Lesson ' + m[1] + '　'"),
        ("'第' + m[1] + '堂'", "'Lesson ' + m[1]"),
        ("'\">填寫第 ' + n + ' 堂課前問卷 →</a>", "'\">Lesson ' + n + ' pre-class survey →</a>"),
        ("'/\">開啟第 ' + n + ' 堂投影片 →</a>'", "'/\">Lesson ' + n + ' slides →</a>'"),
    ],
    'guitar/handbook.html': [
        ("h.textContent.match(/第(十[一二]?|[一二三四五六七八九])章/), n = m ? NUM[m[1]] : 0", r"h.textContent.match(/^Chapter (\d+)/), n = m ? +m[1] : 0"),
        (r"h.textContent.split(/\s(?=[A-Z])/)", "[h.textContent]"),
        (".replace(/^第.{1,2}章｜/, '')", r".replace(/^Chapter \d+｜/, '')"),
        ("'第' + m[1] + '章　'", "'Chapter ' + m[1] + '　'"),
        ("'第' + m[1] + '章'", "'Chapter ' + m[1]"),
        ("'\">填寫第 ' + n + ' 章課前問卷 →</a>'", "'\">Chapter ' + n + ' pre-class survey →</a>'"),
        ("'/\">開啟第 ' + n + ' 章投影片 →</a>'", "'/\">Chapter ' + n + ' slides →</a>'"),
    ],
    'vocal/data-transfer.html': [
        ("'匯入完成：新增 ' + added + ' 筆，保留既有或略過 ' + skipped + ' 筆，儲存空間不足 ' + failed + ' 筆。'", "'Import finished: ' + added + ' added, ' + skipped + ' kept or skipped, ' + failed + ' failed for lack of storage space.'"),
    ],
    'assets/learning/practice-trends.js': [
        ("label:'第'+(d+1)+'天'", "label:'Day '+(d+1)"),
    ],
    'assets/learning/chord-path.js': [
        ("n+'弦'", "'String '+n"),
        ("f+'格'", "'Fret '+f"),
    ],
    'assets/learning/voice-leading.js': [
        ("'第'+(pos+1)+'步 '", "'Step '+(pos+1)+' '"),
    ],
    'assets/learning/breathing.js': [
        ("'第 '+(i+1)+' 拍'", "'Beat '+(i+1)"),
        ("'第 '+(beat+1)+' 拍：'", "'Beat '+(beat+1)+': '"),
    ],
}

for _lab in ('vocal', 'guitar', 'piano', 'songwriting'):
    CODE.setdefault(_lab + '/survey.html', []).extend([
        ("'還有 ' + bad.length + ' 題沒有填寫，請從這一題開始'", "bad.length + ' more question' + (bad.length > 1 ? 's' : '') + ' to answer. Start with this one.'"),
        ("'你在 ' + esc(j.time) + ' 以 ' + esc(a.email) + ' 送出過這份問卷。是否要修改原本的填答？'", "'You sent this survey on ' + esc(j.time) + ' as ' + esc(a.email) + '. Would you like to edit your answers?'"),
    ])

# 列印版講義：英文 Markdown 的章節標題是 Lesson n｜… / Chapter n｜…
for _lab, _unit, _re in (('vocal', 'Lesson', '/第([一二三四五六])堂/'), ('guitar', 'Chapter', '/第(十[一二]?|[一二三四五六七八九])章/'),
                         ('piano', 'Lesson', '/第(十[一二]?|[一二三四五六七八九])堂/'), ('songwriting', 'Lesson', '/第([一二三四五六七八])堂/')):
    _strip = {'vocal': '/^第.堂｜/', 'guitar': '/^第.{1,2}章｜/', 'piano': '/^第.{1,2}堂｜/', 'songwriting': '/^第.堂｜/'}[_lab]
    CODE.setdefault(_lab + '/handbook-print.html', []).extend([
        ("nd.textContent.match(" + _re + "), n = m ? NUM[m[1]] : 0", "nd.textContent.match(/^" + _unit + r" (\d+)/), n = m ? +m[1] : 0"),
        (r"nd.textContent.split(/\s(?=[A-Z])/)", "[nd.textContent]"),
        (".replace(" + _strip + ", '')", ".replace(/^" + _unit + r" \d+｜/, '')"),
    ])

CODE['assets/learning/practice-trends.js'].append(("/秒|次|分鐘|時間/.test(x[1])", "/秒|次|分鐘|時間|sec|times|min|time/i.test(x[1])"))
CODE['assets/learning/breathing.js'].append(("'（第 '+(Math.floor(pos/4/BEATS)+1)+' / '+BARS+' 小節）'", "' (bar '+(Math.floor(pos/4/BEATS)+1)+' / '+BARS+')'"))

CODE['guitar/guitar.js'] = [
    ("nt.s + ' 弦 ' + nt.f + ' 格'", "'string ' + nt.s + ', fret ' + nt.f"),
    ("st + ' 弦第 ' + f + ' 格 '", "'string ' + st + ', fret ' + f + ' '"),
    ("(6 - i) + ' 弦・' + o.n + o.o", "'String ' + (6 - i) + ' · ' + o.n + o.o"),
    ("'調音 ' + (6 - cur) + ' 弦'", "'Tuning string ' + (6 - cur)"),
    ("'C 調 ' + c.degree + ' 級'", "'Degree ' + c.degree + ' in C'"),
    ("sh + ' 指型</b>＋Capo 第 ' + cp + ' 格'", "sh + ' shape</b> + capo ' + cp"),
    ("'剛才練習 ' + secs + ' 秒，換了 ' + changes + ' 次和弦'", "'You practised for ' + secs + ' seconds and changed chords ' + changes + ' times'"),
    ("' 秒・換 ' + changes + ' 次'", "' sec · ' + changes + ' changes'"),
    ("P.name + '（' + CHORDS[chord].name + ' 和弦）的五線譜與六線譜\">'", "P.name + ' (' + CHORDS[chord].name + ' chord): staff and tab\">'"),
    ("<text x=\"44\" y=\"' + (y + 5) + '\" class=\"en\">弦</text>", "<text x=\"44\" y=\"' + (y + 5) + '\" class=\"en\">string</text>"),
]
CODE['piano/piano.js'] = [
    (".join('、')", ".join(', ')"),
]
for _lab in ('vocal', 'guitar', 'piano', 'songwriting'):
    CODE.setdefault(_lab + '/handbook-print.html', []).append(("'<div class=\"s\">' + list.join('、')", "'<div class=\"s\">' + list.join(', ')"))
CODE.setdefault('assets/learning/arrangement.js', []).append((".join('、')", ".join(', ')"))
CODE['songwriting/songwriting.js'] = [
    ("'前奏放在第 ' + (i + 1) + ' 段：前奏之前沒有其他段落，只有專輯序曲例外。'", "'The intro is section ' + (i + 1) + ': nothing should come before the intro, except an album overture.'"),
    ("'第 ' + (bar + 1) + ' 小節｜'", "'Bar ' + (bar + 1) + '｜'"),
    ("return p.k ? RGK[p.k].name : '無'; }).join('、')", "return p.k ? RGK[p.k].name : '無'; }).join(', ')"),
]
CODE['songwriting/works-lab.js'] = [
    ("'第 ' + (i + 1) + ' 張的段落名稱'", "'Section name for card ' + (i + 1)"),
    ("'第 ' + (i + 1) + ' 張歌詞，點選後再點選另一張即可交換位置'", "'Lyric card ' + (i + 1) + ', tap it and then another card to swap them'"),
    ("'題目：「' + spots[j].f.at + '」'", "'Question: “' + spots[j].f.at + '”'"),
    ("'（可接受的答案：' + sp.f.figs.join('、') + '）'", "' (accepted answers: ' + sp.f.figs.join(', ') + ')'"),
    ("'再想一想：' + o + ' 的定義，是否符合這一句的寫法？'", "'Think again: does the definition of ' + o + ' fit how this line is written?'"),
    ("'「' + data[i].c", "'“' + data[i].c"),
    ("'」。'", "'”.'"),
    ("'「' + st.res.w", "'“' + st.res.w"),
    ("'第 ' + rounds.length + ' 次：' + peak", "'Round ' + rounds.length + ': ' + peak"),
    ("'・出自〈' + x + '〉'", "' · from ' + x"),
    ("'，每分鐘 ' + work.bpm + ' 拍'", "', ' + work.bpm + ' BPM'"),
    (".join('、') + (data.some(", ".join(', ') + (data.some("),
]
CODE['songwriting/songwriting.js'] += [
    ("if (Array.isArray(v)) v = v.join('、');", "if (Array.isArray(v)) v = v.join(', ');"),
    ("st[t[0]].length; }).join('、'), detail: st", "st[t[0]].length; }).join(', '), detail: st"),
    ("result: res.join('、') }", "result: res.join(', ') }"),
]
CODE['songwriting/works-lab.js'] += [
    ("return d.c + TONE_ZH[d.t]; }).join('、'))", "return d.c + TONE_ZH[d.t]; }).join(', '))"),
    ("(nb.words || []).join('、')", "(nb.words || []).join(', ')"),
]
CODE['songwriting/songwriting.js'] += [
    ("'</b>（' + cnt[top]", "'</b> (' + cnt[top]"),
    ("RGK[top].name + '（' + cnt[top]", "RGK[top].name + ' (' + cnt[top]"),
]

# 講義 PDF 的下載檔名（英文 PDF 放在 en/<lab>/，檔名與中文版相同）
for _lab, _zh, _en in [('vocal', 'Vocal_Lab_講義與教案.pdf', 'Vocal_Lab_Handbook.pdf'),
                       ('guitar', '民謠吉他十二章_講義與教案.pdf', 'Guitar_Lab_Handbook.pdf'),
                       ('piano', '流行鋼琴十二堂_講義與教案.pdf', 'Piano_Lab_Handbook.pdf'),
                       ('songwriting', '詞曲創作八堂_講義與教案.pdf', 'Songwriting_Lab_Handbook.pdf')]:
    for _page in ('/handbook.html', '/handbook-print.html'):
        CODE.setdefault(_lab + _page, []).append(('download="' + _zh + '"', 'download="' + _en + '"'))

# 英文歌手名之間改用逗號
CODE.setdefault('guitar/songs.js', []).extend([("'Hugh Grant、Drew Barrymore'", "'Hugh Grant, Drew Barrymore'"),
    ("'Glen Hansard、Markéta Irglová'", "'Glen Hansard, Markéta Irglová'"), ("'Jason Mraz、Colbie Caillat'", "'Jason Mraz, Colbie Caillat'")])
CODE.setdefault('piano/songs.js', []).append(("'Stan Getz、Astrud Gilberto'", "'Stan Getz, Astrud Gilberto'"))

# 手機版今日路線：英文段落名（Open／Build／Break）比單一中文字寬，標籤欄改為依字寬
CODE.setdefault('assets/deck-bundle.css', []).append(('.timeline b{font-size:16px;width:20px}', '.timeline b{font-size:16px;min-width:48px;flex:none}'))
