// agw_temporal.js — Temporal Ego-Network Animation
// Animates the ego-network decade by decade, showing how the intellectual
// network grew from 27 nodes in the 1980s to 81 nodes by the 2000s.
import * as d3 from "d3";
import { schoolLabel, getLang } from "./school_labels.js";

const DATA_URL = "./data/unified_network.json";

const DECADES = ['1980s', '1990s', '2000s', '2010s', '2020s'];
const DECADE_LABELS = {
  '1980s': { de: '1980er', en: '1980s' },
  '1990s': { de: '1990er', en: '1990s' },
  '2000s': { de: '2000er', en: '2000s' },
  '2010s': { de: '2010er', en: '2010s' },
  '2020s': { de: '2020er', en: '2020s' },
};

const T_TEXT = {
  title:       { de: 'Zeitliche Netzwerkentwicklung', en: 'Temporal Network Evolution' },
  subtitle:    { de: 'Beobachten Sie, wie das intellektuelle Netzwerk \u00fcber 5 Dekaden w\u00e4chst.', 
                 en: 'Watch the intellectual network grow across 5 decades.' },
  play:        { de: '\u25B6 Abspielen', en: '\u25B6 Play' },
  pause:       { de: '\u23F8 Pause', en: '\u23F8 Pause' },
  cumulative:  { de: 'Kumulativ', en: 'Cumulative' },
  single:      { de: 'Einzeldekade', en: 'Single Decade' },
  nodes_label: { de: 'Figuren', en: 'Figures' },
  edges_label: { de: 'Verbindungen', en: 'Connections' },
  speed:       { de: 'Geschwindigkeit:', en: 'Speed:' },
  slow:        { de: 'Langsam', en: 'Slow' },
  fast:        { de: 'Schnell', en: 'Fast' },
  new_nodes:   { de: 'Neue Figuren:', en: 'New figures:' },
};

function tt(key) {
  const lang = getLang();
  const entry = T_TEXT[key];
  return entry ? (entry[lang] || entry.de) : key;
}

export default async function AGWTemporal(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("Temporal: container not found"); return; }

  // Load data
  const data = await fetch(DATA_URL).then(r => r.json());
  const { nodes, edges, schoolColors } = data;

  // State
  let currentDecadeIdx = 0;
  let isPlaying = false;
  let isCumulative = true;
  let playInterval = null;
  let simulation = null;
  let speed = 2500; // ms per decade

  // Color function
  function nodeColor(node) {
    if (node.school && schoolColors[node.school]) return schoolColors[node.school];
    return "#757575";
  }

  // --- Layout ---
  el.innerHTML = "";
  el.style.position = "relative";

  // Header + controls
  const header = document.createElement("div");
  header.style.cssText = "padding:14px 20px;background:#1a1a2e;border-bottom:1px solid #333;";
  header.innerHTML = `
    <h3 style="margin:0 0 4px;font-family:'EB Garamond',serif;font-size:20px;color:#fff;font-weight:500;">${tt('title')}</h3>
    <p style="margin:0 0 12px;font-size:12.5px;color:#888;font-family:'Source Sans 3',sans-serif;">${tt('subtitle')}</p>
    <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap;">
      <button id="temp-play" style="background:#2a4a7f;color:#fff;border:none;border-radius:4px;padding:6px 16px;font-size:12px;cursor:pointer;font-family:'Source Sans 3',sans-serif;">${tt('play')}</button>
      <div style="display:flex;align-items:center;gap:6px;">
        <input type="range" id="temp-slider" min="0" max="4" step="1" value="0" style="width:200px;accent-color:#4a90e2;cursor:pointer;">
        <span id="temp-decade-label" style="color:#fff;font-size:14px;font-weight:600;font-family:'Source Sans 3',sans-serif;min-width:50px;">1980er</span>
      </div>
      <label style="display:flex;align-items:center;gap:5px;color:#aaa;font-size:11px;font-family:'Source Sans 3',sans-serif;cursor:pointer;">
        <input type="checkbox" id="temp-cumulative" checked style="accent-color:#4a90e2;">
        ${tt('cumulative')}
      </label>
      <div style="display:flex;align-items:center;gap:5px;">
        <span style="color:#666;font-size:10px;">${tt('slow')}</span>
        <input type="range" id="temp-speed" min="1000" max="4000" step="500" value="2500" style="width:80px;accent-color:#4a90e2;">
        <span style="color:#666;font-size:10px;">${tt('fast')}</span>
      </div>
    </div>
    <div id="temp-stats" style="margin-top:10px;display:flex;gap:20px;font-size:12px;color:#aaa;font-family:'Source Sans 3',sans-serif;">
      <span id="temp-node-count"></span>
      <span id="temp-edge-count"></span>
      <span id="temp-new-nodes" style="color:#4a90e2;"></span>
    </div>
  `;
  el.appendChild(header);

  // SVG container
  const svgContainer = document.createElement("div");
  svgContainer.style.cssText = "width:100%;height:calc(100% - 150px);min-height:400px;position:relative;";
  el.appendChild(svgContainer);

  const width = el.clientWidth || 900;
  const height = Math.max(400, (el.clientHeight || 600) - 150);

  const svg = d3.select(svgContainer).append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "#0d1117");

  // Arrow marker
  svg.append("defs").append("marker")
    .attr("id", "temp-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 18)
    .attr("refY", 0)
    .attr("markerWidth", 5)
    .attr("markerHeight", 5)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#ff9800");

  const g = svg.append("g");

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.3, 4])
    .on("zoom", (event) => g.attr("transform", event.transform));
  svg.call(zoom);

  // --- Filter data by decade ---
  function getActiveNodes(decadeIdx) {
    const decade = DECADES[decadeIdx];
    if (isCumulative) {
      // All nodes active up to and including this decade
      const activeDecades = DECADES.slice(0, decadeIdx + 1);
      return nodes.filter(n => {
        const nd = n.activeDecades || DECADES;
        return nd.some(d => activeDecades.includes(d));
      });
    } else {
      // Only nodes active in this specific decade
      return nodes.filter(n => {
        const nd = n.activeDecades || DECADES;
        return nd.includes(decade);
      });
    }
  }

  function getActiveEdges(decadeIdx, activeNodeIds) {
    const decade = DECADES[decadeIdx];
    if (isCumulative) {
      const activeDecades = DECADES.slice(0, decadeIdx + 1);
      return edges.filter(e => {
        const ed = e.activeDecades || DECADES;
        const src = typeof e.source === 'object' ? e.source.id : e.source;
        const tgt = typeof e.target === 'object' ? e.target.id : e.target;
        return ed.some(d => activeDecades.includes(d)) && activeNodeIds.has(src) && activeNodeIds.has(tgt);
      });
    } else {
      return edges.filter(e => {
        const ed = e.activeDecades || DECADES;
        const src = typeof e.source === 'object' ? e.source.id : e.source;
        const tgt = typeof e.target === 'object' ? e.target.id : e.target;
        return ed.includes(decade) && activeNodeIds.has(src) && activeNodeIds.has(tgt);
      });
    }
  }

  // --- Render decade ---
  function renderDecade(decadeIdx, animate = true) {
    const activeNodes = getActiveNodes(decadeIdx).map(n => ({ ...n }));
    const activeNodeIds = new Set(activeNodes.map(n => n.id));
    const activeEdges = getActiveEdges(decadeIdx, activeNodeIds).map(e => ({ ...e }));

    // Determine new nodes (appeared this decade)
    let newNodeIds = new Set();
    if (decadeIdx > 0) {
      const prevNodes = getActiveNodes(decadeIdx - 1);
      const prevIds = new Set(prevNodes.map(n => n.id));
      newNodeIds = new Set(activeNodes.filter(n => !prevIds.has(n.id)).map(n => n.id));
    }

    // Update stats
    const lang = getLang();
    document.getElementById("temp-node-count").textContent = `${tt('nodes_label')}: ${activeNodes.length}`;
    document.getElementById("temp-edge-count").textContent = `${tt('edges_label')}: ${activeEdges.length}`;
    if (newNodeIds.size > 0) {
      const newNames = activeNodes.filter(n => newNodeIds.has(n.id)).map(n => {
        const parts = n.id.split(' ');
        return parts[parts.length - 1];
      }).slice(0, 5);
      document.getElementById("temp-new-nodes").textContent = `${tt('new_nodes')} ${newNames.join(', ')}${newNodeIds.size > 5 ? '...' : ''}`;
    } else {
      document.getElementById("temp-new-nodes").textContent = '';
    }

    // Update decade label
    const decadeKey = DECADES[decadeIdx];
    document.getElementById("temp-decade-label").textContent = DECADE_LABELS[decadeKey][lang] || decadeKey;
    document.getElementById("temp-slider").value = decadeIdx;

    // Clear and redraw
    g.selectAll("*").remove();

    // Links
    const link = g.append("g").selectAll("line")
      .data(activeEdges)
      .join("line")
      .attr("stroke", d => d.type === "co-citation" ? "#555" : "#ff9800")
      .attr("stroke-width", d => d.type === "co-citation" ? Math.max(0.5, (d.weight || 1) * 0.3) : 1.5)
      .attr("stroke-dasharray", d => d.type === "co-citation" ? "none" : "4,2")
      .attr("stroke-opacity", animate ? 0 : 0.4)
      .attr("marker-end", d => d.type !== "co-citation" ? "url(#temp-arrow)" : null);

    // Nodes
    const node = g.append("g").selectAll("g")
      .data(activeNodes)
      .join("g")
      .attr("cursor", "pointer");

    node.append("circle")
      .attr("r", d => Math.max(4, Math.sqrt(d.conferenceAppearances || 1) * 2))
      .attr("fill", d => nodeColor(d))
      .attr("stroke", d => newNodeIds.has(d.id) ? "#fff" : "none")
      .attr("stroke-width", d => newNodeIds.has(d.id) ? 2 : 0)
      .attr("opacity", animate ? 0 : 0.85);

    node.append("text")
      .text(d => {
        const parts = d.id.split(" ");
        return parts[parts.length - 1];
      })
      .attr("dx", d => Math.max(4, Math.sqrt(d.conferenceAppearances || 1) * 2) + 3)
      .attr("dy", 3)
      .attr("font-size", d => (d.conferenceAppearances || 1) > 10 ? 10 : 8)
      .attr("fill", "#ccc")
      .attr("font-family", "'Source Sans 3', sans-serif")
      .attr("opacity", animate ? 0 : 0.7);

    // Tooltip on hover
    node.append("title").text(d => `${d.id}\n${schoolLabel(d.school || '')}\n${d.conferenceAppearances || '?'} Konferenzen`);

    // Force simulation
    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(activeNodes)
      .force("link", d3.forceLink(activeEdges).id(d => d.id).distance(60).strength(0.15))
      .force("charge", d3.forceManyBody().strength(-80))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => Math.max(4, Math.sqrt(d.conferenceAppearances || 1) * 2) + 3))
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    // Animate entrance
    if (animate) {
      node.select("circle")
        .transition().duration(600).delay((d, i) => newNodeIds.has(d.id) ? 300 : 0)
        .attr("opacity", 0.85);

      node.select("text")
        .transition().duration(600).delay((d, i) => newNodeIds.has(d.id) ? 400 : 100)
        .attr("opacity", 0.7);

      link
        .transition().duration(800).delay(200)
        .attr("stroke-opacity", 0.4);

      // Pulse new nodes
      node.filter(d => newNodeIds.has(d.id))
        .select("circle")
        .transition().duration(300).delay(600)
        .attr("r", d => Math.max(4, Math.sqrt(d.conferenceAppearances || 1) * 2) * 1.8)
        .transition().duration(400)
        .attr("r", d => Math.max(4, Math.sqrt(d.conferenceAppearances || 1) * 2));
    }
  }

  // --- Controls ---
  const playBtn = document.getElementById("temp-play");
  const slider = document.getElementById("temp-slider");
  const cumulativeChk = document.getElementById("temp-cumulative");
  const speedSlider = document.getElementById("temp-speed");

  function startPlayback() {
    isPlaying = true;
    playBtn.textContent = tt('pause');
    playBtn.style.background = '#7f2a2a';

    playInterval = setInterval(() => {
      currentDecadeIdx++;
      if (currentDecadeIdx >= DECADES.length) {
        currentDecadeIdx = 0; // loop
      }
      renderDecade(currentDecadeIdx, true);
    }, speed);
  }

  function stopPlayback() {
    isPlaying = false;
    playBtn.textContent = tt('play');
    playBtn.style.background = '#2a4a7f';
    if (playInterval) {
      clearInterval(playInterval);
      playInterval = null;
    }
  }

  playBtn.addEventListener("click", () => {
    if (isPlaying) {
      stopPlayback();
    } else {
      startPlayback();
    }
  });

  slider.addEventListener("input", () => {
    stopPlayback();
    currentDecadeIdx = parseInt(slider.value);
    renderDecade(currentDecadeIdx, true);
  });

  cumulativeChk.addEventListener("change", () => {
    isCumulative = cumulativeChk.checked;
    renderDecade(currentDecadeIdx, true);
  });

  speedSlider.addEventListener("input", () => {
    speed = 5000 - parseInt(speedSlider.value); // invert: higher slider = faster
    if (isPlaying) {
      stopPlayback();
      startPlayback();
    }
  });

  // --- Initial render ---
  renderDecade(0, false);
}
