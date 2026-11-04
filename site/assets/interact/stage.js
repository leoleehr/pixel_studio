/* Pixel Studio 互動分塊：碼表與鏡子（.stopwatch .mirror）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('stage', function (K) {
  'use strict';
  var LESSON = K.LESSON, LS = K.LS, $$ = K.$$, btn = K.btn, onLeave = K.onLeave;

  /* ---------- 碼表：繞口令計時，保留每一位的成績 ---------- */
  $$('.stopwatch').forEach(function (w) {
    var key = 'stopwatch-' + LESSON + '-' + (w.getAttribute('data-id') || '0'), runs = LS.get(key, []), t0 = 0, raf = 0;
    w.innerHTML = '<div class="sw-time">0.00</div><div class="btn-row"><button type="button" class="btn primary go">開始</button><button type="button" class="btn clear">清除紀錄</button></div><ol class="sw-runs"></ol>';
    var tm = w.querySelector('.sw-time'), go = w.querySelector('.go'), list = w.querySelector('.sw-runs');
    function show() {
      var best = runs.length ? Math.min.apply(null, runs) : 0;
      list.innerHTML = runs.map(function (s, k) { return '<li class="' + (s === best ? 'best' : '') + '">第 ' + (k + 1) + ' 位　' + s.toFixed(2) + ' 秒' + (s === best ? '　最快' : '') + '</li>'; }).join('');
    }
    function loop() { tm.textContent = ((performance.now() - t0) / 1000).toFixed(2); raf = requestAnimationFrame(loop); }
    function stop(save) {
      cancelAnimationFrame(raf); raf = 0; go.textContent = '開始'; w.classList.remove('on');
      if (save) { var sec = (performance.now() - t0) / 1000; tm.textContent = sec.toFixed(2); runs.push(+sec.toFixed(2)); if (runs.length > 12) runs.shift(); LS.set(key, runs); show(); }
    }
    go.onclick = function () { if (raf) return stop(true); t0 = performance.now(); go.textContent = '停止'; w.classList.add('on'); loop(); };
    w.querySelector('.clear').onclick = function () { stop(false); runs = []; LS.set(key, runs); tm.textContent = '0.00'; show(); };
    show(); onLeave(w, function () { if (raf) stop(false); });
  });

  /* ---------- 鏡子：手機前鏡頭，對照口型（畫面不錄製、不上傳） ---------- */
  $$('.mirror').forEach(function (m) {
    m.innerHTML = '<div class="mr-view"><video playsinline muted></video><p class="mr-hint">按「打開鏡子」，用前鏡頭看自己的口型<br><small>畫面只在這支手機上顯示，不會錄製或上傳</small></p></div><div class="btn-row"><button type="button" class="btn primary go">打開鏡子</button></div>';
    var v = m.querySelector('video'), go = m.querySelector('.go'), hint = m.querySelector('.mr-hint'), stream = null;
    function stop() { if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; } v.srcObject = null; m.classList.remove('on'); go.textContent = '打開鏡子'; }
    go.onclick = function () {
      if (stream) return stop();
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) { hint.textContent = '這個瀏覽器無法使用鏡頭，請改用手機的自拍模式'; return; }
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false }).then(function (s) {
        stream = s; v.srcObject = s; v.play(); m.classList.add('on'); go.textContent = '關閉鏡子';
      }).catch(function () { hint.textContent = '無法使用鏡頭：請允許瀏覽器使用相機，並以 https 網址開啟'; });
    };
    onLeave(m, stop);
  });
});
