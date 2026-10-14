/* ===== Guitar Lab：課程資料、自製插圖、和弦圖、調音器與練習器 =====
 * 需先載入 ../assets/ps-audio.js。在投影片中以 data 屬性宣告，載入時自動建立：
 *   [data-gfig="anatomy|family-*|bodies|sizes|laminate|bracing|truss|tuning|posture|pick|hands"]
 *   [data-diagram="C"]  [data-chord-cards]  [data-switch-trainer]  [data-strum-player]  [data-tuner]
 * 練習結果經 PixelBackend（backend.js）記錄；沒有載入時略過。
 */
(function (PS) {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function slideNo(n) { var s = n && n.closest && n.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(n, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(n) }); }
  var guitarScript = $('script[src*="guitar.js"]');
  var GUITAR_IMAGE = guitarScript ? new URL('../assets/guitar/', guitarScript.src).href : '../assets/guitar/';

  /* ---------- 課程資料 ---------- */
  var CHORDS = {
    C:  { name: 'C',  zh: 'C 大三和弦', degree: 'I',  frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
          tip: '略過 6 弦。無名指按住 5 弦第 3 格，指尖立起，避開 4 弦。' },
    G:  { name: 'G',  zh: 'G 大三和弦', degree: 'V',  frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
          tip: '六條琴弦都彈奏。中指 6 弦、食指 5 弦、無名指 1 弦，手腕稍微放低。' },
    Am: { name: 'Am', zh: 'A 小三和弦', degree: 'vi', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
          tip: '和 C 只相差一根手指：無名指從 5 弦移到 3 弦，食指、中指保持原位。' },
    F:  { name: 'F',  zh: 'F 大三和弦（小 F）', degree: 'IV', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barre: { fret: 1, from: 4, to: 5 },
          tip: '只彈奏 4 到 1 弦。食指平壓 1、2 弦第 1 格。完整的封閉 F 留到第 8 章。' },
    Em: { name: 'Em', zh: 'E 小三和弦', degree: 'iii', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], tip: '' },
    open: { name: '空弦', zh: '六條空弦', degree: '', frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0], tip: '' }
  };
  /* 第五章起用到的和弦：c(名稱, 中文, 6→1 弦格數, 指法, 封閉) */
  function c(name, zh, frets, fingers, barre, tip) { CHORDS[name] = { name: name, zh: zh, degree: '', frets: frets, fingers: fingers, barre: barre, tip: tip || '' }; }
  c('D', 'D 大三和弦', [-1, -1, 0, 2, 3, 2], [0, 0, 0, 1, 3, 2], null, '只彈奏 4 到 1 弦，三根手指排成小三角形。');
  c('Dm', 'D 小三和弦', [-1, -1, 0, 2, 3, 1], [0, 0, 0, 2, 3, 1]);
  c('E', 'E 大三和弦', [0, 2, 2, 1, 0, 0], [0, 2, 3, 1, 0, 0], null, '六條琴弦都彈奏，形狀和 Am 相同，整組往 6 弦方向移動一條。');
  c('A', 'A 大三和弦', [-1, 0, 2, 2, 2, 0], [0, 0, 1, 2, 3, 0], null, '三根手指並排在第 2 格，讓 1 弦保持發聲。');
  c('Bm', 'B 小三和弦（封閉）', [-1, 2, 4, 4, 3, 2], [0, 1, 3, 4, 2, 1], { fret: 2, from: 1, to: 5 }, '食指封住第 2 格的 5 到 1 弦，略過 6 弦。');
  c('Fb', 'F 大三和弦（大封閉）', [1, 3, 3, 2, 1, 1], [1, 3, 4, 2, 1, 1], { fret: 1, from: 0, to: 5 }, '食指壓滿第 1 格的六條琴弦，形狀和 E 相同。');
  CHORDS.Fb.name = 'F';
  c('G7', 'G 屬七和弦', [3, 2, 0, 0, 0, 1], [3, 2, 0, 0, 0, 1]);
  c('C7', 'C 屬七和弦', [-1, 3, 2, 3, 1, 0], [0, 3, 2, 4, 1, 0]);
  c('E7', 'E 屬七和弦', [0, 2, 0, 1, 0, 0], [0, 2, 0, 1, 0, 0]);
  c('A7', 'A 屬七和弦', [-1, 0, 2, 0, 2, 0], [0, 0, 2, 0, 3, 0]);
  c('D7', 'D 屬七和弦', [-1, -1, 0, 2, 1, 2], [0, 0, 0, 2, 1, 3]);
  c('B7', 'B 屬七和弦', [-1, 2, 1, 2, 0, 2], [0, 2, 1, 3, 0, 4]);
  c('Cmaj7', 'C 大七和弦', [-1, 3, 2, 0, 0, 0], [0, 3, 2, 0, 0, 0]);
  c('Fmaj7', 'F 大七和弦', [-1, -1, 3, 2, 1, 0], [0, 0, 3, 2, 1, 0]);
  c('Am7', 'A 小七和弦', [-1, 0, 2, 0, 1, 0], [0, 0, 2, 0, 1, 0]);
  c('Dm7', 'D 小七和弦', [-1, -1, 0, 2, 1, 1], [0, 0, 0, 2, 1, 1], { fret: 1, from: 4, to: 5 });
  c('Em7', 'E 小七和弦', [0, 2, 0, 0, 0, 0], [0, 2, 0, 0, 0, 0]);
  c('Dsus4', 'D 掛四和弦', [-1, -1, 0, 2, 3, 3], [0, 0, 0, 1, 2, 3]);
  c('Dsus2', 'D 掛二和弦', [-1, -1, 0, 2, 3, 0], [0, 0, 0, 1, 3, 0]);
  c('Asus4', 'A 掛四和弦', [-1, 0, 2, 2, 3, 0], [0, 0, 1, 2, 3, 0]);
  c('Asus2', 'A 掛二和弦', [-1, 0, 2, 2, 0, 0], [0, 0, 1, 2, 0, 0]);
  c('C/G', 'C 和弦，低音 G', [3, 3, 2, 0, 1, 0], [3, 4, 2, 0, 1, 0]);
  c('C/E', 'C 和弦，低音 E', [0, 3, 2, 0, 1, 0], [0, 3, 2, 0, 1, 0]);
  c('G/B', 'G 和弦，低音 B', [-1, 2, 0, 0, 0, 3], [0, 1, 0, 0, 0, 3]);
  c('Am/G', 'Am 和弦，低音 G', [3, 0, 2, 2, 1, 0], [4, 0, 2, 3, 1, 0]);
  c('D/F#', 'D 和弦，低音 F#', [2, -1, 0, 2, 3, 2], [1, 0, 0, 2, 4, 3]);
  c('Em/D', 'Em 和弦，低音 D', [-1, -1, 0, 0, 0, 0], [0, 0, 0, 0, 0, 0]);
  c('Caug', 'C 增三和弦', [-1, 3, 2, 1, 1, 0], [0, 4, 3, 1, 2, 0]);
  c('Bdim', 'B 減三和弦', [-1, 2, 3, 4, 3, -1], [0, 1, 2, 4, 3, 0]);
  // 低音：該和弦最低的一條要彈的弦（蹦）；交替低音：再往上一條（洽之前的第二個蹦）
  Object.keys(CHORDS).forEach(function (k) { var f = CHORDS[k].frets, i = 0; while (f[i] < 0) i++; CHORDS[k].root = i; });
  function bassOnly(k, alt) { var f = CHORDS[k].frets, r = CHORDS[k].root + (alt ? 1 : 0), out = [-1, -1, -1, -1, -1, -1]; if (f[r] >= 0) out[r] = f[r]; return out; }
  function highOnly(k) { var f = CHORDS[k].frets, r = CHORDS[k].root; return f.map(function (x, i) { return i > r + 1 ? x : -1; }); }
  var PROGRESSIONS = [
    { id: 'pop', label: 'C → G → Am → F', seq: ['C', 'G', 'Am', 'F'] },
    { id: 'fifties', label: 'C → Am → F → G', seq: ['C', 'Am', 'F', 'G'] },
    { id: 'minor', label: 'Am → F → C → G', seq: ['Am', 'F', 'C', 'G'] }
  ];
  /* 每拍兩格；D 下刷、U 上刷、d／u 空刷（手照常擺動但不碰弦） */
  var PATTERNS = {
    Q: { name: '四分音符 下刷', cells: ['D', 'u', 'D', 'u', 'D', 'u', 'D', 'u'], desc: '每一拍往下刷奏一次，手在半拍時回到上方準備。' },
    A: { name: '八分音符 8 Beats', cells: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'], desc: '拍點往下、半拍往上，八下平均。' },
    B: { name: '切分 Folk Rock', cells: ['D', 'u', 'D', 'U', 'd', 'U', 'D', 'U'], desc: '第 3 拍的下刷保持懸空，重音因此往前移動。口訣：下、下上、上下上。' },
    S: { name: '十六分音符 16 Beats', cells: ['D', 'u', 'D', 'U', 'd', 'U', 'D', 'U', 'D', 'u', 'D', 'U', 'd', 'U', 'D', 'U'], desc: '每拍分成四格，手的擺動加倍。正拍保留下刷，反拍加入上刷，律動更細緻，也更有推進感。' },
    P: { name: '蹦洽拉 Bass & Strum', cells: ['X', 'u', 'D', 'U', 'Y', 'u', 'D', 'U'], desc: '第 1、3 拍彈奏低音（蹦），第 2、4 拍刷奏高音弦（洽拉）。第二個低音換到隔壁琴弦，伴奏就開始行進。' },
    W: { name: '華爾滋 3/4 蹦洽洽', beats: 3, cells: ['X', 'u', 'D', 'u', 'D', 'u'], desc: '強、弱、弱：第 1 拍彈奏低音，第 2、3 拍刷奏高音弦。圓舞曲與許多慢歌都使用這種伴奏。' },
    W2: { name: '3/4 蹦洽拉洽拉', beats: 3, cells: ['X', 'u', 'D', 'U', 'D', 'U'], desc: '在華爾滋的「洽」後面加上上刷，三拍子也能帶有流動感。' },
    E6: { name: '6/8 搖擺', beats: 2, cells: ['X', 'D', 'U', 'Y', 'D', 'U'], desc: '一小節 6 個八分音符，分成兩大拍：蹦洽拉、蹦洽拉，如同搖籃輕輕搖晃。' },
    K: { name: '切音 Chuck', cells: ['D', 'U', 'M', 'U', 'D', 'U', 'M', 'U'], desc: '第 2、4 拍以右手掌側邊或手指「拍」在琴弦上，發出如同小鼓的「恰」。左手同時放鬆，讓琴弦悶住。' },
    T12: { name: '12/8 慢板', beats: 4, cells: ['X', 'D', 'U', 'Y', 'D', 'U', 'X', 'D', 'U', 'Y', 'D', 'U'], desc: '每一拍裡有三個八分音符。藍調與老式情歌經常使用，速度緩慢、情緒深沉。' }
  };
  var SHORT = { Q: '四分', A: '8 Beats', B: '切分', S: '16 Beats', P: '蹦洽拉', W: '華爾滋', W2: '蹦洽拉洽拉', E6: '6/8', T12: '12/8', K: '切音' };
  function beatsOf(k) { return PATTERNS[k].beats || 4; }
  function counts(n, beats) {
    var per = n / beats, sub = { 1: [''], 2: ['&'], 3: ['&', 'a'], 4: ['e', '&', 'a'] }[per] || [], out = [];
    for (var b = 1; b <= beats; b++) { out.push(String(b)); sub.forEach(function (x) { out.push(x); }); }
    return out;
  }
  var OPEN = [{ n: 'E', o: 2, f: 82.41 }, { n: 'A', o: 2, f: 110 }, { n: 'D', o: 3, f: 146.83 }, { n: 'G', o: 3, f: 196 }, { n: 'B', o: 3, f: 246.94 }, { n: 'E', o: 4, f: 329.63 }];
  PS.guitar = { CHORDS: CHORDS, PATTERNS: PATTERNS };

  /* ---------- 五線譜：音符時值與音高（六線譜、刷法格、節奏遊戲共用） ----------
   * 時值以十六分音符為 1：16 全音符、8 二分、4 四分、2 八分、1 十六分，3／6／12 為附點。
   * 事件 { t, len, rest, heads: [{ pos, acc, shape }], tech }；pos 以五線譜最下線 E4 為 0，每升一個音級加 1。
   * 不在拍點上開始的音，切到下一拍為止並用延音線連接；同一拍內的八分、十六分音符以符槓相連。
   */
  var LENS = [16, 12, 8, 6, 4, 3, 2, 1];
  function splitDur(t, len, beat) {
    var out = [];
    while (len > 0) {
      var off = t % beat, room = off ? Math.min(len, beat - off) : len, v = 1;
      for (var k = 0; k < LENS.length; k++) if (LENS[k] <= room) { v = LENS[k]; break; }
      out.push({ t: t, len: v }); t += v; len -= v;
    }
    return out;
  }
  function SY(p) { return (8 - p) * 5; } // 最上線 y = 0，線距 10
  function restGlyph(len, x) {
    var base = { 12: 8, 6: 4, 3: 2 }[len] || len, dot = base !== len, s;
    if (base === 16) s = '<rect x="' + (x - 7) + '" y="' + SY(6) + '" width="14" height="5" class="nfill"/>';
    else if (base === 8) s = '<rect x="' + (x - 7) + '" y="' + (SY(4) - 5) + '" width="14" height="5" class="nfill"/>';
    else if (base === 4) s = '<path transform="translate(' + x + ' ' + (SY(4) - 2) + ') scale(.62)" d="M-4 -24 L6 -12 L-3 -2 L6 10 Q-8 4 -2 18" class="nrest"/>';
    else if (base === 2) s = '<g transform="translate(' + x + ' ' + SY(4) + ') scale(.62)"><circle cx="-5" cy="-8" r="4.5" class="nfill"/><path d="M-5 -4 Q4 -2 8 -10 L-2 20" class="nrest"/></g>';
    else s = '<g transform="translate(' + x + ' ' + SY(4) + ') scale(.62)"><circle cx="-3" cy="-16" r="4" class="nfill"/><circle cx="-7" cy="-2" r="4" class="nfill"/><path d="M-3 -12 Q6 -10 10 -18 L-2 22 M-7 2 Q2 4 6 -4" class="nrest"/></g>';
    return s + (dot ? '<circle cx="' + (x + 11) + '" cy="' + (SY(5)) + '" r="2.2" class="nfill"/>' : '');
  }
  function headGlyph(x, y, shape, open) {
    if (shape === 'x') return '<path d="M' + (x - 5.5) + ' ' + (y - 5.5) + 'l11 11M' + (x + 5.5) + ' ' + (y - 5.5) + 'l-11 11" class="nstem" style="stroke-width:2.4"/>';
    if (shape === 'd') return '<path d="M' + (x - 7) + ' ' + y + 'L' + x + ' ' + (y - 6) + 'L' + (x + 7) + ' ' + y + 'L' + x + ' ' + (y + 6) + 'Z" class="nopen" style="stroke-width:1.8"/>';
    return '<ellipse cx="' + x + '" cy="' + y + '" rx="6.8" ry="4.9" transform="rotate(-20 ' + x + ' ' + y + ')" class="' + (open ? 'nopen' : 'nfill') + '"/>';
  }
  function notation(events, o) {
    var segs = [], s = '', top = 0, bot = 40, beat = o.beat || 4;
    function ext(y) { if (y < top) top = y; if (y > bot) bot = y; }
    events.forEach(function (ev, k) {
      splitDur(ev.t, ev.len, beat).forEach(function (pc, j, arr) { segs.push({ ev: ev, k: k, t: pc.t, len: pc.len, first: j === 0, tie: !ev.rest && j < arr.length - 1 }); });
    });
    function dirOf(list) {
      if (o.up) return 1;
      var sum = 0, n = 0; list.forEach(function (sg) { sg.ev.heads.forEach(function (h) { sum += h.pos; n++; }); });
      return n && sum / n >= 4 ? -1 : 1;
    }
    // 符槓分組：同一拍、連續、八分或更短的音
    var groups = [], cur = null;
    segs.forEach(function (sg) {
      var flag = !sg.ev.rest && sg.len < 4, b = Math.floor(sg.t / beat);
      if (flag && cur && cur.b === b && cur.end === sg.t) { cur.list.push(sg); cur.end = sg.t + sg.len; }
      else { cur = flag ? { b: b, list: [sg], end: sg.t + sg.len } : null; if (cur) groups.push(cur); }
      sg.group = cur;
    });
    groups.forEach(function (g) {
      if (g.list.length < 2) { g.list.forEach(function (sg) { sg.group = null; }); return; }
      g.dir = dirOf(g.list);
      var ys = []; g.list.forEach(function (sg) { sg.ev.heads.forEach(function (h) { ys.push(SY(h.pos)); }); });
      g.y = g.dir > 0 ? Math.min.apply(null, ys) - 32 : Math.max.apply(null, ys) + 32;
    });
    segs.forEach(function (sg) {
      var s0 = s.length;
      drawSeg(sg);
      if (sg.ev.id != null) s = s.slice(0, s0) + '<g data-nev="' + sg.ev.id + '">' + s.slice(s0) + '</g>';
    });
    function drawSeg(sg) {
      var x = o.x(sg.t);
      if (sg.ev.rest) { s += restGlyph(sg.len, x); return; }
      var heads = sg.ev.heads.slice().sort(function (a, b) { return a.pos - b.pos; }), dir = sg.group ? sg.group.dir : dirOf([sg]);
      var open = sg.len >= 8, prev = null, accN = 0;
      heads.forEach(function (h) {
        var hx = x;
        if (prev && h.pos - prev.pos === 1 && !prev.shift) { hx = x + (dir > 0 ? 13 : -13); h.shift = true; } else h.shift = false;
        var y = SY(h.pos);
        for (var p = -2; p >= h.pos; p -= 2) s += '<line x1="' + (hx - 11) + '" x2="' + (hx + 11) + '" y1="' + SY(p) + '" y2="' + SY(p) + '" class="nline"/>';
        for (p = 10; p <= h.pos; p += 2) s += '<line x1="' + (hx - 11) + '" x2="' + (hx + 11) + '" y1="' + SY(p) + '" y2="' + SY(p) + '" class="nline"/>';
        s += headGlyph(hx, y, h.shape, open);
        if (sg.first && h.acc) { s += '<text x="' + (x - 15 - accN * 9) + '" y="' + (y + 5) + '" class="nacc">' + h.acc + '</text>'; accN++; }
        if (sg.len === 3 || sg.len === 6 || sg.len === 12) s += '<circle cx="' + (hx + 12) + '" cy="' + (h.pos % 2 ? y : y - 5) + '" r="2.2" class="nfill"/>';
        ext(y - 7); ext(y + 7); prev = h;
      });
      sg.lo = SY(heads[0].pos); sg.hi = SY(heads[heads.length - 1].pos);
      if (sg.len < 16) {
        var sx = x + (dir > 0 ? 6.3 : -6.3), y1 = dir > 0 ? sg.lo - 1 : sg.hi + 1;
        var y2 = sg.group ? sg.group.y : dir > 0 ? sg.hi - 32 : sg.lo + 32;
        s += '<line x1="' + sx + '" x2="' + sx + '" y1="' + y1 + '" y2="' + y2 + '" class="nstem"/>';
        sg.sx = sx; ext(y2);
        if (!sg.group && sg.len < 4) for (var f = 0; f < (sg.len === 1 ? 2 : 1); f++) {
          var fy = y2 + dir * f * 8;
          s += '<path d="M' + sx + ' ' + fy + 'q2 ' + (dir * 10) + ' 10 ' + (dir * 14) + 'q4 ' + (dir * 4) + ' 2 ' + (dir * 13) + '" class="nflag"/>';
        }
      }
      if (sg.tie) {
        var nx = o.x(sg.t + sg.len);
        heads.forEach(function (h) { var y = SY(h.pos) + (dir > 0 ? 7 : -7), c = y + (dir > 0 ? 8 : -8); s += '<path d="M' + (x + 5) + ' ' + y + 'Q' + ((x + nx) / 2) + ' ' + c + ' ' + (nx - 5) + ' ' + y + '" class="ntie"/>'; ext(c); });
      }
      // 演奏技巧：搥勾弦畫圓滑線、滑弦畫斜線、推弦與揉音加文字
      var tech = sg.first && sg.ev.tech, pv = tech && segs.filter(function (z) { return z.k === sg.k - 1 && !z.ev.rest; })[0];
      if (tech && (tech === 'h' || tech === 'p') && pv) {
        var px = o.x(pv.t), yy = Math.max(sg.lo, pv.lo) + 10;
        s += '<path d="M' + (px + 2) + ' ' + yy + 'Q' + ((px + x) / 2) + ' ' + (yy + 12) + ' ' + (x - 2) + ' ' + yy + '" class="ntie"/>'; ext(yy + 12);
      } else if (tech === 's' && pv) s += '<line x1="' + (o.x(pv.t) + 9) + '" y1="' + pv.lo + '" x2="' + (x - 9) + '" y2="' + sg.lo + '" class="nstem"/>';
      else if (tech === 'b' || tech === 'v') { var ty = Math.min(sg.hi - 14, -10); s += '<text x="' + x + '" y="' + ty + '" class="ntext">' + (tech === 'b' ? 'full ↗' : '∿∿∿') + '</text>'; ext(ty - 12); }
    }
    groups.forEach(function (g) {
      if (!g.list[0].group) return;
      var L = g.list, x1 = L[0].sx, x2 = L[L.length - 1].sx;
      s += '<line x1="' + (x1 - 0.8) + '" x2="' + (x2 + 0.8) + '" y1="' + (g.y + g.dir * 2.5) + '" y2="' + (g.y + g.dir * 2.5) + '" class="nbeam2"/>';
      L.forEach(function (sg, i) {
        if (sg.len !== 1) return;
        var y = g.y + g.dir * 10.5, nb = L[i + 1], pb = L[i - 1];
        if (nb && nb.len === 1) s += '<line x1="' + sg.sx + '" x2="' + nb.sx + '" y1="' + y + '" y2="' + y + '" class="nbeam2"/>';
        else if (!(pb && pb.len === 1)) { var d = nb ? 10 : -10; s += '<line x1="' + sg.sx + '" x2="' + (sg.sx + d) + '" y1="' + y + '" y2="' + y + '" class="nbeam2"/>'; }
      });
    });
    return { svg: s, top: top, bot: bot };
  }
  function staffLines(x1, x2) { var s = ''; for (var l = 0; l < 5; l++) s += '<line x1="' + x1 + '" x2="' + x2 + '" y1="' + (l * 10) + '" y2="' + (l * 10) + '" class="nline"/>'; return s; }
  // 吉他譜用高音譜號（下方加 8：實際聲音低八度）
  function clef(x) { return '<text x="' + x + '" y="' + SY(-1.6) + '" class="nclef">𝄞</text><text x="' + (x + 12) + '" y="' + SY(-5) + '" class="nclef8">8</text>'; }
  function timeSig(x, a, b) { return '<text x="' + x + '" y="' + (SY(6) + 1) + '" class="ntime">' + a + '</text><text x="' + x + '" y="' + (SY(2) + 1) + '" class="ntime">' + b + '</text>'; }
  // 弦與格 → 五線譜位置與臨時記號（以升記號拼寫；同一小節內記住已出現的升記號）
  var OPEN_MIDI = [64, 59, 55, 50, 45, 40], LETTER = [0, 0, 1, 1, 2, 3, 3, 4, 4, 5, 5, 6], SHARP = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
  function pitchHead(s, f, shape, memo) {
    var w = OPEN_MIDI[s - 1] + f + 12, d = (Math.floor(w / 12) - 1) * 7 + LETTER[w % 12], sharp = SHARP[w % 12], acc = '';
    if (sharp && memo[d] !== 1) { acc = '♯'; memo[d] = 1; } else if (!sharp && memo[d] === 1) { acc = '♮'; memo[d] = 0; }
    return { pos: d - 30, acc: acc, shape: shape };
  }
  // 刷法的完整譜例：上方五線譜（以實際和弦音記譜，顯示音符長短）＋下方六線譜，與刷法格逐格對齊
  // 下刷彈整個和弦；上刷只擦過 1–4 弦；有低音（蹦）的刷法，低音彈根音、洽拉只刷高音 3 條弦；切音記成叉形符頭與 x
  function strumNotes(c, chord, bass) {
    var f = c === 'X' || c === 'Y' ? bassOnly(chord, c === 'Y') : bass && (c === 'D' || c === 'U') ? highOnly(chord) : CHORDS[chord].frets, out = [];
    f.forEach(function (x, i) { if (x >= 0 && !(c === 'U' && !bass && i < 2)) out.push({ s: 6 - i, f: x }); });
    return out;
  }
  var METER = { W: [3, 4], W2: [3, 4], E6: [6, 8], T12: [12, 8] };
  function patternSVG(key, chord, VW, G) {
    VW = VW || 860; G = G || 58; chord = CHORDS[chord] ? chord : 'C';
    var P = PATTERNS[key], cells = P.cells, n = cells.length, beats = beatsOf(key), per = n / beats, c16 = per === 4 ? 1 : 2, U = (VW - G) / n, evs = [], hits = [], memo = {};
    var bass = cells.some(function (x) { return x === 'X' || x === 'Y'; }), TS = 13;
    cells.forEach(function (c, i) { if (c !== 'd' && c !== 'u') hits.push(i); });
    if (hits[0] > 0) evs.push({ t: 0, len: hits[0] * c16, rest: true, heads: [] });
    hits.forEach(function (i, k) {
      var c = cells[i], end = k + 1 < hits.length ? hits[k + 1] : n, notes = strumNotes(c, chord, bass);
      evs.push({ t: i * c16, len: (end - i) * c16, c: c, notes: notes, heads: notes.map(function (nt) { return pitchHead(nt.s, nt.f, c === 'M' ? 'x' : '', memo); }) });
    });
    var xOf = function (t) { return G + (t / c16 + 0.5) * U; }, ms = METER[key] || [4, 4];
    var r = notation(evs, { x: xOf, beat: per === 3 ? 6 : 4, up: true });
    var top = Math.min(r.top, -14) - 8, y0 = Math.max(r.bot, 46) + 14, s = '';
    s += '<text x="' + (G + 2) + '" y="' + (top + 14) + '" class="nchord">' + CHORDS[chord].name + '</text>';
    s += clef(0) + timeSig(G - 13, ms[0], ms[1]) + '<text x="4" y="' + (y0 + 17) + '" class="tabl">T</text><text x="4" y="' + (y0 + 35) + '" class="tabl">A</text><text x="4" y="' + (y0 + 53) + '" class="tabl">B</text>';
    s += staffLines(0, VW) + '<line x1="' + (VW - 1) + '" x2="' + (VW - 1) + '" y1="0" y2="40" class="nline nbar"/>' + r.svg;
    for (var l = 0; l < 6; l++) s += '<line x1="' + (G - 30) + '" x2="' + VW + '" y1="' + (y0 + l * TS) + '" y2="' + (y0 + l * TS) + '" class="tline"/>';
    s += '<line x1="' + (VW - 1) + '" x2="' + (VW - 1) + '" y1="' + y0 + '" y2="' + (y0 + 5 * TS) + '" class="tbar"/>';
    evs.forEach(function (e) {
      if (e.rest) return;
      var x = xOf(e.t);
      e.notes.forEach(function (nt) {
        var y = y0 + (nt.s - 1) * TS;
        s += '<rect x="' + (x - 9) + '" y="' + (y - 7) + '" width="18" height="14" rx="3" class="tbg"/><text x="' + x + '" y="' + (y + 4.5) + '" class="tnum">' + (e.c === 'M' ? 'x' : nt.f) + '</text>';
      });
    });
    var h = y0 + 5 * TS + 8 - top;
    return '<svg class="gfig notes tab rnote" viewBox="0 ' + top + ' ' + VW + ' ' + h + '" role="img" aria-label="' + P.name + '（' + CHORDS[chord].name + ' 和弦）的五線譜與六線譜">' + s + '</svg>';
  }
  var GUT = 58; // 左側放譜號與拍號的寬度（px），下方刷法格同樣內縮
  // 依實際寬度繪製（隱藏中的投影片寬度為 0，等切換到該張時再畫）；s 為每單位像素數
  function paintRhythm(slot, sc) {
    var cw = slot.clientWidth; if (!cw) return false;
    sc = sc || 1; if (slot._sc === sc && slot._cw === cw) return true;
    slot._sc = sc; slot._cw = cw; slot.innerHTML = patternSVG(slot.getAttribute('data-k'), slot.getAttribute('data-c'), Math.round(cw / sc), Math.round(GUT / sc));
    return true;
  }

  /* ---------- 共用：吉他剪影 ---------- */
  // 依參數畫出琴身外型（中心 cx、頂端 y0、長 L、上寬 uw、腰寬 ww、下寬 lw、腰位 wp）
  function bodyPath(cx, y0, L, uw, ww, lw, wp) {
    var u = uw / 2, w = ww / 2, l = lw / 2, wy = y0 + L * (wp || 0.42);
    var L1 = function (s) {
      return 'C' + (cx + s * u * 0.62) + ',' + y0 + ' ' + (cx + s * u) + ',' + (y0 + L * 0.06) + ' ' + (cx + s * u) + ',' + (y0 + L * 0.2) +
        ' C' + (cx + s * u) + ',' + (y0 + L * 0.3) + ' ' + (cx + s * w) + ',' + (wy - L * 0.07) + ' ' + (cx + s * w) + ',' + wy +
        ' C' + (cx + s * w) + ',' + (wy + L * 0.08) + ' ' + (cx + s * l) + ',' + (y0 + L * 0.56) + ' ' + (cx + s * l) + ',' + (y0 + L * 0.72) +
        ' C' + (cx + s * l) + ',' + (y0 + L * 0.93) + ' ' + (cx + s * l * 0.5) + ',' + (y0 + L) + ' ' + cx + ',' + (y0 + L);
    };
    // 左半邊順時針到底部，再沿右半邊回到頂端
    return 'M' + cx + ',' + y0 + ' ' + L1(-1) + ' ' + reverseHalf(cx, y0, L, u, w, l, wy) + ' Z';
  }
  function reverseHalf(cx, y0, L, u, w, l, wy) {
    return 'C' + (cx + l * 0.5) + ',' + (y0 + L) + ' ' + (cx + l) + ',' + (y0 + L * 0.93) + ' ' + (cx + l) + ',' + (y0 + L * 0.72) +
      ' C' + (cx + l) + ',' + (y0 + L * 0.56) + ' ' + (cx + w) + ',' + (wy + L * 0.08) + ' ' + (cx + w) + ',' + wy +
      ' C' + (cx + w) + ',' + (wy - L * 0.07) + ' ' + (cx + u) + ',' + (y0 + L * 0.3) + ' ' + (cx + u) + ',' + (y0 + L * 0.2) +
      ' C' + (cx + u) + ',' + (y0 + L * 0.06) + ' ' + (cx + u * 0.62) + ',' + y0 + ' ' + cx + ',' + y0;
  }
  // 小型吉他插圖（家族卡、尺寸圖用），viewBox 0 0 100 160
  var miniGuitarCount = 0;
  function miniGuitar(o) {
    o = o || {};
    var woodId = 'mini-wood-' + (++miniGuitarCount);
    var s = '<svg class="gfig" viewBox="0 0 100 160" aria-hidden="true"><defs><linearGradient id="' + woodId + '" x1="0" x2="1" y1="0" y2="1"><stop stop-color="#f0d6a4"/><stop offset=".48" stop-color="#c99554"/><stop offset="1" stop-color="#8e5934"/></linearGradient></defs>';
    var top = o.bodyTop || 62, L = o.bodyLen || 92, neckW = o.neckW || 9;
    // 琴頭
    if (o.head === 'slot') s += '<rect x="42" y="4" width="16" height="22" rx="2" class="wood2"/><rect x="45.5" y="8" width="2.6" height="14" class="hole"/><rect x="51.9" y="8" width="2.6" height="14" class="hole"/>';
    else if (o.head === 'strat') s += '<path d="M46 4 C58 2 62 8 58 14 L56 28 L45 28 Z" class="' + (o.headCls || 'wood3') + '"/>';
    else s += '<path d="M43 4 H57 L56 27 H44 Z" class="dark"/>';
    for (var i = 0; i < 3; i++) if (o.head !== 'strat') s += '<circle cx="40" cy="' + (9 + i * 6) + '" r="2" class="metal"/><circle cx="60" cy="' + (9 + i * 6) + '" r="2" class="metal"/>';
    // 琴頸與指板
    s += '<rect x="' + (50 - neckW / 2) + '" y="26" width="' + neckW + '" height="' + (top - 22) + '" class="dark"/>';
    // 琴身
    if (o.kind === 'electric') {
      s += '<path d="M50 58 C40 56 33 50 28 54 C24 58 30 66 30 74 C30 84 18 92 18 112 C18 136 34 150 50 150 C66 150 82 136 82 112 C82 94 70 86 70 76 C70 66 78 58 74 54 C70 50 60 56 50 58 Z" class="' + (o.color || 'acc') + '"/>' +
        '<path d="M38 70 C44 74 56 74 62 70 L64 120 C56 126 44 126 36 120 Z" class="bone" opacity=".9"/>' +
        '<rect x="40" y="84" width="20" height="4" rx="2" class="dark"/><rect x="40" y="98" width="20" height="4" rx="2" class="dark"/><rect x="40" y="112" width="20" height="4" rx="2" class="dark"/>' +
        '<rect x="42" y="132" width="16" height="4" class="metal"/>';
    } else if (o.kind === 'banjo') {
      s += '<circle cx="50" cy="114" r="34" class="metal"/><circle cx="50" cy="114" r="29" class="bone"/><rect x="40" y="126" width="20" height="3" class="wood2"/>';
    } else if (o.kind === 'mandolin') {
      s += '<path d="M50 76 C30 76 22 100 26 120 C30 140 42 150 50 150 C58 150 70 140 74 120 C78 100 70 76 50 76 Z" class="wood"/><path d="M42 104 h16 l-2 6 h-12 Z" class="hole"/>';
    } else if (o.kind === 'lap') {
      s = '<svg class="gfig" viewBox="0 0 100 160" aria-hidden="true"><rect x="36" y="8" width="28" height="146" rx="6" class="' + (o.color || 'wood2') + '"/><rect x="40" y="30" width="20" height="96" class="dark"/>' +
        [0, 1, 2, 3, 4, 5].map(function (k) { return '<line x1="' + (42 + k * 3.2) + '" x2="' + (42 + k * 3.2) + '" y1="12" y2="146" stroke="#ddd" stroke-width=".6"/>'; }).join('') +
        '<rect x="38" y="128" width="24" height="10" class="metal"/><rect x="30" y="70" width="40" height="7" rx="3.5" class="metal" transform="rotate(-8 50 73)"/>';
      return s + '</svg>';
    } else {
      s += '<path d="' + bodyPath(50, top, L, o.uw || 48, o.ww || 36, o.lw || 62, o.wp) + '" class="' + (o.color || 'wood') + '" style="' + (o.color && o.color !== 'wood' && o.color !== 'wood2' && o.color !== 'wood3' ? '' : 'fill:url(#' + woodId + ')') + '" stroke="#efe8d6" stroke-width="1.6"/>';
      var holeY = top + L * 0.36;
      s += '<circle cx="50" cy="' + holeY + '" r="' + ((o.hole || 9) + 3) + '" fill="none" stroke="#e2c48f" stroke-width="1.1"/><circle cx="50" cy="' + holeY + '" r="' + (o.hole || 9) + '" class="hole"/>';
      s += '<path d="M30 ' + (top + L * .18) + ' C40 ' + (top + L * .15) + ' 60 ' + (top + L * .21) + ' 70 ' + (top + L * .18) + ' M30 ' + (top + L * .25) + ' C42 ' + (top + L * .22) + ' 60 ' + (top + L * .28) + ' 70 ' + (top + L * .25) + '" fill="none" stroke="#f5d8a3" stroke-width=".6" opacity=".55"/>';
      if (o.pickguard) s += '<path d="M58 ' + (top + L * 0.4) + ' C66 ' + (top + L * 0.42) + ' 70 ' + (top + L * 0.56) + ' 62 ' + (top + L * 0.6) + ' C58 ' + (top + L * 0.62) + ' 56 ' + (top + L * 0.52) + ' 58 ' + (top + L * 0.4) + ' Z" class="' + (o.pickguard === 'clear' ? 'bone' : 'dark') + '" opacity="' + (o.pickguard === 'clear' ? '.35' : '1') + '"/>';
      s += '<rect x="38" y="' + (top + L * 0.69) + '" width="24" height="7" rx="2" class="dark"/><rect x="40" y="' + (top + L * 0.69 - 1) + '" width="20" height="1.5" rx=".7" class="bone"/>';
      for (var f = 1; f <= 7; f++) { var fy = 26 + (top - 28) * (1 - Math.pow(2, -f / 12)); s += '<line x1="' + (50 - neckW / 2) + '" x2="' + (50 + neckW / 2) + '" y1="' + fy + '" y2="' + fy + '" stroke="#aeb1ae" stroke-width=".65"/>'; }
    }
    // 弦
    var n = o.strings || 6, x0 = 50 - (neckW / 2 - 1.5), dx = (neckW - 3) / (n - 1), end = o.kind === 'electric' ? 134 : o.kind === 'banjo' ? 128 : o.kind === 'mandolin' ? 136 : top + L * 0.72;
    for (var k = 0; k < n; k++) s += '<line x1="' + (x0 + k * dx) + '" x2="' + (x0 + k * dx) + '" y1="26" y2="' + end + '" stroke="#e8e4da" stroke-width=".5"/>';
    return s + '</svg>';
  }
  var FAMILY = {
    classical: { head: 'slot', uw: 46, ww: 34, lw: 58, color: 'wood3' },
    flamenco: { head: 'slot', uw: 46, ww: 34, lw: 58, color: 'wood3', pickguard: 'clear' },
    folk: { uw: 52, ww: 42, lw: 66, pickguard: true, color: 'wood3' },
    electric: { kind: 'electric', head: 'strat', color: 'acc' },
    steel: { kind: 'lap' },
    ukulele: { bodyTop: 84, bodyLen: 66, uw: 34, ww: 26, lw: 44, strings: 4, hole: 6, neckW: 7 },
    banjo: { kind: 'banjo', strings: 5 },
    mandolin: { kind: 'mandolin', strings: 8, neckW: 7 }
  };

  /* ---------- 吉他構造圖 ---------- */
  var PARTS = [
    { id: 'head', zh: '琴頭', en: 'Headstock', x: 150, y: 52, d: '固定旋鈕的位置，品牌標誌通常位於此處。' },
    { id: 'tuner', zh: '旋鈕', en: 'Tuning Machines', x: 98, y: 58, d: '固定琴弦，以轉緊、轉鬆的方式調音。品質良好的旋鈕齒輪精密、不易走音，常見全封閉（油壓）式與開放式。' },
    { id: 'nut', zh: '上弦枕', en: 'Nut', x: 196, y: 112, t: [172, 112], d: '固定六條琴弦的間距。材質越堅硬，振動損耗越少，常見牛骨、塑膠、Tusq。' },
    { id: 'board', zh: '指板', en: 'Fretboard', x: 98, y: 214, t: [136, 214], d: '左手按弦的接觸面，常用玫瑰木、黑檀木或楓木。木材越堅硬，越耐磨損。' },
    { id: 'fret', zh: '琴衍（琴格）', en: 'Frets', x: 196, y: 168, t: [168, 168], d: '指板上的金屬條。按在兩條琴衍之間，弦長就固定在前一條琴衍，發出穩定的音高。' },
    { id: 'inlay', zh: '指板記號', en: 'Position Markers', x: 98, y: 290, t: [150, 290], d: '標示在第 3、5、7、9、12 格，方便快速找到位置；第 12 格有兩個圓點，正好是空弦的高八度。' },
    { id: 'neck', zh: '琴頸', en: 'Neck', x: 196, y: 262, t: [172, 262], d: '連接琴頭與琴身，內部藏著調整彎度的鋼筋（Truss Rod）。' },
    { id: 'top', zh: '面板', en: 'Top', x: 64, y: 590, d: '琴身正面的木板，是音色最主要的來源。面板振動，將琴弦的能量轉換為你聽到的聲音。' },
    { id: 'hole', zh: '響孔', en: 'Sound Hole', x: 150, y: 366, d: '琴身內的空氣從這裡進出共鳴，將聲音傳送出來。' },
    { id: 'rosette', zh: '響孔邊飾', en: 'Rosette', x: 205, y: 384, t: [182, 382], d: '響孔外圈的裝飾，同時補強響孔邊緣，用料包括塑膠、木片或貝殼。' },
    { id: 'guard', zh: '防刮板', en: 'Pickguard', x: 232, y: 428, t: [200, 430], d: '保護面板，避免刷弦時被彈片刮傷。' },
    { id: 'bridge', zh: '琴橋', en: 'Bridge', x: 92, y: 493, t: [112, 495], d: '黏在面板上，承受琴弦的拉力，將振動傳到面板。' },
    { id: 'saddle', zh: '下弦枕', en: 'Saddle', x: 150, y: 486, t: [150, 496], d: '琴弦振動的終點，將振動傳進琴橋與面板。高度決定弦距（琴弦與指板的距離）。' },
    { id: 'pin', zh: '弦釘', en: 'Bridge Pins', x: 210, y: 500, t: [182, 495], d: '將弦尾固定在琴橋的小釘子，換弦時才需要拔起。' },
    { id: 'binding', zh: '琴身邊飾', en: 'Binding', x: 282, y: 535, d: '琴身邊緣的封邊，保護接縫，也能觀察做工的細緻程度。' },
    { id: 'side', zh: '側板與背板', en: 'Sides & Back', x: 30, y: 386, d: '琴身的側面與背面，和面板一同圍出共鳴箱，影響低音的厚度與餘韻。' }
  ];
  function fretY(n) { return 108 + 442 * (1 - Math.pow(2, -n / 12)); }
  function anatomySVG() {
    var s = '<svg class="gfig" viewBox="0 0 310 650" role="img" aria-label="真實木吉他正面構造圖，共 16 個部位">';
    s += '<image href="' + GUITAR_IMAGE + 'acoustic-front.jpg" x="0" y="0" width="310" height="650" preserveAspectRatio="xMidYMid slice"/>';
    PARTS.forEach(function (p, i) {
      s += '<g class="hot" data-part="' + i + '" tabindex="0" role="button" aria-label="' + p.zh + '">' +
        (p.t ? '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + p.t[0] + '" y2="' + p.t[1] + '" class="lead"/><circle cx="' + p.t[0] + '" cy="' + p.t[1] + '" r="2.6" class="dot"/>' : '') +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="12"/><text x="' + p.x + '" y="' + (p.y + 4.5) + '" class="n">' + (i + 1) + '</text></g>';
    });
    return s + '</svg>';
  }
  function mountAnatomy(root) {
    root.classList.add('anatomy');
    root.innerHTML = '<div>' + anatomySVG() + '</div><div class="part-info" aria-live="polite"></div>';
    var info = $('.part-info', root), chips = el('div', { class: 'part-chips' });
    PARTS.forEach(function (p, i) { var b = el('button', { type: 'button', 'data-part': i }, (i + 1) + ' ' + p.zh); chips.appendChild(b); });
    var seen = {};
    function show(i) {
      var p = PARTS[i];
      info.innerHTML = '<div class="pi-no">' + String(i + 1).padStart(2, '0') + ' / ' + PARTS.length + '</div><h3>' + p.zh + '</h3><div class="pi-en">' + p.en + '</div><p>' + p.d + '</p>';
      info.appendChild(chips);
      $$('[data-part]', root).forEach(function (n) { n.classList.toggle('on', +n.getAttribute('data-part') === i); });
      seen[i] = 1;
      if (Object.keys(seen).length === PARTS.length) report(root, 'interaction', { item: '吉他構造', result: '瀏覽完 16 個部位' });
    }
    root.addEventListener('click', function (e) { var t = e.target.closest('[data-part]'); if (t) show(+t.getAttribute('data-part')); });
    root.addEventListener('keydown', function (e) { var t = e.target.closest('.hot'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(+t.getAttribute('data-part')); } });
    show(0);
  }

  /* ---------- 筒身、尺寸、合板／單板、力木、鋼筋 ---------- */
  var BODIES = [
    { id: 'Jumbo', zh: '巨無霸', p: [54, 38, 76, 0.4], L: 104, d: '下半部最寬、腰身最細，外型如同葫蘆。低音飽滿、音量最大，適合刷奏伴奏。' },
    { id: 'Dreadnought', zh: '無畏艦（D 桶）', p: [56, 50, 70, 0.44], L: 100, d: '最常見的筒身，肩膀方正、腰線平緩。音量宏亮、頻率平均，是民謠彈唱的標準選擇。' },
    { id: 'Grand Auditorium', zh: '大音樂廳（GA）', p: [52, 40, 68, 0.42], L: 100, d: '介於 D 桶與小型筒身之間，中頻清楚。刷奏、指彈都很合適，是 Taylor 的代表筒身。' },
    { id: 'Auditorium', zh: '音樂廳（OM／000）', p: [48, 36, 64, 0.42], L: 96, d: '腰身纖細、下半部寬闊，高低頻分明，適合指彈與錄音。' },
    { id: 'Grand Concert', zh: '大音樂會（GC）', p: [44, 33, 58, 0.42], L: 90, d: '琴身較小，音量適中，高頻靈敏、反應迅速，適合指彈與主奏。' },
    { id: 'Concert', zh: '音樂會', p: [40, 30, 54, 0.42], L: 86, d: '最小、最輕的筒身，抱起來最舒適，適合身形嬌小或經常攜帶外出的人。' }
  ];
  var bodyOutlineCount = 0;
  function bodyOutline(b) {
    var id = 'body-wood-' + (++bodyOutlineCount), y = 110 - b.L, holeY = y + b.L * .36, bridgeY = y + b.L * .7;
    var s = '<svg class="gfig" viewBox="0 0 90 112" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f0d6a4"/><stop offset=".52" stop-color="#c99554"/><stop offset="1" stop-color="#8e5934"/></linearGradient></defs>';
    s += '<rect x="42.5" y="0" width="5" height="' + (y + 4) + '" rx="1" class="dark"/>';
    for (var f = 1; f <= 5; f++) { var fy = 4 + (y - 2) * (1 - Math.pow(2, -f / 12)); s += '<line x1="42.5" x2="47.5" y1="' + fy + '" y2="' + fy + '" stroke="#c9ccd1" stroke-width=".7"/>'; }
    s += '<path d="' + bodyPath(45, y, b.L, b.p[0], b.p[1], b.p[2], b.p[3]) + '" style="fill:url(#' + id + ')" stroke="#efe8d6" stroke-width="1.4"/>';
    s += '<circle cx="45" cy="' + holeY + '" r="9.5" fill="none" stroke="#e2c48f" stroke-width="1.1"/><circle cx="45" cy="' + holeY + '" r="7" class="hole"/>';
    s += '<rect x="37" y="' + (bridgeY - 2) + '" width="16" height="4" rx="1" class="dark"/><line x1="39" x2="51" y1="' + (bridgeY - 2.5) + '" y2="' + (bridgeY - 2.5) + '" stroke="#efe8d6" stroke-width=".8"/>';
    for (var k = 0; k < 6; k++) s += '<line x1="' + (43 + k * .8) + '" x2="' + (40 + k * 2) + '" y1="' + (y + 4) + '" y2="' + bridgeY + '" stroke="#e8e4da" stroke-width=".35"/>';
    return s + '</svg>';
  }
  function mountBodies(root) {
    root.innerHTML = '<div class="bodies">' + BODIES.map(function (b, i) {
      return '<div class="b" data-b="' + i + '" tabindex="0" role="button">' + bodyOutline(b) + '<b>' + b.id + '</b><small>' + b.zh + '</small></div>';
    }).join('') + '</div><p class="body-note card" aria-live="polite"></p>';
    var note = $('.body-note', root);
    function show(i) { $$('.b', root).forEach(function (n, k) { n.classList.toggle('on', k === i); }); note.innerHTML = '<b>' + BODIES[i].id + '｜' + BODIES[i].zh + '</b>　' + BODIES[i].d; }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-b]'); if (b) show(+b.getAttribute('data-b')); });
    root.addEventListener('keydown', function (e) { var b = e.target.closest('[data-b]'); if (b && e.key === 'Enter') show(+b.getAttribute('data-b')); });
    show(1);
  }
  function sizesHTML() {
    return '<div class="sizes">' + [['1/4', '2–5 歲', 0.55], ['1/2', '5–8 歲', 0.68], ['3/4', '8–12 歲', 0.82], ['Full', '12 歲以上', 1]].map(function (z) {
      return '<div style="--h:' + Math.round(z[2] * 230) + 'px">' + miniGuitar(FAMILY.folk) + '<b>' + z[0] + '</b><span>' + z[1] + '</span></div>';
    }).join('') + '</div>';
  }
  function laminateSVG() {
    var s = '<svg class="gfig" viewBox="0 0 600 200" role="img" aria-label="合板與單板面板的剖面比較">';
    s += '<text x="10" y="22" class="big">合板 Laminated</text><text x="330" y="22" class="big">單板 Solid</text>';
    s += '<rect x="10" y="38" width="230" height="16" class="wood3"/><rect x="10" y="54" width="230" height="30" class="wood2"/><rect x="10" y="84" width="230" height="16" class="wood3"/>';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + (16 + (i * 37) % 224) + '" cy="' + (60 + (i * 13) % 20) + '" r="1.8" fill="#c9a06a" opacity=".7"/>';
    s += '<text x="248" y="51" class="en">薄木片</text><text x="248" y="74" class="en">膠合夾層</text><text x="248" y="97" class="en">薄木片</text>';
    s += '<rect x="330" y="38" width="260" height="62" class="wood3"/>';
    for (var j = 0; j < 9; j++) s += '<path d="M330 ' + (43 + j * 6.5) + ' C400 ' + (39 + j * 6.5) + ' 500 ' + (49 + j * 6.5) + ' 590 ' + (43 + j * 6.5) + '" stroke="#c49a5c" stroke-width="1" fill="none"/>';
    s += '<text x="10" y="134">✓ 價格親民、不易受溫濕度影響</text><text x="10" y="162">✕ 膠層吸收振動，共鳴較弱</text>';
    s += '<text x="330" y="134">✓ 整片木頭振動，聲音通透</text><text x="330" y="162">✓ 越彈越「開」，音色持續成長</text><text x="330" y="190">✕ 價格較高，需要留意除濕</text>';
    return s + '</svg>';
  }
  function bracingSVG() {
    var s = '<svg class="gfig" viewBox="0 0 520 300" role="img" aria-label="民謠吉他 X 型力木與古典吉他扇形力木比較">';
    function shell(cx) { return '<path d="' + bodyPath(cx, 30, 250, 150, 118, 190, 0.43) + '" class="wood3" stroke="#efe8d6" stroke-width="3" opacity=".95"/><circle cx="' + cx + '" cy="' + (30 + 250 * 0.33) + '" r="28" fill="none" stroke="#7a4524" stroke-width="2" stroke-dasharray="4 3"/>'; }
    s += shell(130) + shell(390);
    // X 型
    s += '<path d="M78 150 L190 236 M182 150 L70 236" stroke="#7a4524" stroke-width="7" stroke-linecap="round"/><path d="M84 104 H176" stroke="#7a4524" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M96 210 L120 246 M164 210 L140 246" stroke="#7a4524" stroke-width="4" stroke-linecap="round"/>';
    // 扇形
    for (var i = -3; i <= 3; i++) s += '<path d="M390 160 L' + (390 + i * 24) + ' 262" stroke="#7a4524" stroke-width="4" stroke-linecap="round"/>';
    s += '<path d="M344 104 H436 M340 168 H440" stroke="#7a4524" stroke-width="6" stroke-linecap="round"/>';
    s += '<text x="130" y="296" class="mid big">X 型力木｜鋼弦民謠吉他</text><text x="390" y="296" class="mid big">扇形力木｜古典吉他</text>';
    return s + '</svg>';
  }
  function trussSVG() {
    var s = '<svg class="gfig" viewBox="0 0 520 170" role="img" aria-label="琴頸側面與內部鋼筋">';
    s += '<path d="M10 60 L60 54 L500 62 L500 98 L60 92 L10 96 Z" class="wood2"/><rect x="60" y="54" width="440" height="10" class="dark"/>';
    s += '<line x1="70" y1="80" x2="490" y2="80" stroke="#c9ccd1" stroke-width="3" stroke-dasharray="10 5"/><circle cx="74" cy="80" r="6" class="metal"/>';
    s += '<text x="74" y="124" class="mid">調整螺帽</text><text x="10" y="156">鋼筋 Truss Rod：抵抗琴弦拉力，讓琴頸保持微微的弧度</text>';
    s += '<text x="300" y="22" class="mid en">六條弦的拉力合計約 70 公斤</text><path d="M120 46 C250 28 380 28 480 46" class="acc-s" stroke-dasharray="4 4"/>';
    return s + '</svg>';
  }
  /* 標準調音：六條空弦與音程 */
  function tuningSVG() {
    var s = '<svg class="gfig" viewBox="0 0 560 250" role="img" aria-label="標準調音 E A D G B E，相鄰弦相差完全四度，3 弦到 2 弦相差大三度">';
    OPEN.slice().reverse().forEach(function (o, k) {
      var y = 30 + k * 38, idx = k + 1; // 上方是最細的 1 弦（與六線譜同方向）
      s += '<line x1="80" x2="520" y1="' + y + '" y2="' + y + '" stroke="#e8e4da" stroke-width="' + (0.8 + k * 0.35) + '"/>';
      s += '<text x="26" y="' + (y + 5) + '" class="big">' + idx + '</text><text x="44" y="' + (y + 5) + '" class="en">弦</text>';
      s += '<circle cx="536" cy="' + y + '" r="17" class="acc"/><text x="536" y="' + (y + 6) + '" class="n" style="font-size:16px">' + o.n + '</text>';
    });
    var gaps = ['完全四度', '完全四度', '完全四度', '大三度', '完全四度'];
    gaps.forEach(function (g, k) {
      var y = 30 + (4 - k) * 38 + 19;
      s += '<text x="300" y="' + (y + 5) + '" class="mid ' + (k === 3 ? 'big' : 'en') + '" style="' + (k === 3 ? 'fill:var(--accent)' : '') + '">' + g + '</text>';
    });
    return s + '</svg>';
  }
  /* 坐姿與持彈片：照片呈現真實手感，向量標註保留教學重點 */
  function postureSVG() {
    return '<svg class="gfig" viewBox="0 0 620 330" role="img" aria-label="木吉他坐姿：坐在椅子前三分之一，背部自然挺直，琴身靠近身體並置於右大腿，琴頸微微上揚">' +
      '<defs><clipPath id="posture-photo-clip"><rect x="0" y="28" width="390" height="260" rx="12"/></clipPath></defs>' +
      '<image href="' + GUITAR_IMAGE + 'posture.jpg" x="0" y="28" width="390" height="260" preserveAspectRatio="xMidYMid slice" clip-path="url(#posture-photo-clip)"/>' +
      '<path d="M14 55 L98 94 M166 111 L298 147 M270 236 L145 220 M180 274 L276 267" class="lead" stroke-width="2"/>' +
      '<circle cx="98" cy="94" r="4" class="dot"/><circle cx="298" cy="147" r="4" class="dot"/><circle cx="145" cy="220" r="4" class="dot"/><circle cx="276" cy="267" r="4" class="dot"/>' +
      '<text x="414" y="72" class="big" style="fill:var(--accent)">01</text><text x="446" y="72">背部自然挺直</text>' +
      '<text x="414" y="126" class="big" style="fill:var(--accent)">02</text><text x="446" y="126">琴頸微微上揚</text>' +
      '<text x="414" y="180" class="big" style="fill:var(--accent)">03</text><text x="446" y="180">琴身靠近身體</text>' +
      '<text x="414" y="234" class="big" style="fill:var(--accent)">04</text><text x="446" y="234">坐在椅面前 1/3</text>' +
      '<text x="0" y="318" class="en">自然放鬆，手腕不需刻意折彎</text>' + '</svg>';
  }
  function pickSVG() {
    return '<svg class="gfig" viewBox="0 0 540 235" role="img" aria-label="持彈片特寫：拇指指腹與食指側面輕夾彈片，尖端露出約 2 到 3 公釐">' +
      '<defs><clipPath id="pick-photo-clip"><rect x="0" y="20" width="282" height="188" rx="12"/></clipPath></defs>' +
      '<image href="' + GUITAR_IMAGE + 'pick-grip.jpg" x="0" y="20" width="282" height="188" preserveAspectRatio="xMidYMid slice" clip-path="url(#pick-photo-clip)"/>' +
      '<path d="M302 64 L231 118" class="lead" stroke-width="2"/><circle cx="231" cy="118" r="4" class="dot"/>' +
      '<text x="302" y="57" class="big" style="fill:var(--accent)">拇指</text><text x="355" y="57">指腹輕壓彈片</text>' +
      '<text x="302" y="111" class="big" style="fill:var(--accent)">食指</text><text x="355" y="111">第一節側面支撐</text>' +
      '<text x="302" y="165" class="big" style="fill:var(--accent)">尖端</text><text x="355" y="165">露出約 2–3 mm</text>' +
      '<text x="0" y="231" class="en">輕夾即可，手指保持自然彎曲</text>' + '</svg>';
  }
  function handsSVG() {
    var s = '<svg class="gfig" viewBox="0 0 800 440" role="img" aria-label="吉他指法：左手食指 1、中指 2、無名指 3、小指 4，拇指不編號；右手拇指 T、食指 1、中指 2、無名指 3">';
    s += '<defs><clipPath id="guitar-left-photo"><rect x="0" y="42" width="400" height="320" rx="10"/></clipPath><clipPath id="guitar-right-photo"><rect x="400" y="42" width="400" height="320" rx="10"/></clipPath></defs>';
    s += '<text x="18" y="28" class="big">左手｜按弦</text><text x="420" y="28" class="big">右手｜撥弦</text>';
    s += '<image href="' + GUITAR_IMAGE + 'finger-anatomy.jpg" x="-400" y="42" width="800" height="533.333" clip-path="url(#guitar-left-photo)"/><image href="' + GUITAR_IMAGE + 'finger-anatomy.jpg" x="400" y="42" width="800" height="533.333" clip-path="url(#guitar-right-photo)"/>';
    var markers = [['1',157,119],['2',220,84],['3',277,119],['4',328,175],['T',760,280],['1',640,117],['2',580,84],['3',528,119]];
    markers.forEach(function (f, i) {
      s += '<circle cx="' + f[1] + '" cy="' + f[2] + '" r="15" fill="' + (i < 4 ? '#6cbb4b' : '#c9ccd1') + '" stroke="#111315" stroke-width="2"/><text x="' + f[1] + '" y="' + (f[2] + 5) + '" class="n" style="font-size:16px">' + f[0] + '</text>';
    });
    s += '<text x="18" y="318" class="en" style="fill:#f4f4f0">拇指不編號</text>';
    s += '<text x="18" y="393" style="font-size:17px">1 食指　2 中指　3 無名指　4 小指</text>';
    s += '<text x="420" y="393" style="font-size:17px">T 拇指　1 食指　2 中指　3 無名指</text>';
    s += '<text x="18" y="423" class="en">四根手指負責按弦，拇指在琴頸後方支撐</text>';
    s += '<text x="420" y="423" class="en">拇指 4–6 弦／食指 3 弦／中指 2 弦／無名指 1 弦</text>';
    return s + '</svg>';
  }
  /* 演變：烏德琴 → 魯特琴 → 比維拉琴 → 四組弦 → 五組弦 → 六弦吉他 */
  var PHOTO_FAMILY = {oud:'烏德琴', classical:'古典吉他', flamenco:'佛朗明哥吉他', folk:'民謠吉他', electric:'電吉他', steel:'夏威夷吉他', ukulele:'烏克麗麗、班鳩琴與曼陀鈴'};
  function familyPhoto(key) {
    var file = key === 'ukulele' ? 'relatives' : key;
    return '<img class="guitar-photo" src="' + GUITAR_IMAGE + file + '-photo.jpg" alt="' + PHOTO_FAMILY[key] + '寫實器材圖" width="512" height="512">';
  }
  function evolutionSVG() {
    var items = [['oud','烏德琴','Oud'],['lute','魯特琴','Lute'],['vihuela','比維拉琴','Vihuela'],['renaissance','四組弦吉他','Renaissance'],['baroque','五組弦吉他','Baroque'],['classical-history','六弦吉他','Modern']];
    return '<div class="guitar-evolution-photos">' + items.map(function (it) {
      return '<figure><img src="' + GUITAR_IMAGE + it[0] + '-photo.jpg" alt="' + it[1] + '寫實重建圖"><figcaption><b>' + it[1] + '</b><span>' + it[2] + '</span></figcaption></figure>';
    }).join('') + '</div>';
  }
  var FIGS = { anatomy: mountAnatomy, bodies: mountBodies, evolution: function (n) { n.innerHTML = evolutionSVG(); },
    sizes: function (n) { n.innerHTML = sizesHTML(); }, laminate: function (n) { n.innerHTML = laminateSVG(); },
    bracing: function (n) { n.innerHTML = bracingSVG(); }, truss: function (n) { n.innerHTML = trussSVG(); },
    tuning: function (n) { n.innerHTML = tuningSVG(); }, posture: function (n) { n.innerHTML = postureSVG(); },
    pick: function (n) { n.innerHTML = pickSVG(); }, hands: function (n) { n.innerHTML = handsSVG(); } };
  $$('[data-gfig]').forEach(function (n) {
    var k = n.getAttribute('data-gfig');
    if (FIGS[k]) FIGS[k](n);
    else if (k.indexOf('family-') === 0) { var type = k.slice(7); n.innerHTML = PHOTO_FAMILY[type] ? familyPhoto(type) : miniGuitar(FAMILY[type]); }
  });

  /* ---------- 和弦圖 ---------- */
  function diagram(key, opts) {
    var c = CHORDS[key], o = opts || {};
    var x0 = 22, dx = 16, y0 = 34, dy = 24, frets = 4, w = x0 * 2 + dx * 5, h = y0 + dy * frets + 14;
    var s = '<svg class="chord-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + c.zh + ' 和弦圖">';
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
        var y = y0 + dy * (fr - 0.5), inBarre = c.barre && fr === c.barre.fret && i > c.barre.from && i <= c.barre.to;
        if (!inBarre) s += '<circle cx="' + x + '" cy="' + y + '" r="7" class="dot"/>';
        if (!o.noFingers && c.fingers[i] && !inBarre) s += '<text x="' + x + '" y="' + (y + 3.6) + '" class="finger">' + c.fingers[i] + '</text>';
      }
    });
    if (o.strings) for (var j = 0; j < 6; j++) s += '<text x="' + (x0 + dx * j) + '" y="' + (h - 1) + '" class="snum">' + (6 - j) + '</text>';
    return s + '</svg>';
  }
  PS.guitar.diagram = diagram;
  $$('[data-diagram]').forEach(function (n) { n.innerHTML = diagram(n.getAttribute('data-diagram'), { strings: n.hasAttribute('data-strings') }); });
  $$('[data-chord-cards]').forEach(function (root) {
    var keys = (root.getAttribute('data-chord-cards') || 'C G Am F').split(/\s+/);
    // data-labels="G:G_調_I_級 D:V"（底線代表空白）可自訂右上角標示；data-plain 隱藏預設的級數與提示
    var labels = {}, plain = root.hasAttribute('data-plain');
    (root.getAttribute('data-labels') || '').split(/\s+/).forEach(function (x) { var p = x.split(':'); if (p[1]) labels[p[0]] = p[1].replace(/_/g, ' '); });
    root.classList.add('chord-row');
    root.innerHTML = keys.map(function (k) {
      var c = CHORDS[k], label = k in labels ? labels[k] : plain ? '' : (c.degree ? 'C 調 ' + c.degree + ' 級' : '');
      return '<div class="card chord-card"><div class="ch-head"><b>' + c.name + '</b><span>' + label + '</span></div><div class="fig">' + diagram(k, { strings: true }) + '</div><p>' + (plain ? '' : c.tip) + '</p><button type="button" class="btn" data-hear="' + k + '">▶ 試聽</button></div>';
    }).join('');
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hear]'), a = b && PS.audio.ctx(); if (!a) return;
      PS.audio.strum(CHORDS[b.getAttribute('data-hear')].frets, a.currentTime + 0.02, 'down', { duration: 2.2, gap: 0.03 });
    });
  });

  /* ---------- 控制元件 ---------- */
  var active = null;
  function claim(stopFn) { if (active && active !== stopFn) active(); active = stopFn; }
  document.addEventListener('slide:change', function () { if (active) active(); });
  function seg(name, options, current, onChange) {
    var wrap = el('div', { class: 'seg', role: 'group', 'aria-label': name });
    options.forEach(function (op) {
      var b = el('button', { type: 'button', 'aria-pressed': String(op[0] === current) }, op[1]);
      b.addEventListener('click', function () { $$('button', wrap).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); onChange(op[0]); });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function field(label, node) { var f = el('span', { class: 'field' }, label); if (node) f.appendChild(node); return f; }
  function bpmField(min, max, value, onInput) {
    var f = el('label', { class: 'field' }, '速度 <input type="range" min="' + min + '" max="' + max + '" step="2" value="' + value + '" aria-label="速度 BPM"><output>' + value + '</output> BPM');
    var input = $('input', f), out = $('output', f);
    input.addEventListener('input', function () { out.textContent = input.value; onInput(+input.value); });
    return f;
  }
  function toggle(label, on, onChange) {
    var b = el('button', { type: 'button', class: 'btn gbtn', 'aria-pressed': String(on) }, label);
    b.addEventListener('click', function () { on = !on; b.setAttribute('aria-pressed', String(on)); onChange(on); });
    return b;
  }

  /* ---------- 換和弦練習器 ----------
   * data-switch-trainer="C G Am F|G D Em C"：以 | 分隔多組進行；留空時使用四大和弦的三種進行
   */
  $$('[data-switch-trainer]').forEach(function (root) {
    var attr = root.getAttribute('data-switch-trainer'), progs = attr ? attr.split('|').map(function (x, i) { var seq = x.trim().split(/\s+/); return { id: 'p' + i, label: seq.join(' → '), seq: seq }; }) : PROGRESSIONS;
    var prog = progs[0], perChord = 4, demo = true, startedAt = 0, changes = 0;
    root.innerHTML = '<div class="trainer-stage" aria-live="polite"><div class="now"><span class="label">現在</span><b class="name"></b><div class="fig"></div></div>' +
      '<div class="next"><span class="label">下一個</span><b class="name"></b><div class="fig"></div></div>' +
      '<div class="count"><span class="label">拍</span><div class="beats" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="hint">按下「開始」之後，先數一小節預備拍</p></div></div><div class="gcontrols"></div>';
    var c = $('.gcontrols', root), start = el('button', { type: 'button', class: 'btn primary' }, '開始');
    c.appendChild(start);
    c.appendChild(bpmField(40, 120, +(root.getAttribute('data-bpm') || 60), function (v) { m.bpm = v; }));
    if (progs.length > 1) c.appendChild(field('進行', seg('和弦進行', progs.map(function (p) { return [p.id, p.label]; }), prog.id, function (id) { prog = progs.filter(function (p) { return p.id === id; })[0]; show(0, -1); })));
    c.appendChild(field('每個和弦', seg('每個和弦拍數', [[4, '4 拍'], [2, '2 拍']], 4, function (v) { perChord = v; })));
    c.appendChild(toggle('示範撥弦', true, function (v) { demo = v; }));
    var nowN = $('.now .name', root), nextN = $('.next .name', root), nowF = $('.now .fig', root), nextF = $('.next .fig', root), lights = $$('.beats i', root), hint = $('.hint', root);
    function at(i) { return prog.seq[((i % prog.seq.length) + prog.seq.length) % prog.seq.length]; }
    function show(i, beat) {
      var a = at(i), b = at(i + 1);
      if (nowN.getAttribute('data-k') !== a) { nowN.setAttribute('data-k', a); nowN.textContent = CHORDS[a].name; nowF.innerHTML = diagram(a); }
      if (nextN.getAttribute('data-k') !== b) { nextN.setAttribute('data-k', b); nextN.textContent = CHORDS[b].name; nextF.innerHTML = diagram(b, { noFingers: true }); }
      lights.forEach(function (l, n) { l.className = n === beat ? 'on' + (n === 0 ? ' down' : '') : ''; });
    }
    var m = new PS.audio.Metronome({ bpm: +(root.getAttribute('data-bpm') || 60), beats: 4, steps: 1, onStep: function (step, time) {
      if (step < 4 || !demo) return;
      var k = step - 4;
      if (k % perChord === 0) PS.audio.strum(CHORDS[at(Math.floor(k / perChord))].frets, time, 'down', { volume: 0.12 });
    } });
    m.onVisual = function (step) {
      if (step < 4) { hint.textContent = '預備 ' + (4 - step); show(0, step); return; }
      var k = step - 4, idx = Math.floor(k / perChord);
      if (k % perChord === 0 && k > 0) changes++;
      hint.textContent = k % perChord === perChord - 1 ? '準備換到 ' + CHORDS[at(idx + 1)].name : '';
      show(idx, k % 4);
    };
    function stop() {
      if (!m.running) return;
      m.stop(); start.textContent = '開始';
      lights.forEach(function (l) { l.className = ''; });
      var secs = Math.round((Date.now() - startedAt) / 1000);
      hint.textContent = '剛才練習 ' + secs + ' 秒，換了 ' + changes + ' 次和弦';
      if (secs >= 5) report(root, 'interaction', { item: '換和弦練習 ' + prog.label, result: m.bpm + ' BPM・每和弦 ' + perChord + ' 拍・' + secs + ' 秒・換 ' + changes + ' 次', value: changes });
    }
    start.addEventListener('click', function () { if (m.running) return stop(); claim(stop); changes = 0; startedAt = Date.now(); if (m.start()) start.textContent = '停止'; });
    show(0, -1);
  });

  /* ---------- 刷奏播放器 ----------
   * data-strum-player="A B"：可切換的刷法；data-chords="prog C"：和弦組合（見 SETS），或直接寫「C G Am F」以逗號分組
   */
  var SETS = { prog: ['C', 'G', 'Am', 'F'], fifties: ['C', 'Am', 'F', 'G'], C: ['C'], G: ['G'], open: ['open'], Em: ['Em'],
    gkey: ['G', 'D', 'Em', 'C'], waltz: ['C', 'G', 'G', 'C'], minor: ['Am', 'F', 'C', 'G'], bass: ['C', 'G/B', 'Am', 'Am/G', 'F', 'C/E', 'Dm', 'G'] };
  function setOf(k) { return SETS[k] || k.split(','); }
  function setLabel(k) { return ({ prog: 'C G Am F', fifties: 'C Am F G', C: '只彈 C', G: '只彈 G', open: '空弦', Em: 'Em', gkey: 'G D Em C', waltz: 'C G G C', minor: 'Am F C G', bass: '下行低音' })[k] || setOf(k).join(' '); }
  function strumCell(cell, chord, time, per, accent) {
    var dur = per >= 4 ? 0.35 : 0.5;
    if (cell === 'X' || cell === 'Y') PS.audio.strum(bassOnly(chord, cell === 'Y'), time, 'down', { duration: 0.9, volume: 0.3 });
    else if (cell === 'M') PS.audio.strum(CHORDS[chord].frets, time, 'down', { duration: 0.05, volume: 0.22, gap: 0.004 });
    else if (cell === 'D' || cell === 'U') {
      var hasBass = PATTERNS.__bass;
      PS.audio.strum(hasBass ? highOnly(chord) : CHORDS[chord].frets, time, cell === 'D' ? 'down' : 'up', { volume: accent ? 0.14 : 0.1, duration: dur, gap: per >= 4 ? 0.008 : undefined });
    }
  }
  function grid(key, chord) {
    var cells = PATTERNS[key].cells, n = cells.length, beats = beatsOf(key), per = n / beats, cnt = counts(n, beats);
    return '<div class="rnote-slot" data-k="' + key + '" data-c="' + (chord || 'C') + '"></div><div class="strum-grid' + (n > 8 ? ' g16' : '') + '" style="grid-template-columns:repeat(' + n + ',minmax(0,1fr))" role="list">' + cells.map(function (c, i) {
      if (c === 'X' || c === 'Y') return '<div class="cell bass' + (i % per ? ' off' : '') + '" role="listitem"><span class="sarrow" aria-label="低音">' + (c === 'X' ? 'X' : 'x') + '</span><span class="cnt">' + cnt[i] + '</span></div>';
      if (c === 'M') return '<div class="cell bass' + (i % per ? ' off' : '') + '" role="listitem"><span class="sarrow" aria-label="切音">✕</span><span class="cnt">' + cnt[i] + '</span></div>';
      var ghost = c === 'd' || c === 'u', up = c === 'U' || c === 'u';
      return '<div class="cell' + (i % per ? ' off' : '') + '" role="listitem"><span class="sarrow' + (ghost ? ' ghost' : '') + '" aria-label="' + (ghost ? '空刷' : up ? '上刷' : '下刷') + '">' + (up ? '↑' : '↓') + '</span><span class="cnt">' + cnt[i] + '</span></div>';
    }).join('') + '</div>';
  }
  function mountPattern(n) { n.innerHTML = '<div class="pgrid">' + grid(n.getAttribute('data-pattern-grid'), n.getAttribute('data-chord') || 'C') + '</div>'; }
  $$('[data-pattern-grid]').forEach(mountPattern);
  $$('[data-strum-player]').forEach(function (root) {
    var keys = (root.getAttribute('data-strum-player') || 'A B').split(/\s+/), key = keys[0];
    var modes = (root.getAttribute('data-chords') || 'prog C').split(/\s+/), mode = modes[0];
    var guitar = true, startedAt = 0, bars = 0;
    root.innerHTML = '<div class="card"><div class="player-top"><b class="pname"></b><span class="pchord" aria-live="polite"></span></div><div class="pgrid"></div><p class="pdesc"></p><div class="gcontrols"></div></div>';
    var c = $('.gcontrols', root), pgrid = $('.pgrid', root), pchord = $('.pchord', root);
    function N() { return PATTERNS[key].cells.length; }
    function per() { return N() / beatsOf(key); }
    function chordAt(step) { var set = setOf(mode); return set[Math.floor(Math.max(0, step - N()) / N()) % set.length]; }
    function hasBass() { return PATTERNS[key].cells.some(function (x) { return x === 'X' || x === 'Y'; }); }
    function render() { $('.pname', root).textContent = PATTERNS[key].name; $('.pdesc', root).textContent = PATTERNS[key].desc; pgrid.innerHTML = grid(key, setOf(mode)[0]); var sl0 = $('.rnote-slot', pgrid); if (sl0) paintRhythm(sl0, (root.closest('.slide') || {})._rsc || 1); pchord.textContent = CHORDS[chordAt(N())].name; m.steps = per(); m.beats = beatsOf(key); }
    var start = el('button', { type: 'button', class: 'btn primary' }, '開始');
    c.appendChild(start);
    c.appendChild(bpmField(40, 132, +(root.getAttribute('data-bpm') || 70), function (v) { m.bpm = v; }));
    if (keys.length > 1) c.appendChild(field('刷法', seg('刷法', keys.map(function (k) { return [k, SHORT[k]]; }), key, function (v) { stop(); key = v; render(); })));
    if (modes.length > 1) c.appendChild(field('和弦', seg('和弦', modes.map(function (k) { return [k, setLabel(k)]; }), mode, function (v) { mode = v; render(); })));
    c.appendChild(toggle('吉他示範', true, function (v) { guitar = v; }));
    var m = new PS.audio.Metronome({ bpm: +(root.getAttribute('data-bpm') || 70), beats: 4, steps: 2, onStep: function (step, time) {
      var n = N();
      if (step < n || !guitar) return;
      PATTERNS.__bass = hasBass();
      strumCell(PATTERNS[key].cells[step % n], chordAt(step), time, per(), step % per() === 0);
    } });
    m.onVisual = function (step) {
      var n = N(), p = per();
      $$('.cell', pgrid).forEach(function (x, i) { x.classList.toggle('now', step >= n && i === step % n); });
      if (step < n) { if (step % p === 0) pchord.textContent = '預備 ' + (beatsOf(key) - step / p); return; }
      if (step % n === 0) bars++;
      pchord.textContent = CHORDS[chordAt(step)].name;
    };
    function stop() {
      if (!m.running) return;
      m.stop(); start.textContent = '開始';
      $$('.cell', pgrid).forEach(function (x) { x.classList.remove('now'); });
      pchord.textContent = CHORDS[chordAt(N())].name;
      var secs = Math.round((Date.now() - startedAt) / 1000);
      if (secs >= 5) report(root, 'interaction', { item: '刷奏 ' + PATTERNS[key].name, result: m.bpm + ' BPM・' + bars + ' 小節', value: bars });
    }
    start.addEventListener('click', function () { if (m.running) return stop(); claim(stop); bars = 0; startedAt = Date.now(); if (m.start()) start.textContent = '停止'; });
    render();
  });

  /* ---------- 調音器（麥克風） ---------- */
  function detect(buf, sr) {
    var n = buf.length, rms = 0, i;
    for (i = 0; i < n; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / n) < 0.012) return -1;
    var minLag = Math.floor(sr / 420), maxLag = Math.floor(sr / 70), best = -1, bestC = 0, c = new Float32Array(maxLag + 2);
    for (var lag = minLag; lag <= maxLag + 1; lag++) {
      var s = 0, e1 = 0, e2 = 0;
      for (i = 0; i < n - lag; i++) { s += buf[i] * buf[i + lag]; e1 += buf[i] * buf[i]; e2 += buf[i + lag] * buf[i + lag]; }
      c[lag] = s / Math.sqrt(e1 * e2 || 1);
    }
    for (lag = minLag + 1; lag <= maxLag; lag++) if (c[lag] > 0.85 && c[lag] >= c[lag - 1] && c[lag] >= c[lag + 1]) { best = lag; bestC = c[lag]; break; }
    if (best < 0) return -1;
    var a = c[best - 1], b = c[best], d = c[best + 1], shift = (a - d) / (2 * (a - 2 * b + d) || 1);
    return sr / (best + shift);
  }
  $$('[data-tuner]').forEach(function (root) {
    root.classList.add('tuner');
    root.innerHTML = '<div class="strings">' + OPEN.map(function (o, i) { return '<button type="button" data-s="' + i + '"><b>' + o.n + '</b><small>' + (6 - i) + ' 弦・' + o.n + o.o + '</small></button>'; }).join('') + '</div>' +
      '<div class="dial"><span class="read">‧‧</span><span class="cents"></span><i class="zone"></i><i class="scale"></i><i class="needle"></i><span class="lbl l">偏低 ♭</span><span class="lbl r">偏高 ♯</span></div>' +
      '<div class="row" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button type="button" class="btn primary mic">🎙 開始調音</button><button type="button" class="btn ref">▶ 播放參考音</button><span class="msg">選擇一條琴弦，先聆聽參考音，再按下「開始調音」，撥奏那條空弦。</span></div>';
    var cur = 0, stream = null, raf = 0, an = null, buf = null, okSince = 0, done = {};
    var needle = $('.needle', root), read = $('.read', root), cents = $('.cents', root), msg = $('.msg', root), micBtn = $('.mic', root);
    function pick(i) { cur = i; $$('.strings button', root).forEach(function (b, k) { b.classList.toggle('on', k === i); }); }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b) pick(+b.getAttribute('data-s')); });
    $('.ref', root).addEventListener('click', function () {
      var a = PS.audio.ctx(); if (!a) return;
      var f = [-1, -1, -1, -1, -1, -1]; f[cur] = 0;
      PS.audio.strum(f, a.currentTime + 0.02, 'down', { duration: 2.5, volume: 0.35 });
    });
    function stop() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; micBtn.textContent = '🎙 開始調音'; }
    var lastT = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - lastT < 50) return; // 約每秒 20 次，手機也不吃力
      lastT = now;
      an.getFloatTimeDomainData(buf);
      var f = detect(buf, an.context.sampleRate), target = OPEN[cur].f;
      if (f > 0) {
        // 允許撥成高、低八度時仍對到目標弦
        while (f > target * 1.414) f /= 2; while (f < target / 1.414) f *= 2;
        var ce = Math.round(1200 * Math.log2(f / target)), ok = Math.abs(ce) <= 5;
        needle.style.left = Math.max(8, Math.min(92, 50 + ce * 0.84)) + '%';
        needle.classList.toggle('ok', ok);
        read.textContent = OPEN[cur].n + (ok ? ' ✓' : ce < 0 ? ' 偏低' : ' 偏高');
        cents.textContent = (ce > 0 ? '+' : '') + ce + ' cents・' + f.toFixed(1) + ' Hz';
        msg.textContent = ok ? '音準正確，請保持…' : ce < 0 ? '音高偏低：旋鈕慢慢轉緊（音高會上升）' : '音高偏高：先轉鬆到低於目標，再慢慢轉緊上來';
        if (ok) { if (!okSince) okSince = Date.now(); else if (Date.now() - okSince > 700 && !done[cur]) { done[cur] = 1; $$('.strings button', root)[cur].classList.add('ok'); report(root, 'interaction', { item: '調音 ' + (6 - cur) + ' 弦', result: '完成', value: 1 }); if (cur < 5) pick(cur + 1); okSince = 0; } }
        else okSince = 0;
      }
    }
    micBtn.addEventListener('click', function () {
      if (stream) return stop();
      if (!navigator.mediaDevices || !window.isSecureContext) { msg.textContent = '需要以 https 開啟網頁並允許麥克風，也可以改用手機調音 App。'; return; }
      var a = PS.audio.ctx();
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (s) {
        stream = s; an = a.createAnalyser(); an.fftSize = 2048; buf = new Float32Array(an.fftSize);
        a.createMediaStreamSource(s).connect(an);
        claim(stop); micBtn.textContent = '■ 停止調音'; raf = requestAnimationFrame(loop);
      }).catch(function () { msg.textContent = '尚未取得麥克風權限。請在網址列允許麥克風，再重新嘗試。'; });
    });
    pick(0);
  });

  /* ===== 第二章起：樂譜圖、六線譜播放、指板、聽辨練習 ===== */
  function head(x, y, filled) { return '<ellipse cx="' + x + '" cy="' + y + '" rx="7.5" ry="5.4" transform="rotate(-20 ' + x + ' ' + y + ')" class="' + (filled ? 'nfill' : 'nopen') + '"/>'; }
  function stem(x, y, h) { return '<line x1="' + (x + 6.6) + '" y1="' + (y - 2) + '" x2="' + (x + 6.6) + '" y2="' + (y - h) + '" class="nstem"/>'; }
  // 音符時值樹：一小節 4/4 依序切成 1、2、4、8、16 份
  function noteValuesSVG() {
    var rows = [['全音符', 'Whole', 1, '4 拍'], ['二分音符', 'Half', 2, '2 拍'], ['四分音符', 'Quarter', 4, '1 拍'], ['八分音符', 'Eighth', 8, '½ 拍'], ['十六分音符', '16th', 16, '¼ 拍']];
    var s = '<svg class="gfig notes" viewBox="0 0 900 350" role="img" aria-label="音符時值：一小節四拍可以分成 1 個全音符、2 個二分音符、4 個四分音符、8 個八分音符或 16 個十六分音符">';
    rows.forEach(function (r, i) {
      var y = 52 + i * 66, n = r[2], x0 = 230, w = 640;
      s += '<text x="0" y="' + (y + 2) + '" class="big">' + r[0] + '</text><text x="0" y="' + (y + 22) + '" class="en">' + r[1] + '・' + r[3] + '</text>';
      s += '<line x1="' + x0 + '" x2="' + (x0 + w) + '" y1="' + (y + 18) + '" y2="' + (y + 18) + '" class="dim"/>';
      for (var k = 0; k < n; k++) {
        var x = x0 + w * (k + 0.5) / n;
        s += head(x, y + 6, n >= 4);
        if (n > 1) s += stem(x, y + 6, 34);
        if (n === 8 && k % 2 === 0) s += '<line x1="' + (x + 6.6) + '" x2="' + (x0 + w * (k + 1.5) / n + 6.6) + '" y1="' + (y - 28) + '" y2="' + (y - 28) + '" class="nbeam"/>';
        if (n === 16 && k % 4 === 0) s += '<line x1="' + (x + 6.6) + '" x2="' + (x0 + w * (k + 3.5) / n + 6.6) + '" y1="' + (y - 28) + '" y2="' + (y - 28) + '" class="nbeam"/><line x1="' + (x + 6.6) + '" x2="' + (x0 + w * (k + 3.5) / n + 6.6) + '" y1="' + (y - 21) + '" y2="' + (y - 21) + '" class="nbeam"/>';
      }
    });
    return s + '</svg>';
  }
  function restsSVG() {
    var items = [['全休止符', '4 拍', '<rect x="-12" y="-6" width="24" height="9" class="nfill"/><line x1="-20" x2="20" y1="-6" y2="-6" class="nstem"/>'],
      ['二分休止符', '2 拍', '<rect x="-12" y="-3" width="24" height="9" class="nfill"/><line x1="-20" x2="20" y1="6" y2="6" class="nstem"/>'],
      ['四分休止符', '1 拍', '<path d="M-4 -24 L6 -12 L-3 -2 L6 10 Q-8 4 -2 18" class="nrest"/>'],
      ['八分休止符', '½ 拍', '<circle cx="-5" cy="-8" r="4.5" class="nfill"/><path d="M-5 -4 Q4 -2 8 -10 L-2 20" class="nrest"/>'],
      ['十六分休止符', '¼ 拍', '<circle cx="-3" cy="-16" r="4" class="nfill"/><circle cx="-7" cy="-2" r="4" class="nfill"/><path d="M-3 -12 Q6 -10 10 -18 L-2 22 M-7 2 Q2 4 6 -4" class="nrest"/>']];
    var s = '<svg class="gfig notes" viewBox="0 0 900 120" role="img" aria-label="休止符：全休止符 4 拍、二分休止符 2 拍、四分休止符 1 拍、八分休止符半拍、十六分休止符四分之一拍">';
    items.forEach(function (it, i) { var x = 90 + i * 180; s += '<g transform="translate(' + x + ' 44)">' + it[2] + '</g><text x="' + x + '" y="92" class="mid">' + it[0] + '</text><text x="' + x + '" y="112" class="mid en">' + it[1] + '</text>'; });
    return s + '</svg>';
  }
  // 五線譜上的 C 大調音階，附音名、唱名、簡譜
  function staffSVG() {
    var names = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C'], solf = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si', 'Do'], jp = ['1', '2', '3', '4', '5', '6', '7', '1̇'];
    var s = '<svg class="gfig notes" viewBox="0 0 900 230" role="img" aria-label="五線譜上的 C 大調音階 Do Re Mi Fa Sol La Si Do，對應音名 C 到 C 與簡譜 1 到高音 1">';
    for (var l = 0; l < 5; l++) s += '<line x1="20" x2="880" y1="' + (40 + l * 14) + '" y2="' + (40 + l * 14) + '" class="nline"/>';
    s += '<text x="26" y="104" class="clef">𝄞</text><text x="96" y="74" class="big">4</text><text x="96" y="100" class="big">4</text>';
    names.forEach(function (n, i) {
      var x = 170 + i * 90, y = 110 - i * 7;
      if (i === 0) s += '<line x1="' + (x - 14) + '" x2="' + (x + 14) + '" y1="110" y2="110" class="nline"/>';
      s += head(x, y, true) + stem(x, y, 40);
      s += '<text x="' + x + '" y="160" class="mid big">' + n + '</text><text x="' + x + '" y="184" class="mid">' + solf[i] + '</text><text x="' + x + '" y="208" class="mid acc-t">' + jp[i] + '</text>';
    });
    s += '<text x="20" y="160" class="en">音名</text><text x="20" y="184" class="en">唱名</text><text x="20" y="208" class="en">簡譜</text>';
    return s + '</svg>';
  }
  // 切分：延音線把 2 拍後半與第 3 拍連起來
  function syncopeSVG() {
    var s = '<svg class="gfig notes" viewBox="0 0 900 250" role="img" aria-label="八個八分音符與切分節奏：第 2 拍後半拍用延音線連到第 3 拍，第 3 拍不再刷">';
    [['8 Beats', false], ['切分 Folk Rock', true]].forEach(function (r, row) {
      var y = 74 + row * 120;
      s += '<text x="0" y="' + (y - 30) + '" class="big">' + r[0] + '</text>';
      for (var k = 0; k < 8; k++) {
        var x = 220 + k * 82, ghost = r[1] && (k === 1 || k === 4);
        s += '<g' + (ghost ? ' opacity=".28"' : '') + '>' + head(x, y, true) + stem(x, y, 38) + '</g>';
        if (k % 2 === 0) s += '<line x1="' + (x + 6.6) + '" x2="' + (x + 82 + 6.6) + '" y1="' + (y - 38) + '" y2="' + (y - 38) + '" class="nbeam"/>';
        s += '<text x="' + x + '" y="' + (y + 34) + '" class="mid en">' + ['1', '&', '2', '&', '3', '&', '4', '&'][k] + '</text>';
      }
      if (r[1]) s += '<path d="M' + (220 + 3 * 82) + ' ' + (y + 10) + ' Q' + (220 + 3.5 * 82) + ' ' + (y + 28) + ' ' + (220 + 4 * 82) + ' ' + (y + 10) + '" class="acc-s" stroke-width="3"/><text x="' + (220 + 3.5 * 82) + '" y="' + (y + 58) + '" class="mid" style="fill:var(--accent)">延音線：這一拍不刷</text>';
    });
    return s + '</svg>';
  }
  var FIGS2 = { notevalues: noteValuesSVG, rests: restsSVG, staff: staffSVG, syncope: syncopeSVG };
  $$('[data-gfig]').forEach(function (n) { var f = FIGS2[n.getAttribute('data-gfig')]; if (f) n.innerHTML = f(); });

  /* ---------- 六線譜：解析、繪製與播放 ----------
   * data-tab="1-5 1-6 1-7 1-8 | 2-5 …"：弦-格[:時值]；e 半拍、q 1 拍（預設）、dq 1.5 拍、h 2 拍、w 4 拍；r 休止；| 小節線
   * 同一時間的多個音用 + 連接，例如 5-3+3-0+2-1；加上 data-play 變成可播放的練習器
   */
  var DUR = { e: 1, q: 2, dq: 3, h: 4, w: 8 };
  function parseTab(src) {
    var bars = [[]], t = 0, events = [];
    src.trim().split(/\s+/).forEach(function (tok) {
      if (tok === '|') { bars.push([]); return; }
      var p = tok.split(':'), len = DUR[p[1] || 'q'] || 2, ev = { t: t, len: len, rest: p[0] === 'r', notes: [] };
      // 技巧記號：h 搥弦、p 勾弦、s 滑弦、b 推弦（推高全音）、v 揉音、n 自然泛音，例如 3-2h、2-3b
      if (!ev.rest) p[0].split('+').forEach(function (x) { var m = x.match(/^(\d)-(\d+)([hpsbvn])?$/); if (m) ev.notes.push({ s: +m[1], f: +m[2], tech: m[3] || '' }); });
      ev.i = events.length; events.push(ev); bars[bars.length - 1].push(ev); t += len;
    });
    return { bars: bars.filter(function (b) { return b.length; }), events: events, total: t };
  }
  function tabSVG(tab, perRow, W) {
    W = W || 900;
    var rows = [], i, pad = 46, body = '', H = 6;
    for (i = 0; i < tab.bars.length; i += perRow) rows.push(tab.bars.slice(i, i + perRow));
    rows.forEach(function (row, r) {
      var bw = (W - pad - 10) / perRow, staff = '', top = 0, bot = 40;
      function xOf(bx, start, len) { return function (t16) { return bx + 20 + (bw - 34) * (t16 / 2) / len; }; }
      // 上方五線譜：與六線譜同一個橫向位置
      row.forEach(function (bar, b) {
        var bx = pad + b * bw, start = bar[0].t, len = Math.max(8, bar.reduce(function (a, e) { return a + e.len; }, 0)), memo = {};
        var evs = bar.map(function (e) {
          return { id: e.i, t: (e.t - start) * 2, len: e.len * 2, rest: e.rest, tech: e.notes[0] ? e.notes[0].tech : '',
            heads: e.notes.map(function (nt) { return pitchHead(nt.s, nt.f, nt.tech === 'n' ? 'd' : '', memo); }) };
        });
        var res = notation(evs, { x: xOf(bx, start, len), beat: 4 });
        staff += res.svg;
        staff += '<line x1="' + (bx + bw) + '" x2="' + (bx + bw) + '" y1="0" y2="40" class="nline nbar"/>';
        top = Math.min(top, res.top); bot = Math.max(bot, res.bot);
      });
      bot = Math.max(bot, 62); // 譜號下方的 8
      var sy = H - top + 4;
      body += '<g class="staff" transform="translate(0 ' + sy + ')">' + staffLines(pad - 40, pad + bw * row.length) + clef(pad - 38) + '<line x1="' + (pad - 40) + '" x2="' + (pad - 40) + '" y1="0" y2="40" class="nline nbar"/>' + staff + '</g>';
      var y0 = sy + bot + 14, TS = 13;
      for (var l = 0; l < 6; l++) body += '<line x1="' + pad + '" x2="' + (pad + bw * row.length) + '" y1="' + (y0 + l * TS) + '" y2="' + (y0 + l * TS) + '" class="tline"/>';
      body += '<text x="12" y="' + (y0 + 19) + '" class="tabl">T</text><text x="12" y="' + (y0 + 38) + '" class="tabl">A</text><text x="12" y="' + (y0 + 57) + '" class="tabl">B</text>';
      body += '<line x1="' + pad + '" x2="' + pad + '" y1="' + y0 + '" y2="' + (y0 + 5 * TS) + '" class="tbar"/>';
      row.forEach(function (bar, b) {
        var bx = pad + b * bw, start = bar[0].t, len = Math.max(8, bar.reduce(function (a, e) { return a + e.len; }, 0));
        body += '<line x1="' + (bx + bw) + '" x2="' + (bx + bw) + '" y1="' + y0 + '" y2="' + (y0 + 5 * TS) + '" class="tbar"/>';
        bar.forEach(function (e) {
          var x = bx + 20 + (bw - 34) * (e.t - start) / len;
          if (e.rest) { body += '<g data-ev="' + e.i + '"><text x="' + x + '" y="' + (y0 + 2.5 * TS + 5) + '" class="tnum">–</text></g>'; return; }
          body += '<g data-ev="' + e.i + '">';
          e.notes.forEach(function (nt) {
            var y = y0 + (nt.s - 1) * TS, label = nt.tech === 'n' ? '<' + nt.f + '>' : nt.f + (nt.tech === 'b' ? '↗' : nt.tech === 'v' ? '~' : '');
            body += '<rect x="' + (x - 12) + '" y="' + (y - 7.5) + '" width="24" height="15" rx="4" class="tbg"/><text x="' + x + '" y="' + (y + 5.5) + '" class="tnum">' + label + '</text>';
            if ('hps'.indexOf(nt.tech) > -1 && nt.tech) body += '<text x="' + (x - 22) + '" y="' + (y0 - 4) + '" class="ttech">' + nt.tech.toUpperCase() + '</text>';
          });
          body += '</g>';
        });
      });
      H = y0 + 5 * TS + 16;
    });
    return '<svg class="gfig tab notes" viewBox="0 0 ' + W + ' ' + (H - 6) + '" role="img" aria-label="五線譜與六線譜：上方五線譜標示音高與音符長短；下方六線譜第一條線是最細的 1 弦，數字代表要按的格數">' + body + '</svg>';
  }
  function pluckNotes(notes, time, dur, vol) {
    var f = [-1, -1, -1, -1, -1, -1], legato = false, harm = false;
    notes.forEach(function (nt) { f[6 - nt.s] = nt.tech === 'n' ? ({ 12: 12, 7: 19, 5: 24 }[nt.f] || nt.f) : nt.f + (nt.tech === 'b' ? 2 : 0); if ('hps'.indexOf(nt.tech) > -1 && nt.tech) legato = true; if (nt.tech === 'n') harm = true; });
    var v = vol || (notes.length > 1 ? 0.2 : 0.32);
    PS.audio.strum(f, time, 'down', { duration: harm ? 2.4 : dur, volume: legato ? v * 0.55 : harm ? v * 0.6 : v, gap: 0.012 });
  }
  $$('[data-tab]').forEach(mountTab);
  function mountTab(root) {
    var tab = parseTab(root.getAttribute('data-tab')), per = +(root.getAttribute('data-per-row') || 4), player = root.hasAttribute('data-play');
    root._tab = tab; root._p0 = per;
    root.classList.add('tabbox');
    root.innerHTML = (root.getAttribute('data-title') ? '<div class="player-top"><b class="pname">' + root.getAttribute('data-title') + '</b><span class="pchord" aria-live="polite"></span></div>' : '') + '<div class="tabfig">' + tabSVG(tab, per) + '</div>' + (player ? '<div class="gcontrols"></div>' : '');
    if (!player) return;
    var c = $('.gcontrols', root), start = el('button', { type: 'button', class: 'btn primary' }, '開始'), info = $('.pchord', root);
    var demo = true, loops = 0, startedAt = 0, byStep = {};
    tab.events.forEach(function (e) { (byStep[e.t] = byStep[e.t] || []).push(e); });
    c.appendChild(start);
    c.appendChild(bpmField(40, 160, +(root.getAttribute('data-bpm') || 70), function (v) { m.bpm = v; }));
    c.appendChild(toggle('吉他示範', true, function (v) { demo = v; }));
    var CI = 8; // 預備一小節（以八分音符為一格）
    var m = new PS.audio.Metronome({ bpm: +(root.getAttribute('data-bpm') || 70), beats: 4, steps: 2, onStep: function (step, time) {
      if (step < CI || !demo) return;
      (byStep[(step - CI) % tab.total] || []).forEach(function (e) { if (!e.rest) pluckNotes(e.notes, time, Math.min(1.8, e.len * 30 / m.bpm + 0.25)); });
    } });
    m.onVisual = function (step) {
      if (step < CI) { if (info && step % 2 === 0) info.textContent = '預備 ' + (4 - step / 2); return; }
      var k = (step - CI) % tab.total, evs = byStep[k];
      if (k === 0 && step > CI) loops++;
      if (!evs) return;
      $$('[data-ev],[data-nev]', root).forEach(function (g) { g.classList.toggle('now', +(g.getAttribute('data-ev') || g.getAttribute('data-nev')) === evs[0].i); });
      if (info) info.textContent = evs[0].rest ? '休止' : evs[0].notes.map(function (nt) { return nt.s + ' 弦 ' + nt.f + ' 格'; }).join('＋');
    };
    function stop() {
      if (!m.running) return;
      m.stop(); start.textContent = '開始';
      $$('[data-ev],[data-nev]', root).forEach(function (g) { g.classList.remove('now'); });
      if (info) info.textContent = '';
      var secs = Math.round((Date.now() - startedAt) / 1000);
      if (secs >= 5) report(root, 'interaction', { item: root.getAttribute('data-title') || '六線譜練習', result: m.bpm + ' BPM・' + secs + ' 秒・' + loops + ' 輪', value: m.bpm });
    }
    start.addEventListener('click', function () { if (m.running) return stop(); claim(stop); loops = 0; startedAt = Date.now(); if (m.start()) start.textContent = '停止'; });
  }

  /* ---------- 指板音名：點一下聽聲音 ----------
   * data-fretboard="naturals"（0–12 格自然音）或 "cscale"（第一把位 C 大調）或 "key:G"（某調音階 0–12 格）
   */
  var NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'], OPEN_PC = [4, 11, 7, 2, 9, 4]; // 1 弦到 6 弦
  var MAJOR = [0, 2, 4, 5, 7, 9, 11];
  $$('[data-fretboard]').forEach(function (root) {
    var mode = root.getAttribute('data-fretboard'), maxF = mode === 'cscale' ? 4 : 12, W = 900, x0 = 64, fw = (W - x0 - 20) / (maxF + 0.6);
    var keyPc = mode.indexOf('key:') === 0 ? NAMES.indexOf(mode.slice(4)) : 0;
    var inKey = function (pc) { return MAJOR.indexOf((pc - keyPc + 12) % 12) > -1; };
    var label = function (pc) { var n = NAMES[pc]; return keyPc && n.length > 1 ? n : n; };
    var s = '<svg class="gfig fretboard" viewBox="0 0 ' + W + ' 172" role="img" aria-label="指板音名，點選音符可以聽聲音">';
    s += '<rect x="' + x0 + '" y="14" width="' + (fw * (maxF + 0.5)) + '" height="130" class="wood-b"/><rect x="' + (x0 - 4) + '" y="14" width="6" height="130" class="nut"/>';
    for (var f = 1; f <= maxF; f++) s += '<line x1="' + (x0 + fw * f) + '" x2="' + (x0 + fw * f) + '" y1="14" y2="144" class="fr"/><text x="' + (x0 + fw * (f - 0.5)) + '" y="166" class="sl" style="text-anchor:middle">' + f + '</text>';
    [3, 5, 7, 9].forEach(function (f) { if (f <= maxF) s += '<circle cx="' + (x0 + fw * (f - 0.5)) + '" cy="79" r="5" class="inl"/>'; });
    if (maxF >= 12) s += '<circle cx="' + (x0 + fw * 11.5) + '" cy="53" r="5" class="inl"/><circle cx="' + (x0 + fw * 11.5) + '" cy="105" r="5" class="inl"/>';
    for (var st = 1; st <= 6; st++) {
      var y = 27 + (st - 1) * 21;
      s += '<line x1="' + x0 + '" x2="' + (x0 + fw * (maxF + 0.5)) + '" y1="' + y + '" y2="' + y + '" class="st" stroke-width="' + (0.8 + st * 0.3) + '"/><text x="' + (x0 - 40) + '" y="' + (y + 4) + '" class="sl">' + st + '</text>';
      for (f = 0; f <= maxF; f++) {
        var pc = (OPEN_PC[st - 1] + f) % 12;
        if (!inKey(pc)) continue;
        if (mode === 'cscale' && (st === 6 || (st === 5 && f < 3) || f > 3)) continue;
        var x = f === 0 ? x0 - 20 : x0 + fw * (f - 0.5);
        s += '<g class="nn' + (pc === keyPc ? ' on' : '') + '" data-s="' + st + '" data-f="' + f + '" tabindex="0" role="button" aria-label="' + st + ' 弦第 ' + f + ' 格 ' + NAMES[pc] + '"><circle cx="' + x + '" cy="' + y + '" r="10"/><text x="' + x + '" y="' + (y + 4) + '">' + label(pc) + '</text></g>';
      }
    }
    root.innerHTML = s + '</svg>';
    function hit(g) {
      var a = PS.audio.ctx(); if (!a) return;
      pluckNotes([{ s: +g.getAttribute('data-s'), f: +g.getAttribute('data-f') }], a.currentTime + 0.02, 1.4, 0.4);
      g.classList.add('hit'); setTimeout(function () { g.classList.remove('hit'); }, 300);
    }
    root.addEventListener('click', function (e) { var g = e.target.closest('.nn'); if (g) hit(g); });
    root.addEventListener('keydown', function (e) { var g = e.target.closest('.nn'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); hit(g); } });
  });

  /* ---------- 聽辨：和弦／刷法 ---------- */
  function earQuiz(root, opts) {
    var pool = opts.pool, cur = null, n = 0, ok = 0, answered = true;
    root.classList.add('ear');
    root.innerHTML = '<div class="ear-top"><button type="button" class="btn primary play">▶ 出題</button><button type="button" class="btn again" disabled>↻ 再聽一次</button><span class="ear-score">0 / 0</span></div>' +
      '<div class="ear-opts">' + pool.map(function (k) { return '<button type="button" class="btn" data-k="' + k + '" disabled>' + opts.label(k) + '</button>'; }).join('') + '</div><p class="ear-msg" aria-live="polite">' + opts.hint + '</p>';
    var msg = $('.ear-msg', root), score = $('.ear-score', root), again = $('.again', root);
    function enable(on) { $$('[data-k]', root).forEach(function (b) { b.disabled = !on; b.classList.remove('right', 'wrong'); }); }
    $('.play', root).addEventListener('click', function () {
      if (answered) { var next; do { next = pool[Math.floor(Math.random() * pool.length)]; } while (pool.length > 1 && next === cur); cur = next; }
      answered = false; opts.play(cur); enable(true); again.disabled = false; msg.textContent = '聆聽完畢之後，選出你的答案';
    });
    again.addEventListener('click', function () { if (cur) opts.play(cur); });
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-k]'); if (!b || answered) return;
      answered = true; n++;
      var right = b.getAttribute('data-k') === cur;
      if (right) ok++;
      $$('[data-k]', root).forEach(function (x) { x.disabled = true; if (x.getAttribute('data-k') === cur) x.classList.add('right'); });
      if (!right) b.classList.add('wrong');
      msg.textContent = right ? '答對了！按下「出題」繼續' : '答案是 ' + opts.label(cur) + '。按下「再聽一次」，仔細比較';
      score.textContent = ok + ' / ' + n;
      if (n % 5 === 0) report(root, 'quiz', { item: opts.name, result: ok + ' / ' + n, value: ok });
    });
  }
  PS.guitar.earQuiz = earQuiz;
  $$('[data-chord-ear]').forEach(function (root) {
    earQuiz(root, { name: '和弦聽辨', pool: root.getAttribute('data-chord-ear').split(/\s+/), label: function (k) { return CHORDS[k].name; },
      hint: root.getAttribute('data-hint') || '按下「出題」，聆聽一個和弦，分辨是哪一個。提示：小和弦聽起來比較暗淡。',
      play: function (k) { var a = PS.audio.ctx(); if (a) PS.audio.strum(CHORDS[k].frets, a.currentTime + 0.05, 'down', { duration: 2.4, gap: 0.035, volume: 0.2 }); } });
  });
  $$('[data-strum-ear]').forEach(function (root) {
    earQuiz(root, { name: '刷法聽辨', pool: root.getAttribute('data-strum-ear').split(/\s+/), label: function (k) { return PATTERNS[k].name; },
      hint: '按下「出題」，聆聽兩小節 C 和弦的刷法，選出對應的刷法。',
      play: function (k) {
        var a = PS.audio.ctx(); if (!a) return;
        var cells = PATTERNS[k].cells, per = cells.length / beatsOf(k), step = 60 / 76 / per, t0 = a.currentTime + 0.1;
        PATTERNS.__bass = cells.some(function (x) { return x === 'X' || x === 'Y'; });
        for (var r = 0; r < 2; r++) cells.forEach(function (c, i) {
          var t = t0 + (r * cells.length + i) * step;
          if (i % per === 0) PS.audio.click(t, i === 0 ? 2 : 1);
          strumCell(c, 'C', t, per, i % per === 0);
        });
      } });
  });

  /* ---------- 節奏遊戲（interact.js）：在節奏名稱下方加上五線譜 ---------- */
  var RG = { '四分音符': '4 4 4 4', '八分音符': '2 2 2 2 2 2 2 2', '附點節奏': '6 2 6 2', '切分音': '2 4 2 4 4',
    '前八後十六': '2 1 1 2 1 1 4 4', '反拍': 'r2 2 r2 2 r2 2 r2 2' };
  function rgSVG(name) {
    var seq = (RG[name] || '').split(' '), t = 0, evs = [];
    if (!RG[name]) return '';
    seq.forEach(function (x) { var rest = x[0] === 'r', len = +x.replace('r', ''); evs.push({ t: t, len: len, rest: rest, heads: rest ? [] : [{ pos: 5 }] }); t += len; });
    var r = notation(evs, { x: function (t) { return 14 + t * 52.6; }, beat: 4, up: true }), top = r.top - 6; // 對齊下方節拍時間軸
    return '<svg class="gfig notes rnote" viewBox="0 ' + top + ' 860 ' + (r.bot - top + 6) + '" role="img" aria-label="' + name + '的五線譜">' + staffLines(0, 860) + '<line x1="859" x2="859" y1="0" y2="40" class="nline"/>' + r.svg + '</svg>';
  }
  $$('.rhythm-game').forEach(function (g) {
    var head = $('.rg-head', g); if (!head) return;
    var box = el('div', { class: 'rg-staff' }); head.parentNode.insertBefore(box, head.nextSibling);
    function upd() { box.innerHTML = rgSVG(($('.rg-name', g) || {}).textContent || ''); }
    $('.rg-pats', g).addEventListener('click', function () { setTimeout(upd, 0); });
    upd();
  });

  /* ---------- 移調夾 Capo 計算器 ----------
   * 上半部：選指型與夾的格數，算出實際的調；下半部：選想彈的調，列出可用的指型與 Capo 位置
   */
  var KEYS12 = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
  function pcOf(name) { var b = name.replace(/m$/, ''); var i = KEYS12.indexOf(b); if (i < 0) i = ['C', 'Db', 'D', 'D#', 'E', 'F', 'Gb', 'G', 'G#', 'A', 'A#', 'B'].indexOf(b); return i; }
  $$('[data-capo]').forEach(function (root) {
    var shapes = (root.getAttribute('data-capo') || 'C G D A E Am Em').split(/\s+/), shape = shapes[0], capo = 2, target = 'E';
    root.classList.add('capo');
    root.innerHTML = '<div class="capo-a card"><div class="capo-row"><span class="field">我使用的指型</span><span class="seg-slot"></span></div>' +
      '<div class="capo-row"><label class="field">Capo 夾在第 <input type="range" min="0" max="9" value="2" aria-label="Capo 格數"><output>2</output> 格</label></div>' +
      '<div class="capo-out"><span>實際聽到的調性</span><b class="capo-key"></b><button type="button" class="btn small hear">▶ 試聽</button></div></div>' +
      '<div class="capo-b card"><div class="capo-row"><span class="field">歌手想唱的調性</span><span class="seg-slot2"></span></div><ul class="capo-list"></ul></div>';
    $('.seg-slot', root).appendChild(seg('指型', shapes.map(function (k) { return [k, k]; }), shape, function (v) { shape = v; upd(); }));
    $('.seg-slot2', root).appendChild(seg('目標調', ['C', 'D', 'E', 'F', 'G', 'A', 'Bb', 'B'].map(function (k) { return [k, k]; }), target, function (v) { target = v; upd(); }));
    var range = $('input', root), out = $('output', root);
    range.addEventListener('input', function () { capo = +range.value; out.textContent = capo; upd(); });
    function keyName(sh, cp) { var minor = /m$/.test(sh); return KEYS12[(pcOf(sh) + cp) % 12] + (minor ? 'm' : ''); }
    function upd() {
      $('.capo-key', root).textContent = keyName(shape, capo) + (capo ? '' : '（無移調夾）');
      var t = pcOf(target);
      $('.capo-list', root).innerHTML = ['C', 'G', 'D', 'A', 'E'].map(function (sh) {
        var cp = (t - pcOf(sh) + 12) % 12;
        return cp <= 7 ? '<li><b>' + sh + ' 指型</b>＋Capo 第 ' + cp + ' 格' + (cp === 0 ? '（無需移調夾）' : '') + (cp >= 6 ? '<small>　位置太高，聲音偏細</small>' : '') + '</li>' : '';
      }).join('');
    }
    $('.hear', root).addEventListener('click', function () {
      var a = PS.audio.ctx(), base = CHORDS[shape]; if (!a || !base) return;
      PS.audio.strum(base.frets.map(function (f) { return f < 0 ? -1 : f + capo; }), a.currentTime + 0.03, 'down', { duration: 2.2, gap: 0.03, volume: 0.2 });
    });
    upd();
  });

  /* ---------- 音程聽辨 ---------- */
  var INTERVALS = { m2: ['小二度', 1], M2: ['大二度', 2], m3: ['小三度', 3], M3: ['大三度', 4], P4: ['完全四度', 5], TT: ['增四／減五度', 6], P5: ['完全五度', 7], m6: ['小六度', 8], M6: ['大六度', 9], m7: ['小七度', 10], M7: ['大七度', 11], P8: ['完全八度', 12] };
  $$('[data-interval-ear]').forEach(function (root) {
    earQuiz(root, { name: '音程聽辨', pool: root.getAttribute('data-interval-ear').split(/\s+/), label: function (k) { return INTERVALS[k][0]; },
      hint: '按下「出題」，先聆聽兩個音一前一後，再同時發聲，分辨兩者的距離。',
      play: function (k) {
        var a = PS.audio.ctx(); if (!a) return;
        var r = Math.floor(Math.random() * 6), t = a.currentTime + 0.05, lo = [r, -1, -1, -1, -1, -1], hi = [r + INTERVALS[k][1], -1, -1, -1, -1, -1];
        PS.audio.strum(lo, t, 'down', { duration: 1, volume: 0.35 });
        PS.audio.strum(hi, t + 0.8, 'down', { duration: 1, volume: 0.35 });
        PS.audio.strum(lo, t + 1.8, 'down', { duration: 1.6, volume: 0.28 }); PS.audio.strum(hi, t + 1.8, 'down', { duration: 1.6, volume: 0.28 });
      } });
  });

  /* ---------- 和弦進行聽辨 ----------
   * data-prog-ear="C,G,Am,F|C,Am,F,G"；data-names="I–V–vi–IV|I–vi–IV–V" 可自訂按鈕文字
   */
  $$('[data-prog-ear]').forEach(function (root) {
    var groups = root.getAttribute('data-prog-ear').split('|'), names = (root.getAttribute('data-names') || '').split('|');
    earQuiz(root, { name: '和弦進行聽辨', pool: groups.map(function (g, i) { return String(i); }),
      label: function (k) { return names[+k] || groups[+k].split(',').join(' → '); },
      hint: '按下「出題」，聆聽四個和弦，選出對應的進行。先留意最後一個和弦是否「回家」。',
      play: function (k) {
        var a = PS.audio.ctx(); if (!a) return;
        groups[+k].split(',').forEach(function (ch, i) { PS.audio.strum(CHORDS[ch].frets, a.currentTime + 0.05 + i * 1.1, 'down', { duration: 1.2, gap: 0.03, volume: 0.18 }); });
      } });
  });
  /* ---------- 版面：投影片放不下時調整五線譜＋六線譜 ----------
   * 1. 刷法格上方的節奏譜依實際寬度繪製
   * 2. 六線譜先試著每行多放幾小節，仍放不下才等比例縮小；隱藏刷法說明，最後縮小節奏譜
   */
  function over(sl) { return sl.scrollHeight > sl.clientHeight + 1; }
  function layoutTabs(boxes, m) {
    boxes.forEach(function (b) {
      var nb = b._tab.bars.length, p = Math.min(nb, Math.ceil(b._p0 * m)), f = $('.tabfig', b);
      if (f._p !== p || f._key) { f._p = p; f._key = ''; f.innerHTML = tabSVG(b._tab, p); }
      f.firstChild.style.width = '';
    });
  }
  function dense(boxes, m) {
    return boxes.some(function (b) {
      var p = Math.min(b._tab.bars.length, Math.ceil(b._p0 * m)), most = Math.max.apply(null, b._tab.bars.map(function (x) { return x.reduce(function (a, e) { return a + e.len; }, 0); }));
      return (900 - 56) / p / Math.max(8, most) < 11; // 每個八分音符至少 11 單位寬
    });
  }
  function fitSlide(sl) {
    if (!sl) return;
    // 「揭曉」內容打開後也要放得下：量測時暫時展開
    var shut = $$('.reveal', sl).filter(function (r) { return !r.classList.contains('on'); });
    shut.forEach(function (r) { r.classList.add('on'); });
    fitInner(sl);
    shut.forEach(function (r) { r.classList.remove('on'); });
  }
  function fitInner(sl) {
    sl.classList.remove('gtight'); sl._rsc = 1;
    $$('.rnote-slot', sl).forEach(function (x) { paintRhythm(x, 1); });
    var boxes = $$('.tabbox', sl).filter(function (b) { return b._tab; });
    if (boxes.length) {
      var best = null, prevP = '';
      [1, 1.5, 2].forEach(function (m) {
        var ps = boxes.map(function (b) { return Math.min(b._tab.bars.length, Math.ceil(b._p0 * m)); }).join();
        if (m > 1 && (ps === prevP || dense(boxes, m))) return;
        prevP = ps;
        layoutTabs(boxes, m);
        var k = 100;
        while (k > 45 && over(sl)) { k -= 5; boxes.forEach(function (b) { $('.tabfig svg', b).style.width = k + '%'; }); }
        if (!best || k > best.k) best = { m: m, k: k };
      });
      layoutTabs(boxes, best.m);
      boxes.forEach(function (b) { $('.tabfig svg', b).style.width = best.k < 100 ? best.k + '%' : ''; });
    }
    if (over(sl)) sl.classList.add('gtight');
    [0.85, 0.7, 0.6, 0.5].forEach(function (sc) { if (over(sl) && $('.rnote-slot', sl)) { sl._rsc = sc; $$('.rnote-slot', sl).forEach(function (x) { paintRhythm(x, sc); }); } });
  }
  var mobile = window.matchMedia('(max-width:900px),(orientation:portrait) and (max-width:1100px)');
  function paintAll() {
    $$('.rnote-slot').forEach(function (x) { paintRhythm(x, 1); });
    // 手機：五線譜＋六線譜改用較窄的畫布，每行少放幾小節，字與音符才不會太小
    $$('.tabbox').forEach(function (b) {
      var f = $('.tabfig', b), cw = f && f.clientWidth; if (!b._tab || !cw) return;
      var W = cw < 700 ? Math.round(cw / 0.8) : 900, p = Math.max(1, Math.min(b._p0, Math.floor((W - 56) / 160))), key = W + ':' + p;
      if (f._key !== key) { f._key = key; f._p = p; f.innerHTML = tabSVG(b._tab, p, W); }
    });
  }
  document.addEventListener('slide:change', function (e) { if (e.detail && e.detail.mobile) paintAll(); else fitSlide($('.slide.active')); });
  var rz = 0; addEventListener('resize', function () { clearTimeout(rz); rz = setTimeout(function () { if (mobile.matches) paintAll(); }, 200); });
  if (mobile.matches || !$('.slide')) paintAll(); else fitSlide($('.slide.active'));
  // 講義頁：Markdown 載入後再掛上譜例
  PS.guitar.mount = function (scope) { $$('[data-pattern-grid]', scope).forEach(mountPattern); $$('[data-tab]', scope).forEach(mountTab); paintAll(); };
  PS.guitar.paint = paintAll;
})(window.PS = window.PS || {});
