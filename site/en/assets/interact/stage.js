/* Pixel Studio 互動分塊：碼表與鏡子（.stopwatch .mirror）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('stage', function (K) {
  'use strict';
  var LESSON = K.LESSON, LS = K.LS, $$ = K.$$, btn = K.btn, onLeave = K.onLeave;

  /* ---------- 碼表：繞口令計時，保留每一位的成績 ---------- */
  $$('.stopwatch').forEach(function (w) {
    var key = 'stopwatch-' + LESSON + '-' + (w.getAttribute('data-id') || '0'), runs = LS.get(key, []), t0 = 0, raf = 0;
    w.innerHTML = '<div class="sw-time">0.00</div><div class="btn-row"><button type="button" class="btn primary go">Start</button><button type="button" class="btn clear">Clear records</button></div><ol class="sw-runs"></ol>';
    var tm = w.querySelector('.sw-time'), go = w.querySelector('.go'), list = w.querySelector('.sw-runs');
    function show() {
      var best = runs.length ? Math.min.apply(null, runs) : 0;
      list.innerHTML = runs.map(function (s, k) { return '<li class="' + (s === best ? 'best' : '') + '">#' + (k + 1) + '　' + s.toFixed(2) + ' s' + (s === best ? '　fastest' : '') + '</li>'; }).join('');
    }
    function loop() { tm.textContent = ((performance.now() - t0) / 1000).toFixed(2); raf = requestAnimationFrame(loop); }
    function stop(save) {
      cancelAnimationFrame(raf); raf = 0; go.textContent = 'Start'; w.classList.remove('on');
      if (save) { var sec = (performance.now() - t0) / 1000; tm.textContent = sec.toFixed(2); runs.push(+sec.toFixed(2)); if (runs.length > 12) runs.shift(); LS.set(key, runs); show(); }
    }
    go.onclick = function () { if (raf) return stop(true); t0 = performance.now(); go.textContent = 'Stop'; w.classList.add('on'); loop(); };
    w.querySelector('.clear').onclick = function () { stop(false); runs = []; LS.set(key, runs); tm.textContent = '0.00'; show(); };
    show(); onLeave(w, function () { if (raf) stop(false); });
  });

  /* ---------- 鏡子：手機前鏡頭，對照口型（畫面不錄製、不上傳） ---------- */
  $$('.mirror').forEach(function (m) {
    m.innerHTML = '<div class="mr-view"><video playsinline muted></video><p class="mr-hint">Press "Open mirror" to watch your mouth shape with the front camera<br><small>The image only shows on this phone. Nothing is recorded or uploaded</small></p></div><div class="btn-row"><button type="button" class="btn primary go">Open mirror</button></div>';
    var v = m.querySelector('video'), go = m.querySelector('.go'), hint = m.querySelector('.mr-hint'), stream = null;
    function stop() { if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } v.srcObject = null; m.classList.remove('on'); go.textContent = 'Open mirror'; }
    go.onclick = function () {
      if (stream) return stop();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { hint.textContent = 'This browser can\'t use the camera. Try your phone\'s selfie mode instead'; return; }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then(function (s) {
        stream = s; v.srcObject = s; v.play(); m.classList.add('on'); go.textContent = 'Close mirror';
      }).catch(function () { hint.textContent = 'Can\'t use the camera. Allow camera access in your browser and open the page over https'; });
    };
    onLeave(m, stop);
  });
});
