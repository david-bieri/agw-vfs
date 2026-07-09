/**
 * agw_hero_viz.js — AGW landing-page hero visualization
 * ─────────────────────────────────────────────────────────────────────────
 * Single canonical mode (ADR: replaced the 5-mode randomizer, v41):
 *   "Denkschulen-Konstellation" — a slow-drifting network of figures from the
 *   history of economic thought, coloured by school, connected within schools,
 *   with the most conference-present thinkers named as luminaries. Doubles as a
 *   quiet teaser for the Stammbaum / analytics.
 *
 * Self-mounts: finds .hero, injects a background <canvas> + scrim behind
 * .hero-inner. Pure vanilla JS, no dependencies. Figure/school data is embedded
 * below (edit FIGS to curate). The "Was uns beschäftigt" rotator reads recent
 * Jahrestagung themes from the global ARCHIVE (agw_data.js) and follows the
 * DE/EN language toggle.
 */
(function () {
  'use strict';

  // Curated constellation — name, birth, death, school colour (hero-legible), prominent(1/0)
  var FIGS = [{"n": "Schumpeter", "b": 1883, "d": 1950, "c": "#3FB0A3", "p": 1}, {"n": "Hayek", "b": 1899, "d": 1992, "c": "#3FB0A3", "p": 1}, {"n": "Samuelson", "b": 1915, "d": 2009, "c": "#AEB6C2", "p": 1}, {"n": "Marshall", "b": 1842, "d": 1924, "c": "#9AA6D0", "p": 1}, {"n": "Smith", "b": 1723, "d": 1790, "c": "#C2A06B", "p": 1}, {"n": "Keynes", "b": 1883, "d": 1946, "c": "#9AA6D0", "p": 1}, {"n": "Weber", "b": 1864, "d": 1920, "c": "#6E8FCB", "p": 1}, {"n": "Sraffa", "b": 1898, "d": null, "c": "#9AA6D0", "p": 1}, {"n": "Sombart", "b": 1863, "d": 1941, "c": "#6E8FCB", "p": 0}, {"n": "Menger", "b": 1840, "d": 1921, "c": "#3FB0A3", "p": 0}, {"n": "Mill", "b": 1806, "d": 1873, "c": "#C2A06B", "p": 0}, {"n": "Hicks", "b": 1904, "d": 1989, "c": "#AEB6C2", "p": 0}, {"n": "Wicksell", "b": 1851, "d": 1926, "c": "#6BB58C", "p": 0}, {"n": "Marx", "b": 1818, "d": 1883, "c": "#C2A06B", "p": 0}, {"n": "Roscher", "b": 1817, "d": 1894, "c": "#6E8FCB", "p": 0}, {"n": "Streissler", "b": 1933, "d": null, "c": "#8892A6", "p": 0}, {"n": "Cassel", "b": 1866, "d": 1945, "c": "#6BB58C", "p": 0}, {"n": "Ricardo", "b": 1772, "d": 1823, "c": "#C2A06B", "p": 0}, {"n": "Friedman", "b": 1912, "d": 2006, "c": "#AEB6C2", "p": 0}, {"n": "Eucken", "b": 1891, "d": 1950, "c": "#D6A24A", "p": 0}, {"n": "Böhm-Bawerk", "b": 1851, "d": 1914, "c": "#3FB0A3", "p": 0}, {"n": "Niehans", "b": 1919, "d": null, "c": "#8892A6", "p": 0}, {"n": "Clark", "b": 1905, "d": null, "c": "#8892A6", "p": 0}, {"n": "Schneider", "b": 1900, "d": null, "c": "#8892A6", "p": 0}, {"n": "Brandt", "b": 1899, "d": null, "c": "#8892A6", "p": 0}, {"n": "Salin", "b": 1892, "d": null, "c": "#8892A6", "p": 0}, {"n": "Pigou", "b": 1877, "d": 1959, "c": "#9AA6D0", "p": 0}, {"n": "Schmoller", "b": 1838, "d": 1917, "c": "#6E8FCB", "p": 0}, {"n": "Jevons", "b": 1835, "d": 1882, "c": "#3FB0A3", "p": 0}, {"n": "Locke", "b": 1632, "d": null, "c": "#8892A6", "p": 0}, {"n": "Solow", "b": 1924, "d": null, "c": "#8892A6", "p": 0}];

  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion:reduce)').matches;

  function hexa(hex, a) {
    var n = hex.replace('#', '');
    return 'rgba(' + parseInt(n.substr(0,2),16) + ',' + parseInt(n.substr(2,2),16) + ',' + parseInt(n.substr(4,2),16) + ',' + a + ')';
  }
  function dates(f){ if(f.b && f.d) return f.b + '\u2013' + f.d; if(f.b) return f.b + '\u2013'; return ''; }

  function init() {
    var hero = document.querySelector('.hero');
    if (!hero) return;                       // guard: only runs where a hero exists
    if (document.getElementById('hero-network-canvas')) return; // idempotent

    var cv = document.createElement('canvas');
    cv.id = 'hero-network-canvas';
    cv.setAttribute('aria-hidden', 'true');
    cv.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;z-index:0;pointer-events:none;';
    var scrim = document.createElement('div');
    scrim.setAttribute('aria-hidden', 'true');
    scrim.style.cssText = 'position:absolute;inset:0;z-index:1;pointer-events:none;' +
      'background:radial-gradient(115% 105% at 12% 42%, rgba(18,40,82,.55) 0%, rgba(18,40,82,.12) 48%, rgba(18,40,82,0) 70%),' +
      'linear-gradient(180deg, rgba(18,40,82,.10), rgba(18,40,82,.30));';
    hero.insertBefore(scrim, hero.firstChild);
    hero.insertBefore(cv, hero.firstChild);
    var inner = hero.querySelector('.hero-inner');
    if (inner) { inner.style.position = 'relative'; inner.style.zIndex = '2'; }

    var ctx = cv.getContext('2d');
    var W = 0, H = 0, DPR = Math.min(window.devicePixelRatio || 1, 2), raf = null, nodes = [];

    function make() {
      nodes = [];
      FIGS.forEach(function (f) {
        var prom = !!f.p;
        nodes.push({ name: f.n, dt: dates(f), prom: prom, col: f.c,
          r: prom ? 4.0 : (2.0 + Math.random() * 0.6),
          x: prom ? W * (0.42 + Math.random() * 0.55) : Math.random() * W,
          y: prom ? H * (0.10 + Math.random() * 0.80) : Math.random() * H,
          vx: (Math.random() - 0.5) * 0.15, vy: (Math.random() - 0.5) * 0.15 });
      });
    }
    function size() {
      W = hero.clientWidth; H = hero.clientHeight;
      cv.width = W * DPR; cv.height = H * DPR; ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      make();
    }
    function label(p) {
      ctx.textBaseline = 'middle';
      ctx.font = p.prom ? "500 13px 'EB Garamond', serif" : "400 10px 'Source Sans 3', sans-serif";
      var nw = ctx.measureText(p.name).width;
      var dFont = p.prom ? "400 11px 'EB Garamond', serif" : "400 9px 'Source Sans 3', sans-serif";
      ctx.font = dFont; var dw = p.dt ? ctx.measureText('  ' + p.dt).width : 0;
      var pad = 8, total = nw + dw;
      var lx = (p.x + pad + total > W - 6) ? p.x - pad - total : p.x + pad;
      ctx.font = p.prom ? "500 13px 'EB Garamond', serif" : "400 10px 'Source Sans 3', sans-serif";
      ctx.fillStyle = p.prom ? 'rgba(255,255,255,0.92)' : 'rgba(210,222,242,0.5)';
      ctx.fillText(p.name, lx, p.y);
      if (p.dt) { ctx.font = dFont;
        ctx.fillStyle = p.prom ? 'rgba(255,255,255,0.55)' : 'rgba(210,222,242,0.3)';
        ctx.fillText('  ' + p.dt, lx + nw, p.y); }
    }
    function draw() {
      ctx.clearRect(0, 0, W, H);
      for (var i = 0; i < nodes.length; i++) for (var j = i + 1; j < nodes.length; j++) {
        var a = nodes[i], b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d = Math.hypot(dx, dy);
        if (d < 175) { var o = (1 - d / 175);
          if (a.col === b.col) { ctx.strokeStyle = hexa(a.col, Math.min(0.6, o * 0.75)); ctx.lineWidth = 1.1; }
          else { ctx.strokeStyle = 'rgba(120,145,195,' + (o * 0.20).toFixed(3) + ')'; ctx.lineWidth = 0.7; }
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
      }
      for (var k = 0; k < nodes.length; k++) { var p = nodes[k];
        if (p.prom) { ctx.save(); ctx.shadowColor = hexa(p.col, 0.5); ctx.shadowBlur = 9;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fillStyle = hexa(p.col, 0.98); ctx.fill(); ctx.restore();
          ctx.beginPath(); ctx.arc(p.x, p.y, p.r + 4, 0, 6.2832); ctx.strokeStyle = hexa(p.col, 0.3); ctx.lineWidth = 1; ctx.stroke();
        } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.2832); ctx.fillStyle = hexa(p.col, 0.9); ctx.fill(); }
        label(p);
      }
    }
    function step() { for (var k = 0; k < nodes.length; k++) { var p = nodes[k]; p.x += p.vx; p.y += p.vy;
      if (p.x < -16) p.x = W + 16; if (p.x > W + 16) p.x = -16; if (p.y < -16) p.y = H + 16; if (p.y > H + 16) p.y = -16; } }
    function loop() { step(); draw(); raf = requestAnimationFrame(loop); }
    function start() { if (raf) cancelAnimationFrame(raf); if (reduce) { draw(); return; } loop(); }

    window.addEventListener('resize', function () { size(); start(); });
    size(); start();
    if (document.fonts && document.fonts.ready) { document.fonts.ready.then(function () { if (reduce) draw(); }); }

    // ── "Was uns beschäftigt" rotator — recent Jahrestagung themes from ARCHIVE ──
    initRotator();
  }

  function initRotator() {
    var el = document.getElementById('hero-rot-theme');
    if (!el) return;                          // guard
    if (typeof ARCHIVE === 'undefined') return;
    function lang() { return (window.AGW && window.AGW.getLang) ? window.AGW.getLang() : 'de'; }
    function themes() {
      var de = lang() !== 'en';
      return ARCHIVE.filter(function (c) { return c.theme; })
        .slice().sort(function (a, b) { return (b.year || 0) - (a.year || 0); })
        .slice(0, 6)
        .map(function (c) { return (de ? c.theme : (c.theme_en || c.theme)) + ' (' + c.year + ')'; });
    }
    var list = themes(), ti = 0;
    function show() { el.textContent = list[ti] || ''; }
    show();
    window.addEventListener('agw-lang-change', function () { list = themes(); if (ti >= list.length) ti = 0; show(); });
    if (!reduce && list.length > 1) {
      setInterval(function () { el.style.opacity = 0;
        setTimeout(function () { ti = (ti + 1) % list.length; show(); el.style.opacity = 1; }, 500);
      }, 3800);
    }
  }

  if (document.readyState === 'loading') { document.addEventListener('DOMContentLoaded', init); }
  else { init(); }
})();
