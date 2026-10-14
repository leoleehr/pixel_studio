(function () {
  'use strict';

  var group = document.getElementById('hub-wave-lines');
  var gradient = document.getElementById('hub-gradient');
  if (!group || !gradient) return;

  var button = document.getElementById('hub-motion');
  var coordinate = document.getElementById('hub-coordinate');
  var motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
  var paused = false;
  var visible = true;
  var raf = 0;
  var last = 0;
  var elapsed = 0;

  function draw() {
    var markup = '';
    for (var line = 0; line < 54; line++) {
      var path = '';
      var angle = line / 53 * Math.PI;
      for (var step = 0; step <= 120; step++) {
        var u = step / 120;
        var envelope = Math.pow(Math.sin(u * Math.PI), .8);
        var x = 55 + u * 390;
        var y = 250 + Math.sin(u * Math.PI * 5 + angle * 2) * envelope * 102 + Math.cos(angle) * envelope * 100;
        path += (step ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2);
      }
      markup += '<path d="' + path + '" opacity="' + (.25 + .65 * Math.sin(angle)).toFixed(2) + '"/>';
    }
    group.innerHTML = markup;
    if (coordinate) coordinate.textContent = 'A3 / 220 Hz';
  }

  function canFlow() {
    return visible && !document.hidden && !paused && !motionPreference.matches;
  }

  function sync() {
    cancelAnimationFrame(raf);
    raf = 0;
    last = 0;
    if (button) {
      button.hidden = motionPreference.matches;
      button.setAttribute('aria-pressed', String(paused));
      button.innerHTML = paused ? '繼續動態 <span aria-hidden="true">▷</span>' : '暫停動態 <span aria-hidden="true">Ⅱ</span>';
    }
    if (canFlow()) raf = requestAnimationFrame(tick);
  }

  function tick(now) {
    if (!canFlow()) { raf = 0; return; }
    raf = requestAnimationFrame(tick);
    if (!last) { last = now; return; }
    if (now - last < 33) return;
    elapsed += Math.min(now - last, 100);
    last = now;
    var x = (elapsed / 12000 * 500) % 500;
    gradient.setAttribute('x1', x.toFixed(1));
    gradient.setAttribute('x2', (x + 500).toFixed(1));
  }

  draw();
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (entries) {
      visible = entries[0].isIntersecting;
      sync();
    }).observe(group.ownerSVGElement);
  }
  if (button) button.addEventListener('click', function () { paused = !paused; sync(); });
  motionPreference.addEventListener('change', sync);
  document.addEventListener('visibilitychange', sync);
  window.addEventListener('pagehide', function () { cancelAnimationFrame(raf); raf = 0; });
  window.addEventListener('pageshow', sync);
  sync();
})();
