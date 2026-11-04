/* Pixel Studio 互動分塊：吐氣測量（.breath）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('breath', function (K) {
  'use strict';
  var LS = K.LS, $$ = K.$$, btn = K.btn, report = K.report, onLeave = K.onLeave, chime = K.chime, micStart = K.micStart, micStop = K.micStop, rmsOf = K.rmsOf, canvasFit = K.canvasFit, css = K.css, ink = K.ink;

  /* ---------- 8. 吐氣測量：按下開始即計時，吐完自動停止 ---------- */
  $$('.breath').forEach(function (b) {
    var key = 'breath-' + b.getAttribute('data-key'), cmpKey = b.getAttribute('data-compare');
    var IDLE = '按「開始」後立刻計時，請以 /s/ 平穩吐氣，吐完會自動停止';
    b.innerHTML = '<div class="br-top"><div><div class="br-sec">0.0</div><div class="muted br-unit">秒</div></div><div class="br-info"><div class="br-state">' + IDLE + '</div><div class="br-stab"></div><div class="br-cmp"></div></div></div><canvas></canvas><div class="btn-row"><button type="button" class="btn primary go">● 開始計時</button><button type="button" class="btn manual">不用麥克風</button><button type="button" class="btn reset">重設</button></div>';
    var cv = b.querySelector('canvas'), sec = b.querySelector('.br-sec'), state = b.querySelector('.br-state'), stab = b.querySelector('.br-stab'), cmp = b.querySelector('.br-cmp'), go = b.querySelector('.go'), man = b.querySelector('.manual');
    var an = null, buf = new Float32Array(2048), raf = 0, tick = 0, levels = [], peak = 0, th = 0, t0 = 0, lastLoud = 0, heard = false, vals = [], running = false, useMic = true;
    function compare() {
      var mine = LS.get(key, null), base = cmpKey ? LS.get('breath-' + cmpKey, null) : null;
      cmp.textContent = base && mine && cmpKey ? '開場 ' + base.toFixed(1) + ' 秒 → 現在 ' + mine.toFixed(1) + ' 秒（' + (mine >= base ? '+' : '') + (mine - base).toFixed(1) + '）' : (mine ? '上次紀錄：' + mine.toFixed(1) + ' 秒' : '');
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
      stab.textContent = st != null ? '穩定度 ' + st + '%（越高代表吐氣越平穩）' : '';
      report(b, 'breath', { item: /after/.test(b.getAttribute('data-key')) ? '吐氣後測' : /before/.test(b.getAttribute('data-key')) ? '吐氣前測' : '吐氣測量', result: s.toFixed(1) + ' 秒', value: +s.toFixed(1), detail: { steadiness: st, mode: useMic ? '麥克風' : '手動' } });
      state.textContent = '完成！可以再測一次，會保留最新的秒數';
      go.textContent = '● 開始計時'; chime();
    }
    function start() {
      levels = []; vals = []; peak = 0; th = 0; heard = false; stab.textContent = '';
      t0 = performance.now(); lastLoud = t0; running = true; go.textContent = '■ 停止';
      sec.textContent = '0.0';
      tick = setInterval(function () { if (running) sec.textContent = ((performance.now() - t0) / 1000).toFixed(1); }, 100);
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      var r = rmsOf(an, buf), now = performance.now();
      levels.push(r); if (levels.length > 300) levels.shift();
      peak = Math.max(peak * 0.999, r); th = Math.max(0.01, peak * 0.2);
      if (r > th && r > 0.012) { heard = true; lastLoud = now; vals.push(r); state.textContent = '吐氣中…保持聲音大小不變'; }
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
      if (!useMic) { start(); state.textContent = '計時中，吐完氣請按「停止」'; return; }
      // 先開始計時，再接上麥克風；麥克風無法使用時自動改為手動碼表
      start(); state.textContent = '計時中，請以 /s/ 吐氣';
      micStart().then(function (a) { if (!running) { micStop(); return; } an = a; loop(); })
        .catch(function () { useMic = false; man.textContent = '使用麥克風'; state.textContent = '無法使用麥克風，已改為手動計時：吐完氣請按「停止」'; });
    };
    man.onclick = function () {
      if (running) return;
      useMic = !useMic; man.textContent = useMic ? '不用麥克風' : '使用麥克風';
      state.textContent = useMic ? IDLE : '手動計時：按「開始」立刻計時，吐完氣按「停止」';
    };
    b.querySelector('.reset').onclick = function () {
      running = false; clearInterval(tick); cancelAnimationFrame(raf); if (an) { an = null; micStop(); }
      go.textContent = '● 開始計時'; sec.textContent = '0.0'; stab.textContent = ''; levels = []; th = 0; draw(); state.textContent = useMic ? IDLE : '手動計時：按「開始」立刻計時，吐完氣按「停止」';
    };
    compare(); draw(); onLeave(b, stopAll);
  });
});
