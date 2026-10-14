(function () {
  'use strict';

  var body = document.body;
  var button = document.getElementById('fx-toggle');
  var line = document.getElementById('string-line');
  var glow = document.getElementById('string-glow');
  var gradient = document.getElementById('string-spectrum');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KEY = 'pixel-studio-fx';
  var on = !reduce.matches;
  try { var saved = localStorage.getItem(KEY); if (saved) on = saved === 'on'; } catch (e) {}

  var raf = 0, start = 0, visible = true;
  var W = 1000, MID = 100, STEPS = 160;

  function flat() {
    var d = 'M0 ' + MID + 'H' + W;
    if (line) line.setAttribute('d', d);
    if (glow) glow.setAttribute('d', d);
  }

  // 撥弦：前三個泛音疊加，振幅隨時間衰減，每 4.2 秒重新撥一次
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (!start) start = now;
    var t = (now - start) / 1000;
    var cycle = t % 4.2;
    var decay = Math.exp(-cycle * 0.9);
    var d = '';
    for (var i = 0; i <= STEPS; i++) {
      var u = i / STEPS;
      var y = Math.sin(Math.PI * u) * Math.cos(t * 13) * 46 +
              Math.sin(2 * Math.PI * u) * Math.cos(t * 26 + 0.6) * 18 +
              Math.sin(3 * Math.PI * u) * Math.cos(t * 39 + 1.3) * 9;
      d += (i ? 'L' : 'M') + (u * W).toFixed(1) + ' ' + (MID + y * decay).toFixed(2);
    }
    line.setAttribute('d', d);
    glow.setAttribute('d', d);
    var x = (t * 120) % W;
    gradient.setAttribute('x1', x.toFixed(1));
    gradient.setAttribute('x2', (x + W).toFixed(1));
  }

  function sync() {
    cancelAnimationFrame(raf); raf = 0; start = 0;
    body.classList.toggle('fx-on', on);
    body.classList.toggle('fx-off', !on);
    if (button) {
      button.setAttribute('aria-pressed', String(on));
      button.querySelector('.fx-text').textContent = on ? '關閉特效' : '開啟特效';
    }
    if (on && visible && !document.hidden && line) raf = requestAnimationFrame(frame);
    else flat();
  }

  if (button) button.addEventListener('click', function () {
    on = !on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    sync();
  });
  if ('IntersectionObserver' in window && line) {
    new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; sync(); }).observe(line.ownerSVGElement);
  }
  document.addEventListener('visibilitychange', sync);
  sync();
})();
