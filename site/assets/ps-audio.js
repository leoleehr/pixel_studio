/* Pixel Studio 共用音訊：節拍器、吉他撥弦合成、錄音。 */
(function (PS) {
  'use strict';
  var ctx = null;
  function ac() {
    if (!ctx) {
      var A = window.AudioContext || window.webkitAudioContext;
      if (!A) return null;
      ctx = new A();
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }

  /* 節拍器滴答聲：accent 2 = 小節第一拍，1 = 拍點，0 = 半拍 */
  function click(time, accent) {
    var c = ac(); if (!c) return;
    var o = c.createOscillator(), g = c.createGain();
    o.frequency.value = accent === 2 ? 1760 : accent === 1 ? 1320 : 990;
    var peak = accent === 0 ? 0.08 : 0.22;
    g.gain.setValueAtTime(0.0001, time);
    g.gain.exponentialRampToValueAtTime(peak, time + 0.002);
    g.gain.exponentialRampToValueAtTime(0.0001, time + 0.05);
    o.connect(g).connect(c.destination);
    o.start(time); o.stop(time + 0.06);
  }

  /* 以 Karplus-Strong 產生撥弦音色，依頻率快取 */
  var cache = {};
  function pluckBuffer(freq) {
    var c = ac(), key = Math.round(freq * 10);
    if (cache[key]) return cache[key];
    var sr = c.sampleRate, len = Math.floor(sr * 2.2), buf = c.createBuffer(1, len, sr), d = buf.getChannelData(0);
    var N = Math.max(2, Math.round(sr / freq)), i;
    for (i = 0; i < N; i++) d[i] = Math.random() * 2 - 1;
    for (i = N; i < len; i++) d[i] = 0.996 * 0.5 * (d[i - N] + d[i - N + 1]);
    cache[key] = buf;
    return buf;
  }
  var OPEN = [82.41, 110, 146.83, 196, 246.94, 329.63]; // 6 弦到 1 弦
  function noteFreq(stringIdx, fret) { return OPEN[stringIdx] * Math.pow(2, fret / 12); }

  /* frets：6 弦到 1 弦，-1 為悶音。dir：'down' | 'up'。 */
  function strum(frets, time, dir, opts) {
    var c = ac(); if (!c) return;
    opts = opts || {};
    time = time || c.currentTime;
    var idx = [];
    frets.forEach(function (f, i) { if (f >= 0) idx.push(i); });
    if (dir === 'up') idx = idx.slice(-4).reverse();
    var gap = opts.gap || (dir === 'up' ? 0.011 : 0.015);
    var vol = (opts.volume || 0.16) * (dir === 'up' ? 0.7 : 1);
    var out = c.createGain();
    out.gain.value = vol;
    var lp = c.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 4200;
    out.connect(lp).connect(c.destination);
    var dur = opts.duration || 1.6;
    idx.forEach(function (s, n) {
      var src = c.createBufferSource(), g = c.createGain(), t = time + n * gap;
      src.buffer = pluckBuffer(noteFreq(s, frets[s]));
      g.gain.setValueAtTime(1, t);
      g.gain.setTargetAtTime(0.0001, t + dur, 0.05);
      src.connect(g).connect(out);
      src.start(t); src.stop(t + dur + 0.4);
    });
  }

  /* 節拍器：每拍分成 steps 格（1 = 四分音符，2 = 八分音符） */
  function Metronome(opts) {
    this.bpm = opts.bpm || 60;
    this.beats = opts.beats || 4;
    this.steps = opts.steps || 1;
    this.onStep = opts.onStep || function () {};
    this.clickSub = !!opts.clickSub;
    this.muted = false;
    this.running = false;
  }
  Metronome.prototype.start = function () {
    var c = ac(); if (!c || this.running) return false;
    this.running = true;
    this.step = 0;
    this.next = c.currentTime + 0.12;
    var self = this;
    this.timer = setInterval(function () { self._tick(); }, 25);
    this._tick();
    return true;
  };
  Metronome.prototype.stop = function () {
    this.running = false;
    clearInterval(this.timer);
    (this.pending || []).forEach(clearTimeout);
    this.pending = [];
  };
  Metronome.prototype._tick = function () {
    var c = ac(), self = this;
    this.pending = this.pending || [];
    while (this.next < c.currentTime + 0.1) {
      var stepsPerBar = this.beats * this.steps;
      var s = this.step % stepsPerBar, onBeat = s % this.steps === 0;
      if (!this.muted && (onBeat || this.clickSub)) click(this.next, s === 0 ? 2 : onBeat ? 1 : 0);
      (function (step, time) {
        self.onStep(step, time);
        var id = setTimeout(function () {
          if (self.running && self.onVisual) self.onVisual(step);
        }, Math.max(0, (time - c.currentTime) * 1000));
        self.pending.push(id);
        if (self.pending.length > 64) self.pending.splice(0, 32);
      })(this.step, this.next);
      this.next += 60 / this.bpm / this.steps;
      this.step++;
    }
  };

  /* 錄音：需在 https 或 localhost，並經使用者允許麥克風 */
  function Recorder() { this.chunks = []; }
  Recorder.supported = function () {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  };
  Recorder.prototype.start = function () {
    var self = this;
    return navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false } }).then(function (stream) {
      self.stream = stream;
      self.chunks = [];
      self.mr = new MediaRecorder(stream);
      self.mr.ondataavailable = function (e) { if (e.data.size) self.chunks.push(e.data); };
      self.mr.start();
      self.t0 = Date.now();
    });
  };
  Recorder.prototype.stop = function () {
    var self = this;
    return new Promise(function (resolve) {
      if (!self.mr) return resolve(null);
      self.mr.onstop = function () {
        self.stream.getTracks().forEach(function (t) { t.stop(); });
        var blob = new Blob(self.chunks, { type: self.mr.mimeType || 'audio/webm' });
        resolve({ blob: blob, url: URL.createObjectURL(blob), seconds: Math.round((Date.now() - self.t0) / 1000), type: blob.type });
      };
      self.mr.stop();
    });
  };

  PS.audio = { ctx: ac, click: click, strum: strum, Metronome: Metronome, Recorder: Recorder };
})(window.PS = window.PS || {});
