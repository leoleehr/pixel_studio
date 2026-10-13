/* ===== Guitar Lab：課程資料、自製插圖、和弦圖、調音器與練習器 =====
 * 需先載入 ../assets/ps-audio.js。在投影片中以 data 屬性宣告，載入時自動建立：
 *   [data-gfig="anatomy|family-*|bodies|sizes|laminate|bracing|truss|tuning|posture|pick|hands"]
 *   [data-diagram="C"]  [data-chord-cards]  [data-switch-trainer]  [data-strum-player]  [data-tuner]
 * 練習結果經 PixelBackend（backend.js）記錄；沒有載入時略過。
 */
(function (PS) {
  'use strict';
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return [].slice.call((r || document).querySelectorAll(s)); }
  function el(tag, attrs, html) { var e = document.createElement(tag); for (var k in attrs || {}) e.setAttribute(k, attrs[k]); if (html != null) e.innerHTML = html; return e; }
  function slideNo(n) { var s = n && n.closest && n.closest('.slide'); return s && s.id ? s.id.replace(/\D/g, '') : ''; }
  function report(n, type, data) { if (window.PixelBackend) window.PixelBackend.log(type, data, { slide: slideNo(n) }); }

  /* ---------- 課程資料 ---------- */
  var CHORDS = {
    C:  { name: 'C',  zh: 'C 大三和弦', degree: 'I',  frets: [-1, 3, 2, 0, 1, 0], fingers: [0, 3, 2, 0, 1, 0],
          tip: '6 弦不彈。無名指壓 5 弦第 3 格，指尖立起來，別碰到 4 弦。' },
    G:  { name: 'G',  zh: 'G 大三和弦', degree: 'V',  frets: [3, 2, 0, 0, 0, 3], fingers: [2, 1, 0, 0, 0, 3],
          tip: '六條弦都彈。中指 6 弦、食指 5 弦、無名指 1 弦，手腕放低一點。' },
    Am: { name: 'Am', zh: 'A 小三和弦', degree: 'vi', frets: [-1, 0, 2, 2, 1, 0], fingers: [0, 0, 2, 3, 1, 0],
          tip: '和 C 只差一根手指：無名指從 5 弦移到 3 弦，食指、中指不動。' },
    F:  { name: 'F',  zh: 'F 大三和弦（小 F）', degree: 'IV', frets: [-1, -1, 3, 2, 1, 1], fingers: [0, 0, 3, 2, 1, 1], barre: { fret: 1, from: 4, to: 5 },
          tip: '只彈 4 到 1 弦。食指平壓 1、2 弦第 1 格。完整封閉 F 留到第 8 章。' },
    Em: { name: 'Em', zh: 'E 小三和弦', degree: 'iii', frets: [0, 2, 2, 0, 0, 0], fingers: [0, 2, 3, 0, 0, 0], tip: '' },
    open: { name: '空弦', zh: '六條空弦', degree: '', frets: [0, 0, 0, 0, 0, 0], fingers: [0, 0, 0, 0, 0, 0], tip: '' }
  };
  var PROGRESSIONS = [
    { id: 'pop', label: 'C → G → Am → F', seq: ['C', 'G', 'Am', 'F'] },
    { id: 'fifties', label: 'C → Am → F → G', seq: ['C', 'Am', 'F', 'G'] },
    { id: 'minor', label: 'Am → F → C → G', seq: ['Am', 'F', 'C', 'G'] }
  ];
  /* 每拍兩格；D 下刷、U 上刷、d／u 空刷（手照常擺動但不碰弦） */
  var PATTERNS = {
    Q: { name: '四分音符 下刷', cells: ['D', 'u', 'D', 'u', 'D', 'u', 'D', 'u'], desc: '每一拍往下刷一次，手在半拍時回到上方準備。' },
    A: { name: '八分音符 8 Beats', cells: ['D', 'U', 'D', 'U', 'D', 'U', 'D', 'U'], desc: '拍點往下、半拍往上，八下平均。' },
    B: { name: '切分 Folk Rock', cells: ['D', 'u', 'D', 'U', 'd', 'U', 'D', 'U'], desc: '第 3 拍的下刷空過去不碰弦，重音往前推。口訣：下、下上、上下上。' }
  };
  var COUNTS = ['1', '&', '2', '&', '3', '&', '4', '&'];
  var OPEN = [{ n: 'E', o: 2, f: 82.41 }, { n: 'A', o: 2, f: 110 }, { n: 'D', o: 3, f: 146.83 }, { n: 'G', o: 3, f: 196 }, { n: 'B', o: 3, f: 246.94 }, { n: 'E', o: 4, f: 329.63 }];
  PS.guitar = { CHORDS: CHORDS, PATTERNS: PATTERNS };

  /* ---------- 共用：吉他剪影 ---------- */
  // 依參數畫出琴身外型（中心 cx、頂端 y0、長 L、上寬 uw、腰寬 ww、下寬 lw、腰位 wp）
  function bodyPath(cx, y0, L, uw, ww, lw, wp) {
    var u = uw / 2, w = ww / 2, l = lw / 2, wy = y0 + L * (wp || 0.42);
    var L1 = function (s) {
      return 'C' + (cx + s * u * 0.62) + ',' + y0 + ' ' + (cx + s * u) + ',' + (y0 + L * 0.06) + ' ' + (cx + s * u) + ',' + (y0 + L * 0.2) +
        ' C' + (cx + s * u) + ',' + (y0 + L * 0.3) + ' ' + (cx + s * w) + ',' + (wy - L * 0.07) + ' ' + (cx + s * w) + ',' + wy +
        ' C' + (cx + s * w) + ',' + (wy + L * 0.08) + ' ' + (cx + s * l) + ',' + (y0 + L * 0.56) + ' ' + (cx + s * l) + ',' + (y0 + L * 0.72) +
        ' C' + (cx + s * l) + ',' + (y0 + L * 0.93) + ' ' + (cx + s * l * 0.5) + ',' + (y0 + L) + ' ' + cx + ',' + (y0 + L);
    };
    // 左半邊順時針到底部，再沿右半邊回到頂端
    return 'M' + cx + ',' + y0 + ' ' + L1(-1) + ' ' + reverseHalf(cx, y0, L, u, w, l, wy) + ' Z';
  }
  function reverseHalf(cx, y0, L, u, w, l, wy) {
    return 'C' + (cx + l * 0.5) + ',' + (y0 + L) + ' ' + (cx + l) + ',' + (y0 + L * 0.93) + ' ' + (cx + l) + ',' + (y0 + L * 0.72) +
      ' C' + (cx + l) + ',' + (y0 + L * 0.56) + ' ' + (cx + w) + ',' + (wy + L * 0.08) + ' ' + (cx + w) + ',' + wy +
      ' C' + (cx + w) + ',' + (wy - L * 0.07) + ' ' + (cx + u) + ',' + (y0 + L * 0.3) + ' ' + (cx + u) + ',' + (y0 + L * 0.2) +
      ' C' + (cx + u) + ',' + (y0 + L * 0.06) + ' ' + (cx + u * 0.62) + ',' + y0 + ' ' + cx + ',' + y0;
  }
  // 小型吉他剪影（家族卡、尺寸圖用），viewBox 0 0 100 160
  function miniGuitar(o) {
    o = o || {};
    var s = '<svg class="gfig" viewBox="0 0 100 160" aria-hidden="true">';
    var top = o.bodyTop || 62, L = o.bodyLen || 92, neckW = o.neckW || 9;
    // 琴頭
    if (o.head === 'slot') s += '<rect x="42" y="4" width="16" height="22" rx="2" class="wood2"/><rect x="45.5" y="8" width="2.6" height="14" class="hole"/><rect x="51.9" y="8" width="2.6" height="14" class="hole"/>';
    else if (o.head === 'strat') s += '<path d="M46 4 C58 2 62 8 58 14 L56 28 L45 28 Z" class="' + (o.headCls || 'wood3') + '"/>';
    else s += '<path d="M43 4 H57 L56 27 H44 Z" class="dark"/>';
    for (var i = 0; i < 3; i++) if (o.head !== 'strat') s += '<circle cx="40" cy="' + (9 + i * 6) + '" r="2" class="metal"/><circle cx="60" cy="' + (9 + i * 6) + '" r="2" class="metal"/>';
    // 琴頸與指板
    s += '<rect x="' + (50 - neckW / 2) + '" y="26" width="' + neckW + '" height="' + (top - 22) + '" class="dark"/>';
    // 琴身
    if (o.kind === 'electric') {
      s += '<path d="M50 58 C40 56 33 50 28 54 C24 58 30 66 30 74 C30 84 18 92 18 112 C18 136 34 150 50 150 C66 150 82 136 82 112 C82 94 70 86 70 76 C70 66 78 58 74 54 C70 50 60 56 50 58 Z" class="' + (o.color || 'acc') + '"/>' +
        '<path d="M38 70 C44 74 56 74 62 70 L64 120 C56 126 44 126 36 120 Z" class="bone" opacity=".9"/>' +
        '<rect x="40" y="84" width="20" height="4" rx="2" class="dark"/><rect x="40" y="98" width="20" height="4" rx="2" class="dark"/><rect x="40" y="112" width="20" height="4" rx="2" class="dark"/>' +
        '<rect x="42" y="132" width="16" height="4" class="metal"/>';
    } else if (o.kind === 'banjo') {
      s += '<circle cx="50" cy="114" r="34" class="metal"/><circle cx="50" cy="114" r="29" class="bone"/><rect x="40" y="126" width="20" height="3" class="wood2"/>';
    } else if (o.kind === 'mandolin') {
      s += '<path d="M50 76 C30 76 22 100 26 120 C30 140 42 150 50 150 C58 150 70 140 74 120 C78 100 70 76 50 76 Z" class="wood"/><path d="M42 104 h16 l-2 6 h-12 Z" class="hole"/>';
    } else if (o.kind === 'lap') {
      s = '<svg class="gfig" viewBox="0 0 100 160" aria-hidden="true"><rect x="36" y="8" width="28" height="146" rx="6" class="' + (o.color || 'wood2') + '"/><rect x="40" y="30" width="20" height="96" class="dark"/>' +
        [0, 1, 2, 3, 4, 5].map(function (k) { return '<line x1="' + (42 + k * 3.2) + '" x2="' + (42 + k * 3.2) + '" y1="12" y2="146" stroke="#ddd" stroke-width=".6"/>'; }).join('') +
        '<rect x="38" y="128" width="24" height="10" class="metal"/><rect x="30" y="70" width="40" height="7" rx="3.5" class="metal" transform="rotate(-8 50 73)"/>';
      return s + '</svg>';
    } else {
      s += '<path d="' + bodyPath(50, top, L, o.uw || 48, o.ww || 36, o.lw || 62, o.wp) + '" class="' + (o.color || 'wood') + '" stroke="#efe8d6" stroke-width="1.6"/>';
      s += '<circle cx="50" cy="' + (top + L * 0.36) + '" r="' + (o.hole || 9) + '" class="hole"/>';
      if (o.pickguard) s += '<path d="M58 ' + (top + L * 0.4) + ' C66 ' + (top + L * 0.42) + ' 70 ' + (top + L * 0.56) + ' 62 ' + (top + L * 0.6) + ' C58 ' + (top + L * 0.62) + ' 56 ' + (top + L * 0.52) + ' 58 ' + (top + L * 0.4) + ' Z" class="' + (o.pickguard === 'clear' ? 'bone' : 'dark') + '" opacity="' + (o.pickguard === 'clear' ? '.35' : '1') + '"/>';
      s += '<rect x="40" y="' + (top + L * 0.7) + '" width="20" height="4" rx="1" class="dark"/>';
    }
    // 弦
    var n = o.strings || 6, x0 = 50 - (neckW / 2 - 1.5), dx = (neckW - 3) / (n - 1), end = o.kind === 'electric' ? 134 : o.kind === 'banjo' ? 128 : o.kind === 'mandolin' ? 136 : top + L * 0.72;
    for (var k = 0; k < n; k++) s += '<line x1="' + (x0 + k * dx) + '" x2="' + (x0 + k * dx) + '" y1="26" y2="' + end + '" stroke="#e8e4da" stroke-width=".5"/>';
    return s + '</svg>';
  }
  var FAMILY = {
    classical: { head: 'slot', uw: 46, ww: 34, lw: 58, color: 'wood3' },
    flamenco: { head: 'slot', uw: 46, ww: 34, lw: 58, color: 'wood3', pickguard: 'clear' },
    folk: { uw: 52, ww: 42, lw: 66, pickguard: true, color: 'wood3' },
    electric: { kind: 'electric', head: 'strat', color: 'acc' },
    steel: { kind: 'lap' },
    ukulele: { bodyTop: 84, bodyLen: 66, uw: 34, ww: 26, lw: 44, strings: 4, hole: 6, neckW: 7 },
    banjo: { kind: 'banjo', strings: 5 },
    mandolin: { kind: 'mandolin', strings: 8, neckW: 7 }
  };

  /* ---------- 吉他構造圖 ---------- */
  var PARTS = [
    { id: 'head', zh: '琴頭', en: 'Headstock', x: 150, y: 52, d: '固定旋鈕的位置。品牌標誌通常在這裡。' },
    { id: 'tuner', zh: '旋鈕', en: 'Tuning Machines', x: 98, y: 58, d: '固定琴弦並轉緊、轉鬆來調音。品質好的旋鈕齒輪精密、不易跑音，常見全封閉（油壓）式與開放式。' },
    { id: 'nut', zh: '上弦枕', en: 'Nut', x: 196, y: 112, t: [172, 112], d: '固定六條弦的間距。材質越硬，振動損耗越少，常見牛骨、塑膠、Tusq。' },
    { id: 'board', zh: '指板', en: 'Fretboard', x: 98, y: 214, t: [136, 214], d: '左手按弦的接觸面，常用玫瑰木、黑檀木或楓木。木材越硬越耐磨。' },
    { id: 'fret', zh: '琴衍（琴格）', en: 'Frets', x: 196, y: 168, t: [168, 168], d: '指板上的金屬條。按在兩條琴衍之間，弦長就固定在前一條琴衍，發出穩定的音高。' },
    { id: 'inlay', zh: '指板記號', en: 'Position Markers', x: 98, y: 290, t: [150, 290], d: '標在第 3、5、7、9、12 格，讓你一眼找到位置；第 12 格是兩個點，正好是空弦的高八度。' },
    { id: 'neck', zh: '琴頸', en: 'Neck', x: 196, y: 262, t: [172, 262], d: '連接琴頭與琴身，裡面藏著調整彎度的鋼筋（Truss Rod）。' },
    { id: 'top', zh: '面板', en: 'Top', x: 64, y: 590, d: '琴身正面的板子，是音色最主要的來源。面板振動，把弦的能量變成你聽到的聲音。' },
    { id: 'hole', zh: '響孔', en: 'Sound Hole', x: 150, y: 456, d: '琴身內的空氣從這裡進出共鳴，把聲音送出來。' },
    { id: 'rosette', zh: '響孔邊飾', en: 'Rosette', x: 205, y: 420, t: [182, 432], d: '響孔外圈的裝飾，同時補強響孔邊緣。用料有塑膠、木片或貝殼。' },
    { id: 'guard', zh: '防刮板', en: 'Pickguard', x: 232, y: 512, t: [200, 500], d: '保護面板，避免刷弦時彈片刮傷。' },
    { id: 'bridge', zh: '琴橋', en: 'Bridge', x: 92, y: 548, t: [112, 556], d: '黏在面板上，承受琴弦的拉力，把振動傳到面板。' },
    { id: 'saddle', zh: '下弦枕', en: 'Saddle', x: 150, y: 520, t: [150, 549], d: '弦振動的終點，把振動傳進琴橋與面板。高度決定弦距（弦與指板的距離）。' },
    { id: 'pin', zh: '弦釘', en: 'Bridge Pins', x: 210, y: 572, t: [182, 560], d: '把弦尾固定在琴橋的小釘子。換弦時才會拔起來。' },
    { id: 'binding', zh: '琴身邊飾', en: 'Binding', x: 284, y: 560, d: '琴身邊緣的封邊，保護接縫，也看得出做工。' },
    { id: 'side', zh: '側板與背板', en: 'Sides & Back', x: 30, y: 400, d: '琴身的側面與背面，和面板一起圍出共鳴箱，影響低音厚度與餘韻。' }
  ];
  function fretY(n) { return 108 + 442 * (1 - Math.pow(2, -n / 12)); }
  function anatomySVG() {
    var s = '<svg class="gfig" viewBox="0 0 310 650" role="img" aria-label="木吉他正面構造圖，共 16 個部位">';
    // 琴頭與旋鈕
    s += '<path d="M126 108 L120 18 Q150 6 180 18 L174 108 Z" class="dark"/>';
    [32, 60, 88].forEach(function (y) {
      s += '<rect x="106" y="' + (y - 5) + '" width="16" height="10" rx="2" class="metal"/><ellipse cx="102" cy="' + y + '" rx="6" ry="9" class="bone"/>' +
        '<rect x="178" y="' + (y - 5) + '" width="16" height="10" rx="2" class="metal"/><ellipse cx="198" cy="' + y + '" rx="6" ry="9" class="bone"/>' +
        '<circle cx="133" cy="' + y + '" r="3.2" class="metal"/><circle cx="167" cy="' + y + '" r="3.2" class="metal"/>';
    });
    // 琴身（邊飾＋面板）
    s += '<path d="' + bodyPath(150, 300, 336, 214, 176, 262, 0.44) + '" class="wood3" stroke="#efe8d6" stroke-width="5"/>';
    // 琴頸、指板、琴衍、記號
    s += '<rect x="128" y="104" width="44" height="232" class="wood2"/><rect x="130" y="106" width="40" height="312" class="dark"/>';
    s += '<rect x="128" y="105" width="44" height="6" class="bone"/>';
    for (var n = 1; n <= 20; n++) s += '<line x1="130" x2="170" y1="' + fretY(n) + '" y2="' + fretY(n) + '" stroke="#c9ccd1" stroke-width="1.6"/>';
    [3, 5, 7, 9, 15, 17].forEach(function (n) { s += '<circle cx="150" cy="' + ((fretY(n) + fretY(n - 1)) / 2) + '" r="3.4" class="bone"/>'; });
    s += '<circle cx="142" cy="' + ((fretY(12) + fretY(11)) / 2) + '" r="3.4" class="bone"/><circle cx="158" cy="' + ((fretY(12) + fretY(11)) / 2) + '" r="3.4" class="bone"/>';
    // 響孔、邊飾、防刮板
    s += '<circle cx="150" cy="456" r="44" fill="none" stroke="#2a2622" stroke-width="6"/><circle cx="150" cy="456" r="44" fill="none" stroke="#e2c48f" stroke-width="1.5" stroke-dasharray="3 3"/><circle cx="150" cy="456" r="35" class="hole"/>';
    s += '<path d="M190 470 C214 470 232 498 222 526 C214 546 192 540 184 520 C178 504 180 482 190 470 Z" class="dark" opacity=".92"/>';
    // 琴橋、下弦枕、弦釘
    s += '<path d="M104 546 Q150 536 196 546 L196 566 Q150 574 104 566 Z" class="wood2"/><rect x="118" y="547" width="64" height="4" rx="2" class="bone"/>';
    for (var k = 0; k < 6; k++) s += '<circle cx="' + (130 + k * 8) + '" cy="560" r="2.6" class="bone"/>';
    // 弦
    for (var j = 0; j < 6; j++) s += '<line x1="' + (134.5 + j * 6.2) + '" x2="' + (130 + j * 8) + '" y1="108" y2="549" stroke="#e8e4da" stroke-width="' + (1.3 - j * 0.15) + '"/>' +
      '<line x1="' + (134.5 + j * 6.2) + '" x2="' + (j < 3 ? 133 : 167) + '" y1="108" y2="' + [88, 60, 32, 32, 60, 88][j] + '" stroke="#e8e4da" stroke-width=".8"/>';
    // 標號
    PARTS.forEach(function (p, i) {
      s += '<g class="hot" data-part="' + i + '" tabindex="0" role="button" aria-label="' + p.zh + '">' +
        (p.t ? '<line x1="' + p.x + '" y1="' + p.y + '" x2="' + p.t[0] + '" y2="' + p.t[1] + '" class="lead"/><circle cx="' + p.t[0] + '" cy="' + p.t[1] + '" r="2.6" class="dot"/>' : '') +
        '<circle cx="' + p.x + '" cy="' + p.y + '" r="12"/><text x="' + p.x + '" y="' + (p.y + 4.5) + '" class="n">' + (i + 1) + '</text></g>';
    });
    return s + '</svg>';
  }
  function mountAnatomy(root) {
    root.classList.add('anatomy');
    root.innerHTML = '<div>' + anatomySVG() + '</div><div class="part-info" aria-live="polite"></div>';
    var info = $('.part-info', root), chips = el('div', { class: 'part-chips' });
    PARTS.forEach(function (p, i) { var b = el('button', { type: 'button', 'data-part': i }, (i + 1) + ' ' + p.zh); chips.appendChild(b); });
    var seen = {};
    function show(i) {
      var p = PARTS[i];
      info.innerHTML = '<div class="pi-no">' + String(i + 1).padStart(2, '0') + ' / ' + PARTS.length + '</div><h3>' + p.zh + '</h3><div class="pi-en">' + p.en + '</div><p>' + p.d + '</p>';
      info.appendChild(chips);
      $$('[data-part]', root).forEach(function (n) { n.classList.toggle('on', +n.getAttribute('data-part') === i); });
      seen[i] = 1;
      if (Object.keys(seen).length === PARTS.length) report(root, 'interaction', { item: '吉他構造', result: '看完 16 個部位' });
    }
    root.addEventListener('click', function (e) { var t = e.target.closest('[data-part]'); if (t) show(+t.getAttribute('data-part')); });
    root.addEventListener('keydown', function (e) { var t = e.target.closest('.hot'); if (t && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); show(+t.getAttribute('data-part')); } });
    show(0);
  }

  /* ---------- 筒身、尺寸、合板／單板、力木、鋼筋 ---------- */
  var BODIES = [
    { id: 'Jumbo', zh: '巨無霸', p: [54, 38, 76, 0.4], L: 104, d: '下半部最寬、腰最細，外型像葫蘆。低音飽滿、音量最大，適合刷奏伴奏。' },
    { id: 'Dreadnought', zh: '無畏艦（D 桶）', p: [56, 50, 70, 0.44], L: 100, d: '最常見的筒身，肩膀方正、腰線淺。音量大、頻率平均，民謠彈唱的標準選擇。' },
    { id: 'Grand Auditorium', zh: '大音樂廳（GA）', p: [52, 40, 68, 0.42], L: 100, d: '介於 D 桶與小桶之間，中頻清楚。刷奏、指彈都好用，Taylor 的代表筒身。' },
    { id: 'Auditorium', zh: '音樂廳（OM／000）', p: [48, 36, 64, 0.42], L: 96, d: '腰細、下半部寬，高低頻分明，適合指彈與錄音。' },
    { id: 'Grand Concert', zh: '大音樂會（GC）', p: [44, 33, 58, 0.42], L: 90, d: '琴身較小，音量不大，但高頻靈敏、反應快，適合指彈與主奏。' },
    { id: 'Concert', zh: '音樂會', p: [40, 30, 54, 0.42], L: 86, d: '最小最輕的筒身，抱起來最舒服，適合身形嬌小或常帶出門的人。' }
  ];
  function bodyOutline(b) {
    return '<svg class="gfig" viewBox="0 0 90 112" aria-hidden="true"><path d="' + bodyPath(45, 110 - b.L, b.L, b.p[0], b.p[1], b.p[2], b.p[3]) + '" class="wood3" stroke="#efe8d6" stroke-width="1.4"/><circle cx="45" cy="' + (110 - b.L + b.L * 0.36) + '" r="7.5" class="hole"/></svg>';
  }
  function mountBodies(root) {
    root.innerHTML = '<div class="bodies">' + BODIES.map(function (b, i) {
      return '<div class="b" data-b="' + i + '" tabindex="0" role="button">' + bodyOutline(b) + '<b>' + b.id + '</b><small>' + b.zh + '</small></div>';
    }).join('') + '</div><p class="body-note card" aria-live="polite"></p>';
    var note = $('.body-note', root);
    function show(i) { $$('.b', root).forEach(function (n, k) { n.classList.toggle('on', k === i); }); note.innerHTML = '<b>' + BODIES[i].id + '｜' + BODIES[i].zh + '</b>　' + BODIES[i].d; }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-b]'); if (b) show(+b.getAttribute('data-b')); });
    root.addEventListener('keydown', function (e) { var b = e.target.closest('[data-b]'); if (b && e.key === 'Enter') show(+b.getAttribute('data-b')); });
    show(1);
  }
  function sizesHTML() {
    return '<div class="sizes">' + [['1/4', '2–5 歲', 0.55], ['1/2', '5–8 歲', 0.68], ['3/4', '8–12 歲', 0.82], ['Full', '12 歲以上', 1]].map(function (z) {
      return '<div style="--h:' + Math.round(z[2] * 230) + 'px">' + miniGuitar(FAMILY.folk) + '<b>' + z[0] + '</b><span>' + z[1] + '</span></div>';
    }).join('') + '</div>';
  }
  function laminateSVG() {
    var s = '<svg class="gfig" viewBox="0 0 600 200" role="img" aria-label="合板與單板面板的剖面比較">';
    s += '<text x="10" y="22" class="big">合板 Laminated</text><text x="330" y="22" class="big">單板 Solid</text>';
    s += '<rect x="10" y="38" width="230" height="16" class="wood3"/><rect x="10" y="54" width="230" height="30" class="wood2"/><rect x="10" y="84" width="230" height="16" class="wood3"/>';
    for (var i = 0; i < 40; i++) s += '<circle cx="' + (16 + (i * 37) % 224) + '" cy="' + (60 + (i * 13) % 20) + '" r="1.8" fill="#c9a06a" opacity=".7"/>';
    s += '<text x="248" y="51" class="en">薄木片</text><text x="248" y="74" class="en">膠合夾層</text><text x="248" y="97" class="en">薄木片</text>';
    s += '<rect x="330" y="38" width="260" height="62" class="wood3"/>';
    for (var j = 0; j < 9; j++) s += '<path d="M330 ' + (43 + j * 6.5) + ' C400 ' + (39 + j * 6.5) + ' 500 ' + (49 + j * 6.5) + ' 590 ' + (43 + j * 6.5) + '" stroke="#c49a5c" stroke-width="1" fill="none"/>';
    s += '<text x="10" y="134">✓ 價格親民、不怕溫濕度變化</text><text x="10" y="162">✕ 膠層吸收振動，共鳴較弱</text>';
    s += '<text x="330" y="134">✓ 整片木頭振動，聲音通透</text><text x="330" y="162">✓ 越彈越「開」，音色會成長</text><text x="330" y="190">✕ 價格較高，需注意除濕</text>';
    return s + '</svg>';
  }
  function bracingSVG() {
    var s = '<svg class="gfig" viewBox="0 0 520 300" role="img" aria-label="民謠吉他 X 型力木與古典吉他扇形力木比較">';
    function shell(cx) { return '<path d="' + bodyPath(cx, 30, 250, 150, 118, 190, 0.43) + '" class="wood3" stroke="#efe8d6" stroke-width="3" opacity=".95"/><circle cx="' + cx + '" cy="' + (30 + 250 * 0.33) + '" r="28" fill="none" stroke="#7a4524" stroke-width="2" stroke-dasharray="4 3"/>'; }
    s += shell(130) + shell(390);
    // X 型
    s += '<path d="M78 150 L190 236 M182 150 L70 236" stroke="#7a4524" stroke-width="7" stroke-linecap="round"/><path d="M84 104 H176" stroke="#7a4524" stroke-width="6" stroke-linecap="round"/>' +
      '<path d="M96 210 L120 246 M164 210 L140 246" stroke="#7a4524" stroke-width="4" stroke-linecap="round"/>';
    // 扇形
    for (var i = -3; i <= 3; i++) s += '<path d="M390 160 L' + (390 + i * 24) + ' 262" stroke="#7a4524" stroke-width="4" stroke-linecap="round"/>';
    s += '<path d="M344 104 H436 M340 168 H440" stroke="#7a4524" stroke-width="6" stroke-linecap="round"/>';
    s += '<text x="130" y="296" class="mid big">X 型力木｜鋼弦民謠吉他</text><text x="390" y="296" class="mid big">扇形力木｜古典吉他</text>';
    return s + '</svg>';
  }
  function trussSVG() {
    var s = '<svg class="gfig" viewBox="0 0 520 170" role="img" aria-label="琴頸側面與內部鋼筋">';
    s += '<path d="M10 60 L60 54 L500 62 L500 98 L60 92 L10 96 Z" class="wood2"/><rect x="60" y="54" width="440" height="10" class="dark"/>';
    s += '<line x1="70" y1="80" x2="490" y2="80" stroke="#c9ccd1" stroke-width="3" stroke-dasharray="10 5"/><circle cx="74" cy="80" r="6" class="metal"/>';
    s += '<text x="74" y="124" class="mid">調整螺帽</text><text x="10" y="156">鋼筋 Truss Rod：抵抗琴弦拉力，讓琴頸保持微微的弧度</text>';
    s += '<text x="300" y="22" class="mid en">六條弦的拉力合計約 70 公斤</text><path d="M120 46 C250 28 380 28 480 46" class="acc-s" stroke-dasharray="4 4"/>';
    return s + '</svg>';
  }
  /* 標準調音：六條空弦與音程 */
  function tuningSVG() {
    var s = '<svg class="gfig" viewBox="0 0 560 250" role="img" aria-label="標準調音 E A D G B E，相鄰弦相差完全四度，3 弦到 2 弦相差大三度">';
    OPEN.slice().reverse().forEach(function (o, k) {
      var y = 30 + k * 38, idx = k + 1; // 上方是最細的 1 弦（與六線譜同方向）
      s += '<line x1="80" x2="520" y1="' + y + '" y2="' + y + '" stroke="#e8e4da" stroke-width="' + (0.8 + k * 0.35) + '"/>';
      s += '<text x="26" y="' + (y + 5) + '" class="big">' + idx + '</text><text x="44" y="' + (y + 5) + '" class="en">弦</text>';
      s += '<circle cx="536" cy="' + y + '" r="17" class="acc"/><text x="536" y="' + (y + 6) + '" class="n" style="font-size:16px">' + o.n + '</text>';
    });
    var gaps = ['完全四度', '完全四度', '完全四度', '大三度', '完全四度'];
    gaps.forEach(function (g, k) {
      var y = 30 + (4 - k) * 38 + 19;
      s += '<text x="300" y="' + (y + 5) + '" class="mid ' + (k === 3 ? 'big' : 'en') + '" style="' + (k === 3 ? 'fill:var(--accent)' : '') + '">' + g + '</text>';
    });
    return s + '</svg>';
  }
  /* 坐姿與持彈片 */
  function postureSVG() {
    // 正面坐姿：琴身放右大腿、琴頸往左手方向略微上揚
    return '<svg class="gfig" viewBox="0 0 420 330" role="img" aria-label="坐姿彈奏示意圖：坐椅子前三分之一，背打直，琴身放在右大腿並貼近身體，琴頸略往上">' +
      '<rect x="96" y="226" width="150" height="12" rx="4" class="dark"/><rect x="104" y="238" width="10" height="84" class="dark"/><rect x="228" y="238" width="10" height="84" class="dark"/>' +
      '<circle cx="170" cy="46" r="26" class="ln"/>' +
      '<path d="M170 72 V110 M120 96 Q170 84 220 96 M134 100 L128 214 M206 100 L212 214 M128 214 Q170 222 212 214" class="ln"/>' +
      '<path d="M134 218 L122 322 M206 218 L218 322" class="ln"/>' +
      '<g transform="translate(140 192) rotate(78)"><path d="' + bodyPath(0, -62, 124, 86, 66, 108, 0.44) + '" class="wood3" stroke="#efe8d6" stroke-width="2.5"/><circle cx="0" cy="-17" r="13" class="hole"/>' +
      '<rect x="-6" y="-210" width="12" height="150" class="dark"/><path d="M-9 -232 H9 L8 -210 H-8 Z" class="dark"/></g>' +
      '<path d="M120 100 Q96 150 128 176" class="ln"/><path d="M220 100 Q290 116 330 128" class="ln"/>' +
      '<text x="270" y="36" class="big" style="fill:var(--accent)">✓</text><text x="290" y="36">背打直</text>' +
      '<text x="270" y="70" class="big" style="fill:var(--accent)">✓</text><text x="290" y="70">琴頸略往上</text>' +
      '<text x="270" y="232" class="big" style="fill:var(--accent)">✓</text><text x="290" y="232">琴身貼近身體</text>' +
      '<text x="270" y="266" class="big" style="fill:var(--accent)">✓</text><text x="290" y="266">坐椅子前 1/3</text>' +
      '</svg>';
  }
  function pickSVG() {
    return '<svg class="gfig" viewBox="0 0 440 200" role="img" aria-label="持彈片：彈片放在食指第一節側面，拇指壓在上方，尖端露出約 2 到 3 公釐">' +
      '<rect x="20" y="48" width="190" height="44" rx="22" class="wood3" opacity=".75"/>' +
      '<path d="M88 60 Q120 50 152 60 Q150 100 124 150 Q118 156 114 150 Q92 104 88 60 Z" class="acc"/>' +
      '<rect x="60" y="34" width="150" height="40" rx="20" class="bone" opacity=".95"/>' +
      '<text x="250" y="52">拇指壓在彈片上方</text><text x="250" y="96">食指第一節側面托住</text><text x="250" y="150">尖端只露 2–3 mm</text>' +
      '<path d="M246 48 L200 52 M246 92 L206 84 M246 146 L132 144" class="lead"/>' +
      '</svg>';
  }
  function handsSVG() {
    var L = [['1', '食指'], ['2', '中指'], ['3', '無名指'], ['4', '小指']], R = [['T', '拇指', '4–6 弦'], ['1', '食指', '3 弦'], ['2', '中指', '2 弦'], ['3', '無名指', '1 弦']];
    var s = '<svg class="gfig" viewBox="0 0 520 190" role="img" aria-label="左右手的手指編號">';
    s += '<text x="10" y="24" class="big">左手 按弦</text><text x="280" y="24" class="big">右手 撥弦（指法）</text>';
    L.forEach(function (f, i) { var x = 30 + i * 58; s += '<circle cx="' + x + '" cy="80" r="22" class="acc"/><text x="' + x + '" y="86" class="n" style="font-size:18px">' + f[0] + '</text><text x="' + x + '" y="128" class="mid">' + f[1] + '</text>'; });
    R.forEach(function (f, i) { var x = 300 + i * 60; s += '<circle cx="' + x + '" cy="80" r="22" class="metal"/><text x="' + x + '" y="86" class="n" style="font-size:18px">' + f[0] + '</text><text x="' + x + '" y="128" class="mid">' + f[1] + '</text><text x="' + x + '" y="152" class="mid en">' + f[2] + '</text>'; });
    return s + '</svg>';
  }
  /* 演變：烏德琴 → 魯特琴 → 比維拉琴 → 四組弦 → 五組弦 → 六弦吉他 */
  function evolutionSVG() {
    var W = 170, items = [
      ['烏德琴', 'Oud', function (x) { return '<path d="M' + x + ' 92 C' + (x - 46) + ' 92 ' + (x - 52) + ' 168 ' + x + ' 182 C' + (x + 52) + ' 168 ' + (x + 46) + ' 92 ' + x + ' 92 Z" class="wood"/><rect x="' + (x - 5) + '" y="44" width="10" height="52" class="wood2"/><path d="M' + (x - 5) + ' 46 L' + (x + 22) + ' 22 L' + (x + 28) + ' 28 L' + (x + 5) + ' 50 Z" class="wood2"/><circle cx="' + x + '" cy="132" r="8" class="hole"/>'; }],
      ['魯特琴', 'Lute', function (x) { return '<path d="M' + x + ' 100 C' + (x - 42) + ' 100 ' + (x - 48) + ' 170 ' + x + ' 182 C' + (x + 48) + ' 170 ' + (x + 42) + ' 100 ' + x + ' 100 Z" class="wood3"/><rect x="' + (x - 5) + '" y="30" width="10" height="74" class="dark"/><path d="M' + (x - 5) + ' 32 L' + (x + 26) + ' 34 L' + (x + 26) + ' 42 L' + (x - 5) + ' 40 Z" class="wood2"/><circle cx="' + x + '" cy="138" r="10" fill="none" stroke="#7a4524" stroke-width="2" stroke-dasharray="2 2"/>'; }],
      ['比維拉琴', 'Vihuela', function (x) { return '<path d="' + bodyPath(x, 100, 82, 46, 34, 56, 0.45) + '" class="wood3"/><rect x="' + (x - 5) + '" y="22" width="10" height="82" class="dark"/><rect x="' + (x - 8) + '" y="10" width="16" height="16" class="wood2"/><circle cx="' + (x - 10) + '" cy="124" r="5" class="hole"/><circle cx="' + (x + 10) + '" cy="124" r="5" class="hole"/>'; }],
      ['四組弦吉他', 'Renaissance', function (x) { return '<path d="' + bodyPath(x, 112, 70, 40, 30, 50, 0.45) + '" class="wood"/><rect x="' + (x - 5) + '" y="52" width="10" height="64" class="dark"/><rect x="' + (x - 8) + '" y="38" width="16" height="16" class="wood2"/><circle cx="' + x + '" cy="138" r="7" class="hole"/>'; }],
      ['五組弦吉他', 'Baroque', function (x) { return '<path d="' + bodyPath(x, 104, 78, 42, 30, 52, 0.45) + '" class="wood"/><rect x="' + (x - 5) + '" y="36" width="10" height="72" class="dark"/><rect x="' + (x - 8) + '" y="20" width="16" height="18" class="wood2"/><circle cx="' + x + '" cy="134" r="8" class="hole"/><circle cx="' + x + '" cy="134" r="11" fill="none" stroke="#e2c48f" stroke-width="1.5"/>'; }],
      ['六弦吉他', 'Modern', function (x) { return '<path d="' + bodyPath(x, 92, 92, 52, 38, 66, 0.44) + '" class="wood3" stroke="#efe8d6" stroke-width="2"/><rect x="' + (x - 5) + '" y="26" width="10" height="70" class="dark"/><rect x="' + (x - 8) + '" y="6" width="16" height="22" class="wood2"/><circle cx="' + x + '" cy="125" r="10" class="hole"/>'; }]
    ];
    var s = '<svg class="gfig" viewBox="0 0 ' + (W * items.length) + ' 236" role="img" aria-label="吉他的演變：烏德琴、魯特琴、比維拉琴、四組弦吉他、五組弦吉他、六弦吉他">';
    items.forEach(function (it, i) {
      var x = W * i + W / 2;
      s += it[2](x);
      s += '<text x="' + x + '" y="210" class="mid big">' + it[0] + '</text><text x="' + x + '" y="230" class="mid en">' + it[1] + '</text>';
      if (i < items.length - 1) s += '<path d="M' + (x + 62) + ' 140 h40 m-8 -6 l8 6 l-8 6" class="lead"/>';
    });
    return s + '</svg>';
  }
  var FIGS = { anatomy: mountAnatomy, bodies: mountBodies, evolution: function (n) { n.innerHTML = evolutionSVG(); },
    sizes: function (n) { n.innerHTML = sizesHTML(); }, laminate: function (n) { n.innerHTML = laminateSVG(); },
    bracing: function (n) { n.innerHTML = bracingSVG(); }, truss: function (n) { n.innerHTML = trussSVG(); },
    tuning: function (n) { n.innerHTML = tuningSVG(); }, posture: function (n) { n.innerHTML = postureSVG(); },
    pick: function (n) { n.innerHTML = pickSVG(); }, hands: function (n) { n.innerHTML = handsSVG(); } };
  $$('[data-gfig]').forEach(function (n) {
    var k = n.getAttribute('data-gfig');
    if (FIGS[k]) FIGS[k](n);
    else if (k.indexOf('family-') === 0) n.innerHTML = miniGuitar(FAMILY[k.slice(7)]);
  });

  /* ---------- 和弦圖 ---------- */
  function diagram(key, opts) {
    var c = CHORDS[key], o = opts || {};
    var x0 = 22, dx = 16, y0 = 34, dy = 24, frets = 4, w = x0 * 2 + dx * 5, h = y0 + dy * frets + 14;
    var s = '<svg class="chord-svg" viewBox="0 0 ' + w + ' ' + h + '" role="img" aria-label="' + c.zh + ' 和弦圖">';
    s += '<rect x="' + x0 + '" y="' + (y0 - 4) + '" width="' + dx * 5 + '" height="4" class="nut"/>';
    for (var f = 1; f <= frets; f++) s += '<line x1="' + x0 + '" x2="' + (x0 + dx * 5) + '" y1="' + (y0 + dy * f) + '" y2="' + (y0 + dy * f) + '" class="fret"/>';
    for (var i = 0; i < 6; i++) s += '<line x1="' + (x0 + dx * i) + '" x2="' + (x0 + dx * i) + '" y1="' + y0 + '" y2="' + (y0 + dy * frets) + '" class="string" style="stroke-width:' + (1.8 - i * 0.2) + '"/>';
    if (c.barre) {
      var bx1 = x0 + dx * c.barre.from, bx2 = x0 + dx * c.barre.to, by = y0 + dy * (c.barre.fret - 0.5);
      s += '<rect x="' + (bx1 - 7) + '" y="' + (by - 7) + '" width="' + (bx2 - bx1 + 14) + '" height="14" rx="7" class="dot"/>';
    }
    c.frets.forEach(function (fr, i) {
      var x = x0 + dx * i;
      if (fr < 0) s += '<text x="' + x + '" y="' + (y0 - 12) + '" class="mark">×</text>';
      else if (fr === 0) s += '<circle cx="' + x + '" cy="' + (y0 - 16) + '" r="4.5" class="open"/>';
      else {
        var y = y0 + dy * (fr - 0.5), inBarre = c.barre && fr === c.barre.fret && i > c.barre.from && i <= c.barre.to;
        if (!inBarre) s += '<circle cx="' + x + '" cy="' + y + '" r="7" class="dot"/>';
        if (!o.noFingers && c.fingers[i] && !inBarre) s += '<text x="' + x + '" y="' + (y + 3.6) + '" class="finger">' + c.fingers[i] + '</text>';
      }
    });
    if (o.strings) for (var j = 0; j < 6; j++) s += '<text x="' + (x0 + dx * j) + '" y="' + (h - 1) + '" class="snum">' + (6 - j) + '</text>';
    return s + '</svg>';
  }
  PS.guitar.diagram = diagram;
  $$('[data-diagram]').forEach(function (n) { n.innerHTML = diagram(n.getAttribute('data-diagram'), { strings: n.hasAttribute('data-strings') }); });
  $$('[data-chord-cards]').forEach(function (root) {
    var keys = (root.getAttribute('data-chord-cards') || 'C G Am F').split(/\s+/);
    root.classList.add('chord-row');
    root.innerHTML = keys.map(function (k) {
      var c = CHORDS[k];
      return '<div class="card chord-card"><div class="ch-head"><b>' + c.name + '</b><span>' + (c.degree ? 'C 調 ' + c.degree + ' 級' : '') + '</span></div><div class="fig">' + diagram(k, { strings: true }) + '</div><p>' + c.tip + '</p><button type="button" class="btn" data-hear="' + k + '">▶ 聽聽看</button></div>';
    }).join('');
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-hear]'), a = b && PS.audio.ctx(); if (!a) return;
      PS.audio.strum(CHORDS[b.getAttribute('data-hear')].frets, a.currentTime + 0.02, 'down', { duration: 2.2, gap: 0.03 });
    });
  });

  /* ---------- 控制元件 ---------- */
  var active = null;
  function claim(stopFn) { if (active && active !== stopFn) active(); active = stopFn; }
  document.addEventListener('slide:change', function () { if (active) active(); });
  function seg(name, options, current, onChange) {
    var wrap = el('div', { class: 'seg', role: 'group', 'aria-label': name });
    options.forEach(function (op) {
      var b = el('button', { type: 'button', 'aria-pressed': String(op[0] === current) }, op[1]);
      b.addEventListener('click', function () { $$('button', wrap).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); }); b.setAttribute('aria-pressed', 'true'); onChange(op[0]); });
      wrap.appendChild(b);
    });
    return wrap;
  }
  function field(label, node) { var f = el('span', { class: 'field' }, label); if (node) f.appendChild(node); return f; }
  function bpmField(min, max, value, onInput) {
    var f = el('label', { class: 'field' }, '速度 <input type="range" min="' + min + '" max="' + max + '" step="2" value="' + value + '" aria-label="速度 BPM"><output>' + value + '</output> BPM');
    var input = $('input', f), out = $('output', f);
    input.addEventListener('input', function () { out.textContent = input.value; onInput(+input.value); });
    return f;
  }
  function toggle(label, on, onChange) {
    var b = el('button', { type: 'button', class: 'btn gbtn', 'aria-pressed': String(on) }, label);
    b.addEventListener('click', function () { on = !on; b.setAttribute('aria-pressed', String(on)); onChange(on); });
    return b;
  }

  /* ---------- 換和弦練習器 ---------- */
  $$('[data-switch-trainer]').forEach(function (root) {
    var prog = PROGRESSIONS[0], perChord = 4, demo = true, startedAt = 0, changes = 0;
    root.innerHTML = '<div class="trainer-stage" aria-live="polite"><div class="now"><span class="label">現在</span><b class="name">C</b><div class="fig"></div></div>' +
      '<div class="next"><span class="label">下一個</span><b class="name">G</b><div class="fig"></div></div>' +
      '<div class="count"><span class="label">拍</span><div class="beats" aria-hidden="true"><i></i><i></i><i></i><i></i></div><p class="hint">按「開始」後先數一小節預備拍</p></div></div><div class="gcontrols"></div>';
    var c = $('.gcontrols', root), start = el('button', { type: 'button', class: 'btn primary' }, '開始');
    c.appendChild(start);
    c.appendChild(bpmField(40, 120, 60, function (v) { m.bpm = v; }));
    c.appendChild(field('進行', seg('和弦進行', PROGRESSIONS.map(function (p) { return [p.id, p.label]; }), prog.id, function (id) { prog = PROGRESSIONS.filter(function (p) { return p.id === id; })[0]; show(0, -1); })));
    c.appendChild(field('每個和弦', seg('每個和弦拍數', [[4, '4 拍'], [2, '2 拍']], 4, function (v) { perChord = v; })));
    c.appendChild(toggle('示範撥弦', true, function (v) { demo = v; }));
    var nowN = $('.now .name', root), nextN = $('.next .name', root), nowF = $('.now .fig', root), nextF = $('.next .fig', root), lights = $$('.beats i', root), hint = $('.hint', root);
    function show(i, beat) {
      var a = prog.seq[i % 4], b = prog.seq[(i + 1) % 4];
      if (nowN.textContent !== a || !nowF.innerHTML) { nowN.textContent = a; nowF.innerHTML = diagram(a); }
      if (nextN.textContent !== b || !nextF.innerHTML) { nextN.textContent = b; nextF.innerHTML = diagram(b, { noFingers: true }); }
      lights.forEach(function (l, n) { l.className = n === beat ? 'on' + (n === 0 ? ' down' : '') : ''; });
    }
    var m = new PS.audio.Metronome({ bpm: 60, beats: 4, steps: 1, onStep: function (step, time) {
      if (step < 4 || !demo) return;
      var k = step - 4;
      if (k % perChord === 0) PS.audio.strum(CHORDS[prog.seq[Math.floor(k / perChord) % 4]].frets, time, 'down', { volume: 0.12 });
    } });
    m.onVisual = function (step) {
      if (step < 4) { hint.textContent = '預備 ' + (4 - step); show(0, step); return; }
      var k = step - 4, idx = Math.floor(k / perChord);
      if (k % perChord === 0 && k > 0) changes++;
      hint.textContent = k % perChord === perChord - 1 ? '準備換到 ' + prog.seq[(idx + 1) % 4] : '';
      show(idx, k % 4);
    };
    function stop() {
      if (!m.running) return;
      m.stop(); start.textContent = '開始';
      lights.forEach(function (l) { l.className = ''; });
      var secs = Math.round((Date.now() - startedAt) / 1000);
      hint.textContent = '剛才練了 ' + secs + ' 秒、換了 ' + changes + ' 次和弦';
      if (secs >= 5) report(root, 'interaction', { item: '換和弦練習 ' + prog.label, result: m.bpm + ' BPM・每和弦 ' + perChord + ' 拍・' + secs + ' 秒・換 ' + changes + ' 次', value: changes });
    }
    start.addEventListener('click', function () { if (m.running) return stop(); claim(stop); changes = 0; startedAt = Date.now(); if (m.start()) start.textContent = '停止'; });
    show(0, -1);
  });

  /* ---------- 刷奏播放器 ---------- */
  function grid(key) {
    return '<div class="strum-grid" role="list">' + PATTERNS[key].cells.map(function (c, i) {
      var ghost = c === 'd' || c === 'u', up = c === 'U' || c === 'u';
      return '<div class="cell' + (i % 2 ? ' off' : '') + '" role="listitem"><span class="arrow' + (ghost ? ' ghost' : '') + '" aria-label="' + (ghost ? '空刷' : up ? '上刷' : '下刷') + '">' + (up ? '↑' : '↓') + '</span><span class="cnt">' + COUNTS[i] + '</span></div>';
    }).join('') + '</div>';
  }
  $$('[data-pattern-grid]').forEach(function (n) { n.innerHTML = grid(n.getAttribute('data-pattern-grid')); });
  $$('[data-strum-player]').forEach(function (root) {
    var keys = (root.getAttribute('data-strum-player') || 'A B').split(/\s+/), key = keys[0];
    var chordSets = { prog: ['C', 'G', 'Am', 'F'], C: ['C'], open: ['open'], Em: ['Em'] };
    var modes = (root.getAttribute('data-chords') || 'prog C').split(/\s+/), mode = modes[0];
    var guitar = true, startedAt = 0, bars = 0;
    root.innerHTML = '<div class="card"><div class="player-top"><b class="pname"></b><span class="pchord" aria-live="polite"></span></div><div class="pgrid"></div><p class="pdesc"></p><div class="gcontrols"></div></div>';
    var c = $('.gcontrols', root), pgrid = $('.pgrid', root), pchord = $('.pchord', root);
    function chordAt(step) { var set = chordSets[mode]; return set[Math.floor(Math.max(0, step - 8) / 8) % set.length]; }
    function render() { $('.pname', root).textContent = PATTERNS[key].name; $('.pdesc', root).textContent = PATTERNS[key].desc; pgrid.innerHTML = grid(key); pchord.textContent = CHORDS[chordAt(8)].name; }
    var start = el('button', { type: 'button', class: 'btn primary' }, '開始');
    c.appendChild(start);
    c.appendChild(bpmField(50, 120, +(root.getAttribute('data-bpm') || 70), function (v) { m.bpm = v; }));
    if (keys.length > 1) c.appendChild(field('刷法', seg('刷法', keys.map(function (k) { return [k, { Q: '四分', A: '8 Beats', B: '切分' }[k]]; }), key, function (v) { key = v; render(); })));
    var LABEL = { prog: 'C G Am F', C: '只彈 C', open: '空弦', Em: 'Em' };
    if (modes.length > 1) c.appendChild(field('和弦', seg('和弦', modes.map(function (k) { return [k, LABEL[k]]; }), mode, function (v) { mode = v; render(); })));
    c.appendChild(toggle('吉他示範', true, function (v) { guitar = v; }));
    var m = new PS.audio.Metronome({ bpm: +(root.getAttribute('data-bpm') || 70), beats: 4, steps: 2, onStep: function (step, time) {
      if (step < 8 || !guitar) return;
      var cell = PATTERNS[key].cells[step % 8];
      if (cell === 'D' || cell === 'U') PS.audio.strum(CHORDS[chordAt(step)].frets, time, cell === 'D' ? 'down' : 'up', { volume: step % 2 ? 0.1 : 0.14, duration: 0.5 });
    } });
    m.onVisual = function (step) {
      $$('.cell', pgrid).forEach(function (n, i) { n.classList.toggle('now', step >= 8 && i === step % 8); });
      if (step < 8) { pchord.textContent = step % 2 ? '' : '預備 ' + (4 - step / 2); return; }
      if (step % 8 === 0) bars++;
      pchord.textContent = CHORDS[chordAt(step)].name;
    };
    function stop() {
      if (!m.running) return;
      m.stop(); start.textContent = '開始';
      $$('.cell', pgrid).forEach(function (n) { n.classList.remove('now'); });
      pchord.textContent = CHORDS[chordAt(8)].name;
      var secs = Math.round((Date.now() - startedAt) / 1000);
      if (secs >= 5) report(root, 'interaction', { item: '刷奏 ' + PATTERNS[key].name, result: m.bpm + ' BPM・' + bars + ' 小節', value: bars });
    }
    start.addEventListener('click', function () { if (m.running) return stop(); claim(stop); bars = 0; startedAt = Date.now(); if (m.start()) start.textContent = '停止'; });
    render();
  });

  /* ---------- 調音器（麥克風） ---------- */
  function detect(buf, sr) {
    var n = buf.length, rms = 0, i;
    for (i = 0; i < n; i++) rms += buf[i] * buf[i];
    if (Math.sqrt(rms / n) < 0.012) return -1;
    var minLag = Math.floor(sr / 420), maxLag = Math.floor(sr / 70), best = -1, bestC = 0, c = new Float32Array(maxLag + 2);
    for (var lag = minLag; lag <= maxLag + 1; lag++) {
      var s = 0, e1 = 0, e2 = 0;
      for (i = 0; i < n - lag; i++) { s += buf[i] * buf[i + lag]; e1 += buf[i] * buf[i]; e2 += buf[i + lag] * buf[i + lag]; }
      c[lag] = s / Math.sqrt(e1 * e2 || 1);
    }
    for (lag = minLag + 1; lag <= maxLag; lag++) if (c[lag] > 0.85 && c[lag] >= c[lag - 1] && c[lag] >= c[lag + 1]) { best = lag; bestC = c[lag]; break; }
    if (best < 0) return -1;
    var a = c[best - 1], b = c[best], d = c[best + 1], shift = (a - d) / (2 * (a - 2 * b + d) || 1);
    return sr / (best + shift);
  }
  $$('[data-tuner]').forEach(function (root) {
    root.classList.add('tuner');
    root.innerHTML = '<div class="strings">' + OPEN.map(function (o, i) { return '<button type="button" data-s="' + i + '"><b>' + o.n + '</b><small>' + (6 - i) + ' 弦・' + o.n + o.o + '</small></button>'; }).join('') + '</div>' +
      '<div class="dial"><span class="read">—</span><span class="cents"></span><i class="zone"></i><i class="scale"></i><i class="needle"></i><span class="lbl l">太低 ♭</span><span class="lbl r">太高 ♯</span></div>' +
      '<div class="row" style="display:flex;gap:10px;flex-wrap:wrap;align-items:center"><button type="button" class="btn primary mic">🎙 開始調音</button><button type="button" class="btn ref">▶ 播放參考音</button><span class="msg">選一條弦，先聽參考音，再按「開始調音」撥那條空弦。</span></div>';
    var cur = 0, stream = null, raf = 0, an = null, buf = null, okSince = 0, done = {};
    var needle = $('.needle', root), read = $('.read', root), cents = $('.cents', root), msg = $('.msg', root), micBtn = $('.mic', root);
    function pick(i) { cur = i; $$('.strings button', root).forEach(function (b, k) { b.classList.toggle('on', k === i); }); }
    root.addEventListener('click', function (e) { var b = e.target.closest('[data-s]'); if (b) pick(+b.getAttribute('data-s')); });
    $('.ref', root).addEventListener('click', function () {
      var a = PS.audio.ctx(); if (!a) return;
      var f = [-1, -1, -1, -1, -1, -1]; f[cur] = 0;
      PS.audio.strum(f, a.currentTime + 0.02, 'down', { duration: 2.5, volume: 0.35 });
    });
    function stop() { cancelAnimationFrame(raf); if (stream) stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; micBtn.textContent = '🎙 開始調音'; }
    var lastT = 0;
    function loop(now) {
      raf = requestAnimationFrame(loop);
      if (now - lastT < 50) return; // 約每秒 20 次，手機也不吃力
      lastT = now;
      an.getFloatTimeDomainData(buf);
      var f = detect(buf, an.context.sampleRate), target = OPEN[cur].f;
      if (f > 0) {
        // 允許撥成高、低八度時仍對到目標弦
        while (f > target * 1.414) f /= 2; while (f < target / 1.414) f *= 2;
        var ce = Math.round(1200 * Math.log2(f / target)), ok = Math.abs(ce) <= 5;
        needle.style.left = Math.max(8, Math.min(92, 50 + ce * 0.84)) + '%';
        needle.classList.toggle('ok', ok);
        read.textContent = OPEN[cur].n + (ok ? ' ✓' : ce < 0 ? ' 偏低' : ' 偏高');
        cents.textContent = (ce > 0 ? '+' : '') + ce + ' cents・' + f.toFixed(1) + ' Hz';
        msg.textContent = ok ? '準了！保持一下…' : ce < 0 ? '太低：旋鈕慢慢轉緊（音會變高）' : '太高：先轉鬆到低於目標，再慢慢轉緊上來';
        if (ok) { if (!okSince) okSince = Date.now(); else if (Date.now() - okSince > 700 && !done[cur]) { done[cur] = 1; $$('.strings button', root)[cur].classList.add('ok'); report(root, 'interaction', { item: '調音 ' + (6 - cur) + ' 弦', result: '完成', value: 1 }); if (cur < 5) pick(cur + 1); okSince = 0; } }
        else okSince = 0;
      }
    }
    micBtn.addEventListener('click', function () {
      if (stream) return stop();
      if (!navigator.mediaDevices || !window.isSecureContext) { msg.textContent = '需要用 https 開啟並允許麥克風。也可以改用手機調音 App。'; return; }
      var a = PS.audio.ctx();
      navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } }).then(function (s) {
        stream = s; an = a.createAnalyser(); an.fftSize = 2048; buf = new Float32Array(an.fftSize);
        a.createMediaStreamSource(s).connect(an);
        claim(stop); micBtn.textContent = '■ 停止調音'; raf = requestAnimationFrame(loop);
      }).catch(function () { msg.textContent = '沒有取得麥克風權限。請在網址列允許麥克風後再試一次。'; });
    });
    pick(0);
  });
})(window.PS = window.PS || {});
