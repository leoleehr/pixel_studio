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
    p.innerHTML = '<div class="rg-read"><div><small>可用音域</small><b class="rg-use">--</b></div><div><small>完全音域</small><b class="rg-full">--</b></div><div><small>可用度數</small><b class="rg-deg">--</b></div></div>' +
      '<div class="rg-ref"><button type="button" class="btn dn" aria-label="往下一個音">▼</button><div class="rg-note"><small>參考音</small><b>C4</b><span class="rg-sung">你唱的音：--</span></div><button type="button" class="btn up" aria-label="往上一個音">▲</button></div>' +
      '<div class="btn-row"><button type="button" class="btn play">▶︎ 播放參考音</button><button type="button" class="btn primary mic">● 開始偵測</button><button type="button" class="btn setlo">設為可用最低</button><button type="button" class="btn sethi">設為可用最高</button><button type="button" class="btn clear">清除</button></div>' +
      '<p class="rg-state muted">由 C4 開始，以 /a/ 逐音往下演唱；聲音變虛、音準不穩時，將前一個音設為「可用最低」。再回到 C4 往上，以同樣的方式設定「可用最高」。</p>';
    var noteB = p.querySelector('.rg-note b'), sung = p.querySelector('.rg-sung'), state = p.querySelector('.rg-state'), mic = p.querySelector('.mic');
    function nm(m) { return m === null || m === undefined ? '--' : nameOf(m).name; }
    function show() {
      noteB.textContent = nameOf(ref).name + '（' + nameOf(ref).solf + '）';
      p.querySelector('.rg-use').textContent = st.lo !== null && st.hi !== null ? nm(st.lo) + '–' + nm(st.hi) : nm(st.lo) + ' / ' + nm(st.hi);
      p.querySelector('.rg-full').textContent = st.flo !== null ? nm(st.flo) + '–' + nm(st.fhi) : '--';
      p.querySelector('.rg-deg').textContent = st.lo !== null && st.hi !== null ? degreesOf(st.lo, st.hi) + ' 度' : '--';
    }
    function save(what) {
      LS.set(key, st); show();
      if (what && st.lo !== null && st.hi !== null) report(p, 'range', { item: '音域測量', result: '可用 ' + nm(st.lo) + '–' + nm(st.hi) + '（' + degreesOf(st.lo, st.hi) + ' 度）' + (st.flo !== null ? '；完全 ' + nm(st.flo) + '–' + nm(st.fhi) : ''), value: degreesOf(st.lo, st.hi), detail: st });
    }
    function play() { tone(freqOf(ref), 1.2, 0.3, 'triangle'); }
    p.querySelector('.dn').onclick = function () { ref = Math.max(36, ref - 1); show(); play(); };
    p.querySelector('.up').onclick = function () { ref = Math.min(84, ref + 1); show(); play(); };
    p.querySelector('.play').onclick = play;
    p.querySelector('.setlo').onclick = function () { st.lo = ref; if (st.hi !== null && st.hi < st.lo) st.hi = null; save(true); state.textContent = '可用最低音：' + nm(ref) + '。回到 C4，往上找可用最高音。'; ref = 60; show(); };
    p.querySelector('.sethi').onclick = function () { st.hi = ref; if (st.lo !== null && st.lo > st.hi) st.lo = null; save(true); state.textContent = '可用最高音：' + nm(ref) + '。這個結果會帶到「自定調」計算。'; };
    p.querySelector('.clear').onclick = function () { st = { lo: null, hi: null, flo: null, fhi: null }; ref = 60; save(false); state.textContent = '已清除，從 C4 重新開始。'; };
    function loop() {
      raf = requestAnimationFrame(loop);
      if (++frame % 2) return;
      an.getFloatTimeDomainData(buf);
      var f = detectPitch(buf, ac().sampleRate), m = f > 0 ? midiOf(f) : null;
      recent.push(m); if (recent.length > 3) recent.shift();
      var ok = recent.filter(function (v) { return v !== null; }).sort(function (a, b) { return a - b; });
      if (ok.length < 3) return;
      var v = Math.round(ok[1]);
      sung.textContent = '你唱的音：' + nm(v) + (v === ref ? '　✓ 對準參考音' : '');
      p.classList.toggle('hit', v === ref);
      if (st.flo === null || v < st.flo) st.flo = v;
      if (st.fhi === null || v > st.fhi) st.fhi = v;
      if (frame % 30 === 0) { LS.set(key, st); show(); }
    }
    function stop() { cancelAnimationFrame(raf); if (an) { an = null; micStop(); LS.set(key, st); show(); } mic.textContent = '● 開始偵測'; p.classList.remove('hit'); }
    mic.onclick = function () {
      if (an) return stop();
      micStart().then(function (a) { an = a; recent = []; mic.textContent = '■ 停止偵測'; loop(); })
        .catch(function () { state.textContent = '無法使用麥克風：請允許瀏覽器使用麥克風，並以 https 網址開啟。也可以只用參考音與鍵盤測量。'; });
    };
    show(); onLeave(p, stop);
  });

  /* ---------- 自定調計算器：歌曲最高音對齊我的可用最高音 ---------- */
  var KEYS = ['C', 'D♭', 'D', 'E♭', 'E', 'F', 'F♯', 'G', 'A♭', 'A', 'B♭', 'B'];
  $$('.transpose').forEach(function (t) {
    function opts(lo, hi, sel) { var h = ''; for (var m = lo; m <= hi; m++) h += '<option value="' + m + '"' + (m === sel ? ' selected' : '') + '>' + nameOf(m).name + '（' + nameOf(m).solf + '）</option>'; return h; }
    var me = LS.get('range-me', {}), myHi = me && me.hi ? me.hi : 65;
    var key0 = parseInt(t.getAttribute('data-key') || '0', 10), top0 = parseInt(t.getAttribute('data-top') || '69', 10);
    t.innerHTML = '<div class="tp-form"><label>歌曲原調<select class="k">' + KEYS.map(function (k, i) { return '<option value="' + i + '"' + (i === key0 ? ' selected' : '') + '>' + k + '</option>'; }).join('') + '</select></label>' +
      '<label>歌曲最高音<select class="top">' + opts(55, 81, top0) + '</select></label>' +
      '<label>我的可用最高音<select class="me">' + opts(52, 81, myHi) + '</select></label></div><div class="tp-out"></div>' +
      (me && me.hi ? '<p class="muted tp-note">已帶入音域測量的可用最高音 ' + nameOf(me.hi).name + '</p>' : '<p class="muted tp-note">還沒測量音域？先到「音域測量」設定可用最高音，這裡會自動帶入。</p>');
    var out = t.querySelector('.tp-out');
    function shape(k) { // 常用開放和弦指型 + 移調夾
      var best = null;
      [['C', 0], ['G', 7], ['D', 2], ['A', 9], ['E', 4]].forEach(function (s) { var capo = ((k - s[1]) % 12 + 12) % 12; if (capo <= 7 && (!best || capo < best.capo)) best = { name: s[0], capo: capo }; });
      return best.capo ? best.name + ' 調指型、Capo ' + best.capo : best.name + ' 調指型，不用移調夾';
    }
    function calc() {
      var k = +t.querySelector('.k').value, top = +t.querySelector('.top').value, mine = +t.querySelector('.me').value, n = mine - top;
      var rows = [0, -1, -2].map(function (d) { var nk = ((k + n + d) % 12 + 12) % 12; return '<tr' + (d ? '' : ' class="main"') + '><td>' + (d ? '留 ' + (-d) + ' 個半音餘裕' : '最高音對齊') + '</td><td>' + (n + d > 0 ? '+' : '') + (n + d) + ' 半音</td><td><b>' + KEYS[nk] + ' 調</b></td><td>' + shape(nk) + '</td></tr>'; }).join('');
      out.innerHTML = '<table><tr><th>方案</th><th>移調</th><th>自定調</th><th>吉他</th></tr>' + rows + '</table>';
      t._last = { key: KEYS[k], top: nameOf(top).name, mine: nameOf(mine).name, n: n, result: KEYS[((k + n) % 12 + 12) % 12] };
    }
    $$('select', t).forEach(function (s) { s.onchange = calc; });
    var sv = btn('記錄這首的自定調', 'primary'); t.appendChild(sv);
    sv.onclick = function () { var r = t._last; report(t, 'transpose', { item: '原調 ' + r.key + '、最高音 ' + r.top, result: r.result + ' 調（' + (r.n > 0 ? '+' : '') + r.n + ' 半音）', value: r.n, detail: r }); say('已記錄自定調', 'ok'); };
    calc();
  });
});
