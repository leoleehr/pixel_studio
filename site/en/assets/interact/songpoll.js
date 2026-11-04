/* Pixel Studio 互動分塊：拍點測速與歌手歌曲調查（.taptempo .songpoll）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('songpoll', function (K) {
  'use strict';
  var LS = K.LS, $$ = K.$$, el = K.el, btn = K.btn, esc = K.esc, report = K.report, say = K.say;

  /* 拍點測速：跟著音樂連續點按，以最近 8 下的間隔算出每分鐘拍數 */
  $$('.taptempo').forEach(function (t) {
    var taps = [], go = btn('Tap tempo', 'primary tt-tap'), rs = btn('Reset'), out = el('span', 'tt-out', 'Tap along with the beat at least 4 times');
    out.setAttribute('aria-live', 'polite');
    go.onclick = function () {
      var now = performance.now();
      if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
      taps.push(now); if (taps.length > 8) taps.shift();
      if (taps.length < 4) { out.textContent = 'Tap ' + (4 - taps.length) + ' more'; return; }
      var bpm = Math.round(60000 * (taps.length - 1) / (taps[taps.length - 1] - taps[0]));
      out.innerHTML = '<b>' + bpm + ' Bpm</b>・' + (bpm < 80 ? 'Slow' : bpm <= 110 ? 'Medium' : 'Fast');
    };
    rs.onclick = function () { taps = []; out.textContent = 'Tap along with the beat at least 4 times'; };
    var row = el('div', 'btn-row'); row.appendChild(go); row.appendChild(rs); row.appendChild(out); t.appendChild(row);
  });

  /* 歌手與歌曲調查：老師即時輸入，重複的歌曲合併計票，再抽出一首現場示範 */
  $$('.songpoll').forEach(function (p) {
    var id = 'songpoll-' + p.getAttribute('data-id'), list = LS.get(id, []), pickedAt = -1;
    p.innerHTML = '<form class="sp-form"><input class="sp-artist" placeholder="Artist" aria-label="Artist" maxlength="40" autocomplete="off"><input class="sp-song" placeholder="Song title" aria-label="Song title" maxlength="60" autocomplete="off"><button type="submit" class="btn primary">Add</button></form>' +
      '<ol class="sp-list" aria-live="polite"></ol><p class="sp-sum muted"></p>' +
      '<div class="btn-row"><button type="button" class="btn sp-pick">Pick one to demo</button><button type="button" class="btn sp-save">Save to server</button><button type="button" class="btn sp-clear">Clear</button></div>';
    var form = p.querySelector('.sp-form'), ia = p.querySelector('.sp-artist'), is = p.querySelector('.sp-song'), ol = p.querySelector('.sp-list'), sum = p.querySelector('.sp-sum'), clr = p.querySelector('.sp-clear'), armed = 0;
    function key(o) { return (o.artist + '|' + o.song).replace(/\s+/g, '').toLowerCase(); }
    function save() { LS.set(id, list); draw(); }
    function order() { return list.map(function (o, k) { return k; }).sort(function (a, b) { return list[b].n - list[a].n || a - b; }); }
    function draw() {
      ol.innerHTML = '';
      order().forEach(function (k, r) {
        var o = list[k], li = el('li', 'sp-item' + (o.done ? ' done' : '') + (k === pickedAt ? ' picked' : ''));
        li.innerHTML = '<span class="sp-rank">' + (r + 1) + '</span><span class="sp-name"><b>' + esc(o.song || '(no song)') + '</b><small>' + esc(o.artist || '(no artist)') + '</small></span><span class="sp-n">' + o.n + ' votes</span>' +
          '<button type="button" class="btn sp-up" aria-label="' + esc(o.song) + ' Add a vote">＋1</button><button type="button" class="btn sp-done" aria-pressed="' + (o.done ? 'true' : 'false') + '">' + (o.done ? 'Demoed' : 'Demo') + '</button><button type="button" class="btn sp-del" aria-label="Delete ' + esc(o.song) + '">×</button>';
        li.querySelector('.sp-up').onclick = function () { o.n++; save(); };
        li.querySelector('.sp-done').onclick = function () { o.done = !o.done; save(); };
        li.querySelector('.sp-del').onclick = function () { list.splice(k, 1); if (pickedAt === k) pickedAt = -1; else if (pickedAt > k) pickedAt--; save(); };
        ol.appendChild(li);
      });
      var votes = list.reduce(function (a, o) { return a + o.n; }, 0);
      sum.textContent = list.length ? 'Total ' + list.length + ' songs, ' + votes + ' votes. A repeated song adds a vote automatically' : 'Enter an artist and a song title, then press Enter or "Add"';
      clr.textContent = armed ? 'Press again to clear' : 'Clear';
    }
    form.onsubmit = function (e) {
      e.preventDefault();
      var o = { artist: ia.value.trim(), song: is.value.trim(), n: 1, done: false };
      if (!o.artist && !o.song) { is.focus(); return; }
      var hit = list.filter(function (x) { return key(x) === key(o); })[0];
      if (hit) hit.n++; else list.push(o);
      ia.value = ''; is.value = ''; ia.focus(); save();
    };
    p.querySelector('.sp-pick').onclick = function () {
      var pool = list.map(function (o, k) { return k; }).filter(function (k) { return !list[k].done; });
      if (!pool.length) { say(list.length ? 'Every song has been demoed' : 'Add some songs first', 'warn'); return; }
      pickedAt = pool[Math.floor(Math.random() * pool.length)]; draw();
      var li = ol.querySelector('.picked'); if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    };
    p.querySelector('.sp-save').onclick = function () { report(p, 'songpoll', { item: 'Artist and song survey', result: order().map(function (k) { return list[k].song + '／' + list[k].artist + ' ' + list[k].n; }).join('、'), value: list.length, detail: { songs: list } }); say('Survey results recorded', 'ok'); };
    clr.onclick = function () { if (!armed) { armed = 1; draw(); setTimeout(function () { armed = 0; draw(); }, 3000); return; } armed = 0; list = []; pickedAt = -1; save(); };
    draw();
  });
});
