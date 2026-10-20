/* ===== Pixel Studio 資料回收：學員資料、送出佇列、Google 試算表後台 =====
 * 需要先載入 config.js。所有資料以 JSON 送到 Google Apps Script（見 backend/README.md）。
 * 設定 googleClientId 後，學員必須以 Google 帳戶登入，並由老師在「班級名單」核准後才會寫入資料。
 */
(function () {
  'use strict';
  var CFG = window.PIXEL_CONFIG || {}, URL_ = (CFG.endpoint || '').trim(), GID = (CFG.googleClientId || '').trim();
  // 課程識別：body[data-course]（如 guitar）與 [data-lesson]；Vocal Lab 舊頁面沒有標記時沿用原本的鍵與 lesson-N 路徑
  var COURSE = document.body.getAttribute('data-course') || '';
  var LESSON = document.body.getAttribute('data-lesson') || (location.pathname.match(/lesson-(\d+)/) || [])[1];
  if (LESSON && /^\d+$/.test(LESSON)) LESSON = String(parseInt(LESSON, 10));
  var NS = 'pixel:' + (COURSE ? COURSE + ':' : '');
  // Google 登入資料四個 Lab 共用，登入一次即可
  var K = { profile: NS + 'profile', queue: NS + 'queue', device: 'pixel:device', account: 'pixel:account' };
  function get(k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } }
  function set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
  function del(k) { try { localStorage.removeItem(k); } catch (e) {} }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  var device = get(K.device, null);
  if (!device) { device = Math.random().toString(36).slice(2, 10); set(K.device, device); }

  /* ---------- 提示訊息 ---------- */
  var toastEl = null, toastT = 0;
  function toast(msg, kind) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'pb-toast'; toastEl.setAttribute('role', 'status'); document.body.appendChild(toastEl); }
    toastEl.className = 'pb-toast on ' + (kind || '');
    toastEl.textContent = msg;
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, 3600);
  }

  /* ---------- Google 帳戶 ---------- */
  // account：{ email, session, status }，session 由後台驗證 Google 憑證後發出
  function account() { return GID ? get(K.account, null) : null; }
  var idToken = '', gisReady = null;
  var INAPP = /Line\/|FBAN|FBAV|Instagram|MicroMessenger/i.test(navigator.userAgent);
  function loadGis() {
    if (gisReady) return gisReady;
    gisReady = new Promise(function (ok, fail) {
      var s = document.createElement('script'); s.src = 'https://accounts.google.com/gsi/client'; s.async = true;
      s.onload = function () {
        google.accounts.id.initialize({ client_id: GID, callback: onCredential, auto_select: false, cancel_on_tap_outside: true, use_fedcm_for_button: true });
        ok();
      };
      s.onerror = function () { gisReady = null; fail(new Error('gis')); };
      document.head.appendChild(s);
    });
    return gisReady;
  }
  function claims(t) {
    try { var b = t.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'); return JSON.parse(decodeURIComponent(escape(atob(b)))); } catch (e) { return {}; }
  }
  function onCredential(r) {
    idToken = r.credential || '';
    var c = claims(idToken);
    if (!modal) return;
    if (!modal.querySelector('[name=name]').value && c.name) modal.querySelector('[name=name]').value = c.name;
    paintGoogle(c.email);
    modal.querySelector('.pb-err').textContent = '';
  }
  function paintGoogle(email) {
    var box = modal.querySelector('.pb-google'), acc = account();
    email = email || (acc && acc.email);
    if (email) {
      box.innerHTML = '<div class="pb-acct"><span>已登入</span><b>' + esc(email) + '</b><button type="button" class="pb-switch">換帳號</button></div>';
      box.querySelector('.pb-switch').onclick = function () { idToken = ''; del(K.account); refreshChips(); paintGoogle(); };
      return;
    }
    if (INAPP) {
      var u = location.href.split('#')[0], ext = /Line\//i.test(navigator.userAgent) ? u + (u.indexOf('?') > -1 ? '&' : '?') + 'openExternalBrowser=1' : '';
      box.innerHTML = '<p class="pb-inapp">LINE、Facebook、Instagram 內建的瀏覽器無法使用 Google 登入，請改用 Chrome 或 Safari 開啟這一頁。</p>' +
        (ext ? '<a class="pb-ext" href="' + esc(ext) + '">用預設瀏覽器開啟</a>' : '<button type="button" class="pb-ext">複製網址</button>');
      var b = box.querySelector('button.pb-ext');
      if (b) b.onclick = function () { navigator.clipboard && navigator.clipboard.writeText(u).then(function () { toast('網址已複製，請貼到 Chrome 或 Safari', 'ok'); }); };
      return;
    }
    box.innerHTML = '<div class="pb-gbtn"></div>';
    loadGis().then(function () {
      var el = box.querySelector('.pb-gbtn');
      google.accounts.id.renderButton(el, { type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', logo_alignment: 'left', locale: 'zh-TW', width: Math.min(400, Math.max(200, Math.round(el.getBoundingClientRect().width || 300))) });
    }).catch(function () { box.innerHTML = '<p class="pb-inapp">無法載入 Google 登入，請確認網路連線後重新開啟。</p>'; });
  }
  function login(p) {
    return fetch(URL_, { method: 'POST', body: JSON.stringify({ action: 'login', code: p.code, name: p.name, dept: p.dept, idToken: idToken }) }).then(function (r) { return r.json(); });
  }

  /* ---------- 學員資料 ---------- */
  function profile() {
    var p = get(K.profile, null), a = account();
    if (p && a) { p.email = a.email; p.status = a.status; }
    return p;
  }
  function complete(p) { return !!(p && p.name && p.dept && p.code && (!GID || (account() && account().session))); }
  var modal = null, pending = [];
  function openProfile(reason) {
    return new Promise(function (resolve, reject) {
      pending.push({ resolve: resolve, reject: reject });
      if (!modal) build();
      var p = profile() || {};
      modal.querySelector('[name=name]').value = p.name || '';
      modal.querySelector('[name=dept]').value = p.dept || '';
      modal.querySelector('[name=code]').value = p.code || '';
      modal.querySelector('.pb-reason').textContent = reason || (GID ? '以 Google 帳戶登入並填寫一次即可，之後送出的問卷與課堂互動都會附上你的 Gmail、姓名與學校科系／公司名稱。' : '填寫一次即可，之後送出的問卷與課堂互動都會附上你的姓名與學校科系／公司名稱。');
      modal.querySelector('.pb-err').textContent = '';
      modal.querySelector('.pb-clear').style.display = p.name || account() ? '' : 'none';
      if (GID) paintGoogle();
      modal.classList.add('on'); document.documentElement.classList.add('pb-open');
      setTimeout(function () { modal.querySelector('[name=name]').focus(); }, 60);
    });
  }
  function closeProfile(ok) {
    modal.classList.remove('on'); document.documentElement.classList.remove('pb-open');
    var list = pending; pending = [];
    list.forEach(function (p) { ok ? p.resolve(profile()) : p.reject(new Error('cancel')); });
  }
  function build() {
    modal = document.createElement('div'); modal.className = 'pb-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-label', '學員資料');
    modal.innerHTML = '<form class="pb-box" novalidate>' +
      '<div class="pb-head"><b>學員資料</b><button type="button" class="pb-x" aria-label="關閉">✕</button></div>' +
      '<p class="pb-reason"></p>' +
      (GID ? '<div class="pb-gwrap"><span>Google 帳戶</span><div class="pb-google"></div></div>' : '') +
      '<label><span>姓名</span><input name="name" autocomplete="name" maxlength="30" required></label>' +
      '<label><span>學校科系／公司名稱</span><input name="dept" list="pb-depts" maxlength="40" placeholder="例如：資訊工程系、公司名稱" required></label>' +
      '<datalist id="pb-depts"><option value="資訊工程系"><option value="電機工程系"><option value="電子工程系"><option value="機械工程系"><option value="通訊工程系"><option value="材料與纖維系"><option value="工業管理系"><option value="資訊管理系"><option value="行銷與流通管理系"><option value="醫務管理系"><option value="護理系"><option value="應用外語系"></datalist>' +
      '<label><span>課程代碼</span><input name="code" autocomplete="off" maxlength="30" placeholder="老師在課堂上公布" required></label>' +
      '<p class="pb-err" aria-live="polite"></p>' +
      '<div class="pb-actions"><button type="button" class="pb-clear">換人使用</button><button type="submit" class="pb-save">儲存</button></div>' +
      '<p class="pb-note">資料只會送到老師的課程試算表，用於課程回饋與學習紀錄。</p></form>';
    document.body.appendChild(modal);
    var f = modal.querySelector('form'), err = modal.querySelector('.pb-err');
    modal.querySelector('.pb-x').onclick = function () { closeProfile(false); };
    modal.addEventListener('click', function (e) { if (e.target === modal) closeProfile(false); });
    modal.querySelector('.pb-clear').onclick = function () {
      del(K.profile); del(K.account); idToken = ''; f.reset(); refreshChips();
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
      if (GID) paintGoogle();
      err.textContent = '已清除，請登入並填寫新的學員資料';
    };
    f.onsubmit = function (e) {
      e.preventDefault();
      var p = { name: f.name.value.trim(), dept: f.dept.value.trim(), code: f.code.value.trim(), device: device };
      var acc = account();
      if (GID && !idToken && !(acc && acc.session)) { err.textContent = '請先按「使用 Google 帳戶登入」'; return; }
      if (!p.name || !p.dept || !p.code) { err.textContent = '請填寫姓名、學校科系／公司名稱與課程代碼'; return; }
      var btn = f.querySelector('.pb-save'); btn.disabled = true; btn.textContent = '確認中…';
      var step = GID && idToken && URL_ ? login(p).then(function (j) {
        if (!j || !j.ok) return j && j.error === 'code' ? false : 'login';
        set(K.account, { email: j.email, session: j.session, status: j.status }); idToken = '';
        return true;
      }) : checkCode(p.code);
      step.catch(function () { return 'net'; }).then(function (ok) {
        btn.disabled = false; btn.textContent = '儲存';
        if (ok === false) { err.textContent = '課程代碼不正確，請向老師確認'; return; }
        if (ok === 'login') { err.textContent = 'Google 登入沒有通過驗證，請重新登入一次'; idToken = ''; paintGoogle(); return; }
        if (ok === 'net') { err.textContent = '目前無法連線到後台，請確認網路後再試'; return; }
        set(K.profile, p); refreshChips(); closeProfile(true);
        send('profile', {}, { silent: true });
        var a = account();
        if (a && a.status !== '核准') toast('已登入：老師核准加入班級名單之後，資料會自動送出', 'warn');
        else toast('已儲存：' + p.name + '・' + p.dept, 'ok');
      });
    };
  }
  function checkCode(code) {
    if (!URL_) return Promise.resolve(null);
    return fetch(URL_ + '?code=' + encodeURIComponent(code)).then(function (r) { return r.json(); })
      .then(function (j) { return j && j.valid; }).catch(function () { return null; });
  }
  // 從後台「歌詞」分頁取得歌詞（需登入；歌詞不放在公開網站中）
  function fetchLyrics(id) {
    var p = profile();
    if (!URL_ || !complete(p)) return Promise.resolve(null);
    var a = account() || {};
    return fetch(URL_, { method: 'POST', body: JSON.stringify({ action: 'lyrics', id: id, code: p.code, session: a.session || '' }) }).then(function (r) { return r.json(); })
      .then(function (j) { return j && j.ok && j.text ? j.text : null; }).catch(function () { return null; });
  }
  // 讀回自己填過的問卷：回傳 { found, time, answers }；尚未登入回傳 { needLogin: true }，無法確認時回傳 null
  function fetchSurvey(title) {
    var p = profile(), a = account();
    if (!URL_ || !GID) return Promise.resolve(null);
    if (!complete(p)) return Promise.resolve({ needLogin: true });
    return fetch(URL_, { method: 'POST', body: JSON.stringify({ action: 'mySurvey', course: COURSE || 'vocal', title: title, code: p.code, session: a.session }) }).then(function (r) { return r.json(); })
      .then(function (j) {
        if (j && j.ok) return j;
        if (j && j.error === 'session') { del(K.account); refreshChips(); return { needLogin: true }; }
        return null;
      }).catch(function () { return null; });
  }
  // 問卷頁會帶入姓名、學校科系與課程代碼；Google 帳戶資料另外保存，不會被覆蓋
  function saveProfile(p) { var o = get(K.profile, {}) || {}; o.name = p.name; o.dept = p.dept; o.code = p.code; o.device = device; set(K.profile, o); refreshChips(); }
  function ensureProfile(reason) { var p = profile(); return complete(p) ? Promise.resolve(p) : openProfile(reason || (GID && p && p.name ? '請以 Google 帳戶登入，資料才能送到老師的試算表。' : '')); }

  /* ---------- 學員資料按鈕 ---------- */
  var chips = [];
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
  function chip(cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pb-chip ' + (cls || '');
    b.onclick = function () { openProfile(); };
    chips.push(b); paint(b); return b;
  }
  function paint(b) {
    var p = profile(), ok = complete(p), a = account();
    var sub = ok ? (a && a.status && a.status !== '核准' ? '等待老師核准' : p.dept) : '';
    b.innerHTML = ICON + '<span>' + (ok ? esc(p.name) + '<small>' + esc(sub) + '</small>' : (GID ? '登入學員資料' : '填寫學員資料')) + '</span>';
    b.classList.toggle('empty', !ok);
    b.setAttribute('aria-label', ok ? '學員資料 ' + p.name + ' ' + sub : (GID ? '登入學員資料' : '填寫學員資料'));
  }
  function refreshChips() { chips.forEach(paint); }

  /* ---------- 送出佇列 ---------- */
  var flushing = false, warnedNoUrl = false, warnedRoster = false;
  function enqueue(item) { var q = get(K.queue, []); q.push(item); set(K.queue, q.slice(-300)); }
  function post(items, code) {
    var a = account() || {};
    return fetch(URL_, { method: 'POST', body: JSON.stringify({ code: code, session: a.session || '', items: items }) }).then(function (r) { return r.json(); });
  }
  // 後台拒收時的處理：資料留在佇列，等條件符合後自動補送
  function rejected(j) {
    if (j.error === 'code') { toast('課程代碼不正確，請重新填寫學員資料', 'err'); openProfile('課程代碼不正確，請向老師確認後重新輸入。'); }
    else if (j.error === 'session') { del(K.account); refreshChips(); toast('Google 登入已失效，請重新登入學員資料', 'warn'); }
    else if (j.error === 'roster') {
      var a = account(); if (a) { a.status = j.status; set(K.account, a); refreshChips(); }
      if (!warnedRoster) { warnedRoster = true; toast(j.status === '停用' ? '這個 Gmail 已被老師停用，請向老師確認' : '尚未加入班級名單：資料已暫存，老師核准後自動送出', 'warn'); }
    }
  }
  function flush() {
    if (flushing || !URL_) return Promise.resolve();
    var q = get(K.queue, []), p = profile();
    if (!q.length || !complete(p)) return Promise.resolve();
    flushing = true;
    var batch = q.slice(0, 40);
    return post(batch, p.code).then(function (j) {
      flushing = false;
      if (!j || !j.ok) { if (j) rejected(j); return; }
      var a = account(); if (a && a.status !== '核准') { a.status = '核准'; set(K.account, a); refreshChips(); }
      var done = {}; (j.results || []).forEach(function (r) { if (r.ok) done[r.id] = 1; });
      set(K.queue, get(K.queue, []).filter(function (it) { return !done[it.id]; }));
      if (get(K.queue, []).length) return flush();
    }).catch(function () { flushing = false; });
  }
  function itemOf(type, data, opts) {
    var p = profile() || {};
    return { id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6), type: type, data: data || {}, ts: new Date().toISOString(),
      course: COURSE || 'vocal', cohort: (opts && opts.cohort) || '', lesson: (opts && opts.lesson) || LESSON || '', slide: (opts && opts.slide) || '', page: location.pathname.split('/').slice(-2).join('/'),
      profile: { name: p.name || '', dept: p.dept || '', device: device } };
  }
  // 一般資料：先放進佇列，再送出；沒有網路、尚未設定後台或尚未核准時，之後自動補送
  function send(type, data, opts) {
    opts = opts || {};
    return ensureProfile(opts.reason).then(function () {
      var it = itemOf(type, data, opts);
      enqueue(it);
      if (!URL_) { if (!opts.silent && !warnedNoUrl) { warnedNoUrl = true; toast('後台尚未設定，資料已先存在這台裝置', 'warn'); } return { queued: true }; }
      return flush().then(function () {
        var still = get(K.queue, []).some(function (x) { return x.id === it.id; }), a = account();
        var waiting = still && a && a.status && a.status !== '核准';
        if (!opts.silent) toast(waiting ? '已暫存：老師核准加入班級名單之後自動送出' : still ? '網路不穩，已暫存，稍後自動補送' : (opts.okMsg || '已送出給老師'), still ? 'warn' : 'ok');
        return { sent: !still, waiting: !!waiting };
      });
    }).catch(function () { return { cancelled: true }; });
  }
  // 互動紀錄：不打斷課堂；沒有學員資料時只先暫存，登入後補送
  function log(type, data, opts) {
    var it = itemOf(type, data, opts || {});
    enqueue(it);
    if (complete(profile())) flush();
  }
  // 錄音：檔案較大，不進佇列，直接上傳
  function upload(blob, meta) {
    return ensureProfile('上傳錄音前，請先登入並填寫學員資料。').then(function (p) {
      if (!URL_) { toast('後台尚未設定，無法上傳錄音', 'warn'); return { ok: false }; }
      toast('上傳中…', '');
      return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.readAsDataURL(blob); })
        .then(function (b64) {
          var it = itemOf('recording', { base64: b64, mime: blob.type, filename: meta.filename, label: meta.label, seconds: meta.seconds }, meta);
          return post([it], p.code);
        }).then(function (j) {
          var r = j && j.results && j.results[0];
          if (r && r.ok) { toast('錄音已上傳給老師', 'ok'); return { ok: true, url: r.url }; }
          if (j && j.error === 'roster') { toast('尚未加入班級名單，老師核准後才能上傳錄音', 'warn'); return { ok: false }; }
          if (j && j.error === 'session') { rejected(j); return { ok: false }; }
          toast(j && j.error === 'code' ? '課程代碼不正確' : '上傳失敗，請稍後再試', 'err'); return { ok: false };
        }).catch(function () { toast('上傳失敗，請檢查網路後再試', 'err'); return { ok: false }; });
    }).catch(function () { return { ok: false }; });
  }

  /* ---------- Google 登入區塊樣式 ---------- */
  function style() {
    var s = document.createElement('style');
    s.textContent = '.pb-gwrap{margin-bottom:14px}.pb-gwrap>span{display:block;font-size:13px;color:#c9c5bd;margin-bottom:6px}' +
      // color-scheme:light 讓 Google 按鈕的 iframe 保持透明，深色頁面上才不會出現白底
      '.pb-google{min-height:44px}.pb-gbtn{min-height:44px;color-scheme:light;background:transparent;margin-top:2px}.pb-gbtn iframe{color-scheme:light}' +
      '.pb-acct{display:flex;align-items:center;gap:8px;flex-wrap:wrap;background:#0d0d10;border:1px solid rgba(108,187,75,.45);border-radius:12px;padding:10px 12px;font-size:14px}' +
      '.pb-acct span{color:#6cbb4b;font-size:12px}.pb-acct b{font-weight:600;word-break:break-all;flex:1;min-width:0}' +
      '.pb-switch{font:inherit;font-size:13px;color:#9d998f;background:none;border:1px solid rgba(255,255,255,.14);border-radius:999px;padding:4px 12px;cursor:pointer}' +
      '.pb-inapp{font-size:13.5px;line-height:1.6;color:#f4a62a;background:rgba(244,166,42,.08);border:1px solid rgba(244,166,42,.35);border-radius:12px;padding:10px 12px;margin:0 0 8px}' +
      '.pb-ext{display:inline-flex;align-items:center;min-height:44px;font:inherit;font-size:14px;font-weight:700;color:#102126;background:#f4a62a;border:0;border-radius:12px;padding:0 16px;text-decoration:none;cursor:pointer}';
    document.head.appendChild(s);
  }

  addEventListener('online', flush);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
  function init() {
    if (GID) style();
    // 頂欄放學員資料按鈕：網站頁面放在 topbar，投影片放在 App 列與桌機控制列
    var tb = document.querySelector('.topbar .wrap'); if (tb) tb.appendChild(chip('top'));
    var ab = document.querySelector('.appbar'); if (ab) ab.insertBefore(chip('icon'), ab.querySelector('.ab-count'));
    // 投影片桌機版：固定在右下角，避免擋住換頁按鈕
    if (document.querySelector('.ui')) document.body.appendChild(chip('corner'));
    setTimeout(flush, 1500);
  }
  window.PixelBackend = { configured: !!URL_, google: !!GID, fetchLyrics: fetchLyrics, fetchSurvey: fetchSurvey, profile: profile, account: account, saveProfile: saveProfile, checkCode: checkCode, ensureProfile: ensureProfile, openProfile: openProfile, send: send, log: log, upload: upload, flush: flush, toast: toast, chip: chip };
})();
