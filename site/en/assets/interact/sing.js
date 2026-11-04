/* Pixel Studio 互動分塊：跟唱練習與旋律偵測（共用五線譜）（.scalepractice .staccato .melodyscope）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('sing', function (K) {
  'use strict';
  var LESSON = K.LESSON, LS = K.LS, $$ = K.$$, btn = K.btn, say = K.say, onLeave = K.onLeave, TOUCH = K.TOUCH, ac = K.ac, mic = K.mic, micStart = K.micStart, micStop = K.micStop, freqOf = K.freqOf, nameOf = K.nameOf;

  /* ---------- 跟唱練習：音階發聲（.scalepractice）與促音和弦（.staccato），不用麥克風 ----------
   * 男聲／女聲選起始音，拍速與半音可調；每輪前 4 拍預備（主和弦提示音高），可設定每輪自動升半音、輪換母音
   */
  var KEYN = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  var MAJ = [0, 2, 4, 5, 7, 9, 11], SOLFA = ['Do', 'Re', 'Mi', 'Fa', 'Sol', 'La', 'Si'], QUAL = ['', 'm', 'm', '', '', 'm', 'dim'], VOWELS = ['[a]', '[i]', '[u]', '[e]', '[o]'];
  function degMidi(start, k) { return start + 12 * Math.floor(k / 7) + MAJ[((k % 7) + 7) % 7]; }
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'], FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  function chordName(start, d) { var k = start % 12, names = [2, 4, 6, 7, 9, 11].indexOf(k) > -1 ? SHARP : FLAT; return names[(start + MAJ[d]) % 12] + QUAL[d]; } // 升記號調用升名、降記號調用降名
  /* 五線譜：高音譜號（男聲用低八度高音譜號，譜號下標 8），依調號畫升降記號，音符以 E4（第一線）為基準計算位置 */
  var KEY_LETTER = [0, 1, 1, 2, 2, 3, 3, 4, 5, 5, 6, 6], KEY_SIG = { 0: 0, 7: 1, 2: 2, 9: 3, 4: 4, 11: 5, 6: 6, 5: -1, 10: -2, 3: -3, 8: -4, 1: -5 };
  var SHARP_POS = [8, 5, 9, 6, 3, 7, 4], FLAT_POS = [4, 7, 3, 6, 2, 5, 1];
  function tonicStep(start, male) { var w = start + (male ? 12 : 0); return KEY_LETTER[start % 12] + 7 * (Math.floor(w / 12) - 1) - 30; }
  // notes: [{ s: 譜表位置（E4=0，每格 1）, len: 'q'|'e'|'w' }]；groups：要連桁的八分音符索引；bars：在哪個音之後畫小節線
  function staffSVG(notes, start, male, groups, bars, opt) {
    opt = opt || {};
    var Y = function (st) { return 70 - st * 5; }, ks = KEY_SIG[start % 12], n = Math.abs(ks), slots = opt.slots || notes.length;
    var x0 = 44 + n * 9 + 8, dx = Math.max(26, Math.min(40, 560 / slots)), W = x0 + slots * dx + 14, h = '';
    for (var l = 0; l <= 8; l += 2) h += '<line class="sf-l" x1="2" x2="' + (W - 4) + '" y1="' + Y(l) + '" y2="' + Y(l) + '"/>';
    h += '<text class="sf-clef" x="4" y="' + Y(2) + '">𝄞</text>' + (male ? '<text class="sf-8" x="15" y="' + (Y(-3) + 9) + '">8</text>' : '');
    for (var i = 0; i < n; i++) { var pos = ks > 0 ? SHARP_POS[i] : FLAT_POS[i]; h += '<text class="sf-acc" x="' + (40 + i * 9) + '" y="' + (Y(pos) + (ks > 0 ? 5 : 3)) + '">' + (ks > 0 ? '♯' : '♭') + '</text>'; }
    var xs = notes.map(function (_, i) { return x0 + i * dx + dx / 2; });
    var inGroup = {}; (groups || []).forEach(function (g) { var avg = g.reduce(function (a, k) { return a + notes[k].s; }, 0) / g.length, up = avg < 4; g.forEach(function (k) { inGroup[k] = { g: g, up: up }; }); });
    notes.forEach(function (nt, i) {
      var x = xs[i], y = Y(nt.s), up = inGroup[i] ? inGroup[i].up : nt.s < 4, led = '';
      for (var a = -2; a >= nt.s; a -= 2) led += '<line class="sf-l" x1="' + (x - 9) + '" x2="' + (x + 9) + '" y1="' + Y(a) + '" y2="' + Y(a) + '"/>';
      for (var b = 10; b <= nt.s; b += 2) led += '<line class="sf-l" x1="' + (x - 9) + '" x2="' + (x + 9) + '" y1="' + Y(b) + '" y2="' + Y(b) + '"/>';
      var head = nt.len === 'w' || nt.len === 'h' ? '<ellipse class="sf-open" cx="' + x + '" cy="' + y + '" rx="6.4" ry="4.4" transform="rotate(-20 ' + x + ' ' + y + ')"/>' : '<ellipse cx="' + x + '" cy="' + y + '" rx="5.6" ry="4" transform="rotate(-20 ' + x + ' ' + y + ')"/>';
      var stem = '', sx = up ? x + 5.2 : x - 5.2;
      if (nt.len !== 'w') {
        var tip = up ? y - 30 : y + 30;
        if (inGroup[i]) { var g = inGroup[i].g, ends = g.map(function (k) { return Y(notes[k].s); }); tip = up ? Math.min.apply(null, ends) - 28 : Math.max.apply(null, ends) + 28; }
        stem = '<line class="sf-stem" x1="' + sx + '" x2="' + sx + '" y1="' + y + '" y2="' + tip + '"/>';
        if (nt.dot) stem += '<circle cx="' + x + '" cy="' + (up ? y + 9 : y - 9) + '" r="1.8"/>';
      }
      var acc = nt.acc ? '<text class="sf-acc" x="' + (x - 17) + '" y="' + (y + (nt.acc === '♭' ? 3 : 5)) + '">' + nt.acc + '</text>' : '';
      var jp = '';
      if (opt.jp && nt.jp) { // 簡譜：數字、臨時記號，高低八度用上下圓點
        jp = '<text class="sf-jp" x="' + x + '" y="134">' + (nt.jp.acc || '') + nt.jp.d + '</text>';
        for (var o = 1; o <= Math.abs(nt.jp.oct); o++) jp += '<circle class="sf-jpd" cx="' + (x + (nt.jp.acc ? 3 : 0)) + '" cy="' + (nt.jp.oct > 0 ? 116 - (o - 1) * 5 : 140 + o * 5) + '" r="1.9"/>';
      }
      h += '<g class="sn" data-i="' + i + '">' + led + acc + head + stem + jp + '</g>';
    });
    (groups || []).forEach(function (g) { var a = g[0], b = g[g.length - 1], up = inGroup[a].up, ends = g.map(function (k) { return Y(notes[k].s); }), tip = up ? Math.min.apply(null, ends) - 28 : Math.max.apply(null, ends) + 28, x1 = xs[a] + (up ? 5.2 : -5.2), x2 = xs[b] + (up ? 5.2 : -5.2); h += '<line class="sf-beam" x1="' + x1 + '" x2="' + x2 + '" y1="' + tip + '" y2="' + tip + '"/>'; });
    (bars || []).forEach(function (k) { var bx = xs[k] + dx / 2; h += '<line class="sf-bar" x1="' + bx + '" x2="' + bx + '" y1="' + Y(8) + '" y2="' + Y(0) + '"/>'; });
    if (!opt.open) h += '<line class="sf-bar" x1="' + (W - 8) + '" x2="' + (W - 8) + '" y1="' + Y(8) + '" y2="' + Y(0) + '"/><line class="sf-end" x1="' + (W - 4) + '" x2="' + (W - 4) + '" y1="' + Y(8) + '" y2="' + Y(0) + '"/>';
    return '<svg viewBox="0 -8 ' + W + ' ' + (opt.jp ? 160 : 116) + '" role="img" aria-label="' + (opt.jp ? 'Staff and numbered notation' : 'Staff') + '">' + h + '</svg>';
  }
  function practice(p, kind) {
    var isScale = kind === 'scale', key = kind + '-' + LESSON;
    var RANGE = { male: [40, 57], female: [52, 69] }, DEF = { male: 48, female: 60 };
    var st = LS.get(key, null) || { voice: 'male', start: 48, bpm: 70, vowel: 0, rotate: true, up: isScale, loop: true, click: true, back: false, rec: 0 };
    var ctx = null, master = null, events = [], t0 = 0, raf = 0, timer = 0, round = 0, cur = -1, playing = false, pend = null;
    function opts() { var r = RANGE[st.voice], h = ''; for (var m = r[0]; m <= r[1]; m++) h += '<option value="' + m + '"' + (m === st.start ? ' selected' : '') + '>' + nameOf(m).name + ' (' + KEYN[m % 12] + ' )</option>'; return h; }
    p.innerHTML = '<div class="pr-ctrl">' +
      '<div class="pr-seg voice"><button type="button" class="btn" data-v="male">Male voice</button><button type="button" class="btn" data-v="female">Female voice</button></div>' +
      '<label class="pr-f">Starting note<select class="start"></select></label>' +
      '<div class="pr-f">Pitch<span class="pr-step"><button type="button" class="btn dn">− semitone</button><button type="button" class="btn upk">＋ semitone</button></span></div>' +
      '<div class="pr-f">Tempo<span class="pr-step"><button type="button" class="btn bdn">−5</button><b class="bpm"></b><button type="button" class="btn bup">＋5</button></span></div></div>' +
      '<div class="pr-ctrl pr-opt"><span class="pr-vowels">' + VOWELS.map(function (v, i) { return '<button type="button" class="btn vw" data-i="' + i + '">' + v + '</button>'; }).join('') + '</span>' +
      '<label><input type="checkbox" class="o-rotate"> Change vowel each round</label><label><input type="checkbox" class="o-up"> Up a semitone each round</label><label><input type="checkbox" class="o-loop"> Keep going</label><label><input type="checkbox" class="o-click"> Click track</label>' +
      (isScale ? '' : '<label><input type="checkbox" class="o-back"> Come back down after the chords</label>') + '</div>' +
      '<div class="pr-now"><div class="pr-big">--</div><div class="pr-sub"></div></div>' +
      (isScale ? '' : '<div class="pr-chords"></div>') + '<div class="pr-staff"></div><div class="pr-cells"></div>' +
      '<div class="btn-row pr-run"><button type="button" class="btn primary go">▶︎ Start singing along</button>' + (isScale ? '' : '<button type="button" class="btn pass">Nailed it +5 Bpm</button><span class="pr-rec"></span>') + '<span class="pr-msg muted"></span></div>';
    var sel = p.querySelector('.start'), big = p.querySelector('.pr-big'), sub = p.querySelector('.pr-sub'), cells = p.querySelector('.pr-cells'), staffEl = p.querySelector('.pr-staff'), shownChord = -1, chordsEl = p.querySelector('.pr-chords'), msg = p.querySelector('.pr-msg'), go = p.querySelector('.go');
    function save() { LS.set(key, st); }
    function chordOrder() { var up = [0, 1, 2, 3, 4, 5, 6]; return st.back ? up.concat([5, 4, 3, 2, 1, 0]) : up; }
    var SCALE_DEG = [0, 1, 2, 3, 4, 5, 6, 7, 7, 6, 5, 4, 3, 2, 1, 0], ST_PAT = [0, 2, 4, 2, 0, 2, 4, 2];
    var staffKey = null;
    function drawStaff(ci) {
      var male = st.voice === 'male', ts = tonicStep(st.start, male);
      if (isScale) { staffEl.innerHTML = staffSVG(SCALE_DEG.map(function (k, i) { return { s: ts + k, len: i === SCALE_DEG.length - 1 ? 'w' : 'q' }; }), st.start, male, [], [3, 7, 11]); staffKey = st.start; }
      else { var d = chordOrder()[ci || 0]; staffEl.innerHTML = staffSVG(ST_PAT.map(function (o) { return { s: ts + d + o, len: 'e', dot: true }; }).concat([{ s: ts + d, len: 'q', dot: true }]), st.start, male, [[0, 1, 2, 3], [4, 5, 6, 7]], [7]); }
      shownChord = ci || 0;
    }
    function jian(k) { return (k % 7 + 1) + (k >= 7 ? '̇' : ''); }
    function paintStatic() {
      $$('.voice .btn', p).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-v') === st.voice); });
      sel.innerHTML = opts(); p.querySelector('.bpm').textContent = st.bpm + ' Bpm';
      $$('.vw', p).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-i') === st.vowel); });
      ['rotate', 'up', 'loop', 'click', 'back'].forEach(function (o) { var c = p.querySelector('.o-' + o); if (c) c.checked = !!st[o]; });
      if (isScale) cells.innerHTML = SCALE_DEG.map(function (k, i) { var last = i === SCALE_DEG.length - 1; return '<span class="pr-cell' + (last ? ' hold' : '') + '" data-i="' + i + '"><b>' + jian(k) + '</b><small>' + SOLFA[k % 7] + (last ? ' · 4 beats' : '') + '</small></span>'; }).join('');
      else {
        chordsEl.innerHTML = chordOrder().map(function (d, i) { return '<span class="pr-chip" data-i="' + i + '">' + chordName(st.start, d) + '</span>'; }).join('');
        cells.innerHTML = ST_PAT.map(function (o, i) { return '<span class="pr-cell sm" data-i="' + i + '"><b>' + ['1', '', '3', '', '5'][o] + '</b></span>'; }).join('') + '<span class="pr-cell sm root" data-i="8"><b>1</b></span><span class="pr-cell sm pr-breath" data-i="9"><b>In</b></span>';
        var r = p.querySelector('.pr-rec'); if (r) r.textContent = st.rec ? 'Class record ' + st.rec + ' Bpm' : 'Class record: none yet';
      }
      if (!playing) drawStaff(0);
      if (!playing) { big.textContent = KEYN[st.start % 12] + ' key'; sub.textContent = 'Starting note ' + nameOf(st.start).name + '・' + st.bpm + ' Bpm · vowel ' + VOWELS[st.vowel] + '　Press "Start singing along" and listen to the 4-beat count-in first'; }
    }
    function changed() { save(); paintStatic(); if (playing) { pend = true; msg.textContent = 'Settings apply from the next round'; } }
    // 聲音：鋼琴感的撥弦音與節拍聲，全部接到 master，停止時一次切斷
    function note(m, t, dur, vol) {
      var o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), f = freqOf(m);
      o.type = 'triangle'; o.frequency.value = f; o2.type = 'sine'; o2.frequency.value = f * 2;
      var g2 = ctx.createGain(); g2.gain.value = 0.25; o2.connect(g2); g2.connect(g); o.connect(g); g.connect(master);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.008); g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
      o.start(t); o2.start(t); o.stop(t + dur + 0.05); o2.stop(t + dur + 0.05);
    }
    function click(t, acc) {
      var o = ctx.createOscillator(), g = ctx.createGain(); o.frequency.value = acc ? 1500 : 1000;
      g.gain.setValueAtTime(acc ? 0.22 : 0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      o.connect(g); g.connect(master); o.start(t); o.stop(t + 0.06);
    }
    function build() { // 回傳一輪的事件（單位：拍）
      var ev = [], s = st.start, b = 0;
      var triad = [degMidi(s, 0), degMidi(s, 2), degMidi(s, 4)];
      // 音階連續練習：第一輪有 4 拍預備；之後由上一輪最後的全音符當預備拍，直接接新的音階
      var prep = !(isScale && st.loop && round > 0);
      if (prep) { for (var i = 0; i < 4; i++) ev.push({ b: i, kind: 'prep', n: 4 - i, chord: i === 0 ? triad : null }); b = 4; }
      if (isScale) {
        var endBeats = 4; // 最後的 1 唱滿四拍（全音符）；連續練習時這四拍就是下一輪的預備拍
        SCALE_DEG.forEach(function (k, i) { ev.push({ b: b, kind: 'note', m: degMidi(s, k), dur: i === SCALE_DEG.length - 1 ? endBeats : 1, cell: i, k: k }); b += 1; });
        b += endBeats - 1;
      } else {
        var order = chordOrder();
        order.forEach(function (d, ci) {
          ST_PAT.forEach(function (o, i) { ev.push({ b: b + i * 0.5, kind: 'note', m: degMidi(s, d + o), dur: 0.18, cell: i, chord: ci, d: d, k: d + o, stac: true }); });
          ev.push({ b: b + 4, kind: 'note', m: degMidi(s, d), dur: 0.22, cell: 8, chord: ci, d: d, k: d, stac: true });
          var nx = order[ci + 1];
          ev.push({ b: b + 5, kind: 'breath', cell: 9, chord: ci, d: d, cue: nx === undefined ? null : [degMidi(s, nx), degMidi(s, nx + 2), degMidi(s, nx + 4)], cueAt: b + 6 });
          b += 8;
        });
      }
      return { ev: ev, beats: b, from: prep ? 4 : 0 };
    }
    var roundEnd = 0;
    function schedule(at) { // at：上一輪的結束時間，讓下一輪無縫接上、拍子不漂移
      var r = build(), spb = 60 / st.bpm, start = at && at > ctx.currentTime + 0.02 ? at : ctx.currentTime + 0.12;
      events = r.ev.map(function (e) { var x = {}; for (var k in e) x[k] = e[k]; x.t = start + e.b * spb; return x; });
      events.forEach(function (e) {
        if (e.kind === 'prep') { click(e.t, e.n === 4); if (e.chord) e.chord.forEach(function (m) { note(m, e.t, spb * 2.2, 0.16); }); }
        if (e.kind === 'note') { note(e.m, e.t, e.stac ? Math.min(spb * e.dur * 2, 0.22) : spb * e.dur * 0.95, e.stac ? 0.3 : 0.26); }
        if (e.kind === 'breath' && e.cue) e.cue.forEach(function (m) { note(m, start + e.cueAt * spb, spb * 1.2, 0.1); });
      });
      if (st.click) for (var bt = r.from; bt < r.beats; bt++) click(start + bt * spb, (bt - r.from) % 4 === 0);
      t0 = start; roundEnd = start + r.beats * spb;
      var endMs = (roundEnd - ctx.currentTime) * 1000 - 250; // 提前排程下一輪
      clearTimeout(timer); timer = setTimeout(nextRound, Math.max(0, endMs));
    }
    function nextRound() {
      if (!playing) return;
      if (!st.loop) { clearTimeout(timer); timer = setTimeout(function () { if (playing) stop('Practice complete'); }, Math.max(0, (roundEnd - ctx.currentTime) * 1000)); return; }
      if (st.up) { if (st.start < RANGE[st.voice][1]) st.start++; else { clearTimeout(timer); timer = setTimeout(function () { if (playing) stop('That\'s the highest starting note. Press "− semitone" to come back down and practise again'); }, Math.max(0, (roundEnd - ctx.currentTime) * 1000)); return; } }
      if (st.rotate) st.vowel = (st.vowel + 1) % VOWELS.length;
      round++; pend = false; msg.textContent = ''; save(); paintStatic(); schedule(roundEnd);
    }
    function frame() {
      var now = ctx.currentTime, idx = -1;
      for (var i = 0; i < events.length; i++) if (events[i].t <= now) idx = i; else break;
      if (idx === cur || idx < 0) return; cur = idx;
      var e = events[idx];
      $$('.pr-cell', cells).forEach(function (c) { c.classList.remove('on'); });
      $$('.sn', staffEl).forEach(function (c) { c.classList.remove('on'); });
      if (!isScale && e.kind !== 'prep' && e.chord !== shownChord) drawStaff(e.chord);
      if (isScale && e.kind === 'note' && e.cell === 0 && staffKey !== st.start) drawStaff(0); // 新的一輪（可能已升半音）開始時更新五線譜
      if (e.kind === 'prep') { if (shownChord !== 0 || round) drawStaff(0); big.textContent = 'Count-in ' + e.n; sub.textContent = 'Round ' + (round + 1) + ' · ' + KEYN[st.start % 12] + ' key · starting note ' + nameOf(st.start).name + ' · vowel ' + VOWELS[st.vowel] + (e.n === 4 ? '　Breathe in' : ''); if (chordsEl) $$('.pr-chip', chordsEl).forEach(function (c) { c.classList.remove('on', 'done'); }); return; }
      var cell = cells.querySelector('[data-i="' + e.cell + '"]'); if (cell) cell.classList.add('on');
      var sn = staffEl.querySelector('.sn[data-i="' + e.cell + '"]'); if (sn) sn.classList.add('on');
      if (isScale) { big.textContent = SOLFA[e.k % 7] + '　' + nameOf(e.m).name; sub.textContent = 'Vowel ' + VOWELS[st.vowel] + '・' + (e.cell < 8 ? 'Going up' : e.cell === 8 ? 'Sing the high 1 again and get ready to come down' : e.cell === SCALE_DEG.length - 1 ? (st.loop ? 'Coming down · hold the full four beats, then go straight into the next round' : 'Coming down · hold the full four beats') : 'Coming down') + ' · Round ' + (round + 1); }
      else {
        $$('.pr-chip', chordsEl).forEach(function (c, i) { c.classList.toggle('on', i === e.chord); c.classList.toggle('done', i < e.chord); });
        if (e.kind === 'breath') { big.textContent = 'In'; sub.textContent = e.cue ? 'Next chord: ' + chordName(st.start, chordOrder()[e.chord + 1]) : 'Last chord. Get ready for the next round'; }
        else { big.textContent = chordName(st.start, e.d) + '　' + nameOf(e.m).name; sub.textContent = 'Vowel ' + VOWELS[st.vowel] + ' · short, quick, strong ' + (round + 1) + ' round'; }
      }
    }
    function start() {
      ctx = ac(); master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
      playing = true; round = 0; go.textContent = '■ Stop'; msg.textContent = ''; p.classList.add('playing');
      schedule(); raf = setInterval(frame, 25);
    }
    function stop(m) {
      playing = false; clearTimeout(timer); clearInterval(raf);
      if (master) { try { master.gain.setValueAtTime(0, ctx.currentTime); master.disconnect(); } catch (e) {} master = null; }
      go.textContent = '▶︎ Start singing along'; p.classList.remove('playing'); msg.textContent = m || '';
      $$('.pr-cell', cells).forEach(function (c) { c.classList.remove('on'); }); paintStatic();
    }
    go.onclick = function () { playing ? stop() : start(); };
    $$('.voice .btn', p).forEach(function (b) { b.onclick = function () { st.voice = b.getAttribute('data-v'); st.start = DEF[st.voice]; changed(); }; });
    sel.onchange = function () { st.start = +sel.value; changed(); };
    p.querySelector('.dn').onclick = function () { st.start = Math.max(RANGE[st.voice][0], st.start - 1); changed(); };
    p.querySelector('.upk').onclick = function () { st.start = Math.min(RANGE[st.voice][1], st.start + 1); changed(); };
    p.querySelector('.bdn').onclick = function () { st.bpm = Math.max(40, st.bpm - 5); changed(); };
    p.querySelector('.bup').onclick = function () { st.bpm = Math.min(160, st.bpm + 5); changed(); };
    $$('.vw', p).forEach(function (b) { b.onclick = function () { st.vowel = +b.getAttribute('data-i'); changed(); }; });
    ['rotate', 'up', 'loop', 'click', 'back'].forEach(function (o) { var c = p.querySelector('.o-' + o); if (c) c.onchange = function () { st[o] = c.checked; changed(); }; });
    var pass = p.querySelector('.pass');
    if (pass) pass.onclick = function () { if (st.bpm > (st.rec || 0)) st.rec = st.bpm; st.bpm = Math.min(160, st.bpm + 5); changed(); say('Next round ' + st.bpm + ' Bpm', 'ok'); };
    paintStatic(); onLeave(p, function () { if (playing) stop(); });
  }
  $$('.scalepractice').forEach(function (p) { practice(p, 'scale'); });
  $$('.staccato').forEach(function (p) { practice(p, 'staccato'); });

  /* ---------- 旋律偵測：即時偵測影片旋律的音高，畫成五線譜＋簡譜 ----------
   * YouTube 嵌入框的聲音網頁無法直接讀取，所以收音來源：
   *   分頁音訊（電腦版 Chrome／Edge，分享本分頁並勾選分享音訊，取得原始聲音）或 麥克風（收喇叭播出的聲音）
   * 從整首混音中抓最突出的旋律（通常是人聲），經帶通濾波、清晰度門檻與連續穩定判斷後成為音符，再依調號換算唱名
   * data-tonic：主音 MIDI（例 56 = A♭3）；data-phase：分段計時進入第幾段時自動啟動（預設第 1 段）
   */
  function fftMag(re) { // radix-2 FFT，回傳振幅（長度 n/2）
    var n = re.length, im = new Float64Array(n), i, j, k, l;
    for (i = 1, j = 0; i < n; i++) { var bit = n >> 1; for (; j & bit; bit >>= 1) j ^= bit; j ^= bit; if (i < j) { var t = re[i]; re[i] = re[j]; re[j] = t; } }
    for (l = 2; l <= n; l <<= 1) { var ang = -2 * Math.PI / l, wr = Math.cos(ang), wi = Math.sin(ang); for (i = 0; i < n; i += l) { var cr = 1, ci = 0; for (k = 0; k < l / 2; k++) { var a = i + k, b = a + l / 2, xr = re[b] * cr - im[b] * ci, xi = re[b] * ci + im[b] * cr; re[b] = re[a] - xr; im[b] = im[a] - xi; re[a] += xr; im[a] += xi; var nr = cr * wr - ci * wi; ci = cr * wi + ci * wr; cr = nr; } } }
    var m = new Float64Array(n / 2); for (i = 0; i < n / 2; i++) m[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]); return m;
  }
  var HANN = {};
  function melodyPitch(L, R, sr, LO, HI) { // L、R：左右聲道（單聲道時 R 為 null）
    var n = L.length, w = HANN[n] || (HANN[n] = (function () { var a = new Float64Array(n); for (var i = 0; i < n; i++) a[i] = 0.5 - 0.5 * Math.cos(2 * Math.PI * i / (n - 1)); return a; })());
    var mid = new Float64Array(n), side = R ? new Float64Array(n) : null, rms = 0, i;
    for (i = 0; i < n; i++) { var l = L[i], r = R ? R[i] : l; mid[i] = (l + r) * 0.5 * w[i]; if (side) side[i] = (l - r) * 0.5 * w[i]; rms += mid[i] * mid[i]; }
    if (Math.sqrt(rms / n) < 0.003) return null;
    var mag = fftMag(mid), sm = side ? fftMag(side) : null, bin = sr / n;
    for (i = 0; i < mag.length; i++) mag[i] = Math.sqrt(Math.max(0, mag[i] - (sm ? 0.9 * sm[i] : 0))); // 減去兩側、壓縮動態
    function at(f) { var k = Math.round(f / bin); if (k < 1 || k >= mag.length - 1) return 0; return Math.max(mag[k - 1] * 0.6, mag[k], mag[k + 1] * 0.6); }
    var best = 0, bm = null, sum = 0, cnt = 0;
    for (var m = LO; m <= HI; m += 0.2) {
      var f = 440 * Math.pow(2, (m - 69) / 12), s = 0;
      for (var h = 1; h <= 10; h++) s += Math.pow(0.82, h - 1) * at(f * h);
      s -= 0.35 * at(f * 0.5) + 0.2 * at(f * 1.5); // 壓低半音高、1.5 倍的誤判
      sum += s; cnt++; if (s > best) { best = s; bm = m; }
    }
    if (!cnt || best < (sum / cnt) * 1.8) return null;
    // 八度校正：伴奏常在低八度彈同一個音，若基頻比高八度弱，旋律其實在高八度
    function sal(mm) { var ff = 440 * Math.pow(2, (mm - 69) / 12), t = 0; for (var h = 1; h <= 10; h++) t += Math.pow(0.82, h - 1) * at(ff * h); return t; }
    while (bm + 12 <= HI) { var f0 = 440 * Math.pow(2, (bm - 69) / 12); if (at(f0) < 0.75 * at(f0 * 2) && sal(bm + 12) >= 0.45 * best) bm += 12; else break; }
    return { m: bm, c: best / (sum / cnt) };
  }
  var JP_CHROM = { 0: [1, ''], 1: [1, '♯'], 2: [2, ''], 3: [3, '♭'], 4: [3, ''], 5: [4, ''], 6: [4, '♯'], 7: [5, ''], 8: [5, '♯'], 9: [6, ''], 10: [7, '♭'], 11: [7, ''] };
  $$('.melodyscope').forEach(function (p) {
    var tonic = parseInt(p.getAttribute('data-tonic') || '60', 10), male = p.getAttribute('data-voice') !== 'female', want = parseInt(p.getAttribute('data-phase') || '0', 10);
    var LO = 43, HI = 79, SLOTS = 12, key = 'melodyscope-src', canTab = !!(navigator.mediaDevices && navigator.mediaDevices.getDisplayMedia) && !TOUCH;
    var src = LS.get(key, canTab ? 'tab' : 'mic'); if (!canTab) src = 'mic';
    var stream = null, usingMic = false, anL = null, anR = null, nodes = [], tid = 0, bufL = null, bufR = null, recent = [], notes = [], curM = null, stable = 0, silent = 0, live = null, starting = false, lastPhase = '';
    var base = tonic, keyKey = 'melodyscope-key-' + LESSON, savedPc = LS.get(keyKey, null);
    function tonicFor(pc) { var t = base - (((base - pc) % 12) + 12) % 12; if (base - t > 6) t += 12; return t; } // 主音取原設定附近的八度
    if (savedPc !== null) tonic = tonicFor(savedPc);
    p.innerHTML = '<div class="ms-head"><b>Melody detector</b><label class="ms-key muted">Movable do: 1 = <select class="ms-keysel">' + KEYN.map(function (k, i) { return '<option value="' + i + '">' + k + '</option>'; }).join('') + '</select></label><span class="ms-btns">' +
      (canTab ? '<span class="pr-seg ms-src"><button type="button" class="btn" data-s="tab">Tab audio</button><button type="button" class="btn" data-s="mic">Microphone</button></span>' : '') +
      '<button type="button" class="btn primary go">● Start detecting</button><button type="button" class="btn clear">Clear</button></span></div>' +
      '<div class="ms-now"><b class="ms-big">--</b><span class="ms-sub muted"></span></div><div class="pr-staff ms-staff"></div><p class="ms-state muted"></p>';
    var keySel = p.querySelector('.ms-keysel'); keySel.value = String(tonic % 12);
    keySel.onchange = function () { tonic = tonicFor(+keySel.value); LS.set(keyKey, +keySel.value); draw(); if (curM !== null) { big.textContent = label(curM); sub.textContent = solf(curM); } };
    var staff = p.querySelector('.ms-staff'), big = p.querySelector('.ms-big'), sub = p.querySelector('.ms-sub'), state = p.querySelector('.ms-state'), go = p.querySelector('.go');
    function jpOf(m) { var semis = Math.round(m) - tonic, oct = Math.floor(semis / 12), pc = ((semis % 12) + 12) % 12, c = JP_CHROM[pc]; return { d: c[0], acc: c[1], oct: oct }; }
    function stepOf(m) { var jp = jpOf(m); return tonicStep(tonic, male) + jp.oct * 7 + (jp.d - 1); }
    function draw() {
      var shown = notes.slice(-SLOTS);
      staff.innerHTML = staffSVG(shown.map(function (m) { var jp = jpOf(m); return { s: stepOf(m), len: 'q', acc: jp.acc, jp: jp }; }), tonic, male, [], [], { slots: SLOTS, jp: true, open: true });
      var last = staff.querySelector('.sn[data-i="' + (shown.length - 1) + '"]'); if (last && curM !== null) last.classList.add('on');
    }
    function label(m) { var jp = jpOf(m); return (jp.acc || '') + jp.d + (jp.oct > 0 ? '̇'.repeat(jp.oct) : jp.oct < 0 ? '̣'.repeat(-jp.oct) : ''); }
    function solf(m) { var jp = jpOf(m); return (jp.acc === '♯' ? 'sharp ' : jp.acc === '♭' ? 'flat ' : '') + SOLFA[jp.d - 1]; }
    function frame() {
      anL.getFloatTimeDomainData(bufL); if (anR) anR.getFloatTimeDomainData(bufR);
      var r = melodyPitch(bufL, anR ? bufR : null, ac().sampleRate, LO, HI), m = r ? r.m : null;
      recent.push(m); if (recent.length > 5) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      var med = ok.length >= 3 ? ok[ok.length >> 1] : null;
      if (med === null) { silent++; if (silent > 6) { curM = null; stable = 0; big.textContent = '--'; sub.textContent = 'Waiting for a melody…'; } return; }
      silent = 0; live = med;
      var q = Math.round(med);
      big.textContent = label(q); sub.textContent = solf(q) + ' (movable do, 1 = ' + KEYN[tonic % 12] + ')';
      if (curM !== null && Math.abs(med - curM) < 0.6) { stable = 0; return; } // 仍在同一個音
      stable++;
      if (stable >= 3) { curM = q; stable = 0; notes.push(q); if (notes.length > 200) notes.shift(); draw(); } // 約 120ms 穩定才算新音
    }
    function setSrc(v) { src = v; LS.set(key, v); $$('.ms-src .btn', p).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-s') === v); }); }
    function connect(s, isMic) {
      var c = ac(), node = c.createMediaStreamSource(s), hp = c.createBiquadFilter(), sp = c.createChannelSplitter(2);
      hp.type = 'highpass'; hp.frequency.value = 80; hp.channelCountMode = 'max'; hp.channelInterpretation = 'discrete';
      anL = c.createAnalyser(); anL.fftSize = 8192; bufL = new Float32Array(8192);
      var stereo = !isMic && s.getAudioTracks()[0] && (s.getAudioTracks()[0].getSettings().channelCount || 2) > 1;
      node.connect(hp); hp.connect(sp); sp.connect(anL, 0); nodes = [node, hp, sp];
      if (stereo) { anR = c.createAnalyser(); anR.fftSize = 8192; bufR = new Float32Array(8192); sp.connect(anR, 1); } else anR = null;
      usingMic = isMic; recent = []; curM = null; stable = 0; silent = 0;
      clearInterval(tid); tid = setInterval(frame, 40);
      go.textContent = '■ Stop detecting'; p.classList.add('on');
      state.textContent = isMic ? 'Using the microphone to pick up the speakers: turn the speakers up a bit and keep the mic close to them' : 'Reading the video sound from this tab';
    }
    function start(auto) {
      if (tid || starting) return; // 分享視窗開著時不再重複要求
      if (src === 'tab' && canTab) {
        if (stream && stream.getAudioTracks().length && stream.getAudioTracks()[0].readyState === 'live') { connect(stream, false); return; }
        starting = true; state.textContent = 'In the browser window, choose this tab and tick "Share tab audio"';
        navigator.mediaDevices.getDisplayMedia({ video: true, audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false }, preferCurrentTab: true, selfBrowserSurface: 'include', systemAudio: 'include' })
          .then(function (s) {
            starting = false;
            s.getVideoTracks().forEach(function (t) { t.stop(); });
            if (!s.getAudioTracks().length) { state.textContent = 'No sound received. Start again, choose this tab and tick "Share tab audio", or switch to the microphone'; return; }
            stream = s; s.getAudioTracks()[0].onended = function () { release(); state.textContent = 'Stopped sharing tab audio'; };
            connect(s, false);
          })
          .catch(function () { starting = false; state.textContent = 'Sharing cancelled. Press "Start detecting" when you\'re ready, or press "Microphone" to pick up the speakers'; });
        return;
      }
      starting = true;
      micStart().then(function () { starting = false; connect(mic.stream, true); }).catch(function () { starting = false; state.textContent = 'Can\'t use the microphone. Allow microphone access in your browser and open the page over https'; });
    }
    function pause() { clearInterval(tid); tid = 0; nodes.forEach(function (n) { try { n.disconnect(); } catch (e) {} }); nodes = []; anL = anR = null; if (usingMic) { usingMic = false; micStop(); } go.textContent = '● Start detecting'; p.classList.remove('on'); curM = null; draw(); }
    function release() { pause(); if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } }
    go.onclick = function () { tid ? pause() : start(false); };
    p.querySelector('.clear').onclick = function () { notes = []; curM = null; draw(); big.textContent = '--'; sub.textContent = ''; };
    $$('.ms-src .btn', p).forEach(function (b) { b.onclick = function () { var was = !!tid; release(); setSrc(b.getAttribute('data-s')); if (was) start(false); }; });
    var slide = p.closest('.slide');
    if (slide) slide.addEventListener('phase:change', function (e) {
      var d = e.detail || {}, now = (d.running ? 'run' : 'stop') + ':' + d.index;
      if (now === lastPhase) return; lastPhase = now;
      if (d.running && d.index === want) start(true); else if (tid) pause();
    });
    setSrc(src); draw();
    state.textContent = canTab ? 'Starts automatically when the solfège section begins. When sharing, choose this tab and tick "Share tab audio"' : 'Starts automatically when the solfège section begins, using the microphone to pick up the speakers';
    onLeave(p, release);
  });
});
