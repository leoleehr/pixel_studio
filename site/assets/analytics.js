/* ===== Pixel Studio 瀏覽統計：Google Analytics 4 =====
 * 每頁 <head> 以 defer 載入，比其他腳本先執行，才接得到第一張投影片。只記錄頁面瀏覽、投影片翻頁、工具使用與送出的「種類」，不傳學員姓名、Gmail、作答內容或錄音。
 * 本機開發（localhost、file://）不送出；隱私權頁的「停用瀏覽統計」會在這台裝置寫入 ps-ga-optout，之後不再載入。
 * 投影片與問卷的事件來自 deck.js 的 slide:change 和 backend.js 的 ps:activity。
 */
(function () {
  'use strict';
  var ID = 'G-86GRBXSLEW', OPT = 'ps-ga-optout';
  var host = location.hostname;
  if (location.protocol === 'file:' || /^(localhost|127\.|\[?::1\]?$)|\.localhost$/.test(host)) return;
  try { if (localStorage.getItem(OPT) === '1') { window['ga-disable-' + ID] = true; return; } } catch (e) {}

  var path = location.pathname;
  var LAB = (path.match(/\/(vocal|guitar|piano|songwriting)(?:\/|$)/) || [])[1] || 'studio';
  // 課次取投影片資料夾名稱（lesson-02、ch03、p04、s03）；Lab 首頁、講義與問卷留空
  var LESSON = (path.replace(/index\.html$/, '').match(/\/(lesson-\d+|ch\d+|p\d+|s\d+)\/$/) || [])[1] || '';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  gtag('js', new Date());
  // 網址只送路徑：查詢字串可能帶分享參數，一律不送；關閉廣告信號與個人化廣告
  gtag('config', ID, {
    page_location: location.origin + path,
    allow_google_signals: false,
    allow_ad_personalization_signals: false,
    lab: LAB,
    lesson: LESSON
  });
  var s = document.createElement('script');
  s.async = true;
  s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  function track(name, params) {
    params = params || {};
    params.lab = LAB;
    if (LESSON && !params.lesson) params.lesson = LESSON;
    gtag('event', name, params);
  }
  window.psTrack = track;

  // 投影片：停留 1.5 秒以上才算看過，快速連翻只記最後一張；同一張不重複記
  // 桌機由 deck.js 的 slide:change 通知；手機版投影片改為上下捲動，改用 IntersectionObserver 判斷畫面中央的那一張
  var seen = {}, slideT = 0;
  var MOBILE = matchMedia('(max-width:900px),(orientation:portrait) and (max-width:1100px)');
  function view(n) {
    clearTimeout(slideT);
    slideT = setTimeout(function () {
      if (seen[n]) return;
      seen[n] = 1;
      track('slide_view', { slide_number: n });
    }, 1500);
  }
  document.addEventListener('slide:change', function (e) {
    var d = e.detail || {};
    if (!d.mobile && d.index >= 0) view(d.index + 1);
  });
  function watchSlides() {
    var slides = [].slice.call(document.querySelectorAll('.slide'));
    if (!slides.length || !window.IntersectionObserver) return;
    var io = new IntersectionObserver(function (list) {
      if (!MOBILE.matches) return;
      list.forEach(function (en) {
        var need = Math.min(innerHeight, en.boundingClientRect.height) * 0.5;
        if (en.isIntersecting && en.intersectionRect.height >= need) view(slides.indexOf(en.target) + 1);
      });
    }, { threshold: [0, 0.25, 0.5, 0.75, 1] });
    slides.forEach(function (sl) { io.observe(sl); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', watchSlides); else watchSlides();

  // 送出問卷、出場券、課堂互動與上傳：只帶種類與投影片編號
  var KIND = { submit: 'lab_submit', interaction: 'lab_interaction', upload: 'lab_upload' };
  document.addEventListener('ps:activity', function (e) {
    var d = e.detail || {};
    if (!KIND[d.kind]) return;
    track(KIND[d.kind], { activity_type: d.type || '', lesson: LESSON || String(d.lesson || ''), slide_number: d.slide ? Number(d.slide) || 0 : 0 });
  });

  // 工具使用：每個元件在這次瀏覽第一次被點擊時記一筆
  var TOOLS = ['accomp', 'arranger', 'arrmap', 'breath', 'cheer', 'chordlab', 'chordprog', 'cloze', 'degrees', 'dynmap', 'exit', 'flips',
    'formbuilder', 'keyboard', 'leoworks', 'log7', 'lyricbox', 'lyricdice', 'lyricform', 'lyricmark', 'melodyscope', 'metro', 'mirror', 'motif',
    'notebook', 'notequiz', 'order', 'people', 'phase', 'picker', 'pitch', 'poll', 'quiz', 'range', 'recorder', 'resolab', 'reveal', 'rhetohunt',
    'rhyme', 'rhythm-game', 'scalepractice', 'scaletrain', 'score', 'sec-track', 'siren', 'solfa', 'songcard', 'songplay', 'songpoll', 'staccato',
    'stopwatch', 'tabbox', 'taptempo', 'themedice', 'tonemap', 'transpose', 'wave', 'wavelab', 'wordhunt', 'zero'];
  var SEL = TOOLS.map(function (t) { return '.' + t; }).join(',');
  var used = typeof WeakSet === 'function' ? new WeakSet() : null;
  document.addEventListener('click', function (e) {
    if (!used || !e.target.closest) return;
    var b = e.target.closest('button,input,select,canvas,[role="button"]');
    var root = b && b.closest(SEL);
    if (!root || used.has(root)) return;
    used.add(root);
    var name = TOOLS.filter(function (t) { return root.classList.contains(t); })[0] || '';
    var slide = root.closest('.slide'), all = [].slice.call(document.querySelectorAll('.slide'));
    track('tool_use', { tool_name: name, slide_number: slide ? all.indexOf(slide) + 1 : 0 });
  }, true);
})();
