/**
 * Pixel Studio｜課程資料後台（Google Apps Script）
 *
 * 綁定在課程資料試算表上，接收四個 Lab（Vocal、Guitar、Piano、Songwriting）網站送來的資料：
 *   學員名單、各份問卷、互動紀錄、出場券、練習紀錄、錄音（存到 Google Drive）。
 * 每筆資料都標上課程；問卷依「課程｜問卷名稱」分頁，錄音依「課程／第 N 堂」分資料夾。
 *
 * 安裝步驟請見 backend/README.md。
 */

var TABS = {
  students: { name: '學員名單', head: ['首次登錄', '最後活動', '姓名', '學校科系／公司名稱', '參與課程', '裝置代碼', '送出次數'] },
  interactions: { name: '互動紀錄', head: ['時間', '課程', '姓名', '學校科系／公司名稱', '堂次', '投影片', '互動類型', '項目', '結果', '數值', '詳細資料'] },
  exit: { name: '出場券', head: ['時間', '課程', '姓名', '學校科系／公司名稱', '堂次', '今天學到的', '想多練習的', '想問老師的'] },
  log: { name: '練習紀錄', head: ['時間', '課程', '姓名', '學校科系／公司名稱', '堂次', '天數', '欄位一', '欄位二', '欄位三'] },
  rec: { name: '錄音', head: ['時間', '課程', '姓名', '學校科系／公司名稱', '堂次', '名稱', '長度（秒）', '檔案連結'] },
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

/* ---------- 選單 ---------- */
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Pixel Studio 後台')
    .addItem('初始化工作表', 'setup')
    .addItem('設定課程代碼', 'setCode')
    .addItem('開啟錄音資料夾', 'openFolder')
    .addToUi();
}

/* ---------- 初始化：建立工作表、表頭、錄音資料夾、預設課程代碼 ---------- */
function setup() {
  var ss = SpreadsheetApp.getActive();
  Object.keys(TABS).forEach(function (k) { sheetOf(TABS[k]); });
  var first = ss.getSheets()[0];
  if (first.getName() === '工作表1' || first.getName() === 'Sheet1') {
    if (first.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(first);
  }
  var ly = sheetOf(TABS.lyrics);
  if (ly.getLastRow() < 2) { ly.appendRow(['l2-name', '刻在我心底的名字', '']); ly.setColumnWidth(3, 520); }
  folder();
  var props = PropertiesService.getScriptProperties();
  if (!props.getProperty('CLASS_CODE')) props.setProperty('CLASS_CODE', DEFAULT_CODE);
  try {
    SpreadsheetApp.getUi().alert('初始化完成', '工作表與錄音資料夾已建立。\n目前的課程代碼：' + props.getProperty('CLASS_CODE') +
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

function openFolder() {
  var url = folder().getUrl();
  var html = HtmlService.createHtmlOutput('<p style="font-family:sans-serif"><a href="' + url + '" target="_blank">開啟「' + FOLDER_NAME + '」</a></p>').setWidth(320).setHeight(80);
  SpreadsheetApp.getUi().showModalDialog(html, '錄音資料夾');
}

/* ---------- 網頁端點 ---------- */
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.lyrics !== undefined) {
    if (p.code !== classCode()) return json({ ok: false, error: 'code' });
    var sh = SpreadsheetApp.getActive().getSheetByName(TABS.lyrics.name);
    var rows = sh && sh.getLastRow() > 1 ? sh.getRange(2, 1, sh.getLastRow() - 1, 3).getValues() : [];
    for (var i = 0; i < rows.length; i++) if (String(rows[i][0]).trim() === p.lyrics && String(rows[i][2]).trim()) return json({ ok: true, title: rows[i][1], text: String(rows[i][2]) });
    return json({ ok: true, text: '' });
  }
  if (p.code !== undefined) return json({ ok: true, valid: p.code === classCode() });
  return json({ ok: true, service: SERVICE });
}

function doPost(e) {
  var body;
  try { body = JSON.parse(e.postData.contents); } catch (err) { return json({ ok: false, error: 'bad-json' }); }
  if (!body || body.code !== classCode()) return json({ ok: false, error: 'code' });
  var items = body.items || [];
  var lock = LockService.getScriptLock();
  lock.waitLock(25000);
  var results = [];
  try {
    items.forEach(function (it) {
      try { results.push({ id: it.id, ok: true, url: handle(it) || '' }); }
      catch (err) { results.push({ id: it.id, ok: false, error: String(err) }); }
    });
    SpreadsheetApp.flush();
  } finally { lock.releaseLock(); }
  return json({ ok: true, results: results });
}

/* ---------- 依資料類型寫入 ---------- */
function handle(it) {
  var p = it.profile || {}, d = it.data || {}, ts = it.ts ? new Date(it.ts) : new Date();
  var c = courseOf(it.course), lesson = lessonLabel(c, it.lesson);
  var base = { '時間': ts, '課程': c.label, '姓名': clean(p.name), '學校科系／公司名稱': clean(p.dept), '堂次': lesson };
  touchStudent(base['姓名'], base['學校科系／公司名稱'], c.label, p.device, ts);
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
  var row = { '時間': base['時間'], '姓名': base['姓名'], '學校科系／公司名稱': base['學校科系／公司名稱'] };
  qs.forEach(function (q, k) { row[clean(q)] = clean(ans[k]); });
  appendByHead({ name: (c.label + '｜' + title).slice(0, 90), head: ['時間', '姓名', '學校科系／公司名稱'] }, row);
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

function touchStudent(name, dept, course, device, ts) {
  if (!name) return;
  var sh = sheetOf(TABS.students), head = sh.getRange(1, 1, 1, Math.max(1, sh.getLastColumn())).getValues()[0];
  if (head.indexOf('參與課程') < 0) { head.push('參與課程'); sh.getRange(1, head.length).setValue('參與課程').setFontWeight('bold').setBackground('#f4efe3'); }
  var col = function (h) { return head.indexOf(h); }, last = sh.getLastRow();
  var vals = last > 1 ? sh.getRange(2, 1, last - 1, head.length).getValues() : [];
  for (var i = 0; i < vals.length; i++) {
    if (vals[i][col('姓名')] === name && vals[i][col('學校科系／公司名稱')] === dept) {
      var r = i + 2, joined = String(vals[i][col('參與課程')] || '').split('、').filter(String);
      sh.getRange(r, col('最後活動') + 1).setValue(ts);
      sh.getRange(r, col('送出次數') + 1).setValue((Number(vals[i][col('送出次數')]) || 0) + 1);
      if (joined.indexOf(course) < 0) { joined.push(course); sh.getRange(r, col('參與課程') + 1).setValue(joined.join('、')); }
      return;
    }
  }
  appendByHead(TABS.students, { '首次登錄': ts, '最後活動': ts, '姓名': name, '學校科系／公司名稱': dept, '參與課程': course, '裝置代碼': clean(device), '送出次數': 1 });
}

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
