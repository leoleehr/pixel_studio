/* Pixel Studio 互動分塊：吐氣測量（.breath）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('breath', function (K) {
  'use strict';
  var LS = K.LS, $$ = K.$$, btn = K.btn, report = K.report, onLeave = K.onLeave, chime = K.chime, micStart = K.micStart, micStop = K.micStop, rmsOf = K.rmsOf, canvasFit = K.canvasFit, css = K.css, ink = K.ink;

  /* ---------- 8. 吐氣測量：按下開始即計時，吐完自動停止 ---------- */
  $$('.breath').forEach(function (b) {
    var key = 'breath-' + b.getAttribute('data-key'), cmpKey = b.getAttribute('data-compare');
    var IDLE = 'Timing starts the moment you press "Start". Breathe out steadily on /s/ and it stops automatically when you finish';
    b.innerHTML = '<div class="br-top"><div><div class="br-sec">0.0</div><div class="muted br-unit">seconds</div></div><div class="br-info"><div class="br-state">' + IDLE + '</div><div class="br-stab"></div><div class="br-cmp"></div></div></div><canvas></canvas><div class="btn-row"><button type="button" class="btn primary go">● Start timer</button><button type="button" class="btn manual">No microphone</button><button type="button" class="btn reset">Reset</button></div>';
    var cv = b.querySelector('canvas'), sec = b.querySelector('.br-sec'), state = b.querySelector('.br-state'), stab = b.querySelector('.br-stab'), cmp = b.querySelector('.br-cmp'), go = b.querySelector('.go'), man = b.querySelector('.manual');
    var an = null, buf = new Float32Array(2048), raf = 0, tick = 0, levels = [], peak = 0, th = 0, t0 = 0, lastLoud = 0, heard = false, vals = [], running = false, useMic = true;
    function compare() {
      var mine = LS.get(key, null), base = cmpKey ? LS.get('breath-' + cmpKey, null) : null;
      cmp.textContent = base && mine && cmpKey ? 'Start of class ' + base.toFixed(1) + ' s → now ' + mine.toFixed(1) + ' s (' + (mine >= base ? '+' : '') + (mine - base).toFixed(1) + ')' : (mine ? 'Last record: ' + mine.toFixed(1) + ' s' : '');
    }
    function steadiness() {
      if (vals.length < 10) return null;
      var mean = vals.reduce(function (a, c) { return a + c; }, 0) / vals.length;
      var sd = Math.sqrt(vals.reduce(function (a, c) { return a + (c - mean) * (c - mean); }, 0) / vals.length);
      return Math.max(0, Math.round(100 - sd / mean * 100));
    }
    function finish(s) {
      running = false; clearInterval(tick); cancelAnimationFrame(raf);
      if (an) { an = null; micStop(); }
      sec.textContent = s.toFixed(1); LS.set(key, s); compare();
      var st = useMic ? steadiness() : null;
      stab.textContent = st != null ? 'Steadiness ' + st + '% (higher means a steadier exhale)' : '';
      report(b, 'breath', { item: /after/.test(b.getAttribute('data-key')) ? 'Exhale post-test' : /before/.test(b.getAttribute('data-key')) ? 'Exhale pre-test' : 'Exhale test', result: s.toFixed(1) + ' s', value: +s.toFixed(1), detail: { steadiness: st, mode: useMic ? 'Microphone' : 'Manual' } });
      state.textContent = 'Done! You can test again. The latest time is kept';
      go.textContent = '● Start timer'; chime();
    }
    function start() {
      levels = []; vals = []; peak = 0; th = 0; heard = false; stab.textContent = '';
      t0 = performance.now(); lastLoud = t0; running = true; go.textContent = '■ Stop';
      sec.textContent = '0.0';
      tick = setInterval(function () { if (running) sec.textContent = ((performance.now() - t0) / 1000).toFixed(1); }, 100);
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      var r = rmsOf(an, buf), now = performance.now();
      levels.push(r); if (levels.length > 300) levels.shift();
      peak = Math.max(peak * 0.999, r); th = Math.max(0.01, peak * 0.2);
      if (r > th && r > 0.012) { heard = true; lastLoud = now; vals.push(r); state.textContent = 'Breathing out… keep the sound at the same volume'; }
      // 已聽到吐氣、且安靜超過 0.6 秒，就以最後有聲音的時間點結束
      if (heard && now - t0 > 1000 && now - lastLoud > 600) finish((lastLoud - t0) / 1000);
      draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, mx = Math.max(0.05, Math.max.apply(null, levels.concat([th * 2])));
      x.clearRect(0, 0, c.w, c.h);
      if (th) { x.strokeStyle = ink(.25); x.setLineDash([4, 4]); x.beginPath(); x.moveTo(0, c.h - th / mx * c.h); x.lineTo(c.w, c.h - th / mx * c.h); x.stroke(); x.setLineDash([]); }
      x.fillStyle = css('--navy');
      levels.forEach(function (v, i) { var h = v / mx * c.h; x.fillRect(i / 300 * c.w, c.h - h, c.w / 300 + 0.5, h); });
    }
    function stopAll() { if (running) finish((performance.now() - t0) / 1000); }
    go.onclick = function () {
      if (running) { var end = useMic && heard ? lastLoud : performance.now(); return finish(Math.max(0, end - t0) / 1000); }
      if (!useMic) { start(); state.textContent = 'Timing. Press "Stop" when you\'ve breathed out'; return; }
      // 先開始計時，再接上麥克風；麥克風無法使用時自動改為手動碼表
      start(); state.textContent = 'Timing. Breathe out on /s/';
      micStart().then(function (a) { if (!running) { micStop(); return; } an = a; loop(); })
        .catch(function () { useMic = false; man.textContent = 'Use microphone'; state.textContent = 'Can\'t use the microphone, so switched to manual timing: press "Stop" when you\'ve breathed out'; });
    };
    man.onclick = function () {
      if (running) return;
      useMic = !useMic; man.textContent = useMic ? 'No microphone' : 'Use microphone';
      state.textContent = useMic ? IDLE : 'Manual timing: the timer starts when you press "Start". Press "Stop" when you\'ve breathed out';
    };
    b.querySelector('.reset').onclick = function () {
      running = false; clearInterval(tick); cancelAnimationFrame(raf); if (an) { an = null; micStop(); }
      go.textContent = '● Start timer'; sec.textContent = '0.0'; stab.textContent = ''; levels = []; th = 0; draw(); state.textContent = useMic ? IDLE : 'Manual timing: the timer starts when you press "Start". Press "Stop" when you\'ve breathed out';
    };
    compare(); draw(); onLeave(b, stopAll);
  });
});
