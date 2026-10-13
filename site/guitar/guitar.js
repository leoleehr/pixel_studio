/* Guitar Lab：和弦資料、和弦圖、換和弦練習、刷奏播放、錄音與練習卡。 */
(function (PS) {
  'use strict';
  var course = new PS.store.Course('guitar', '2026.1');
  var lesson = document.body.getAttribute('data-lesson') || '';

  /* frets／fingers 由 6 弦排到 1 弦；-1 悶音、0 空弦 */
  var CHORDS = {
    C:  { name: 'C',  zh: 'C 大三和弦', degree: 'I',  frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
          tip: '6 弦不彈。無名指壓 5 弦第 3 格，指尖立起來，別碰到 4 弦。' },
    G:  { name: 'G',  zh: 'G 大三和弦', degree: 'V',  frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
          tip: '六條弦都彈。中指在 6 弦、食指在 5 弦、無名指在 1 弦，手腕放低一點。' },
    Am: { name: 'Am', zh: 'A 小三和弦', degree: 'vi', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
          tip: '和 C 只差一根手指：無名指從 5 弦移到 3 弦，食指和中指不動。' },
    F:  { name: 'F',  zh: 'F 大三和弦（小 F）', degree: 'IV', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barre: { fret: 1, from: 4, to: 5 },
          tip: '只彈 4 到 1 弦。食指平壓 1、2 弦第 1 格，靠近琴格壓才不會悶。完整封閉 F 留到後面單元。' }
  };
  var PROGRESSIONS = [
    { id: 'pop', label: 'C → G → Am → F', seq: ['C', 'G', 'Am', 'F'] },
    { id: 'fifties', label: 'C → Am → F → G', seq: ['C', 'Am', 'F', 'G'] },
    { id: 'minor', label: 'Am → F → C → G', seq: ['Am', 'F', 'C', 'G'] }
  ];
  /* 刷奏型態：每拍兩格（八分音符）。D 下刷、U 上刷、d／u 空刷（手照常擺動，不碰弦） */
  var PATTERNS = {
    A: { name: '八分音符 8 Beats', cells: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'],
         desc: '手腕像甩水一樣上下擺動：拍點往下、半拍往上，八下平均。' },
    B: { name: '切分 Folk Rock', cells: ['D', 'u', 'D', 'U', 'd', 'U', 'D', 'U'],
         desc: '第 2 拍後半拍延音到第 3 拍，第 3 拍的下刷「空過去」不碰弦，重音因此往前移。口訣：下、下上、上下上。' }
  };
  var COUNTS = ['1', '&', '2', '&', '3', '&', '4', '&'];
  var CHECKLISTS = {
    'ch03': [
      ['four', '四個和弦都能壓出來，每條該響的弦都清楚', '一條一條弦慢慢撥，聽有沒有悶音'],
      ['c-am', 'C 和 Am 之間只動無名指，來回切換十次', '不看左手也能找到位置'],
      ['bpm60', 'C → G → Am → F 在 60 BPM、每和弦 4 拍不停拍', '換不過去時先彈空弦，也不要停下來'],
      ['bpm60x2', '同一組進行在 60 BPM、每和弦 2 拍完成兩輪', ''],
      ['record', '錄一段 30 秒的換和弦練習，聽聽看哪裡斷掉', '']
    ],
    'ch04': [
      ['eighth', '空弦刷 8 Beats，60 BPM 下手不停、上下平均', '先悶住弦，只聽節奏'],
      ['eighth-chord', '8 Beats 配 C → G → Am → F，每和弦一小節', ''],
      ['sync-say', '能邊拍手邊唸出切分口訣：下、下上、上下上', '先唸對，再上琴'],
      ['sync-play', '切分 Folk Rock 在 70 BPM 彈完一輪四和弦', '空刷時手照樣往下擺，只是不碰弦'],
      ['record', '錄下兩種刷法各一段，比較重音位置', '']
    ]
  };
  /* 12 章課綱：上冊（2013-1）第 1–6 章、下冊（2013-2）第 7–12 章，每章 120 分鐘 */
  var CHAPTERS = [
    { n: 1, part: '上', title: '認識吉他與調音', en: 'Meet the Guitar',
      topics: ['吉他構造與各部位名稱', '持琴姿勢、左手架構與持彈片', '空弦音名與調音（調音器／App）', '第一次發出聲音：空弦節奏'],
      source: '上冊 第一章、第三章第一節（吉他歷史與分類移到參考區）' },
    { n: 2, part: '上', title: '拍點、讀譜與熱手', en: 'Beat & Warm-up',
      topics: ['音高與譜表、時值、拍號', '六線譜 TAB 讀法', '爬格子熱手 1-2-3-4', '指板音名與單音旋律（Ode to Joy 等）'],
      source: '上冊 第二章、第三章第二、三節' },
    { n: 3, part: '上', title: '第一組和弦', en: 'First Chords', href: 'ch03/',
      topics: ['和弦圖怎麼讀', 'C、G、Am、F 四大和弦', '換和弦不停拍', 'C 調級數 I–V–vi–IV'],
      source: '上冊 第三章第四、五節' },
    { n: 4, part: '上', title: '刷奏與切分', en: 'Strumming & Syncopation', href: 'ch04/',
      topics: ['下刷、上刷與空刷', '華語教材刷法標示', '八分音符 8 Beats', '切分 Folk Rock 與 16 分音符變化'],
      source: '上冊 第四章第一至三節' },
    { n: 5, part: '上', title: '三拍子與伴奏變化', en: 'Triple Meter Grooves',
      topics: ['二拍子系統的其他伴奏型', '3/4、6/8 與 12/8', '低音＋刷奏（蹦洽洽）', '依歌曲速度選擇伴奏型'],
      source: '上冊 第四章第三、四節' },
    { n: 6, part: '上', title: '曲式分析與期中彈唱', en: 'Song Form & Showcase',
      topics: ['主歌、副歌、橋段與前奏尾奏', '用 Capo 配合歌手的調', '整首歌的段落伴奏設計', '期中彈唱發表'],
      source: '上冊 第五、六章' },
    { n: 7, part: '下', title: '樂理導入與指法', en: 'Intervals & Fingerstyle',
      topics: ['音程與協和度', '大、小、增、減、掛留三和弦', '指法基本姿勢 T-1-2-3', '常用分散和弦指法'],
      source: '下冊 序章、第一章' },
    { n: 8, part: '下', title: 'G 大調與封閉和弦', en: 'G Major & Barre Chords',
      topics: ['G 大調自然音階', '順階和弦', '封閉和弦 F、Bm', '封閉和弦換位練習'],
      source: '下冊 第二章' },
    { n: 9, part: '下', title: '低音變化', en: 'Bass Lines',
      topics: ['根音與替代根音', '分數和弦（C/G、C/E）', '經過音與下行低音線', '低音＋刷奏的伴奏'],
      source: '下冊 第三章' },
    { n: 10, part: '下', title: '級數與和弦編排', en: 'Progressions & Arranging',
      topics: ['級數與順階和弦的功能', '常見流行和弦進行', '代理和弦與色彩和弦', '基本編曲：段落與配器想法'],
      source: '下冊 第四章、第十一章（綱要，需補教材）' },
    { n: 11, part: '下', title: '旋律與音色技巧', en: 'Melody & Techniques',
      topics: ['搥弦、勾弦、滑弦', '悶音、切音、打板、泛音', '推弦、鬆弦、揉音與顫音', '在伴奏中加入過門'],
      source: '下冊 第五、八、九章（後兩章為綱要，需補示範與練習）' },
    { n: 12, part: '下', title: '轉調、定調與創作', en: 'Keys & Songwriting',
      topics: ['移調與 Capo 換算', '找到自己的調（Make Your Own Key）', 'D、F、A、E 大調概覽', '詞曲創作概論與期末作品'],
      source: '下冊 第六、七、八章（保養與換弦移到參考區）' }
  ];
  /* 每章 120 分鐘的固定節奏 */
  var AGENDA = [['暖身', 15], ['新觀念', 30], ['分段練習', 40], ['合奏與應用', 25], ['回顧與作業', 10]];
  PS.guitar = { CHORDS: CHORDS, PATTERNS: PATTERNS, CHECKLISTS: CHECKLISTS, CHAPTERS: CHAPTERS, AGENDA: AGENDA, course: course };

  function el(tag, attrs, html) {
    var e = document.createElement(tag);
    for (var k in attrs || {}) e.setAttribute(k, attrs[k]);
    if (html !== undefined) e.innerHTML = html;
    return e;
  }
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  /* ---------- 和弦圖 ---------- */
  function diagram(key, opts) {
    var c = CHORDS[key], o = opts || {};
    var x0 = 22, dx = 16, y0 = 34, dy = 24, frets = 4, w = x0 * 2 + dx * 5, h = y0 + dy * frets + 14;
    var s = '<svg class="chord-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + c.zh + ' 和弦圖：' + describe(c) + '">';
    s += '<rect x="' + x0 + '" y="' + (y0 - 4) + '" width="' + dx * 5 + '" height="4" class="nut"/>';
    for (var f = 1; f <= frets; f++) s += '<line x1="' + x0 + '" x2="' + (x0 + dx * 5) + '" y1="' + (y0 + dy * f) + '" y2="' + (y0 + dy * f) + '" class="fret"/>';
    for (var i = 0; i < 6; i++) s += '<line x1="' + (x0 + dx * i) + '" x2="' + (x0 + dx * i) + '" y1="' + y0 + '" y2="' + (y0 + dy * frets) + '" class="string" style="stroke-width:' + (1.8 - i * 0.2) + '"/>';
    if (c.barre) {
      var bx1 = x0 + dx * c.barre.from, bx2 = x0 + dx * c.barre.to, by = y0 + dy * (c.barre.fret - 0.5);
      s += '<rect x="' + (bx1 - 7) + '" y="' + (by - 7) + '" width="' + (bx2 - bx1 + 14) + '" height="14" rx="7" class="dot"/>';
    }
    c.frets.forEach(function (fr, i) {
      var x = x0 + dx * i;
      if (fr < 0) s += '<text x="' + x + '" y="' + (y0 - 12) + '" class="mark">×</text>';
      else if (fr === 0) s += '<circle cx="' + x + '" cy="' + (y0 - 16) + '" r="4.5" class="open"/>';
      else {
        var y = y0 + dy * (fr - 0.5);
        if (!(c.barre && fr === c.barre.fret && i >= c.barre.from && i <= c.barre.to && i !== c.barre.from)) {
          s += '<circle cx="' + x + '" cy="' + y + '" r="7" class="dot"/>';
        }
        if (!o.noFingers && c.fingers[i] && !(c.barre && i > c.barre.from && fr === c.barre.fret)) {
          s += '<text x="' + x + '" y="' + (y + 3.6) + '" class="finger">' + c.fingers[i] + '</text>';
        }
      }
    });
    if (o.strings) {
      for (var j = 0; j < 6; j++) s += '<text x="' + (x0 + dx * j) + '" y="' + (h - 1) + '" class="snum">' + (6 - j) + '</text>';
    }
    return s + '</svg>';
  }
  function describe(c) {
    return c.frets.map(function (f, i) {
      var n = (6 - i) + ' 弦';
      return f < 0 ? n + '不彈' : f === 0 ? n + '空弦' : n + '第 ' + f + ' 格';
    }).join('、');
  }
  $$('[data-diagram]').forEach(function (n) {
    n.innerHTML = diagram(n.getAttribute('data-diagram'), { strings: n.hasAttribute('data-strings') });
  });

  /* ---------- 和弦卡 ---------- */
  $$('[data-chord-cards]').forEach(function (root) {
    Object.keys(CHORDS).forEach(function (k) {
      var c = CHORDS[k];
      var card = el('article', { class: 'card chord-card' },
        '<div class="chord-head"><h3>' + c.name + '</h3><span class="degree">C 調 ' + c.degree + ' 級</span></div>' +
        '<div class="chord-fig">' + diagram(k, { strings: true }) + '</div>' +
        '<p class="chord-zh">' + c.zh + '</p><p>' + c.tip + '</p>' +
        '<button type="button" class="btn small" data-hear="' + k + '">▶ 聽聽看</button>');
      root.appendChild(card);
    });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hear]'); if (!b) return;
      var c = CHORDS[b.getAttribute('data-hear')], a = PS.audio.ctx(); if (!a) return;
      PS.audio.strum(c.frets, a.currentTime + 0.02, 'down', { duration: 2.2, gap: 0.03 });
    });
  });

  /* 一次只讓一個節拍器播放 */
  var active = null;
  function claim(stopFn) { if (active && active !== stopFn) active(); active = stopFn; }

  function seg(root, name, options, current, onChange) {
    var wrap = el('div', { class: 'seg', role: 'group', 'aria-label': name });
    options.forEach(function (op) {
      var b = el('button', { type: 'button', 'aria-pressed': String(op[0] === current) }, op[1]);
      b.addEventListener('click', function () {
        $$('button', wrap).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        b.setAttribute('aria-pressed', 'true');
        onChange(op[0]);
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function bpmField(min, max, value, onInput) {
    var id = 'bpm-' + Math.random().toString(36).slice(2, 7);
    var f = el('label', { class: 'field', for: id }, '速度 <input id="' + id + '" type="range" min="' + min + '" max="' + max + '" step="2" value="' + value + '"><output>' + value + '</output> BPM');
    var input = $('input', f), out = $('output', f);
    input.addEventListener('input', function () { out.textContent = input.value; onInput(+input.value); });
    return f;
  }

  /* ---------- 換和弦練習 ---------- */
  $$('[data-switch-trainer]').forEach(function (root) {
    var prog = PROGRESSIONS[0], perChord = 4, bpm = 60, demo = true, startedAt = 0, changes = 0;
    root.innerHTML =
      '<div class="trainer-stage" aria-live="polite">' +
        '<div class="now"><span class="label">現在</span><b class="name">C</b><div class="fig"></div></div>' +
        '<div class="next"><span class="label">下一個</span><b class="name">G</b><div class="fig"></div></div>' +
        '<div class="count"><span class="label">拍</span><div class="beats" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="hint">按「開始」後先數一小節預備拍</p></div>' +
      '</div><div class="controls"></div>';
    var controls = $('.controls', root);
    var startBtn = el('button', { type: 'button', class: 'btn primary' }, '開始');
    controls.appendChild(startBtn);
    controls.appendChild(bpmField(40, 120, bpm, function (v) { bpm = v; m.bpm = v; }));
    controls.appendChild(el('span', { class: 'field' }, '和弦進行'));
    controls.lastChild.appendChild(seg(root, '和弦進行', PROGRESSIONS.map(function (p) { return [p.id, p.label]; }), prog.id, function (id) {
      prog = PROGRESSIONS.filter(function (p) { return p.id === id; })[0]; show(0, 0);
    }));
    controls.appendChild(el('span', { class: 'field' }, '每個和弦'));
    controls.lastChild.appendChild(seg(root, '每個和弦拍數', [[4, '4 拍'], [2, '2 拍']], 4, function (v) { perChord = v; }));
    var demoBtn = el('button', { type: 'button', class: 'btn small', 'aria-pressed': 'true' }, '示範撥弦');
    demoBtn.addEventListener('click', function () { demo = !demo; demoBtn.setAttribute('aria-pressed', String(demo)); });
    controls.appendChild(demoBtn);

    var nowName = $('.now .name', root), nextName = $('.next .name', root), nowFig = $('.now .fig', root), nextFig = $('.next .fig', root);
    var lights = $$('.beats i', root), hint = $('.hint', root);
    function show(i, beat) {
      var a = prog.seq[i % 4], b = prog.seq[(i + 1) % 4];
      if (nowName.textContent !== a || !nowFig.innerHTML) { nowName.textContent = a; nowFig.innerHTML = diagram(a); }
      if (nextName.textContent !== b || !nextFig.innerHTML) { nextName.textContent = b; nextFig.innerHTML = diagram(b, { noFingers: true }); }
      lights.forEach(function (l, n) { l.className = n === beat ? 'on' + (n === 0 ? ' down' : '') : ''; });
    }
    var m = new PS.audio.Metronome({
      bpm: bpm, beats: 4, steps: 1,
      onStep: function (step, time) {
        if (step < 4 || !demo) return;
        var k = step - 4;
        if (k % perChord === 0) PS.audio.strum(CHORDS[prog.seq[Math.floor(k / perChord) % 4]].frets, time, 'down', { volume: 0.12 });
      }
    });
    m.onVisual = function (step) {
      if (step < 4) { hint.textContent = '預備 ' + (4 - step); show(0, step); return; }
      var k = step - 4, idx = Math.floor(k / perChord);
      if (k % perChord === 0 && k > 0) changes++;
      hint.textContent = k % perChord === perChord - 1 ? '準備換到 ' + prog.seq[(idx + 1) % 4] : '';
      show(idx, k % 4);
    };
    function stop() {
      if (!m.running) return;
      m.stop();
      startBtn.textContent = '開始';
      lights.forEach(function (l) { l.className = ''; });
      var secs = Math.round((Date.now() - startedAt) / 1000);
      hint.textContent = '剛才練了 ' + secs + ' 秒、換了 ' + changes + ' 次和弦';
      if (secs >= 5) course.log(lesson, 'chord-switch', { progression: prog.label, bpm: m.bpm, beatsPerChord: perChord, seconds: secs, changes: changes });
    }
    startBtn.addEventListener('click', function () {
      if (m.running) return stop();
      claim(stop);
      changes = 0; startedAt = Date.now();
      if (m.start()) startBtn.textContent = '停止';
    });
    show(0, -1);
  });

  /* ---------- 刷奏型態（靜態格子） ---------- */
  function arrow(cell) {
    var ghost = cell === 'd' || cell === 'u', up = cell === 'U' || cell === 'u';
    return '<span class="arrow' + (ghost ? ' ghost' : '') + '" aria-label="' + (ghost ? '空刷' : up ? '上刷' : '下刷') + '">' + (up ? '↑' : '↓') + '</span>';
  }
  function grid(key) {
    var p = PATTERNS[key], s = '<div class="strum-grid" role="list">';
    p.cells.forEach(function (c, i) {
      s += '<div class="cell' + (i % 2 ? ' off' : '') + (c === 'u' || c === 'd' ? ' is-ghost' : '') + '" role="listitem">' + arrow(c) + '<span class="cnt">' + COUNTS[i] + '</span></div>';
    });
    return s + '</div>';
  }
  $$('[data-pattern-grid]').forEach(function (n) { n.innerHTML = grid(n.getAttribute('data-pattern-grid')); });

  /* ---------- 刷奏播放器 ---------- */
  $$('[data-strum-player]').forEach(function (root) {
    var key = 'A', bpm = 70, chordMode = 'prog', guitar = true, startedAt = 0, bars = 0;
    root.innerHTML = '<div class="player-stage"><div class="player-top"><b class="pname"></b><span class="pchord" aria-live="polite">C</span></div><div class="pgrid"></div><p class="pdesc"></p></div><div class="controls"></div>';
    var controls = $('.controls', root), pgrid = $('.pgrid', root), pchord = $('.pchord', root);
    function render() {
      $('.pname', root).textContent = PATTERNS[key].name;
      $('.pdesc', root).textContent = PATTERNS[key].desc;
      pgrid.innerHTML = grid(key);
    }
    var startBtn = el('button', { type: 'button', class: 'btn primary' }, '開始');
    controls.appendChild(startBtn);
    controls.appendChild(bpmField(50, 120, bpm, function (v) { bpm = v; m.bpm = v; }));
    controls.appendChild(el('span', { class: 'field' }, '刷法'));
    controls.lastChild.appendChild(seg(root, '刷法', [['A', '8 Beats'], ['B', '切分']], 'A', function (v) { key = v; render(); }));
    controls.appendChild(el('span', { class: 'field' }, '和弦'));
    controls.lastChild.appendChild(seg(root, '和弦', [['prog', 'C G Am F'], ['C', '只彈 C']], 'prog', function (v) { chordMode = v; }));
    var gBtn = el('button', { type: 'button', class: 'btn small', 'aria-pressed': 'true' }, '吉他示範');
    gBtn.addEventListener('click', function () { guitar = !guitar; gBtn.setAttribute('aria-pressed', String(guitar)); });
    controls.appendChild(gBtn);

    function chordAt(step) {
      if (chordMode === 'C') return 'C';
      return ['C', 'G', 'Am', 'F'][Math.floor(Math.max(0, step - 8) / 8) % 4];
    }
    var m = new PS.audio.Metronome({
      bpm: bpm, beats: 4, steps: 2, clickSub: false,
      onStep: function (step, time) {
        if (step < 8 || !guitar) return;
        var cell = PATTERNS[key].cells[step % 8];
        if (cell === 'D' || cell === 'U') {
          PS.audio.strum(CHORDS[chordAt(step)].frets, time, cell === 'D' ? 'down' : 'up', { volume: step % 2 ? 0.1 : 0.14, duration: 0.5 });
        }
      }
    });
    m.onVisual = function (step) {
      var cells = $$('.cell', pgrid);
      cells.forEach(function (c, i) { c.classList.toggle('now', step >= 8 && i === step % 8); });
      if (step < 8) { pchord.textContent = step % 2 ? '' : '預備 ' + (4 - step / 2); return; }
      if (step % 8 === 0) bars++;
      pchord.textContent = chordAt(step);
    };
    function stop() {
      if (!m.running) return;
      m.stop();
      startBtn.textContent = '開始';
      $$('.cell', pgrid).forEach(function (c) { c.classList.remove('now'); });
      pchord.textContent = chordAt(8);
      var secs = Math.round((Date.now() - startedAt) / 1000);
      if (secs >= 5) course.log(lesson, 'strum-play', { pattern: key, bpm: m.bpm, chords: chordMode, seconds: secs, bars: bars });
    }
    startBtn.addEventListener('click', function () {
      if (m.running) return stop();
      claim(stop);
      bars = 0; startedAt = Date.now();
      if (m.start()) startBtn.textContent = '停止';
    });
    render();
  });

  /* ---------- 錄音 ---------- */
  $$('[data-recorder]').forEach(function (root) {
    var max = +root.getAttribute('data-max') || 60;
    root.classList.add('recorder');
    if (!PS.audio.Recorder.supported() || !window.isSecureContext) {
      root.innerHTML = '<p class="note">這個瀏覽器無法在網頁上錄音，或網頁不是用 https 開啟。可以改用手機內建的錄音 App。</p>';
      return;
    }
    root.innerHTML = '<div class="row"><button type="button" class="btn primary rec">● 開始錄音</button><span class="status">最長 ' + max + ' 秒；錄音只留在這台裝置，不會上傳</span></div><div class="out"></div>';
    var btn = $('.rec', root), status = $('.status', root), out = $('.out', root), r = null, timer = null, url = null;
    function finish() {
      clearInterval(timer);
      r.stop().then(function (res) {
        btn.textContent = '● 重新錄音';
        status.classList.remove('live');
        if (!res) return;
        if (url) URL.revokeObjectURL(url);
        url = res.url;
        status.textContent = '錄好了，共 ' + res.seconds + ' 秒';
        var ext = /mp4/.test(res.type) ? 'm4a' : /ogg/.test(res.type) ? 'ogg' : 'webm';
        out.innerHTML = '<div class="row"><audio controls src="' + url + '"></audio><a class="btn small" download="guitar-lab-練習錄音.' + ext + '" href="' + url + '">下載</a></div>';
        course.log(lesson, 'recording', { seconds: res.seconds });
        r = null;
      });
    }
    btn.addEventListener('click', function () {
      if (r) return finish();
      r = new PS.audio.Recorder();
      r.start().then(function () {
        var t = 0;
        btn.textContent = '■ 停止';
        status.classList.add('live');
        status.textContent = '錄音中 0 秒';
        timer = setInterval(function () {
          t++; status.textContent = '錄音中 ' + t + ' 秒';
          if (t >= max) finish();
        }, 1000);
      }).catch(function () {
        r = null;
        status.textContent = '沒有取得麥克風權限。請在瀏覽器網址列允許麥克風後再試一次。';
      });
    });
  });

  /* ---------- 練習卡 ---------- */
  function progressOf(lessonId) {
    var items = CHECKLISTS[lessonId] || [], st = course.state(lessonId, 'checklist') || {};
    var done = items.filter(function (it) { return st[it[0]]; }).length;
    return { done: done, total: items.length };
  }
  PS.guitar.progressOf = progressOf;
  $$('[data-checklist]').forEach(function (root) {
    var id = root.getAttribute('data-checklist'), items = CHECKLISTS[id] || [], st = course.state(id, 'checklist') || {};
    var bar = $('[data-checklist-bar="' + id + '"]'), label = $('[data-checklist-label="' + id + '"]');
    root.innerHTML = items.map(function (it) {
      return '<li><label><input type="checkbox" value="' + it[0] + '"' + (st[it[0]] ? ' checked' : '') + '><span>' + it[1] + (it[2] ? '<small>' + it[2] + '</small>' : '') + '</span></label></li>';
    }).join('');
    function update() {
      var p = progressOf(id);
      if (bar) bar.style.width = (p.total ? p.done / p.total * 100 : 0) + '%';
      if (label) label.textContent = p.done + ' / ' + p.total;
    }
    root.addEventListener('change', function (e) {
      if (!e.target.matches('input')) return;
      st[e.target.value] = e.target.checked ? new Date().toISOString() : false;
      course.state(id, 'checklist', st);
      course.log(id, 'checklist', { item: e.target.value, done: e.target.checked });
      update();
    });
    update();
  });

  /* ---------- 首頁：12 章課綱、進度與紀錄 ---------- */
  $$('[data-chapters]').forEach(function (root) {
    var part = root.getAttribute('data-chapters');
    CHAPTERS.filter(function (c) { return c.part === part; }).forEach(function (c) {
      var id = 'ch' + (c.n < 10 ? '0' : '') + c.n, p = progressOf(id), ready = !!c.href;
      var status = !ready ? '製作中' : p.done ? '練習卡 ' + p.done + ' / ' + p.total : '可以開始';
      var inner =
        '<div class="ch-top"><span class="ch-num">' + (c.n < 10 ? '0' : '') + c.n + '</span><span class="tag' + (ready ? ' on' : '') + '">' + (ready ? '試教版' : '製作中') + '</span></div>' +
        '<h3>' + c.title + '</h3><p class="ch-en">' + c.en + '</p>' +
        '<ul class="ch-topics">' + c.topics.map(function (t) { return '<li>' + t + '</li>'; }).join('') + '</ul>' +
        (ready ? '<div class="progress" aria-hidden="true"><span style="width:' + (p.total ? p.done / p.total * 100 : 0) + '%"></span></div>' : '') +
        '<p class="ch-status">' + status + '・120 分鐘</p>';
      root.appendChild(ready ? el('a', { class: 'card chapter', href: c.href }, inner) : el('article', { class: 'card chapter muted' }, inner));
    });
  });
  $$('[data-agenda]').forEach(function (root) {
    root.innerHTML = AGENDA.map(function (a) {
      return '<li style="flex:' + a[1] + '"><b>' + a[1] + '</b><span>' + a[0] + '</span></li>';
    }).join('');
  });
  $$('[data-records-summary]').forEach(function (n) {
    var recs = course.records(), mins = 0;
    recs.forEach(function (r) { mins += (r.data && r.data.seconds) || 0; });
    n.innerHTML = '<b>' + recs.length + '</b> 筆紀錄・共練習 <b>' + Math.round(mins / 60) + '</b> 分鐘・梯次 <code>' + course.cohortId + '</code>';
  });
  $$('[data-export]').forEach(function (b) { b.addEventListener('click', function () { course.exportJSON(); }); });
})(window.PS);
