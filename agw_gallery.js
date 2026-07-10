/**
 * agw_gallery.js — "Impressionen 2026" gallery + accessible lightbox
 * ────────────────────────────────────────────────────────────────────────────
 * Vanilla JS (agw_chronik / agw_schools_net precedent — no React, no build step).
 * Mounts into #gallery-mount from the AGW.GALLERY manifest (data/gallery.js).
 *
 *  • Responsive <picture>: AVIF → WebP → JPEG fallback, srcset + sizes, lazy-loaded.
 *  • Images are NEVER precached — the service worker caches them on demand.
 *  • Lightbox: role="dialog" + aria-modal, focus trap, Esc / ← / → keys,
 *    backdrop-click close, focus restored on close, prefers-reduced-motion aware.
 *  • Bilingual via AGW.getLang() + the agw-lang-change event.
 *
 * Multi-page safe: early-returns if #gallery-mount is absent.
 */
(function () {
  'use strict';

  function lang() { return (window.AGW && AGW.getLang) ? AGW.getLang() : 'de'; }
  function t(k, fb) {
    if (window.AGW && AGW.t) { var s = AGW.t(k); if (s && s !== k) return s; }
    return fb;
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  var mount, G, shots, lb, lbImgWrap, lbCap, lbCount, current = 0, lastFocused = null;

  // Build the <picture> srcset markup for one shot.
  function pictureHTML(shot, sizes, lazy, altText) {
    var dir = G.dir, id = shot.id, ws = G.widths;
    var avif = ws.map(function (w) { return dir + id + '-' + w + '.avif ' + w + 'w'; }).join(', ');
    var webp = ws.map(function (w) { return dir + id + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    return '<picture>' +
      '<source type="image/avif" srcset="' + avif + '" sizes="' + sizes + '">' +
      '<source type="image/webp" srcset="' + webp + '" sizes="' + sizes + '">' +
      '<img src="' + dir + id + '.jpg" width="' + shot.w + '" height="' + shot.h + '"' +
      (lazy ? ' loading="lazy"' : '') + ' decoding="async" alt="' + esc(altText) + '">' +
      '</picture>';
  }

  function renderGrid() {
    var L = lang();
    var grid = document.createElement('div');
    grid.className = 'gallery-grid';
    shots.forEach(function (shot, i) {
      var fig = document.createElement('figure');
      fig.className = 'gal-fig';
      var altText = (shot.alt && shot.alt[L]) || (shot.cap && shot.cap[L]) || '';
      var capText = (shot.cap && shot.cap[L]) || '';
      fig.innerHTML =
        '<button class="gal-thumb" type="button" aria-label="' + esc(capText) + '">' +
          pictureHTML(shot, '(max-width:600px) 88vw, (max-width:960px) 44vw, 300px', true, altText) +
        '</button>' +
        '<figcaption class="gal-cap">' + esc(capText) + '</figcaption>';
      fig.querySelector('.gal-thumb').addEventListener('click', function () { open(i); });
      grid.appendChild(fig);
    });
    mount.innerHTML = '';
    mount.appendChild(grid);
  }

  // ── Lightbox ──────────────────────────────────────────────────────────────
  function buildLightbox() {
    lb = document.createElement('div');
    lb.className = 'gal-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.setAttribute('aria-label', t('impr_title', 'Impressionen 2026'));
    lb.innerHTML =
      '<button class="gal-lb-close" type="button">\u2715</button>' +
      '<button class="gal-lb-prev" type="button">\u2039</button>' +
      '<figure class="gal-lb-fig">' +
        '<div class="gal-lb-imgwrap"></div>' +
        '<figcaption class="gal-lb-cap"><span class="gal-lb-caption"></span>' +
        '<span class="gal-lb-count"></span></figcaption>' +
      '</figure>' +
      '<button class="gal-lb-next" type="button">\u203A</button>';
    document.body.appendChild(lb);

    lbImgWrap = lb.querySelector('.gal-lb-imgwrap');
    lbCap = lb.querySelector('.gal-lb-caption');
    lbCount = lb.querySelector('.gal-lb-count');

    lb.querySelector('.gal-lb-close').addEventListener('click', close);
    lb.querySelector('.gal-lb-prev').addEventListener('click', function () { step(-1); });
    lb.querySelector('.gal-lb-next').addEventListener('click', function () { step(1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    applyLbLabels();
  }

  function applyLbLabels() {
    if (!lb) return;
    lb.setAttribute('aria-label', t('impr_title', 'Impressionen 2026'));
    lb.querySelector('.gal-lb-close').setAttribute('aria-label', t('gal_close', 'Schließen'));
    lb.querySelector('.gal-lb-prev').setAttribute('aria-label', t('gal_prev', 'Vorheriges Bild'));
    lb.querySelector('.gal-lb-next').setAttribute('aria-label', t('gal_next', 'Nächstes Bild'));
  }

  function paintLightbox() {
    var L = lang(), shot = shots[current];
    var altText = (shot.alt && shot.alt[L]) || (shot.cap && shot.cap[L]) || '';
    lbImgWrap.innerHTML = pictureHTML(shot, '92vw', false, altText);
    lbCap.textContent = (shot.cap && shot.cap[L]) || '';
    lbCount.textContent = (current + 1) + ' / ' + shots.length;
  }

  function open(i) {
    current = i;
    lastFocused = document.activeElement;
    paintLightbox();
    lb.classList.add('open');
    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', onKey);
    lb.querySelector('.gal-lb-close').focus();
  }

  function close() {
    lb.classList.remove('open');
    document.body.style.overflow = '';
    document.removeEventListener('keydown', onKey);
    if (lastFocused && lastFocused.focus) lastFocused.focus();
  }

  function step(d) {
    current = (current + d + shots.length) % shots.length;
    paintLightbox();
  }

  function onKey(e) {
    if (e.key === 'Escape') { close(); return; }
    if (e.key === 'ArrowLeft') { step(-1); return; }
    if (e.key === 'ArrowRight') { step(1); return; }
    if (e.key === 'Tab') {
      // Focus trap across the three controls.
      var f = [lb.querySelector('.gal-lb-close'), lb.querySelector('.gal-lb-prev'), lb.querySelector('.gal-lb-next')];
      var idx = f.indexOf(document.activeElement);
      if (idx === -1) { f[0].focus(); e.preventDefault(); return; }
      var next = e.shiftKey ? idx - 1 : idx + 1;
      if (next < 0) next = f.length - 1;
      if (next >= f.length) next = 0;
      f[next].focus();
      e.preventDefault();
    }
  }

  function init() {
    mount = document.getElementById('gallery-mount');
    if (!mount) return;                      // multi-page safety
    G = window.AGW && AGW.GALLERY;
    if (!G || !G.shots || !G.shots.length) { mount.innerHTML = ''; return; }
    shots = G.shots;
    renderGrid();
    buildLightbox();
    window.addEventListener('agw-lang-change', function () {
      renderGrid();
      applyLbLabels();
      if (lb && lb.classList.contains('open')) paintLightbox();
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
