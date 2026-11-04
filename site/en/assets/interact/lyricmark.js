/* Pixel Studio 互動分塊：歌詞換氣點標記（.lyricmark）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('lyricmark', function (K) {
  'use strict';
  var LESSON = K.LESSON, NS = K.NS, LS = K.LS, $$ = K.$$, el = K.el, btn = K.btn, esc = K.esc, slideNo = K.slideNo, say = K.say, later = K.later;

  /* ---------- 13. 歌詞換氣點標記 ----------
   * 歌詞來源（依序）：老師在這台電腦貼上的歌詞 → 後台「歌詞」分頁（需課程代碼）→ data-lines 預設片段
   * 歌詞格式：一行一句、空行分段、【主歌】這類標題行；字後面加 ∨ 或 | 為老師版大換氣，ˇ 或 ^ 為小換氣
   * data-marks 可改用其他記號（例："●|ŋ" 標韻腳與後鼻音），data-hint 為操作說明
   */
  $$('.lyricmark').forEach(function (l) {
    var lid = l.getAttribute('data-id') || '0', base = 'lyric-' + LESSON + '-' + lid;
    var fallback = l.getAttribute('data-lines').split(';').join('\n');
    var MK = (l.getAttribute('data-marks') || '∨|ˇ').split('|'), hint = l.getAttribute('data-hint') || 'Tap after a character to add a breath mark: once for ∨ (full breath), twice for ˇ (catch breath), three times to clear ';
    function mkOf(ch) { var k = MK.indexOf(ch); if (k > -1) return MK[k]; if (MK[0] === '∨') { if (ch === '|') return '∨'; if (ch === '^') return 'ˇ'; } return ''; }
    var marks = {}, teacher = {}, key = '', src = '';
    var box = el('div', 'lm-lines');
    var foot = el('div', 'btn-row'), sd = btn('Send my marks', 'primary'), tv = btn('Compare with teacher\'s'), cl = btn('Clear my marks'), ed = btn('Paste full lyrics');
    foot.appendChild(sd); foot.appendChild(tv); foot.appendChild(cl); foot.appendChild(ed);
    var msg = el('p', 'muted lm-msg');
    var editor = el('div', 'lm-editor', '<p class="muted">One line per phrase, a blank line between sections. You can add heading lines such as 【Verse】【Chorus】. To set the teacher\'s breath marks, put ∨ (full breath) or ˇ (catch breath) after a character. Lyrics are saved on this computer only. To sync them to students\' phones, paste them into the "Lyrics" tab of the course sheet.</p><textarea rows="10"></textarea><div class="btn-row"><button type="button" class="btn primary lm-save">Save and show</button><button type="button" class="btn lm-reset">Restore default excerpt</button><button type="button" class="btn lm-cancel">Cancel</button></div>');
    l.appendChild(box); l.appendChild(foot); l.appendChild(msg); l.appendChild(editor);
    var ta = editor.querySelector('textarea');
    function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); }
    function render(text, from) {
      src = from; teacher = {}; box.innerHTML = '';
      key = base + '-' + hash(text); marks = LS.get(key, {});
      var li = 0;
      text.replace(/\r/g, '').split('\n').forEach(function (raw) {
        var line = raw.trim();
        if (!line) { box.appendChild(el('div', 'lm-gap')); return; }
        if (/^[【\[［(（].*[】\]］)）]$/.test(line)) { box.appendChild(el('p', 'lm-label', esc(line.replace(/^[【\[［(（]|[】\]］)）]$/g, '')))); return; }
        var row = el('p', 'lm-line'), ci = 0, n = li++;
        line.split('').forEach(function (ch) {
          if (mkOf(ch) && ci > 0) { teacher[n + ':' + (ci - 1)] = mkOf(ch); return; }
          if (ch === ' ' || ch === '　') { row.appendChild(el('span', 'lm-sp', ' ')); return; }
          var id = n + ':' + ci, s = el('span', 'lm-ch', esc(ch)); s.setAttribute('data-id', id);
          s.onclick = function () { var k = MK.indexOf(marks[id] || ''); marks[id] = MK[k + 1] || ''; if (!marks[id]) delete marks[id]; LS.set(key, marks); paint(); };
          row.appendChild(s); ci++;
        });
        box.appendChild(row);
      });
      l.classList.toggle('long', li > 4);
      tv.disabled = !Object.keys(teacher).length;
      paint();
    }
    function paint() {
      var showT = l.classList.contains('show-t'), hit = 0, tot = Object.keys(teacher).length;
      $$('.lm-ch', l).forEach(function (s) {
        var id = s.getAttribute('data-id'), m = marks[id] || '', t = teacher[id] || '';
        s.setAttribute('data-m', m); s.setAttribute('data-k', MK.indexOf(m)); s.setAttribute('data-t', showT ? t : '');
        s.classList.toggle('match', showT && !!t && m === t);
        if (t && m === t) hit++;
      });
      var note = src === 'sheet' ? '(lyrics from the course sheet)' : src === 'local' ? '(full lyrics pasted by the teacher)' : '(default excerpt. Press "Paste full lyrics" to use the full verses and chorus)';
      msg.textContent = showT ? 'Marks matching the teacher\'s: ' + hit + ' / ' + tot + '. ' + (MK[0] === '∨' ? 'There\'s no single right answer for breath marks. What matters is having air left at the end of the line.' : '') : hint + note;
    }
    sd.onclick = function () {
      if (!Object.keys(marks).length) { say('Tap the lyrics to add marks first', 'warn'); return; }
      var text = $$('.lm-line', l).map(function (row) { return $$('.lm-ch', row).map(function (s) { return s.textContent + (marks[s.getAttribute('data-id')] || ''); }).join(''); }).join(' / ');
      var hit = Object.keys(teacher).filter(function (k) { return marks[k] === teacher[k]; }).length;
      if (window.PixelBackend) window.PixelBackend.send('lyric', { item: lid, result: text, value: hit, detail: { teacherMarks: Object.keys(teacher).length, source: src } }, { slide: slideNo(l), okMsg: MK[0] === '∨' ? 'Breath marks sent' : 'Marks sent' });
    };
    tv.onclick = function () { l.classList.toggle('show-t'); tv.textContent = l.classList.contains('show-t') ? 'Hide teacher\'s' : 'Compare with teacher\'s'; paint(); };
    cl.onclick = function () { marks = {}; LS.set(key, marks); paint(); };
    ed.onclick = function () { ta.value = LS.get(base + '-custom', '') || ''; l.classList.add('editing'); ta.focus(); };
    editor.querySelector('.lm-cancel').onclick = function () { l.classList.remove('editing'); };
    editor.querySelector('.lm-save').onclick = function () {
      var v = ta.value.trim(); if (!v) { say('Paste the lyrics first', 'warn'); return; }
      LS.set(base + '-custom', v); l.classList.remove('editing'); render(v, 'local');
    };
    editor.querySelector('.lm-reset').onclick = function () { try { localStorage.removeItem(NS + base + '-custom'); } catch (e) {} l.classList.remove('editing'); render(fallback, 'default'); };
    ta.addEventListener('keydown', function (e) { e.stopPropagation(); });
    var custom = LS.get(base + '-custom', '');
    if (custom) render(custom, 'local');
    else {
      render(fallback, 'default');
      later(function () { if (window.PixelBackend && window.PixelBackend.fetchLyrics) window.PixelBackend.fetchLyrics(lid).then(function (t) { if (t && !LS.get(base + '-custom', '')) render(t, 'sheet'); }); });
    }
  });
});
