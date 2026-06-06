/**
 * agw_hero_viz.js — Ambient animated network visualization for the landing page hero
 * ─────────────────────────────────────────────────────────────────────────────────────
 * Renders a slowly rotating, gently pulsing force-directed network of intellectual
 * figures as a canvas background behind the hero text. Creates an immediate visual
 * impression of the project's scope and the interconnectedness of ideas.
 *
 * Loads data from data/unified_network.json (same dataset as the analytics page).
 * Pure vanilla JS — no dependencies, no module system required.
 */
(function () {
  'use strict';

  var DATA_URL = 'data/unified_network.json';
  var CANVAS_ID = 'hero-network-canvas';

  // Configuration
  var CONFIG = {
    nodeBaseRadius: 2.5,
    nodeMaxRadius: 6,
    edgeOpacity: 0.12,
    edgeHighlightOpacity: 0.35,
    nodeOpacity: 0.6,
    nodeHighlightOpacity: 0.9,
    rotationSpeed: 0.0003,    // radians per frame
    pulseSpeed: 0.002,        // breathing animation speed
    pulseAmplitude: 0.15,     // breathing amplitude (0-1)
    dampingFactor: 0.97,      // velocity damping for force simulation
    repulsionStrength: 120,
    attractionStrength: 0.008,
    centerGravity: 0.02,
    maxVelocity: 1.5,
    warmupFrames: 200,        // frames to simulate before first paint
    fadeInDuration: 1500      // ms to fade in after warmup
  };

  // School colors (subset matching the analytics palette)
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
    'Contemporary': '#bab0ac'
  };

  function init() {
    var heroEl = document.querySelector('.hero');
    if (!heroEl) return;

    // Create canvas element
    var canvas = document.createElement('canvas');
    canvas.id = CANVAS_ID;
    canvas.style.cssText = 'position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity ' + CONFIG.fadeInDuration + 'ms ease;z-index:0;';
    heroEl.insertBefore(canvas, heroEl.firstChild);

    // Ensure hero-inner is above the canvas
    var heroInner = heroEl.querySelector('.hero-inner');
    if (heroInner) heroInner.style.position = 'relative';

    // Load data and start visualization
    fetch(DATA_URL)
      .then(function (r) { return r.json(); })
      .then(function (data) { startVisualization(canvas, data); })
      .catch(function (err) { console.warn('Hero viz: could not load data', err); });
  }

  function startVisualization(canvas, data) {
    var ctx = canvas.getContext('2d');
    var nodes = data.nodes || [];
    var edges = data.edges || [];

    // Filter to keep only the most connected nodes (top 50) for visual clarity
    var nodeMap = {};
    nodes.forEach(function (n) { nodeMap[n.id] = n; });

    // Count connections per node
    var connectionCount = {};
    edges.forEach(function (e) {
      connectionCount[e.source] = (connectionCount[e.source] || 0) + 1;
      connectionCount[e.target] = (connectionCount[e.target] || 0) + 1;
    });

    // Sort by connections and take top 50
    var sortedNodes = nodes.slice().sort(function (a, b) {
      return (connectionCount[b.id] || 0) - (connectionCount[a.id] || 0);
    });
    var displayNodes = sortedNodes.slice(0, 50);
    var displayNodeIds = {};
    displayNodes.forEach(function (n) { displayNodeIds[n.id] = true; });

    // Filter edges to only those between display nodes
    var displayEdges = edges.filter(function (e) {
      return displayNodeIds[e.source] && displayNodeIds[e.target];
    });

    // Initialize node positions in a circle
    var simNodes = displayNodes.map(function (n, i) {
      var angle = (i / displayNodes.length) * Math.PI * 2;
      var radius = 0.3 + Math.random() * 0.15;
      return {
        id: n.id,
        x: 0.5 + Math.cos(angle) * radius,
        y: 0.5 + Math.sin(angle) * radius,
        vx: 0,
        vy: 0,
        radius: CONFIG.nodeBaseRadius + (connectionCount[n.id] || 0) * 0.3,
        color: SCHOOL_COLORS[n.school] || '#888',
        school: n.school,
        connections: connectionCount[n.id] || 0
      };
    });

    // Cap radius
    simNodes.forEach(function (n) {
      if (n.radius > CONFIG.nodeMaxRadius) n.radius = CONFIG.nodeMaxRadius;
    });

    // Build edge index for simulation
    var simEdges = displayEdges.map(function (e) {
      var sourceIdx = simNodes.findIndex(function (n) { return n.id === e.source; });
      var targetIdx = simNodes.findIndex(function (n) { return n.id === e.target; });
      return { source: sourceIdx, target: targetIdx, type: e.type };
    }).filter(function (e) { return e.source >= 0 && e.target >= 0; });

    // Warmup: run force simulation without rendering
    for (var i = 0; i < CONFIG.warmupFrames; i++) {
      simulateStep(simNodes, simEdges);
    }

    // Resize handler
    var dpr = window.devicePixelRatio || 1;
    function resize() {
      var rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Fade in
    requestAnimationFrame(function () { canvas.style.opacity = '1'; });

    // Animation state
    var rotation = 0;
    var frame = 0;

    function animate() {
      frame++;
      rotation += CONFIG.rotationSpeed;
      var pulse = 1 + Math.sin(frame * CONFIG.pulseSpeed) * CONFIG.pulseAmplitude;

      // Run one simulation step
      simulateStep(simNodes, simEdges);

      // Clear
      var w = canvas.width / dpr;
      var h = canvas.height / dpr;
      ctx.clearRect(0, 0, w, h);

      // Apply rotation transform around center
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(rotation);
      ctx.translate(-w / 2, -h / 2);

      // Draw edges
      ctx.lineWidth = 0.5;
      for (var i = 0; i < simEdges.length; i++) {
        var e = simEdges[i];
        var s = simNodes[e.source];
        var t = simNodes[e.target];
        var sx = s.x * w, sy = s.y * h;
        var tx = t.x * w, ty = t.y * h;

        var opacity = e.type === 'lineage' ? CONFIG.edgeHighlightOpacity : CONFIG.edgeOpacity;
        var color = e.type === 'lineage' ? 'rgba(184, 134, 11,' + opacity * pulse + ')' : 'rgba(200, 200, 220,' + opacity * pulse + ')';

        ctx.beginPath();
        ctx.moveTo(sx, sy);
        ctx.lineTo(tx, ty);
        ctx.strokeStyle = color;
        ctx.stroke();
      }

      // Draw nodes
      for (var j = 0; j < simNodes.length; j++) {
        var n = simNodes[j];
        var nx = n.x * w, ny = n.y * h;
        var r = n.radius * pulse;

        ctx.beginPath();
        ctx.arc(nx, ny, r, 0, Math.PI * 2);
        ctx.fillStyle = hexToRgba(n.color, CONFIG.nodeOpacity * pulse);
        ctx.fill();

        // Subtle glow for highly connected nodes
        if (n.connections > 10) {
          ctx.beginPath();
          ctx.arc(nx, ny, r * 2, 0, Math.PI * 2);
          ctx.fillStyle = hexToRgba(n.color, 0.08 * pulse);
          ctx.fill();
        }
      }

      ctx.restore();
      requestAnimationFrame(animate);
    }

    animate();
  }

  function simulateStep(nodes, edges) {
    var n = nodes.length;

    // Repulsion between all pairs
    for (var i = 0; i < n; i++) {
      for (var j = i + 1; j < n; j++) {
        var dx = nodes[j].x - nodes[i].x;
        var dy = nodes[j].y - nodes[i].y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 0.001;
        var force = CONFIG.repulsionStrength / (dist * dist * n * 100);
        var fx = (dx / dist) * force;
        var fy = (dy / dist) * force;
        nodes[i].vx -= fx;
        nodes[i].vy -= fy;
        nodes[j].vx += fx;
        nodes[j].vy += fy;
      }
    }

    // Attraction along edges
    for (var k = 0; k < edges.length; k++) {
      var e = edges[k];
      var s = nodes[e.source];
      var t = nodes[e.target];
      var edx = t.x - s.x;
      var edy = t.y - s.y;
      var edist = Math.sqrt(edx * edx + edy * edy) || 0.001;
      var af = edist * CONFIG.attractionStrength;
      var afx = (edx / edist) * af;
      var afy = (edy / edist) * af;
      s.vx += afx;
      s.vy += afy;
      t.vx -= afx;
      t.vy -= afy;
    }

    // Center gravity + velocity update
    for (var m = 0; m < n; m++) {
      var node = nodes[m];
      // Pull toward center
      node.vx += (0.5 - node.x) * CONFIG.centerGravity;
      node.vy += (0.5 - node.y) * CONFIG.centerGravity;
      // Damping
      node.vx *= CONFIG.dampingFactor;
      node.vy *= CONFIG.dampingFactor;
      // Clamp velocity
      var speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
      if (speed > CONFIG.maxVelocity / 1000) {
        node.vx = (node.vx / speed) * CONFIG.maxVelocity / 1000;
        node.vy = (node.vy / speed) * CONFIG.maxVelocity / 1000;
      }
      // Update position
      node.x += node.vx;
      node.y += node.vy;
      // Keep in bounds (soft bounce)
      if (node.x < 0.05) { node.x = 0.05; node.vx *= -0.5; }
      if (node.x > 0.95) { node.x = 0.95; node.vx *= -0.5; }
      if (node.y < 0.05) { node.y = 0.05; node.vy *= -0.5; }
      if (node.y > 0.95) { node.y = 0.95; node.vy *= -0.5; }
    }
  }

  function hexToRgba(hex, alpha) {
    if (!hex || hex.charAt(0) !== '#') return 'rgba(128,128,128,' + alpha + ')';
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    return 'rgba(' + r + ',' + g + ',' + b + ',' + alpha + ')';
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
