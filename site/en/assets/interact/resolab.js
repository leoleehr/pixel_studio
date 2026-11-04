/* Pixel Studio 互動分塊：共鳴觀測站（.resolab）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('resolab', function (K) {
  'use strict';
  var LESSON = K.LESSON, LS = K.LS, $$ = K.$$, btn = K.btn, slideNo = K.slideNo, report = K.report, say = K.say, onLeave = K.onLeave, saveFile = K.saveFile, ac = K.ac, mic = K.mic, micStart = K.micStart, micStop = K.micStop, midiOf = K.midiOf, freqOf = K.freqOf, nameOf = K.nameOf, detectPitch = K.detectPitch, canvasFit = K.canvasFit, css = K.css, ink = K.ink;

  /* ---------- 共鳴觀測站：音高與音量即時曲線，錄下後標記共鳴腔體 ---------- */
  $$('.resolab').forEach(function (p) {
    var MAXS = parseInt(p.getAttribute('data-max'), 10) || 20, LO = 40, HI = 84, DBLO = -60, DBHI = 0, FPS_MS = 33;
    var ZONES = [{ k: 'chest', name: 'Chest', col: '#45b3e6' }, { k: 'mouth', name: 'Mouth', col: '#f4a62a' }, { k: 'head', name: 'Head', col: '#ec4a36' }];
    var key = 'resolab-' + LESSON, saved = LS.get(key, null);
    var data = saved ? saved.data : [], marks = saved ? saved.marks : [], sel = null, drag = null;
    var an = null, raf = 0, t0 = 0, last = 0, rec = null, chunks = [], blob = null, url = '', recent = [], playing = false;
    p.innerHTML = '<div class="rl-read"><div><small>Pitch</small><b class="rl-note">--</b><span class="rl-hz"></span></div><div><small>Volume</small><b class="rl-db">--</b><span class="rl-bar"><i></i></span></div><div><small>Recorded</small><b class="rl-time">0.0 s</b></div></div>' +
      '<canvas class="rl-cv"></canvas><div class="rl-legend"><span class="lg-pitch">━ Pitch</span><span class="lg-vol">▇ Volume</span><span class="lg-ov">▨ Passaggio</span><span class="muted">After recording, drag across the chart to select a section, then press a resonance button to mark it. Where two resonances overlap is the passaggio</span></div>' +
      '<div class="btn-row rl-main"><button type="button" class="btn primary go">● Start recording</button><button type="button" class="btn play" disabled>▶︎ Play</button><button type="button" class="btn clear">Clear</button><span class="rl-sep"></span>' + ZONES.map(function (z) { return '<button type="button" class="btn rl-z" data-z="' + z.k + '" disabled style="--zc:' + z.col + '">Mark as ' + z.name + '</button>'; }).join('') + '</div>' +
      '<ul class="rl-marks"></ul><p class="rl-sum"></p>' +
      '<div class="btn-row rl-out"><button type="button" class="btn png">Download chart</button><a class="btn wav" href="#">Download recording</a><button type="button" class="btn primary up">Upload to teacher</button></div><audio class="rl-audio"></audio>';
    var cv = p.querySelector('canvas'), go = p.querySelector('.go'), play = p.querySelector('.play'), au = p.querySelector('audio'), wav = p.querySelector('.wav');
    var noteEl = p.querySelector('.rl-note'), hzEl = p.querySelector('.rl-hz'), dbEl = p.querySelector('.rl-db'), barEl = p.querySelector('.rl-bar i'), timeEl = p.querySelector('.rl-time');
    var buf = new Float32Array(2048);
    function zoneOf(k) { return ZONES.filter(function (z) { return z.k === k; })[0]; }
    function dur() { return Math.max(MAXS, data.length ? data[data.length - 1].t / 1000 : 0); }
    function geo() {
      var c = canvasFit(cv), L = 42, R = 40, T = 10, B = 22, w = c.w - L - R, h = c.h - T - B;
      return { c: c, L: L, T: T, w: w, h: h, X: function (t) { return L + t / dur() * w; }, Tm: function (x) { return Math.max(0, Math.min(dur(), (x - L) / w * dur())); }, Yp: function (m) { return T + h - (m - LO) / (HI - LO) * h; }, Yv: function (d) { return T + h - (d - DBLO) / (DBHI - DBLO) * h; } };
    }
    function stats(a, b) {
      var s = data.filter(function (d) { return d.t / 1000 >= a && d.t / 1000 <= b; });
      var ps = s.filter(function (d) { return d.m !== null; }).map(function (d) { return d.m; }).sort(function (x, y) { return x - y; });
      var vs = s.filter(function (d) { return d.m !== null; }).map(function (d) { return d.db; });
      if (!ps.length) return null;
      var q = function (r) { return ps[Math.min(ps.length - 1, Math.floor(r * (ps.length - 1)))]; };
      return { lo: q(0.1), hi: q(0.9), mid: q(0.5), db: vs.reduce(function (x, y) { return x + y; }, 0) / vs.length };
    }
    function draw(head) {
      var g = geo(), x = g.c.x;
      x.clearRect(0, 0, g.c.w, g.c.h);
      x.font = '11px ' + css('--display'); x.textBaseline = 'middle';
      for (var o = 48; o <= HI; o += 12) { x.strokeStyle = ink(.07); x.beginPath(); x.moveTo(g.L, g.Yp(o)); x.lineTo(g.L + g.w, g.Yp(o)); x.stroke(); x.fillStyle = ink(.45); x.textAlign = 'right'; x.fillText(nameOf(o).name, g.L - 6, g.Yp(o)); }
      x.textAlign = 'left'; x.fillStyle = 'rgba(69,179,230,.7)';
      [-60, -40, -20, 0].forEach(function (d) { x.fillText(d + ' dB', g.L + g.w + 4, Math.min(g.T + g.h - 4, Math.max(g.T + 6, g.Yv(d)))); });
      x.textAlign = 'center'; x.fillStyle = ink(.4);
      for (var s = 0; s <= dur(); s += 5) x.fillText(s + 's', g.X(s), g.T + g.h + 12);
      marks.forEach(function (mk) { var z = zoneOf(mk.z); x.fillStyle = z.col + '2a'; x.fillRect(g.X(mk.a), g.T, g.X(mk.b) - g.X(mk.a), g.h); x.fillStyle = z.col; x.font = '700 13px "Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif'; x.fillText(z.name, (g.X(mk.a) + g.X(mk.b)) / 2, g.T + 12 + (mk.z === 'mouth' ? 16 : 0)); x.font = '11px ' + css('--display'); });
      overlaps().forEach(function (o) { // 聲區：斜線網底
        var x1 = g.X(o.a), x2 = g.X(o.b); x.save(); x.beginPath(); x.rect(x1, g.T, x2 - x1, g.h); x.clip();
        x.strokeStyle = ink(.38); x.lineWidth = 1.5; for (var k = x1 - g.h; k < x2; k += 7) { x.beginPath(); x.moveTo(k, g.T + g.h); x.lineTo(k + g.h, g.T); x.stroke(); }
        x.restore(); x.lineWidth = 1; x.fillStyle = ink(1); x.font = '700 12px "Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif'; x.fillText('Passaggio', (x1 + x2) / 2, g.T + g.h - 10); x.font = '11px ' + css('--display');
      });
      if (sel) { x.fillStyle = ink(.12); x.fillRect(g.X(sel.a), g.T, g.X(sel.b) - g.X(sel.a), g.h); x.strokeStyle = ink(.6); x.setLineDash([4, 4]); x.strokeRect(g.X(sel.a), g.T, g.X(sel.b) - g.X(sel.a), g.h); x.setLineDash([]); }
      // 音量：底部的填色區
      x.fillStyle = 'rgba(69,179,230,.28)'; x.beginPath(); x.moveTo(g.X(0), g.T + g.h);
      data.forEach(function (d) { x.lineTo(g.X(d.t / 1000), g.Yv(Math.max(DBLO, d.db))); });
      if (data.length) x.lineTo(g.X(data[data.length - 1].t / 1000), g.T + g.h);
      x.closePath(); x.fill();
      // 音高：線
      x.strokeStyle = css('--amber'); x.lineWidth = 3; x.beginPath(); var on = false;
      data.forEach(function (d) { if (d.m === null || d.m < LO || d.m > HI) { on = false; return; } var X = g.X(d.t / 1000), Y = g.Yp(d.m); on ? x.lineTo(X, Y) : x.moveTo(X, Y); on = true; });
      x.stroke(); x.lineWidth = 1;
      if (head !== undefined) { x.strokeStyle = ink(1); x.beginPath(); x.moveTo(g.X(head), g.T); x.lineTo(g.X(head), g.T + g.h); x.stroke(); }
    }
    function rng(st) { var a = nameOf(st.lo).name, b = nameOf(st.hi).name; return a === b ? a : a + '–' + b; }
    function zi(k) { return ZONES.map(function (z) { return z.k; }).indexOf(k); }
    function overlaps() { // 不同共鳴的標記重疊處＝聲區（共鳴轉換的位置）
      var out = [];
      for (var i = 0; i < marks.length; i++) for (var j = i + 1; j < marks.length; j++) {
        var m1 = marks[i], m2 = marks[j]; if (m1.z === m2.z) continue;
        var a = Math.max(m1.a, m2.a), b = Math.min(m1.b, m2.b); if (b - a < 0.1) continue;
        var lo = zi(m1.z) < zi(m2.z) ? m1 : m2, hi = lo === m1 ? m2 : m1;
        out.push({ a: a, b: b, from: lo.z, to: hi.z });
      }
      return out.sort(function (x, y) { return x.a - y.a; });
    }
    function listMarks() {
      var ul = p.querySelector('.rl-marks');
      ul.innerHTML = marks.map(function (mk, i) {
        var z = zoneOf(mk.z), st = stats(mk.a, mk.b);
        return '<li style="--zc:' + z.col + '"><b>' + z.name + '</b> ' + mk.a.toFixed(1) + '–' + mk.b.toFixed(1) + ' s　' + (st ? 'Pitch ' + rng(st) + ' (median ' + nameOf(st.mid).name + ') average volume ' + Math.round(st.db) + ' dB' : 'No sound detected in this section') + ' <button type="button" class="rl-del" data-i="' + i + '" aria-label="Delete mark">×</button></li>';
      }).join('') + overlaps().map(function (o) {
        var st = stats(o.a, o.b);
        return '<li class="rl-ov"><b>Passaggio</b> ' + zoneOf(o.from).name + '↔︎' + zoneOf(o.to).name + '　' + o.a.toFixed(1) + '–' + o.b.toFixed(1) + ' s　' + (st ? 'Pitch ' + rng(st) + ' (about ' + nameOf(st.mid).name + ') average volume ' + Math.round(st.db) + ' dB' : 'No sound detected in this section') + '</li>';
      }).join('');
      $$('.rl-del', ul).forEach(function (b) { b.onclick = function () { marks.splice(+b.getAttribute('data-i'), 1); save(); refresh(); }; });
      var ch = marks.filter(function (m) { return m.z === 'chest'; })[0], hd = marks.filter(function (m) { return m.z === 'head'; })[0], sum = p.querySelector('.rl-sum');
      var a = ch && stats(ch.a, ch.b), b = hd && stats(hd.a, hd.b), parts = [];
      var ov = overlaps().map(function (o) { var st = stats(o.a, o.b); return st ? zoneOf(o.from).name + '→' + zoneOf(o.to).name + ' about <b>' + nameOf(st.mid).name + '</b>' + (rng(st) === nameOf(st.mid).name ? '' : ' (' + rng(st) + ')') : null; }).filter(Boolean);
      if (ov.length) parts.push('Resonance shift (passaggio): ' + ov.join('；'));
      if (a && b) {
        var dm = Math.round(b.mid - a.mid), dd = Math.round(b.db - a.db);
        parts.push('Chest → head: pitch <b>' + (dm >= 0 ? '+' : '') + dm + ' semitones</b> (' + nameOf(a.mid).name + ' → ' + nameOf(b.mid).name + '), volume <b>' + (dd >= 0 ? '+' : '') + dd + ' dB</b>' + (dd < -2 ? ': pitch goes up and volume drops clearly.' : dd > 2 ? ': volume actually goes up. You may still be pushing up with chest voice.' : ': volume stays about the same. Try relaxing more into head voice.'));
      }
      if (!parts.length && marks.length) parts.push('Mark one chest section and one head section to compare pitch and volume. Where they overlap is marked as the passaggio.');
      sum.innerHTML = parts.join('<br>');
    }
    function save() { LS.set(key, { data: data, marks: marks }); }
    function refresh() { listMarks(); draw(); $$('.rl-z', p).forEach(function (b) { b.disabled = !sel || !data.length; }); }
    function loop() {
      raf = requestAnimationFrame(loop);
      var now = performance.now(); if (now - last < FPS_MS) return; last = now;
      an.getFloatTimeDomainData(buf);
      var r = 0; for (var i = 0; i < buf.length; i++) r += buf[i] * buf[i]; r = Math.sqrt(r / buf.length);
      var db = r > 0 ? Math.max(DBLO, 20 * Math.log10(r)) : DBLO;
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      var mm = ok.length === 3 ? ok[1] : null, t = now - t0;
      data.push({ t: Math.round(t), m: mm === null ? null : +mm.toFixed(2), db: +db.toFixed(1) });
      noteEl.textContent = mm === null ? '--' : nameOf(mm).name; hzEl.textContent = mm === null ? '' : Math.round(freqOf(mm)) + ' Hz';
      dbEl.textContent = Math.round(db) + ' dB'; barEl.style.width = Math.max(0, (db - DBLO) / (DBHI - DBLO) * 100) + '%';
      timeEl.textContent = (t / 1000).toFixed(1) + ' s';
      draw();
      if (t >= MAXS * 1000) stop();
    }
    function stop() {
      cancelAnimationFrame(raf); raf = 0;
      if (rec && rec.state !== 'inactive') rec.stop();
      if (an) { an = null; micStop(); }
      go.textContent = '● Record again'; save(); refresh();
    }
    go.onclick = function () {
      if (raf) return stop();
      micStart().then(function (a) {
        an = a; data = []; marks = []; sel = null; recent = []; t0 = performance.now(); last = 0; blob = null;
        p.classList.remove('has');
        if (window.MediaRecorder) {
          var type = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
          rec = new MediaRecorder(mic.stream, { mimeType: type }); chunks = [];
          rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
          rec.onstop = function () {
            blob = new Blob(chunks, { type: type }); if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(blob);
            au.src = url; wav.download = 'resonance-shift_' + stamp() + (type === 'audio/webm' ? '.webm' : '.m4a');
            wav.onclick = function (e) { e.preventDefault(); saveFile(blob, wav.download); };
            p.classList.add('has'); play.disabled = false;
          };
          rec.start();
        }
        go.textContent = '■ Stop'; refresh(); loop();
      }).catch(function () { timeEl.textContent = 'Can\'t use the microphone'; });
    };
    function stamp() { var d = new Date(); return d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + '_' + String(d.getHours()).padStart(2, '0') + String(d.getMinutes()).padStart(2, '0'); }
    play.onclick = function () {
      if (playing) { au.pause(); return; }
      au.currentTime = sel ? sel.a : 0; au.play(); playing = true; play.textContent = '■ Stop playback';
      (function tick() { if (!playing) return; draw(au.currentTime); if (sel && au.currentTime >= sel.b) { au.pause(); return; } requestAnimationFrame(tick); })();
    };
    au.onpause = au.onended = function () { playing = false; play.textContent = '▶︎ Play'; draw(); };
    function px(e) { var r = cv.getBoundingClientRect(); return (e.clientX - r.left) * (cv.clientWidth / (r.width || 1)); } // 投影片整體縮放時，換算回畫布的版面座標
    cv.addEventListener('pointerdown', function (e) { if (raf || !data.length) return; var g = geo(); drag = g.Tm(px(e)); sel = { a: drag, b: drag }; cv.setPointerCapture(e.pointerId); draw(); });
    cv.addEventListener('pointermove', function (e) { if (drag === null) return; var t = geo().Tm(px(e)); sel = { a: Math.min(drag, t), b: Math.max(drag, t) }; draw(); });
    cv.addEventListener('pointerup', function () { if (drag === null) return; drag = null; if (sel && sel.b - sel.a < 0.2) sel = null; refresh(); });
    $$('.rl-z', p).forEach(function (b) {
      b.onclick = function () { if (!sel) return; var zk = b.getAttribute('data-z'); marks = marks.filter(function (m) { return m.z !== zk || m.b <= sel.a || m.a >= sel.b; }); marks.push({ z: zk, a: +sel.a.toFixed(2), b: +sel.b.toFixed(2) }); marks.sort(function (x, y) { return x.a - y.a; }); sel = null; save(); refresh(); };
    });
    p.querySelector('.clear').onclick = function () { if (raf) stop(); data = []; marks = []; sel = null; blob = null; p.classList.remove('has'); play.disabled = true; go.textContent = '● Start recording'; save(); refresh(); timeEl.textContent = '0.0 s'; };
    function snapshot() { // 觀測圖 PNG：標題、曲線、標記與比較結果
      var lines = $$('.rl-marks li', p).map(function (li) { return li.textContent.replace('×', '').trim(); }).concat(p.querySelector('.rl-sum').innerText.split('\n')).filter(Boolean).slice(0, 8);
      var g = geo(), out = document.createElement('canvas'), r = window.devicePixelRatio || 1, W = g.c.w, H = g.c.h + 52 + lines.length * 17;
      out.width = W * r; out.height = H * r; var x = out.getContext('2d'); x.scale(r, r);
      x.fillStyle = ink(1) === 'rgba(17,19,21,1)' ? '#f4f4f0' : '#101210'; x.fillRect(0, 0, W, H);
      x.fillStyle = ink(1) === 'rgba(17,19,21,1)' ? '#111315' : '#f3f0e9'; x.font = '700 16px "Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif'; x.textBaseline = 'top';
      var who = (window.PixelBackend && window.PixelBackend.profile && window.PixelBackend.profile()) || {};
      x.fillText('Resonance shift chart　' + (who.name || '') + '　' + stamp().replace('_', ' '), 12, 10);
      x.drawImage(cv, 0, 36, W, g.c.h);
      x.font = '13px "Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif'; x.fillStyle = '#f4a62a';
      lines.forEach(function (l, i) { x.fillText(l, 12, 44 + g.c.h + i * 17); });
      return out;
    }
    p.querySelector('.png').onclick = function () {
      if (!data.length) { say('Record a resonance shift first', 'warn'); return; }
      snapshot().toBlob(function (img) { saveFile(img, 'resonance-chart_' + stamp() + '.png'); }, 'image/png');
    };
    p.querySelector('.up').onclick = function () {
      if (!data.length) { say('Record a resonance shift first', 'warn'); return; }
      var summary = { marks: marks.map(function (mk) { var st = stats(mk.a, mk.b); return { zone: zoneOf(mk.z).name, from: mk.a, to: mk.b, low: st && nameOf(st.lo).name, high: st && nameOf(st.hi).name, db: st && Math.round(st.db) }; }), zones: overlaps().map(function (o) { var st = stats(o.a, o.b); return { between: zoneOf(o.from).name + '↔︎' + zoneOf(o.to).name, from: o.a, to: o.b, pitch: st && nameOf(st.mid).name, low: st && nameOf(st.lo).name, high: st && nameOf(st.hi).name }; }), summary: p.querySelector('.rl-sum').innerText };
      report(p, 'resonance', { item: 'Resonance shift', result: summary.marks.map(function (m) { return m.zone + ' ' + (m.low || '--') + '–' + (m.high || '--') + ' ' + (m.db === null ? '' : m.db + ' dB'); }).join('／') || 'Unmarked', detail: summary });
      if (!window.PixelBackend) return;
      snapshot().toBlob(function (img) {
        window.PixelBackend.upload(img, { label: 'Resonance chart', seconds: '', filename: 'resonance-chart_' + stamp() + '.png', slide: slideNo(p) }).then(function () {
          if (blob) window.PixelBackend.upload(blob, { label: 'Resonance shift recording', seconds: Math.round(dur()), filename: wav.download, slide: slideNo(p) });
        });
      }, 'image/png');
    };
    window.addEventListener('resize', function () { draw(); });
    refresh(); onLeave(p, function () { if (raf) stop(); au.pause(); });
  });
});
