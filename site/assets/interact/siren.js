/* Pixel Studio 互動分塊：警笛滑音（.siren）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('siren', function (K) {
  'use strict';
  var LESSON = K.LESSON, LS = K.LS, $$ = K.$$, btn = K.btn, report = K.report, onLeave = K.onLeave, ac = K.ac, micStart = K.micStart, micStop = K.micStop, midiOf = K.midiOf, nameOf = K.nameOf, detectPitch = K.detectPitch, canvasFit = K.canvasFit, css = K.css, ink = K.ink;

  /* ---------- 警笛滑音：寬音域音高曲線，找出換聲區 ---------- */
  $$('.siren').forEach(function (p) {
    var key = 'siren-' + LESSON, LO = 36, HI = 84, saved = LS.get(key, null);
    p.innerHTML = '<div class="sr-read"><div><small>最低音</small><b class="sr-lo">--</b></div><div><small>最高音</small><b class="sr-hi">--</b></div><div class="sr-brk-box"><small>換聲點</small><b class="sr-brk">--</b></div></div><canvas></canvas><p class="sr-state muted">按「開始滑音」，以 /u/ 或 /ng/ 由最低音慢慢滑到最高音再滑回來</p><div class="btn-row"><button type="button" class="btn primary go">● 開始滑音</button><button type="button" class="btn mark">標記換聲點</button><button type="button" class="btn clear">清除</button></div>';
    var cv = p.querySelector('canvas'), st = p.querySelector('.sr-state'), go = p.querySelector('.go');
    var an = null, buf = new Float32Array(2048), raf = 0, frame = 0, hist = [], marks = [], last = null, lo = null, hi = null, brk = null, recent = [];
    function nm(m) { var n = nameOf(m); return n.name + '（' + n.solf + '）'; }
    function show() {
      p.querySelector('.sr-lo').textContent = lo === null ? '--' : nameOf(lo).name;
      p.querySelector('.sr-hi').textContent = hi === null ? '--' : nameOf(hi).name;
      p.querySelector('.sr-brk').textContent = brk === null ? '--' : nameOf(brk).name;
    }
    function loop() {
      raf = requestAnimationFrame(loop);
      if (++frame % 2) return;
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      // 連續三格取中位數，減少八度誤判造成的跳點
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      var v = ok.length === 3 ? ok[1] : null;
      if (v !== null) {
        if (lo === null || v < lo) lo = v;
        if (hi === null || v > hi) hi = v;
        if (last !== null && Math.abs(v - last) >= 3) { marks.push({ i: hist.length, m: v, auto: true }); if (brk === null) brk = Math.round(Math.min(v, last)); }
        st.textContent = '現在：' + nm(v) + '　' + Math.round(f) + ' Hz';
      }
      last = v === null ? last : v;
      hist.push(v); if (hist.length > 360) { hist.shift(); marks.forEach(function (k) { k.i--; }); marks = marks.filter(function (k) { return k.i >= 0; }); }
      show(); draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, Y = function (m) { return c.h - (m - LO) / (HI - LO) * c.h; }, X = function (i) { return i / 359 * c.w; };
      x.clearRect(0, 0, c.w, c.h);
      x.font = '11px ' + css('--display'); x.textBaseline = 'middle';
      for (var o = LO; o <= HI; o += 12) { x.strokeStyle = ink(.08); x.beginPath(); x.moveTo(30, Y(o)); x.lineTo(c.w, Y(o)); x.stroke(); x.fillStyle = ink(.4); x.fillText(nameOf(o).name, 4, Math.min(c.h - 7, Math.max(7, Y(o)))); }
      if (brk !== null) { x.fillStyle = 'rgba(236,74,54,.16)'; x.fillRect(30, Y(brk + 1.5), c.w - 30, Y(brk - 1.5) - Y(brk + 1.5)); }
      x.strokeStyle = css('--amber'); x.lineWidth = 3; x.beginPath(); var on = false;
      hist.forEach(function (m, i) { if (m === null) { on = false; return; } on ? x.lineTo(X(i), Y(m)) : x.moveTo(X(i), Y(m)); on = true; });
      x.stroke();
      marks.forEach(function (k) { x.fillStyle = k.auto ? 'rgba(236,74,54,.75)' : css('--red'); x.beginPath(); x.arc(X(k.i), Y(k.m), k.auto ? 4 : 7, 0, Math.PI * 2); x.fill(); });
    }
    function save() { if (lo === null) return; LS.set(key, { lo: lo, hi: hi, brk: brk }); }
    function stop() {
      cancelAnimationFrame(raf);
      if (an) {
        an = null; micStop(); save();
        if (lo !== null) report(p, 'siren', { item: '警笛滑音', result: nameOf(lo).name + '–' + nameOf(hi).name + (brk !== null ? '，換聲點 ' + nameOf(brk).name : ''), value: brk === null ? '' : nameOf(brk).name, detail: { low: nameOf(lo).name, high: nameOf(hi).name, span: Math.round(hi - lo) } });
        st.textContent = lo === null ? '沒有收到穩定的聲音，靠近麥克風再試一次' : '音域 ' + nm(lo) + ' 到 ' + nm(hi) + (brk !== null ? '；換聲點約在 ' + nm(brk) + '，用鍵盤確認後記下來' : '');
      }
      go.textContent = '● 開始滑音';
    }
    go.onclick = function () {
      if (an) return stop();
      micStart().then(function (a) { an = a; recent = []; last = null; go.textContent = '■ 停止'; st.textContent = '聆聽中，從最低音開始慢慢往上滑'; loop(); })
        .catch(function () { st.textContent = '無法使用麥克風：請允許瀏覽器使用麥克風，並以 https 網址開啟'; });
    };
    p.querySelector('.mark').onclick = function () {
      if (last === null) { st.textContent = '先發出聲音，在聲音轉變的那一刻按下標記'; return; }
      brk = Math.round(last); marks.push({ i: Math.max(0, hist.length - 1), m: last, auto: false }); save(); show(); draw();
      st.textContent = '已標記換聲點：' + nm(brk);
    };
    p.querySelector('.clear').onclick = function () { hist = []; marks = []; last = null; lo = hi = brk = null; LS.set(key, null); show(); draw(); st.textContent = '已清除，按「開始滑音」再試一次'; };
    if (saved) { lo = saved.lo; hi = saved.hi; brk = saved.brk; st.textContent = '上次紀錄：' + nm(lo) + ' 到 ' + nm(hi) + (brk !== null ? '，換聲點 ' + nm(brk) : ''); }
    show(); draw(); window.addEventListener('resize', draw); onLeave(p, stop);
  });
});
