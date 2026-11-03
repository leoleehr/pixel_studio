/* ===== Songwriting Lab：老師作品的互動練習（資料在 leo-works.js） =====
 * .lyricform  歌詞重組：從歌詞判斷段落名稱，排回原本的順序
 * .cloze      韻腳填空：選出符合押韻與語意的句尾
 * .rhetohunt  修辭獵人：點選句子，判斷使用的修辭
 * .wordhunt   關鍵字尋寶：在委託歌曲裡找出委託單位提供的關鍵字
 * .tonemap    字調地形圖：國語聲調的高低走向，作為依詞譜曲的參考
 * .wave       旋律波動：預測每一段旋律的音域位置，畫出整首歌的起伏
 * .arrmap     編曲地圖：為每一段安排樂器的編制，觀察能量曲線
 * .cheer      現場默契測驗：用麥克風測量觀眾呼應的音量
 * .lyricbox   歌詞框：題目上方的整首歌詞
 * .leoworks   作品全貌：完整歌詞、曲式、韻腳、修辭與討論題
 * .lyricdice  歌詞創作骰子：詞源骰子（1～4 字）與金句骰子（5～10 字），依韻腳抽出詞句，加入下方的歌詞草稿區
 */
(function () {
  'use strict';
  var W = window.PIXEL_LEO_WORKS || {}, ORDER = window.PIXEL_LEO_ORDER || Object.keys(W);
  // 範例曲（非老師作品）：只有段落結構，供旋律波動等練習使用
  var REF = window.PIXEL_REF_SONGS || {}; Object.keys(REF).forEach(function (k) { if (!W[k]) W[k] = REF[k]; });
  var NS = 'pixel:songwriting:';
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  };
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; return b; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function slideNo(root) { var s = root && root.closest && root.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(root, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(root) }); }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function ids(node, attr) { return (node.getAttribute(attr) || '').split(',').map(function (s) { return s.trim(); }).filter(function (k) { return W[k]; }); }
  var SECZH = { intro: 'Intro', verse: 'Verse', pre: 'Pre-chorus', chorus: 'Chorus', inter: 'Interlude', post: 'Post-chorus', bridge: 'Bridge', tag: 'Break line', outro: 'Outro' };
  // 可捲動的區塊要能用鍵盤聚焦
  function scroller(node, label, root) {
    var h = root && root.closest('.slide') && root.closest('.slide').querySelector('h2');
    node.tabIndex = 0; node.setAttribute('role', 'region'); node.setAttribute('aria-label', label + (h ? '｜' + h.textContent : '')); return node;
  }
  function secName(s) { return SECZH[s.k] + (s.name ? '<small>' + esc(s.name) + '</small>' : ''); }

  // 作品切換列：回傳 { bar, on(cb) }
  function tabs(root, list, key) {
    var bar = el('div', 'wk-tabs'), cb = null, cur = LS.get('tab-' + key, list[0]);
    if (list.indexOf(cur) < 0) cur = list[0];
    bar.setAttribute('role', 'group'); bar.setAttribute('aria-label', 'Choose a song');
    list.forEach(function (k) {
      var b = el('button', '', esc(W[k] ? W[k].title : k)); b.type = 'button'; b.dataset.k = k;
      b.onclick = function () { cur = k; LS.set('tab-' + key, k); paint(); if (cb) cb(k); };
      bar.appendChild(b);
    });
    function paint() { $$('button', bar).forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.k === cur ? 'true' : 'false'); }); }
    paint();
    return { bar: bar, cur: function () { return cur; }, on: function (f) { cb = f; f(cur); } };
  }

  /* ---------- 拼音與韻母（與韻腳檢查器相同的分組） ---------- */
  var RG = { a: ['ㄚ', '#e8412b'], i: ['ㄧ ㄩ', '#e2407f'], u: ['ㄨ', '#8a4fc0'], ao: ['ㄠ', '#2f5fc4'], ei: ['ㄝ ㄟ', '#45b3e6'], o: ['ㄛ ㄡ', '#6cbb4b'], en: ['ㄣ ㄥ', '#d6cf2c'], e: ['ㄜ', '#f4a62a'], an: ['ㄞ ㄢ', '#c2410c'], ang: ['ㄤ', '#0f9d8a'], zi: ['Empty rhyme', '#7a7a85'] };
  function groupOf(py) {
    py = (py || '').toLowerCase().replace(/v/g, 'ü');
    if (/^(zh|ch|sh|r|z|c|s)i$/.test(py)) return 'zi';
    if (py === 'er') return 'e';
    var f = py.replace(/^(zh|ch|sh|[bpmfdtnlgkhjqxrzcsyw])/, '');
    if (/^[jqxy]u/.test(py) && f[0] === 'u') f = 'ü' + f.slice(1);
    if (py[0] === 'y' && f[0] !== 'i' && f[0] !== 'ü' && f[0] !== 'u') f = 'i' + f;
    if (py[0] === 'w' && f[0] !== 'u') f = 'u' + f;
    if (/(ang|iang|uang)$/.test(f)) return 'ang';
    if (/(eng|ing|ong|iong|en|in|un|ün)$/.test(f)) return 'en';
    if (/(an|ian|uan|üan|ai|uai)$/.test(f)) return 'an';
    if (/(ao|iao)$/.test(f)) return 'ao';
    if (/(ou|iu|iou|uo)$/.test(f) || f === 'o') return 'o';
    if (/(ie|üe|ue|ei|ui|uei)$/.test(f)) return 'ei';
    if (/^(a|ia|ua)$/.test(f)) return 'a';
    if (/^(u)$/.test(f)) return 'u';
    if (/^(i|ü)$/.test(f)) return 'i';
    if (f === 'e') return 'e';
    return '';
  }
  var pyP = null;
  function loadPinyin() {
    if (pyP) return pyP;
    pyP = new Promise(function (res, rej) {
      if (window.pinyinPro) return res(window.pinyinPro);
      var s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/npm/pinyin-pro@3.26.0/dist/index.js'; s.integrity = 'sha384-Mh/hPt6f6/FyxC9q47MC2CWfdGJGX0kxu06eJ5ApIsK7IccBAQZXUQCnOdqeAmY3'; s.crossOrigin = 'anonymous';
      s.onload = function () { window.pinyinPro ? res(window.pinyinPro) : rej(); }; s.onerror = function () { pyP = null; rej(); }; document.head.appendChild(s);
    });
    return pyP;
  }
  // 元素進入畫面（或所在投影片切換到前景）時才執行一次
  function whenSeen(node, fn) {
    var done = false;
    function go() { if (!done) { done = true; fn(); } }
    var ob = new IntersectionObserver(function (es) { if (es.some(function (e) { return e.isIntersecting; })) { ob.disconnect(); go(); } }, { rootMargin: '200px' });
    ob.observe(node);
    var sl = node.closest('.slide');
    if (sl) document.addEventListener('slide:change', function () { if (sl.classList.contains('active')) go(); });
  }
  function lastHan(line) { var m = line.replace(/[\s　，。、！？；：「」『』（）()…~～.,!?;:'"]+$/g, '').match(/[㐀-鿿](?=[^㐀-鿿]*$)/); return m ? m[0] : ''; }

  /* ========== 1. 歌詞重組 ========== */
  var LF_OPTS = [['', 'Choose a section'], ['verse', 'Verse'], ['pre', 'Pre-chorus'], ['chorus', 'Chorus'], ['post', 'Post-chorus'], ['tag', 'Break line']];
  function lfKind(k) { return k === 'bridge' ? 'post' : k; }
  $$('.lyricform').forEach(function (root) {
    var list = ids(root, 'data-works'); if (!list.length) return;
    var T = tabs(root, list, 'lyricform-' + (root.getAttribute('data-id') || 'main'));
    var tip = el('p', 'wk-tip', 'Read each lyric card and choose its section name; tap the lyrics on two cards to swap them, and put them back in the original order.');
    var grid = scroller(el('div', 'lf-grid'), 'Lyric cards', root), foot = el('div', 'btn-row wk-foot'), msg = el('p', 'wk-msg', ''), strip = el('div', 'wk-strip');
    var bC = btn('Check', 'primary'), bS = btn('Shuffle'), bA = btn('Show answer');
    foot.append(bC, bS, bA, msg);
    root.append(T.bar, tip, strip, grid, foot);
    var work, ans, cur, labels, sel = -1;
    function txt(b) { return b.lines.join('\n'); }
    function load(k) {
      work = W[k]; ans = work.sections.filter(function (s) { return s.lines.length; });
      cur = ans.map(function (_, i) { return i; });
      do { cur = shuffle(cur); } while (cur.length > 2 && cur.every(function (v, i) { return txt(ans[v]) === txt(ans[i]); }));
      labels = ans.map(function () { return ''; }); sel = -1; msg.textContent = ''; strip.innerHTML = ''; tip.hidden = false; render();
    }
    function render(check) {
      grid.innerHTML = '';
      cur.forEach(function (v, i) {
        var b = ans[v], card = el('div', 'lf-card' + (i === sel ? ' sel' : ''));
        if (check) {
          card.classList.add(txt(ans[i]) === txt(b) ? 'pos-ok' : 'pos-no');
          card.classList.add(labels[v] === lfKind(b.k) ? 'lab-ok' : 'lab-no');
        }
        var head = el('div', 'lf-head', '<b>' + (i + 1) + '</b>');
        var s = el('select'); s.setAttribute('aria-label', 'Section name for card ' + (i + 1));
        LF_OPTS.forEach(function (o) { var op = el('option', '', o[1]); op.value = o[0]; if (labels[v] === o[0]) op.selected = true; s.appendChild(op); });
        s.onchange = function () { labels[v] = s.value; card.className = card.className.replace(/ ?lab-(ok|no)/g, ''); };
        head.appendChild(s);
        var body = el('button', 'lf-body', '<span>' + b.lines.map(esc).join('<br>') + '</span>'); body.type = 'button';
        body.setAttribute('aria-label', 'Lyric card ' + (i + 1) + ', tap it and then another card to swap them');
        body.onclick = function () { if (sel < 0) { sel = i; render(); } else { var t = cur[sel]; cur[sel] = cur[i]; cur[i] = t; sel = -1; render(); } };
        card.append(head, body); grid.appendChild(card);
      });
    }
    function showForm() {
      tip.hidden = true;
      strip.innerHTML = '<span class="wk-strip-t">Original sections</span>' + work.sections.map(function (s) { return '<span class="f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</span>'; }).join('');
    }
    bC.onclick = function () {
      var pos = cur.filter(function (v, i) { return txt(ans[v]) === txt(ans[i]); }).length;
      var lab = cur.filter(function (v) { return labels[v] === lfKind(ans[v].k); }).length;
      sel = -1; render(true);
      msg.innerHTML = 'Section names <b>' + lab + ' / ' + ans.length + '</b>, positions <b>' + pos + ' / ' + ans.length + '</b>' + (pos === ans.length && lab === ans.length ? ', all correct!' : '. A red border means the position is wrong; a red name means the section name is wrong.');
      if (pos === ans.length) showForm();
      report(root, 'lyricform', { item: 'Lyric reorder: ' + work.title, result: 'Name ' + lab + '/' + ans.length + ', position ' + pos + '/' + ans.length, value: lab + pos });
    };
    bS.onclick = function () { load(T.cur()); };
    bA.onclick = function () { cur = ans.map(function (_, i) { return i; }); labels = ans.map(function (b) { return lfKind(b.k); }); sel = -1; render(true); msg.textContent = 'This is the original order and section names.'; showForm(); };
    T.on(load);
  });

  /* ========== 2. 韻腳填空 ========== */
  // 歌詞寫在元素內，每行一句；{答案/選項/選項} 為空格
  $$('.cloze').forEach(function (root) {
    var raw = root.textContent.trim().split('\n').map(function (s) { return s.trim(); }).filter(Boolean);
    root.textContent = '';
    var box = el('div', 'cz-lines'), foot = el('div', 'btn-row wk-foot'), msg = el('p', 'wk-msg', '');
    var blanks = [];
    raw.forEach(function (ln) {
      var p = el('p', 'cz-line');
      ln.split(/(\{[^}]+\})/).forEach(function (part) {
        var m = /^\{([^}]+)\}$/.exec(part);
        if (!m) { p.appendChild(document.createTextNode(part)); return; }
        var opts = m[1].split('/'), s = el('select', 'cz-sel'); s.setAttribute('aria-label', 'Blank ' + (blanks.length + 1));
        var ph = el('option', '', '＿＿＿'); ph.value = ''; s.appendChild(ph);
        shuffle(opts).forEach(function (o) { var op = el('option', '', esc(o)); op.value = o; s.appendChild(op); });
        s.onchange = function () { s.classList.remove('ok', 'no'); };
        blanks.push({ s: s, a: opts[0] }); p.appendChild(s);
      });
      box.appendChild(p);
    });
    var bC = btn('Check', 'primary'), bA = btn('Show answer');
    foot.append(bC, bA); root.append(box, foot, msg);
    bC.onclick = function () {
      var n = 0; blanks.forEach(function (b) { var ok = b.s.value === b.a; if (ok) n++; b.s.classList.toggle('ok', ok); b.s.classList.toggle('no', !ok); });
      msg.innerHTML = 'Correct <b>' + n + ' / ' + blanks.length + '</b>' + (n === blanks.length ? ', rhyme and meaning both correct!' : '. Read the lines before and after aloud and check whether the line endings rhyme.');
      report(root, 'cloze', { item: root.getAttribute('data-title') || 'Rhyme fill-in', result: n + '/' + blanks.length, value: n });
    };
    bA.onclick = function () { blanks.forEach(function (b) { b.s.value = b.a; b.s.classList.remove('no'); b.s.classList.add('ok'); }); msg.innerHTML = root.getAttribute('data-why') || 'These are the original lyrics.'; };
  });

  /* ========== 3. 修辭獵人 ========== */
  var FIGS = ['Metaphor', 'Transference', 'Hyperbole', 'Contrast', 'Repetition', 'Parallelism', 'Antithesis', 'Climax', 'Rhetorical question', 'Pun', 'Sensory description', 'Symbolism', 'Metonymy', 'Palindrome', 'Allusion', 'Parody', 'Irony', 'Apostrophe'];
  // 找出每個修辭片段第一次出現的位置：{ si, li }
  function figSpots(work) {
    return (work.figs || []).map(function (f) {
      for (var si = 0; si < work.sections.length; si++) for (var li = 0; li < work.sections[si].lines.length; li++) if (work.sections[si].lines[li].indexOf(f.at) > -1) return { f: f, si: si, li: li };
      return null;
    }).filter(Boolean);
  }
  $$('.rhetohunt').forEach(function (root) {
    var list = ids(root, 'data-works'); if (!list.length) return;
    var T = tabs(root, list, 'rhetohunt-' + (root.getAttribute('data-id') || 'main'));
    var box = el('div', 'rh2'), lyr = scroller(el('div', 'rh2-lyrics'), 'Lyrics', root), side = el('div', 'rh2-side');
    var score = el('p', 'rh2-score'), q = el('div', 'rh2-q', '<p class="muted">Tap a line on the left marked <b class="rh2-dot">?</b>, then choose the figure of speech it uses from below.</p>'), chips = el('div', 'rh2-chips'), why = el('p', 'rh2-why');
    var foot = el('div', 'btn-row wk-foot'), bAll = btn('Reveal all');
    foot.appendChild(bAll); side.append(score, q, chips, why, foot); box.append(lyr, side); root.append(T.bar, box);
    var work, spots, found, cur;
    function load(k) {
      work = W[k]; spots = figSpots(work); found = spots.map(function () { return false; }); cur = -1;
      lyr.innerHTML = '';
      var seen = {};
      work.sections.forEach(function (s, si) {
        if (!s.lines.length) return;
        var key = s.lines.join('|'), rep = seen[key]; seen[key] = 1;
        var sec = el('div', 'rh2-sec' + (rep ? ' rep' : ''), '<div class="rh2-sn f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + (rep ? '(repeat)' : '') + '</div>');
        s.lines.forEach(function (ln, li) {
          var idxs = []; spots.forEach(function (p, j) { if (p.si === si && p.li === li) idxs.push(j); });
          if (!idxs.length) { sec.appendChild(el('p', 'rh2-ln', esc(ln))); return; }
          // 一句可能有兩種以上的修辭：每一種各有一個按鈕，點選句子則跳到尚未找到的那一個
          var row = el('div', 'rh2-ln hit');
          idxs.forEach(function (j) {
            var d = el('button', 'rh2-dot', '?'); d.type = 'button'; d.dataset.i = j;
            d.setAttribute('aria-label', 'Question: “' + spots[j].f.at + '”');
            d.onclick = function (e) { e.stopPropagation(); pick(j); };
            row.appendChild(d);
          });
          row.appendChild(document.createTextNode(ln));
          row.onclick = function () { var n = idxs.filter(function (j) { return !found[j]; })[0]; pick(n != null ? n : idxs[0]); };
          sec.appendChild(row);
        });
        lyr.appendChild(sec);
      });
      var need = {}; spots.forEach(function (p) { p.f.figs.forEach(function (x) { need[x] = 1; }); });
      var opts = Object.keys(need), pool = shuffle(FIGS.filter(function (x) { return !need[x]; }));
      while (opts.length < 8 && pool.length) opts.push(pool.shift());
      opts = FIGS.filter(function (x) { return opts.indexOf(x) > -1; });
      chips.innerHTML = '';
      opts.forEach(function (o) { var b = el('button', 'rh2-chip', o); b.type = 'button'; b.disabled = true; b.onclick = function () { answer(o, b); }; chips.appendChild(b); });
      q.innerHTML = '<p class="muted">Tap a line on the left marked <b class="rh2-dot">?</b>, then choose the figure of speech it uses from below.</p>'; why.textContent = ''; paintScore();
    }
    function mark(i) { var d = lyr.querySelector('.rh2-dot[data-i="' + i + '"]'); if (d) { d.classList.add('done'); d.textContent = spots[i].f.figs[0]; } }
    function paintScore() { var n = found.filter(Boolean).length; score.innerHTML = 'Found <b>' + n + ' / ' + spots.length + '</b> figures of speech'; }
    function pick(i) {
      cur = i; $$('.rh2-dot', lyr).forEach(function (b) { b.classList.toggle('sel', +b.dataset.i === i); b.closest('.rh2-ln').classList.toggle('sel', false); });
      var dot = lyr.querySelector('.rh2-dot[data-i="' + i + '"]'); if (dot) dot.closest('.rh2-ln').classList.add('sel');
      q.innerHTML = '<p class="rh2-quote">「' + esc(spots[i].f.at) + '」</p>';
      why.textContent = found[i] ? spots[i].f.why : '';
      $$('.rh2-chip', chips).forEach(function (c) { c.disabled = false; c.classList.remove('right', 'wrong'); if (found[i] && spots[i].f.figs.indexOf(c.textContent) > -1) c.classList.add('right'); });
    }
    function answer(o, b) {
      if (cur < 0) return;
      var sp = spots[cur], ok = sp.f.figs.indexOf(o) > -1;
      b.classList.add(ok ? 'right' : 'wrong');
      if (ok) {
        if (!found[cur]) report(root, 'rhetoric', { item: work.title + ': ' + sp.f.at, result: 'Correct', detail: { answer: o } });
        found[cur] = true; why.textContent = sp.f.why + (sp.f.figs.length > 1 ? ' (accepted answers: ' + sp.f.figs.join(', ') + ')' : '');
        mark(cur);
        paintScore();
      } else why.textContent = 'Think again: does the definition of ' + o + ' fit how this line is written?';
    }
    bAll.onclick = function () {
      spots.forEach(function (sp, i) { found[i] = true; mark(i); });
      paintScore(); if (cur > -1) pick(cur);
    };
    T.on(load);
  });

  /* ========== 4. 關鍵字尋寶 ========== */
  $$('.wordhunt').forEach(function (root) {
    var k = root.getAttribute('data-work'), work = W[k]; if (!work || !work.keywords) return;
    var kws = work.keywords, got = {}, tries = 0;
    var head = el('p', 'wh-brief', '<b>' + esc(work.client || 'The client') + '</b> supplied ' + kws.length + ' keywords. Tap words in the lyrics to find where they\'re hidden.');
    var lyr = scroller(el('div', 'wh-lyrics'), 'Lyrics', root), side = el('div', 'wh-side'), score = el('p', 'wh-score'), chipBox = el('div', 'wh-chips'), msg = el('p', 'wk-msg');
    var foot = el('div', 'btn-row wk-foot'), bAll = btn('Show all'), bR = btn('Start over');
    foot.append(bAll, bR); side.append(score, chipBox, msg, foot);
    var box = el('div', 'wh'); box.append(lyr, side); root.append(head, box);
    var seen = {};
    work.sections.forEach(function (s) {
      var key = s.lines.join('|'); if (!s.lines.length || seen[key]) return; seen[key] = 1;
      var sec = el('div', 'wh-sec', '<div class="rh2-sn f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</div>');
      s.lines.forEach(function (ln) {
        var p = el('p', 'wh-ln'), marks = [];
        kws.forEach(function (w, wi) { var at = -1; while ((at = ln.indexOf(w, at + 1)) > -1) for (var c = 0; c < w.length; c++) marks[at + c] = wi; });
        for (var i = 0; i < ln.length; i++) { var sp = el('span', '', esc(ln[i])); if (marks[i] != null) sp.dataset.w = marks[i]; p.appendChild(sp); }
        sec.appendChild(p);
      });
      lyr.appendChild(sec);
    });
    lyr.addEventListener('click', function (e) {
      var t = e.target; if (t.tagName !== 'SPAN' || !t.parentNode.classList.contains('wh-ln')) return;
      tries++;
      if (t.dataset.w == null) { t.classList.remove('miss'); void t.offsetWidth; t.classList.add('miss'); return; }
      reveal(+t.dataset.w, true);
    });
    function reveal(wi, byUser) {
      if (!got[wi] && byUser) report(root, 'wordhunt', { item: work.title + ': ' + kws[wi], result: 'Found' });
      got[wi] = true; $$('span[data-w="' + wi + '"]', lyr).forEach(function (s) { s.classList.add('hit'); }); paint();
    }
    function paint() {
      var n = Object.keys(got).length;
      score.innerHTML = 'Found <b>' + n + ' / ' + kws.length + '</b> keywords';
      chipBox.innerHTML = kws.map(function (w, i) { return '<span class="' + (got[i] ? 'on' : '') + '">' + (got[i] ? esc(w) : '? '.repeat(w.length)) + '</span>'; }).join('');
      if (n === kws.length) msg.innerHTML = 'All found! Look at where they sit: the verses introduce the scenery and faith, and the chorus brings in produce, festivals and sights, so each section has its own theme and the lyrics don\'t become a list.';
    }
    bAll.onclick = function () { kws.forEach(function (_, i) { reveal(i, false); }); };
    bR.onclick = function () { got = {}; $$('span.hit', lyr).forEach(function (s) { s.classList.remove('hit'); }); msg.textContent = ''; paint(); };
    paint();
  });

  /* ========== 5. 字調地形圖 ========== */
  // 五度標記：一聲 55、二聲 35、三聲 214（句中多唸 21）、四聲 51、輕聲 3
  var CONTOUR = { 1: [5, 5], 2: [3, 5], 3: [2, 1, 4], 4: [5, 1], 5: [3, 3], 0: [3, 3] };
  var TONE_ZH = { 1: '1st tone', 2: '2nd tone', 3: '3rd tone', 4: '4th tone', 5: 'Neutral tone', 0: 'Neutral tone' };
  $$('.tonemap').forEach(function (root) {
    var sample = root.getAttribute('data-sample') || '';
    var id = 'tonemap-' + (root.getAttribute('data-id') || 'main');
    var inp = el('input', 'tm-in'); inp.type = 'text'; inp.value = LS.get(id, sample); inp.setAttribute('aria-label', 'Type a lyric line'); inp.maxLength = 24;
    var row = el('div', 'tm-row'), bP = btn('▶︎ Hear the tones', 'primary'), bR = btn('Restore the example');
    row.append(inp, bP, bR);
    var fig = el('div', 'tm-fig'), info = el('p', 'tm-info', 'Loading pinyin data…');
    root.append(row, fig, info);
    var data = [];
    function calc() {
      var P = window.pinyinPro; if (!P) return;
      var chars = inp.value.replace(/[^㐀-鿿]/g, '').slice(0, 24).split('');
      var num = chars.length ? P.pinyin(chars.join(''), { toneType: 'num', type: 'array' }) : [];
      var sym = chars.length ? P.pinyin(chars.join(''), { type: 'array' }) : [];
      data = chars.map(function (c, i) { var m = /(\d)$/.exec(num[i] || ''); return { c: c, t: m && +m[1] ? +m[1] : 5, py: (sym[i] || '').normalize('NFC') }; });
      // 三聲連讀：前一個三聲變成二聲
      for (var i = 0; i < data.length - 1; i++) if (data[i].t === 3 && data[i + 1].t === 3) { data[i].t = 2; data[i].sandhi = true; }
      draw();
    }
    function draw() {
      if (!data.length) { fig.innerHTML = ''; info.textContent = 'Type a lyric line and see how high or low each character\'s tone is.'; return; }
      var cw = 64, H = 150, top = 14, bot = 108, w = data.length * cw;
      function y(v) { return bot - (v - 1) / 4 * (bot - top); }
      var svg = '<svg viewBox="0 0 ' + w + ' ' + H + '" class="tm-svg" role="img" aria-label="Tone map: ' + esc(data.map(function (d) { return d.c + TONE_ZH[d.t]; }).join(', ')) + '">';
      [1, 2, 3, 4, 5].forEach(function (v) { svg += '<line x1="0" x2="' + w + '" y1="' + y(v) + '" y2="' + y(v) + '" class="tm-grid"/>'; });
      var path = '';
      data.forEach(function (d, i) {
        var c = CONTOUR[d.t] || CONTOUR[5], x0 = i * cw + 12, x1 = i * cw + cw - 12;
        var pts = c.map(function (v, k) { return [x0 + (x1 - x0) * k / (c.length - 1), y(v)]; });
        var seg = 'M' + pts.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L');
        svg += '<path d="' + seg + '" class="tm-t t' + d.t + '"/>';
        svg += '<text x="' + (i * cw + cw / 2) + '" y="' + (H - 22) + '" class="tm-c">' + esc(d.c) + '</text>';
        svg += '<text x="' + (i * cw + cw / 2) + '" y="' + (H - 4) + '" class="tm-py">' + esc(d.py) + (d.sandhi ? '*' : '') + '</text>';
        path += (i ? ' L' : 'M') + (i * cw + cw / 2) + ' ' + y((c[0] + c[c.length - 1]) / 2).toFixed(1);
      });
      svg += '<path d="' + path + '" class="tm-mid"/></svg>';
      fig.innerHTML = svg;
      var cnt = {}; data.forEach(function (d) { cnt[d.t] = (cnt[d.t] || 0) + 1; });
      var tips = [];
      for (var i = 0; i < data.length - 1; i++) {
        if (data[i].t === 4 && data[i + 1].t === 1) tips.push('“' + data[i].c + data[i + 1].c + '” goes from 4th tone to 1st, so the melody can leap up from low; it comes across most clearly');
        if (data[i].t === 1 && data[i + 1].t === 4 && tips.length < 3) tips.push('“' + data[i].c + data[i + 1].c + '” goes from 1st tone to 4th, so the melody suits moving from high to low');
      }
      info.innerHTML = [1, 2, 3, 4, 5].filter(function (t) { return cnt[t]; }).map(function (t) { return TONE_ZH[t] + ' ' + cnt[t]; }).join(', ') + (data.some(function (d) { return d.sandhi; }) ? '(* third-tone sandhi applied)' : '') + '。<br>' + (tips.length ? tips.slice(0, 2).join('；') + '. ' : 'If the melody moves against the tones, listeners easily mishear the words; put high notes on 1st- and 4th-tone characters for the clearest diction.');
    }
    var tid = 0;
    inp.addEventListener('input', function () { LS.set(id, inp.value); clearTimeout(tid); tid = setTimeout(calc, 200); });
    bR.onclick = function () { inp.value = sample; LS.set(id, sample); calc(); };
    bP.onclick = function () {
      var c = window.PS && PS.audio ? PS.audio.ctx() : null; if (!c || !data.length) return;
      var t = c.currentTime + 0.05, base = 196, step = 0.3;
      data.forEach(function (d) {
        var cont = CONTOUR[d.t] || CONTOUR[5], o = c.createOscillator(), g = c.createGain(), dur = d.t === 5 ? step * 0.6 : step;
        o.type = 'triangle';
        cont.forEach(function (v, k) { var f = base * Math.pow(2, (v - 1) * 2.4 / 12); var at = t + dur * k / Math.max(1, cont.length - 1); if (k) o.frequency.linearRampToValueAtTime(f, at); else o.frequency.setValueAtTime(f, at); });
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.03); g.gain.setValueAtTime(0.25, t + dur - 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        o.connect(g).connect(c.destination); o.start(t); o.stop(t + dur + 0.02); t += dur + 0.06;
      });
    };
    whenSeen(root, function () { loadPinyin().then(function () { calc(); }).catch(function () { info.textContent = 'The pinyin data couldn\'t load. Please check your connection.'; }); });
  });

  /* ========== 6. 旋律波動 ========== */
  var WAVE_REF = { intro: 2, verse: 3, pre: 5, chorus: 6, inter: 3, post: 6, bridge: 5, tag: 4, outro: 2 };
  var WAVE_ADD = ['intro', 'verse', 'pre', 'chorus', 'inter', 'bridge', 'outro'];
  $$('.wave').forEach(function (root) {
    var list = ids(root, 'data-works'); if (!list.length) return;
    var T = tabs(root, list, 'wave-' + (root.getAttribute('data-id') || 'main'));
    var meta = el('p', 'wk-tip'), box = el('div', 'wv'), svgBox = el('div', 'wv-curve'), msg = el('p', 'wk-msg');
    var foot = el('div', 'btn-row wk-foot'), bRef = btn('Compare with a common layout'), bClr = btn('Clear');
    // 範例曲的段落可以邊聽邊增減
    var edit = el('div', 'wv-edit'); edit.appendChild(el('span', 'ld-lab', 'Section'));
    WAVE_ADD.forEach(function (k) { var b = el('button', 'f-' + k, '＋' + SECZH[k]); b.type = 'button'; b.onclick = function () { secs.push({ k: k, name: SECZH[k] }); st.push(0); saveSecs(); draw(); }; edit.appendChild(b); });
    var bPop = btn('Delete the last section'), bReset = btn('Reset sections');
    bPop.onclick = function () { if (secs.length > 1) { secs.pop(); st.pop(); saveSecs(); draw(); } };
    bReset.onclick = function () { secs = work.sections.map(function (s) { return { k: s.k, name: s.name }; }); st = secs.map(function () { return 0; }); saveSecs(); draw(); };
    edit.append(bPop, bReset);
    var lyr = root.hasAttribute('data-lyrics') ? el('div', 'lyricbox wv-lyrics') : null;
    foot.append(bRef, bClr); root.append(T.bar, meta, edit, box, svgBox, foot, msg); if (lyr) root.appendChild(lyr);
    if (root.classList.contains('compact')) foot.appendChild(msg);  // 精簡版：回饋與按鈕同一列
    var work, secs, st, showRef = false, key, selected=0;
    var mobile=el('div','wv-mobile'),pickLabel=el('label','','Edit sections '),pick=el('select'),levelLabel=el('label','','Range position (0 is unset) '),level=el('input'),value=el('output'),row=el('div','wv-mobile-level'),overview=el('div','wv-mobile-overview');
    level.type='range';level.min=0;level.max=7;level.step=1;pickLabel.appendChild(pick);levelLabel.appendChild(level);mobile.append(pickLabel,levelLabel,row,overview);root.insertBefore(mobile,box);
    var lower=btn('One step lower'),higher=btn('One step higher');row.append(lower,value,higher);
    function setLevel(v){st[selected]=Math.max(0,Math.min(7,v));LS.set(key,st);draw();}
    pick.onchange=function(){selected=+pick.value;draw();};level.oninput=function(){setLevel(+level.value);};lower.onclick=function(){setLevel(st[selected]-1);};higher.onclick=function(){setLevel(st[selected]+1);};
    function syncMobile(){selected=Math.min(selected,secs.length-1);pick.replaceChildren();overview.replaceChildren();secs.forEach(function(s,i){var name=(i+1)+'. '+(s.name||SECZH[s.k]);pick.add(new Option(name,i));var b=btn(name+': '+(st[i]||'Unset'));b.type='button';b.setAttribute('aria-pressed',i===selected);b.onclick=function(){selected=i;draw();pick.focus({preventScroll:true});};overview.appendChild(b);});pick.value=selected;level.value=st[selected];value.textContent=st[selected]?'Range '+st[selected]:'Not set yet';level.setAttribute('aria-valuetext',value.textContent);lower.disabled=st[selected]===0;higher.disabled=st[selected]===7;}
    function saveSecs() { LS.set(key + '-secs', secs); LS.set(key, st); }
    function load(k) {
      work = W[k]; key = 'wave-' + k;
      secs = (work.editable && LS.get(key + '-secs', null)) || work.sections.map(function (s) { return { k: s.k, name: s.name }; });
      st = LS.get(key, null); if (!st || st.length !== secs.length) st = secs.map(function () { return 0; });
      showRef = false; selected=0;edit.hidden = !work.editable;
      meta.innerHTML = work.artist
        ? 'As you listen to ' + esc(work.title) + ', tap a melody range position for each section (7 highest, 1 lowest).' + (work.editable ? 'The sections start in a common song form; add or remove them to match what you hear.' : '')
        : 'Following the mood of the lyrics, tap a melody range position for each section (7 highest, 1 lowest).' + (work.key ? 'Original: ' + (work.meter || '4/4') + ', ' + work.key + ' major' + (work.bpm ? ', ' + work.bpm + ' BPM' : '') + '. ' : '');
      if (lyr) lyrics();
      draw();
    }
    function lyrics() {
      var seen = {};
      lyr.innerHTML = '<p class="lb-title">〈' + esc(work.title) + '〉<small>' + esc(work.credit || '') + '</small></p>' + work.sections.map(function (s) {
        if (!s.lines || !s.lines.length) return '';
        var key2 = s.lines.join('|'), rep = seen[key2]; seen[key2] = 1;
        return '<div class="lb-sec"><span class="rh2-sn f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</span>' + (rep ? '<p class="lb-ln muted">(same as above)</p>' : s.lines.map(function (ln) { return '<p class="lb-ln">' + esc(ln) + '</p>'; }).join('')) + '</div>';
      }).join('');
      lyr.tabIndex = 0; lyr.setAttribute('role', 'region'); lyr.setAttribute('aria-label', work.title + ' Lyrics');
    }
    function draw() {
      box.innerHTML = ''; box.style.setProperty('--n', secs.length);
      secs.forEach(function (s, i) {
        var col = el('div', 'wv-col f-' + s.k);
        for (var v = 7; v >= 1; v--) {
          var c = el('button', 'wv-cell' + (st[i] >= v ? ' on' : '') + (showRef && (WAVE_REF[s.k] || 3) + (isLast(i) ? 1 : 0) === v ? ' ref' : '')); c.type = 'button';
          c.setAttribute('aria-label', (s.name || SECZH[s.k]) + ' Range ' + v); c.dataset.i = i; c.dataset.v = v;
          c.onclick = function () { var i2 = +this.dataset.i, v2 = +this.dataset.v; st[i2] = st[i2] === v2 ? 0 : v2; LS.set(key, st); draw(); };
          col.appendChild(c);
        }
        col.appendChild(el('div', 'wv-name', esc(s.name || SECZH[s.k])));
        box.appendChild(col);
      });
      var n = secs.length, Wd = 1000, H = 80;
      function pt(i, v) { return ((i + 0.5) / n * Wd).toFixed(1) + ' ' + (H - 6 - (v - 1) / 6 * (H - 12)).toFixed(1); }
      var mine = st.map(function (v, i) { return v ? pt(i, v) : null; }).filter(Boolean);
      var ref = secs.map(function (s, i) { return pt(i, (WAVE_REF[s.k] || 3) + (isLast(i) ? 1 : 0)); });
      svgBox.innerHTML = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" preserveAspectRatio="none" class="wv-svg" aria-hidden="true">' + (showRef ? '<path class="wv-ref" d="M' + ref.join(' L') + '"/>' : '') + (mine.length > 1 ? '<path class="wv-mine" d="M' + mine.join(' L') + '"/>' : '') + '</svg>';
      syncMobile();check();
    }
    function isLast(i) { if (secs[i].k !== 'chorus') return false; for (var j = i + 1; j < secs.length; j++) if (secs[j].k === 'chorus') return false; return secs.filter(function (s) { return s.k === 'chorus'; }).length > 2; }
    function avg(k) { var a = []; secs.forEach(function (s, i) { if (s.k === k && st[i]) a.push(st[i]); }); return a.length ? a.reduce(function (x, y) { return x + y; }, 0) / a.length : 0; }
    function check() {
      if (st.filter(Boolean).length < Math.min(4, secs.length)) { msg.textContent = 'Feedback appears once you\'ve set at least four sections.'; return; }
      var out = [], v = avg('verse'), p = avg('pre'), c = avg('chorus');
      if (v && c && c <= v) out.push('The chorus range isn\'t higher than the verse, so the hook can get lost; try pushing the chorus up 2 or 3 steps.');
      if (p && v && c && !(p >= v && p <= c)) out.push('The pre-chorus builds the heat, and its range usually sits between the verse and chorus.');
      var tagI = secs.map(function (s) { return s.k; }).lastIndexOf('tag');
      if (tagI > -1 && st[tagI] && c && st[tagI] > c) out.push('The tag is higher than the chorus, so the ending\'s emotion is left hanging in mid-air; you can do it on purpose, but be able to say why.');
      var last = -1; secs.forEach(function (s, i) { if (isLast(i)) last = i; });
      if (last > -1 && st[last] && c && st[last] < c) out.push('The last chorus is usually higher than the earlier ones, or lifts the emotion with a key change.');
      msg.innerHTML = out.length ? out.map(function (x) { return '! ' + esc(x); }).join('<br>') : '✓ Clear rise and fall: the verse lays the ground, the pre-chorus builds, the chorus reaches the top. After listening to the original, compare the two curves.';
    }
    bRef.onclick = function () { showRef = !showRef; bRef.textContent = showRef ? 'Hide the common layout' : 'Compare with a common layout'; draw(); };
    bClr.onclick = function () { st = secs.map(function () { return 0; }); LS.set(key, st); draw(); };
    T.on(load);
  });

  /* ========== 7. 編曲地圖 ========== */
  var INST = [['drums', 'Drums'], ['bass', 'Bass'], ['keys', 'Piano / keys'], ['ag', 'Acoustic guitar'], ['eg', 'Electric guitar'], ['str', 'String instruments'], ['syn', 'Synth'], ['bvs', 'Harmony']];
  var LV = ['', '◐', '●'];
  $$('.arrmap').forEach(function (root) {
    var list = ids(root, 'data-works'); if (!list.length) return;
    var opts = list.slice(); var mine = LS.get('form-mine', null);
    if (mine && mine.list && mine.list.length) opts.push('mine');
    if (!W.mine) W.mine = { title: 'Our version' };
    var T = tabs(root, opts, 'arrmap-' + (root.getAttribute('data-id') || 'main'));
    var tip = el('p', 'wk-tip', 'Tap a cell to switch the instrumentation: empty, ◐ light, ● full. The curve below is each section\'s energy.');
    var wrap = el('div', 'am-wrap'), curve = el('div', 'am-curve'), msg = el('p', 'wk-msg'), foot = el('div', 'btn-row wk-foot');
    var bEx = btn('Apply the build-up example'), bClr = btn('Clear');
    foot.append(bEx, bClr); root.append(T.bar, tip, wrap, curve, foot, msg);
    var secs, st, key, inst;
    function load(k) {
      if (k === 'mine') { var f = LS.get('form-mine', { list: [] }); secs = f.list.map(function (b) { return { k: b.k === 'inter' ? 'inter' : b.k, name: { intro: 'Intro', verse: 'Verse', pre: 'Pre-chorus', chorus: 'Chorus', inter: 'Interlude', bridge: 'Bridge', tag: 'Break line', outro: 'Outro', ending: 'Ending' }[b.k] }; }); }
      else secs = W[k].sections.map(function (s) { return { k: s.k, name: s.name }; });
      inst = INST.slice(); if (k === 'xmas') inst.push(['crowd', 'Call and response']);
      key = 'arrmap-' + k; st = LS.get(key, null);
      if (!st || st.length !== inst.length || (st[0] || []).length !== secs.length) st = inst.map(function () { return secs.map(function () { return 0; }); });
      draw();
    }
    function sum(i) { return st.reduce(function (a, r) { return a + (r[i] || 0); }, 0); }
    function draw() {
      var t = el('table', 'am'), h = '<thead><tr><th scope="col">Instrument</th>' + secs.map(function (s) { return '<th scope="col" class="f-' + s.k + '"><span>' + esc(s.name || SECZH[s.k] || s.k) + '</span></th>'; }).join('') + '</tr></thead><tbody>';
      inst.forEach(function (ins, r) {
        h += '<tr><th scope="row">' + ins[1] + '</th>' + secs.map(function (s, i) { return '<td><button type="button" data-r="' + r + '" data-i="' + i + '" class="lv' + st[r][i] + '" aria-label="' + ins[1] + ', ' + esc(s.name || SECZH[s.k] || '') + ': ' + ['Empty', 'Light', 'Full'][st[r][i]] + '">' + LV[st[r][i]] + '</button></td>'; }).join('') + '</tr>';
      });
      t.innerHTML = h + '</tbody>'; wrap.innerHTML = ''; wrap.appendChild(t);
      $$('button', t).forEach(function (b) { b.onclick = function () { var r = +b.dataset.r, i = +b.dataset.i; st[r][i] = (st[r][i] + 1) % 3; LS.set(key, st); draw(); }; });
      var n = secs.length, max = inst.length * 2, Wd = 1000, H = 64;
      var pts = secs.map(function (_, i) { return ((i + 0.5) / n * Wd).toFixed(1) + ' ' + (H - 4 - sum(i) / max * (H - 8)).toFixed(1); });
      curve.innerHTML = '<svg viewBox="0 0 ' + Wd + ' ' + H + '" preserveAspectRatio="none" class="am-svg" aria-hidden="true"><path class="area" d="M0 ' + H + ' L' + pts.join(' L') + ' L' + Wd + ' ' + H + ' Z"/><path class="am-line" d="M' + pts.join(' L') + '"/></svg>';
      check();
    }
    function check() {
      var total = secs.map(function (_, i) { return sum(i); });
      if (total.filter(Boolean).length < 3) { msg.textContent = 'Feedback appears once you\'ve arranged at least three sections.'; return; }
      var out = [], ks = secs.map(function (s) { return s.k; });
      var fv = ks.indexOf('verse'), fc = ks.indexOf('chorus');
      if (fv > -1 && fc > -1 && total[fc] - total[fv] < 2) out.push('The first chorus is too close to the verse in instrumentation, so the chorus doesn\'t open up enough.');
      var lastC = ks.lastIndexOf('chorus');
      if (lastC > -1 && total.some(function (v, i) { return ks[i] === 'chorus' && v > total[lastC]; })) out.push('The last chorus is usually the fullest, as the high point of the song.');
      ks.forEach(function (k, i) { if ((k === 'post' || k === 'bridge') && i > 0) { var diff = st.filter(function (r) { return r[i] !== r[i - 1]; }).length; if (diff < 2) out.push('The post-chorus (bridge) has almost the same instrumentation as the section before, with little change; take out a few instruments or bring in a new sound.'); } });
      var eg = inst.map(function (x) { return x[0]; }).indexOf('eg');
      if (ks.some(function (k, i) { return k === 'verse' && st[eg][i] === 2; })) out.push('The electric guitar is at full in the verse and can cover the voice; an arrangement\'s first job is to let the voice come through clearly.');
      var tg = ks.lastIndexOf('tag');
      if (tg > -1 && lastC > -1 && total[tg] > total[lastC]) out.push('The ending is fuller than the last chorus, so the emotion can\'t come back down.');
      if (total.some(function (v, i) { return !v && ks[i] !== 'intro' && ks[i] !== 'tag'; })) out.push('A section has no instruments at all; if it\'s meant to be a cappella, note it in the arrangement plan.');
      msg.innerHTML = out.length ? out.map(function (x) { return '! ' + esc(x); }).join('<br>') : '✓ The instrumentation builds up, the chorus is more open than the verse, and the last chorus is the fullest.';
    }
    bEx.onclick = function () {
      st = inst.map(function (ins) { return secs.map(function (s) {
        var k = s.k, id = ins[0];
        var base = { intro: { keys: 1, ag: 1 }, verse: { keys: 1, ag: 1, bass: 1, drums: 1 }, pre: { keys: 1, ag: 1, bass: 1, drums: 1, str: 1, bvs: 1 }, chorus: { keys: 2, ag: 1, bass: 2, drums: 2, eg: 1, str: 1, bvs: 2, crowd: 2 }, post: { keys: 1, str: 2, syn: 1, bvs: 1, crowd: 2 }, bridge: { keys: 1, str: 2, syn: 1 }, tag: { keys: 1, ag: 1, str: 1 }, inter: { keys: 1, eg: 2, bass: 1, drums: 1 }, outro: { keys: 1, ag: 1 }, ending: { keys: 1 } }[k] || {};
        return base[id] || 0;
      }); });
      // 最後一次副歌再加上電吉他與合成器
      var ks = secs.map(function (s) { return s.k; }), lc = ks.lastIndexOf('chorus');
      if (lc > -1 && ks.indexOf('chorus') !== lc) inst.forEach(function (ins, r) { if (ins[0] === 'eg' || ins[0] === 'syn') st[r][lc] = 2; });
      LS.set(key, st); draw();
    };
    bClr.onclick = function () { st = inst.map(function () { return secs.map(function () { return 0; }); }); LS.set(key, st); draw(); };
    T.on(load);
  });

  /* ========== 8. 現場默契測驗 ========== */
  $$('.cheer').forEach(function (root) {
    var call = root.getAttribute('data-call') || 'Merry Xmas', resp = root.getAttribute('data-resp') || '新北耶誕城';
    var stage = el('div', 'ch-stage', '<p class="ch-call">When I sing <b>' + esc(call) + '</b></p><p class="ch-resp">Shout out loud: <b>' + esc(resp) + '</b></p>');
    var meter = el('div', 'ch-meter', '<i></i>'), bars = el('div', 'ch-bars'), msg = el('p', 'wk-msg', 'Press "Start measuring" for a three-second countdown, then the teacher sings “' + esc(call) + '”.'), foot = el('div', 'btn-row wk-foot');
    var bGo = btn('Start measuring', 'primary'), bR = btn('Start over');
    foot.append(bGo, bR); root.append(stage, meter, bars, foot, msg);
    var rounds = [], stream = null, busy = false;
    function paint() {
      bars.innerHTML = rounds.map(function (v, i) { return '<div class="ch-bar"><span style="--v:' + v + '"></span><b>' + v + '</b><small># ' + (i + 1) + ' </small></div>'; }).join('');
    }
    bGo.onclick = function () {
      if (busy) return; var c = window.PS && PS.audio ? PS.audio.ctx() : null;
      if (!c || !navigator.mediaDevices) { msg.textContent = 'This device can\'t use the microphone.'; return; }
      busy = true; bGo.disabled = true;
      (stream ? Promise.resolve(stream) : navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })).then(function (s) {
        stream = s; var src = c.createMediaStreamSource(s), an = c.createAnalyser(); an.fftSize = 1024; src.connect(an);
        var buf = new Float32Array(an.fftSize), n = 3, peak = 0, t0 = 0, bar = meter.querySelector('i');
        msg.textContent = 'Ready: 3';
        var cd = setInterval(function () { n--; if (n > 0) { msg.textContent = 'Ready: ' + n; return; } clearInterval(cd); msg.textContent = 'Sing!' + call + '! '; stage.classList.add('go'); t0 = performance.now(); tick(); }, 1000);
        function tick() {
          an.getFloatTimeDomainData(buf); var sq = 0; for (var i = 0; i < buf.length; i++) sq += buf[i] * buf[i];
          var db = 20 * Math.log10(Math.sqrt(sq / buf.length) + 1e-6), v = Math.max(0, Math.min(100, Math.round((db + 60) * 1.8)));
          peak = Math.max(peak, v); bar.style.width = v + '%';
          if (performance.now() - t0 < 4000) return requestAnimationFrame(tick);
          src.disconnect(); stage.classList.remove('go'); bar.style.width = '0'; rounds.push(peak); paint(); busy = false; bGo.disabled = false; bGo.textContent = 'Measure again';
          var prev = rounds[rounds.length - 2];
          msg.textContent = rounds.length === 1 ? 'The first round\'s volume was ' + peak + '. That teamwork wasn\'t quite there; let\'s go again!' : (peak > prev ? 'Louder than last time by ' + (peak - prev) + ': teamwork achieved!' : 'The volume didn\'t beat last time; bring more energy and try again.');
          report(root, 'cheer', { item: 'Live teamwork test', result: 'Round ' + rounds.length + ': ' + peak, value: peak });
        }
      }).catch(function () { busy = false; bGo.disabled = false; msg.textContent = 'Microphone permission wasn\'t granted; allow the microphone in your browser\'s address bar.'; });
    };
    bR.onclick = function () { rounds = []; paint(); bGo.textContent = 'Start measuring'; msg.textContent = 'Press "Start measuring" for a three-second countdown, then the teacher sings “' + call + '”.'; };
  });

  /* ========== 歌詞框：在題目上方顯示整首歌詞（.lyricbox data-work="elnino"） ========== */
  $$('.lyricbox').forEach(function (root) {
    var work = W[root.getAttribute('data-work')]; if (!work) return;
    var seen = {};
    root.innerHTML = '<p class="lb-title">〈' + esc(work.title) + '〉<small>' + esc(work.credit || '') + '</small></p>' + work.sections.map(function (s) {
      if (!s.lines.length) return '';
      var key = s.lines.join('|'), rep = seen[key]; seen[key] = 1;
      return '<div class="lb-sec"><span class="rh2-sn f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</span>' + (rep ? '<p class="lb-ln muted">(same as above)</p>' : s.lines.map(function (ln) { return '<p class="lb-ln">' + esc(ln) + '</p>'; }).join('')) + '</div>';
    }).join('');
    root.tabIndex = 0; root.setAttribute('role', 'region'); root.setAttribute('aria-label', work.title + ' Lyrics');
  });

  /* ========== 9. 作品全貌 ========== */
  $$('.leoworks').forEach(function (root) {
    var list = ORDER.filter(function (k) { return W[k] && k !== 'mine'; });
    var T = tabs(root, list, 'leoworks');
    var box = el('div', 'lw'), head = el('div', 'lw-head'), strip = el('div', 'wk-strip'), tools = el('div', 'lw-tools'), body = el('div', 'lw-body'), lyr = scroller(el('div', 'lw-lyrics'), 'Full lyrics', root), side = el('div', 'lw-side');
    body.append(lyr, side); box.append(head, strip, tools, body); root.append(T.bar, box);
    var showRhyme = false, showFig = false, work;
    var bRh = btn('Mark the rhymes'), bFg = btn('Mark the figures of speech');
    bRh.setAttribute('aria-pressed', 'false'); bFg.setAttribute('aria-pressed', 'false');
    tools.append(bRh, bFg);
    bRh.onclick = function () { showRhyme = !showRhyme; bRh.setAttribute('aria-pressed', String(showRhyme)); if (showRhyme) loadPinyin().then(paintLyrics).catch(function () {}); else paintLyrics(); };
    bFg.onclick = function () { showFig = !showFig; bFg.setAttribute('aria-pressed', String(showFig)); paintLyrics(); };
    function load(k) {
      work = W[k];
      var meta = [work.date, work.credit, work.origin + (work.client ? ': ' + work.client : ''), work.theme];
      if (work.key || work.keyName) meta.push((work.meter || '4/4') + '・' + (work.keyName || work.key + ' major') + (work.bpm ? '・' + work.bpm + ' BPM' : ''));
      head.innerHTML = '<h3>' + esc(work.title) + '</h3><p class="lw-meta">' + meta.filter(Boolean).map(esc).join('<span>｜</span>') + '</p><p class="lw-story">' + esc(work.story || '') + '</p>';
      strip.innerHTML = '<span class="wk-strip-t">Song form</span>' + work.sections.map(function (s) { return '<span class="f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</span>'; }).join('');
      tools.style.display = work.noLyrics ? 'none' : '';
      side.innerHTML = '<h4>Discussion: one compliment, one question, one suggestion</h4><ol>' + (work.discuss || []).map(function (d) { return '<li>' + esc(d) + '</li>'; }).join('') + '</ol>' + (work.hook ? '<p class="lw-hook">Hook：「' + esc(work.hook) + '」</p>' : '');
      paintLyrics();
    }
    function paintLyrics() {
      if (work.noLyrics) { lyr.innerHTML = '<p class="lw-note">The lyrics of this song belong to the lyricist; in class we only look at how the collaboration worked.</p>'; return; }
      var P = window.pinyinPro, spots = figSpots(work), seen = {};
      lyr.innerHTML = (work.excerpt ? '<p class="lw-note">Only the chorus is excerpted in class.</p>' : '') + work.sections.map(function (s, si) {
        if (!s.lines.length) return '<div class="lw-sec"><div class="rh2-sn f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</div><p class="lw-ln muted">(instrumental)</p></div>';
        var key = s.lines.join('|'), rep = seen[key]; seen[key] = 1;
        return '<div class="lw-sec' + (rep ? ' rep' : '') + '"><div class="rh2-sn f-' + s.k + '">' + esc(s.name || SECZH[s.k]) + '</div>' + s.lines.map(function (ln, li) {
          var t = esc(ln), fig = '';
          if (showFig) spots.forEach(function (p) { if (p.si === si && p.li === li) { var a = esc(p.f.at), k = t.indexOf(a); if (k > -1) t = t.slice(0, k) + '<mark>' + a + '</mark>' + t.slice(k + a.length); fig += '<span class="lw-fig" title="' + esc(p.f.why) + '">' + esc(p.f.figs[0]) + '</span>'; } });
          if (showRhyme && P) { var ch = lastHan(ln); if (ch) { var arr = P.pinyin(ln.replace(/[^㐀-鿿]/g, ''), { toneType: 'none', type: 'array' }), g = RG[groupOf(arr[arr.length - 1])]; var at = t.lastIndexOf(ch); if (g && at > -1) t = t.slice(0, at) + '<em style="--gc:' + g[1] + '" title="' + g[0] + '">' + ch + '</em>' + t.slice(at + 1); } }
          return '<p class="lw-ln">' + t + fig + '</p>';
        }).join('') + '</div>';
      }).join('');
    }
    T.on(load);
  });
  /* ========== 10. 歌詞創作骰子（詞庫在 lyric-dice.js） ========== */
  // 五個母音韻腳，其餘句尾（ㄞ ㄠ ㄢ ㄣ ㄤ ㄥ 與空韻）歸入「其他」
  var VOW = [['a', 'ㄚ', 'a'], ['o', 'ㄛ ㄡ', 'o'], ['e', 'ㄜ ㄝ ㄟ', 'e'], ['i', 'ㄧ ㄩ', 'i'], ['u', 'ㄨ', 'u'], ['x', 'Other', '']];
  var VOWZH = {}; VOW.forEach(function (v) { VOWZH[v[0]] = v[0] === 'x' ? 'Other rhymes' : v[1] + ' rhyme'; });
  function pickOne(a) { return a[Math.floor(Math.random() * a.length)]; }
  $$('.lyricdice').forEach(function (root) {
    var D = window.PIXEL_LYRIC_DICE; if (!D) return;
    var SRC = D.src || {};
    var DIE = [
      { k: 'words', name: 'Word dice', note: 'Roll a word to use as lyric material or a line-ending rhyme.', lens: [1, 2, 3, 4], unit: 'chars', nb: 'words', nbName: 'Words' },
      { k: 'lines', name: 'Line dice', note: 'Roll a lyric line, then try writing the next line or rewriting it in your own version.', lens: [5, 6, 7, 8, 9, 10], unit: 'chars', nb: 'lines', nbName: 'Lines', src: true }
    ];
    var box = el('div', 'ld'), dice = [];
    DIE.forEach(function (d) {
      var st = LS.get('ldice-' + d.k, { len: 0, v: '', src: '', who: '', res: null, hist: [] });
      if (!d.src) st.src = ''; st.src = st.src || ''; st.who = st.who || '';
      var card = el('section', 'ld-die');
      card.setAttribute('aria-label', d.name);
      // 標題與說明同一列，把高度留給下方的草稿區
      var head = el('div', 'ld-head'); head.append(el('h3', 'ld-name', d.name), el('p', 'ld-note', d.note)); card.appendChild(head);
      function chips(label, opts, key) {
        var row = el('div', 'ld-row'); row.appendChild(el('span', 'ld-lab', label));
        var g = el('div', 'ld-chips'); g.setAttribute('role', 'group'); g.setAttribute('aria-label', d.name + label);
        opts.forEach(function (o) {
          var b = el('button', '', o[1]); b.type = 'button'; b.dataset.v = o[0];
          b.onclick = function () { st[key] = key === 'len' ? +o[0] : o[0]; save(); paint(); hint(); };
          g.appendChild(b);
        });
        row.appendChild(g); card.appendChild(row); return g;
      }
      var gLen = chips('Length', [[0, 'Random']].concat(d.lens.map(function (n) { return [n, n + ' ' + d.unit]; })), 'len');
      var gV = chips('Rhyme', [['', 'Random']].concat(VOW.map(function (v) { return [v[0], v[1] + (v[2] ? '<small>' + v[2] + '</small>' : '')]; })), 'v');
      // 只有金句標示出處：老師的作品、作詞家風格的仿寫練習句
      var gS = null, who = null;
      if (d.src) {
        gS = chips('Source', [['', 'All'], ['leo', 'The teacher\'s songs'], ['style', 'Lyricist styles']], 'src');
        var names = []; Object.keys(SRC).forEach(function (w) { SRC[w].forEach(function (x) { if (x.indexOf('style:') === 0 && names.indexOf(x.slice(6)) < 0) names.push(x.slice(6)); }); });
        who = el('select', 'ld-who'); who.setAttribute('aria-label', 'Choose a lyricist');
        who.innerHTML = '<option value="">All lyricists</option>' + names.map(function (n) { return '<option>' + esc(n) + '</option>'; }).join('');
        who.value = st.who; who.onchange = function () { st.who = who.value; save(); hint(); };
        gS.appendChild(who);
      }
      var reel = el('div', 'ld-reel'), big = el('b', '', '? '), meta = el('small', '', 'Choose a length and rhyme, then press "Roll the dice".');
      reel.setAttribute('aria-live', 'polite'); reel.append(big, meta); card.appendChild(reel);
      var foot = el('div', 'btn-row wk-foot'), bGo = btn('Roll the dice', 'primary'), bNb = btn('Add to drafts');
      var hist = el('div', 'ld-hist');
      foot.append(bGo, bNb, hist); card.appendChild(foot);
      // 詞源骰子少一列「來源」，下方的空白放寫作提醒
      if (!d.src) card.appendChild(el('p', 'ld-memo', '<b>Note</b>Writing lyrics is telling a story: every one needs an opening, development, turn and close, plus a hook.'));
      function pool(len, v) { var out = []; (v ? [v] : VOW.map(function (x) { return x[0]; })).forEach(function (vv) { (len ? [len] : d.lens).forEach(function (n) { ((D[d.k][vv] || {})[n] || []).forEach(function (w) { if (srcOK(w)) out.push({ w: w, v: vv, n: n }); }); }); }); return out; }
      function srcOK(w) {
        var s = SRC[w] || [];
        if (st.src === 'leo') return s.some(function (x) { return x.indexOf('style:') !== 0; });
        if (st.src === 'style') return s.some(function (x) { return st.who ? x === 'style:' + st.who : x.indexOf('style:') === 0; });
        return true;
      }
      // 出處標示：依目前的來源篩選，優先顯示相符的那一個
      function label(w) {
        var s = SRC[w] || [], x = s.filter(function (y) { return st.src === 'style' ? (st.who ? y === 'style:' + st.who : y.indexOf('style:') === 0) : st.src === 'leo' ? y.indexOf('style:') !== 0 : true; })[0] || s[0];
        if (!d.src || !x) return '';
        return x.indexOf('style:') === 0 ? ' · Imitation exercise (' + x.slice(6) + ' style)' : ' · from ' + x;
      }
      // 篩選來源之後，字數與韻腳的組合可能沒有詞句
      function hint() { if (!pool(st.len, st.v).length) { big.textContent = '? '; meta.textContent = 'Nothing from this source matches; try another length or rhyme.'; } else if (st.res) paint(); }
      function paint() {
        $$('button', gLen).forEach(function (b) { b.setAttribute('aria-pressed', String(+b.dataset.v === st.len)); });
        $$('button', gV).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === st.v)); });
        if (gS) { $$('button', gS).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.v === st.src)); }); who.hidden = st.src !== 'style'; }
        if (st.res) { big.textContent = st.res.w; meta.textContent = st.res.n + ' ' + d.unit + '・' + VOWZH[st.res.v] + label(st.res.w); }
        hist.innerHTML = st.hist.length ? '<span class="ld-lab">Just now</span>' + st.hist.map(function (h) { return '<span>' + esc(h) + '</span>'; }).join('') : '';
      }
      function save() { LS.set('ldice-' + d.k, st); }
      function roll(forceV, done) {
        var v = forceV != null ? forceV : st.v, list = pool(st.len, v);
        if (!list.length) { hint(); return; }
        var last = st.res && st.res.w, t = 0; reel.classList.add('spin'); bGo.disabled = true;
        var iv = setInterval(function () {
          big.textContent = pickOne(list).w;
          if (++t < 12) return;
          clearInterval(iv); reel.classList.remove('spin'); bGo.disabled = false;
          var cand = list.filter(function (x) { return x.w !== last; }); st.res = pickOne(cand.length ? cand : list);
          st.hist = [st.res.w].concat(st.hist.filter(function (h) { return h !== st.res.w; })).slice(0, 8);
          save(); paint(); report(root, 'lyricdice', { item: d.name, result: st.res.w });
          if (done) done(st.res);
        }, 60);
      }
      bGo.onclick = function () { roll(); };
      bNb.onclick = function () {
        if (!st.res) return;
        var nb = LS.get('notebook', { words: [], lines: [], tunes: [] }); nb[d.nb] = nb[d.nb] || [];
        var at = nb[d.nb].indexOf(st.res.w);
        if (at > -1) { drawBank(d.nb, at, '“' + st.res.w + '” is already in your drafts; roll again for another.'); return; }
        if (bankCount(nb) >= BANK_MAX) { drawBank(null, -1, 'Drafts are full at ' + BANK_MAX + ' items. Remove the ones you don\'t need first.'); return; }
        nb[d.nb].push(st.res.w); LS.set('notebook', nb);
        drawBank(d.nb, nb[d.nb].length - 1, '');
      };
      paint(); box.appendChild(card);
    });
    // 歌詞草稿區：資料與第一堂的素材庫共用（詞典、句典），加入之後直接排列在下方
    var bank = el('section', 'ld-bank'), bankBody = el('div', 'ld-bank-body');
    bank.setAttribute('aria-label', 'Lyric drafts');
    // 草稿區最多 50 個詞句（詞語與金句合計）
    var BANK_MAX = 50;
    function bankCount(nb) { return (nb.words || []).length + (nb.lines || []).length; }
    var bankHead = el('div', 'ld-bank-head', '<h3>Lyric drafts</h3><b class="ld-bank-n"></b><small>Tap the × to the right of an item to remove it; the contents are shared with the material bank from Lesson 1.</small><span class="ld-bank-msg" role="status"></span>');
    var bCopy = btn('Copy all');
    bCopy.onclick = function () {
      var nb = LS.get('notebook', { words: [], lines: [] }), text = '[Words]\n' + (nb.words || []).join(', ') + '\n\n[Lines]\n' + (nb.lines || []).join('\n');
      // LINE 等內建瀏覽器常擋剪貼簿：改用選取複製，仍失敗就提示手動複製
      function legacy() {
        var ta = document.createElement('textarea'), ok = false; ta.value = text; ta.setAttribute('readonly', ''); ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0';
        document.body.appendChild(ta); ta.select(); try { ok = document.execCommand('copy'); } catch (e) {} ta.remove();
        if (!ok) return Promise.reject();
      }
      (navigator.clipboard ? navigator.clipboard.writeText(text).catch(legacy) : Promise.resolve().then(legacy)).then(function () {
        if (window.PixelBackend) window.PixelBackend.toast('Lyric drafts copied', 'ok');
      }, function () { if (window.PixelBackend) window.PixelBackend.toast('This browser can\'t copy automatically; long-press the items in your drafts to copy them by hand', 'warn'); });
    };
    // 全部清除：按第一次變成「確定清除？」，三秒內再按一次才清除，避免誤觸
    var bClr = btn('Clear all', 'ld-clear'), clrTimer = 0;
    bClr.onclick = function () {
      var nb = LS.get('notebook', { words: [], lines: [], tunes: [] });
      if (!bankCount(nb)) return;
      if (!bClr.classList.contains('armed')) {
        bClr.classList.add('armed'); bClr.textContent = 'Clear everything?';
        clrTimer = setTimeout(function () { bClr.classList.remove('armed'); bClr.textContent = 'Clear all'; }, 3000);
        return;
      }
      clearTimeout(clrTimer); bClr.classList.remove('armed'); bClr.textContent = 'Clear all';
      nb.words = []; nb.lines = []; LS.set('notebook', nb); drawBank(null, -1, 'Drafts cleared.');
    };
    bankHead.append(bCopy, bClr); bank.append(bankHead, bankBody);
    function drawBank(newK, newI, note) {
      var nb = LS.get('notebook', { words: [], lines: [], tunes: [] });
      function list(k, cls) {
        return (nb[k] || []).map(function (w, i) { return '<li><span>' + esc(w) + '</span><button type="button" data-k="' + k + '" data-i="' + i + '" aria-label="Remove ' + esc(w) + '">×</button></li>'; }).join('');
      }
      bankBody.innerHTML = (nb.words || []).length || (nb.lines || []).length
        ? '<div class="ld-bank-row"><span class="ld-lab">Words</span><ul class="ld-bank-words">' + list('words') + '</ul></div><div class="ld-bank-row"><span class="ld-lab">Lines</span><ol class="ld-bank-lines">' + list('lines') + '</ol></div>'
        : '<p class="ld-note">When you roll a word or line you like, press "Add to drafts" and it\'ll be listed here.</p>';
      $$('button[data-k]', bankBody).forEach(function (b) {
        b.onclick = function () { var nb2 = LS.get('notebook', { words: [], lines: [], tunes: [] }); nb2[b.dataset.k].splice(+b.dataset.i, 1); LS.set('notebook', nb2); drawBank(); };
      });
      bankHead.querySelector('.ld-bank-n').textContent = bankCount(nb) + ' / ' + BANK_MAX;
      bankHead.querySelector('.ld-bank-msg').textContent = note || '';
      // 新加入（或重複）的詞句：捲到看得見的位置並短暫標亮
      if (newK != null && newI > -1) {
        var li = bankBody.querySelector('button[data-k="' + newK + '"][data-i="' + newI + '"]');
        li = li && li.parentNode;
        if (li) { bankBody.scrollTop = Math.max(0, li.offsetTop - bankBody.clientHeight / 2); li.classList.add('ld-new'); }
      }
    }
    drawBank();
    root.append(box, bank);
  });
})();
