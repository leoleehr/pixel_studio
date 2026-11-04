/* Pixel Studio 互動分塊：聲波實驗室（.wavelab）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('wavelab', function (K) {
  'use strict';
  var $$ = K.$$, btn = K.btn, onLeave = K.onLeave, ac = K.ac, midiOf = K.midiOf, nameOf = K.nameOf, canvasFit = K.canvasFit, ink = K.ink;

  /* ---------- 6. 聲波實驗室：振幅、頻率、波長 ---------- */
  $$('.wavelab').forEach(function (w) {
    w.innerHTML = '<canvas></canvas><div class="wl-ctrl"><label>頻率 <input type="range" class="f" min="0" max="1000" value="500"></label><label>振幅 <input type="range" class="a" min="0" max="100" value="60"></label></div><div class="wl-row"><div class="wl-read"></div><div class="btn-row"><button type="button" class="btn p220">220 Hz</button><button type="button" class="btn p440">440 Hz</button><button type="button" class="btn p880">880 Hz</button><button type="button" class="btn primary play">▶︎ 播放</button></div></div>';
    var cv = w.querySelector('canvas'), fr = w.querySelector('.f'), am = w.querySelector('.a'), rd = w.querySelector('.wl-read'), play = w.querySelector('.play');
    var osc = null, gain = null;
    function freq() { return 110 * Math.pow(8, fr.value / 1000); }
    function setF(f) { fr.value = Math.round(Math.log(f / 110) / Math.log(8) * 1000); upd(); }
    function upd() {
      var f = freq(), a = am.value / 100, n = nameOf(midiOf(f));
      rd.innerHTML = '<b>' + Math.round(f) + ' Hz</b>　' + n.name + '（' + n.solf + '）　波長約 ' + (343 / f).toFixed(2) + ' 公尺　音量 ' + am.value + '%';
      if (osc) { osc.frequency.setTargetAtTime(f, ac().currentTime, 0.02); gain.gain.setTargetAtTime(a * 0.35, ac().currentTime, 0.03); }
      draw();
    }
    function draw() {
      var c = canvasFit(cv), x = c.x, f = freq(), a = am.value / 100, cyc = f / 110 * 1.5;
      x.clearRect(0, 0, c.w, c.h);
      x.strokeStyle = ink(.12); x.beginPath(); x.moveTo(0, c.h / 2); x.lineTo(c.w, c.h / 2); x.stroke();
      var g = x.createLinearGradient(0, 0, c.w, 0);
      ['#e8412b', '#e2407f', '#8a4fc0', '#2f5fc4', '#45b3e6', '#6cbb4b', '#d6e03a', '#f4a62a'].forEach(function (col, k) { g.addColorStop(k / 7, col); });
      x.strokeStyle = g; x.lineWidth = 3; x.beginPath();
      for (var i = 0; i <= c.w; i += 2) { var y = c.h / 2 - Math.sin(i / c.w * cyc * Math.PI * 2) * a * (c.h / 2 - 8); i ? x.lineTo(i, y) : x.moveTo(i, y); }
      x.stroke();
    }
    function stop() { if (osc) { gain.gain.setTargetAtTime(0, ac().currentTime, 0.03); var o = osc; setTimeout(function () { o.stop(); }, 150); osc = null; } play.textContent = '▶︎ 播放'; }
    play.onclick = function () {
      if (osc) return stop();
      var c = ac(); osc = c.createOscillator(); gain = c.createGain(); gain.gain.value = 0;
      osc.frequency.value = freq(); osc.connect(gain); gain.connect(c.destination); osc.start();
      play.textContent = '■ 停止'; upd();
    };
    fr.oninput = upd; am.oninput = upd;
    w.querySelector('.p220').onclick = function () { setF(220); };
    w.querySelector('.p440').onclick = function () { setF(440); };
    w.querySelector('.p880').onclick = function () { setF(880); };
    setF(440); window.addEventListener('resize', draw);
    onLeave(w, stop);
  });
});
