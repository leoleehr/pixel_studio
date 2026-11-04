/* Pixel Studio 互動分塊：唱名提示（.solfa）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('solfa', function (K) {
  'use strict';
  var LESSON = K.LESSON, LS = K.LS, $$ = K.$$, el = K.el, btn = K.btn, esc = K.esc, say = K.say, onLeave = K.onLeave, later = K.later;

  /* ---------- 唱名提示：唱名練習時在影片下方顯示目前旋律的唱名 ----------
   * 內容來源（依序）：老師在這台電腦貼上 → 後台「歌詞」分頁（代碼 data-id）→ 尚未設定
   * 格式：一行一句；行首可加時間「0:45」對應影片秒數，播放時自動跟著換行；沒有時間就用 ◀︎ ▶︎ 手動換行
   * 同一張投影片的分段計時進入 data-phase（預設第 1 段）時自動展開
   */
  var SOLFA_N = { '1': 'Do', '2': 'Re', '3': 'Mi', '4': 'Fa', '5': 'Sol', '6': 'La', '7': 'Si', '0': '' };
  function solfaScore(b) { // data-score="拍點|簡譜|歌詞;…"：一次只顯示一小節，依拍速逐音亮起
    var bpm = parseFloat(b.getAttribute('data-bpm')) || 68, keyTxt = b.getAttribute('data-key') || '', want = parseInt(b.getAttribute('data-phase') || '0', 10);
    var notes = b.getAttribute('data-score').split(';').map(function (x) { var a = x.split('|'); return { at: parseFloat(a[0]), n: a[1].replace(',', ''), low: a[1].indexOf(',') > -1, high: a[1].indexOf("'") > -1, w: a[2] || '' }; });
    var bars = Math.ceil(Math.max.apply(null, notes.map(function (n) { return n.at; })) / 4 + 0.001), total = bars * 4;
    var key = 'solfa-start-' + LESSON + '-' + (b.getAttribute('data-id') || 'solfa'), startAt = LS.get(key, null), t0 = 0, tick = 0, mode = '', shown = -1, open = false;
    b.classList.add('score');
    b.innerHTML = '<div class="sf-head"><b>Solfège guide</b><span class="sf-src muted">' + esc(keyTxt) + '・' + bpm + ' BPM · chorus ' + bars + ' bars</span><span class="sf-btns"><button type="button" class="btn go">▶︎ Sing along</button><button type="button" class="btn mark">Set chorus start</button><button type="button" class="btn tog">Show</button></span></div>' +
      '<div class="sf-body"><div class="sf-bar"></div><p class="sf-hint muted"></p></div>';
    var barEl = b.querySelector('.sf-bar'), hint = b.querySelector('.sf-hint');
    function digit(n) { return '<span class="sf-d">' + n.n + (n.low ? '<i class="lo"></i>' : '') + (n.high ? '<i class="hi"></i>' : '') + '</span>'; }
    function renderBar(k) {
      shown = k;
      var inBar = notes.filter(function (n) { return n.at >= k * 4 && n.at < k * 4 + 4; });
      barEl.innerHTML = '<span class="sf-no">Bar ' + (k + 1) + ' / ' + bars + '</span><div class="sf-notes">' + inBar.map(function (n) { return '<span class="sf-n" data-at="' + n.at + '">' + digit(n) + '<small>' + SOLFA_N[n.n] + '</small><em>' + esc(n.w) + '</em></span>'; }).join('') + '</div>';
    }
    function hl(beat) {
      var k = Math.min(bars - 1, Math.max(0, Math.floor(beat / 4)));
      if (k !== shown) renderBar(k);
      var curN = null; notes.forEach(function (n) { if (n.at <= beat) curN = n; });
      $$('.sf-n', barEl).forEach(function (el) { var at = parseFloat(el.getAttribute('data-at')); el.classList.toggle('on', curN && at === curN.at); el.classList.toggle('past', at < beat && !(curN && at === curN.at)); });
    }
    function videoCtl() { return window.PixelYT && window.PixelYT.find ? window.PixelYT.find(b.closest('.slide')) : null; }
    function loop() {
      var beat;
      if (mode === 'video') { var c = videoCtl(), pl = c && c.player; if (!pl || !pl.getCurrentTime || startAt === null) return; beat = (pl.getCurrentTime() - startAt) * bpm / 60; if (beat < -4 || beat > total + 2) { hint.textContent = 'Sings along automatically when the video reaches ' + fmt(startAt) + ' , or press "▶︎ Sing along"'; return; } }
      else { beat = (performance.now() - t0) / 1000 * bpm / 60 - 4; if (beat > total + 1) { stopRun(); hint.textContent = 'All four bars done. Press "▶︎ Sing along" to go again'; return; } }
      hint.textContent = 'Bar ' + (Math.min(bars - 1, Math.max(0, Math.floor(beat / 4))) + 1) + ' / ' + bars + ' · ' + (beat < 0 ? 'Count-in ' + Math.ceil(-beat) : 'Sing the solfège as it lights up');
      if (beat >= 0) hl(beat); else if (shown !== 0) renderBar(0);
    }
    function fmt(t) { return Math.floor(t / 60) + ':' + String(Math.floor(t % 60)).padStart(2, '0'); }
    function run(m) { stopRun(); mode = m; if (m === 'manual') t0 = performance.now(); tick = setInterval(loop, 40); }
    function stopRun() { clearInterval(tick); tick = 0; mode = ''; }
    function show(on) {
      open = on; b.classList.toggle('open', on); b.querySelector('.tog').textContent = on ? 'Collapse' : 'Show';
      if (on) { renderBar(0); hint.textContent = startAt !== null ? 'Sings along automatically when the video reaches ' + fmt(startAt) + ' , or press "▶︎ Sing along"' : 'Press "▶︎ Sing along" to start. Press "Set chorus start" when the chorus begins to sync with the video'; run('video'); }
      else stopRun();
    }
    b.querySelector('.tog').onclick = function () { show(!open); };
    b.querySelector('.go').onclick = function () { if (!open) show(true); run('manual'); };
    b.querySelector('.mark').onclick = function () {
      var c = videoCtl(), pl = c && c.player;
      if (!pl || !pl.getCurrentTime) { say('Play the video first, then press this as the first chorus line "不是因為" begins', 'warn'); return; }
      startAt = Math.max(0, pl.getCurrentTime() - 1.5 * 60 / bpm); LS.set(key, startAt); say('Chorus start set ' + fmt(startAt), 'ok'); if (!open) show(true); else run('video');
    };
    var slide = b.closest('.slide');
    if (slide) slide.addEventListener('phase:change', function (e) { var d = e.detail || {}; if (d.running && d.index === want) show(true); else if (d.running && d.index !== want) show(false); });
    renderBar(0); onLeave(b, stopRun);
  }
  $$('.solfa').forEach(function (b) {
    if (b.hasAttribute('data-score')) return solfaScore(b);
    var lid = b.getAttribute('data-id') || 'solfa', key = 'solfa-' + LESSON + '-' + lid, want = parseInt(b.getAttribute('data-phase') || '0', 10);
    var rows = [], cur = 0, src = '', tick = 0, open = false;
    b.innerHTML = '<div class="sf-head"><b>Solfège guide</b><span class="sf-src muted"></span><span class="sf-btns"><button type="button" class="btn prev" aria-label="Previous line">◀︎</button><button type="button" class="btn next" aria-label="Next line">▶︎</button><button type="button" class="btn tog">Show</button><button type="button" class="btn edit">Paste solfège</button></span></div>' +
      '<div class="sf-body"><p class="sf-prev"></p><p class="sf-cur"></p><p class="sf-next"></p></div>' +
      '<div class="sf-editor"><p class="muted">One line of numbered notation per phrase, for example "0:45 3 3 2 1 | 6̣ 1 2 –". A time at the start of a line matches the video\'s playback time and moves to the next line automatically; without a time, use ◀︎ ▶︎ to move. This is saved on this computer only. To show it on students\' phones too, paste it into the "Lyrics" tab of the course sheet with the code ' + esc(lid) + '.</p><textarea rows="8"></textarea><div class="btn-row"><button type="button" class="btn primary save">Save and show</button><button type="button" class="btn cancel">Cancel</button></div></div>';
    var ta = b.querySelector('textarea'), srcEl = b.querySelector('.sf-src');
    function tsec(t) { var m = t.match(/^\[?(\d+):(\d{1,2})\]?\s*/); return m ? { s: +m[1] * 60 + +m[2], rest: t.slice(m[0].length) } : null; }
    function parse(text) {
      rows = text.replace(/\r/g, '').split('\n').map(function (l) { return l.trim(); }).filter(Boolean).map(function (l) { var t = tsec(l); return t ? { t: t.s, txt: t.rest } : { t: null, txt: l }; });
      cur = 0; paint();
    }
    function paint() {
      var none = !rows.length;
      b.classList.toggle('empty', none);
      b.querySelector('.sf-cur').textContent = none ? 'The teacher hasn\'t set the solfège yet. Press "Paste solfège" to enter this song\'s numbered notation' : rows[cur].txt;
      b.querySelector('.sf-prev').textContent = none || cur === 0 ? '' : rows[cur - 1].txt;
      b.querySelector('.sf-next').textContent = none || cur >= rows.length - 1 ? '' : rows[cur + 1].txt;
      srcEl.textContent = none ? '' : (src === 'sheet' ? 'From the course sheet' : 'Pasted by the teacher') + '・' + (cur + 1) + ' / ' + rows.length;
    }
    function show(on) { open = on; b.classList.toggle('open', on); b.querySelector('.tog').textContent = on ? 'Collapse' : 'Show'; if (on) startSync(); else stopSync(); }
    function startSync() { // 有時間標記時，跟著影片播放時間換行
      stopSync(); if (!rows.some(function (r) { return r.t !== null; })) return;
      var slide = b.closest('.slide');
      tick = setInterval(function () {
        var c = window.PixelYT && window.PixelYT.find && window.PixelYT.find(slide), pl = c && c.player;
        if (!pl || !pl.getCurrentTime) return;
        var now = pl.getCurrentTime(), k = 0;
        rows.forEach(function (r, i) { if (r.t !== null && r.t <= now + 0.15) k = i; });
        if (k !== cur) { cur = k; paint(); }
      }, 200);
    }
    function stopSync() { clearInterval(tick); tick = 0; }
    b.querySelector('.prev').onclick = function () { if (cur > 0) { cur--; paint(); } };
    b.querySelector('.next').onclick = function () { if (cur < rows.length - 1) { cur++; paint(); } };
    b.querySelector('.tog').onclick = function () { show(!open); };
    b.querySelector('.edit').onclick = function () { ta.value = LS.get(key, '') || rows.map(function (r) { return (r.t !== null ? Math.floor(r.t / 60) + ':' + String(r.t % 60).padStart(2, '0') + ' ' : '') + r.txt; }).join('\n'); b.classList.add('editing'); ta.focus(); };
    b.querySelector('.cancel').onclick = function () { b.classList.remove('editing'); };
    b.querySelector('.save').onclick = function () { var v = ta.value.trim(); LS.set(key, v); src = 'local'; b.classList.remove('editing'); parse(v); show(true); };
    ta.addEventListener('keydown', function (e) { e.stopPropagation(); });
    var slide = b.closest('.slide');
    if (slide) slide.addEventListener('phase:change', function (e) { var d = e.detail || {}; if (d.running && d.index === want) show(true); else if (d.running && d.index !== want) show(false); });
    var mine = LS.get(key, '');
    if (mine) { src = 'local'; parse(mine); }
    else { paint(); later(function () { if (window.PixelBackend && window.PixelBackend.fetchLyrics) window.PixelBackend.fetchLyrics(lid).then(function (t) { if (t && !LS.get(key, '')) { src = 'sheet'; parse(t); } }); }); }
    onLeave(b, stopSync);
  });
});
