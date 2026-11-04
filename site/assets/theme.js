/* ===== 深色／淺色主題 =====
 * <head> 最前面的內嵌程式（tools/theme_inject.py 產生）先套用使用者選的主題，第一次繪製就正確；本檔以 defer 載入，負責按鈕與標誌。
 * 選擇存在 localStorage（ps-theme），全站共用。
 * 淺色樣式在 theme-light.css（tools/build_theme_light.py 產生），只在淺色模式載入；深色模式完全不受影響。
 * <script data-kit> 標明這頁用哪一套樣式（site／deck／entry／plain），淺色規則依此分開。
 * 按鈕：入口頁的 .masthead 放一顆完整按鈕，其他頁跟在語言切換旁邊放小按鈕。
 * 標誌在淺色底換成 CI 指定的淺色底版本（見 LOGOS），不改標誌本身。
 */
(function () {
  'use strict';
  var CSS_V = '7de7f9ec53';
  var KEY = 'ps-theme', root = document.documentElement, me = document.currentScript;
  var base = me ? me.src.replace(/theme\.js(\?.*)?$/, '') : 'assets/';
  root.setAttribute('data-kit', (me && me.getAttribute('data-kit')) || 'site');
  var lab = (location.pathname.match(/\/(vocal|guitar|piano|songwriting)\//) || [])[1];
  if (lab) root.setAttribute('data-lab', lab);

  var sheet = document.getElementById('ps-theme-css');
  function load(cb) {
    if (sheet) { if (cb) cb(); return; }
    sheet = document.createElement('link');
    sheet.rel = 'stylesheet';
    sheet.href = base + 'theme-light.css?v=' + CSS_V;
    sheet.setAttribute('blocking', 'render');
    if (cb) { sheet.onload = cb; sheet.onerror = cb; }
    document.head.appendChild(sheet);
  }
  function get() { return root.getAttribute('data-theme') === 'light' ? 'light' : 'dark'; }
  function apply(t) {
    if (t === 'light') root.setAttribute('data-theme', 'light'); else root.removeAttribute('data-theme');
    var m = document.querySelector('meta[name="theme-color"]');
    if (m) {
      if (!m.hasAttribute('data-dark')) m.setAttribute('data-dark', m.getAttribute('content'));
      m.setAttribute('content', t === 'light' ? '#f4f4f0' : m.getAttribute('data-dark'));
    }
    logos();
    sync();
    try { window.dispatchEvent(new CustomEvent('ps-theme', { detail: t })); window.dispatchEvent(new Event('resize')); } catch (e) {}
  }
  function set(t) {
    try { localStorage.setItem(KEY, t); } catch (e) {}
    if (t === 'light') load(function () { apply(t); }); else apply(t);
  }
  try {
    if (localStorage.getItem(KEY) === 'light') { load(); root.setAttribute('data-theme', 'light'); }
  } catch (e) {}

  // 依 CI：深色底透明標誌在淺色底換成白底彩色橫式與淺色底單色主標誌
  var LOGOS = [
    ['mono-white.svg', 'mono-black.svg'],
    ['pixel-studio-horizontal.svg', 'horizontal-light.svg'],
    ['horizontal-transparent.svg', 'horizontal-light.svg'],
    ['brand/primary-transparent.svg', 'brand/pixel-studio-primary-mono-black.svg']
  ];
  function logos() {
    if (!document.body) return;
    var light = get() === 'light';
    [].forEach.call(document.querySelectorAll('img[src*="brand/"]'), function (img) {
      if (img.hasAttribute('data-mono-fixed')) return; // 本來就固定用某一色的標誌
      var src = img.getAttribute('src'), base = img.getAttribute('data-logo-dark');
      if (!base) { base = src.replace('mono-black.svg', 'mono-white.svg'); img.setAttribute('data-logo-dark', base); }
      var want = base;
      if (light) LOGOS.forEach(function (pair) { want = want.replace(pair[0], pair[1]); });
      if (want !== src) img.setAttribute('src', want);
    });
  }

  var en = /^en\b/.test(root.lang || '');
  var ICON = {
    light: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>',
    dark: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z"/></svg>'
  };
  var buttons = [];
  function sync() {
    var light = get() === 'light', next = light ? 'dark' : 'light';
    var tip = en ? (light ? 'Switch to dark' : 'Switch to light') : (light ? '切換成深色' : '切換成淺色');
    buttons.forEach(function (b) {
      b.setAttribute('aria-pressed', String(light));
      b.setAttribute('title', tip);
      var label = b.classList.contains('ps-theme-mini') ? '' :
        '<span class="ps-theme-label">' + (en ? (light ? 'Dark' : 'Light') : (light ? '深色' : '淺色')) + '</span>';
      b.innerHTML = ICON[next] + label;
      if (!label || b.classList.contains('ps-theme-full')) b.setAttribute('aria-label', tip);
    });
  }
  function button(cls) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'ps-theme ' + cls;
    b.addEventListener('click', function () { set(get() === 'light' ? 'dark' : 'light'); });
    buttons.push(b);
    return b;
  }

  // 按鈕在深淺兩種模式都要出現，樣式放這裡，不放 theme-light.css
  var css = '.ps-theme{display:inline-flex;align-items:center;justify-content:center;gap:8px;flex:none;font:inherit;cursor:pointer;color:inherit;-webkit-tap-highlight-color:transparent}' +
    '.ps-theme svg{display:block;flex:none}' +
    '.ps-theme:focus-visible{outline:2px solid #d6e03a;outline-offset:4px}' +
    '.ps-theme-mini{width:34px;height:34px;padding:0;margin-left:6px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:transparent;vertical-align:middle;align-self:center;transition:background .2s}' +
    '.ps-theme-mini:hover{background:rgba(255,255,255,.1)}' +
    '.ps-theme-float{position:fixed;right:12px;top:12px;z-index:40;height:34px;padding:0 12px;border-radius:999px;border:1px solid rgba(255,255,255,.2);background:rgba(10,10,14,.7);color:#f4f4f0;font:600 13px/1 system-ui,sans-serif}' +
    /* 入口頁：深色底上一顆紙白底、墨色字的按鈕；切到淺色後反過來 */
    '.ps-theme-full{min-height:40px;padding:0 17px 0 14px;margin-right:12px;border:1px solid #f4f4f0;border-radius:999px;background:#f4f4f0;color:#111315;font-size:11px;font-weight:600;letter-spacing:.2em;transition:box-shadow .3s,transform .2s,background .25s,color .25s}' +
    '.ps-theme-full .ps-theme-label{padding-left:.2em}' +
    '.masthead .ps-theme-full{margin-left:auto}.masthead .ps-theme-full+.ps-lang-pair{margin-left:0}' +
    '.ps-theme-full:hover{box-shadow:0 0 0 4px rgba(244,244,240,.14),0 0 28px rgba(244,244,240,.24)}' +
    '.ps-theme-full:active{transform:translateY(1px)}' +
    '[data-theme=light] .ps-theme-full{border-color:#111315;background:#111315;color:#f4f4f0}' +
    '[data-theme=light] .ps-theme-full:hover{box-shadow:0 0 0 4px rgba(17,19,21,.1),0 0 28px rgba(17,19,21,.16)}' +
    '[data-theme=light] .ps-theme-mini{border-color:rgba(17,19,21,.2)}' +
    '[data-theme=light] .ps-theme-mini:hover{background:rgba(17,19,21,.07)}' +
    '[data-theme=light] .ps-theme-float{border-color:rgba(17,19,21,.18);background:rgba(255,255,255,.85);color:#111315}' +
    '.ps-theme-topm{display:none}' +
    '.tabbar .ps-theme-tab{flex:1;flex-direction:column;gap:3px;padding:0;border:0;background:none;color:var(--faint);font-size:11px;font-weight:500}' +
    '.tabbar .ps-theme-tab svg{width:22px;height:22px}' +
    '@media(max-width:860px){.ps-theme-topm{display:inline-flex;margin-left:auto;margin-right:8px}.ps-theme-topm+.pb-chip{margin-left:0}}' +
    /* 手機入口頁只留圖示，語言切換才不會被擠成直排 */
    '@media(max-width:599px){.ps-theme-full{width:36px;min-height:36px;padding:0;margin-right:8px}.ps-theme-full .ps-theme-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0)}.masthead .ps-lang-opt{white-space:nowrap}}' +
    '@media print{.ps-theme{display:none!important}}';

  function place() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var mast = document.querySelector('.entry .masthead');
    var langs = [].slice.call(document.querySelectorAll('.ps-lang,.ps-lang-pair,.ps-lang-float'));
    if (mast) {
      mast.insertBefore(button('ps-theme-full'), mast.querySelector('.ps-lang-pair'));
    } else if (langs.length) {
      // 手機版頂欄的選單收起來了：有底部分頁列就加一格，沒有就放在頂欄右側（學員資料按鈕左邊）
      var tab = document.querySelector('.tabbar'), bar = document.querySelector('.topbar .wrap');
      if (tab) tab.appendChild(button('ps-theme-tab'));
      else if (bar) bar.insertBefore(button('ps-theme-mini ps-theme-topm'), bar.querySelector('.pb-chip'));
      langs.forEach(function (l) {
        if (l.classList.contains('ps-lang-float')) document.body.appendChild(button('ps-theme-float'));
        else l.parentNode.insertBefore(button('ps-theme-mini'), l.nextSibling);
      });
    } else {
      document.body.appendChild(button('ps-theme-float'));
    }
    logos();
    sync();
  }
  // lang.js（defer）在 DOMContentLoaded 之前就放好語言切換，這裡再接在它旁邊
  document.addEventListener('DOMContentLoaded', place);
  addEventListener('load', logos);
  window.PSTheme = { get: get, set: set };
})();
