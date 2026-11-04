/* Pixel Studio 互動分塊：音準挑戰（.pitch）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('pitch', function (K) {
  'use strict';
  var $$ = K.$$, btn = K.btn, report = K.report, onLeave = K.onLeave, ac = K.ac, tone = K.tone, chime = K.chime, mic = K.mic, micStart = K.micStart, micStop = K.micStop, midiOf = K.midiOf, freqOf = K.freqOf, nameOf = K.nameOf, detectPitch = K.detectPitch, canvasFit = K.canvasFit, css = K.css;

  /* ---------- 7. 音準挑戰：麥克風辨識音高 ---------- */
  $$('.pitch').forEach(function (p) {
    var ranges = { male: [48, 67], female: [55, 72] }, range = 'male';
    p.innerHTML = '<div class="pt-top"><div class="pt-note">--</div><div class="pt-sub"><span class="pt-hz">按「開始練習」立刻計時並辨識音高</span><span class="pt-target"></span></div><div class="pt-score">命中 <b>0</b><small class="pt-clock">00:00</small></div></div><div class="pt-needle"><span class="pt-zone"></span><i></i></div><canvas></canvas><div class="btn-row"><button type="button" class="btn male on">男聲</button><button type="button" class="btn female">女聲</button><button type="button" class="btn ask">出題並播放</button><button type="button" class="btn primary mic">● 開始練習</button><button type="button" class="btn again">再聽一次</button></div>';
    var cv = p.querySelector('canvas'), noteEl = p.querySelector('.pt-note'), hz = p.querySelector('.pt-hz'), tg = p.querySelector('.pt-target'), needle = p.querySelector('.pt-needle i'), sc = p.querySelector('.pt-score b');
    var an = null, buf = new Float32Array(2048), raf = 0, hist = [], target = null, holdStart = 0, score = 0, frame = 0, micT0 = 0, askT0 = 0, muteUntil = 0, clock = p.querySelector('.pt-clock');
    function playTarget() { tone(freqOf(target), 1.2, 0.3, 'triangle'); muteUntil = performance.now() + 1500; askT0 = muteUntil; }
    // data-seq="scale"：依 C 大調音階依序出題（男聲 C3–C4、女聲 C4–C5）
    var SEQ = p.getAttribute('data-seq') === 'scale' ? [0, 2, 4, 5, 7, 9, 11, 12] : null, si = 0;
    function pickTarget() {
      if (SEQ) { target = (range === 'male' ? 48 : 60) + SEQ[si]; var q = nameOf(target); tg.textContent = '第 ' + (si + 1) + ' / 8 音：' + q.name + '（' + q.solf + '）'; playTarget(); return; }
      var r = ranges[range]; target = r[0] + Math.floor(Math.random() * (r[1] - r[0] + 1)); var n = nameOf(target); tg.textContent = '目標：' + n.name + '（' + n.solf + '）'; playTarget();
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      var now = performance.now(), el2 = Math.floor((now - micT0) / 1000);
      clock.textContent = String(Math.floor(el2 / 60)).padStart(2, '0') + ':' + String(el2 % 60).padStart(2, '0');
      if (++frame % 2) return;
      if (now < muteUntil) { p.classList.remove('hit'); holdStart = 0; return; }
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      hist.push(m); if (hist.length > 160) hist.shift();
      if (m !== null) {
        var n = nameOf(m), cents = Math.round((m - Math.round(m)) * 100);
        noteEl.textContent = n.name; hz.textContent = Math.round(f) + ' Hz　' + n.solf + '　' + (cents > 0 ? '+' : '') + cents + ' 音分';
        var off = target !== null ? (m - target) * 100 : cents;
        needle.style.left = (50 + Math.max(-50, Math.min(50, off / 2))) + '%';
        var ok = Math.abs(off) <= 30; p.classList.toggle('hit', ok);
        if (target !== null && ok) { if (!holdStart) holdStart = performance.now(); if (performance.now() - holdStart > 700) { score++; sc.textContent = score; report(p, 'pitch', { item: nameOf(target).name + '（' + nameOf(target).solf + '）', result: '命中', value: +Math.max(0, (holdStart - askT0) / 1000).toFixed(1) }); chime(); muteUntil = performance.now() + 700; target = null; tg.textContent = '命中！用時 ' + Math.max(0, (holdStart - askT0) / 1000).toFixed(1) + ' 秒，按「出題並播放」繼續'; holdStart = 0; if (SEQ) { if (si < SEQ.length - 1) { si++; setTimeout(function () { if (an) pickTarget(); }, 900); } else { si = 0; tg.textContent = '音階完成！按「從 C 開始」再唱一次'; } } } }
        else holdStart = 0;
      } else { p.classList.remove('hit'); holdStart = 0; }
      draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, r = ranges[range], lo = r[0] - 3, hi = r[1] + 3, Y = function (m) { return c.h - (m - lo) / (hi - lo) * c.h; };
      x.clearRect(0, 0, c.w, c.h);
      if (target !== null) { x.fillStyle = 'rgba(108,187,75,.18)'; x.fillRect(0, Y(target + 0.3), c.w, Y(target - 0.3) - Y(target + 0.3)); }
      x.strokeStyle = css('--amber'); x.lineWidth = 3; x.beginPath(); var on = false;
      hist.forEach(function (m, i) { var X = i / 159 * c.w; if (m === null || m < lo || m > hi) { on = false; return; } on ? x.lineTo(X, Y(m)) : x.moveTo(X, Y(m)); on = true; });
      x.stroke();
    }
    function stop() { cancelAnimationFrame(raf); if (an) { an = null; micStop(); } p.querySelector('.mic').textContent = '● 開始練習'; }
    p.querySelector('.mic').onclick = function () {
      if (an) return stop();
      micT0 = performance.now(); clock.textContent = '00:00';
      micStart().then(function (a) { an = a; micT0 = performance.now(); p.querySelector('.mic').textContent = '■ 停止'; hz.textContent = '計時中，對著麥克風唱出聲音'; loop(); })
        .catch(function () { hz.textContent = '無法使用麥克風：請允許瀏覽器使用麥克風，並以 https 網址開啟'; });
    };
    p.querySelector('.ask').onclick = function () { if (SEQ) si = 0; pickTarget(); };
    if (SEQ) p.querySelector('.ask').textContent = '從 C 開始';
    p.querySelector('.again').onclick = function () { if (target !== null) playTarget(); };
    ['male', 'female'].forEach(function (k) { p.querySelector('.' + k).onclick = function () { range = k; p.querySelector('.male').classList.toggle('on', k === 'male'); p.querySelector('.female').classList.toggle('on', k === 'female'); si = 0; draw(); }; });
    draw(); onLeave(p, stop);
  });
});
