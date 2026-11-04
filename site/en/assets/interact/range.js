/* Pixel Studio 互動分塊：音域測量與自定調計算器（.range .transpose）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('range', function (K) {
  'use strict';
  var LS = K.LS, $$ = K.$$, btn = K.btn, report = K.report, say = K.say, onLeave = K.onLeave, ac = K.ac, tone = K.tone, mic = K.mic, micStart = K.micStart, micStop = K.micStop, midiOf = K.midiOf, freqOf = K.freqOf, nameOf = K.nameOf, detectPitch = K.detectPitch;

  /* ---------- 音域測量：參考音逐音上下，記錄可用音域與完全音域 ---------- */
  var LETTER = { C: 0, D: 1, E: 2, F: 3, G: 4, A: 5, B: 6 };
  function degreesOf(a, b) { // 白鍵度數，頭尾都算：C3→C4 = 8 度
    var na = nameOf(Math.min(a, b)).name, nb = nameOf(Math.max(a, b)).name;
    var oa = +na.slice(-1), ob = +nb.slice(-1);
    return (ob - oa) * 7 + LETTER[nb[0]] - LETTER[na[0]] + 1;
  }
  $$('.range').forEach(function (p) {
    var key = 'range-me', st = LS.get(key, { lo: null, hi: null, flo: null, fhi: null }), ref = 60, an = null, raf = 0, frame = 0, buf = new Float32Array(2048), recent = [];
    p.innerHTML = '<div class="rg-read"><div><small>Usable range</small><b class="rg-use">--</b></div><div><small>Full range</small><b class="rg-full">--</b></div><div><small>Usable interval</small><b class="rg-deg">--</b></div></div>' +
      '<div class="rg-ref"><button type="button" class="btn dn" aria-label="Next note down">▼</button><div class="rg-note"><small>Reference note</small><b>C4</b><span class="rg-sung">You sang: --</span></div><button type="button" class="btn up" aria-label="Next note up">▲</button></div>' +
      '<div class="btn-row"><button type="button" class="btn play">▶︎ Play reference</button><button type="button" class="btn primary mic">● Start detecting</button><button type="button" class="btn setlo">Set as lowest usable</button><button type="button" class="btn sethi">Set as highest usable</button><button type="button" class="btn clear">Clear</button></div>' +
      '<p class="rg-state muted">Start from C4 and sing down one note at a time on /a/. When your voice turns breathy or the pitch wobbles, set the previous note as "lowest usable". Then go back to C4 and work upward the same way to set "highest usable".</p>';
    var noteB = p.querySelector('.rg-note b'), sung = p.querySelector('.rg-sung'), state = p.querySelector('.rg-state'), mic = p.querySelector('.mic');
    function nm(m) { return m === null || m === undefined ? '--' : nameOf(m).name; }
    function show() {
      noteB.textContent = nameOf(ref).name + ' (' + nameOf(ref).solf + ')';
      p.querySelector('.rg-use').textContent = st.lo !== null && st.hi !== null ? nm(st.lo) + '–' + nm(st.hi) : nm(st.lo) + ' / ' + nm(st.hi);
      p.querySelector('.rg-full').textContent = st.flo !== null ? nm(st.flo) + '–' + nm(st.fhi) : '--';
      p.querySelector('.rg-deg').textContent = st.lo !== null && st.hi !== null ? degreesOf(st.lo, st.hi) + ' th' : '--';
    }
    function save(what) {
      LS.set(key, st); show();
      if (what && st.lo !== null && st.hi !== null) report(p, 'range', { item: 'Range test', result: 'Usable ' + nm(st.lo) + '–' + nm(st.hi) + ' (' + degreesOf(st.lo, st.hi) + ' th)' + (st.flo !== null ? '; full ' + nm(st.flo) + '–' + nm(st.fhi) : ''), value: degreesOf(st.lo, st.hi), detail: st });
    }
    function play() { tone(freqOf(ref), 1.2, 0.3, 'triangle'); }
    p.querySelector('.dn').onclick = function () { ref = Math.max(36, ref - 1); show(); play(); };
    p.querySelector('.up').onclick = function () { ref = Math.min(84, ref + 1); show(); play(); };
    p.querySelector('.play').onclick = play;
    p.querySelector('.setlo').onclick = function () { st.lo = ref; if (st.hi !== null && st.hi < st.lo) st.hi = null; save(true); state.textContent = 'Lowest usable note: ' + nm(ref) + '. Go back to C4 and look for your highest usable note.'; ref = 60; show(); };
    p.querySelector('.sethi').onclick = function () { st.hi = ref; if (st.lo !== null && st.lo > st.hi) st.lo = null; save(true); state.textContent = 'Highest usable note: ' + nm(ref) + '. This result carries over to the "Your key" calculator.'; };
    p.querySelector('.clear').onclick = function () { st = { lo: null, hi: null, flo: null, fhi: null }; ref = 60; save(false); state.textContent = 'Cleared. Start again from C4.'; };
    function loop() {
      raf = requestAnimationFrame(loop);
      if (++frame % 2) return;
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      if (ok.length < 3) return;
      var v = Math.round(ok[1]);
      sung.textContent = 'You sang: ' + nm(v) + (v === ref ? '　✓ On the reference note' : '');
      p.classList.toggle('hit', v === ref);
      if (st.flo === null || v < st.flo) st.flo = v;
      if (st.fhi === null || v > st.fhi) st.fhi = v;
      if (frame % 30 === 0) { LS.set(key, st); show(); }
    }
    function stop() { cancelAnimationFrame(raf); if (an) { an = null; micStop(); LS.set(key, st); show(); } mic.textContent = '● Start detecting'; p.classList.remove('hit'); }
    mic.onclick = function () {
      if (an) return stop();
      micStart().then(function (a) { an = a; recent = []; mic.textContent = '■ Stop detecting'; loop(); })
        .catch(function () { state.textContent = 'Can\'t use the microphone. Allow microphone access in your browser and open the page over https. You can also measure with just the reference note and keyboard.'; });
    };
    show(); onLeave(p, stop);
  });

  /* ---------- 自定調計算器：歌曲最高音對齊我的可用最高音 ---------- */
  var KEYS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  $$('.transpose').forEach(function (t) {
    function opts(lo, hi, sel) { var h = ''; for (var m = lo; m <= hi; m++) h += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + nameOf(m).name + ' (' + nameOf(m).solf + '）</option>'; return h; }
    var me = LS.get('range-me', {}), myHi = me && me.hi ? me.hi : 65;
    var key0 = parseInt(t.getAttribute('data-key') || '0', 10), top0 = parseInt(t.getAttribute('data-top') || '69', 10);
    t.innerHTML = '<div class="tp-form"><label>Song\'s original key<select class="k">' + KEYS.map(function (k, i) { return '<option value="' + i + '"' + (i === key0 ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>' +
      '<label>Song\'s highest note<select class="top">' + opts(55, 81, top0) + '</select></label>' +
      '<label>My highest usable note<select class="me">' + opts(52, 81, myHi) + '</select></label></div><div class="tp-out"></div>' +
      (me && me.hi ? '<p class="muted tp-note">Filled in with the highest usable note from your range test ' + nameOf(me.hi).name + '</p>' : '<p class="muted tp-note">Haven\'t tested your range yet? Set your highest usable note in "Range test" first and it will fill in here automatically.</p>');
    var out = t.querySelector('.tp-out');
    function shape(k) { // 常用開放和弦指型 + 移調夾
      var best = null;
      [['C', 0], ['G', 7], ['D', 2], ['A', 9], ['E', 4]].forEach(function (s) { var capo = ((k - s[1]) % 12 + 12) % 12; if (capo <= 7 && (!best || capo < best.capo)) best = { name: s[0], capo: capo }; });
      return best.capo ? best.name + ' shapes, capo ' + best.capo : best.name + ' shapes, no capo';
    }
    function calc() {
      var k = +t.querySelector('.k').value, top = +t.querySelector('.top').value, mine = +t.querySelector('.me').value, n = mine - top;
      var rows = [0, -1, -2].map(function (d) { var nk = ((k + n + d) % 12 + 12) % 12; return '<tr' + (d ? '' : ' class="main"') + '><td>' + (d ? 'Leave ' + (-d) + ' semitones of headroom' : 'Match the highest note') + '</td><td>' + (n + d > 0 ? '+' : '') + (n + d) + ' semitones</td><td><b>' + KEYS[nk] + ' </b></td><td>' + shape(nk) + '</td></tr>'; }).join('');
      out.innerHTML = '<table><tr><th>Option</th><th>Transpose</th><th>Your key</th><th>Guitar</th></tr>' + rows + '</table>';
      t._last = { key: KEYS[k], top: nameOf(top).name, mine: nameOf(mine).name, n: n, result: KEYS[((k + n) % 12 + 12) % 12] };
    }
    $$('select', t).forEach(function (s) { s.onchange = calc; });
    var sv = btn('Save this song\'s key', 'primary'); t.appendChild(sv);
    sv.onclick = function () { var r = t._last; report(t, 'transpose', { item: 'Original key ' + r.key + ', highest note ' + r.top, result: r.result + ' (' + (r.n > 0 ? '+' : '') + r.n + ' semitones)', value: r.n, detail: r }); say('Key saved', 'ok'); };
    calc();
  });
});
