/* Pixel Studio 互動分塊：第零號錄音對照（.zero）。
 * assets/interact.js 偵測到頁面上有這些 class 才載入；共用工具由 K 提供，掛載時間在所有 defer 腳本之後。
 */
window.PixelInteract.define('zero', function (K) {
  'use strict';
  var $$ = K.$$, btn = K.btn, say = K.say, onLeave = K.onLeave;

  /* ---------- 第零號錄音對照：從手機選檔，和結業版接著播放 ---------- */
  $$('.zero').forEach(function (z) {
    z.innerHTML = '<label class="btn zr-pick">選擇第零號錄音檔<input type="file" accept="audio/*,video/webm,.m4a,.webm,.mp3,.wav"></label><audio controls></audio><p class="muted zr-note">從手機的下載資料夾選擇第一堂下載的「第零號錄音」。沒有下載的同學，老師會從課程雲端資料夾播放。</p><div class="btn-row"><button type="button" class="btn primary both" disabled>先聽第零號，再聽結業版</button></div>';
    var au = z.querySelector('audio'), inp = z.querySelector('input'), both = z.querySelector('.both'), url = '';
    inp.onchange = function () { var f = inp.files && inp.files[0]; if (!f) return; if (url) URL.revokeObjectURL(url); url = URL.createObjectURL(f); au.src = url; z.classList.add('has'); both.disabled = false; z.querySelector('.zr-note').textContent = '已載入：' + f.name; };
    both.onclick = function () {
      var fin = z.closest('.slide').querySelector('.recorder audio');
      au.currentTime = 0; au.play();
      au.onended = function () { au.onended = null; if (fin && fin.src) { fin.currentTime = 0; fin.play(); } else say('結業版還沒錄，先在右邊錄下來', 'warn'); };
    };
    onLeave(z, function () { au.pause(); });
  });
});
