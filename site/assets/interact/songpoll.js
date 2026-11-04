/* Pixel Studio 互動分塊：拍點測速與歌手歌曲調查（.taptempo .songpoll）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('songpoll', function (K) {
  'use strict';
  var LS = K.LS, $$ = K.$$, el = K.el, btn = K.btn, esc = K.esc, report = K.report, say = K.say;

  /* 拍點測速：跟著音樂連續點按，以最近 8 下的間隔算出每分鐘拍數 */
  $$('.taptempo').forEach(function (t) {
    var taps = [], go = btn('拍點測速', 'primary tt-tap'), rs = btn('重來'), out = el('span', 'tt-out', '跟著拍子連續點按 4 下以上');
    out.setAttribute('aria-live', 'polite');
    go.onclick = function () {
      var now = performance.now();
      if (taps.length && now - taps[taps.length - 1] > 2000) taps = [];
      taps.push(now); if (taps.length > 8) taps.shift();
      if (taps.length < 4) { out.textContent = '再點 ' + (4 - taps.length) + ' 下'; return; }
      var bpm = Math.round(60000 * (taps.length - 1) / (taps[taps.length - 1] - taps[0]));
      out.innerHTML = '<b>' + bpm + ' Bpm</b>・' + (bpm < 80 ? '偏慢' : bpm <= 110 ? '中等' : '偏快');
    };
    rs.onclick = function () { taps = []; out.textContent = '跟著拍子連續點按 4 下以上'; };
    var row = el('div', 'btn-row'); row.appendChild(go); row.appendChild(rs); row.appendChild(out); t.appendChild(row);
  });

  /* 歌手與歌曲調查：老師即時輸入，重複的歌曲合併計票，再抽出一首現場示範 */
  $$('.songpoll').forEach(function (p) {
    var id = 'songpoll-' + p.getAttribute('data-id'), list = LS.get(id, []), pickedAt = -1;
    p.innerHTML = '<form class="sp-form"><input class="sp-artist" placeholder="歌手" aria-label="歌手" maxlength="40" autocomplete="off"><input class="sp-song" placeholder="歌曲名稱" aria-label="歌曲名稱" maxlength="60" autocomplete="off"><button type="submit" class="btn primary">加入</button></form>' +
      '<ol class="sp-list" aria-live="polite"></ol><p class="sp-sum muted"></p>' +
      '<div class="btn-row"><button type="button" class="btn sp-pick">抽一首示範</button><button type="button" class="btn sp-save">儲存到後台</button><button type="button" class="btn sp-clear">清除</button></div>';
    var form = p.querySelector('.sp-form'), ia = p.querySelector('.sp-artist'), is = p.querySelector('.sp-song'), ol = p.querySelector('.sp-list'), sum = p.querySelector('.sp-sum'), clr = p.querySelector('.sp-clear'), armed = 0;
    function key(o) { return (o.artist + '|' + o.song).replace(/\s+/g, '').toLowerCase(); }
    function save() { LS.set(id, list); draw(); }
    function order() { return list.map(function (o, k) { return k; }).sort(function (a, b) { return list[b].n - list[a].n || a - b; }); }
    function draw() {
      ol.innerHTML = '';
      order().forEach(function (k, r) {
        var o = list[k], li = el('li', 'sp-item' + (o.done ? ' done' : '') + (k === pickedAt ? ' picked' : ''));
        li.innerHTML = '<span class="sp-rank">' + (r + 1) + '</span><span class="sp-name"><b>' + esc(o.song || '（未填歌曲）') + '</b><small>' + esc(o.artist || '（未填歌手）') + '</small></span><span class="sp-n">' + o.n + ' 票</span>' +
          '<button type="button" class="btn sp-up" aria-label="' + esc(o.song) + ' 加一票">＋1</button><button type="button" class="btn sp-done" aria-pressed="' + (o.done ? 'true' : 'false') + '">' + (o.done ? '已示範' : '示範') + '</button><button type="button" class="btn sp-del" aria-label="刪除 ' + esc(o.song) + '">×</button>';
        li.querySelector('.sp-up').onclick = function () { o.n++; save(); };
        li.querySelector('.sp-done').onclick = function () { o.done = !o.done; save(); };
        li.querySelector('.sp-del').onclick = function () { list.splice(k, 1); if (pickedAt === k) pickedAt = -1; else if (pickedAt > k) pickedAt--; save(); };
        ol.appendChild(li);
      });
      var votes = list.reduce(function (a, o) { return a + o.n; }, 0);
      sum.textContent = list.length ? '共 ' + list.length + ' 首歌、' + votes + ' 票；重複的歌曲會自動加一票' : '輸入歌手與歌曲名稱，按 Enter 或「加入」';
      clr.textContent = armed ? '再按一次清除' : '清除';
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
      if (!pool.length) { say(list.length ? '每一首都示範過了' : '先加入歌曲', 'warn'); return; }
      pickedAt = pool[Math.floor(Math.random() * pool.length)]; draw();
      var li = ol.querySelector('.picked'); if (li && li.scrollIntoView) li.scrollIntoView({ block: 'nearest' });
    };
    p.querySelector('.sp-save').onclick = function () { report(p, 'songpoll', { item: '歌手與歌曲調查', result: order().map(function (k) { return list[k].song + '／' + list[k].artist + ' ' + list[k].n; }).join('、'), value: list.length, detail: { songs: list } }); say('已記錄調查結果', 'ok'); };
    clr.onclick = function () { if (!armed) { armed = 1; draw(); setTimeout(function () { armed = 0; draw(); }, 3000); return; } armed = 0; list = []; pickedAt = -1; save(); };
    draw();
  });
});
