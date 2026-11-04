/* Pixel Studio 互動分塊：情緒地圖（.dynmap）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('dynmap', function (K) {
  'use strict';
  var LS = K.LS, $$ = K.$$, el = K.el, btn = K.btn, esc = K.esc, report = K.report, say = K.say;

  /* ---------- 情緒地圖：每段力度舉手計票（p／mp／mf／f） ---------- */
  $$('.dynmap').forEach(function (m) {
    var id = 'dyn-' + m.getAttribute('data-id'), secs = m.getAttribute('data-sections').split('|'), lv = (m.getAttribute('data-levels') || 'p|mp|mf|f').split('|');
    var st = LS.get(id, null) || secs.map(function () { return lv.map(function () { return 0; }); });
    var grid = el('div', 'dm-grid');
    grid.style.gridTemplateColumns = 'minmax(7em,1.2fr) repeat(' + lv.length + ',1fr)';
    grid.appendChild(el('div', 'dm-head', 'Section'));
    lv.forEach(function (l) { grid.appendChild(el('div', 'dm-head dm-lv', esc(l))); });
    secs.forEach(function (sec, r) {
      grid.appendChild(el('div', 'dm-sec', esc(sec)));
      lv.forEach(function (l, c) {
        var b = el('button', 'dm-cell'); b.type = 'button'; b.setAttribute('data-r', r); b.setAttribute('data-c', c);
        b.onclick = function () { st[r][c]++; save(); };
        b.oncontextmenu = function (e) { e.preventDefault(); st[r][c] = Math.max(0, st[r][c] - 1); save(); };
        grid.appendChild(b);
      });
    });
    var res = el('p', 'dm-res'), foot = el('div', 'btn-row'), clr = btn('Clear'), sv = btn('Save to server');
    foot.appendChild(sv); foot.appendChild(clr);
    m.appendChild(grid); m.appendChild(res); m.appendChild(foot);
    function winner(r) { var mx = Math.max.apply(null, st[r]); return mx ? st[r].indexOf(mx) : -1; }
    function draw() {
      $$('.dm-cell', grid).forEach(function (b) { var r = +b.getAttribute('data-r'), c = +b.getAttribute('data-c'); b.textContent = st[r][c] || ''; b.setAttribute('aria-label', secs[r] + ' ' + lv[c] + ', ' + (st[r][c] || 0) + ' votes'); b.classList.toggle('win', winner(r) === c); });
      var parts = secs.map(function (s, r) { var w = winner(r); return w < 0 ? null : s + ' ' + lv[w]; }).filter(Boolean);
      res.textContent = parts.length ? 'Class consensus: ' + parts.join(' → ') : 'Tap a cell to vote (right-click or long-press to remove one). The dynamic with the most votes in each section is the class consensus';
    }
    function save() { LS.set(id, st); draw(); }
    clr.onclick = function () { st = secs.map(function () { return lv.map(function () { return 0; }); }); save(); };
    sv.onclick = function () { report(m, 'dynamics', { item: secs.join('／'), result: res.textContent.replace('Class consensus: ', ''), detail: { sections: secs, levels: lv, votes: st } }); say('Emotion map recorded', 'ok'); };
    draw();
  });
});
