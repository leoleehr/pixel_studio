/* ===== Pixel Studio 資料回收：學員資料、送出佇列、Google 試算表後台 =====
 * 需要先載入 config.js。所有資料以 JSON 送到 Google Apps Script（見 backend/README.md）。
 * 設定 googleClientId 後，學員必須以 Google 帳戶登入並輸入課程代碼；代碼正確即自動加入「班級名單」，老師設為停用或待確認時暫停寫入。
 */
(function () {
  'use strict';
  var CFG = window.PIXEL_CONFIG || {}, URL_ = (CFG.endpoint || '').trim(), GID = (CFG.googleClientId || '').trim();
  // 課程識別：body[data-course]（如 guitar）與 [data-lesson]；Vocal Lab 舊頁面沒有標記時沿用原本的鍵與 lesson-N 路徑
  var COURSE = document.body.getAttribute('data-course') || '';
  // 隱私權政策與本檔同在網站根目錄之下（assets/backend.js → privacy.html），任何深度的頁面都能連到
  var PRIVACY = (function () { try { return new URL('../privacy.html', document.currentScript.src).href; } catch (e) { return '/privacy.html'; } })();
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
    // 成功訊息短暫顯示；提醒與錯誤留久一點，學員才不會錯過資料沒送出的狀態
    clearTimeout(toastT); toastT = setTimeout(function () { toastEl.classList.remove('on'); }, kind === 'ok' ? 3600 : 8000);
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
      box.innerHTML = '<div class="pb-acct"><span>Signed in</span><b>' + esc(email) + '</b><button type="button" class="pb-switch">Switch account</button></div>';
      box.querySelector('.pb-switch').onclick = function () { idToken = ''; del(K.account); refreshChips(); paintGoogle(); };
      return;
    }
    if (INAPP) {
      var u = location.href.split('#')[0], ext = /Line\//i.test(navigator.userAgent) ? u + (u.indexOf('?') > -1 ? '&' : '?') + 'openExternalBrowser=1' : '';
      box.innerHTML = '<p class="pb-inapp">Google sign-in doesn\'t work inside the LINE, Facebook or Instagram browser. Please open this page in Chrome or Safari.</p>' +
        (ext ? '<a class="pb-ext" href="' + esc(ext) + '">Open in default browser</a>' : '<button type="button" class="pb-ext">Copy link</button>');
      var b = box.querySelector('button.pb-ext');
      // 內建瀏覽器常擋剪貼簿：複製失敗時改成可長按選取的網址欄
      if (b) b.onclick = function () {
        (navigator.clipboard ? navigator.clipboard.writeText(u) : Promise.reject()).then(function () { toast('Link copied. Paste it into Chrome or Safari', 'ok'); }, function () {
          b.outerHTML = '<input class="pb-url" type="text" readonly aria-label="Link to this page" value="' + esc(u) + '">';
          var f = box.querySelector('.pb-url'); f.focus(); f.select();
          toast('Couldn\'t copy automatically. Press and hold the link to select and copy it', 'warn');
        });
      };
      return;
    }
    box.innerHTML = '<div class="pb-gbtn"></div>';
    loadGis().then(function () {
      var el = box.querySelector('.pb-gbtn');
      google.accounts.id.renderButton(el, { type: 'standard', theme: 'filled_black', size: 'large', shape: 'pill', text: 'signin_with', logo_alignment: 'left', locale: 'zh-TW', width: Math.min(400, Math.max(200, Math.round(el.getBoundingClientRect().width || 300))) });
    }).catch(function () { box.innerHTML = '<p class="pb-inapp">Google sign-in couldn\'t load. Check your connection and open this page again.</p>'; });
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
  var modal = null, pending = [], opener = null;
  var FOCUSABLE = 'button:not([disabled]), a[href], input:not([disabled]), iframe, [tabindex]:not([tabindex="-1"])';
  function openProfile(reason) {
    return new Promise(function (resolve, reject) {
      pending.push({ resolve: resolve, reject: reject });
      if (!modal) build();
      var p = profile() || {};
      modal.querySelector('[name=name]').value = p.name || '';
      modal.querySelector('[name=dept]').value = p.dept || '';
      modal.querySelector('[name=code]').value = p.code || '';
      modal.querySelector('.pb-reason').textContent = reason || (GID ? 'Sign in with your Google account and fill this in once. Every survey and class activity you send afterwards will include your Gmail, name and school department or company.' : 'Fill this in once. Every survey and class activity you send afterwards will include your name and school department or company.');
      modal.querySelector('.pb-err').textContent = '';
      modal.querySelector('.pb-clear').style.display = p.name || account() ? '' : 'none';
      if (GID) paintGoogle();
      if (!modal.classList.contains('on')) opener = document.activeElement;
      modal.classList.add('on'); document.documentElement.classList.add('pb-open');
      // 背景暫停接受焦點；尚未登入 Google 時先停在登入區塊，已登入才進姓名欄
      Array.prototype.forEach.call(document.body.children, function (el) { if (el !== modal && !el.hasAttribute('inert')) { el.setAttribute('inert', ''); el.dataset.pbInert = '1'; } });
      setTimeout(function () { (GID && !account() && !INAPP ? modal.querySelector('.pb-google') : modal.querySelector('[name=name]')).focus(); }, 60);
    });
  }
  function closeProfile(ok) {
    modal.classList.remove('on'); document.documentElement.classList.remove('pb-open');
    Array.prototype.forEach.call(document.querySelectorAll('[data-pb-inert]'), function (el) { el.removeAttribute('inert'); delete el.dataset.pbInert; });
    if (opener && document.contains(opener)) opener.focus();
    opener = null;
    var list = pending; pending = [];
    list.forEach(function (p) { ok ? p.resolve(profile()) : p.reject(new Error('cancel')); });
  }
  function build() {
    modal = document.createElement('div'); modal.className = 'pb-modal'; modal.setAttribute('role', 'dialog'); modal.setAttribute('aria-modal', 'true'); modal.setAttribute('aria-label', 'Student profile');
    modal.innerHTML = '<form class="pb-box" novalidate>' +
      '<div class="pb-head"><b>Student profile</b><button type="button" class="pb-x" aria-label="Close">✕</button></div>' +
      '<p class="pb-reason"></p>' +
      (GID ? '<div class="pb-gwrap"><span>Google account</span><div class="pb-google" tabindex="-1" role="group" aria-label="Sign in with Google"></div></div>' : '') +
      '<label><span>Name</span><input name="name" autocomplete="name" maxlength="30" required></label>' +
      '<label><span>School department / company</span><input name="dept" list="pb-depts" maxlength="40" placeholder="e.g. Computer Science, your company" required></label>' +
      '<datalist id="pb-depts"><option value="Computer Science and Information Engineering"><option value="Electrical Engineering"><option value="Electronic Engineering"><option value="Mechanical Engineering"><option value="Communications Engineering"><option value="Materials and Textiles"><option value="Industrial Management"><option value="Information Management"><option value="Marketing and Distribution Management"><option value="Healthcare Administration"><option value="Nursing"><option value="Applied Foreign Languages"></datalist>' +
      '<label><span>Course code</span><input name="code" autocomplete="off" maxlength="30" placeholder="Given out by the teacher in class" required></label>' +
      '<p class="pb-err" aria-live="polite"></p>' +
      '<div class="pb-actions"><button type="button" class="pb-clear">Switch user</button><button type="submit" class="pb-save">Save</button></div>' +
      '<p class="pb-note">Your details and recordings go only to the teacher\'s Google Sheet and Google Drive, for course feedback and learning records. <a href="' + PRIVACY + '" target="_blank" rel="noopener">Privacy policy</a></p></form>';
    document.body.appendChild(modal);
    var f = modal.querySelector('form'), err = modal.querySelector('.pb-err');
    modal.querySelector('.pb-x').onclick = function () { closeProfile(false); };
    modal.addEventListener('click', function (e) { if (e.target === modal) closeProfile(false); });
    // Escape 關閉；Tab／Shift+Tab 在視窗內循環
    modal.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); closeProfile(false); return; }
      if (e.key !== 'Tab') return;
      var list = Array.prototype.filter.call(modal.querySelectorAll(FOCUSABLE), function (el) { return el.offsetParent !== null; });
      if (!list.length) return;
      var first = list[0], last = list[list.length - 1], at = document.activeElement;
      if (e.shiftKey && (at === first || at === modal.querySelector('.pb-google'))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && at === last) { e.preventDefault(); first.focus(); }
    });
    modal.querySelector('.pb-clear').onclick = function () {
      del(K.profile); del(K.account); idToken = ''; f.reset(); refreshChips();
      try { google.accounts.id.disableAutoSelect(); } catch (e) {}
      if (GID) paintGoogle();
      err.textContent = 'Cleared. Please sign in and fill in the new student\'s details';
    };
    f.onsubmit = function (e) {
      e.preventDefault();
      var p = { name: f.name.value.trim(), dept: f.dept.value.trim(), code: f.code.value.trim(), device: device };
      var acc = account();
      if (GID && !idToken && !(acc && acc.session)) { err.textContent = 'Please tap "Sign in with Google" first'; return; }
      if (!p.name || !p.dept || !p.code) { err.textContent = 'Please fill in your name, school department or company, and the course code'; return; }
      var btn = f.querySelector('.pb-save'); btn.disabled = true; btn.textContent = 'Checking…';
      var step = GID && idToken && URL_ ? login(p).then(function (j) {
        if (!j || !j.ok) return j && j.error === 'code' ? false : 'login';
        set(K.account, { email: j.email, session: j.session, status: j.status }); idToken = '';
        return true;
      }) : checkCode(p.code);
      step.catch(function () { return 'net'; }).then(function (ok) {
        btn.disabled = false; btn.textContent = 'Save';
        if (ok === false) { err.textContent = 'That course code isn\'t right. Please check with the teacher'; return; }
        if (ok === 'login') { err.textContent = 'Google sign-in couldn\'t be verified. Please sign in again'; idToken = ''; paintGoogle(); return; }
        if (ok === 'net') { err.textContent = 'Can\'t reach the server right now. Check your connection and try again'; return; }
        set(K.profile, p); refreshChips(); closeProfile(true);
        send('profile', {}, { silent: true });
        var a = account();
        if (a && a.status !== '核准') toast('Signed in. Once the teacher adds you to the class list, your data will be sent automatically', 'warn');
        else toast('Saved: ' + p.name + '・' + p.dept, 'ok');
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
  function ensureProfile(reason) { var p = profile(); return complete(p) ? Promise.resolve(p) : openProfile(reason || (GID && p && p.name ? 'Please sign in with Google so your data can reach the teacher\'s sheet.' : '')); }

  /* ---------- 學員資料按鈕 ---------- */
  var chips = [];
  var ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c1.5-4 4.5-6 8-6s6.5 2 8 6"/></svg>';
  function chip(cls) {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'pb-chip ' + (cls || '');
    b.onclick = function () { openProfile().catch(function () {}); };
    chips.push(b); paint(b); return b;
  }
  function paint(b) {
    var p = profile(), ok = complete(p), a = account();
    var sub = ok ? (a && a.status && a.status !== '核准' ? 'Waiting for teacher approval' : p.dept) : '';
    b.innerHTML = ICON + '<span>' + (ok ? esc(p.name) + '<small>' + esc(sub) + '</small>' : (GID ? 'Sign in' : 'Fill in your details')) + '</span>';
    b.classList.toggle('empty', !ok);
    b.setAttribute('aria-label', ok ? 'Student profile ' + p.name + ' ' + sub : (GID ? 'Sign in' : 'Fill in your details'));
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
    if (j.error === 'code') { toast('That course code isn\'t right. Please fill in your details again', 'err'); openProfile('That course code isn\'t right. Please check with the teacher and enter it again.').catch(function () {}); }
    else if (j.error === 'session') { del(K.account); refreshChips(); toast('Your Google sign-in has expired. Please sign in again', 'warn'); }
    else if (j.error === 'roster') {
      var a = account(); if (a) { a.status = j.status; set(K.account, a); refreshChips(); }
      if (!warnedRoster) { warnedRoster = true; toast(j.status === '停用' ? 'The teacher has disabled this Gmail account. Please check with the teacher' : 'Not on the class list yet. Your data is saved and will be sent once the teacher approves you', 'warn'); }
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
  // 通知 analytics.js：只帶種類、課次與投影片，不含作答內容
  function emit(kind, it) {
    try { document.dispatchEvent(new CustomEvent('ps:activity', { detail: { kind: kind, type: it.type, lesson: it.lesson, slide: it.slide } })); } catch (e) {}
  }
  // 一般資料：先放進佇列，再送出；沒有網路、尚未設定後台或尚未核准時，之後自動補送
  function send(type, data, opts) {
    opts = opts || {};
    return ensureProfile(opts.reason).then(function () {
      var it = itemOf(type, data, opts);
      enqueue(it);
      emit('submit', it);
      if (!URL_) { if (!opts.silent && !warnedNoUrl) { warnedNoUrl = true; toast('The server isn\'t set up yet. Your data is saved on this device for now', 'warn'); } return { queued: true }; }
      return flush().then(function () {
        var still = get(K.queue, []).some(function (x) { return x.id === it.id; }), a = account();
        var waiting = still && a && a.status && a.status !== '核准';
        if (!opts.silent) toast(waiting ? 'Saved. It will be sent once the teacher adds you to the class list' : still ? 'Connection is unstable. Saved for now and will be sent later' : (opts.okMsg || 'Sent to the teacher'), still ? 'warn' : 'ok');
        return { sent: !still, waiting: !!waiting };
      });
    }).catch(function () { return { cancelled: true }; });
  }
  // 互動紀錄：不打斷課堂；沒有學員資料時只先暫存，登入後補送
  function log(type, data, opts) {
    var it = itemOf(type, data, opts || {});
    enqueue(it);
    emit('interaction', it);
    if (complete(profile())) flush();
  }
  // 錄音：檔案較大，不進佇列，直接上傳
  function upload(blob, meta) {
    return ensureProfile('Please sign in and fill in your details before uploading a recording.').then(function (p) {
      if (!URL_) { toast('The server isn\'t set up yet, so recordings can\'t be uploaded', 'warn'); return { ok: false }; }
      toast('Uploading…', '');
      return new Promise(function (res) { var r = new FileReader(); r.onload = function () { res(String(r.result).split(',')[1]); }; r.readAsDataURL(blob); })
        .then(function (b64) {
          var it = itemOf('recording', { base64: b64, mime: blob.type, filename: meta.filename, label: meta.label, seconds: meta.seconds }, meta);
          return post([it], p.code);
        }).then(function (j) {
          var r = j && j.results && j.results[0];
          if (r && r.ok) { emit('upload', { type: 'recording', lesson: meta.lesson || LESSON || '', slide: meta.slide || '' }); toast('Recording uploaded to the teacher', 'ok'); return { ok: true, url: r.url }; }
          if (j && j.error === 'roster') { toast('Not on the class list yet. You can upload recordings after the teacher approves you', 'warn'); return { ok: false }; }
          if (j && j.error === 'session') { rejected(j); return { ok: false }; }
          toast(j && j.error === 'code' ? 'Course code isn\'t right' : 'Upload failed. Please try again later', 'err'); return { ok: false };
        }).catch(function () { toast('Upload failed. Check your connection and try again', 'err'); return { ok: false }; });
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
      '.pb-url{width:100%;min-height:44px;font:inherit;font-size:13px;color:#f3f1ec;background:#0d0d10;border:1px solid rgba(244,166,42,.45);border-radius:12px;padding:0 12px}' +
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
