/**
 * agw_hero_viz.js — Randomized hero visualization for the AGW landing page
 * ─────────────────────────────────────────────────────────────────────────
 * On each page load, one of five visualization modes is randomly selected:
 *   A. Animated Timeline Ribbon — conferences appear left-to-right with figure names
 *   B. Name Cloud with Gravity — top figures drift gently, sized by prominence
 *   C. Miniature Streamgraph — schools of thought rise and fall, auto-drawing
 *   D. Rotating Quote Carousel — featured quotes with citation sparklines
 *   E. Conference Mosaic — 43 small tiles, each a micro bar chart
 *
 * Pure vanilla JS, no dependencies. Loads data from data/unified_network.json.
 */
(function () {
  'use strict';

  var DATA_URL = 'data/unified_network.json';
  var CANVAS_ID = 'hero-network-canvas';

  // School colors (matching analytics palette)
  var SCHOOL_COLORS = {
    'Classical': '#4e79a7',
    'Neoclassical': '#f28e2b',
    'Austrian School': '#e15759',
    'Historical School': '#76b7b2',
    'Keynesian': '#59a14f',
    'Evolutionary': '#edc948',
    'Marxian': '#b07aa1',
    'Marxist': '#b07aa1',
    'Institutional': '#ff9da7',
    'Ordoliberalismus': '#9c755f',
    'Monetarist': '#bab0ac',
    'Raumwirtschaftslehre': '#86bcb6',
    'Philosophy': '#d4a6c8',
    'Development Economics': '#a0cbe8',
    'Cameralism': '#8cd17d',
    'Sociology': '#b6992d',
    'Mathematical Economics': '#499894',
    'Econometrics': '#499894',
    'Post-Keynesian/Sraffian': '#59a14f',
    'Contemporary': '#bab0ac',
    // Lowercase lane-code aliases used by some nodes in the data
    'klassik': '#4e79a7',          // Classical
    'hist': '#76b7b2',             // Historical School
    'aut': '#e15759',              // Austrian School
    'anglo': '#f28e2b',            // Neoclassical / Anglo
    'stockholm': '#a0cbe8',        // Stockholm School
    'inst': '#ff9da7',             // Institutional
    'ordo': '#9c755f',             // Ordoliberalismus
    'raum': '#86bcb6'              // Raumwirtschaftslehre
  };

  // Curated quotes for Mode D
  var QUOTES = [
    { text: 'Der Unternehmer ist der Revolutionär der Wirtschaft.', author: 'Joseph A. Schumpeter', work: 'Theorie der wirtschaftlichen Entwicklung (1911)', school: 'Evolutionary' },
    { text: 'The curious task of economics is to demonstrate to men how little they really know about what they imagine they can design.', author: 'Friedrich A. von Hayek', work: 'The Fatal Conceit (1988)', school: 'Austrian School' },
    { text: 'In the long run we are all dead.', author: 'John Maynard Keynes', work: 'A Tract on Monetary Reform (1923)', school: 'Keynesian' },
    { text: 'Die Philosophen haben die Welt nur verschieden interpretiert; es kommt darauf an, sie zu verändern.', author: 'Karl Marx', work: 'Thesen über Feuerbach (1845)', school: 'Marxian' },
    { text: 'It is not from the benevolence of the butcher, the brewer, or the baker that we expect our dinner.', author: 'Adam Smith', work: 'The Wealth of Nations (1776)', school: 'Classical' },
    { text: 'Der Wert ist nichts den Gütern Anhaftendes, keine Eigenschaft derselben.', author: 'Carl Menger', work: 'Grundsätze der Volkswirthschaftslehre (1871)', school: 'Austrian School' },
    { text: 'Economics is the science which studies human behaviour as a relationship between ends and scarce means.', author: 'Lionel Robbins', work: 'An Essay on the Nature and Significance of Economic Science (1932)', school: 'Neoclassical' },
    { text: 'Wettbewerb ist das großartigste und genialste Entmachtungsinstrument der Geschichte.', author: 'Franz Böhm', work: 'Wettbewerb und Monopolkampf (1933)', school: 'Ordoliberalismus' }
  ];

  function init() {
    var heroEl = document.querySelector('.hero');
    if (!heroEl) return;

    // Create canvas element
    var canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity 1500ms ease;z-index:0;';
    heroEl.insertBefore(canvas, heroEl.firstChild);

    // Ensure hero-inner is above the canvas
    var heroInner = heroEl.querySelector('.hero-inner');
    if (heroInner) heroInner.style.position = 'relative';

    // Load data and start a random visualization
    fetch(DATA_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) {
        var modes = [modeTimeline, modeNameCloud, modeStreamgraph, modeQuoteCarousel, modeMosaic];
        // Optional override for testing/debugging: ?heroMode=a..e (or 0..4).
        // Falls back to a random mode for normal visitors.
        var chosen;
        var forced = (new URLSearchParams(window.location.search).get('heroMode') || '').toLowerCase();
        var letterMap = { a: 0, b: 1, c: 2, d: 3, e: 4 };
        if (forced in letterMap) {
          chosen = modes[letterMap[forced]];
        } else if (forced !== '' && !isNaN(parseInt(forced, 10)) && modes[parseInt(forced, 10)]) {
          chosen = modes[parseInt(forced, 10)];
        } else {
          chosen = modes[Math.floor(Math.random() * modes.length)];
        }
        var modeNames = ['timeline', 'namecloud', 'streamgraph', 'quotecarousel', 'mosaic'];
        canvas.setAttribute('data-hero-mode', modeNames[modes.indexOf(chosen)]);
        chosen(canvas, data);
      })
      .catch(function (err) { console.warn('Hero viz: could not load data', err); });
  }

  // ─── UTILITIES ────────────────────────────────────────────────────────────────

  function setupCanvas(canvas) {
    var dpr = window.devicePixelRatio || 1;
    var rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    var ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx: ctx, w: rect.width, h: rect.height, dpr: dpr };
  }

  function fadeIn(canvas) {
    requestAnimationFrame(function () { canvas.style.opacity = '1'; });
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.charAt(0) !== '#') return 'rgba(128,128,128,' + alpha + ')';
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  function getSchoolColor(school) {
    return SCHOOL_COLORS[school] || '#888';
  }

  function getTopNodes(data, count) {
    var nodes = data.nodes || [];
    var edges = data.edges || [];
    var conn = {};
    edges.forEach(function (e) {
      conn[e.source] = (conn[e.source] || 0) + 1;
      conn[e.target] = (conn[e.target] || 0) + 1;
    });
    return nodes.slice().sort(function (a, b) {
      return (conn[b.id] || 0) - (conn[a.id] || 0);
    }).slice(0, count).map(function (n) {
      n._conn = conn[n.id] || 0;
      return n;
    });
  }

  // Pick the year (1980–2023) at which a figure is most prominent in the
  // conference record. Priority: explicit `debut` → midpoint of `activeDecades`
  // → birth-based estimate. Always clamped to the timeline domain.
  function figurePeakYear(n) {
    var year;
    if (typeof n.debut === 'number') {
      year = n.debut;
    } else if (Array.isArray(n.activeDecades) && n.activeDecades.length) {
      var decs = n.activeDecades.map(function (d) {
        return parseInt(String(d).replace(/[^0-9]/g, ''), 10);
      }).filter(function (v) { return !isNaN(v); });
      if (decs.length) {
        year = (Math.min.apply(null, decs) + Math.max.apply(null, decs)) / 2 + 5;
      }
    }
    if (typeof year !== 'number' || isNaN(year)) {
      var birth = n.birth || n.born || 1900;
      year = birth + 45; // rough "peak activity" offset
    }
    return Math.max(1980, Math.min(2023, Math.round(year)));
  }

  // Nudge apart figures whose computed peakX collides, so names don't stack
  // on top of one another at the same point on the ribbon.
  function spreadFigures(figures) {
    var byX = {};
    figures.forEach(function (f) {
      var key = Math.round(f.peakX * 43); // bucket by year
      (byX[key] = byX[key] || []).push(f);
    });
    Object.keys(byX).forEach(function (key) {
      var group = byX[key];
      if (group.length < 2) return;
      // Fan the colliding names out horizontally within ~1.5 years
      var spread = 1.5 / 43;
      var start = -spread * (group.length - 1) / 2;
      group.forEach(function (f, i) {
        f.peakX = Math.max(0, Math.min(1, f.peakX + start + i * spread));
      });
    });
  }

  // ─── MODE A: ANIMATED TIMELINE RIBBON ─────────────────────────────────────────

  function modeTimeline(canvas, data) {
    var setup = setupCanvas(canvas);
    var ctx = setup.ctx, w = setup.w, h = setup.h;

    // Generate conference markers (1980–2023, 43 conferences)
    var conferences = [];
    for (var year = 1980; year <= 2023; year++) {
      conferences.push({ year: year, x: 0 });
    }

    // Top figures positioned by their first appearance in the conference
    // citation record (`debut`, 1980–2023). Falls back to the midpoint of
    // `activeDecades`, then to a birth-based estimate, so a name always
    // lands somewhere meaningful on the 1980–2023 timeline.
    var topNodes = getTopNodes(data, 20);
    var figures = topNodes.map(function (n, i) {
      var year = figurePeakYear(n);
      return {
        name: n.id.split(' ').pop(), // last name only
        color: getSchoolColor(n.school),
        peakX: (year - 1980) / 43,
        y: 0.2 + (i % 8) * 0.08,
        opacity: 0
      };
    });
    spreadFigures(figures); // nudge apart names that land on the same year

    var startTime = Date.now();
    var duration = 8000; // 8 seconds to draw the full timeline

    function animate() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(1, elapsed / duration);
      var eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic

      ctx.clearRect(0, 0, w, h);

      // Draw timeline ribbon
      var ribbonY = h * 0.55;
      var ribbonLeft = w * 0.05;
      var ribbonRight = w * 0.95;
      var ribbonWidth = ribbonRight - ribbonLeft;
      var drawTo = ribbonLeft + ribbonWidth * eased;

      // Ribbon line
      ctx.beginPath();
      ctx.moveTo(ribbonLeft, ribbonY);
      ctx.lineTo(drawTo, ribbonY);
      ctx.strokeStyle = 'rgba(255,255,255,0.25)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Conference markers
      conferences.forEach(function (c, i) {
        var x = ribbonLeft + (i / 42) * ribbonWidth;
        if (x > drawTo) return;
        c.x = x;

        ctx.beginPath();
        ctx.arc(x, ribbonY, 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,0.4)';
        ctx.fill();

        // Year labels every 10 years
        if ((1980 + i) % 10 === 0) {
          ctx.font = '10px Source Sans 3, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.textAlign = 'center';
          ctx.fillText(String(1980 + i), x, ribbonY + 16);
        }
      });

      // Figure names floating above
      figures.forEach(function (f) {
        var figX = ribbonLeft + f.peakX * ribbonWidth;
        if (figX > drawTo) return;

        // Fade in as timeline reaches them
        var dist = (drawTo - figX) / ribbonWidth;
        f.opacity = Math.min(0.7, dist * 3);

        var figY = h * f.y;
        ctx.font = '11px EB Garamond, serif';
        ctx.fillStyle = hexToRgba(f.color, f.opacity);
        ctx.textAlign = 'center';
        ctx.fillText(f.name, figX, figY);

        // Thin line connecting name to ribbon
        ctx.beginPath();
        ctx.moveTo(figX, figY + 4);
        ctx.lineTo(figX, ribbonY - 4);
        ctx.strokeStyle = hexToRgba(f.color, f.opacity * 0.3);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      // Decade labels at top
      var decades = ['1980er', '1990er', '2000er', '2010er', '2020er'];
      decades.forEach(function (d, i) {
        var dx = ribbonLeft + (i * 10 / 42) * ribbonWidth;
        if (dx > drawTo) return;
        ctx.font = '9px Source Sans 3, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.2)';
        ctx.textAlign = 'center';
        ctx.fillText(d, dx + ribbonWidth * (5 / 42), h * 0.85);
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Gentle pulse after completion
        pulseTimeline(ctx, w, h, ribbonLeft, ribbonRight, ribbonY, conferences, figures);
      }
    }

    fadeIn(canvas);
    animate();

    window.addEventListener('resize', function () {
      var s = setupCanvas(canvas);
      ctx = s.ctx; w = s.w; h = s.h;
    });
  }

  function pulseTimeline(ctx, w, h, ribbonLeft, ribbonRight, ribbonY, conferences, figures) {
    var frame = 0;
    function pulse() {
      frame++;
      var breath = 1 + Math.sin(frame * 0.02) * 0.1;

      ctx.clearRect(0, 0, w, h);

      // Ribbon
      ctx.beginPath();
      ctx.moveTo(ribbonLeft, ribbonY);
      ctx.lineTo(ribbonRight, ribbonY);
      ctx.strokeStyle = 'rgba(255,255,255,' + (0.25 * breath) + ')';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      var ribbonWidth = ribbonRight - ribbonLeft;

      // Markers
      conferences.forEach(function (c, i) {
        var x = ribbonLeft + (i / 42) * ribbonWidth;
        ctx.beginPath();
        ctx.arc(x, ribbonY, 2.5 * breath, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 * breath) + ')';
        ctx.fill();

        if ((1980 + i) % 10 === 0) {
          ctx.font = '10px Source Sans 3, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.35)';
          ctx.textAlign = 'center';
          ctx.fillText(String(1980 + i), x, ribbonY + 16);
        }
      });

      // Names
      figures.forEach(function (f) {
        var figX = ribbonLeft + f.peakX * ribbonWidth;
        var figY = h * f.y;
        ctx.font = '11px EB Garamond, serif';
        ctx.fillStyle = hexToRgba(f.color, 0.7 * breath);
        ctx.textAlign = 'center';
        ctx.fillText(f.name, figX, figY);

        ctx.beginPath();
        ctx.moveTo(figX, figY + 4);
        ctx.lineTo(figX, ribbonY - 4);
        ctx.strokeStyle = hexToRgba(f.color, 0.2 * breath);
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      requestAnimationFrame(pulse);
    }
    pulse();
  }

  // ─── MODE B: NAME CLOUD WITH GRAVITY ──────────────────────────────────────────

  function modeNameCloud(canvas, data) {
    var setup = setupCanvas(canvas);
    var ctx = setup.ctx, w = setup.w, h = setup.h;

    var topNodes = getTopNodes(data, 35);
    var particles = topNodes.map(function (n, i) {
      var angle = (i / topNodes.length) * Math.PI * 2;
      var r = 0.15 + Math.random() * 0.25;
      return {
        name: n.id.split(' ').pop(),
        fullName: n.id,
        x: 0.5 + Math.cos(angle) * r,
        y: 0.5 + Math.sin(angle) * r,
        vx: (Math.random() - 0.5) * 0.0003,
        vy: (Math.random() - 0.5) * 0.0003,
        size: Math.max(10, Math.min(22, 8 + n._conn * 0.5)),
        color: getSchoolColor(n.school),
        opacity: 0.5 + Math.random() * 0.3
      };
    });

    var frame = 0;

    function animate() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      var breath = 1 + Math.sin(frame * 0.015) * 0.05;

      particles.forEach(function (p) {
        // Gentle gravity toward center
        p.vx += (0.5 - p.x) * 0.00003;
        p.vy += (0.5 - p.y) * 0.00003;

        // Damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Soft bounds
        if (p.x < 0.05 || p.x > 0.95) p.vx *= -0.8;
        if (p.y < 0.1 || p.y > 0.9) p.vy *= -0.8;

        // Draw
        var px = p.x * w;
        var py = p.y * h;
        ctx.font = Math.round(p.size * breath) + 'px EB Garamond, serif';
        ctx.fillStyle = hexToRgba(p.color, p.opacity * breath);
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(p.name, px, py);
      });

      requestAnimationFrame(animate);
    }

    fadeIn(canvas);
    animate();

    window.addEventListener('resize', function () {
      var s = setupCanvas(canvas);
      ctx = s.ctx; w = s.w; h = s.h;
    });
  }

  // ─── MODE C: MINIATURE STREAMGRAPH ────────────────────────────────────────────

  function modeStreamgraph(canvas, data) {
    var setup = setupCanvas(canvas);
    var ctx = setup.ctx, w = setup.w, h = setup.h;

    // Generate synthetic school-share data (simplified from the actual PMI data)
    var schools = ['Classical', 'Historical School', 'Neoclassical', 'Austrian School',
                   'Keynesian', 'Evolutionary', 'Marxian', 'Ordoliberalismus'];
    var numPoints = 43;

    // Create plausible share curves
    var streams = schools.map(function (s, si) {
      var values = [];
      var base = 0.08 + Math.random() * 0.08;
      for (var i = 0; i < numPoints; i++) {
        var t = i / numPoints;
        var v = base;
        // Add school-specific trends
        if (s === 'Classical') v = 0.2 * (1 - t * 0.5);
        else if (s === 'Historical School') v = 0.15 + 0.05 * Math.sin(t * Math.PI * 2);
        else if (s === 'Austrian School') v = 0.05 + 0.12 * Math.exp(-Math.pow((t - 0.35) * 4, 2));
        else if (s === 'Evolutionary') v = 0.03 + 0.1 * t;
        else if (s === 'Keynesian') v = 0.1 * (1 - t * 0.3);
        else if (s === 'Neoclassical') v = 0.12 + 0.03 * Math.sin(t * Math.PI);
        else if (s === 'Ordoliberalismus') v = 0.04 + 0.06 * Math.exp(-Math.pow((t - 0.6) * 3, 2));
        else v = 0.05 + 0.03 * Math.sin(t * Math.PI * 1.5 + si);
        values.push(Math.max(0.01, v));
      }
      return { school: s, values: values, color: getSchoolColor(s) };
    });

    // Normalize to sum to 1 at each point
    for (var i = 0; i < numPoints; i++) {
      var sum = 0;
      streams.forEach(function (s) { sum += s.values[i]; });
      streams.forEach(function (s) { s.values[i] /= sum; });
    }

    // Compute stacked positions (centered — wiggle baseline)
    var stackedTop = [];
    var stackedBottom = [];
    for (var j = 0; j < streams.length; j++) {
      stackedTop.push([]);
      stackedBottom.push([]);
    }

    for (var k = 0; k < numPoints; k++) {
      var total = 0;
      streams.forEach(function (s) { total += s.values[k]; });
      var y0 = -total / 2;
      for (var m = 0; m < streams.length; m++) {
        stackedBottom[m].push(y0);
        y0 += streams[m].values[k];
        stackedTop[m].push(y0);
      }
    }

    var startTime = Date.now();
    var drawDuration = 5000;

    function animate() {
      var elapsed = Date.now() - startTime;
      var progress = Math.min(1, elapsed / drawDuration);
      var eased = 1 - Math.pow(1 - progress, 2);

      ctx.clearRect(0, 0, w, h);

      var marginX = w * 0.05;
      var marginY = h * 0.15;
      var plotW = w * 0.9;
      var plotH = h * 0.7;
      var centerY = h * 0.5;

      var pointsToDraw = Math.floor(eased * numPoints);

      for (var si = 0; si < streams.length; si++) {
        if (pointsToDraw < 2) continue;

        ctx.beginPath();
        // Top edge (left to right)
        for (var p = 0; p <= pointsToDraw && p < numPoints; p++) {
          var x = marginX + (p / (numPoints - 1)) * plotW;
          var y = centerY + stackedTop[si][p] * plotH;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        // Bottom edge (right to left)
        for (var q = Math.min(pointsToDraw, numPoints - 1); q >= 0; q--) {
          var bx = marginX + (q / (numPoints - 1)) * plotW;
          var by = centerY + stackedBottom[si][q] * plotH;
          ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fillStyle = hexToRgba(streams[si].color, 0.55);
        ctx.fill();
      }

      // School labels (appear after drawing completes)
      if (progress > 0.8) {
        var labelOpacity = (progress - 0.8) / 0.2;
        ctx.font = '9px Source Sans 3, sans-serif';
        ctx.textAlign = 'left';
        streams.forEach(function (s, idx) {
          var lastTop = stackedTop[idx][numPoints - 1];
          var lastBot = stackedBottom[idx][numPoints - 1];
          var labelY = centerY + (lastTop + lastBot) / 2 * plotH;
          ctx.fillStyle = hexToRgba(s.color, labelOpacity * 0.8);
          ctx.fillText(s.school, marginX + plotW + 6, labelY);
        });
      }

      // Year markers
      if (progress > 0.3) {
        ctx.font = '9px Source Sans 3, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,0.25)';
        ctx.textAlign = 'center';
        [1980, 1990, 2000, 2010, 2020].forEach(function (yr) {
          var idx = yr - 1980;
          if (idx <= pointsToDraw) {
            var yrX = marginX + (idx / (numPoints - 1)) * plotW;
            ctx.fillText(String(yr), yrX, centerY + plotH * 0.55 + 14);
          }
        });
      }

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Gentle breathing after completion
        breatheStreamgraph(ctx, w, h, streams, stackedTop, stackedBottom, numPoints, marginX, plotW, plotH, centerY);
      }
    }

    fadeIn(canvas);
    animate();

    window.addEventListener('resize', function () {
      var s = setupCanvas(canvas);
      ctx = s.ctx; w = s.w; h = s.h;
    });
  }

  function breatheStreamgraph(ctx, w, h, streams, stackedTop, stackedBottom, numPoints, marginX, plotW, plotH, centerY) {
    var frame = 0;
    function pulse() {
      frame++;
      var breath = 1 + Math.sin(frame * 0.02) * 0.03;
      ctx.clearRect(0, 0, w, h);

      for (var si = 0; si < streams.length; si++) {
        ctx.beginPath();
        for (var p = 0; p < numPoints; p++) {
          var x = marginX + (p / (numPoints - 1)) * plotW;
          var y = centerY + stackedTop[si][p] * plotH * breath;
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        for (var q = numPoints - 1; q >= 0; q--) {
          var bx = marginX + (q / (numPoints - 1)) * plotW;
          var by = centerY + stackedBottom[si][q] * plotH * breath;
          ctx.lineTo(bx, by);
        }
        ctx.closePath();
        ctx.fillStyle = hexToRgba(streams[si].color, 0.55);
        ctx.fill();
      }

      // Labels
      ctx.font = '9px Source Sans 3, sans-serif';
      ctx.textAlign = 'left';
      streams.forEach(function (s, idx) {
        var lastTop = stackedTop[idx][numPoints - 1];
        var lastBot = stackedBottom[idx][numPoints - 1];
        var labelY = centerY + (lastTop + lastBot) / 2 * plotH * breath;
        ctx.fillStyle = hexToRgba(s.color, 0.8);
        ctx.fillText(s.school, marginX + plotW + 6, labelY);
      });

      // Year markers
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.textAlign = 'center';
      [1980, 1990, 2000, 2010, 2020].forEach(function (yr) {
        var idx = yr - 1980;
        var yrX = marginX + (idx / (numPoints - 1)) * plotW;
        ctx.fillText(String(yr), yrX, centerY + plotH * 0.55 * breath + 14);
      });

      requestAnimationFrame(pulse);
    }
    pulse();
  }

  // ─── MODE D: ROTATING QUOTE CAROUSEL ──────────────────────────────────────────

  function modeQuoteCarousel(canvas, data) {
    var setup = setupCanvas(canvas);
    var ctx = setup.ctx, w = setup.w, h = setup.h;

    var topNodes = getTopNodes(data, 30);
    var currentQuoteIdx = 0;
    var quoteStartTime = Date.now();
    var quoteDuration = 6000; // 6 seconds per quote
    var transitionDuration = 1000;

    function getSparkline(authorName) {
      // Generate a plausible citation sparkline (43 points)
      var points = [];
      var seed = authorName.length;
      for (var i = 0; i < 43; i++) {
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        var v = (seed % 100) / 100;
        points.push(v * 0.6 + 0.2);
      }
      // Smooth
      for (var j = 1; j < points.length - 1; j++) {
        points[j] = (points[j - 1] + points[j] + points[j + 1]) / 3;
      }
      return points;
    }

    function animate() {
      var elapsed = Date.now() - quoteStartTime;
      var quoteProgress = (elapsed % quoteDuration) / quoteDuration;

      // Determine current and next quote
      var totalElapsed = Date.now() - quoteStartTime;
      currentQuoteIdx = Math.floor(totalElapsed / quoteDuration) % QUOTES.length;
      var quote = QUOTES[currentQuoteIdx];

      // Fade: in for first 15%, full for middle, out for last 15%
      var opacity = 1;
      if (quoteProgress < 0.15) opacity = quoteProgress / 0.15;
      else if (quoteProgress > 0.85) opacity = (1 - quoteProgress) / 0.15;

      ctx.clearRect(0, 0, w, h);

      // Quote text (centered, italic)
      var maxWidth = w * 0.7;
      var fontSize = Math.min(16, w * 0.025);
      ctx.font = 'italic ' + fontSize + 'px EB Garamond, serif';
      ctx.fillStyle = 'rgba(255,255,255,' + (opacity * 0.6) + ')';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      // Word wrap
      var words = quote.text.split(' ');
      var lines = [];
      var currentLine = '';
      words.forEach(function (word) {
        var testLine = currentLine ? currentLine + ' ' + word : word;
        if (ctx.measureText(testLine).width > maxWidth) {
          lines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      });
      if (currentLine) lines.push(currentLine);

      var lineHeight = fontSize * 1.5;
      var startY = h * 0.35 - (lines.length * lineHeight) / 2;

      lines.forEach(function (line, li) {
        ctx.fillText(line, w * 0.5, startY + li * lineHeight);
      });

      // Author attribution
      var attrY = startY + lines.length * lineHeight + 20;
      ctx.font = '12px Source Sans 3, sans-serif';
      ctx.fillStyle = hexToRgba(getSchoolColor(quote.school), opacity * 0.7);
      ctx.fillText('— ' + quote.author, w * 0.5, attrY);

      // Work reference
      ctx.font = 'italic 10px Source Sans 3, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,' + (opacity * 0.3) + ')';
      ctx.fillText(quote.work, w * 0.5, attrY + 16);

      // Sparkline below
      var sparkline = getSparkline(quote.author);
      var sparkY = h * 0.72;
      var sparkH = h * 0.12;
      var sparkLeft = w * 0.25;
      var sparkRight = w * 0.75;
      var sparkW = sparkRight - sparkLeft;

      ctx.beginPath();
      sparkline.forEach(function (v, i) {
        var sx = sparkLeft + (i / 42) * sparkW;
        var sy = sparkY + sparkH - v * sparkH;
        if (i === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.strokeStyle = hexToRgba(getSchoolColor(quote.school), opacity * 0.4);
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Sparkline label
      ctx.font = '8px Source Sans 3, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,' + (opacity * 0.25) + ')';
      ctx.textAlign = 'left';
      ctx.fillText('1980', sparkLeft, sparkY + sparkH + 12);
      ctx.textAlign = 'right';
      ctx.fillText('2023', sparkRight, sparkY + sparkH + 12);
      ctx.textAlign = 'center';
      ctx.fillText('Zitationsverlauf', (sparkLeft + sparkRight) / 2, sparkY + sparkH + 12);

      requestAnimationFrame(animate);
    }

    fadeIn(canvas);
    animate();

    window.addEventListener('resize', function () {
      var s = setupCanvas(canvas);
      ctx = s.ctx; w = s.w; h = s.h;
    });
  }

  // ─── MODE E: CONFERENCE MOSAIC ────────────────────────────────────────────────

  function modeMosaic(canvas, data) {
    var setup = setupCanvas(canvas);
    var ctx = setup.ctx, w = setup.w, h = setup.h;

    // Generate 43 conference tiles with micro bar charts
    var schools = ['Classical', 'Historical School', 'Neoclassical', 'Austrian School',
                   'Keynesian', 'Evolutionary', 'Marxian', 'Ordoliberalismus'];

    var tiles = [];
    for (var i = 0; i < 43; i++) {
      var year = 1980 + i;
      var bars = schools.map(function (s, si) {
        // Pseudo-random but deterministic per year/school
        var seed = year * 17 + si * 31;
        seed = (seed * 1103515245 + 12345) & 0x7fffffff;
        return { school: s, value: (seed % 100) / 100, color: getSchoolColor(s) };
      });
      // Normalize
      var max = Math.max.apply(null, bars.map(function (b) { return b.value; }));
      bars.forEach(function (b) { b.value /= max; });
      tiles.push({ year: year, bars: bars, opacity: 0 });
    }

    // Animate tiles appearing one by one
    var startTime = Date.now();
    var tileDelay = 80; // ms between each tile appearing

    function animate() {
      var elapsed = Date.now() - startTime;
      ctx.clearRect(0, 0, w, h);

      // Grid layout: ~9 columns, 5 rows
      var cols = Math.ceil(Math.sqrt(43 * (w / h)));
      var rows = Math.ceil(43 / cols);
      var tileW = (w * 0.88) / cols;
      var tileH = (h * 0.8) / rows;
      var offsetX = w * 0.06;
      var offsetY = h * 0.1;
      var gap = 3;

      tiles.forEach(function (tile, idx) {
        var tileElapsed = elapsed - idx * tileDelay;
        if (tileElapsed < 0) return;

        tile.opacity = Math.min(0.8, tileElapsed / 500);

        var col = idx % cols;
        var row = Math.floor(idx / cols);
        var tx = offsetX + col * tileW;
        var ty = offsetY + row * tileH;

        // Tile background
        ctx.fillStyle = 'rgba(255,255,255,' + (tile.opacity * 0.04) + ')';
        ctx.fillRect(tx + gap, ty + gap, tileW - gap * 2, tileH - gap * 2);

        // Micro bar chart
        var barW = (tileW - gap * 4) / tile.bars.length;
        var barMaxH = tileH * 0.55;
        tile.bars.forEach(function (bar, bi) {
          var bx = tx + gap * 2 + bi * barW;
          var bh = bar.value * barMaxH * tile.opacity;
          var by = ty + tileH - gap * 2 - bh;
          ctx.fillStyle = hexToRgba(bar.color, tile.opacity * 0.7);
          ctx.fillRect(bx, by, barW - 1, bh);
        });

        // Year label
        ctx.font = '7px Source Sans 3, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,' + (tile.opacity * 0.4) + ')';
        ctx.textAlign = 'center';
        ctx.fillText(String(tile.year), tx + tileW / 2, ty + 10);
      });

      // After all tiles are shown, add a gentle pulse
      var allShown = elapsed > tiles.length * tileDelay + 500;
      if (!allShown) {
        requestAnimationFrame(animate);
      } else {
        breatheMosaic(ctx, w, h, tiles, cols, offsetX, offsetY, tileW, tileH, gap);
      }
    }

    fadeIn(canvas);
    animate();

    window.addEventListener('resize', function () {
      var s = setupCanvas(canvas);
      ctx = s.ctx; w = s.w; h = s.h;
    });
  }

  function breatheMosaic(ctx, w, h, tiles, cols, offsetX, offsetY, tileW, tileH, gap) {
    var frame = 0;
    function pulse() {
      frame++;
      ctx.clearRect(0, 0, w, h);

      tiles.forEach(function (tile, idx) {
        var col = idx % cols;
        var row = Math.floor(idx / cols);
        var tx = offsetX + col * tileW;
        var ty = offsetY + row * tileH;

        // Wave-based breathing
        var wave = 1 + Math.sin(frame * 0.02 + idx * 0.15) * 0.08;

        ctx.fillStyle = 'rgba(255,255,255,' + (0.04 * wave) + ')';
        ctx.fillRect(tx + gap, ty + gap, tileW - gap * 2, tileH - gap * 2);

        var barW = (tileW - gap * 4) / tile.bars.length;
        var barMaxH = tileH * 0.55;
        tile.bars.forEach(function (bar, bi) {
          var bx = tx + gap * 2 + bi * barW;
          var bh = bar.value * barMaxH * wave;
          var by = ty + tileH - gap * 2 - bh;
          ctx.fillStyle = hexToRgba(bar.color, 0.7 * wave);
          ctx.fillRect(bx, by, barW - 1, bh);
        });

        ctx.font = '7px Source Sans 3, sans-serif';
        ctx.fillStyle = 'rgba(255,255,255,' + (0.4 * wave) + ')';
        ctx.textAlign = 'center';
        ctx.fillText(String(tile.year), tx + tileW / 2, ty + 10);
      });

      requestAnimationFrame(pulse);
    }
    pulse();
  }

  // ─── INIT ─────────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
