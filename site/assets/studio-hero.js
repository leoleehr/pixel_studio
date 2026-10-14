(function () {
  'use strict';

  var body = document.body;
  var button = document.getElementById('fx-toggle');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  var KEY = 'pixel-studio-fx';
  var on = !reduce.matches;
  try { var saved = localStorage.getItem(KEY); if (saved) on = saved === 'on'; } catch (e) {}

  function sync() {
    body.classList.toggle('fx-on', on);
    body.classList.toggle('fx-off', !on);
    if (button) {
      button.setAttribute('aria-pressed', String(on));
      button.querySelector('.fx-text').textContent = on ? '關閉特效' : '開啟特效';
    }
  }

  if (button) button.addEventListener('click', function () {
    on = !on;
    try { localStorage.setItem(KEY, on ? 'on' : 'off'); } catch (e) {}
    sync();
  });
  sync();
})();
