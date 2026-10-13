/* Pixel Studio 學習紀錄：只存在本機瀏覽器，可匯出 JSON。
   每筆紀錄帶 courseId／courseVersion／cohortId／learnerId／lessonId／activityId／attemptId／time，
   與 Vocal Lab 舊的 pixel:* 鍵分開，避免同網域下互相覆寫。 */
(function (PS) {
  'use strict';
  var P = 'ps:v1:';
  function get(k, fallback) {
    try { var v = localStorage.getItem(P + k); return v === null ? fallback : JSON.parse(v); } catch (e) { return fallback; }
  }
  function set(k, v) {
    try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { return false; }
  }
  function uid(prefix) {
    return prefix + '-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }
  function learnerId() {
    var id = get('learner');
    if (!id) { id = uid('L'); set('learner', id); }
    return id;
  }
  /* 梯次：網址帶 ?cohort=xxx 時記住，否則為自學 self */
  function cohortId(courseId) {
    var q = new URLSearchParams(location.search).get('cohort');
    if (q && /^[\w-]{1,40}$/.test(q)) set('cohort:' + courseId, q);
    return get('cohort:' + courseId, 'self');
  }

  function Course(courseId, courseVersion) {
    this.courseId = courseId;
    this.courseVersion = courseVersion;
    this.cohortId = cohortId(courseId);
    this.learnerId = learnerId();
  }
  Course.prototype.log = function (lessonId, activityId, data) {
    var rec = {
      courseId: this.courseId, courseVersion: this.courseVersion, cohortId: this.cohortId,
      learnerId: this.learnerId, lessonId: lessonId, activityId: activityId,
      attemptId: uid('A'), time: new Date().toISOString(), data: data || {}
    };
    var all = get('records', []);
    all.push(rec);
    if (all.length > 2000) all = all.slice(-2000);
    set('records', all);
    return rec;
  };
  Course.prototype.records = function (lessonId) {
    var c = this.courseId;
    return get('records', []).filter(function (r) { return r.courseId === c && (!lessonId || r.lessonId === lessonId); });
  };
  /* 練習卡等「目前狀態」，與歷次紀錄分開存 */
  Course.prototype.state = function (lessonId, key, value) {
    var k = 'state:' + this.courseId + ':' + lessonId + ':' + key;
    if (value === undefined) return get(k);
    set(k, value);
  };
  Course.prototype.exportJSON = function () {
    var payload = {
      exportedAt: new Date().toISOString(), courseId: this.courseId, courseVersion: this.courseVersion,
      cohortId: this.cohortId, learnerId: this.learnerId, records: this.records()
    };
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    a.download = 'pixel-studio-' + this.courseId + '-紀錄-' + payload.exportedAt.slice(0, 10) + '.json';
    document.body.appendChild(a); a.click(); a.remove();
  };

  PS.store = { Course: Course, get: get, set: set };
})(window.PS = window.PS || {});
