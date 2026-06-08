// agw_pathways.js — Influence Pathways Explorer
// Computes and visualizes shortest paths between any two intellectual figures
// using Dijkstra's algorithm on the unified co-citation + lineage network.
import * as d3 from "d3";
import { schoolLabel, getLang, uiText } from "./school_labels.js";

const DATA_URL = "./data/unified_network.json";

// ── Dijkstra's algorithm ──────────────────────────────────────────────────────
function dijkstra(adjList, source, target) {
  const dist = {};
  const prev = {};
  const visited = new Set();
  const pq = []; // [{node, dist}]

  for (const node of adjList.keys()) {
    dist[node] = Infinity;
    prev[node] = null;
  }
  dist[source] = 0;
  pq.push({ node: source, dist: 0 });

  while (pq.length > 0) {
    // Simple priority queue (sort on extract)
    pq.sort((a, b) => a.dist - b.dist);
    const { node: u } = pq.shift();

    if (visited.has(u)) continue;
    visited.add(u);

    if (u === target) break;

    const neighbors = adjList.get(u) || [];
    for (const { node: v, weight, type } of neighbors) {
      if (visited.has(v)) continue;
      const alt = dist[u] + weight;
      if (alt < dist[v]) {
        dist[v] = alt;
        prev[v] = { node: u, type };
        pq.push({ node: v, dist: alt });
      }
    }
  }

  // Reconstruct path
  if (dist[target] === Infinity) return null;

  const path = [];
  let current = target;
  while (current !== null) {
    const prevEntry = prev[current];
    path.unshift({
      node: current,
      edgeType: prevEntry ? prevEntry.type : null
    });
    current = prevEntry ? prevEntry.node : null;
  }

  return { path, distance: dist[target] };
}

// ── Find all shortest paths (BFS-based for equal-weight) ─────────────────────
function allShortestPaths(adjList, source, target, maxPaths = 5) {
  // First find shortest distance
  const result = dijkstra(adjList, source, target);
  if (!result) return [];

  const targetDist = result.distance;
  const paths = [];

  // BFS to find all paths of the same length
  const queue = [[{ node: source, edgeType: null }]];
  let totalDist = {};
  totalDist[source] = 0;

  while (queue.length > 0 && paths.length < maxPaths) {
    const currentPath = queue.shift();
    const lastNode = currentPath[currentPath.length - 1].node;

    if (lastNode === target) {
      paths.push(currentPath);
      continue;
    }

    const currentDist = totalDist[lastNode] || 0;
    if (currentDist > targetDist) continue;

    const neighbors = adjList.get(lastNode) || [];
    for (const { node: next, weight, type } of neighbors) {
      const newDist = currentDist + weight;
      if (newDist > targetDist) continue;
      // Allow revisiting if we find equal-length path
      if (newDist <= (totalDist[next] || Infinity) + 0.001) {
        totalDist[next] = Math.min(totalDist[next] || Infinity, newDist);
        const newPath = [...currentPath, { node: next, edgeType: type }];
        if (!currentPath.some(p => p.node === next)) { // no cycles
          queue.push(newPath);
        }
      }
    }
  }

  return paths;
}

// ── UI Text for Pathways ─────────────────────────────────────────────────────
const PATHWAYS_TEXT = {
  title:        { de: 'Einflusspfade', en: 'Influence Pathways' },
  subtitle:     { de: 'Finden Sie die k\u00fcrzeste intellektuelle Verbindung zwischen zwei Denkern.', 
                  en: 'Find the shortest intellectual connection between two thinkers.' },
  from:         { de: 'Von:', en: 'From:' },
  to:           { de: 'Zu:', en: 'To:' },
  find:         { de: 'Pfad finden', en: 'Find Path' },
  no_path:      { de: 'Kein Pfad gefunden. Die Figuren sind nicht verbunden.', 
                  en: 'No path found. These figures are not connected.' },
  path_found:   { de: 'Pfad gefunden:', en: 'Path found:' },
  steps:        { de: 'Schritte', en: 'steps' },
  via:          { de: '\u00fcber', en: 'via' },
  cocitation:   { de: 'Co-Zitation', en: 'Co-citation' },
  lineage_lbl:  { de: 'Lehrer/Sch\u00fcler', en: 'Teacher/Student' },
  select_both:  { de: 'Bitte w\u00e4hlen Sie zwei verschiedene Figuren.', 
                  en: 'Please select two different figures.' },
  placeholder:  { de: 'Figur w\u00e4hlen\u2026', en: 'Select figure\u2026' },
  alt_paths:    { de: 'Alternative Pfade:', en: 'Alternative paths:' },
};

function pt(key) {
  const lang = getLang();
  const entry = PATHWAYS_TEXT[key];
  return entry ? (entry[lang] || entry.de) : key;
}

export default async function AGWPathways(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("Pathways: container not found"); return; }

  // Load data
  const data = await fetch(DATA_URL).then(r => r.json());
  const { nodes, edges, schoolColors } = data;

  // Build adjacency list with weights
  // Weight = inverse of signal strength (lower = closer)
  const adjList = new Map();
  nodes.forEach(n => adjList.set(n.id, []));

  edges.forEach(e => {
    const source = typeof e.source === 'object' ? e.source.id : e.source;
    const target = typeof e.target === 'object' ? e.target.id : e.target;
    // Co-citation: weight inversely proportional to co-citation count
    // Lineage: fixed low weight (strong connection)
    const weight = e.type === 'co-citation' 
      ? Math.max(0.5, 5 / (e.weight || 1))
      : 1.0; // lineage = direct connection, low cost

    if (adjList.has(source)) adjList.get(source).push({ node: target, weight, type: e.type });
    if (adjList.has(target)) adjList.get(target).push({ node: source, weight, type: e.type });
  });

  // Node color function
  function nodeColor(node) {
    if (node.school && schoolColors[node.school]) return schoolColors[node.school];
    return "#757575";
  }

  // --- Render UI ---
  el.innerHTML = "";
  el.style.position = "relative";

  // Header + controls
  const header = document.createElement("div");
  header.style.cssText = "padding:16px 20px;background:#1a1a2e;border-bottom:1px solid #333;";
  header.innerHTML = `
    <h3 style="margin:0 0 4px;font-family:'EB Garamond',serif;font-size:20px;color:#fff;font-weight:500;">${pt('title')}</h3>
    <p style="margin:0 0 14px;font-size:12.5px;color:#888;font-family:'Source Sans 3',sans-serif;">${pt('subtitle')}</p>
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">${pt('from')}</label>
      <select id="path-from" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:4px 8px;font-size:12px;width:200px;">
        <option value="">${pt('placeholder')}</option>
      </select>
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">${pt('to')}</label>
      <select id="path-to" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:4px 8px;font-size:12px;width:200px;">
        <option value="">${pt('placeholder')}</option>
      </select>
      <button id="path-find" style="background:#2a4a7f;color:#fff;border:none;border-radius:4px;padding:6px 16px;font-size:12px;cursor:pointer;font-family:'Source Sans 3',sans-serif;">${pt('find')}</button>
    </div>
    <div id="path-result-text" style="margin-top:12px;font-size:12.5px;color:#ccc;font-family:'Source Sans 3',sans-serif;min-height:20px;"></div>
  `;
  el.appendChild(header);

  // SVG area
  const svgContainer = document.createElement("div");
  svgContainer.style.cssText = "width:100%;height:calc(100% - 160px);min-height:400px;position:relative;";
  el.appendChild(svgContainer);

  const width = el.clientWidth || 900;
  const height = Math.max(400, (el.clientHeight || 600) - 160);

  const svg = d3.select(svgContainer).append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "#0d1117");

  // Arrow marker
  svg.append("defs").append("marker")
    .attr("id", "path-arrow")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 25)
    .attr("refY", 0)
    .attr("markerWidth", 8)
    .attr("markerHeight", 8)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#4a90e2");

  const gMain = svg.append("g");

  // Zoom
  const zoom = d3.zoom()
    .scaleExtent([0.5, 4])
    .on("zoom", (event) => gMain.attr("transform", event.transform));
  svg.call(zoom);

  // Populate dropdowns
  const sortedNodes = [...nodes].sort((a, b) => a.id.localeCompare(b.id));
  const fromSelect = document.getElementById("path-from");
  const toSelect = document.getElementById("path-to");

  sortedNodes.forEach(n => {
    const opt1 = document.createElement("option");
    opt1.value = n.id;
    opt1.textContent = n.id;
    fromSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = n.id;
    opt2.textContent = n.id;
    toSelect.appendChild(opt2);
  });

  // --- Path visualization ---
  function visualizePath(paths) {
    gMain.selectAll("*").remove();

    if (!paths || paths.length === 0) return;

    // Collect all unique nodes in all paths
    const pathNodeIds = new Set();
    paths.forEach(path => path.forEach(p => pathNodeIds.add(p.node)));

    const pathNodes = nodes.filter(n => pathNodeIds.has(n.id)).map(n => ({ ...n }));

    // Create edges from paths
    const pathEdges = [];
    const edgeSet = new Set();
    paths.forEach((path, pathIdx) => {
      for (let i = 0; i < path.length - 1; i++) {
        const key = `${path[i].node}|${path[i + 1].node}`;
        const keyRev = `${path[i + 1].node}|${path[i].node}`;
        if (!edgeSet.has(key) && !edgeSet.has(keyRev)) {
          edgeSet.add(key);
          pathEdges.push({
            source: path[i].node,
            target: path[i + 1].node,
            type: path[i + 1].edgeType || 'co-citation',
            pathIndex: pathIdx,
            isPrimary: pathIdx === 0
          });
        }
      }
    });

    // Layout: arrange nodes in a horizontal line for the primary path,
    // with alternative path nodes slightly offset
    const primaryPath = paths[0];
    const primaryNodeIds = primaryPath.map(p => p.node);
    const spacing = Math.min(width / (primaryPath.length + 1), 180);
    const startX = (width - spacing * (primaryPath.length - 1)) / 2;

    // Position primary path nodes
    pathNodes.forEach(n => {
      const idx = primaryNodeIds.indexOf(n.id);
      if (idx >= 0) {
        n.fx = startX + idx * spacing;
        n.fy = height / 2;
      } else {
        // Alternative path nodes: offset vertically
        n.fx = width / 2 + (Math.random() - 0.5) * width * 0.5;
        n.fy = height / 2 + (Math.random() > 0.5 ? 1 : -1) * (80 + Math.random() * 60);
      }
      n.x = n.fx;
      n.y = n.fy;
    });

    // Draw edges
    const link = gMain.append("g").selectAll("line")
      .data(pathEdges)
      .join("line")
      .attr("x1", d => { const n = pathNodes.find(n => n.id === d.source); return n ? n.x : 0; })
      .attr("y1", d => { const n = pathNodes.find(n => n.id === d.source); return n ? n.y : 0; })
      .attr("x2", d => { const n = pathNodes.find(n => n.id === d.target); return n ? n.x : 0; })
      .attr("y2", d => { const n = pathNodes.find(n => n.id === d.target); return n ? n.y : 0; })
      .attr("stroke", d => d.isPrimary ? (d.type === 'co-citation' ? '#4a90e2' : '#ff9800') : 'rgba(100,100,150,0.4)')
      .attr("stroke-width", d => d.isPrimary ? 3 : 1.5)
      .attr("stroke-dasharray", d => d.type !== 'co-citation' ? "6,3" : "none")
      .attr("marker-end", "url(#path-arrow)");

    // Draw nodes
    const node = gMain.append("g").selectAll("g")
      .data(pathNodes)
      .join("g")
      .attr("transform", d => `translate(${d.x},${d.y})`);

    // Node circles
    node.append("circle")
      .attr("r", d => {
        if (d.id === primaryNodeIds[0] || d.id === primaryNodeIds[primaryNodeIds.length - 1]) return 16;
        if (primaryNodeIds.includes(d.id)) return 12;
        return 8;
      })
      .attr("fill", d => nodeColor(d))
      .attr("stroke", d => {
        if (d.id === primaryNodeIds[0] || d.id === primaryNodeIds[primaryNodeIds.length - 1]) return '#fff';
        return primaryNodeIds.includes(d.id) ? 'rgba(255,255,255,0.5)' : 'none';
      })
      .attr("stroke-width", 2);

    // Node labels
    node.append("text")
      .text(d => d.id)
      .attr("y", d => {
        if (primaryNodeIds.includes(d.id)) return -22;
        return -14;
      })
      .attr("text-anchor", "middle")
      .attr("font-size", d => primaryNodeIds.includes(d.id) ? 12 : 10)
      .attr("fill", d => primaryNodeIds.includes(d.id) ? '#fff' : '#aaa')
      .attr("font-family", "'EB Garamond', serif")
      .attr("font-weight", d => (d.id === primaryNodeIds[0] || d.id === primaryNodeIds[primaryNodeIds.length - 1]) ? 600 : 400);

    // School labels below
    node.append("text")
      .text(d => schoolLabel(d.school || d.hetSchool || ''))
      .attr("y", d => primaryNodeIds.includes(d.id) ? 28 : 20)
      .attr("text-anchor", "middle")
      .attr("font-size", 9)
      .attr("fill", d => nodeColor(d))
      .attr("font-family", "'Source Sans 3', sans-serif")
      .attr("opacity", 0.8);

    // Edge type labels on primary path
    pathEdges.filter(e => e.isPrimary).forEach(e => {
      const sn = pathNodes.find(n => n.id === e.source);
      const tn = pathNodes.find(n => n.id === e.target);
      if (sn && tn) {
        gMain.append("text")
          .attr("x", (sn.x + tn.x) / 2)
          .attr("y", (sn.y + tn.y) / 2 - 12)
          .attr("text-anchor", "middle")
          .attr("font-size", 9)
          .attr("fill", e.type === 'co-citation' ? '#4a90e2' : '#ff9800')
          .attr("font-family", "'Source Sans 3', sans-serif")
          .text(e.type === 'co-citation' ? pt('cocitation') : pt('lineage_lbl'));
      }
    });

    // Animate entrance
    link.attr("stroke-opacity", 0)
      .transition().duration(800).delay((d, i) => i * 150)
      .attr("stroke-opacity", 1);

    node.attr("opacity", 0)
      .transition().duration(600).delay((d, i) => i * 100)
      .attr("opacity", 1);
  }

  // --- Find path handler ---
  document.getElementById("path-find").addEventListener("click", () => {
    const from = fromSelect.value;
    const to = toSelect.value;
    const resultText = document.getElementById("path-result-text");

    if (!from || !to || from === to) {
      resultText.innerHTML = `<span style="color:#ff6b6b;">${pt('select_both')}</span>`;
      return;
    }

    const result = dijkstra(adjList, from, to);

    if (!result) {
      resultText.innerHTML = `<span style="color:#ff6b6b;">${pt('no_path')}</span>`;
      gMain.selectAll("*").remove();
      return;
    }

    // Get all shortest paths
    const allPaths = allShortestPaths(adjList, from, to, 3);

    // Build narrative text
    const primaryPath = allPaths[0] || result.path;
    const intermediates = primaryPath.slice(1, -1).map(p => p.node);
    const stepsCount = primaryPath.length - 1;

    let narrative = `<strong style="color:#4a90e2;">${pt('path_found')}</strong> `;
    narrative += `${from} \u2192 ${to} (${stepsCount} ${pt('steps')}`;
    if (intermediates.length > 0) {
      narrative += ` ${pt('via')} ${intermediates.join(', ')}`;
    }
    narrative += ')';

    if (allPaths.length > 1) {
      narrative += `<br><span style="color:#888;font-size:11px;">${pt('alt_paths')} ${allPaths.length - 1} weitere</span>`;
    }

    resultText.innerHTML = narrative;

    // Visualize
    visualizePath(allPaths);
  });

  // Also trigger on Enter key in selects
  [fromSelect, toSelect].forEach(sel => {
    sel.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') document.getElementById("path-find").click();
    });
  });

  // Show initial hint visualization (faded full network)
  const hintG = gMain.append("g").attr("opacity", 0.15);
  const nodesCopy = nodes.map(n => ({ ...n }));
  const sim = d3.forceSimulation(nodesCopy)
    .force("charge", d3.forceManyBody().strength(-30))
    .force("center", d3.forceCenter(width / 2, height / 2))
    .force("collision", d3.forceCollide(8))
    .stop();

  for (let i = 0; i < 100; i++) sim.tick();

  hintG.selectAll("circle")
    .data(nodesCopy)
    .join("circle")
    .attr("cx", d => d.x)
    .attr("cy", d => d.y)
    .attr("r", 3)
    .attr("fill", d => nodeColor(d));
}
