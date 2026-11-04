/* ===== 中文／English 切換 =====
 * 英文頁放在 en/ 底下，路徑與中文頁一一對應；這支腳本算出另一種語言的同一頁，放進頁首選單。
 * 位置：課程頁與首頁的頂部選單（.topbar nav）、入口頁的 .masthead、投影片的底部控制列；都沒有時放在左上角。
 * 手機與平板的頂部選單收起來、投影片控制列也不顯示，所以頂欄（.topbar、.appbar）另放一個 44 px 的切換連結。
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

  // 手機與平板頂欄用：外層 44 px 是觸控範圍，裡面的 span 才是看得到的膠囊
  function topLink() {
    var a = single('ps-lang-topm'), t = a.textContent;
    a.textContent = '';
    a.appendChild(document.createElement('span')).textContent = t;
    a.setAttribute('aria-label', en ? '切換成中文' : 'Switch to English');
    // 手機投影片不更新網址，切換語言時帶上目前看到第幾張
    a.addEventListener('click', function () {
      var c = a.parentNode.querySelector('.ab-count'), n = c ? parseInt(c.textContent, 10) : 0;
      if (n > 0) a.href = other + '#s' + n;
    });
    return a;
  }

  var css = '.ps-lang{font-weight:700;letter-spacing:.04em}' +
    '.ps-lang-pair{display:inline-flex;gap:2px;padding:3px;border-radius:999px;border:1px solid rgba(255,255,255,.22);background:rgba(10,10,14,.55);backdrop-filter:blur(8px);vertical-align:middle}' +
    '.ps-lang-pair .ps-lang-opt{font:inherit;font-size:14px;font-weight:700;line-height:1;padding:8px 14px;border-radius:999px;color:inherit;text-decoration:none;opacity:.72}' +
    '.ps-lang-pair .ps-lang-opt[aria-current]{background:var(--accent,#f5a623);color:#14141a;opacity:1}' +
    '.ps-lang-pair .ps-lang-opt:not([aria-current]):hover{opacity:1;background:rgba(255,255,255,.1)}' +
    '.ps-lang-float{position:fixed;left:12px;top:12px;z-index:40;display:inline-flex;align-items:center;justify-content:center;min-width:44px;min-height:44px;font:600 13px/1 system-ui,sans-serif;padding:0 14px;border-radius:999px;background:rgba(10,10,14,.7);color:#f4f4f0;text-decoration:none;border:1px solid rgba(255,255,255,.2)}' +
    /* 入口頁：膠囊維持原樣，用透明區域撐到 44 px 觸控範圍；很窄的手機只留另一種語言，才放得下 */
    '@media(max-width:860px){.masthead .ps-lang-opt{position:relative}.masthead .ps-lang-opt::after{content:"";position:absolute;left:0;right:0;top:-7px;bottom:-7px}}' +
    '@media(max-width:359px){.masthead .ps-lang-opt[aria-current]{display:none}}' +
    '.ps-lang-topm{display:none;flex:none;align-items:center;justify-content:center;min-width:44px;min-height:44px;color:inherit;text-decoration:none;font-size:13px;font-weight:700;line-height:1}' +
    '.ps-lang-topm span{display:block;padding:7px 9px;border-radius:999px;border:1px solid rgba(255,255,255,.22);white-space:nowrap}' +
    '.ps-lang-topm:focus-visible{outline:2px solid #d6e03a;outline-offset:-2px;border-radius:12px}' +
    '[data-theme=light] .ps-lang-topm span{border-color:rgba(17,19,21,.2)}' +
    '.appbar .ps-lang-topm{display:inline-flex}' +
    '@media(max-width:860px){.topbar .ps-lang-topm{display:inline-flex;margin-left:auto}.topbar .ps-lang-topm+.ps-theme-topm{margin-left:0}.topbar .ps-lang-topm~.pb-chip{margin-left:0}}' +
    '.masthead .ps-lang-pair{margin-left:auto}' +
    '@media print{.ps-lang,.ps-lang-pair,.ps-lang-float,.ps-lang-topm{display:none!important}}';

  function place() {
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var home = /^(en\/)?(index\.html|studio\.html|studio)?$/.test(rel);
    var nav = document.querySelector('.topbar nav');
    var mast = document.querySelector('.masthead');
    var deckUi = document.querySelector('nav.ui');
    var done = false;
    if (nav) {
      nav.appendChild(home ? pair('ps-lang-pair') : single('ps-lang'));
      nav.parentNode.insertBefore(topLink(), nav.nextSibling);
      done = true;
    }
    else if (mast) { mast.appendChild(pair('ps-lang-pair')); done = true; }
    if (deckUi) { deckUi.appendChild(single('ps-lang')); done = true; }
    if (!done) document.body.appendChild(single('ps-lang-float'));
    // 手機版投影片的頂部列由 deck.js 產生，本檔排在它前面執行，要等 DOMContentLoaded
    document.addEventListener('DOMContentLoaded', function () {
      var bar = document.querySelector('.appbar');
      if (bar) bar.insertBefore(topLink(), bar.querySelector('.ab-count'));
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', place); else place();
})();
