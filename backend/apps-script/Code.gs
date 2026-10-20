/**
 * Pixel Studio｜課程資料後台（Google Apps Script）
 *
 * 綁定在課程資料試算表上，接收四個 Lab（Vocal、Guitar、Piano、Songwriting）網站送來的資料：
 *   學員名單、各份問卷、互動紀錄、出場券、練習紀錄、錄音（存到 Google Drive）。
 * 每筆資料都標上課程；問卷依「課程｜問卷名稱」分頁，錄音依「課程／第 N 堂」分資料夾。
 * 學員以 Google 帳戶登入，並且需要課程代碼；Gmail 列在「班級名單」且狀態為「核准」才會寫入資料。
 *
 * 安裝步驟請見 backend/README.md。
 */

var TABS = {
  roster: { name: '班級名單', head: ['Gmail', '姓名', '學校科系／公司名稱', '狀態', '申請時間', '備註'] },
  students: { name: '學員名單', head: ['首次登錄', '最後活動', '姓名', '學校科系／公司名稱', 'Gmail', '參與課程', '裝置代碼', '送出次數'] },
  interactions: { name: '互動紀錄', head: ['時間', '課程', '姓名', '學校科系／公司名稱', 'Gmail', '堂次', '投影片', '互動類型', '項目', '結果', '數值', '詳細資料'] },
  exit: { name: '出場券', head: ['時間', '課程', '姓名', '學校科系／公司名稱', 'Gmail', '堂次', '今天學到的', '想多練習的', '想問老師的'] },
  log: { name: '練習紀錄', head: ['時間', '課程', '姓名', '學校科系／公司名稱', 'Gmail', '堂次', '天數', '欄位一', '欄位二', '欄位三'] },
  rec: { name: '錄音', head: ['時間', '課程', '姓名', '學校科系／公司名稱', 'Gmail', '堂次', '名稱', '長度（秒）', '檔案連結'] },
  lyrics: { name: '歌詞', head: ['代碼', '歌名', '歌詞（一行一句、空行分段；字後加 ∨ 大換氣、ˇ 小換氣為老師版）'] }
};
var COURSES = {
  vocal: { label: 'Vocal Lab', unit: '堂' },
  guitar: { label: 'Guitar Lab', unit: '章' },
  piano: { label: 'Piano Lab', unit: '堂' },
  songwriting: { label: 'Songwriting Lab', unit: '堂' }
};
var DEFAULT_CODE = 'PIXEL2026';
var SERVICE = 'Pixel Studio 課程資料後台';
var TYPE_LABEL = {
  quiz: '選擇題', order: '排序遊戲', poll: '舉手計票', score: '分組計分', pitch: '音準挑戰', rhythm: '節奏挑戰', breath: '吐氣測量',
  siren: '警笛滑音', resonance: '共鳴觀測', lyric: '歌詞換氣標記', note: '課堂筆記', dynamics: '情緒地圖', range: '音域測量', transpose: '自定調',
  homework: '作業勾選', songpoll: '歌手與歌曲調查', notequiz: '音名測驗', cloze: '韻腳填空', rhyme: '押韻練習', rhetoric: '修辭獵人',
  wordhunt: '關鍵字尋寶', dice: '歌詞骰子', lyricdice: '歌詞創作骰子', lyricform: '歌詞結構', notebook: '素材庫', songcard: '歌曲卡',
  cheer: '鼓勵', form: '表單', interaction: '課堂互動'
};
var FOLDER_NAME = 'Pixel Studio_學員錄音';
// Google 登入：Google Cloud「網頁應用程式」用戶端 ID（公開資訊，與網站 config.js 相同）
var GOOGLE_CLIENT_ID = '69409708438-korhf825kclirfkdv7abp8n9gk45jdbj.apps.googleusercontent.com';
var SESSION_DAYS = 180;
var APPROVED = '核准', PENDING = '待確認';

/* ---------- 選單 ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pixel Studio 後台')
    .addItem('初始化工作表', 'setup')
    .addItem('設定課程代碼', 'setCode')
    .addItem('核准所有待確認學員', 'approveAll')
    .addItem('開啟錄音資料夾', 'openFolder')
    .addToUi();
}

/* ---------- 初始化：建立工作表、表頭、錄音資料夾、預設課程代碼 ---------- */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (k) {
    var sh = sheetOf(TABS[k]);
    // 只有表頭、尚無資料的工作表，更新為最新的表頭順序
    if (sh.getLastRow() <= 1) {
      sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), TABS[k].head.length)).clearContent();
      sh.getRange(1, 1, 1, TABS[k].head.length).setValues([TABS[k].head]).setFontWeight('bold').setBackground('#f4efe3');
    }
  });
  var ro = sheetOf(TABS.roster);
  ro.getRange('A:A').setNumberFormat('@'); ro.getRange('E:E').setNumberFormat('yyyy/mm/dd hh:mm');
  ro.getRange('D2:D').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList([APPROVED, PENDING, '停用'], true).build());
  var first = ss.getSheets()[0];
  if (first.getName() === '工作表1' || first.getName() === 'Sheet1') {
    if (first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  }
  var ly = sheetOf(TABS.lyrics);
  if (ly.getLastRow() < 2) { ly.appendRow(['l2-name', '刻在我心底的名字', '']); ly.setColumnWidth(3, 520); }
  folder();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLASS_CODE')) props.setProperty('CLASS_CODE', DEFAULT_CODE);
  secret();
  UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo', { muteHttpExceptions: true }); // 授權時一併要求「連線到外部服務」
  try {
    SpreadsheetApp.getUi().alert('初始化完成', '工作表與錄音資料夾已建立。\n目前的課程代碼：' + props.getProperty('CLASS_CODE') +
      '\n\n學員以 Google 帳戶登入後會出現在「班級名單」，狀態改為「核准」後資料才會寫入。' +
      '\n\n下一步：部署 → 新增部署作業 → 網頁應用程式（執行身分：我；存取權：所有人），並將網址提供給網站。', SpreadsheetApp.getUi().ButtonSet.OK);
  } catch (e) { Logger.log('目前的課程代碼：' + props.getProperty('CLASS_CODE')); }
}

function setCode() {
  var ui = SpreadsheetApp.getUi(), props = PropertiesService.getScriptProperties();
  var r = ui.prompt('設定課程代碼', '目前的代碼：' + (props.getProperty('CLASS_CODE') || DEFAULT_CODE) + '\n請輸入新的代碼（學員填寫資料時需要輸入）：', ui.ButtonSet.OK_CANCEL);
  if (r.getSelectedButton() === ui.Button.OK && r.getResponseText().trim()) {
    props.setProperty('CLASS_CODE', r.getResponseText().trim());
    ui.alert('已更新課程代碼：' + r.getResponseText().trim());
  }
}

// 將「班級名單」裡所有「待確認」改為「核准」
function approveAll() {
  var sh = sheetOf(TABS.roster), last = sh.getLastRow(), n = 0;
  if (last > 1) {
    var rg = sh.getRange(2, 4, last - 1, 1), v = rg.getValues();
    v.forEach(function (r) { if (String(r[0]).trim() === PENDING) { r[0] = APPROVED; n++; } });
    rg.setValues(v);
  }
  CacheService.getScriptCache().remove('roster');
  SpreadsheetApp.getUi().alert('已核准 ' + n + ' 位學員');
}

function openFolder() {
  var url = folder().getUrl();
  var html = HtmlService.createHtmlOutput('<p style="font-family:sans-serif"><a href="' + url + '" target="_blank">開啟「' + FOLDER_NAME + '」</a></p>').setWidth(320).setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, '錄音資料夾');
}

/* ---------- 網頁端點 ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.code !== undefined) return json({ ok: true, valid: p.code === classCode() });
  return json({ ok: true, service: SERVICE });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad-json' }); }
  if (!body || body.code !== classCode()) return json({ ok: false, error: 'code' });
  if (body.action === 'login') return json(login(body.idToken, body.name, body.dept));
  var email = sessionEmail(body.session);
  if (!email) return json({ ok: false, error: 'session' });
  var status = rosterStatus(email);
  if (status !== APPROVED) return json({ ok: false, error: 'roster', status: status || PENDING });
  if (body.action === 'lyrics') return json(lyrics(String(body.id || '')));
  var items = body.items || [];
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  var results = [];
  try {
    items.forEach(function (it) {
      try { results.push({ id: it.id, ok: true, url: handle(it, email) || '' }); }
      catch (err) { results.push({ id: it.id, ok: false, error: String(err) }); }
    });
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return json({ ok: true, results: results });
}

/* ---------- 依資料類型寫入 ---------- */
function handle(it, email) {
  var p = it.profile || {}, d = it.data || {}, ts = it.ts ? new Date(it.ts) : new Date();
  var c = courseOf(it.course), lesson = lessonLabel(c, it.lesson);
  var base = { '時間': ts, '課程': c.label, '姓名': clean(p.name), '學校科系／公司名稱': clean(p.dept), 'Gmail': email, '堂次': lesson };
  touchStudent(base, c.label, p.device, ts);
  switch (it.type) {
    case 'profile':
      return '';
    case 'survey':
      return writeSurvey(it, c, base);
    case 'exit':
      var a = (d.answers || []).map(clean);
      appendByHead(TABS.exit, merge(base, { '今天學到的': a[0], '想多練習的': a[1], '想問老師的': a[2] }));
      return '';
    case 'log7':
      (d.rows || []).forEach(function (r) {
        if (r.slice(1).some(function (v) { return String(v).trim(); })) appendByHead(TABS.log, merge(base, { '天數': '第' + r[0] + '天', '欄位一': clean(r[1]), '欄位二': clean(r[2]), '欄位三': clean(r[3]) }));
      });
      return '';
    case 'recording':
      var blob = Utilities.newBlob(Utilities.base64Decode(d.base64), d.mime || 'audio/webm', safeName(d.filename || '錄音'));
      var file = lessonFolder(c, it.lesson).createFile(blob);
      file.setDescription(base['姓名'] + '（' + base['學校科系／公司名稱'] + '）' + c.label + ' ' + lesson);
      appendByHead(TABS.rec, merge(base, { '名稱': clean(d.label), '長度（秒）': d.seconds || '', '檔案連結': file.getUrl() }));
      return file.getUrl();
    default:
      appendByHead(TABS.interactions, merge(base, { '投影片': it.slide || '', '互動類型': TYPE_LABEL[it.type] || clean(it.type), '項目': clean(d.item), '結果': clean(d.result), '數值': d.value === undefined ? '' : d.value, '詳細資料': JSON.stringify(d.detail || '').slice(0, 45000) }));
      return '';
  }
}

// 問卷：每份問卷一個分頁（課程名稱開頭，避免四個 Lab 的同名問卷混在一起），一欄一題
function writeSurvey(it, c, base) {
  var d = it.data || {}, title = clean(d.title || '問卷'), qs = d.questions || [], ans = d.answers || [];
  var row = { '時間': base['時間'], '姓名': base['姓名'], '學校科系／公司名稱': base['學校科系／公司名稱'], 'Gmail': base['Gmail'] };
  qs.forEach(function (q, k) { row[clean(q)] = clean(ans[k]); });
  appendByHead({ name: (c.label + '｜' + title).slice(0, 90), head: ['時間', '姓名', '學校科系／公司名稱', 'Gmail'] }, row);
  return '';
}

/* ---------- 工具 ---------- */
// 依表頭名稱寫入；表頭缺少的欄位自動加在最後，舊版工作表也能繼續使用
function appendByHead(def, obj) {
  var sh = sheetOf(def), width = Math.max(1, sh.getLastColumn()), head = sh.getRange(1, 1, 1, width).getValues()[0];
  Object.keys(obj).forEach(function (k) {
    if (head.indexOf(k) < 0) { head.push(k); sh.getRange(1, head.length).setValue(k).setFontWeight('bold').setBackground('#f4efe3'); }
  });
  sh.appendRow(head.map(function (h) { var v = obj[h]; return v === undefined || v === null ? '' : v; }));
}

// 學員名單：以 Gmail 辨認同一位學員，姓名與學校科系以最新填寫為準
function touchStudent(base, course, device, ts) {
  var email = base['Gmail'], name = base['姓名'], dept = base['學校科系／公司名稱'];
  if (!email && !name) return;
  var sh = sheetOf(TABS.students), head = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
  ['Gmail', '參與課程'].forEach(function (h) { if (head.indexOf(h) < 0) { head.push(h); sh.getRange(1, head.length).setValue(h).setFontWeight('bold').setBackground('#f4efe3'); } });
  var col = function (h) { return head.indexOf(h); }, last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2, 1, last - 1, head.length).getValues() : [];
  for (var i = 0; i < vals.length; i++) {
    var same = email ? String(vals[i][col('Gmail')]).toLowerCase() === email : vals[i][col('姓名')] === name && vals[i][col('學校科系／公司名稱')] === dept;
    if (same) {
      var r = i + 2, joined = String(vals[i][col('參與課程')] || '').split('、').filter(String);
      sh.getRange(r, col('最後活動') + 1).setValue(ts);
      sh.getRange(r, col('送出次數') + 1).setValue((Number(vals[i][col('送出次數')]) || 0) + 1);
      if (name) sh.getRange(r, col('姓名') + 1).setValue(name);
      if (dept) sh.getRange(r, col('學校科系／公司名稱') + 1).setValue(dept);
      if (joined.indexOf(course) < 0) { joined.push(course); sh.getRange(r, col('參與課程') + 1).setValue(joined.join('、')); }
      return;
    }
  }
  appendByHead(TABS.students, { '首次登錄': ts, '最後活動': ts, '姓名': name, '學校科系／公司名稱': dept, 'Gmail': email, '參與課程': course, '裝置代碼': clean(device), '送出次數': 1 });
}

/* ---------- Google 登入與班級名單 ---------- */
// 驗證 Google 發給網站的登入憑證，確認後發給學員一張長效的登入證明，避免每小時重新登入
function login(idToken, name, dept) {
  if (!GOOGLE_CLIENT_ID) return { ok: false, error: 'setup' };
  if (!idToken) return { ok: false, error: 'token' };
  var r = UrlFetchApp.fetch('https://oauth2.googleapis.com/tokeninfo?id_token=' + encodeURIComponent(idToken), { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) return { ok: false, error: 'token' };
  var t = JSON.parse(r.getContentText());
  if (t.aud !== GOOGLE_CLIENT_ID || String(t.email_verified) !== 'true' || !/accounts\.google\.com$/.test(t.iss || '')) return { ok: false, error: 'token' };
  var email = String(t.email).toLowerCase(), status = rosterStatus(email);
  if (!status) { addPending(email, name || t.name || '', dept || ''); status = PENDING; }
  return { ok: true, email: email, name: t.name || '', status: status, session: issueSession(email) };
}

function rosterStatus(email) {
  if (email && email === ownerEmail()) return APPROVED;
  var map = rosterMap();
  return map.hasOwnProperty(email) ? map[email] : '';
}

// 班級名單快取一分鐘；老師在試算表改狀態後，最晚一分鐘生效
function rosterMap() {
  var cache = CacheService.getScriptCache(), hit = cache.get('roster');
  if (hit) return JSON.parse(hit);
  var sh = sheetOf(TABS.roster), last = sh.getLastRow(), map = {};
  if (last > 1) sh.getRange(2, 1, last - 1, 4).getValues().forEach(function (r) {
    var e = String(r[0]).trim().toLowerCase();
    if (e) map[e] = String(r[3]).trim() || APPROVED;
  });
  cache.put('roster', JSON.stringify(map), 60);
  return map;
}

function addPending(email, name, dept) {
  var lock = LockService.getScriptLock(); lock.waitLock(20000);
  try {
    CacheService.getScriptCache().remove('roster');
    if (rosterMap().hasOwnProperty(email)) return;
    appendByHead(TABS.roster, { 'Gmail': email, '姓名': clean(name), '學校科系／公司名稱': clean(dept), '狀態': PENDING, '申請時間': new Date(), '備註': '學員登入時自動加入' });
    CacheService.getScriptCache().remove('roster');
  } finally { lock.releaseLock(); }
}

function issueSession(email) {
  var payload = email + '|' + (Date.now() + SESSION_DAYS * 864e5);
  return b64(payload) + '.' + sign(payload);
}

function sessionEmail(token) {
  var parts = String(token || '').split('.'), payload;
  if (parts.length !== 2) return '';
  try { payload = Utilities.newBlob(Utilities.base64DecodeWebSafe(pad(parts[0]))).getDataAsString(); } catch (e) { return ''; }
  if (sign(payload) !== parts[1]) return '';
  var p = payload.split('|');
  return Number(p[1]) > Date.now() ? p[0] : '';
}

function lyrics(id) {
  var sh = SpreadsheetApp.getActive().getSheetByName(TABS.lyrics.name);
  var rows = sh && sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues() : [];
  for (var i = 0; i < rows.length; i++) if (String(rows[i][0]).trim() === id && String(rows[i][2]).trim()) return { ok: true, title: rows[i][1], text: String(rows[i][2]) };
  return { ok: true, text: '' };
}

function secret() {
  var props = PropertiesService.getScriptProperties(), s = props.getProperty('SESSION_SECRET');
  if (!s) { s = Utilities.getUuid() + Utilities.getUuid(); props.setProperty('SESSION_SECRET', s); }
  return s;
}
function sign(payload) { return Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(payload, secret())).replace(/=+$/, ''); }
function b64(s) { return Utilities.base64EncodeWebSafe(Utilities.newBlob(s).getBytes()).replace(/=+$/, ''); }
function pad(s) { return s + '===='.slice((s.length % 4) || 4); }
function ownerEmail() { try { return String(Session.getEffectiveUser().getEmail() || '').toLowerCase(); } catch (e) { return ''; } }

function sheetOf(def) {
  var ss = SpreadsheetApp.getActive(), sh = ss.getSheetByName(def.name);
  if (!sh) {
    sh = ss.insertSheet(def.name);
    sh.getRange(1, 1, 1, def.head.length).setValues([def.head]).setFontWeight('bold').setBackground('#f4efe3');
    sh.setFrozenRows(1);
    sh.getRange('A:B').setNumberFormat('yyyy/mm/dd hh:mm');
  }
  return sh;
}

function folder() {
  var props = PropertiesService.getScriptProperties(), id = props.getProperty('FOLDER_ID');
  if (id) { try { return DriveApp.getFolderById(id); } catch (e) {} }
  var f = DriveApp.createFolder(FOLDER_NAME);
  props.setProperty('FOLDER_ID', f.getId());
  return f;
}

function childFolder(parent, name) { var it = parent.getFoldersByName(name); return it.hasNext() ? it.next() : parent.createFolder(name); }
function lessonFolder(c, lesson) { return childFolder(childFolder(folder(), c.label), lesson ? lessonLabel(c, lesson) : '其他'); }

function courseOf(id) { var c = COURSES[id] || COURSES.vocal; return { id: COURSES[id] ? id : 'vocal', label: c.label, unit: c.unit }; }
// 堂次可能是 3、ch03、p03、s03，一律取最後的數字
function lessonLabel(c, lesson) { var m = /(\d+)$/.exec(String(lesson || '')); return m ? '第' + Number(m[1]) + c.unit : clean(lesson); }
function merge(a, b) { var o = {}; Object.keys(a).forEach(function (k) { o[k] = a[k]; }); Object.keys(b).forEach(function (k) { o[k] = b[k]; }); return o; }
function classCode() { return PropertiesService.getScriptProperties().getProperty('CLASS_CODE') || DEFAULT_CODE; }
function clean(v) { return v === undefined || v === null ? '' : String(v).replace(/^[=+\-@]/, "'$&").slice(0, 5000); }
function safeName(s) { return String(s).replace(/[\\/:*?"<>|]/g, '_').slice(0, 120); }
function json(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
