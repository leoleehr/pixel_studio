/* ===== 中文／English 切換 =====
 * 英文頁放在 en/ 底下，路徑與中文頁一一對應；這支腳本算出另一種語言的同一頁，放進頁首選單。
 * 位置：課程頁與首頁的頂部選單（.topbar nav）、入口頁的 .masthead、投影片的底部控制列與手機版頂部列；都沒有時放在左上角。
 */
(function () {
  'use strict';
  var s = document.currentScript;
  if (!s) return;
  var root = new URL('../', s.src).href;
  var here = location.href.split('#')[0].split('?')[0];
  if (here.indexOf(root) !== 0) return;
  var rel = here.slice(root.length), en = /^en(\/|$)/.test(rel);
  var other = root + (en ? rel.replace(/^en\/?/, '') : 'en/' + rel);

  function link(cls, text, href, lang, current) {
    var a = document.createElement('a');
    a.className = cls;
    a.textContent = text;
    a.href = href;
    a.lang = lang;
    a.hreflang = lang;
    if (current) a.setAttribute('aria-current', 'true');
    else a.addEventListener('click', function () {
      try { localStorage.setItem('ps-lang', lang); } catch (e) {}
      a.href = href + location.hash;
    });
    return a;
  }
  function single(cls) {
    // 只顯示「另一種語言」
    return en ? link(cls, '中文', other, 'zh-Hant') : link(cls, 'EN', other, 'en');
  }
  function pair(cls) {
    var w = document.createElement('div');
    w.className = cls;
    w.setAttribute('role', 'group');
    w.setAttribute('aria-label', en ? 'Language' : '語言');
    w.appendChild(link('ps-lang-opt', '中文', en ? other : here, 'zh-Hant', !en));
    w.appendChild(link('ps-lang-opt', 'English', en ? here : other, 'en', en));
    return w;
  }

  var css = '.ps-lang{font-weight:700;letter-spacing:.04em}' +
    '.ps-lang-pair{display:inline-flex;gap:2px;padding:3px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(10,10,14,.55);backdrop-filter:blur(8px);vertical-align:middle}' +
    '.ps-lang-pair .ps-lang-opt{font:inherit;font-size:14px;font-weight:700;line-height:1;padding:8px 14px;border-radius:999px;color:inherit;text-decoration:none;opacity:.72}' +
    '.ps-lang-pair .ps-lang-opt[aria-current]{background:var(--accent,#f5a623);color:#14141a;opacity:1}' +
    '.ps-lang-pair .ps-lang-opt:not([aria-current]):hover{opacity:1;background:rgba(255,255,255,.1)}' +
    '.ps-lang-float{position:fixed;left:12px;top:12px;z-index:40;font:600 13px/1 system-ui,sans-serif;padding:8px 12px;border-radius:999px;background:rgba(10,10,14,.7);color:#f4f4f0;text-decoration:none;border:1px solid rgba(255,255,255,.2)}' +
    '.appbar .ps-lang{flex:none;font-size:13px;padding:7px 10px;border-radius:999px;border:1px solid rgba(255,255,255,.2);color:inherit;text-decoration:none}' +
    '.masthead .ps-lang-pair{margin-left:auto}' +
    '@media print{.ps-lang,.ps-lang-pair,.ps-lang-float{display:none!important}}';

  function place() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var home = /^(en\/)?(index\.html|studio\.html|studio)?$/.test(rel);
    var nav = document.querySelector('.topbar nav');
    var mast = document.querySelector('.masthead');
    var deckUi = document.querySelector('nav.ui');
    var done = false;
    if (nav) { nav.appendChild(home ? pair('ps-lang-pair') : single('ps-lang')); done = true; }
    else if (mast) { mast.appendChild(pair('ps-lang-pair')); done = true; }
    if (deckUi) { deckUi.appendChild(single('ps-lang')); done = true; }
    // 手機版投影片的頂部列由 deck.js 產生
    var bar = document.querySelector('.appbar');
    if (bar) { var c = bar.querySelector('.ab-count'); bar.insertBefore(single('ps-lang'), c); done = true; }
    if (!done) document.body.appendChild(single('ps-lang-float'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();
})();
