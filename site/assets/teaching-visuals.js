/* Shared, accessible teaching-photo viewer. */
(function () {
  'use strict';
  var script = document.currentScript;
  var base = new URL('teaching/', script.src);
  var data = window.PixelTeachingVisuals || [];
  var lookup = Object.fromEntries(data.map(function (x) { return [x.id, x]; }));
  var dialog = document.createElement('dialog');
  dialog.className = 'teaching-dialog';
  dialog.setAttribute('aria-labelledby', 'teaching-dialog-title');
  dialog.innerHTML = '<div class="teaching-dialog-top"><h2 id="teaching-dialog-title"></h2><button type="button" class="teaching-close" aria-label="關閉圖解">關閉 ×</button></div><div class="teaching-dialog-body"></div>';
  document.body.appendChild(dialog);
  function url(src) { return new URL(src, base).href; }
  function figure(item) {
    var f = document.createElement('figure'), im = document.createElement('img'), cap = document.createElement('figcaption');
    im.src = url(item.src); im.alt = item.caption; im.loading = 'eager';
    cap.textContent = item.caption;
    f.append(im, cap); return f;
  }
  function open(ids) {
    var groups = ids.map(function (id) { return lookup[id]; }).filter(Boolean);
    dialog.querySelector('h2').textContent = groups.map(function (g) { return g.title; }).join(' · ');
    var body = dialog.querySelector('.teaching-dialog-body'); body.replaceChildren();
    groups.forEach(function (g) {
      var section = document.createElement('section'), title = document.createElement('h3'), grid = document.createElement('div');
      title.textContent = g.title; grid.className = 'teaching-photo-grid';
      g.images.forEach(function (im) { grid.appendChild(figure(im)); });
      if (groups.length > 1) section.appendChild(title);
      section.appendChild(grid);
      if (g.note) { var p = document.createElement('p'); p.className = 'teaching-note'; p.textContent = g.note; section.append(p); }
      if (g.sources) { var links = document.createElement('p'); links.className = 'teaching-sources'; g.sources.forEach(function (source) { var a = document.createElement('a'); a.href = source.url; a.textContent = source.label; a.target = '_blank'; a.rel = 'noopener'; links.append(a, ' '); }); section.append(links); }
      body.appendChild(section);
    });
    if (!dialog.open) dialog.showModal();
    dialog.scrollTop = 0;
  }
  dialog.querySelector('.teaching-close').addEventListener('click', function () { dialog.close(); });
  dialog.addEventListener('click', function (e) { if (e.target === dialog) { var r = dialog.getBoundingClientRect(); if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('keydown', function (e) { e.stopPropagation(); });
  document.querySelectorAll('.slide[data-teaching]').forEach(function (slide) {
    var ids = slide.dataset.teaching.split(' ').filter(function (id) { return lookup[id]; });
    if (!ids.length) return;
    var h = slide.querySelector('h2'); if (!h || h.closest('.teaching-heading')) return;
    var wrap = document.createElement('div'); wrap.className = 'teaching-heading';
    wrap.style.marginBottom = h.style.marginBottom || '12px'; h.style.marginBottom = '0';
    h.parentNode.insertBefore(wrap, h); wrap.appendChild(h);
    var button = document.createElement('button'), im = document.createElement('img'), text = document.createElement('span');
    button.type = 'button'; button.className = 'teaching-launch'; button.setAttribute('aria-label', '放大圖解：' + ids.map(function (id) { return lookup[id].title; }).join('、'));
    im.src = url(lookup[ids[0]].images[0].src); im.alt = ''; im.loading = 'lazy'; text.textContent = '放大圖解 ↗';
    button.append(im, text); button.addEventListener('click', function () { open(ids); }); wrap.appendChild(button);
  });
  var shared = new URLSearchParams(location.search).get('diagram');
  if (shared && lookup[shared]) open([shared]);
  document.body.setAttribute('data-teaching-ready', '1');
})();
