/* ===== Pixel Studio 課堂互動元件 =====
 * 互動狀態存在這台裝置的瀏覽器（localStorage）；作答與成果經 backend.js 送到課程試算表。
 * 元件以 class 宣告在投影片中，載入時自動建立：
 *   本檔：.quiz .poll .reveal .sec-track .picker .score .rhythm-game .recorder .order .flips .phase .exit .log7 .qr 以及 .checks[data-id]
 *   assets/interact/ 分塊（頁面有對應 class 才載入，見下方 CHUNKS）：
 *   .taptempo .songpoll .wavelab .pitch .siren .resolab .scalepractice .staccato .melodyscope .solfa
 *   .stopwatch .mirror .dynmap .range .transpose .zero .breath .lyricmark
 * .rhythm-game 留在本檔：guitar.js 在自己執行時就要讀它產生的 .rg-head、.rg-pats，不能等分塊。
 */
(function () {
  'use strict';
  // 課程與課次：body[data-course]／[data-lesson] 優先（Guitar Lab 等），否則沿用 Vocal Lab 的 lesson-N 路徑
  var COURSE = document.body.getAttribute('data-course') || '';
  var LESSON = document.body.getAttribute('data-lesson') || (location.pathname.match(/lesson-(\d+)/) || [])[1] || 'x';
  var NS = 'pixel:' + (COURSE ? COURSE + ':' : ''); // 不同課程的互動狀態分開存放
  var LS = {
    get: function (k, d) { try { var v = localStorage.getItem(NS + k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(NS + k, JSON.stringify(v)); } catch (e) {} }
  };
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, cls, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
  function btn(label, cls) { var b = el('button', 'btn' + (cls ? ' ' + cls : ''), label); b.type = 'button'; return b; }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var stoppers = [];
  // 送到後台：PixelBackend 由 backend.js 提供；沒有載入時略過
  function slideNo(root) { var s = root && root.closest && root.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(root, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(root) }); }
  function say(msg, kind) { if (window.PixelBackend) window.PixelBackend.toast(msg, kind); }
  function onLeave(root, fn) { stoppers.push({ slide: root.closest('.slide'), fn: fn }); }
  // backend.js 在本檔之後載入：需要 PixelBackend 的動作等所有腳本載入後再執行
  // 等 DOMContentLoaded（所有同步或 defer 的腳本都已執行）；以 Navigation Timing 判斷是否已觸發，defer 載入時也正確
  function later(fn) { var nav = performance.getEntriesByType && performance.getEntriesByType('navigation')[0]; if (document.readyState === 'complete' || (nav && nav.domContentLoadedEventStart > 0)) setTimeout(fn, 0); else document.addEventListener('DOMContentLoaded', fn); }

  /* ---------- 下載／分享檔案 ----------
   * 手機優先用系統分享選單（可存到照片、檔案）；LINE、Facebook 等 App 內建瀏覽器會擋下載，改用長按儲存或提示改用瀏覽器開啟。
   */
  var IN_APP = /Line\/|FBAN|FBAV|FB_IAB|Instagram|MicroMessenger|KAKAOTALK/i.test(navigator.userAgent);
  var TOUCH = !!(window.matchMedia && window.matchMedia('(pointer:coarse)').matches);
  function saveFile(blob, name) {
    var file = null; try { file = new File([blob], name, { type: blob.type }); } catch (e) {}
    if (TOUCH && file && navigator.canShare && navigator.canShare({ files: [file] })) {
      navigator.share({ files: [file], title: name }).catch(function (err) { if (!err || err.name !== 'AbortError') saveSheet(blob, name); });
      return;
    }
    if (IN_APP) { saveSheet(blob, name); return; }
    var a = document.createElement('a'), u = URL.createObjectURL(blob); a.href = u; a.download = name; document.body.appendChild(a); a.click(); a.remove();
    setTimeout(function () { URL.revokeObjectURL(u); }, 5000);
  }
  function saveSheet(blob, name) {
    var isImg = /^image\//.test(blob.type);
    var sh = el('div', 'save-sheet', '<div class="ss-card" role="dialog" aria-label="Save file"><button type="button" class="ss-x" aria-label="Close">×</button><h3>' + (isImg ? 'Press and hold the image to save it' : 'This browser can\'t download the recording directly') + '</h3><div class="ss-body"></div><p class="ss-tip">' + (isImg ? 'Press and hold the image above and choose "Save Image" or "Add to Photos".' : 'Open the menu in the top-right corner and choose "Open in default browser" (Safari or Chrome), then download. Or just tap "Upload to teacher".') + '</p></div>');
    var body = sh.querySelector('.ss-body'), r = new FileReader();
    r.onload = function () { body.innerHTML = isImg ? '<img alt="">' : '<audio controls></audio>'; body.firstChild.src = r.result; };
    r.readAsDataURL(blob);
    sh.addEventListener('click', function (e) { if (e.target === sh || e.target.classList.contains('ss-x')) sh.remove(); });
    document.body.appendChild(sh);
  }

  /* ---------- 音訊 ---------- */
  var AC = null;
  function ac() { if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume(); return AC; }
  function tone(freq, dur, vol, type) {
    var c = ac(), o = c.createOscillator(), g = c.createGain(), t = c.currentTime, v = vol || 0.3;
    o.type = type || 'sine'; o.frequency.value = freq;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(v, t + 0.02);
    g.gain.setValueAtTime(v, t + Math.max(0.05, dur - 0.08)); g.gain.linearRampToValueAtTime(0, t + dur);
    o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + dur + 0.02);
  }
  function chime() { tone(880, 0.18, 0.25); setTimeout(function () { tone(1320, 0.3, 0.2); }, 160); }

  var mic = { stream: null, an: null, users: 0 };
  function micStart() {
    if (mic.an) { mic.users++; return Promise.resolve(mic.an); }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) return Promise.reject(new Error('nomic'));
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } })
      .then(function (s) {
        var c = ac(); mic.stream = s; mic.an = c.createAnalyser(); mic.an.fftSize = 2048;
        c.createMediaStreamSource(s).connect(mic.an); mic.users = 1; return mic.an;
      });
  }
  function micStop() {
    mic.users = Math.max(0, mic.users - 1);
    if (!mic.users && mic.stream) { mic.stream.getTracks().forEach(function (t) { t.stop(); }); mic.stream = null; mic.an = null; }
  }
  var NOTE = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  var SOLF = ['Do', 'Do#', 'Re', 'Re#', 'Mi', 'Fa', 'Fa#', 'Sol', 'Sol#', 'La', 'La#', 'Si'];
  function midiOf(f) { return 12 * Math.log2(f / 440) + 69; }
  function freqOf(m) { return 440 * Math.pow(2, (m - 69) / 12); }
  function nameOf(m) { var r = Math.round(m), k = ((r % 12) + 12) % 12; return { name: NOTE[k] + (Math.floor(r / 12) - 1), solf: SOLF[k] }; }
  function detectPitch(buf, sr) {
    var n = buf.length, i, j, rms = 0;
    for (i = 0; i < n; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / n) < 0.012) return -1;
    var r1 = 0, r2 = n - 1, th = 0.2;
    for (i = 0; i < n / 2; i++) if (Math.abs(buf[i]) < th) { r1 = i; break; }
    for (i = 1; i < n / 2; i++) if (Math.abs(buf[n - i]) < th) { r2 = n - i; break; }
    buf = buf.slice(r1, r2); n = buf.length;
    var c = new Float32Array(n);
    for (i = 0; i < n; i++) for (j = 0; j < n - i; j++) c[i] += buf[j] * buf[j + i];
    var d = 0; while (d < n - 1 && c[d] > c[d + 1]) d++;
    var mx = -1, T = -1; for (i = d; i < n; i++) if (c[i] > mx) { mx = c[i]; T = i; }
    if (T <= 0 || T >= n - 1) return -1;
    var a = (c[T - 1] + c[T + 1] - 2 * c[T]) / 2, b = (c[T + 1] - c[T - 1]) / 2;
    if (a) T = T - b / (2 * a);
    var f = sr / T; return f > 60 && f < 1400 ? f : -1;
  }
  function rmsOf(an, buf) { an.getFloatTimeDomainData(buf); var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i]; return Math.sqrt(s / buf.length); }
  function canvasFit(cv) {
    // 投影片在電腦上以 transform 整體縮放，畫布要依實際顯示大小 × 螢幕像素密度繪製，放大後才不會糊
    var w = cv.clientWidth || 600, h = cv.clientHeight || 140, box = cv.getBoundingClientRect();
    var zoom = box.width && cv.clientWidth ? box.width / cv.clientWidth : 1;
    var r = Math.min(4, (window.devicePixelRatio || 1) * Math.max(1, zoom));
    if (cv.width !== Math.round(w * r) || cv.height !== Math.round(h * r)) { cv.width = Math.round(w * r); cv.height = Math.round(h * r); }
    var x = cv.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0); return { x: x, w: w, h: h };
  }
  function css(v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim() || '#fff'; }
  // 畫布上的格線、刻度字：深色主題用白、淺色主題（theme.js）用墨色
  function ink(a) { return (document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(17,19,21,' : 'rgba(255,255,255,') + a + ')'; }

  /* ---------- 1. 選擇題（手指投票後揭曉） ---------- */
  $$('.quiz').forEach(function (q) {
    var ans = parseInt(q.getAttribute('data-answer'), 10), items = $$('li', q), letters = '1234';
    var list = el('div', 'quiz-opts'), why = q.querySelector('.why');
    items.forEach(function (li, k) {
      var b = btn('<b>' + letters[k] + '</b>' + li.innerHTML, 'quiz-opt');
      b.onclick = function () { if (!q.classList.contains('done')) report(q, 'quiz', { item: (q.querySelector('.q') || {}).textContent, result: k + 1 === ans ? 'Correct' : 'Not quite', value: k + 1, detail: { answer: li.textContent.trim() } }); q.classList.add('done'); b.classList.add(k + 1 === ans ? 'right' : 'wrong'); show(); };
      list.appendChild(b);
    });
    var ol = q.querySelector('ol'); ol.parentNode.replaceChild(list, ol);
    var foot = el('div', 'quiz-foot'), hint = el('span', 'muted', 'Show 1–4 with your fingers first, then reveal'), rv = btn('Reveal answer');
    rv.onclick = show; foot.appendChild(hint); foot.appendChild(rv); q.insertBefore(foot, why);
    function show() { list.children[ans - 1].classList.add('right'); if (why) why.classList.add('on'); q.classList.add('done'); }
  });

  /* ---------- 2. 舉手計票 ---------- */
  $$('.poll').forEach(function (p) {
    var id = 'poll-' + p.getAttribute('data-id'), opts = p.getAttribute('data-options').split('|');
    var cnt = LS.get(id, opts.map(function () { return 0; }));
    var rows = opts.map(function (o, k) {
      var r = el('div', 'poll-row', '<button type="button" class="poll-hit"><span class="poll-label">' + esc(o) + '</span><span class="poll-bar"><i></i></span><span class="poll-n"></span></button><button type="button" class="poll-minus" aria-label="Minus one">−</button>');
      r.querySelector('.poll-hit').onclick = function () { cnt[k]++; save(); };
      r.querySelector('.poll-minus').onclick = function () { cnt[k] = Math.max(0, cnt[k] - 1); save(); };
      p.appendChild(r); return r;
    });
    var foot = el('div', 'poll-foot'), tot = el('span', 'muted'), rs = btn('Clear');
    rs.onclick = function () { cnt = opts.map(function () { return 0; }); save(); };
    var pv = btn('Save to server'); pv.onclick = function () { var sum = cnt.reduce(function (a, b) { return a + b; }, 0); report(p, 'poll', { item: opts.join('／'), result: opts.map(function (o, k) { return o + ' ' + cnt[k]; }).join('、'), value: sum, detail: { options: opts, counts: cnt } }); say('Poll results recorded', 'ok'); };
    foot.appendChild(pv);
    foot.appendChild(tot); foot.appendChild(rs); p.appendChild(foot);
    function save() { LS.set(id, cnt); draw(); }
    function draw() {
      var max = Math.max.apply(null, cnt.concat([1])), sum = cnt.reduce(function (a, b) { return a + b; }, 0);
      rows.forEach(function (r, k) { r.querySelector('i').style.width = (cnt[k] / max * 100) + '%'; r.querySelector('.poll-n').textContent = cnt[k]; });
      tot.textContent = 'Tap an option to add a vote. Total ' + sum + ' votes';
    }
    draw();
  });

  /* ---------- 3. 揭曉 ---------- */
  $$('.reveal').forEach(function (r) {
    var b = btn(r.getAttribute('data-label') || 'Reveal answer', 'reveal-btn');
    b.onclick = function () { r.classList.toggle('on'); b.textContent = r.classList.contains('on') ? 'Collapse' : (r.getAttribute('data-label') || 'Reveal answer'); };
    r.parentNode.insertBefore(b, r);
  });

  /* 段落標記：點選目前聽到的段落，之前的段落淡化；再點一次清除。data-mode="pick" 只做單選 */
  $$('.sec-track').forEach(function (t) {
    var pills = $$('.pill', t), cur = -1, pick = t.getAttribute('data-mode') === 'pick';
    function paint() { pills.forEach(function (p, k) { p.classList.toggle('on', k === cur); p.classList.toggle('done', !pick && k < cur); p.setAttribute('aria-pressed', k === cur ? 'true' : 'false'); }); }
    pills.forEach(function (p, k) { p.onclick = function () { cur = cur === k ? -1 : k; paint(); }; });
    paint();
  });

  /* ---------- 4. 隨機點名 ---------- */
  $$('.picker').forEach(function (p) {
    var names = LS.get('names', []), used = [];
    p.innerHTML = '<div class="picker-name">Ready to draw</div><div class="btn-row"><button type="button" class="btn primary go">Draw one</button><label class="picker-opt"><input type="checkbox" checked> No repeats</label><button type="button" class="btn edit">Edit list</button></div><div class="picker-edit"><textarea rows="5" placeholder="One per line, for example:&#10;Alex Wang&#10;Group 3"></textarea><div class="btn-row"><button type="button" class="btn save">Save list</button></div></div><p class="picker-meta muted"></p>';
    var out = p.querySelector('.picker-name'), ta = p.querySelector('textarea'), meta = p.querySelector('.picker-meta'), noRep = p.querySelector('input');
    function info() { meta.textContent = names.length ? 'List: ' + names.length + ' , drawn ' + used.length + ' (the list is stored on this computer only)' : 'Tap "Edit list" first and paste in student names or group names'; }
    p.querySelector('.edit').onclick = function () { ta.value = names.join('\n'); p.classList.toggle('editing'); };
    p.querySelector('.save').onclick = function () { names = ta.value.split(/\n+/).map(function (s) { return s.trim(); }).filter(Boolean); LS.set('names', names); used = []; p.classList.remove('editing'); info(); };
    p.querySelector('.go').onclick = function () {
      var pool = names.filter(function (n) { return !noRep.checked || used.indexOf(n) < 0; });
      if (!names.length) { p.classList.add('editing'); return; }
      if (!pool.length) { used = []; pool = names.slice(); }
      var t = 0, spin = setInterval(function () {
        out.textContent = pool[Math.floor(Math.random() * pool.length)];
        if (++t > 14) { clearInterval(spin); var pick = pool[Math.floor(Math.random() * pool.length)]; out.textContent = pick; used.push(pick); out.classList.remove('pop'); void out.offsetWidth; out.classList.add('pop'); info(); }
      }, 60);
    };
    info();
  });

  /* ---------- 5. 分組計分板 ---------- */
  $$('.score').forEach(function (s) {
    var id = 'score-' + s.getAttribute('data-id'), n = parseInt(s.getAttribute('data-teams'), 10) || 4;
    var st = LS.get(id, null) || { names: Array.from({ length: n }, function (_, k) { return 'Group ' + (k + 1); }), pts: Array(n).fill(0) };
    var grid = el('div', 'score-grid');
    st.names.forEach(function (nm, k) {
      var c = el('div', 'score-team', '<div class="score-name" contenteditable="true" spellcheck="false"></div><div class="score-pts"></div><div class="btn-row"><button type="button" class="btn dn">−1</button><button type="button" class="btn primary up">+1</button></div>');
      c.querySelector('.score-name').textContent = nm;
      c.querySelector('.score-name').addEventListener('input', function (e) { st.names[k] = e.target.textContent.trim(); LS.set(id, st); });
      c.querySelector('.up').onclick = function () { st.pts[k]++; save(); chime(); };
      c.querySelector('.dn').onclick = function () { st.pts[k] = Math.max(0, st.pts[k] - 1); save(); };
      grid.appendChild(c);
    });
    var rs = btn('Reset scores', 'score-reset');
    rs.onclick = function () { st.pts = st.pts.map(function () { return 0; }); save(); };
    var sv = btn('Save scores to server', 'score-reset'); sv.onclick = function () { report(s, 'score', { item: st.names.join('／'), result: st.names.map(function (n, k) { return n + ' ' + st.pts[k]; }).join('、'), value: Math.max.apply(null, st.pts), detail: st }); say('Scores recorded', 'ok'); };
    s.appendChild(grid); s.appendChild(rs); s.appendChild(sv);
    function save() { LS.set(id, st); draw(); }
    function draw() {
      var top = Math.max.apply(null, st.pts);
      $$('.score-team', s).forEach(function (c, k) { c.querySelector('.score-pts').textContent = st.pts[k]; c.classList.toggle('lead', top > 0 && st.pts[k] === top); });
    }
    draw();
  });

  /* ---------- 節奏挑戰：聽節奏 → 唱出 Ta → 比對拍點 ---------- */
  var RHYTHMS = [
    { name: 'Quarter notes', tip: 'One note per beat, the steadiest foundation', on: [0, 1, 2, 3] },
    { name: 'Eighth notes', tip: 'Two notes per beat, evenly spaced', on: [0, 0.5, 1, 1.5, 2, 2.5, 3, 3.5] },
    { name: 'Dotted rhythm', tip: 'Long and short in turn, like a heartbeat\'s "dum-da"', on: [0, 1.5, 2, 3.5] },
    { name: 'Syncopation', tip: 'The accent lands between the beats, the most common feel in pop songs', on: [0, 0.5, 1.5, 2, 3] },
    { name: 'Eighth and two sixteenths', tip: 'One long note followed by two short ones', on: [0, 0.5, 0.75, 1, 1.5, 1.75, 2, 3] },
    { name: 'Offbeats', tip: 'Everything lands between the beats, the toughest test of steadiness', on: [0.5, 1.5, 2.5, 3.5] }
  ];
  $$('.rhythm-game').forEach(function (g) {
    var idx = 0, bpm = parseInt(g.getAttribute('data-bpm'), 10) || 80, running = false, mode = 'mic';
    var LAT = 0.04; // 麥克風輸入延遲補償（秒）
    g.innerHTML =
      '<div class="rg-pats"></div>' +
      '<div class="rg-head"><div><b class="rg-name"></b><span class="rg-tip"></span></div><div class="rg-tempo"><button type="button" class="btn rg-dn" aria-label="Slower">−</button><span class="rg-bpm"></span><button type="button" class="btn rg-up" aria-label="Faster">＋</button></div></div>' +
      '<canvas class="rg-cv"></canvas>' +
      '<div class="rg-status"><span class="rg-state">Press "Play demo" to hear it once, then press "Start challenge" and sing the rhythm on Ta</span><span class="rg-score"></span></div>' +
      '<div class="btn-row"><button type="button" class="btn rg-demo">▶︎ Play demo</button><button type="button" class="btn primary rg-go">● Start challenge</button><button type="button" class="btn rg-tap" disabled>Tap (J key)</button><button type="button" class="btn rg-mode">Use the tap key</button></div>';
    var pats = g.querySelector('.rg-pats'), cv = g.querySelector('.rg-cv'), state = g.querySelector('.rg-state'), scoreEl = g.querySelector('.rg-score');
    var go = g.querySelector('.rg-go'), demo = g.querySelector('.rg-demo'), tapB = g.querySelector('.rg-tap'), modeB = g.querySelector('.rg-mode');
    RHYTHMS.forEach(function (r, k) {
      var b = btn(r.name, 'rg-pat'); b.onclick = function () { if (running) return; idx = k; result = null; paintPats(); draw(); };
      pats.appendChild(b);
    });
    var result = null, an = null, buf = new Float32Array(1024), raf = 0, onsets = [], start = 0, end = 0, nowBeat = -1;
    function spb() { return 60 / bpm; }
    function paintPats() {
      $$('.rg-pat', pats).forEach(function (b, k) { b.classList.toggle('on', k === idx); });
      g.querySelector('.rg-name').textContent = RHYTHMS[idx].name;
      g.querySelector('.rg-tip').textContent = RHYTHMS[idx].tip;
      g.querySelector('.rg-bpm').textContent = bpm + ' BPM';
    }
    function click(at, accent, vol) {
      var c = ac(), o = c.createOscillator(), gn = c.createGain();
      o.frequency.value = accent ? 1600 : 1100;
      gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(vol || 0.3, at + 0.004); gn.gain.exponentialRampToValueAtTime(0.001, at + 0.06);
      o.connect(gn); gn.connect(c.destination); o.start(at); o.stop(at + 0.08);
    }
    function note(at, dur) {
      var c = ac(), o = c.createOscillator(), gn = c.createGain();
      o.type = 'triangle'; o.frequency.value = 523.25;
      gn.gain.setValueAtTime(0, at); gn.gain.linearRampToValueAtTime(0.32, at + 0.01); gn.gain.setValueAtTime(0.32, at + dur * 0.6); gn.gain.linearRampToValueAtTime(0, at + dur);
      o.connect(gn); gn.connect(c.destination); o.start(at); o.stop(at + dur + 0.02);
    }
    function countIn(t0) { for (var i = 0; i < 4; i++) click(t0 + i * spb(), i === 0, 0.35); return t0 + 4 * spb(); }
    function draw() {
      var c = canvasFit(cv), x = c.x, W = c.w, H = c.h, padL = 10, padR = 10, w = W - padL - padR;
      var X = function (b) { return padL + b / 4 * w; };
      x.clearRect(0, 0, W, H);
      for (var s = 0; s <= 16; s++) {
        x.strokeStyle = s % 4 === 0 ? ink(.28) : ink(.07); x.lineWidth = s % 4 === 0 ? 1.5 : 1;
        x.beginPath(); x.moveTo(X(s / 4), 6); x.lineTo(X(s / 4), H - 6); x.stroke();
      }
      x.fillStyle = ink(.45); x.font = '12px "Space Grotesk",sans-serif';
      for (var b = 0; b < 4; b++) x.fillText(String(b + 1), X(b) + 4, 18);
      if (nowBeat >= 0) { x.fillStyle = 'rgba(244,166,42,.12)'; x.fillRect(X(Math.floor(nowBeat)), 4, w / 4, H - 8); }
      var on = RHYTHMS[idx].on, mid = H * 0.42;
      on.forEach(function (b, k) {
        var st = result ? (result.hit[k] ? css('--green') : 'rgba(236,74,54,.85)') : css('--amber');
        x.fillStyle = st; x.beginPath(); x.roundRect ? x.roundRect(X(b) - 2, mid - 14, 14, 28, 4) : x.rect(X(b) - 2, mid - 14, 14, 28); x.fill();
      });
      (result ? result.det : onsets).forEach(function (d) {
        var b = typeof d === 'number' ? d : d.b; if (b < -0.5 || b > 4.5) return;
        x.fillStyle = d.ok === undefined ? css('--navy') : (d.ok ? css('--green') : ink(.5));
        x.beginPath(); x.moveTo(X(b), H - 12); x.lineTo(X(b) - 7, H - 26); x.lineTo(X(b) + 7, H - 26); x.closePath(); x.fill();
      });
      x.fillStyle = ink(.4); x.font = '11px "Noto Sans TC","PingFang TC","Microsoft JhengHei","Noto Sans CJK TC",sans-serif';
      x.fillText('Target beats', W - 64, mid - 20); x.fillText('Your taps ▼', W - 72, H - 30);
    }
    function score() {
      var tg = RHYTHMS[idx].on, det = onsets.map(function (b) { return { b: b, ok: false } }), hit = tg.map(function () { return null; });
      var tol = Math.min(0.13, spb() * 0.25) / spb(); // 以拍為單位的容許範圍
      tg.forEach(function (t, k) {
        var best = null;
        det.forEach(function (d) { if (!d.ok && Math.abs(d.b - t) <= tol && (!best || Math.abs(d.b - t) < Math.abs(best.b - t))) best = d; });
        if (best) { best.ok = true; hit[k] = (best.b - t) * spb() * 1000; }
      });
      var n = hit.filter(function (h) { return h !== null; }).length, extra = det.filter(function (d) { return !d.ok; }).length;
      var offs = hit.filter(function (h) { return h !== null; }), avg = offs.length ? offs.reduce(function (a, b) { return a + b; }, 0) / offs.length : 0;
      var pct = Math.max(0, Math.round((n - extra * 0.5) / tg.length * 100));
      result = { hit: hit.map(function (h) { return h !== null; }), det: det, n: n, extra: extra, avg: avg, pct: pct };
      var lean = Math.abs(avg) < 25 ? 'Timing is spot on' : avg < 0 ? 'Rushing overall by about ' + Math.round(-avg) + ' ms (ahead of the beat)' : 'Dragging overall by about ' + Math.round(avg) + ' ms (behind the beat)';
      scoreEl.textContent = pct + ' points';
      state.textContent = 'Hits ' + n + ' / ' + tg.length + (extra ? ', ' + extra + ' extra' : '') + '. ' + (n ? lean : 'Listen to the demo again and practise with the metronome');
      if (n === tg.length && !extra) chime();
      report(g, 'rhythm', { item: RHYTHMS[idx].name + ' (' + bpm + ' BPM）', result: n + '/' + tg.length, value: pct, detail: { extra: extra, avgOffsetMs: Math.round(avg), mode: mode } });
      draw();
    }
    function finish() {
      running = false; cancelAnimationFrame(raf); nowBeat = -1;
      if (an) { an = null; micStop(); }
      tapB.disabled = true; go.textContent = '● Try again'; demo.disabled = false;
      score();
    }
    function tick() {
      raf = requestAnimationFrame(tick);
      var t = ac().currentTime, b = (t - start) / spb();
      nowBeat = b >= 0 && b < 4 ? b : -1;
      if (an && t >= start - 0.15) {
        an.getFloatTimeDomainData(buf);
        var s = 0; for (var i = 0; i < buf.length; i++) s += buf[i] * buf[i];
        var r = Math.sqrt(s / buf.length);
        if (env.armed && r > env.th && r > env.low * 2.2 && t - env.last > 0.11) { onsets.push((t - LAT - start) / spb()); env.last = t; env.armed = false; env.peak = r; }
        if (!env.armed) { env.peak = Math.max(env.peak, r); if (r < env.peak * 0.55 || t - env.last > 0.3) { env.armed = true; env.low = r; } }
        else env.low = Math.min(env.low * 1.02 + 0.0005, Math.max(r, 0.002));
      } else if (an) {
        an.getFloatTimeDomainData(buf); var s2 = 0; for (var j = 0; j < buf.length; j++) s2 += buf[j] * buf[j];
        env.floor = Math.max(env.floor, Math.sqrt(s2 / buf.length)); env.th = Math.max(0.02, env.floor * 3); env.low = env.floor || 0.005;
      }
      if (t > end) return finish();
      draw();
    }
    var env = {};
    function begin(withMic) {
      result = null; onsets = []; scoreEl.textContent = '';
      env = { armed: true, last: -1, peak: 0, low: 0.005, floor: 0, th: 0.02 };
      var c = ac(); start = countIn(c.currentTime + 0.15); end = start + 4 * spb() + 0.35;
      running = true; go.textContent = '■ Stop'; demo.disabled = true;
      tapB.disabled = withMic; state.textContent = withMic ? 'Start after the four-beat count-in and sing the rhythm on Ta (keep your hands still)' : 'Start after the four-beat count-in and press "Tap" or the J key on every beat';
      cancelAnimationFrame(raf); tick();
    }
    go.onclick = function () {
      if (running) { running = false; cancelAnimationFrame(raf); nowBeat = -1; if (an) { an = null; micStop(); } tapB.disabled = true; demo.disabled = false; go.textContent = '● Start challenge'; state.textContent = 'Stopped'; draw(); return; }
      if (mode === 'tap') return begin(false);
      state.textContent = 'Turning on the microphone…';
      micStart().then(function (a) { an = a; begin(true); })
        .catch(function () { mode = 'tap'; modeB.textContent = 'Use the microphone'; state.textContent = 'Can\'t use the microphone. Switched to tap-key mode'; begin(false); });
    };
    demo.onclick = function () {
      if (running) return;
      var c = ac(), t0 = countIn(c.currentTime + 0.1), on = RHYTHMS[idx].on;
      on.forEach(function (b, k) { var nx = k + 1 < on.length ? on[k + 1] : 4; note(t0 + b * spb(), Math.min(0.35, (nx - b) * spb() * 0.8)); });
      result = null; onsets = []; scoreEl.textContent = ''; state.textContent = 'Playing demo: the first four clicks are the count-in';
      start = t0; end = t0 + 4 * spb() + 0.2; demo.disabled = true;
      (function anim() { var t = ac().currentTime, b = (t - start) / spb(); nowBeat = b >= 0 && b < 4 ? b : -1; draw(); if (t < end) requestAnimationFrame(anim); else { nowBeat = -1; demo.disabled = false; state.textContent = 'Your turn: press "Start challenge" and after the four-beat count-in, sing the same rhythm on Ta'; draw(); } })();
    };
    function tap() { if (!running || mode !== 'tap') return; onsets.push((ac().currentTime - start) / spb()); draw(); }
    // 觸控用 pointerdown 立即記錄拍點（不等 click 延遲，也不觸發雙擊放大）；鍵盤啟動按鈕時仍走 click
    tapB.addEventListener('pointerdown', function (e) { e.preventDefault(); tap(); });
    tapB.onclick = function (e) { if (e.detail === 0) tap(); };
    document.addEventListener('keydown', function (e) { if (running && mode === 'tap' && (e.key === 'j' || e.key === 'J')) { e.preventDefault(); e.stopPropagation(); tap(); } }, true);
    modeB.onclick = function () { if (running) return; mode = mode === 'mic' ? 'tap' : 'mic'; modeB.textContent = mode === 'mic' ? 'Use the tap key' : 'Use the microphone'; state.textContent = mode === 'mic' ? 'Microphone mode: sing the rhythm on Ta' : 'Tap-key mode: press "Tap" or the J key on every beat'; };
    g.querySelector('.rg-up').onclick = function () { if (!running) { bpm = Math.min(132, bpm + 4); result = null; paintPats(); draw(); } };
    g.querySelector('.rg-dn').onclick = function () { if (!running) { bpm = Math.max(56, bpm - 4); result = null; paintPats(); draw(); } };
    paintPats(); draw(); window.addEventListener('resize', draw);
    onLeave(g, function () { if (running) go.onclick(); });
  });

  /* ---------- 9. 錄音 ---------- */
  $$('.recorder').forEach(function (r) {
    var max = parseInt(r.getAttribute('data-max'), 10) || 30, label = r.getAttribute('data-name') || 'Recording';
    r.innerHTML = '<div class="rec-time">' + String(Math.floor(max / 60)).padStart(2, '0') + ':' + String(max % 60).padStart(2, '0') + '</div><div class="btn-row"><button type="button" class="btn primary go">● Start recording</button></div><audio controls></audio><a class="btn dl" download href="#">Download file</a><p class="muted rec-note">Download it to keep, or press "Upload to teacher" to send it to the course\'s cloud folder.</p>';
    var tm = r.querySelector('.rec-time'), go = r.querySelector('.go'), au = r.querySelector('audio'), dl = r.querySelector('.dl'); dl.onclick = function (e) { e.preventDefault(); }; // 錄音完成前不下載
    var rec = null, chunks = [], left = max, tid = 0, usingMic = false, up = null;
    function fmt(s) { s = Math.max(0, s); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); }
    function stop() { if (rec && rec.state !== 'inactive') rec.stop(); clearInterval(tid); }
    go.onclick = function () {
      if (rec && rec.state === 'recording') return stop();
      if (!window.MediaRecorder) { tm.textContent = 'This browser doesn\'t support recording'; return; }
      micStart().then(function () {
        usingMic = true;
        var type = MediaRecorder.isTypeSupported && MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        rec = new MediaRecorder(mic.stream, { mimeType: type }); chunks = []; left = max;
        rec.ondataavailable = function (e) { if (e.data.size) chunks.push(e.data); };
        rec.onstop = function () {
          var blob = new Blob(chunks, { type: type }), url = URL.createObjectURL(blob), d = new Date();
          au.src = url; dl.href = url; dl.onclick = function (e) { e.preventDefault(); saveFile(blob, dl.download); }; dl.download = label + '_' + d.getFullYear() + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0') + (type === 'audio/webm' ? '.webm' : '.m4a');
          r.classList.add('has'); go.textContent = '● Record again'; tm.textContent = 'Done'; if (usingMic) { usingMic = false; micStop(); }
          if (!up) { up = btn('Upload to teacher', 'primary rec-up'); r.insertBefore(up, r.querySelector('.rec-note')); }
          var secs = max - Math.max(0, left), fname = dl.download;
          up.disabled = false; up.textContent = 'Upload to teacher';
          up.onclick = function () {
            if (!window.PixelBackend) return;
            up.disabled = true; up.textContent = 'Uploading…';
            window.PixelBackend.upload(blob, { label: label, seconds: secs, filename: fname, slide: slideNo(r) }).then(function (res) { up.textContent = res && res.ok ? '✓ Uploaded to teacher' : 'Upload to teacher'; up.disabled = !!(res && res.ok); });
          };
        };
        rec.start(); go.textContent = '■ Stop'; tm.textContent = fmt(left);
        tid = setInterval(function () { left--; tm.textContent = fmt(left); if (left <= 0) stop(); }, 1000);
      }).catch(function () { tm.textContent = 'Can\'t use the microphone'; });
    };
    onLeave(r, stop);
  });

  /* ---------- 10. 排序遊戲（點兩下交換） ---------- */
  $$('.order').forEach(function (o) {
    var items = o.getAttribute('data-items').split('|'), cur = items.map(function (_, k) { return k; }), sel = -1;
    var box = el('div', 'order-tiles'), foot = el('div', 'btn-row'), msg = el('p', 'order-msg muted', 'Tap one card, then another, and the two swap places');
    var ck = btn('Check', 'primary'), sh = btn('Shuffle'), an = btn('Show answer');
    foot.appendChild(ck); foot.appendChild(sh); foot.appendChild(an);
    o.appendChild(box); o.appendChild(foot); o.appendChild(msg);
    function shuffle() { do { cur.sort(function () { return Math.random() - 0.5; }); } while (cur.every(function (v, k) { return v === k; })); sel = -1; render(); msg.textContent = 'Tap one card, then another, and the two swap places'; }
    function render(check) {
      box.innerHTML = '';
      cur.forEach(function (v, k) {
        var t = btn('<small>' + (k + 1) + '</small>' + esc(items[v]), 'order-tile' + (k === sel ? ' sel' : '') + (check ? (v === k ? ' ok' : ' no') : ''));
        t.onclick = function () { if (sel < 0) { sel = k; } else { var tmp = cur[sel]; cur[sel] = cur[k]; cur[k] = tmp; sel = -1; } render(); };
        box.appendChild(t);
      });
    }
    ck.onclick = function () { var n = cur.filter(function (v, k) { return v === k; }).length; report(o, 'order', { item: items[0] + ' …（' + items.length + ' )', result: n + '/' + items.length, value: n }); render(true); msg.textContent = n === items.length ? 'All correct!' : 'Correct: ' + n + ' / ' + items.length + ' cards'; if (n === items.length) chime(); };
    sh.onclick = shuffle;
    an.onclick = function () { cur = items.map(function (_, k) { return k; }); render(true); msg.textContent = 'This is the correct order'; };
    shuffle();
  });

  /* ---------- 11. 翻牌 ---------- */
  $$('.flips').forEach(function (f) {
    $$('.flip', f).forEach(function (c) {
      c.setAttribute('role', 'button'); c.tabIndex = 0;
      c.onclick = function () { c.classList.toggle('on'); };
      c.onkeydown = function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); c.classList.toggle('on'); } };
    });
    var all = btn('Flip all', 'flips-all');
    all.onclick = function () { var on = !f.classList.contains('allon'); f.classList.toggle('allon', on); $$('.flip', f).forEach(function (c) { c.classList.toggle('on', on); }); all.textContent = on ? 'Cover all' : 'Flip all'; };
    f.parentNode.insertBefore(all, f.nextSibling);
  });

  /* ---------- 12. 分段計時（想—配對—分享、跟做） ---------- */
  $$('.phase').forEach(function (p) {
    var ph = p.getAttribute('data-phases').split(';').map(function (s) { var a = s.split('|'); return { name: a[0], sec: parseInt(a[1], 10) }; });
    // data-loop：最後一段結束後自動從頭再來（例：結業演唱每人 1 分鐘）
    var idx = 0, left = ph[0].sec, tid = 0, loop = p.hasAttribute('data-loop'), round = 1;
    p.innerHTML = '<div class="ph-steps"></div><div class="ph-main"><div class="ph-name"></div><div class="ph-time"></div></div><div class="btn-row"><button type="button" class="btn primary go">Start</button><button type="button" class="btn next">Next section</button><button type="button" class="btn reset">Reset</button></div>';
    var steps = p.querySelector('.ph-steps'), nm = p.querySelector('.ph-name'), tm = p.querySelector('.ph-time'), go = p.querySelector('.go');
    ph.forEach(function (s) { steps.appendChild(el('span', '', esc(s.name) + ' <small>' + (s.sec < 60 ? s.sec + ' s' : Math.round(s.sec / 60 * 10) / 10 + ' points') + '</small>')); });
    function fmt(s) { return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
    function emit() { p.dispatchEvent(new CustomEvent('phase:change', { bubbles: true, detail: { index: idx, name: ph[idx].name, running: !!tid } })); }
    function draw() { setTimeout(emit, 0); nm.textContent = (loop ? 'Person ' + round + '　' : '') + ph[idx].name; tm.textContent = fmt(left); $$('span', steps).forEach(function (s, k) { s.classList.toggle('on', k === idx); s.classList.toggle('past', k < idx); }); }
    function next() { if (idx < ph.length - 1) { idx++; left = ph[idx].sec; chime(); var v = video(); if (v && tid && v.player && v.player.seekTo) { v.player.seekTo(0, true); v.play(); } } else if (loop) { idx = 0; left = ph[0].sec; round++; tone(660, 0.5, 0.3); stop(); go.textContent = 'Next person, go'; } else { stop(); left = 0; nm.textContent = 'Time\'s up'; tone(660, 0.6, 0.3); } draw(); }
    function stop() { clearInterval(tid); tid = 0; go.textContent = 'Start'; }
    // data-video：開始／繼續時一併播放同一張投影片的影片，暫停時暫停，重設時停止，換段時從頭播放
    function video() { return p.hasAttribute('data-video') && window.PixelYT && window.PixelYT.find ? window.PixelYT.find(p.closest('.slide')) : null; }
    go.onclick = function () { var v = video(); if (tid) { stop(); go.textContent = 'Resume'; if (v) v.pause(); emit(); return; } go.textContent = 'Pause'; if (v) v.play(); tid = setInterval(function () { left--; if (left <= 0) next(); else draw(); }, 1000); emit(); };
    p.querySelector('.next').onclick = next;
    p.querySelector('.reset').onclick = function () { stop(); idx = 0; left = ph[0].sec; round = 1; var v = video(); if (v) v.stop(); draw(); };
    draw(); onLeave(p, function () { if (tid) { stop(); go.textContent = 'Resume'; } });
  });

  /* ---------- 14. 出場券 ---------- */
  $$('.exit').forEach(function (x) {
    // data-key：同一堂第二份表單（例：模仿筆記），data-label 為表單名稱
    var xk = x.getAttribute('data-key'), label = x.getAttribute('data-label') || 'Exit ticket';
    var key = 'exit-' + LESSON + (xk ? '-' + xk : ''), prompts = x.getAttribute('data-prompts').split('|'), st = LS.get(key, {});
    prompts.forEach(function (pr, k) {
      var f = el('label', 'exit-field', '<span>' + esc(pr) + '</span><textarea rows="2"></textarea>');
      var ta = f.querySelector('textarea'); ta.value = st[k] || '';
      ta.oninput = function () { st[k] = ta.value; LS.set(key, st); mark(); };
      x.appendChild(f);
    });
    var foot = el('div', 'btn-row'), cp = btn('Copy text'), msg = el('span', 'muted'), sd = btn('Send to teacher', 'primary');
    foot.appendChild(sd);
    // 同樣的內容只送一次：送出中停用按鈕，送出（或已排入補送）後記下內容，改過文字才能再送
    function answers() { return prompts.map(function (p, k) { return st[k] || ''; }); }
    function mark() { var done = LS.get(key + '-sent', '') === JSON.stringify(answers()); sd.textContent = done ? 'Sent' : 'Send to teacher'; sd.setAttribute('aria-pressed', String(done)); }
    sd.onclick = function () {
      if (!prompts.some(function (p, k) { return st[k] && st[k].trim(); })) { say('Please fill in ' + label, 'warn'); return; }
      if (!window.PixelBackend || sd.disabled) return;
      var sig = JSON.stringify(answers());
      if (LS.get(key + '-sent', '') === sig) { say('This ' + label + ' has already been sent. Change something to send it again', 'ok'); return; }
      sd.disabled = true; sd.textContent = 'Sending…';
      var job = xk ? window.PixelBackend.send('note', { item: label, result: prompts.map(function (p, k) { return p + ': ' + (st[k] || ''); }).join('／'), detail: { prompts: prompts, answers: answers() } }, { slide: slideNo(x), okMsg: label + 'Sent' })
        : window.PixelBackend.send('exit', { answers: answers() }, { slide: slideNo(x), okMsg: 'Exit ticket sent' });
      Promise.resolve(job).then(function (r) { if (r && !r.cancelled) LS.set(key + '-sent', sig); }, function () {}).then(function () { sd.disabled = false; mark(); });
    };
    mark();
    cp.onclick = function () {
      var title = document.body.getAttribute('data-title') || document.title;
      var text = title + ' ' + label + '\n' + prompts.map(function (p, k) { return '■ ' + p + '\n' + (st[k] || ''); }).join('\n');
      (navigator.clipboard ? navigator.clipboard.writeText(text) : Promise.reject()).then(function () { msg.textContent = 'Copied'; }, function () { msg.textContent = 'Couldn\'t copy automatically. Please select it by hand'; });
    };
    foot.appendChild(cp); foot.appendChild(msg); x.appendChild(foot);
  });

  /* ---------- 15. 七天紀錄表 ---------- */
  $$('.log7').forEach(function (t) {
    var key = 'log7-' + LESSON, cols = t.getAttribute('data-cols').split('|'), st = LS.get(key, {});
    var tb = el('table', 'log7-t'), h = '<tr><th>Day</th>' + cols.map(function (c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr>';
    for (var d = 0; d < 7; d++) { h += '<tr><td>Day ' + (d + 1) + '</td>' + cols.map(function (_, c) { return '<td><input type="text" data-k="' + d + '-' + c + '" aria-label="Day ' + (d + 1) + ' ' + esc(cols[c]) + '"></td>'; }).join('') + '</tr>'; }
    tb.innerHTML = h; t.appendChild(tb);
    $$('input', tb).forEach(function (i) { i.value = st[i.getAttribute('data-k')] || ''; i.oninput = function () { st[i.getAttribute('data-k')] = i.value; LS.set(key, st); }; });
    var lf = el('div', 'btn-row pb-send'), ls = btn('Send log to teacher', 'primary'); lf.appendChild(ls); t.appendChild(lf);
    ls.onclick = function () {
      var rows = []; for (var d = 0; d < 7; d++) rows.push([d + 1].concat(cols.map(function (_, c) { return st[d + '-' + c] || ''; })));
      if (!rows.some(function (r) { return r.slice(1).some(function (v) { return String(v).trim(); }); })) { say('Please fill in the log first', 'warn'); return; }
      if (window.PixelBackend) window.PixelBackend.send('log7', { rows: rows, columns: cols }, { slide: slideNo(t), okMsg: 'Practice log sent' });
    };
    t.appendChild(el('p', 'muted log7-note', 'Fill it in on your own phone and press "Send log to teacher" to save it to the course sheet.'));
  });

  /* ---------- 16. 作業勾選 ---------- */
  $$('.checks[data-id]').forEach(function (u) {
    var key = 'checks-' + u.getAttribute('data-id'), st = LS.get(key, []);
    if (!u.hasAttribute('aria-label')) u.setAttribute('aria-label', 'Homework checklist');
    $$('li', u).forEach(function (li, k) {
      // 原生 checkbox 疊在 li::before 的勾選框上（透明），整列仍可點選；清單保留 list 語意
      var box = document.createElement('input'); box.type = 'checkbox'; box.className = 'check-input';
      box.checked = !!st[k]; box.setAttribute('aria-label', li.textContent.replace(/▶\uFE0E?/g, '').trim());
      li.insertBefore(box, li.firstChild); li.classList.toggle('done', !!st[k]);
      var tg = function () { st[k] = !st[k]; box.checked = !!st[k]; li.classList.toggle('done', !!st[k]); LS.set(key, st); report(u, 'homework', { item: li.textContent.replace(/▶\uFE0E?/g, '').trim(), result: st[k] ? 'Done' : 'Cancel', value: st[k] ? 1 : 0 }); };
      box.onchange = function () { if (box.checked !== !!st[k]) tg(); };
      box.onkeydown = function (e) { e.stopPropagation(); if (e.key === 'Enter') { e.preventDefault(); tg(); } };
      li.onclick = function (e) { if (e.target === box || e.target.closest('a,button,input,select,textarea')) return; tg(); };
    });
  });

  /* ---------- 17. QR Code ---------- */
  $$('.qr').forEach(function (q) {
    var href = q.getAttribute('data-href') || 'self';
    var url = href === 'self' ? location.href.split('#')[0] : new URL(href, location.href).href;
    var box = el('div', 'qr-box'); q.appendChild(box);
    q.appendChild(el('div', 'qr-url', esc(url.replace(/^https?:\/\//, ''))));
    if (window.QRCode) new window.QRCode(box, { text: url, width: 220, height: 220, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
    else box.innerHTML = '<a href="' + esc(url) + '">' + esc(url) + '</a>';
    if (window.QRCode) { box.setAttribute('role', 'img'); box.setAttribute('aria-label', 'QR Code：' + url.replace(/^https?:\/\//, '')); [].forEach.call(box.children, function (c) { c.setAttribute('aria-hidden', 'true'); if (c.tagName === 'IMG') c.alt = ''; }); }
    // 手機上不需要掃碼：同一頁顯示「已同步」，其他連結改成按鈕
    q.appendChild(href === 'self' ? el('div', 'qr-mobile here', '✓ You\'ve opened this deck on your phone') : el('a', 'qr-mobile go', 'Open the pre-class survey →'));
    if (href !== 'self') q.lastChild.href = url;
  });
  if (window.PixelUI) window.PixelUI.labelTables(document);

  /* ---------- 少數頁面才用的工具：頁面有對應 class 才載入 assets/interact/ 的分塊 ---------- */
  var CHUNKS = {
    songpoll: ['.taptempo', '.songpoll'],
    wavelab: ['.wavelab'],
    pitch: ['.pitch'],
    siren: ['.siren'],
    resolab: ['.resolab'],
    sing: ['.scalepractice', '.staccato', '.melodyscope'],
    solfa: ['.solfa'],
    stage: ['.stopwatch', '.mirror'],
    dynmap: ['.dynmap'],
    range: ['.range', '.transpose'],
    zero: ['.zero'],
    breath: ['.breath'],
    lyricmark: ['.lyricmark']
  };
  var KIT = { COURSE: COURSE, LESSON: LESSON, NS: NS, LS: LS, '$$': $$, el: el, btn: btn, esc: esc, slideNo: slideNo, report: report, say: say, onLeave: onLeave, later: later, IN_APP: IN_APP, TOUCH: TOUCH, saveFile: saveFile, ac: ac, tone: tone, chime: chime, mic: mic, micStart: micStart, micStop: micStop, midiOf: midiOf, freqOf: freqOf, nameOf: nameOf, detectPitch: detectPitch, rmsOf: rmsOf, canvasFit: canvasFit, css: css, ink: ink };
  function chunkFailed(name) {
    var note = 'The interactive part can\'t load right now. The page content is still available.';
    later(function () {
      $$(CHUNKS[name].join(',')).forEach(function (r) { r.appendChild(el('p', 'muted', note)); });
      say(note, 'warn');
    });
  }
  window.PixelInteract = {
    // 分塊下載完就登記；一律等所有 defer 腳本執行完才掛上，backend.js 等相依才會就緒
    define: function (name, mount) {
      later(function () {
        try { mount(KIT); } catch (e) { if (window.console) console.error('interact chunk ' + name, e); chunkFailed(name); return; }
        if (window.PixelUI) $$(CHUNKS[name].join(',')).forEach(function (r) { window.PixelUI.labelTables(r); });
        // guitar.js 載入時就量過目前這張投影片（fitSlide）；分塊內容落在這張時，桌機要請它重量一次
        var now = document.querySelector('.slide.active');
        if (window.PS && window.PS.guitar && now && now.querySelector(CHUNKS[name].join(',')) && !matchMedia('(max-width:900px),(orientation:portrait) and (max-width:1100px)').matches) {
          document.dispatchEvent(new CustomEvent('slide:change', { detail: { index: $$('.slide').indexOf(now), mobile: false } }));
        }
      });
    }
  };
  var SELF = (document.currentScript || document.querySelector('script[src*="interact.js"]')).src;
  Object.keys(CHUNKS).forEach(function (name) {
    if (!document.querySelector(CHUNKS[name].join(','))) return;
    var s = document.createElement('script');
    s.src = new URL('interact/' + name + '.js' + new URL(SELF).search, SELF).href; // 版本號沿用 interact.js；英文頁會落在 en/assets/interact/
    s.async = false;
    s.onerror = function () { chunkFailed(name); };
    document.head.appendChild(s);
  });

  /* ---------- 換頁時停止聲音與麥克風 ---------- */
  document.addEventListener('slide:change', function (e) {
    if (e.detail && e.detail.mobile) return;
    stoppers.forEach(function (s) { if (s.slide && !s.slide.classList.contains('active')) s.fn(); });
    // 換頁動畫結束後通知各圖表重畫，依最終大小取得清晰的解析度
    setTimeout(function () { window.dispatchEvent(new Event('resize')); }, 420);
  });
})();
