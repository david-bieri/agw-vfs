/**
 * agw_highlights.js — "Im Fokus" landing highlight (index.html)
 * ────────────────────────────────────────────────────────────────────────────
 * Vanilla JS (agw_gallery / agw_schools_net precedent — no React, no build step).
 * Renders live, bilingual, accessible HTML into #fokus-mount from AGW.HIGHLIGHTS:
 * a featured card (two-portrait diptych + text) and a supporting rail of cards.
 * Text is real DOM (translatable via the DE/EN toggle, selectable, indexable).
 * Multi-page safe: early-returns when #fokus-mount is absent.
 */
(function () {
  'use strict';

  function lang() { return (window.AGW && AGW.getLang) ? AGW.getLang() : 'de'; }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }
  function bi(v, L) { return (v && typeof v === 'object') ? (v[L] || v.de || '') : (v || ''); }

  // <picture> from gallery variant stem (…-480/-960/-1440 .avif/.webp + .jpg fallback)
  function picVariants(stem, sizes, alt) {
    var ws = [480, 960, 1440];
    var avif = ws.map(function (w) { return stem + '-' + w + '.avif ' + w + 'w'; }).join(', ');
    var webp = ws.map(function (w) { return stem + '-' + w + '.webp ' + w + 'w'; }).join(', ');
    return '<picture>' +
      '<source type="image/avif" srcset="' + avif + '" sizes="' + sizes + '">' +
      '<source type="image/webp" srcset="' + webp + '" sizes="' + sizes + '">' +
      '<img src="' + stem + '.jpg" alt="' + esc(alt) + '" loading="lazy" decoding="async">' +
      '</picture>';
  }
  // <picture> from a plain stem (<stem>.webp + <stem>.jpg)
  function picPlain(stem, alt) {
    return '<picture>' +
      '<source type="image/webp" srcset="' + stem + '.webp">' +
      '<img src="' + stem + '.jpg" alt="' + esc(alt) + '" loading="lazy" decoding="async">' +
      '</picture>';
  }

  function liveCount(tok) {
    var D = window.AGW_DATA || {};
    if (tok === '@members') return (D.MEMBERS && D.MEMBERS.length) || null;
    if (tok === '@volumes') return (D.PUBLICATIONS && D.PUBLICATIONS.length) || null;
    return null;
  }
  function statsHTML(S, L) {
    if (!S) return '';
    var cells = (S.cells || []).map(function (c) {
      var v = (typeof c.v === 'string' && c.v.charAt(0) === '@') ? liveCount(c.v) : c.v;
      if (v === null || v === undefined || v === '') v = '\u2013';
      return '<div class="hl-stat"><div class="hl-stat-v">' + esc(v) + '</div>' +
             '<div class="hl-stat-l">' + esc(bi(c.l, L)) + '</div></div>';
    }).join('');
    var tag = S.href ? 'a' : 'div', href = S.href ? ' href="' + esc(S.href) + '"' : '';
    return '<' + tag + ' class="hl-stats"' + href + '>' +
      '<span class="hl-kicker">' + esc(bi(S.kicker, L)) + '</span>' +
      '<div class="hl-stat-grid">' + cells + '</div></' + tag + '>';
  }
  function teaserHTML(T, L) {
    if (!T) return '';
    var glyph = '<svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">' +
      '<g fill="none" stroke="currentColor" stroke-width="1.4">' +
      '<line x1="17" y1="17" x2="6" y2="7"/><line x1="17" y1="17" x2="28" y2="9"/>' +
      '<line x1="17" y1="17" x2="9" y2="27"/><line x1="17" y1="17" x2="27" y2="26"/></g>' +
      '<g fill="currentColor"><circle cx="17" cy="17" r="3.2"/><circle cx="6" cy="7" r="2"/>' +
      '<circle cx="28" cy="9" r="2"/><circle cx="9" cy="27" r="2"/></g>' +
      '<circle cx="27" cy="26" r="2.4" fill="#CBA13A"/></svg>';
    return '<a class="hl-teaser" href="' + esc(T.href) + '">' +
      '<div class="hl-glyph">' + glyph + '</div>' +
      '<div><span class="hl-kicker">' + esc(bi(T.kicker, L)) + '</span>' +
      '<div class="hl-card-title">' + esc(bi(T.title, L)) + '</div>' +
      '<div class="hl-meta">' + esc(bi(T.meta, L)) + '</div>' +
      '<span class="hl-cta hl-cta-sm">' + esc(bi(T.cta, L)) + ' \u2192</span></div></a>';
  }

  function render() {
    var mount = document.getElementById('fokus-mount');
    if (!mount) return;
    var H = window.AGW && AGW.HIGHLIGHTS;
    if (!H) return;
    var L = lang();

    var F = H.featured, feat = '';
    if (F) {
      var media = (F.media || []).map(function (m) {
        return picVariants(m, '(max-width:820px) 50vw, 320px', bi(F.title, L));
      }).join('');
      feat =
        '<a class="hl-feature" href="' + esc(F.href) + '">' +
          '<div class="hl-feature-media hl-diptych">' + media + '</div>' +
          '<div class="hl-feature-body">' +
            '<span class="hl-kicker">' + esc(bi(F.kicker, L)) + '</span>' +
            '<h3 class="hl-title">' + esc(bi(F.title, L)) + '</h3>' +
            '<p class="hl-meta">' + esc(bi(F.meta, L)) + '</p>' +
            '<span class="hl-cta">' + esc(bi(F.cta, L)) + ' \u2192</span>' +
          '</div>' +
        '</a>';
    }

    var railCards = (H.rail || []).map(function (r) {
      var ratio = r.ratio || '1 / 1';
      var thumb = r.img ? picPlain(r.img, bi(r.title, L)) : '';
      var ext = /^https?:/i.test(r.href || '');
      return '<a class="hl-card" href="' + esc(r.href) + '"' + (ext ? ' target="_blank" rel="noopener"' : '') + '>' +
        '<div class="hl-card-thumb" style="aspect-ratio:' + ratio + '">' + thumb + '</div>' +
        '<div class="hl-card-body">' +
          '<span class="hl-kicker">' + esc(bi(r.kicker, L)) + '</span>' +
          '<div class="hl-card-title">' + esc(bi(r.title, L)) + '</div>' +
          '<div class="hl-meta">' + esc(bi(r.meta, L)) + '</div>' +
          '<span class="hl-cta hl-cta-sm">' + esc(bi(r.cta, L)) + ' \u2197</span>' +
        '</div>' +
      '</a>';
    }).join('');
    var rail = railCards + statsHTML(H.stats, L) + teaserHTML(H.teaser, L);

    mount.innerHTML =
      '<div class="hl-eyebrow">' + esc(bi(H.eyebrow, L)) + '</div>' +
      '<div class="hl-grid">' + feat + '<div class="hl-rail">' + rail + '</div></div>';
  }

  function init() {
    if (!document.getElementById('fokus-mount')) return;
    render();
    window.addEventListener('agw-lang-change', render);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
