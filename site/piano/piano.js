/* ===== Piano Lab 流行鋼琴互動工具 =====
 * .keyboard    可彈奏的鍵盤：音名、唱名、簡譜標示；data-mode="interval" 點兩個鍵計算音程
 * .notequiz    找音遊戲：依音名、唱名或五線譜，點出正確的琴鍵
 * .scaletrain  音階運指：標出指法，依速度逐音亮起
 * .chordlab    和弦實驗室：根音、性質、轉位，顯示組成音與音程
 * .accomp      伴奏型播放器：L5 L3 L2 L1 R1 R2 R5 指位譜，搭配和弦進行
 * .degrees     順階和弦：大調七個和弦與級數，點選即可聆聽
 */
(function () {
  'use strict';
  var NS = 'pixel:piano:';
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  };
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; return b; }
  function slideNo(root) { var s = root && root.closest && root.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(root, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(root) }); }

  /* ---------- 音名 ---------- */
  var SHARP = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B'];
  var FLAT = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'G♭', 'G', 'A♭', 'A', 'B♭', 'B'];
  var SOLF = ['Do', '♯Do', 'Re', '♯Re', 'Mi', 'Fa', '♯Fa', 'Sol', '♯Sol', 'La', '♯La', 'Si'];
  var NUM = ['1', '♯1', '2', '♯2', '3', '4', '♯4', '5', '♯5', '6', '♯6', '7'];
  var BLACK = [1, 3, 6, 8, 10];
  function pc(m) { return ((m % 12) + 12) % 12; }
  function isBlack(m) { return BLACK.indexOf(pc(m)) > -1; }
  function nameOf(m, flat) { return (flat ? FLAT : SHARP)[pc(m)] + (Math.floor(m / 12) - 1); }
  function label(m, mode, flat) {
    if (mode === 'solf') return SOLF[pc(m)];
    if (mode === 'num') return NUM[pc(m)];
    if (mode === 'name') return (flat ? FLAT : SHARP)[pc(m)];
    if (mode === 'full') return nameOf(m, flat);
    return '';
  }

  /* ---------- 音訊：鋼琴音色 ---------- */
  var master = null;
  function ac() { return window.PS && PS.audio ? PS.audio.ctx() : null; }
  function out() {
    var c = ac(); if (!c) return null;
    if (!master || master.context !== c) { var comp = c.createDynamicsCompressor(); comp.threshold.value = -12; comp.ratio.value = 4; master = c.createGain(); master.gain.value = 0.85; master.connect(comp).connect(c.destination); }
    return master;
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function piano(m, t, dur, vol) {
    var c = ac(); if (!c) return; var dest = out(); t = t || c.currentTime + 0.01; vol = vol || 0.25;
    var f = hz(m), g = c.createGain(), lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.setValueAtTime(Math.min(9000, f * 9), t); lp.frequency.exponentialRampToValueAtTime(Math.max(400, f * 2.5), t + 1.2);
    var decay = Math.max(0.6, Math.min(3.2, 4.2 - (m - 40) * 0.05)), end = Math.min(decay, (dur || 1) + 0.35);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(vol * 0.45, t + 0.25); g.gain.exponentialRampToValueAtTime(0.0001, t + end);
    [[1, 1, 'triangle'], [2, 0.35, 'sine'], [3, 0.12, 'sine'], [4, 0.06, 'sine']].forEach(function (p) {
      var o = c.createOscillator(), og = c.createGain(); o.type = p[2]; o.frequency.value = f * p[0]; o.detune.value = (Math.random() - 0.5) * 4; og.gain.value = p[1];
      o.connect(og).connect(lp); o.start(t); o.stop(t + end + 0.05);
    });
    lp.connect(g).connect(dest);
  }
  function click(t, accent) { if (window.PS && PS.audio && PS.audio.click) PS.audio.click(t, accent); }
  function Clock(stepSec, onStep) { this.stepSec = stepSec; this.onStep = onStep; this.tid = 0; this.step = 0; this.next = 0; }
  Clock.prototype.start = function () {
    var c = ac(); if (!c) return false; out();
    var self = this; this.step = 0; this.next = c.currentTime + 0.1;
    this.tid = setInterval(function () {
      while (self.next < c.currentTime + 0.12) {
        var st = self.step, at = self.next;
        if (self.onStep(st, at) === false) { self.stop(); if (self.onEnd) setTimeout(self.onEnd, Math.max(0, (at - c.currentTime) * 1000)); return; }
        (function (st) { setTimeout(function () { if (self.tid && self.onVisual) self.onVisual(st); }, Math.max(0, (at - c.currentTime) * 1000)); })(st);
        self.step++; self.next += typeof self.stepSec === 'function' ? self.stepSec(st) : self.stepSec;
      }
    }, 25);
    return true;
  };
  Clock.prototype.stop = function () { clearInterval(this.tid); this.tid = 0; };
  var stoppers = [];
  document.addEventListener('slide:change', function (e) { if (e.detail && e.detail.mobile) return; stoppers.forEach(function (f) { f(); }); });

  /* ---------- 鍵盤 SVG ---------- */
  // 回傳 { svg, keys: {midi: element}, mark(list, cls), clear(cls) }
  function Keys(box, lo, hi, opts) {
    opts = opts || {};
    var whites = []; for (var m = lo; m <= hi; m++) if (!isBlack(m)) whites.push(m);
    var W = 40, H = 170, BW = 24, BH = 104, width = whites.length * W;
    var s = '<svg class="kb" viewBox="0 0 ' + width + ' ' + (H + 2) + '" role="img" aria-label="鋼琴鍵盤">';
    whites.forEach(function (m, i) { s += '<g class="k w" data-m="' + m + '"><rect x="' + (i * W + 1) + '" y="1" width="' + (W - 2) + '" height="' + H + '" rx="5"/><text class="lb" x="' + (i * W + W / 2) + '" y="' + (H - 12) + '"></text><text class="fg" x="' + (i * W + W / 2) + '" y="' + (H - 40) + '"></text></g>'; });
    whites.forEach(function (m, i) {
      var b = m + 1; if (b > hi || !isBlack(b)) return;
      var x = (i + 1) * W - BW / 2;
      s += '<g class="k b" data-m="' + b + '"><rect x="' + x + '" y="1" width="' + BW + '" height="' + BH + '" rx="3"/><text class="lb" x="' + (x + BW / 2) + '" y="' + (BH - 10) + '"></text><text class="fg" x="' + (x + BW / 2) + '" y="' + (BH - 32) + '"></text></g>';
    });
    s += '</svg>';
    box.innerHTML = s;
    var keys = {}; $$('.k', box).forEach(function (g) { keys[g.getAttribute('data-m')] = g; });
    var api = {
      keys: keys, lo: lo, hi: hi,
      labels: function (mode, flat) { Object.keys(keys).forEach(function (m) { var t = keys[m].querySelector('.lb'); t.textContent = label(+m, mode, flat); if (mode !== 'full' && +m === 60 && opts.markC !== false && (mode === 'name' || mode === 'none')) t.textContent = mode === 'none' ? '' : t.textContent; }); },
      mark: function (list, cls, fingers) { (list || []).forEach(function (m, i) { var k = keys[m]; if (k) { k.classList.add(cls || 'on'); if (fingers) k.querySelector('.fg').textContent = fingers[i] == null ? '' : fingers[i]; } }); },
      clear: function (cls) { Object.keys(keys).forEach(function (m) { keys[m].classList.remove(cls || 'on'); if (!cls || cls === 'on') keys[m].querySelector('.fg').textContent = ''; }); },
      flash: function (m, ms) { var k = keys[m]; if (!k) return; k.classList.add('hit'); setTimeout(function () { k.classList.remove('hit'); }, ms || 260); },
      onPress: function (fn) {
        Object.keys(keys).forEach(function (m) {
          var k = keys[m];
          k.addEventListener('pointerdown', function (e) { e.preventDefault(); fn(+m); });
        });
      }
    };
    return api;
  }

  /* ========== 1. 可彈奏的鍵盤 ========== */
  var INTERVAL = [['完全一度', '完全協和'], ['小二度', '不協和'], ['大二度', '不協和'], ['小三度', '不完全協和'], ['大三度', '不完全協和'], ['完全四度', '完全協和'], ['增四度／減五度', '不協和'], ['完全五度', '完全協和'], ['小六度', '不完全協和'], ['大六度', '不完全協和'], ['小七度', '不協和'], ['大七度', '不協和'], ['完全八度', '完全協和']];
  var COMPUTER = { a: 60, w: 61, s: 62, e: 63, d: 64, f: 65, t: 66, g: 67, y: 68, h: 69, u: 70, j: 71, k: 72, o: 73, l: 74, p: 75, ';': 76 };
  $$('.keyboard').forEach(function (kb) {
    var lo = +(kb.getAttribute('data-lo') || 48), hi = +(kb.getAttribute('data-hi') || 72), mode = kb.getAttribute('data-labels') || 'name', interval = kb.getAttribute('data-mode') === 'interval';
    kb.innerHTML = '';
    var top = el('div', 'kb-top'), show = el('div', 'kb-show', '<b>點選琴鍵</b><span>電腦鍵盤 A S D F G H J K 也能彈奏</span>'), modes = el('div', 'kb-modes'), box = el('div', 'kb-box');
    [['name', '音名'], ['solf', '唱名'], ['num', '簡譜'], ['none', '隱藏']].forEach(function (x) { var b = btn(x[1]); b.setAttribute('data-k', x[0]); b.onclick = function () { mode = x[0]; K.labels(mode); sync(); }; modes.appendChild(b); });
    top.appendChild(show); top.appendChild(modes); kb.appendChild(top); kb.appendChild(box);
    var K = Keys(box, lo, hi); K.labels(mode);
    var marks = (kb.getAttribute('data-mark') || '').split(/\s+/).filter(Boolean).map(Number); if (marks.length) K.mark(marks, 'tint');
    function sync() { $$('button', modes).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === mode); }); }
    sync();
    var picked = [];
    function press(m) {
      piano(m, 0, 0.8, 0.28); K.flash(m);
      if (!interval) { show.innerHTML = '<b>' + nameOf(m) + '</b><span>唱名 ' + SOLF[pc(m)] + '・簡譜 ' + NUM[pc(m)] + (m === 60 ? '・中央 C' : '') + '</span>'; return; }
      picked.push(m); if (picked.length > 2) picked = [m];
      K.clear('sel'); K.mark(picked, 'sel');
      if (picked.length === 2) {
        var a = Math.min(picked[0], picked[1]), b = Math.max(picked[0], picked[1]), d = b - a, I = d <= 12 ? INTERVAL[d] : ['複音程（' + d + ' 個半音）', ''];
        show.innerHTML = '<b>' + nameOf(a) + ' → ' + nameOf(b) + '：' + I[0] + '</b><span>相差 ' + d + ' 個半音' + (I[1] ? '・' + I[1] : '') + '</span>';
        setTimeout(function () { piano(a, 0, 1, 0.2); piano(b, 0, 1, 0.2); }, 450);
      } else show.innerHTML = '<b>' + nameOf(m) + '</b><span>再點選第二個琴鍵，計算兩音之間的音程</span>';
    }
    K.onPress(press);
    if (!interval) document.addEventListener('keydown', function (e) {
      var s = kb.closest('.slide'); if (s && !s.classList.contains('active')) return;
      if (e.target.closest && e.target.closest('input,textarea,select')) return;
      var m = COMPUTER[e.key && e.key.toLowerCase()]; if (m && m >= lo && m <= hi && !e.repeat) { press(m); e.stopPropagation(); }
    });
  });

  /* ========== 2. 找音遊戲 ========== */
  // 五線譜：大譜表，高音譜號 E4 在第一線，低音譜號 G2 在第一線
  var DIAT = [0, 2, 4, 5, 7, 9, 11];
  function diaIndex(m) { var o = Math.floor(m / 12), k = DIAT.indexOf(pc(m)); return o * 7 + k; }
  function staffSVG(m) {
    var W = 260, H = 210, sp = 10, topT = 40, topB = topT + 4 * sp + 50, x = 150;
    var s = '<svg class="staff" viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="大譜表上的音符">';
    for (var i = 0; i < 5; i++) { s += '<line x1="20" x2="' + (W - 10) + '" y1="' + (topT + i * sp) + '" y2="' + (topT + i * sp) + '"/>'; s += '<line x1="20" x2="' + (W - 10) + '" y1="' + (topB + i * sp) + '" y2="' + (topB + i * sp) + '"/>'; }
    s += '<line x1="20" x2="20" y1="' + topT + '" y2="' + (topB + 4 * sp) + '"/>';
    s += '<text class="clef" x="26" y="' + (topT + 37) + '">𝄞</text><text class="clef b" x="28" y="' + (topB + 28) + '">𝄢</text>';
    // y：高音譜表第五線 F5 → diaIndex(77)，每個音級 sp/2
    var di = diaIndex(m), treble = m >= 60, refDi = treble ? diaIndex(77) : diaIndex(57), refY = treble ? topT : topB, y = refY + (refDi - di) * sp / 2;
    var bottomY = refY + 4 * sp;
    for (var ly = bottomY + sp; ly <= y + 0.1; ly += sp) s += '<line class="ledger" x1="' + (x - 16) + '" x2="' + (x + 16) + '" y1="' + ly + '" y2="' + ly + '"/>';
    for (var uy = refY - sp; uy >= y - 0.1; uy -= sp) s += '<line class="ledger" x1="' + (x - 16) + '" x2="' + (x + 16) + '" y1="' + uy + '" y2="' + uy + '"/>';
    if (isBlack(m)) s += '<text class="acc" x="' + (x - 26) + '" y="' + (y + 6) + '">♯</text>';
    s += '<ellipse class="head" cx="' + x + '" cy="' + y + '" rx="7.5" ry="5.6" transform="rotate(-20 ' + x + ' ' + y + ')"/>';
    return s + '</svg>';
  }
  $$('.notequiz').forEach(function (q) {
    var mode = q.getAttribute('data-mode') || 'name', lo = +(q.getAttribute('data-lo') || 60), hi = +(q.getAttribute('data-hi') || 72), withBlack = q.hasAttribute('data-black');
    var pool = []; for (var m = lo; m <= hi; m++) if (withBlack || !isBlack(m)) pool.push(m);
    q.innerHTML = '';
    var head = el('div', 'nq-head'), ask = el('div', 'nq-ask'), stat = el('div', 'nq-stat'), box = el('div', 'kb-box'), row = el('div', 'btn-row');
    head.appendChild(ask); head.appendChild(stat); q.appendChild(head); q.appendChild(box); q.appendChild(row);
    var kLo = Math.min(lo, 48), kHi = Math.max(hi, 72); while (isBlack(kLo)) kLo--; while (isBlack(kHi)) kHi++;
    var K = Keys(box, kLo, kHi); K.labels('none');
    var target = null, ok = 0, tries = 0, t0 = 0, best = LS.get('nq-' + mode, null);
    var bGo = btn('開始出題', 'primary'), bHint = btn('提示');
    bGo.onclick = next; bHint.onclick = function () { if (target != null) { K.mark([target], 'tint'); setTimeout(function () { K.clear('tint'); }, 900); } };
    row.appendChild(bGo); row.appendChild(bHint);
    function next() {
      var t; do { t = pool[Math.floor(Math.random() * pool.length)]; } while (t === target && pool.length > 1);
      target = t; t0 = performance.now(); K.clear('good'); K.clear('bad');
      if (mode === 'staff') ask.innerHTML = staffSVG(t) + '<p>這個音在鍵盤上的哪裡？</p>';
      else ask.innerHTML = '<div class="nq-big">' + (mode === 'solf' ? SOLF[pc(t)] : mode === 'num' ? NUM[pc(t)] : nameOf(t)) + '</div><p>' + (mode === 'name' ? '依照音名與八度，點選正確的琴鍵' : '在中央 C 到高音 C 之間，點選正確的琴鍵') + '</p>';
      bGo.textContent = '下一題';
    }
    function draw() { stat.innerHTML = '答對 <b>' + ok + '</b> / ' + tries + (best ? '<small>最佳平均 ' + best + ' 秒</small>' : ''); }
    K.onPress(function (m) {
      piano(m, 0, 0.6, 0.25);
      if (target == null) return;
      var right = mode === 'name' || mode === 'staff' ? m === target : pc(m) === pc(target) && m >= 60 && m <= 72;
      tries++; K.mark([m], right ? 'good' : 'bad');
      if (right) {
        ok++; var sec = ((performance.now() - t0) / 1000).toFixed(1);
        report(q, 'notequiz', { item: '找音：' + nameOf(target), result: '答對', value: +sec });
        if (ok % 5 === 0) { var avg = sec; if (!best || +avg < +best) { best = avg; LS.set('nq-' + mode, best); } }
        target = null; draw(); setTimeout(next, 650);
      } else { draw(); setTimeout(function () { K.clear('bad'); }, 500); }
    });
    ask.innerHTML = '<div class="nq-big">?</div><p>按下「開始出題」</p>'; draw();
  });

  /* ========== 3. 音階運指 ========== */
  var SCALES = {
    C: { name: 'C 大調', notes: [60, 62, 64, 65, 67, 69, 71, 72], R: [1, 2, 3, 1, 2, 3, 4, 5], L: [5, 4, 3, 2, 1, 3, 2, 1] },
    G: { name: 'G 大調', notes: [55, 57, 59, 60, 62, 64, 66, 67], R: [1, 2, 3, 1, 2, 3, 4, 5], L: [5, 4, 3, 2, 1, 3, 2, 1] },
    F: { name: 'F 大調', notes: [53, 55, 57, 58, 60, 62, 64, 65], R: [1, 2, 3, 4, 1, 2, 3, 4], L: [5, 4, 3, 2, 1, 3, 2, 1] },
    Am: { name: 'A 自然小調', notes: [57, 59, 60, 62, 64, 65, 67, 69], R: [1, 2, 3, 1, 2, 3, 4, 5], L: [5, 4, 3, 2, 1, 3, 2, 1] },
    Amh: { name: 'A 和聲小調', notes: [57, 59, 60, 62, 64, 65, 68, 69], R: [1, 2, 3, 1, 2, 3, 4, 5], L: [5, 4, 3, 2, 1, 3, 2, 1] },
    C5: { name: 'C 五指位置', notes: [60, 62, 64, 65, 67], R: [1, 2, 3, 4, 5], L: [5, 4, 3, 2, 1] }
  };
  $$('.scaletrain').forEach(function (st) {
    var list = (st.getAttribute('data-scales') || 'C G Am').split(/\s+/), cur = list[0], hand = 'R', bpm = +(st.getAttribute('data-bpm') || 72), dir = 'updown';
    st.innerHTML = '';
    var pick = el('div', 'st-pick'), box = el('div', 'kb-box'), ctl = el('div', 'st-ctl'), note = el('p', 'st-note');
    list.forEach(function (k) { var b = btn(SCALES[k].name); b.setAttribute('data-k', k); b.onclick = function () { cur = k; stop(); draw(); }; pick.appendChild(b); });
    var hands = el('div', 'st-hands'); [['R', '右手'], ['L', '左手']].forEach(function (h) { var b = btn(h[1]); b.setAttribute('data-h', h[0]); b.onclick = function () { hand = h[0]; stop(); draw(); }; hands.appendChild(b); });
    var bP = btn('▶︎ 播放', 'primary'); bP.onclick = function () { clock.tid ? stop() : play(); };
    var rng = el('input'); rng.type = 'range'; rng.min = 40; rng.max = 132; rng.value = bpm; rng.setAttribute('aria-label', '速度');
    var bl = el('b', '', bpm + ' BPM'); rng.oninput = function () { bpm = +rng.value; bl.textContent = bpm + ' BPM'; };
    var lab = el('label'); lab.appendChild(document.createTextNode('速度 ')); lab.appendChild(rng);
    ctl.appendChild(bP); ctl.appendChild(hands); ctl.appendChild(lab); ctl.appendChild(bl);
    st.appendChild(pick); st.appendChild(box); st.appendChild(ctl); st.appendChild(note);
    var K = Keys(box, 48, 74); K.labels('name');
    function shift() { return hand === 'L' ? -12 : 0; }
    function seq() { var S = SCALES[cur], n = S.notes.map(function (m) { return m + shift(); }), f = S[hand]; var up = n.map(function (m, i) { return [m, f[i]]; }); var down = up.slice(0, -1).reverse(); return up.concat(down); }
    function draw() {
      var S = SCALES[cur]; K.clear(); K.clear('now');
      K.mark(S.notes.map(function (m) { return m + shift(); }), 'on', S[hand]);
      $$('button', pick).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === cur); });
      $$('button', hands).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-h') === hand); });
      var tip = hand === 'R' ? (cur === 'F' ? '右手 F 大調：4 指彈奏 B♭ 之後，拇指從下方穿過，接著彈奏 C。' : cur === 'C5' ? '五個手指各負責一個琴鍵，手形保持圓弧，不需要穿指與跨指。' : '右手上行：彈完第 3 指之後，拇指從下方穿過；下行時，第 3 指跨過拇指。') : (cur === 'C5' ? '左手第 5 指放在 C，依序往上彈奏到拇指。' : '左手上行：拇指之後，第 3 指跨過拇指；下行時，拇指從下方穿過。');
      note.textContent = S.name + '：' + tip;
    }
    var q = [];
    var clock = new Clock(function () { return 60 / bpm; }, function (s, t) { if (s >= q.length) return false; piano(q[s][0], t, 60 / bpm, 0.28); });
    clock.onVisual = function (s) { K.clear('now'); if (q[s]) K.mark([q[s][0]], 'now'); };
    clock.onEnd = function () { stop(); };
    function play() { stop(); q = seq(); if (clock.start()) bP.textContent = '■ 停止'; }
    function stop() { clock.stop(); bP.textContent = '▶︎ 播放'; K.clear('now'); }
    stoppers.push(stop);
    draw();
  });

  /* ========== 4. 和弦實驗室 ========== */
  var QUAL = {
    '': { zh: '大三和弦', iv: [0, 4, 7], st: '大三度 ＋ 小三度', feel: '明亮、開朗' },
    'm': { zh: '小三和弦', iv: [0, 3, 7], st: '小三度 ＋ 大三度', feel: '柔和、憂傷' },
    'aug': { zh: '增三和弦', iv: [0, 4, 8], st: '大三度 ＋ 大三度', feel: '懸疑、不安' },
    'dim': { zh: '減三和弦', iv: [0, 3, 6], st: '小三度 ＋ 小三度', feel: '緊張、詭異' },
    'sus4': { zh: '掛四和弦', iv: [0, 5, 7], st: '完全四度 ＋ 大二度', feel: '懸而未決，想回到大三和弦' },
    'maj7': { zh: '大七和弦', iv: [0, 4, 7, 11], st: '大三和弦 ＋ 大七度', feel: '溫柔、浪漫' },
    '7': { zh: '屬七和弦', iv: [0, 4, 7, 10], st: '大三和弦 ＋ 小七度', feel: '想要解決的張力' },
    'm7': { zh: '小七和弦', iv: [0, 3, 7, 10], st: '小三和弦 ＋ 小七度', feel: '柔軟、都會' }
  };
  var DEGNAME = ['根音', '三音', '五音', '七音'];
  $$('.chordlab').forEach(function (cl) {
    var quals = (cl.getAttribute('data-quals') || ' m aug dim').split(' ').map(function (s) { return s === '_' ? '' : s; });
    if (quals[0] === '' && quals.length === 1) quals = ['', 'm', 'aug', 'dim'];
    var root = 0, q = quals[0], inv = 0;
    cl.innerHTML = '';
    var rootRow = el('div', 'cl-roots'), qRow = el('div', 'cl-quals'), invRow = el('div', 'cl-inv'), box = el('div', 'kb-box'), info = el('div', 'cl-info'), row = el('div', 'btn-row');
    SHARP.forEach(function (n, i) { var b = btn(i === 1 || i === 3 || i === 6 || i === 8 || i === 10 ? FLAT[i] : n); b.setAttribute('data-r', i); b.onclick = function () { root = i; draw(true); }; rootRow.appendChild(b); });
    quals.forEach(function (k) { var b = btn(QUAL[k].zh + (k ? '（' + k + '）' : '')); b.setAttribute('data-q', k); b.onclick = function () { q = k; inv = Math.min(inv, QUAL[q].iv.length - 1); draw(true); }; qRow.appendChild(b); });
    var invNames = ['原位', '第一轉位', '第二轉位', '第三轉位'];
    if (!cl.hasAttribute('data-noinv')) invNames.forEach(function (n, i) { var b = btn(n); b.setAttribute('data-i', i); b.onclick = function () { if (i < QUAL[q].iv.length) { inv = i; draw(true); } }; invRow.appendChild(b); });
    var bB = btn('▶︎ 柱式和弦', 'primary'), bA = btn('▶︎ 分散和弦');
    bB.onclick = function () { notes().forEach(function (m) { piano(m, 0, 1.4, 0.2); }); };
    bA.onclick = function () { var c = ac(); if (!c) return; notes().forEach(function (m, i) { piano(m, c.currentTime + 0.05 + i * 0.22, 1.2, 0.22); }); };
    row.appendChild(bB); row.appendChild(bA);
    cl.appendChild(rootRow); cl.appendChild(qRow); if (invRow.children.length) cl.appendChild(invRow); cl.appendChild(box); cl.appendChild(info); cl.appendChild(row);
    var K = Keys(box, 48, 83); K.labels('name');
    function notes() { var base = 60 + root, n = QUAL[q].iv.map(function (i) { return base + i; }); for (var k = 0; k < inv; k++) n.push(n.shift() + 12); while (n[0] > 67) n = n.map(function (m) { return m - 12; }); return n; }
    function draw(sound) {
      var n = notes(), Q = QUAL[q], flat = [1, 3, 6, 8, 10].indexOf(root) > -1 || root === 5;
      K.clear(); K.labels('name', flat);
      var tones = QUAL[q].iv.map(function (iv, i) { return DEGNAME[i]; }); for (var k = 0; k < inv; k++) tones.push(tones.shift());
      K.mark(n, 'on', tones.map(function (t) { return t.charAt(0); }));
      $$('button', rootRow).forEach(function (b) { b.classList.toggle('on', +b.getAttribute('data-r') === root); });
      $$('button', qRow).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-q') === q); });
      $$('button', invRow).forEach(function (b) { var i = +b.getAttribute('data-i'); b.classList.toggle('on', i === inv); b.disabled = i >= Q.iv.length; });
      var nm = (flat ? FLAT : SHARP)[root] + q;
      info.innerHTML = '<div class="cl-name">' + nm + '<small>' + Q.zh + '</small></div><div class="cl-detail"><p>組成音：<b>' + n.map(function (m) { return (flat ? FLAT : SHARP)[pc(m)]; }).join('、') + '</b>' + (inv ? '（' + invNames[inv] + '，最低音是' + tones[0] + '）' : '') + '</p><p>結構：' + Q.st + '・聽感：' + Q.feel + '</p></div>';
      if (sound) n.forEach(function (m) { piano(m, 0, 1.2, 0.18); });
    }
    draw(false);
  });

  /* ========== 5. 伴奏型播放器 ========== */
  // 指位：L5 根音、L3 三音、L2 五音、L1 高八度根音、R1 再上方的三音、R2 五音、R5 再高八度根音（以 C 和弦為例：C3 E3 G3 C4 E4 G4 C5）
  var TOK = { L5: 0, L3: 1, L2: 2, L1: 3, R1: 4, R2: 5, R5: 6 };
  var PAT = {
    q4: { name: '4 Beats・單手 8 度（一）', meter: 4, div: 1, seq: 'L5 L3 L2 L1', desc: '每拍一個音，左手在一個八度內分散和弦' },
    q4b: { name: '4 Beats・單手 8 度（二）', meter: 4, div: 1, seq: 'L5 L3 L2 L1 | L2 L1 L2 L1', bars: 2, desc: '第二小節在高音來回，伴奏不再只是上樓梯' },
    q4r: { name: '4 Beats・雙手兩個八度（15 度）（一）', meter: 4, div: 1, seq: 'L5 L3 L2 L1 | R1 R2 R5 R2', bars: 2, desc: '左手彈完交給右手，音域擴大到兩個八度' },
    q4c: { name: '4 Beats・單手 8 度（三）', meter: 4, div: 1, seq: 'L5 L3 L2 L1 | L3 L2 L1 L3 | L2 L1 L3 L2 | L1 L3 L2 L1', bars: 4, desc: '四個音一組，從不同的音開始循環，四小節才回到原點' },
    q4r2: { name: '4 Beats・雙手兩個八度（15 度）（二）', meter: 4, div: 1, seq: 'L5 L3 L2 L1 | R5 R2 R1 R2', bars: 2, desc: '右手從最高的根音往下彈奏，像回聲一樣' },
    q4r3: { name: '4 Beats・雙手兩個八度（15 度）（三）', meter: 4, div: 1, seq: 'L5 L3 L2 L1 | R1 R2 R5 R2 | R1 L1 L2 L3 | L5 L3 L2 L1', bars: 4, desc: '上到最高再回到最低，四小節畫出一座山' },
    e8: { name: '8 Beats・單手 8 度（一）', meter: 4, div: 2, seq: 'L5 L3 L2 L1 L5 L3 L2 L1', desc: '每拍兩個音，流動感加倍' },
    e8b: { name: '8 Beats・單手 8 度（二）', meter: 4, div: 2, seq: 'L5 L3 L2 L1 L3 L1 L2 L1', desc: '後半小節在上方來回，聽起來更像流行抒情' },
    e8r: { name: '8 Beats・雙手兩個八度（15 度）（一）', meter: 4, div: 2, seq: 'L5 L3 L2 L1 R1 R2 R5 R2', desc: '左右手接力，琶音一路爬上兩個八度' },
    e8c: { name: '8 Beats・單手兩個八度（15 度）', meter: 4, div: 2, seq: 'L5 L3 L2 L1 L3 L2 L1 L2', desc: '後半小節在和弦內迴旋，聲音綿密' },
    e8r2: { name: '8 Beats・雙手兩個八度（15 度）（二）', meter: 4, div: 2, seq: 'L5 L2 L1 R1 R2 R5 R2 R1', desc: '省略三音，左手更輕鬆，右手上行再下行' },
    e8r3: { name: '8 Beats・雙手兩個八度（15 度）（三）', meter: 4, div: 2, seq: 'L5 L2 L1 R2 R5 R2 R1 R2', desc: '右手在高音區來回，適合副歌' },
    ss1: { name: 'Slow Soul（一）', meter: 4, div: 2, seq: 'L5 L2 L1 R1 R2 - - -', desc: '1 5 1 3 5，最後一個音延長兩拍' },
    ss2: { name: 'Slow Soul（二）', meter: 4, div: 2, seq: 'L5 L2 L1 R1 R2 R5 R2 R1', desc: '上行再下行的八分音符，抒情歌最常見' },
    ss3: { name: 'Slow Soul（三）柱式和弦', meter: 4, div: 1, seq: 'L5+L3+L2 L5+L3+L2 L5+L3+L2 L5+L3+L2', desc: '每拍按一次和弦，穩定有力' },
    ss4: { name: 'Slow Soul（四）', meter: 4, div: 2, seq: 'L5 L2 L1 L2 R1 L2 L1 L2', desc: '1 5 1 5 3 5 1 5，五音像鐘擺來回' },
    w3: { name: '3/4 華爾滋・4 Beats', meter: 3, div: 1, seq: 'L5 L3 L2', desc: '強、弱、弱，每拍一個音' },
    w3c: { name: '3/4 華爾滋・蹦洽洽', meter: 3, div: 1, seq: 'L5 R1+R2+L1 R1+R2+L1', desc: '第一拍彈根音，二、三拍彈和弦' },
    w8: { name: '3/4・8 Beats', meter: 3, div: 2, seq: 'L5 L3 L2 L1 L2 L1', desc: '三拍子的分散和弦，像搖籃一樣起伏' },
    w8r: { name: '3/4・雙手兩個八度（15 度）', meter: 3, div: 2, seq: 'L5 L2 L1 R1 R2 R5', desc: '一小節爬上兩個八度，適合慢板圓舞曲' },
    ten: { name: '十度音伴奏', meter: 4, div: 2, seq: 'L5 L2 R1 L2 R1 L2 R1 L2', desc: '1 5 10 5 10 5 10 5：根音、五音、十度音來回，理查‧克萊德曼的招牌伴奏' },
    sr: { name: 'Slow Rock 12/8', meter: 4, div: 3, seq: 'L5 L2 L1 R1 L1 L2 L5 L2 L1 R1 L1 L2', desc: '每拍三個音，四拍十二個八分音符，帶有搖擺感' },
    march: { name: '2/4 進行曲・蹦洽', meter: 2, div: 2, seq: 'L5 R1+R2+L1 L2 R1+R2+L1', desc: '根音與五音輪流，中間插入和弦' }
  };
  var CQ = { '': [0, 4, 7], m: [0, 3, 7], dim: [0, 3, 6], aug: [0, 4, 8], sus4: [0, 5, 7], '7': [0, 4, 7], maj7: [0, 4, 7], m7: [0, 3, 7] };
  function parseChord(s) { // C、Am、G/B、F#m
    var m = s.match(/^([A-G])([#♯b♭]?)(maj7|m7|sus4|dim|aug|m|7)?(?:\/([A-G])([#♯b♭]?))?$/); if (!m) return null;
    var base = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    var r = (base[m[1]] + (/[#♯]/.test(m[2]) ? 1 : /[b♭]/.test(m[2]) ? -1 : 0) + 12) % 12;
    var b = m[4] ? (base[m[4]] + (/[#♯]/.test(m[5]) ? 1 : /[b♭]/.test(m[5]) ? -1 : 0) + 12) % 12 : null;
    return { root: r, q: m[3] || '', bass: b, name: s };
  }
  function voices(ch) {
    var r0 = 48 + ch.root; if (ch.root > 7) r0 -= 12; // 根音落在 F2 到 G3 之間
    var iv = CQ[ch.q] || CQ[''];
    var v = [r0, r0 + iv[1], r0 + iv[2], r0 + 12, r0 + 12 + iv[1], r0 + 12 + iv[2], r0 + 24];
    if (ch.bass != null) { var b = 36 + ch.bass; while (b < r0 - 7) b += 12; while (b > r0 + 4) b -= 12; v[0] = b; }
    return v;
  }
  $$('.accomp').forEach(function (ap) {
    var plist = (ap.getAttribute('data-patterns') || 'q4 e8').split(/\s+/), cur = plist[0], bpm = +(ap.getAttribute('data-bpm') || 72);
    var progs = (ap.getAttribute('data-chords') || 'C Am F G').split('|').map(function (p) { return p.trim().split(/\s+/); }), pi = 0;
    var metro = false;
    ap.innerHTML = '';
    var pick = el('div', 'ap-pick'), grid = el('div', 'ap-grid'), box = el('div', 'kb-box'), ctl = el('div', 'ap-ctl'), desc = el('p', 'ap-desc'), bars = el('div', 'ap-bars');
    plist.forEach(function (k) { var b = btn(PAT[k].name); b.setAttribute('data-k', k); b.onclick = function () { cur = k; restart(); }; pick.appendChild(b); });
    var bP = btn('▶︎ 播放', 'primary'); bP.onclick = function () { clock.tid ? stop() : play(); };
    var sel = el('select'); sel.setAttribute('aria-label', '和弦進行'); progs.forEach(function (p, i) { sel.appendChild(new Option(p.join(' → '), i)); }); sel.onchange = function () { pi = +sel.value; restart(); };
    var rng = el('input'); rng.type = 'range'; rng.min = 40; rng.max = 140; rng.value = bpm; rng.setAttribute('aria-label', '速度');
    var bl = el('b', '', bpm + ' BPM'); rng.oninput = function () { bpm = +rng.value; bl.textContent = bpm + ' BPM'; };
    var mt = el('label', 'ap-metro'), cb = el('input'); cb.type = 'checkbox'; cb.onchange = function () { metro = cb.checked; }; mt.appendChild(cb); mt.appendChild(document.createTextNode(' 節拍器'));
    var lr = el('label'); lr.appendChild(document.createTextNode('速度 ')); lr.appendChild(rng);
    ctl.appendChild(bP); if (progs.length > 1) ctl.appendChild(sel); ctl.appendChild(lr); ctl.appendChild(bl); ctl.appendChild(mt);
    ap.appendChild(pick); ap.appendChild(bars); ap.appendChild(grid); ap.appendChild(box); ap.appendChild(ctl); ap.appendChild(desc);
    var K = Keys(box, 36, 84); K.labels('name');
    function P() { return PAT[cur]; }
    function slots() { return P().seq.replace(/\|/g, ' ').trim().split(/\s+/); }
    function chords() { return progs[pi].map(parseChord); }
    function stepsPerBar() { return P().meter * P().div; }
    function draw() {
      var p = P(), sl = slots(), per = stepsPerBar();
      $$('button', pick).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === cur); });
      grid.style.setProperty('--n', per); grid.innerHTML = '';
      sl.forEach(function (t, i) { var c = el('div', 'ap-cell' + (i % p.div === 0 ? ' beat' : '') + (i % per === 0 && i ? ' bar' : ''), t === '-' ? '－' : t.replace(/\+/g, '<br>')); c.setAttribute('data-i', i); grid.appendChild(c); });
      bars.innerHTML = chords().map(function (c, i) { return '<span data-b="' + i + '">' + c.name + '</span>'; }).join('');
      desc.textContent = p.desc + '・拍號 ' + (p.div === 3 ? '12/8' : p.meter + '/4');
      K.clear(); var v = voices(chords()[0]), used = {}; sl.forEach(function (t) { t.split('+').forEach(function (x) { if (TOK[x] != null) used[x] = 1; }); });
      K.mark(Object.keys(used).map(function (x) { return v[TOK[x]]; }), 'on', Object.keys(used));
    }
    var clock = new Clock(function () { return 60 / bpm / P().div; }, function (s, t) {
      var p = P(), sl = slots(), per = stepsPerBar(), patBars = Math.max(1, Math.round(sl.length / per)), cs = chords();
      var barNo = Math.floor(s / per), ch = cs[barNo % cs.length], v = voices(ch), tok = sl[s % sl.length], len = 1;
      while (sl[(s + len) % sl.length] === '-' && len < sl.length) len++;
      if (metro && s % p.div === 0) click(t, s % per === 0 ? 2 : 1);
      if (tok && tok !== '-' && tok !== '.') tok.split('+').forEach(function (x) { if (TOK[x] != null) piano(v[TOK[x]], t, len * 60 / bpm / p.div, x.charAt(0) === 'R' ? 0.16 : 0.2); });
      void patBars;
    });
    clock.onVisual = function (s) {
      var sl = slots(), per = stepsPerBar(), cs = chords(), barNo = Math.floor(s / per), ch = cs[barNo % cs.length], v = voices(ch), tok = sl[s % sl.length];
      $$('.ap-cell', grid).forEach(function (c) { c.classList.toggle('now', +c.getAttribute('data-i') === s % sl.length); });
      $$('span', bars).forEach(function (b) { b.classList.toggle('now', +b.getAttribute('data-b') === barNo % cs.length); });
      if (s % per === 0) { K.clear(); var used = {}; sl.forEach(function (t) { t.split('+').forEach(function (x) { if (TOK[x] != null) used[x] = 1; }); }); K.mark(Object.keys(used).map(function (x) { return v[TOK[x]]; }), 'on', Object.keys(used)); }
      K.clear('now'); if (tok && tok !== '-') K.mark(tok.split('+').filter(function (x) { return TOK[x] != null; }).map(function (x) { return v[TOK[x]]; }), 'now');
    };
    function play() { if (clock.start()) bP.textContent = '■ 停止'; }
    function stop() { clock.stop(); bP.textContent = '▶︎ 播放'; K.clear('now'); $$('.ap-cell', grid).forEach(function (c) { c.classList.remove('now'); }); $$('span', bars).forEach(function (b) { b.classList.remove('now'); }); }
    function restart() { var was = !!clock.tid; stop(); draw(); if (was) play(); }
    stoppers.push(stop);
    draw();
  });

  /* ========== 6. 順階和弦 ========== */
  var ROMAN = ['Ⅰ', 'Ⅱm', 'Ⅲm', 'Ⅳ', 'Ⅴ', 'Ⅵm', 'Ⅶdim'];
  var DQ = ['', 'm', 'm', '', '', 'm', 'dim'];
  var FAMILY = ['主和弦', '下屬和弦', '主和弦', '下屬和弦', '屬和弦', '主和弦', '屬和弦'];
  var KEYS = { C: [0, false], G: [7, false], F: [5, true], D: [2, false] };
  $$('.degrees').forEach(function (dg) {
    var klist = (dg.getAttribute('data-keys') || 'C G').split(/\s+/), key = klist[0], minor = dg.hasAttribute('data-minor');
    dg.innerHTML = '';
    var kp = el('div', 'dg-keys'), cards = el('div', 'dg-cards'), box = el('div', 'kb-box'), info = el('p', 'dg-info');
    klist.forEach(function (k) { var b = btn(k + ' 大調'); b.setAttribute('data-k', k); b.onclick = function () { key = k; draw(); }; kp.appendChild(b); });
    if (klist.length > 1) dg.appendChild(kp); dg.appendChild(cards); dg.appendChild(box); dg.appendChild(info);
    var K = Keys(box, 48, 84); K.labels('name');
    function chordNotes(i) { var t = KEYS[key][0], sc = DIAT.map(function (d) { return 60 + t + d - (t > 5 ? 12 : 0); }); var n = [sc[i], sc[(i + 2) % 7] + (i + 2 >= 7 ? 12 : 0), sc[(i + 4) % 7] + (i + 4 >= 7 ? 12 : 0)]; return n; }
    function draw() {
      var t = KEYS[key][0], flat = KEYS[key][1];
      $$('button', kp).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === key); });
      cards.innerHTML = '';
      for (var i = 0; i < 7; i++) (function (i) {
        var r = (t + DIAT[i]) % 12, nm = (flat ? FLAT : SHARP)[r] + DQ[i], c = el('button', 'dg-card' + ([0, 3, 4].indexOf(i) > -1 ? ' primary' : '') + (minor && i === 5 ? ' rel' : ''), '<b>' + ROMAN[i] + '</b><span>' + nm + '</span><small>' + FAMILY[i] + '</small>');
        c.type = 'button';
        c.onclick = function () { var n = chordNotes(i); K.clear(); K.mark(n, 'on'); n.forEach(function (m) { piano(m, 0, 1.3, 0.2); }); piano(n[0] - 12, 0, 1.3, 0.22); $$('.dg-card', cards).forEach(function (x) { x.classList.remove('on'); }); c.classList.add('on'); info.textContent = nm + '：' + n.map(function (m) { return (flat ? FLAT : SHARP)[pc(m)]; }).join('、') + '・第 ' + (i + 1) + ' 級・' + FAMILY[i]; };
        cards.appendChild(c);
      })(i);
      K.clear(); K.labels('name', flat);
      var sc = DIAT.map(function (d) { return 60 + t + d - (t > 5 ? 12 : 0); }); K.mark(sc, 'tint');
      info.textContent = key + ' 大調的音階：' + sc.map(function (m) { return (flat ? FLAT : SHARP)[pc(m)]; }).join('、') + (minor ? '・關係小調從第 6 級開始' : '') + '。點選和弦卡片，聆聽並觀察組成音。';
    }
    draw();
  });

  /* ========== 7. 歌曲彈奏：右手旋律＋左手伴奏 ========== */
  // data-melody：每個空白分隔的單位是一拍；「5_6」把一拍平分；「-」延長；「0」休止；' 高八度、, 低八度
  // data-chords：每小節一個和弦，以空白分隔；data-pattern：左手伴奏型（同 .accomp）；data-key：調性（C、G、F）
  var KEYOFF = { C: 0, G: 7, F: 5, D: 2 };
  function melNote(t, key) {
    var up = (t.match(/'/g) || []).length, dn = (t.match(/,/g) || []).length, n = parseInt(t, 10);
    if (!n) return null;
    var off = KEYOFF[key] || 0, base = 60 + off;
    return base + DIAT[n - 1] + (t.indexOf('#') > -1 ? 1 : 0) - (t.indexOf('b') > -1 ? 1 : 0) + 12 * (up - dn);
  }
  $$('.songplay').forEach(function (sp) {
    var meter = +(sp.getAttribute('data-meter') || 4), key = sp.getAttribute('data-key') || 'C', bpm = +(sp.getAttribute('data-bpm') || 84);
    var plist = (sp.getAttribute('data-patterns') || 'q4').split(/\s+/), pat = plist[0], pickup = +(sp.getAttribute('data-pickup') || 0);
    var beats = sp.getAttribute('data-melody').trim().split(/\s+/).filter(function (t) { return t !== '|'; });
    var chordList = sp.getAttribute('data-chords').trim().split(/\s+/).map(function (t) { return t.split(',').map(parseChord); });
    function chordAt(ab) { var bar = chordList[Math.floor(ab / meter) % chordList.length]; return bar[Math.min(bar.length - 1, Math.floor((ab % meter) * bar.length / meter))]; }
    var useM = true, useA = true;
    sp.innerHTML = '';
    var sheet = el('div', 'sp-sheet'), box = el('div', 'kb-box'), ctl = el('div', 'ap-ctl');
    var bP = btn('▶︎ 播放', 'primary'); bP.onclick = function () { clock.tid ? stop() : play(); };
    var tM = btn('右手旋律：開'), tA = btn('左手伴奏：開');
    tM.onclick = function () { useM = !useM; tM.textContent = '右手旋律：' + (useM ? '開' : '關'); };
    tA.onclick = function () { useA = !useA; tA.textContent = '左手伴奏：' + (useA ? '開' : '關'); };
    var sel = el('select'); sel.setAttribute('aria-label', '伴奏型'); plist.forEach(function (k) { sel.appendChild(new Option(PAT[k].name, k)); }); sel.onchange = function () { pat = sel.value; };
    var rng = el('input'); rng.type = 'range'; rng.min = 40; rng.max = 140; rng.value = bpm; rng.setAttribute('aria-label', '速度');
    var bl = el('b', '', bpm + ' BPM'); rng.oninput = function () { bpm = +rng.value; bl.textContent = bpm + ' BPM'; };
    var lr = el('label'); lr.appendChild(document.createTextNode('速度 ')); lr.appendChild(rng);
    ctl.appendChild(bP); ctl.appendChild(tM); ctl.appendChild(tA); if (plist.length > 1) ctl.appendChild(sel); ctl.appendChild(lr); ctl.appendChild(bl);
    sp.appendChild(sheet); sp.appendChild(box); sp.appendChild(ctl);
    var K = Keys(box, 36, 84); K.labels('name');
    // 簡譜排版：每小節一格，上方標和弦
    var bars = [], b = 0, cnt = pickup ? meter - pickup : 0;
    if (pickup) bars.push({ chord: null, beats: [] });
    beats.forEach(function (t, i) {
      if (!pickup || i >= pickup) { if ((i - (pickup || 0)) % meter === 0) bars.push({ chord: chordList[bars.length - (pickup ? 1 : 0)], beats: [] }); }
      bars[bars.length - 1].beats.push({ t: t, i: i });
    });
    void b; void cnt;
    function fmt(t) { return t.split('_').map(function (x) { if (x === '-') return '－'; var up = (x.match(/'/g) || []).length, dn = (x.match(/,/g) || []).length, n = x.replace(/[',#b]/g, ''); return '<span class="' + (up ? 'hi' : dn ? 'lo' : '') + '">' + (x.indexOf('#') > -1 ? '♯' : x.indexOf('b') > -1 ? '♭' : '') + n + '</span>'; }).join(''); }
    if (bars.length > 12) sheet.classList.add('long');
    sheet.innerHTML = bars.map(function (bar) { return '<div class="sp-bar"><div class="sp-ch">' + (bar.chord ? bar.chord.map(function (c) { return c.name; }).join('　') : '') + '</div><div class="sp-mel">' + bar.beats.map(function (x) { return '<i data-i="' + x.i + '">' + fmt(x.t) + '</i>'; }).join('') + '</div></div>'; }).join('');
    // 排程：以八分音符的一半（每拍 6 格）為單位，方便三連音與八分音符
    var DIV = 6;
    var clock = new Clock(function () { return 60 / bpm / DIV; }, function (s, t) {
      var beat = Math.floor(s / DIV), sub = s % DIV;
      if (beat >= beats.length) return false;
      var tok = beats[beat], parts = tok.split('_'), per = DIV / parts.length;
      if (useM && sub % per === 0) {
        var x = parts[sub / per];
        if (x && x !== '-' && x !== '0') {
          var len = 1, j = beat + 1; while (beats[j] === '-') { len++; j++; }
          var m = melNote(x, key); if (m != null) piano(m, t, (parts.length > 1 ? 1 / parts.length : len) * 60 / bpm, 0.3);
        }
      }
      if (useA && beat >= pickup) {
        var P = PAT[pat], ab = beat - pickup, per2 = DIV / P.div;
        if (sub % per2 === 0) {
          var slotsArr = P.seq.replace(/\|/g, ' ').trim().split(/\s+/), perBar = P.meter * P.div, step = ab * P.div + sub / per2;
          var ch = chordAt(ab);
          var tk = slotsArr[(step % perBar) + (Math.floor(step / perBar) % Math.max(1, Math.round(slotsArr.length / perBar))) * perBar];
          if (ch && tk && tk !== '-') { var v = voices(ch); tk.split('+').forEach(function (z) { if (TOK[z] != null && TOK[z] < 4) piano(v[TOK[z]], t, 60 / bpm / P.div * 1.5, 0.16); }); }
        }
      }
    });
    clock.onVisual = function (s) {
      if (s % DIV) return; var beat = s / DIV;
      $$('.sp-mel i', sheet).forEach(function (i) { i.classList.toggle('now', +i.getAttribute('data-i') === beat); });
      var tok = beats[beat]; K.clear('now');
      if (tok) { var x = tok.split('_')[0]; var m = x && x !== '-' && x !== '0' ? melNote(x, key) : null; if (m != null) K.mark([m], 'now'); }
      if (beat >= pickup) { var ch = chordAt(beat - pickup); if (ch) { K.clear(); var v = voices(ch).slice(0, 4); K.mark(v, 'on'); } }
    };
    clock.onEnd = function () { stop(); };
    function play() { if (clock.start()) bP.textContent = '■ 停止'; }
    function stop() { clock.stop(); bP.textContent = '▶︎ 播放'; K.clear('now'); $$('.sp-mel i', sheet).forEach(function (i) { i.classList.remove('now'); }); }
    stoppers.push(stop);
  });

  window.PixelPiano = { play: piano, staffSVG: staffSVG, patterns: PAT };
})();
