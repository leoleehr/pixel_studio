/* ===== Songwriting Lab 詞曲創作互動工具 =====
 * .formbuilder  曲式積木：排出段落，檢查前後順序，畫出情緒曲線
 * .rhyme        韻腳檢查器：逐行判斷句尾的韻母，說明押韻方式
 * .motif        動機實驗室：重複、模進、倒影、逆行、擴大、聯結
 * .chordprog    和弦進行：經典進行、移調、播放
 * .arranger     編曲混音台：主律動、副律動、主旋律、過門、襯底
 * .songcard     創作範本卡：八堂課共用一張，存在這台裝置，可送給老師或下載
 * .notebook     素材庫：詞典、句典、曲典
 * .themedice    主題骰子：取材 × 切入點 × 情感議題
 * .people       作詞家、作曲家介紹
 */
(function () {
  'use strict';
  var NS = 'pixel:songwriting:';
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  };
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; return b; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slideNo(root) { var s = root && root.closest && root.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(root, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(root) }); }
  function say(msg, kind) { if (window.PixelBackend) window.PixelBackend.toast(msg, kind); }
  function download(text, name) {
    var blob = new Blob(['﻿' + text], { type: 'text/plain;charset=utf-8' }), u = URL.createObjectURL(blob), a = el('a');
    a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(u); }, 4000);
  }

  /* ---------- 音訊：簡易合成器 ---------- */
  var master = null, noiseBuf = null;
  function ac() { return window.PS && PS.audio ? PS.audio.ctx() : null; }
  function out() {
    var c = ac(); if (!c) return null;
    if (!master || master.context !== c) {
      var comp = c.createDynamicsCompressor(); comp.threshold.value = -14; comp.ratio.value = 4;
      master = c.createGain(); master.gain.value = 0.8; master.connect(comp).connect(c.destination);
    }
    return master;
  }
  function noise() {
    var c = ac(); if (noiseBuf && noiseBuf.sampleRate === c.sampleRate) return noiseBuf;
    noiseBuf = c.createBuffer(1, c.sampleRate, c.sampleRate);
    var d = noiseBuf.getChannelData(0); for (var i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }
  function hz(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function env(g, t, a, peak, dec, end) { g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(peak, t + a); g.gain.exponentialRampToValueAtTime(0.0001, t + end); }
  var SYN = {
    piano: function (m, t, dur, vol, dest) {
      var c = ac(), g = c.createGain(), o1 = c.createOscillator(), o2 = c.createOscillator(), g2 = c.createGain();
      o1.type = 'triangle'; o1.frequency.value = hz(m); o2.type = 'sine'; o2.frequency.value = hz(m) * 2; g2.gain.value = 0.25;
      env(g, t, 0.006, vol, 0, Math.max(0.25, Math.min(dur + 0.4, 2.2)));
      o1.connect(g); o2.connect(g2).connect(g); g.connect(dest);
      o1.start(t); o2.start(t); o1.stop(t + 2.4); o2.stop(t + 2.4);
    },
    lead: function (m, t, dur, vol, dest) {
      var c = ac(), g = c.createGain(), o = c.createOscillator(), f = c.createBiquadFilter(), lfo = c.createOscillator(), lg = c.createGain();
      o.type = 'square'; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = 2200;
      lfo.frequency.value = 5.5; lg.gain.value = hz(m) * 0.006; lfo.connect(lg).connect(o.frequency);
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.setValueAtTime(vol, t + Math.max(0.03, dur - 0.05)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.08);
      o.connect(f).connect(g).connect(dest); o.start(t); lfo.start(t); o.stop(t + dur + 0.1); lfo.stop(t + dur + 0.1);
    },
    pad: function (m, t, dur, vol, dest) {
      var c = ac(), g = c.createGain(), f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 1400;
      [-6, 6].forEach(function (cent) { var o = c.createOscillator(); o.type = 'sawtooth'; o.frequency.value = hz(m); o.detune.value = cent; o.connect(f); o.start(t); o.stop(t + dur + 0.6); });
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.35); g.gain.setValueAtTime(vol, t + Math.max(0.36, dur - 0.1)); g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.5);
      f.connect(g).connect(dest);
    },
    bass: function (m, t, dur, vol, dest) {
      var c = ac(), g = c.createGain(), o = c.createOscillator(), f = c.createBiquadFilter();
      o.type = 'triangle'; o.frequency.value = hz(m); f.type = 'lowpass'; f.frequency.value = 600;
      env(g, t, 0.008, vol, 0, Math.min(dur + 0.08, 0.9)); o.connect(f).connect(g).connect(dest); o.start(t); o.stop(t + 1);
    },
    kick: function (t, vol, dest) {
      var c = ac(), o = c.createOscillator(), g = c.createGain();
      o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.14);
      env(g, t, 0.003, vol, 0, 0.3); o.connect(g).connect(dest); o.start(t); o.stop(t + 0.32);
    },
    snare: function (t, vol, dest) {
      var c = ac(), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = noise(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.7;
      env(g, t, 0.002, vol, 0, 0.18); s.connect(f).connect(g).connect(dest); s.start(t); s.stop(t + 0.2);
      var o = c.createOscillator(), g2 = c.createGain(); o.frequency.value = 190; env(g2, t, 0.002, vol * 0.5, 0, 0.09); o.connect(g2).connect(dest); o.start(t); o.stop(t + 0.1);
    },
    hat: function (t, vol, dest, open) {
      var c = ac(), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = noise(); f.type = 'highpass'; f.frequency.value = 7000;
      env(g, t, 0.001, vol, 0, open ? 0.32 : 0.05); s.connect(f).connect(g).connect(dest); s.start(t); s.stop(t + 0.35);
    },
    crash: function (t, vol, dest) {
      var c = ac(), s = c.createBufferSource(), f = c.createBiquadFilter(), g = c.createGain();
      s.buffer = noise(); f.type = 'highpass'; f.frequency.value = 4500;
      env(g, t, 0.002, vol, 0, 1.4); s.connect(f).connect(g).connect(dest); s.start(t); s.stop(t + 1);
    }
  };
  // 共用排程器：每 25ms 檢查一次，提前 0.12 秒排入下一步
  function Clock(stepSec, onStep) {
    this.stepSec = stepSec; this.onStep = onStep; this.tid = 0; this.step = 0; this.next = 0;
  }
  Clock.prototype.start = function () {
    var c = ac(); if (!c) return false; out();
    var self = this; this.step = 0; this.next = c.currentTime + 0.08;
    this.tid = setInterval(function () {
      while (self.next < c.currentTime + 0.12) {
        var st = self.step, at = self.next;
        self.onStep(st, at);
        setTimeout(function () { if (self.tid && self.onVisual) self.onVisual(st); }, Math.max(0, (at - c.currentTime) * 1000));
        self.step++; self.next += typeof self.stepSec === 'function' ? self.stepSec() : self.stepSec;
      }
    }, 25);
    return true;
  };
  Clock.prototype.stop = function () { clearInterval(this.tid); this.tid = 0; };
  var players = [];
  document.addEventListener('slide:change', function (e) { if (e.detail && e.detail.mobile) return; players.forEach(function (p) { p(); }); });

  /* ---------- 音名與簡譜 ---------- */
  var MAJ = [0, 2, 4, 5, 7, 9, 11];
  var KEY_NAMES = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  function degMidi(s, tonic) { var o = Math.floor(s / 7), k = ((s % 7) + 7) % 7; return (tonic || 60) + MAJ[k] + 12 * o; }
  function degLabel(s) { var k = ((s % 7) + 7) % 7; return { n: k + 1, hi: s >= 7, lo: s < 0 }; }
  function parseJianpu(str) { // 「1 3 5 6 | 5 - 3 -」：' 高八度、, 低八度、- 延長、0 休止
    return str.replace(/\|/g, ' ').trim().split(/\s+/).map(function (t) {
      if (t === '-') return '-'; if (t === '0') return null;
      var n = parseInt(t, 10) - 1, up = (t.match(/'/g) || []).length, dn = (t.match(/,/g) || []).length;
      return n + 7 * (up - dn);
    });
  }

  /* ========== 1. 曲式積木 ========== */
  var SEC = {
    intro: { zh: '前奏', en: 'Intro', e: 3, bars: 4 },
    verse: { zh: '主歌', en: 'Verse', e: 4, bars: 8 },
    pre: { zh: '前副歌', en: 'Pre-Chorus', e: 6, bars: 4 },
    chorus: { zh: '副歌', en: 'Chorus', e: 9, bars: 8 },
    inter: { zh: '間奏', en: 'Interlude', e: 5, bars: 4 },
    bridge: { zh: '後副歌／橋段', en: 'Bridge', e: 8, bars: 4 },
    tag: { zh: '破格句', en: 'Tag', e: 6, bars: 2 },
    outro: { zh: '尾奏', en: 'Outro', e: 3, bars: 4 },
    ending: { zh: '結尾', en: 'Ending', e: 1, bars: 1 }
  };
  var PRESET = {
    formula: ['intro', 'verse', 'verse', 'pre', 'chorus', 'inter', 'verse', 'pre', 'chorus', 'bridge', 'chorus', 'chorus', 'outro', 'ending'],
    simple: ['intro', 'verse', 'chorus', 'inter', 'verse', 'chorus', 'chorus', 'outro', 'ending'],
    ballad: ['intro', 'verse', 'pre', 'chorus', 'inter', 'verse', 'pre', 'chorus', 'bridge', 'chorus', 'tag', 'ending']
  };
  function formText(list) { return list.map(function (b) { return SEC[b.k].zh + (b.bars ? ' ' + b.bars : ''); }).join(' → '); }
  function checkForm(list) {
    var msg = [], bad = [];
    function at(i) { return list[i] && list[i].k; }
    if (!list.length) return { msg: [], bad: [] };
    if (list.indexOf && !list.some(function (b) { return b.k === 'chorus'; })) msg.push(['warn', '少了副歌：副歌是全曲的賣點，缺少這一段，歌曲的價值會大幅降低。']);
    list.forEach(function (b, i) {
      var nx = at(i + 1);
      if (b.k === 'intro' && i > 0) { bad.push(i); msg.push(['warn', '前奏放在第 ' + (i + 1) + ' 段：前奏之前沒有其他段落，只有專輯序曲例外。']); }
      if (b.k === 'intro' && nx && nx !== 'verse') { bad.push(i + 1); msg.push(['warn', '前奏之後要接主歌。']); }
      if (b.k === 'pre' && nx !== 'chorus' && nx !== 'inter') { bad.push(i); msg.push(['warn', '前副歌之後要接副歌：這一段負責加溫，將能量交給副歌解決。']); }
      if (b.k === 'bridge' && nx && nx !== 'chorus') { bad.push(i); msg.push(['warn', '後副歌（橋段）之後要接回副歌。']); }
      if (b.k === 'outro' && nx && nx !== 'ending') { bad.push(i); msg.push(['warn', '尾奏之後要接結尾。']); }
      if (b.k === 'ending' && i !== list.length - 1) { bad.push(i); msg.push(['warn', '結尾是歌曲的最後一個段落，之後不再有其他段落。']); }
      if (b.k === 'inter' && i > 0 && at(i - 1) !== 'chorus' && at(i - 1) !== 'tag') msg.push(['warn', '間奏通常放在副歌之後，作為兩大段落之間的緩衝區。']);
      if (b.k === 'verse' && nx && ['pre', 'chorus', 'verse', 'inter'].indexOf(nx) < 0) msg.push(['warn', '主歌之後通常接前副歌或副歌。']);
    });
    if (!msg.length) msg.push(['ok', '結構通順：段落的先後順序都符合流行歌曲的規則。']);
    var seen = {}; msg = msg.filter(function (m) { if (seen[m[1]]) return false; seen[m[1]] = 1; return true; });
    return { msg: msg, bad: bad };
  }
  $$('.formbuilder').forEach(function (fb) {
    var id = 'form-' + (fb.getAttribute('data-id') || 'main');
    var st = LS.get(id, null) || { list: (fb.getAttribute('data-preset') ? PRESET[fb.getAttribute('data-preset')] : []).map(function (k) { return { k: k, bars: SEC[k].bars }; }), bpm: 80 };
    fb.innerHTML = '';
    var root = el('div', 'fb'), pal = el('div', 'fb-palette'), track = el('div', 'fb-track'), curve = el('div'), stat = el('div', 'fb-stat'), msg = el('p', 'fb-msg'), row = el('div', 'btn-row fb-presets');
    Object.keys(SEC).forEach(function (k) { var b = el('button', 'f-' + k, SEC[k].zh); b.type = 'button'; b.title = SEC[k].en; b.onclick = function () { st.list.push({ k: k, bars: SEC[k].bars }); save(); }; pal.appendChild(b); });
    [['formula', '套用流行歌曲公式'], ['simple', '簡單版'], ['ballad', '抒情版（含破格句）']].forEach(function (p) { var b = btn(p[1]); b.onclick = function () { st.list = PRESET[p[0]].map(function (k) { return { k: k, bars: SEC[k].bars }; }); save(); }; row.appendChild(b); });
    var undo = btn('刪除最後一段'); undo.onclick = function () { st.list.pop(); save(); }; row.appendChild(undo);
    var clr = btn('清空'); clr.onclick = function () { st.list = []; save(); }; row.appendChild(clr);
    if (!fb.hasAttribute('data-nosave')) { var sv = btn('寫入創作範本卡', 'primary'); sv.onclick = function () { var c = LS.get('songcard', {}); c.form = formText(st.list); LS.set('songcard', c); document.dispatchEvent(new Event('songcard:update')); report(fb, 'form', { item: '曲式結構', result: c.form, value: st.list.length }); say('已寫入創作範本卡', 'ok'); }; row.appendChild(sv); }
    root.appendChild(pal); root.appendChild(track); root.appendChild(curve); root.appendChild(stat); root.appendChild(msg); root.appendChild(row); fb.appendChild(root);
    function save() { LS.set(id, st); draw(); }
    function draw() {
      track.innerHTML = '';
      var chk = checkForm(st.list);
      st.list.forEach(function (b, i) {
        var d = el('div', 'fb-block f-' + b.k + (chk.bad.indexOf(i) > -1 ? ' bad' : ''), '<b>' + SEC[b.k].zh + '</b><small>' + b.bars + ' 小節</small><span class="x" aria-hidden="true">✕</span>');
        d.style.setProperty('--w', Math.max(1, b.bars / 4)); d.title = '點選更改小節數，點選右上角刪除';
        d.onclick = function (e) {
          if (e.target.classList.contains('x')) { st.list.splice(i, 1); save(); return; }
          var opts = [1, 2, 4, 8, 16]; b.bars = opts[(opts.indexOf(b.bars) + 1) % opts.length]; save();
        };
        track.appendChild(d);
      });
      var total = st.list.reduce(function (a, b) { return a + b.bars; }, 0), sec = Math.round(total * 4 * 60 / (st.bpm || 80));
      stat.innerHTML = '<span>段落 <b>' + st.list.length + '</b></span><span>總長 <b>' + total + '</b> 小節</span><span>約 <b>' + Math.floor(sec / 60) + ':' + String(sec % 60).padStart(2, '0') + '</b></span><label>速度 <input type="number" min="40" max="200" value="' + (st.bpm || 80) + '"> BPM（4/4）</label>';
      stat.querySelector('input').onchange = function () { st.bpm = Math.max(40, Math.min(200, +this.value || 80)); save(); };
      msg.innerHTML = chk.msg.map(function (m) { return '<span class="' + m[0] + '">' + (m[0] === 'ok' ? '✓ ' : '! ') + esc(m[1]) + '</span>'; }).join('<br>');
      // 情緒曲線：依每段的能量與長度
      if (!st.list.length) { curve.innerHTML = ''; return; }
      var W = 1000, H = 70, x = 0, pts = [];
      st.list.forEach(function (b) { var w = b.bars / total * W; pts.push([x + w / 2, H - 6 - SEC[b.k].e / 10 * (H - 12)]); x += w; });
      var d = 'M0 ' + (H - 4) + ' L' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' L' + W + ' ' + (H - 4);
      curve.innerHTML = '<svg class="fb-curve" viewBox="0 0 ' + W + ' ' + H + '" preserveAspectRatio="none" aria-label="情緒曲線"><path class="area" d="' + d + ' Z"/><path d="' + d + '"/></svg>';
    }
    draw();
  });

  /* ========== 2. 韻腳檢查器 ========== */
  var RG = [
    { k: 'a', name: 'ㄚ', c: '#e8412b', words: '嗎、啊、他、花、回答、傷疤、牽掛、炎夏、抵達、尷尬、謊話、太傻、害怕' },
    { k: 'i', name: 'ㄧ ㄩ', c: '#e2407f', words: '你、意、雨、東西、抗拒、呼吸、空氣、可惜、天際、情侶、飄逸、伏筆、美麗' },
    { k: 'u', name: 'ㄨ', c: '#8a4fc0', words: '路、反覆、清楚、恍惚、結束、痛苦、相處、幸福' },
    { k: 'ao', name: 'ㄠ', c: '#2f5fc4', words: '好、少、要、鬧、呵護、知道、明瞭、美好' },
    { k: 'ei', name: 'ㄝ ㄟ', c: '#45b3e6', words: '鐵、貼、會、喜帖、心碎、喝醉、歲月、完美、虛偽、摧毀、結尾' },
    { k: 'o', name: 'ㄛ ㄡ', c: '#6cbb4b', words: '我、國、酒、錯、頭、沉默、寂寞、錯過、看破、所有、承諾、分手、折磨、寄託' },
    { k: 'en', name: 'ㄣ ㄥ', c: '#d6cf2c', words: '吻、恨、人、聲、責任、天份、飛行、繁星、決心、心情、安靜、靠近、絕境、表情、安穩' },
    { k: 'e', name: 'ㄜ', c: '#f4a62a', words: '了、的、個、樂、割捨、選擇、如何、顏色' },
    { k: 'an', name: 'ㄞ ㄢ', c: '#c2410c', words: '愛玩、信箱、緩慢、蔚藍、一半、飄散、難堪、黑白、忍耐、戀愛、喜歡、絢爛、期盼、離開、等待、勇敢、溫暖、循環、浪漫' },
    { k: 'ang', name: 'ㄤ', c: '#0f9d8a', words: '成長、嚮往、遠方、碰撞、淚光、模樣、綑綁、阻擋、珍藏、期望、冤枉、原諒、翅膀' },
    { k: 'zi', name: '空韻', c: '#7a7a85', words: '字、知、癡、詩、靜止、手指、瑕疵、自私、意識、掩飾、計時' }
  ];
  var RGK = {}; RG.forEach(function (g) { RGK[g.k] = g; });
  function groupOf(py) { // 拼音（無聲調）→ 韻組
    py = (py || '').toLowerCase().replace(/v/g, 'ü');
    if (/^(zh|ch|sh|r|z|c|s)i$/.test(py)) return 'zi';
    if (py === 'er') return 'e';
    var f = py.replace(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])/, '');
    if (/^[jqxy]u/.test(py) && f[0] === 'u') f = 'ü' + f.slice(1);
    if (py[0] === 'y' && f[0] !== 'i' && f[0] !== 'ü' && f[0] !== 'u') f = 'i' + f;
    if (py[0] === 'w' && f[0] !== 'u') f = 'u' + f;
    if (/(ang|iang|uang)$/.test(f)) return 'ang';
    if (/(eng|ing|ong|iong|en|in|un|ün)$/.test(f)) return 'en';
    if (/(an|ian|uan|üan|ai|uai)$/.test(f)) return 'an';
    if (/(ao|iao)$/.test(f)) return 'ao';
    if (/(ou|iu|iou|uo)$/.test(f) || f === 'o') return 'o';
    if (/(ie|üe|ue|ei|ui|uei)$/.test(f)) return 'ei';
    if (/^(a|ia|ua)$/.test(f)) return 'a';
    if (/^(u)$/.test(f)) return 'u';
    if (/^(i|ü)$/.test(f)) return 'i';
    if (f === 'e') return 'e';
    return '';
  }
  var pyP = null;
  function loadPinyin() {
    if (pyP) return pyP;
    pyP = new Promise(function (res, rej) {
      if (window.pinyinPro) return res(window.pinyinPro);
      var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js';
      s.onload = function () { window.pinyinPro ? res(window.pinyinPro) : rej(); }; s.onerror = rej; document.head.appendChild(s);
    });
    return pyP;
  }
  function lastHan(line) { var m = line.replace(/[\s　，。、！？；：「」『』（）()…\-—~～.,!?;:'"]+$/g, '').match(/[㐀-鿿]$/); return m ? m[0] : ''; }
  $$('.rhyme').forEach(function (r) {
    var id = 'rhyme-' + (r.getAttribute('data-id') || 'main');
    var sample = (r.getAttribute('data-sample') || '').replace(/\\n/g, '\n');
    var text = LS.get(id, null); if (text === null) text = sample;
    r.innerHTML = '';
    var box = el('div', 'rh'), left = el('div'), right = el('div');
    var ta = el('textarea'); ta.setAttribute('aria-label', '歌詞，每行一句'); ta.placeholder = '每行輸入一句歌詞，段落之間空一行'; ta.value = text;
    var st = el('div', 'rh-state', '載入拼音資料中…');
    left.appendChild(ta); left.appendChild(st);
    var foot = el('div', 'btn-row'); foot.style.marginTop = '8px';
    var bS = btn('還原範例'); bS.onclick = function () { ta.value = sample; LS.set(id, sample); run(); };
    var bC = btn('寫入創作範本卡', 'primary'); bC.onclick = function () { var c = LS.get('songcard', {}); c.rhyme = summaryText; LS.set('songcard', c); document.dispatchEvent(new Event('songcard:update')); report(r, 'rhyme', { item: '押韻方式', result: summaryText }); say('已寫入創作範本卡', 'ok'); };
    if (sample) foot.appendChild(bS); foot.appendChild(bC); left.appendChild(foot);
    var lines = el('div', 'rh-lines'), sum = el('div', 'rh-sum');
    var bank = el('div', 'rh-bank'), words = el('div', 'rh-words', '點選韻母，查看常用的韻腳字詞。');
    RG.forEach(function (g) { var b = el('button', '', g.name); b.type = 'button'; b.style.setProperty('--gc', g.c); b.onclick = function () { $$('button', bank).forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); words.textContent = g.words; }; bank.appendChild(b); });
    right.appendChild(lines); right.appendChild(sum); right.appendChild(bank); right.appendChild(words);
    box.appendChild(left); box.appendChild(right); r.appendChild(box);
    var summaryText = '', tid = 0;
    ta.addEventListener('input', function () { LS.set(id, ta.value); clearTimeout(tid); tid = setTimeout(run, 250); });
    function run() {
      var P = window.pinyinPro; if (!P) return;
      var raw = ta.value.split('\n'), paras = [[]], rows = [];
      raw.forEach(function (ln) {
        if (!ln.trim()) { if (paras[paras.length - 1].length) paras.push([]); return; }
        var ch = lastHan(ln), py = '', g = '';
        if (ch) { var arr = P.pinyin(ln.replace(/[^㐀-鿿]/g, ''), { toneType: 'none', type: 'array' }); py = arr[arr.length - 1] || ''; g = groupOf(py); }
        var row = { ln: ln.trim(), ch: ch, py: py, g: g }; rows.push(row); paras[paras.length - 1].push(row);
      });
      if (!paras[paras.length - 1].length) paras.pop();
      lines.innerHTML = '';
      rows.forEach(function (x) {
        var G = RGK[x.g], t = esc(x.ln); if (x.ch) { var k = t.lastIndexOf(x.ch); t = t.slice(0, k) + '<em>' + x.ch + '</em>' + t.slice(k + 1); }
        var d = el('div', 'rh-line', '<span class="t">' + t + '</span><span class="py">' + esc(x.py) + '</span><span class="g">' + (G ? G.name : '未知') + '</span>');
        if (G) d.querySelector('.g').style.setProperty('--gc', G.c); lines.appendChild(d);
      });
      var gs = rows.map(function (x) { return x.g; }).filter(Boolean);
      if (!gs.length) { sum.innerHTML = '輸入歌詞之後，這裡會說明押韻的方式。'; summaryText = ''; return; }
      var cnt = {}; gs.forEach(function (g) { cnt[g] = (cnt[g] || 0) + 1; });
      var keys = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
      var top = keys[0], ratio = cnt[top] / gs.length, kind;
      var paraMain = paras.map(function (p) { var c = {}; p.forEach(function (x) { if (x.g) c[x.g] = (c[x.g] || 0) + 1; }); var k = Object.keys(c).sort(function (a, b) { return c[b] - c[a]; })[0]; return { k: k, ok: k && c[k] / p.filter(function (x) { return x.g; }).length >= 0.6 }; });
      if (ratio >= 0.85) kind = '一韻到底';
      else if (paras.length > 1 && paraMain.every(function (p) { return p.ok; }) && paraMain.some(function (p, i) { return i && p.k !== paraMain[0].k; })) kind = '段落換韻';
      else if (ratio >= 0.5) kind = '斷句換韻';
      else kind = '自由換韻';
      var tip = { '一韻到底': '句句同韻，韻律性最高，選字的難度也最高。', '段落換韻': '每段各押一個韻，換段才換韻，情緒隨著段落更迭。', '斷句換韻': '大部分句子押同一個韻，少數句子換韻，依靠口氣製造差異。', '自由換韻': '韻腳分散，韻律性降低。可以挑一個主韻，讓副歌的句尾集中在同一個韻。' }[kind];
      summaryText = kind + '；主韻 ' + RGK[top].name + '（' + cnt[top] + '/' + gs.length + ' 句）' + (paras.length > 1 ? '；各段：' + paraMain.map(function (p) { return p.k ? RGK[p.k].name : '無'; }).join('、') : '');
      sum.innerHTML = '押韻方式：<b>' + kind + '</b>，主韻 <b>' + RGK[top].name + '</b>（' + cnt[top] + ' / ' + gs.length + ' 句）。<br>' + tip;
      bank.querySelectorAll('button').forEach(function (b, i) { if (RG[i].k === top && !bank.querySelector('.on')) { b.classList.add('on'); words.textContent = RG[i].words; } });
    }
    var ob = new IntersectionObserver(function (es) {
      if (!es.some(function (e) { return e.isIntersecting; })) return; ob.disconnect();
      loadPinyin().then(function () { st.textContent = '依照拼音判斷句尾的韻母；多音字若判斷有誤，請以實際的讀音為準。'; run(); })
        .catch(function () { st.textContent = '無法載入拼音資料，請確認網路連線。'; });
    }, { rootMargin: '200px' });
    ob.observe(r);
    if (r.closest('.slide')) document.addEventListener('slide:change', function () { if (r.closest('.slide').classList.contains('active')) { ob.disconnect(); loadPinyin().then(function () { st.textContent = '依照拼音判斷句尾的韻母；多音字若判斷有誤，請以實際的讀音為準。'; run(); }).catch(function () {}); } });
  });

  /* ========== 3. 動機實驗室 ========== */
  var OPS = {
    orig: { label: '原型', desc: '動機：一段短小、有特色的音型，是整首旋律的種子。', f: function (a) { return a; } },
    rep: { label: '重複', desc: '重複：同一個動機再出現一次，讓聽眾記住它。', f: function (a) { return a.concat(a); } },
    seq: { label: '模進（上行二度）', desc: '模進：動機整體往上移動一個音級，形狀不變、位置改變。', f: function (a) { return a.concat(shift(a, 1)); } },
    seqd: { label: '模進（下行三度）', desc: '模進：往下移動兩個音級，旋律像下樓梯一樣層層遞進。', f: function (a) { return a.concat(shift(a, -2)); } },
    inv: { label: '形變：倒影', desc: '倒影：以第一個音為鏡面，上行改成下行、下行改成上行。', f: function (a) { var p = first(a); return a.concat(a.map(function (x) { return typeof x === 'number' ? 2 * p - x : x; })); } },
    ret: { label: '形變：逆行', desc: '逆行：音符的順序從尾到頭倒過來演奏。', f: function (a) { return a.concat(retro(a)); } },
    aug: { label: '形變：擴大', desc: '擴大：每個音的時值變成兩倍，同樣的音型變得悠長。', f: function (a) { var r = []; a.forEach(function (x) { r.push(x, typeof x === 'number' || x === '-' ? '-' : null); }); return r; } },
    link: { label: '聯結', desc: '聯結：動機、模進，最後回到主音 1，形成一個完整的樂句。', f: function (a) { var b = shift(a, -1), k = b.length - 1; while (k >= 0 && typeof b[k] !== 'number') k--; if (k >= 0) { var prev = b[k]; b[k] = Math.round(prev / 7) * 7; } return a.concat(b); } }
  };
  function shift(a, k) { return a.map(function (x) { return typeof x === 'number' ? x + k : x; }); }
  function first(a) { for (var i = 0; i < a.length; i++) if (typeof a[i] === 'number') return a[i]; return 0; }
  function events(a) { var ev = []; a.forEach(function (x) { if (x === '-' && ev.length) ev[ev.length - 1].len++; else ev.push({ v: x === '-' ? null : x, len: 1 }); }); return ev; }
  function retro(a) { var r = []; events(a).reverse().forEach(function (e) { r.push(e.v); for (var i = 1; i < e.len; i++) r.push(e.v === null ? null : '-'); }); return r; }
  $$('.motif').forEach(function (m) {
    var id = 'motif-' + (m.getAttribute('data-id') || 'main'), def = m.getAttribute('data-notes') || "1 2 3 5 | 3 - 0 0";
    var hiR = +(m.getAttribute('data-hi') || 9), loR = +(m.getAttribute('data-lo') || -3), ROWS = []; for (var rr = hiR; rr >= loR; rr--) ROWS.push(rr);
    var base = LS.get(id, null) || parseJianpu(def), op = 'orig', bpm = +(m.getAttribute('data-bpm') || 96);
    var steps = base.length;
    m.innerHTML = '';
    var root = el('div', 'mo'), grid = el('div', 'mo-grid'), num = el('div', 'mo-num'), ops = el('div', 'mo-ops'), desc = el('p', 'mo-desc'), ctl = el('div', 'btn-row');
    grid.style.setProperty('--steps', steps);
    ROWS.forEach(function (s) {
      var L = degLabel(s); grid.appendChild(el('div', 'lab', '<span class="' + (L.hi ? 'hi' : L.lo ? 'lo' : '') + '">' + L.n + '</span>'));
      for (var c = 0; c < steps; c++) (function (c) {
        var d = el('div', 'cell' + (c % 4 === 0 && c ? ' bar' : '')); d.setAttribute('data-s', s); d.setAttribute('data-c', c);
        d.onclick = function () { base[c] = base[c] === s ? null : s; LS.set(id, base); draw(); SYN.piano(degMidi(s), ac().currentTime + 0.01, 0.3, 0.3, out()); };
        grid.appendChild(d);
      })(c);
    });
    Object.keys(OPS).forEach(function (k) { var b = btn(OPS[k].label); b.setAttribute('data-op', k); b.onclick = function () { op = k; draw(); play(); }; ops.appendChild(b); });
    var bP = btn('▶︎ 播放', 'primary'), bR = btn('還原動機');
    bP.onclick = function () { clock.tid ? stop() : play(); };
    bR.onclick = function () { base = parseJianpu(def); LS.set(id, base); draw(); };
    ctl.appendChild(bP); ctl.appendChild(bR);
    root.appendChild(grid); root.appendChild(num); root.appendChild(ops); root.appendChild(desc); root.appendChild(ctl); m.appendChild(root);
    function result() { return OPS[op].f(base.slice()); }
    function draw() {
      $$('.cell', grid).forEach(function (d) { var c = +d.getAttribute('data-c'), s = +d.getAttribute('data-s'); var v = base[c]; d.classList.toggle('on', v === s); });
      var res = result();
      num.innerHTML = res.map(function (x, i) { if (x === '-') return '<span data-i="' + i + '">－</span>'; if (x === null || x === undefined) return '<span data-i="' + i + '">0</span>'; var L = degLabel(x); return '<span data-i="' + i + '" class="' + (L.hi ? 'hi' : L.lo ? 'lo' : '') + '">' + L.n + '</span>'; }).join('');
      $$('button', ops).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-op') === op); });
      desc.textContent = OPS[op].desc;
    }
    var seq = [];
    var clock = new Clock(function () { return 60 / bpm / 2; }, function (st, t) {
      if (st >= seq.length) { setTimeout(stop, 50); return; }
      var x = seq[st]; if (typeof x !== 'number') return;
      var len = 1; while (seq[st + len] === '-') len++;
      SYN.piano(degMidi(x), t, len * 60 / bpm / 2, 0.32, out());
    });
    clock.onVisual = function (st) { $$('span', num).forEach(function (s) { s.classList.toggle('now', +s.getAttribute('data-i') === st); }); };
    function play() { stop(); seq = result(); if (clock.start()) bP.textContent = '■ 停止'; }
    function stop() { clock.stop(); bP.textContent = '▶︎ 播放'; $$('span', num).forEach(function (s) { s.classList.remove('now'); }); }
    players.push(stop);
    draw();
  });

  /* ========== 4. 和弦進行 ========== */
  var PROG = {
    fifties: { name: '1645', deg: ['I', 'vi', 'IV', 'V'], note: '五〇年代進行，抒情歌最常見的循環' },
    pop: { name: '1564', deg: ['I', 'V', 'vi', 'IV'], note: '萬用進行，無數流行歌曲的骨架' },
    canon: { name: '卡農進行', deg: ['I', 'V', 'vi', 'iii', 'IV', 'I', 'IV', 'V'], note: '帕海貝爾〈卡農〉的低音線，華語情歌的經典' },
    royal: { name: '4536', deg: ['IV', 'V', 'iii', 'vi'], note: '日系與華語副歌常用，情緒向上推進' },
    minor: { name: '6415', deg: ['vi', 'IV', 'I', 'V'], note: '從小調開始，帶有一點憂傷' },
    seventh: { name: '1625（七和弦）', deg: ['I', 'vi7', 'ii7', 'V7'], note: '流行音樂育成中心教材：C Am7 Dm7 G7' },
    jazzy: { name: '2536', deg: ['ii7', 'V7', 'iii7', 'vi'], note: '流行音樂育成中心教材：Dm7 G7 Em7 Am' },
    andalusian: { name: '6543', deg: ['vi', 'V', 'IV', 'III'], note: '流行音樂育成中心教材：Am G F E，下行的戲劇張力' },
    cadence: { name: '16451', deg: ['I', 'vi', 'IV', 'V', 'I'], note: '和弦家族：主和弦開始與結束、屬和弦在結束之前' }
  };
  var ROMAN = { I: [0, ''], ii: [1, 'm'], iii: [2, 'm'], III: [2, ''], IV: [3, ''], V: [4, ''], vi: [5, 'm'], vii: [6, 'dim'], ii7: [1, 'm7'], iii7: [2, 'm7'], vi7: [5, 'm7'], V7: [4, '7'] };
  var FN = { 0: '主和弦', 5: '主和弦', 2: '主和弦', 4: '屬和弦', 3: '下屬和弦', 1: '下屬和弦', 6: '屬和弦' };
  var FN_LABEL = { I: '主和弦', vi: '主和弦（代理）', vi7: '主和弦（代理）', iii: '主和弦（代理）', iii7: '主和弦（代理）', III: '屬和弦（借用）', IV: '下屬和弦', ii: '下屬和弦', ii7: '下屬和弦', V: '屬和弦', V7: '屬和弦', vii: '屬和弦' };
  function chordOf(rn, tonic) {
    var r = ROMAN[rn], root = (tonic + MAJ[r[0]]) % 12, q = r[1];
    var iv = q === 'm' ? [0, 3, 7] : q === 'm7' ? [0, 3, 7, 10] : q === '7' ? [0, 4, 7, 10] : q === 'dim' ? [0, 3, 6] : [0, 4, 7];
    var name = KEY_NAMES[root] + (q === 'dim' ? '°' : q);
    return { name: name, root: root, iv: iv };
  }
  function voice(ch) { var base = 52; var notes = ch.iv.map(function (i) { var m = ch.root + i; while (m < base) m += 12; return m; }); return notes.sort(function (a, b) { return a - b; }); }
  $$('.chordprog').forEach(function (cp) {
    var list = (cp.getAttribute('data-progs') || 'fifties pop canon royal minor').split(/\s+/), cur = list[0], key = 0, bpm = +(cp.getAttribute('data-bpm') || 80);
    cp.innerHTML = '';
    var root = el('div', 'cp'), pick = el('div', 'cp-pick'), bars = el('div', 'cp-bars'), note = el('p', 'muted'), ctl = el('div', 'cp-ctl');
    note.style.margin = '0'; note.style.fontSize = '16px';
    list.forEach(function (k) { var b = btn(PROG[k].name); b.setAttribute('data-k', k); b.onclick = function () { cur = k; draw(); if (clock.tid) { stop(); play(); } }; pick.appendChild(b); });
    var sel = el('select'); KEY_NAMES.forEach(function (n, i) { sel.appendChild(new Option(n + ' 大調', i)); }); sel.onchange = function () { key = +sel.value; draw(); };
    var rng = el('input'); rng.type = 'range'; rng.min = 50; rng.max = 140; rng.value = bpm; var bl = el('b', '', bpm + ' BPM');
    rng.oninput = function () { bpm = +rng.value; bl.textContent = bpm + ' BPM'; };
    var bP = btn('▶︎ 播放', 'primary'); bP.onclick = function () { clock.tid ? stop() : play(); };
    var lk = el('label'); lk.appendChild(document.createTextNode('調性 ')); lk.appendChild(sel);
    var lb = el('label'); lb.appendChild(document.createTextNode('速度 ')); lb.appendChild(rng);
    ctl.appendChild(bP); ctl.appendChild(lk); ctl.appendChild(lb); ctl.appendChild(bl);
    root.appendChild(pick); root.appendChild(bars); root.appendChild(note); root.appendChild(ctl); cp.appendChild(root);
    function chords() { return PROG[cur].deg.map(function (d) { var c = chordOf(d, key); c.rn = d; return c; }); }
    function draw() {
      var cs = chords(); bars.style.setProperty('--n', Math.min(cs.length, 4)); bars.innerHTML = '';
      cs.forEach(function (c) { bars.appendChild(el('div', '', '<b>' + c.name + '</b><small>' + c.rn + '</small><span class="fn">' + (FN_LABEL[c.rn] || '') + '</span>')); });
      $$('button', pick).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === cur); });
      note.textContent = PROG[cur].note;
    }
    var clock = new Clock(function () { return 60 / bpm; }, function (st, t) {
      var cs = chords(), bar = Math.floor(st / 4) % cs.length, beat = st % 4, c = cs[bar], v = voice(c), d = 60 / bpm;
      if (beat === 0) { SYN.bass(36 + c.root + (c.root > 7 ? -12 : 0) + 12, t, d * 2, 0.34, out()); v.forEach(function (m) { SYN.piano(m, t, d * 3.6, 0.13, out()); }); }
      if (beat === 2) { SYN.bass(36 + c.root + (c.root > 7 ? -12 : 0) + 12, t, d * 1.5, 0.26, out()); v.forEach(function (m) { SYN.piano(m, t, d * 1.6, 0.08, out()); }); }
    });
    clock.onVisual = function (st) { var cs = chords(), bar = Math.floor(st / 4) % cs.length; [].forEach.call(bars.children, function (d, i) { d.classList.toggle('now', i === bar); }); };
    function play() { if (clock.start()) bP.textContent = '■ 停止'; }
    function stop() { clock.stop(); bP.textContent = '▶︎ 播放'; [].forEach.call(bars.children, function (d) { d.classList.remove('now'); }); }
    players.push(stop);
    draw();
  });

  /* ========== 5. 編曲混音台 ========== */
  var AR_CH = [[48, [60, 64, 67]], [45, [57, 60, 64]], [41, [57, 60, 65]], [43, [55, 59, 62]]]; // C Am F G
  var AR_LEAD = [[0, 64, 4], [4, 67, 4], [8, 69, 2], [10, 67, 2], [12, 64, 4], [16, 72, 6], [22, 71, 2], [24, 69, 8], [32, 69, 4], [36, 72, 4], [40, 74, 2], [42, 72, 2], [44, 69, 4], [48, 67, 8], [56, 74, 4], [60, 71, 4]];
  var TRACKS = [
    { k: 'mr', zh: '主律動', en: 'Main Rhythm', inst: '鼓組、貝斯', rgb: '232,65,43',
      hit: function (s) { var b = s % 16; return [0, 4, 8, 10, 12].indexOf(b) > -1 || b % 2 === 0; },
      play: function (s, t, v, d) { var b = s % 16, bar = Math.floor(s / 16) % 4; if (b === 0 || b === 8 || b === 10) SYN.kick(t, 0.9 * v, d); if (b === 4 || b === 12) SYN.snare(t, 0.5 * v, d); if (b % 2 === 0) SYN.hat(t, 0.16 * v, d, b === 14); if ([0, 3, 6, 8, 11, 14].indexOf(b) > -1) SYN.bass(AR_CH[bar][0] - 12 + 12, t, 0.22, 0.42 * v, d); } },
    { k: 'sr', zh: '副律動', en: 'Sub Rhythm', inst: '鋼琴、吉他', rgb: '244,166,42',
      hit: function (s) { return [2, 6, 10, 14].indexOf(s % 16) > -1; },
      play: function (s, t, v, d) { var b = s % 16, bar = Math.floor(s / 16) % 4; if ([2, 6, 10, 14].indexOf(b) > -1) AR_CH[bar][1].forEach(function (m) { SYN.piano(m, t, 0.18, 0.09 * v, d); }); } },
    { k: 'lead', zh: '主旋律', en: 'Lead', inst: '人聲、獨奏樂器', rgb: '226,64,127',
      hit: function (s) { return AR_LEAD.some(function (n) { return n[0] === s % 64; }); },
      play: function (s, t, v, d, sec) { AR_LEAD.forEach(function (n) { if (n[0] === s % 64) SYN.lead(n[1], t, n[2] * sec * 0.95, 0.09 * v, d); }); } },
    { k: 'fill', zh: '過門', en: 'Fill In', inst: '鼓、任何樂器', rgb: '69,179,230',
      hit: function (s) { return s % 64 >= 56 || s % 64 === 0; },
      play: function (s, t, v, d) { var p = s % 64; if (p >= 56) { SYN.snare(t, (0.18 + (p - 56) * 0.05) * v, d); } if (p === 0 && s > 0) SYN.crash(t, 0.22 * v, d); } },
    { k: 'pad', zh: '襯底', en: 'Pad', inst: '弦樂、合成器', rgb: '108,187,75',
      hit: function (s) { return s % 16 === 0; },
      play: function (s, t, v, d, sec) { if (s % 16 === 0) AR_CH[Math.floor(s / 16) % 4][1].forEach(function (m) { SYN.pad(m + 12, t, 16 * sec, 0.035 * v, d); }); } }
  ];
  $$('.arranger').forEach(function (ar) {
    var on = (ar.getAttribute('data-on') || 'mr sr lead fill pad').split(/\s+/), bpm = +(ar.getAttribute('data-bpm') || 92), build = false, gains = {}, vols = {};
    ar.innerHTML = '';
    var root = el('div', 'ar'), ctl = el('div', 'ar-ctl'), list = el('div', 'ar-tracks');
    var bP = btn('▶︎ 播放', 'primary'), bB = btn('由少漸多'), bA = btn('全部開啟'), barL = el('span', 'ar-bar', '第 1 小節｜C');
    bP.onclick = function () { clock.tid ? stop() : play(); };
    bB.onclick = function () { build = true; on = []; draw(); if (!clock.tid) play(); };
    bA.onclick = function () { build = false; on = TRACKS.map(function (t) { return t.k; }); draw(); };
    ctl.appendChild(bP); ctl.appendChild(bB); ctl.appendChild(bA); ctl.appendChild(el('span', '', '<b>' + bpm + '</b> BPM・C → Am → F → G')); ctl.appendChild(barL);
    TRACKS.forEach(function (T) {
      vols[T.k] = 1;
      var row = el('div', 'ar-tr'); row.style.setProperty('--tc-rgb', T.rgb); row.setAttribute('data-k', T.k);
      row.innerHTML = '<div><b>' + T.zh + '</b><small>' + T.en + '・' + T.inst + '</small></div><div class="ar-steps">' + Array(17).join('<i></i>') + '</div>';
      var vol = el('input'); vol.type = 'range'; vol.min = 0; vol.max = 1.5; vol.step = 0.05; vol.value = 1; vol.setAttribute('aria-label', T.zh + '音量');
      vol.oninput = function () { vols[T.k] = +vol.value; if (gains[T.k]) gains[T.k].gain.value = vols[T.k]; };
      var tg = btn('', 'tg'); tg.onclick = function () { build = false; var i = on.indexOf(T.k); if (i > -1) on.splice(i, 1); else on.push(T.k); draw(); };
      row.appendChild(vol); row.appendChild(tg); list.appendChild(row);
    });
    root.appendChild(ctl); root.appendChild(list); ar.appendChild(root);
    function draw() {
      $$('.ar-tr', list).forEach(function (row) {
        var k = row.getAttribute('data-k'), T = TRACKS.filter(function (x) { return x.k === k; })[0], is = on.indexOf(k) > -1;
        row.classList.toggle('on', is); row.querySelector('.tg').textContent = is ? '開啟' : '靜音';
        $$('.ar-steps i', row).forEach(function (c, i) { c.classList.toggle('v', T.hit(i + 48 * (k === 'fill' ? 1 : 0))); });
      });
    }
    function gainOf(k) { var c = ac(); if (!gains[k] || gains[k].context !== c) { gains[k] = c.createGain(); gains[k].gain.value = vols[k]; gains[k].connect(out()); } return gains[k]; }
    var sec = function () { return 60 / bpm / 4; };
    var clock = new Clock(sec, function (s, t) {
      if (build && s % 64 === 0) { var nx = ['mr', 'sr', 'pad', 'lead', 'fill'].filter(function (k) { return on.indexOf(k) < 0; })[0]; if (nx) { on.push(nx); setTimeout(draw, Math.max(0, (t - ac().currentTime) * 1000)); } else build = false; }
      TRACKS.forEach(function (T) { if (on.indexOf(T.k) > -1) T.play(s, t, 1, gainOf(T.k), sec()); });
    });
    clock.onVisual = function (s) {
      var bar = Math.floor(s / 16) % 4; barL.textContent = '第 ' + (bar + 1) + ' 小節｜' + ['C', 'Am', 'F', 'G'][bar];
      $$('.ar-tr', list).forEach(function (row) {
        var k = row.getAttribute('data-k'), T = TRACKS.filter(function (x) { return x.k === k; })[0];
        $$('.ar-steps i', row).forEach(function (c, i) { c.classList.toggle('now', i === s % 16); c.classList.toggle('v', T.hit(bar * 16 + i)); });
      });
    };
    function play() { if (clock.start()) bP.textContent = '■ 停止'; }
    function stop() { clock.stop(); bP.textContent = '▶︎ 播放'; $$('.ar-steps i', list).forEach(function (c) { c.classList.remove('now'); }); }
    players.push(stop);
    draw();
  });

  /* ========== 6. 創作範本卡 ========== */
  var RHET = ['感嘆', '設問', '引用', '誇飾', '譬喻', '轉化', '映襯', '類疊', '對偶', '排比', '借代', '象徵', '歇後語', '摹寫', '層遞', '雙聲疊韻', '反語', '呼告', '仿擬', '雙關', '頂真', '回文', '倒裝'];
  var INST = ['主律動：鼓組', '主律動：貝斯', '主律動：打擊樂器', '副律動：鋼琴', '副律動：木吉他', '副律動：電吉他', '主旋律：人聲', '主旋律：鋼琴', '主旋律：尼龍吉他', '過門：鼓', '過門：吉他', '襯底：弦樂', '襯底：合成器', '襯底：簧管'];
  var FIELDS = {
    title: ['歌曲名稱 Title', 'input', '一個吸引人的歌名，最好與 Hook 呼應'],
    lyricist: ['填詞 Lyricist', 'input'], composer: ['譜曲 Composer', 'input'], arranger: ['編曲 Arranged By', 'input'],
    meter: ['拍號 Time Signature', 'select', '4/4|3/4|6/8|12/8|2/4'], key: ['調號 Key', 'select', 'C|D♭|D|E♭|E|F|F♯|G|A♭|A|B♭|B|Am|Bm|Cm|Dm|Em|F♯m|Gm'],
    bpm: ['速度 BPM', 'input', '例如：72'], range: ['音域 Range', 'input', '例如：A3–E5，共 12 度'],
    groove: ['主律動 Grooving', 'input', '例如：8 Beats、強弱次強弱'],
    rhyme: ['押韻方式與韻腳 Rhyme Scheme', 'input', '例如：一韻到底；ㄡ'], person: ['人稱立場 Personal', 'input', '例如：第一人稱敘述兩個人的故事'],
    theme: ['主題與故事 Subject', 'textarea', '這首歌想說什麼？用一兩句話寫下來'], hook: ['記憶點 Hook', 'textarea', '歌詞的記憶點、旋律的記憶點、樂器的記憶點'],
    form: ['歌曲段落結構 Song Form', 'textarea', '例如：前奏 4 → 主歌 8 → 前副歌 4 → 副歌 8'],
    inst: ['樂器配置 Arrangement', 'checks', INST],
    verse: ['主歌 Verse', 'textarea'], pre: ['前副歌 Pre-Chorus', 'textarea'], chorus: ['副歌 Chorus', 'textarea'], post: ['後副歌 Post-Chorus', 'textarea'], bridge: ['橋段 Bridge', 'textarea'], tag: ['破格句 Tag', 'textarea'],
    rhet: ['修辭法使用 Rhetoric', 'checks', RHET]
  };
  var ALL = Object.keys(FIELDS);
  function cardText(c) {
    return '流行詞曲創作範本格式 Lyric Writing And Compose Sample Form\n\n' + ALL.map(function (k) { var v = c[k]; if (Array.isArray(v)) v = v.join('、'); return FIELDS[k][0] + '：' + (v || ''); }).join('\n\n') + '\n';
  }
  $$('.songcard').forEach(function (sc) {
    var keys = (sc.getAttribute('data-fields') || ALL.join(' ')).split(/\s+/);
    sc.innerHTML = '';
    var root = el('div', 'sc'), grid = el('div', 'sc-grid'); grid.style.setProperty('--cols', sc.getAttribute('data-cols') || 2);
    keys.forEach(function (k) {
      var F = FIELDS[k]; if (!F) return;
      var lab = el('label', F[1] === 'textarea' || F[1] === 'checks' ? 'wide' : ''), inp;
      lab.appendChild(document.createTextNode(F[0]));
      if (F[1] === 'checks') {
        inp = el('div', 'sc-checks'); inp.setAttribute('data-k', k);
        F[2].forEach(function (o) { var s = el('span', '', esc(o)); s.tabIndex = 0; s.setAttribute('role', 'checkbox'); s.onclick = s.onkeydown = function (e) { if (e.type === 'keydown' && e.key !== ' ' && e.key !== 'Enter') return; e.preventDefault(); var c = LS.get('songcard', {}), arr = c[k] || [], i = arr.indexOf(o); if (i > -1) arr.splice(i, 1); else arr.push(o); c[k] = arr; LS.set('songcard', c); fill(); }; inp.appendChild(s); });
      } else if (F[1] === 'select') {
        inp = el('select'); inp.appendChild(new Option('未選擇', '')); F[2].split('|').forEach(function (o) { inp.appendChild(new Option(o, o)); });
      } else {
        inp = el(F[1]); if (F[2]) inp.placeholder = F[2];
      }
      if (F[1] !== 'checks') { inp.setAttribute('data-k', k); inp.addEventListener('input', function () { var c = LS.get('songcard', {}); c[k] = inp.value; LS.set('songcard', c); }); }
      lab.appendChild(inp); grid.appendChild(lab);
    });
    var foot = el('div', 'sc-foot');
    var bSend = btn('送給老師', 'primary'), bDl = btn('下載文字檔'), bClr = btn('清除範本卡'), armed = 0;
    bSend.onclick = function () { var c = LS.get('songcard', {}); if (!Object.keys(c).some(function (k) { return c[k] && String(c[k]).trim(); })) { say('範本卡還是空白的', 'warn'); return; } if (window.PixelBackend) window.PixelBackend.send('songcard', { item: c.title || '未命名作品', result: (c.theme || '').slice(0, 80), detail: c }, { slide: slideNo(sc), okMsg: '創作範本卡已送出' }); };
    bDl.onclick = function () { var c = LS.get('songcard', {}); download(cardText(c), (c.title || '創作範本卡') + '.txt'); };
    bClr.onclick = function () { if (!armed) { armed = 1; bClr.textContent = '再按一次確認清除'; setTimeout(function () { armed = 0; bClr.textContent = '清除範本卡'; }, 3000); return; } LS.set('songcard', {}); armed = 0; bClr.textContent = '清除範本卡'; document.dispatchEvent(new Event('songcard:update')); };
    foot.appendChild(bSend); foot.appendChild(bDl); if (sc.hasAttribute('data-clear')) foot.appendChild(bClr);
    foot.appendChild(el('small', '', '八堂課共用同一張範本卡，內容存在這台裝置。'));
    root.appendChild(grid); root.appendChild(foot); sc.appendChild(root);
    function fill() {
      var c = LS.get('songcard', {});
      $$('[data-k]', grid).forEach(function (inp) { var k = inp.getAttribute('data-k'); if (inp.classList.contains('sc-checks')) { var arr = c[k] || []; $$('span', inp).forEach(function (s) { var on = arr.indexOf(s.textContent) > -1; s.classList.toggle('on', on); s.setAttribute('aria-checked', on); }); } else if (document.activeElement !== inp) inp.value = c[k] || ''; });
    }
    document.addEventListener('songcard:update', fill);
    document.addEventListener('slide:change', fill);
    fill();
  });

  /* ========== 7. 素材庫 ========== */
  $$('.notebook').forEach(function (nb) {
    var TABS = [['words', '詞典', '蒐集喜歡的詞語，例如：燭光、遠方、晚安'], ['lines', '句典', '寫下一句有畫面的句子'], ['tunes', '曲典', '用簡譜記下一段旋律，例如：3 5 6 1̇ 6 5']];
    var st = LS.get('notebook', { words: [], lines: [], tunes: [] }), cur = 'words';
    nb.innerHTML = '';
    var tabs = el('div', 'nb-tabs'), add = el('div', 'nb-add'), inp = el('input'), bAdd = btn('加入', 'primary'), list = el('div', 'nb-list'), foot = el('div', 'btn-row');
    TABS.forEach(function (t) { var b = btn(t[1]); b.setAttribute('data-k', t[0]); b.onclick = function () { cur = t[0]; draw(); }; tabs.appendChild(b); });
    inp.setAttribute('aria-label', '新增素材');
    function push() { var v = inp.value.trim(); if (!v) return; st[cur].push(v); inp.value = ''; LS.set('notebook', st); draw(); }
    bAdd.onclick = push; inp.onkeydown = function (e) { if (e.key === 'Enter') { e.preventDefault(); push(); } };
    add.appendChild(inp); add.appendChild(bAdd);
    var bDl = btn('下載素材庫'); bDl.onclick = function () { download(TABS.map(function (t) { return '【' + t[1] + '】\n' + st[t[0]].join('\n'); }).join('\n\n'), '素材庫.txt'); };
    var bSend = btn('送給老師'); bSend.onclick = function () { report(nb, 'notebook', { item: '素材庫', result: TABS.map(function (t) { return t[1] + ' ' + st[t[0]].length; }).join('、'), detail: st }); say('已記錄素材庫', 'ok'); };
    foot.appendChild(bDl); foot.appendChild(bSend); foot.style.marginTop = '10px';
    nb.appendChild(tabs); nb.appendChild(add); nb.appendChild(list); nb.appendChild(foot);
    function draw() {
      $$('button', tabs).forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-k') === cur); });
      inp.placeholder = TABS.filter(function (t) { return t[0] === cur; })[0][2];
      list.innerHTML = '';
      st[cur].forEach(function (v, i) { var s = el('span', '', esc(v)); s.title = '點選刪除'; s.onclick = function () { st[cur].splice(i, 1); LS.set('notebook', st); draw(); }; list.appendChild(s); });
      if (!st[cur].length) list.appendChild(el('small', 'muted', '目前還沒有素材。'));
    }
    draw();
  });

  /* ========== 8. 主題骰子 ========== */
  var DICE = [
    ['生活取材', ['飲食', '衣著', '居住', '交通', '教育', '娛樂', '天氣', '工作']],
    ['切入點', ['一個人物', '一件事件', '一段時間', '一處地點', '一件物品', '一句對話']],
    ['情感與議題', ['親情', '友情', '愛情', '群眾', '社會', '國家', '世界']]
  ];
  $$('.themedice').forEach(function (td) {
    var res = LS.get('dice', null);
    td.innerHTML = '';
    var root = el('div', 'td'), reels = el('div', 'td-reels'), outp = el('div', 'td-out'), row = el('div', 'btn-row');
    DICE.forEach(function (d) { reels.appendChild(el('div', 'td-reel', '<small>' + d[0] + '</small><b>？</b>')); });
    var bGo = btn('擲骰子', 'primary'), bSave = btn('寫入創作範本卡');
    bGo.onclick = function () {
      var t = 0, R = $$('.td-reel', reels); R.forEach(function (r) { r.classList.add('spin'); });
      var iv = setInterval(function () {
        R.forEach(function (r, i) { r.querySelector('b').textContent = DICE[i][1][Math.floor(Math.random() * DICE[i][1].length)]; });
        if (++t > 14) { clearInterval(iv); R.forEach(function (r) { r.classList.remove('spin'); }); res = R.map(function (r) { return r.querySelector('b').textContent; }); LS.set('dice', res); show(); report(td, 'dice', { item: '主題骰子', result: res.join('、') }); }
      }, 70);
    };
    bSave.onclick = function () { if (!res) return; var c = LS.get('songcard', {}); c.theme = sentence(); LS.set('songcard', c); document.dispatchEvent(new Event('songcard:update')); say('已寫入創作範本卡', 'ok'); };
    row.appendChild(bGo); row.appendChild(bSave);
    root.appendChild(reels); root.appendChild(outp); root.appendChild(row); td.appendChild(root);
    function sentence() { return '以「' + res[0] + '」為素材，從「' + res[1] + '」切入，創作一首關於「' + res[2] + '」的歌。'; }
    function show() {
      if (!res) { outp.innerHTML = '<span class="muted">按下「擲骰子」，抽出今天的創作題目。</span>'; return; }
      $$('.td-reel b', reels).forEach(function (b, i) { b.textContent = res[i]; });
      outp.innerHTML = '題目：以「<b>' + esc(res[0]) + '</b>」為素材，從「<b>' + esc(res[1]) + '</b>」切入，創作一首關於「<b>' + esc(res[2]) + '</b>」的歌。';
    }
    show();
  });

  /* ========== 9. 作詞家、作曲家 ========== */
  var PEOPLE = {
    lyricists: [
      ['楊立德', 'Yang Li-Te', '世新大學廣播電視系畢業，曾任滾石唱片雜誌與飛碟唱片的創意策劃，也是音樂製作人與攝影師。', '愛人（鄧麗君）、奉獻（蘇芮）、你看你看月亮的臉（孟庭葦）、他不愛我（莫文蔚）'],
      ['娃娃', 'Wawa', '本名陳玉貞，文化大學中文系畢業，曾任唱片公司藝人暨產品發展（A&R）總監。〈今天你要嫁給我〉獲 2007 年金曲獎最佳年度歌曲。', '就是愛你、天天、流沙、普通朋友（陶喆）、想和你去吹吹風（張學友）'],
      ['陳克華', 'Chen Ko-Hua', '詩人、眼科醫師與攝影家，文學作品屢獲時報、聯合報等文學獎，詞作曾獲金鼎獎最佳歌詞，是八〇年代的文學跨界作詞人。', '台北的天空（王芷蕾）、沉默的母親（蘇芮）、九月的高跟鞋（齊豫）'],
      ['林秋離', 'Lin Chiu-Li', '以〈我從南方來〉獲第四屆金曲獎最佳作詞人，創作超過七百首，也投入唱片企劃與藝人定位。', '哭砂（黃鶯鶯）、剪愛、聽海（張惠妹）、天黑（阿杜）、曹操（林俊傑）'],
      ['丁曉雯', 'Ding Hsiao-Wen', '輔仁大學大眾傳播學系畢業，曾任歌手、唱片製作人，也擔任金鐘獎、金曲獎評審。', '你是我胸口永遠的痛（王傑）、青蘋果樂園（小虎隊）、祝福（張學友）'],
      ['何厚華', 'Ho Hou-Hua', '中原大學數學系畢業，曾任多家唱片公司主管與電台主持人，企劃近百張專輯。', '今生註定、願蒼天變了心（方季惟）、有多少愛可以重來（迪克牛仔）'],
      ['陳樂融', 'Chen Le-Rong', '成功大學土木工程系畢業，曾任唱片公司企宣與藝人總監、劇場製作總監，三度入圍金曲獎最佳作詞人。', '瀟灑走一回（葉倩文）、天天想你（張雨生）、對你愛不完（郭富城）'],
      ['鄔裕康', 'Wu Yu-Kang', '文化大學德文系畢業，曾任多家唱片公司主管，擅長為張惠妹創作情緒飽滿的情歌。', '原來你什麼都不要、我要快樂（張惠妹）、忠孝東路走九遍（動力火車）'],
      ['廖瑩如', 'Liao Ying-Ru', '中台醫專放射科畢業，擁有放射師執照，曾任唱片公司企劃與 A&R 總監，日後成為自由作詞人。', '天黑黑、逆光（孫燕姿）、值得（鄭秀文）'],
      ['姚謙', 'Yao Chien', '工業設計科畢業，曾任多家唱片公司總經理，被譽為台灣的「造星高手」。', '我願意（王菲）、味道（辛曉琪）、我多麼羨慕你（江美琪）、如果愛（張學友）'],
      ['厲曼婷', 'Li Man-Ting', '曾任雜誌主編與多家唱片公司主管，筆下的離別與思念細膩含蓄。', '倆倆相忘（辛曉琪）、離人（張學友、林志炫）、有一點動心（張信哲、劉嘉玲）'],
      ['許常德', 'Hsu Chang-Te', '世新大學編輯採訪科畢業，曾任唱片公司副總經理，詞作超過一千首，國語與台語都擅長。', '婚禮的祝福（陳奕迅）、無字的情批（黃乙玲）、一天到晚游泳的魚（張雨生）'],
      ['十一郎', 'Shih Yi Lang', '本名蕭慧文，逢甲大學財稅系畢業，與張宇合作多首經典。', '曲終人散、傘下、用心良苦（張宇）、趁早（張惠妹）'],
      ['方文山', 'Vincent Fang', '以〈威廉古堡〉、〈青花瓷〉兩度獲金曲獎最佳作詞人，中國風歌詞的代表人物。', '青花瓷、東風破、七里香、說好的幸福呢（周杰倫）、倒帶（蔡依林）'],
      ['林夕', 'Lin Xi', '本名梁偉文，香港大學文學院畢業，以〈臉〉、〈開門見山〉獲金曲獎最佳作詞人，有「華人樂壇第一作詞人」的美譽。', '十年、想哭、愛情轉移、K 歌之王（陳奕迅）、我最親愛的（張惠妹）'],
      ['李焯雄', 'Lee Cheuk-Hung', '香港大學中文系哲學碩士，以〈愛〉獲第十四屆金曲獎最佳作詞人。', '愛、盛夏的果實（莫文蔚）、暖暖、可惜不是你（梁靜茹）'],
      ['姚若龍', 'Yao Jo-Lung', '東吳大學會計系畢業，以〈最浪漫的事〉、〈永遠相信〉獲金曲獎最佳作詞人，詞作超過一千首。', '分手快樂、勇氣（梁靜茹）、最浪漫的事（趙詠華）、你把我灌醉（黃大煒）'],
      ['武雄', 'Wu Hsiung', '積極推廣文字創作與台語文化的自由作詞人，作品類型廣泛又不失通俗。', '一了百了、天高地厚（信樂團）、子曰（卜學亮）、點煙（伍佰）']
    ],
    composers: [
      ['左宏元', 'Tso Hung-Yuan', '筆名古月，1930 年生。六〇、七〇年代為瓊瑤電影創作大量歌曲，捧紅鄧麗君、鳳飛飛，以《啞女情深》獲金馬獎最佳音樂。', '千言萬語、海韻（鄧麗君）、一顆紅豆（鳳飛飛）、新白娘子傳奇'],
      ['李泰祥', 'Li Tai-Hsiang', '1941 年生於台東，阿美族作曲家，小提琴出身，自學作曲，作品橫跨交響樂、舞劇與民歌，融合古典與流行。', '橄欖樹、歡顏（齊豫）、告別'],
      ['陳志遠', 'Chen Chih-Yuan', '台灣流行音樂的編曲大師，為無數經典打造前奏與配器，是「重新包裝」的最佳示範。', '編曲：一樣的月光（蘇芮）、一場遊戲一場夢（王傑）、明天會更好'],
      ['陳小霞', 'Chen Hsiao-Hsia', '八歲開始創作歌曲，創作近千首作品，旋律溫柔而深刻，與姚若龍、林夕合作多首經典。', '十年（陳奕迅）、約定（王菲）、他不愛我（莫文蔚）、你看你看月亮的臉（孟庭葦）'],
      ['殷文琦', 'Philip Yin', '唱片製作人、作曲與編曲，以〈北風〉獲金曲獎最佳作曲人，以〈吻別〉獲最佳編曲人。', '吻別（張學友）、北風（張鎬哲）、我是如此愛你（林慧萍）'],
      ['李子恆', 'Li Tzu-Heng', '1956 年生，金韻獎民歌比賽出身，日後擔任飛碟唱片音樂監製，主導王傑、小虎隊、姜育恆的專輯。', '秋蟬、紅塵有你、牽手'],
      ['李正帆', 'Lee Cheng-Fan', '被李宗盛稱為難得一見的天才編曲家，擅長唯美浪漫的情歌，參與許多知名專輯的製作與編曲。', '與庾澄慶的合作，是許多人認識他的起點'],
      ['熊美玲', 'Hsiung Mei-Ling', '與林秋離長期搭檔，用細膩而敏感的心寫下自己與別人的生活，作品數量豐富。', '一人一個夢（張雨生）、人情味（江蕙）'],
      ['黃國倫', 'Huang Kuo-Lun', '1962 年生，唱片製作人與詞曲作家，1994 年寫下〈我願意〉，讓王菲成為天后。', '我願意（王菲）、眼淚（范曉萱）'],
      ['陶喆', 'David Tao', '本名陶緒忠，引領台灣的 R&B 潮流，有華語「R&B 教父」之稱，身兼歌手與製作人。', '天天、流沙、就是愛你、愛很簡單'],
      ['周杰倫', 'Jay Chou', '融合 R&B、嘻哈與中國風，與方文山合作開創華語流行音樂的新語彙，多次獲金曲獎肯定。', '青花瓷、彩虹、白色風車、七里香'],
      ['順子', 'Shunza', '本名倪順子，自幼學習古典鋼琴，主修音樂製作，1999 年獲金曲獎最佳作曲人。', '回家、專輯《Open Your Mind》']
    ]
  };
  $$('.people').forEach(function (p) {
    var set = PEOPLE[p.getAttribute('data-set') || 'lyricists'], info = p.nextElementSibling && p.nextElementSibling.classList.contains('person-info') ? p.nextElementSibling : null;
    p.innerHTML = '';
    set.forEach(function (x, i) {
      var b = el('button', '', esc(x[0]) + '<small>' + esc(x[1]) + '</small>'); b.type = 'button';
      b.onclick = function () { $$('button', p).forEach(function (o) { o.classList.remove('on'); }); b.classList.add('on'); if (info) info.innerHTML = '<h3>' + esc(x[0]) + '</h3><div class="pi-en">' + esc(x[1]) + '</div><p>' + esc(x[2]) + '</p><p>代表作品：<span class="works">' + esc(x[3]) + '</span></p>'; };
      p.appendChild(b); if (!i) b.click();
    });
  });
  window.PixelSongwriting = { cardText: cardText, FIELDS: FIELDS };
})();
