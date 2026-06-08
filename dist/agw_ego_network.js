// agw_ego_network.js — Interactive Ego-Network Explorer (Feature C)
// Pure D3 + vanilla JS, no React dependency. Mounts into a container element.
import * as d3 from "d3";
import { schoolLabel, getLang, uiText } from "./school_labels.js";

const DATA_URL = "./data/unified_network.json";

// ── Shareable Card Export ─────────────────────────────────────────────────────
async function generateShareCard(egoNode, neighbors, nodeColorFn, graphNodes, graphEdges) {
  const lang = getLang();
  const W = 1200, H = 630; // Twitter/OG card dimensions
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // Background gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, '#0d1117');
  grad.addColorStop(1, '#1a1a2e');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid pattern
  ctx.strokeStyle = 'rgba(255,255,255,0.03)';
  ctx.lineWidth = 0.5;
  for (let x = 0; x < W; x += 40) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke(); }
  for (let y = 0; y < H; y += 40) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }

  // Mini ego-network in center-right area
  const cx = 750, cy = 315, radius = 180;
  const neighborNodes = graphNodes.filter(n => neighbors.has(n.id) && n.id !== egoNode.id);
  const angleStep = (2 * Math.PI) / Math.max(neighborNodes.length, 1);

  // Draw edges
  ctx.globalAlpha = 0.3;
  neighborNodes.forEach((n, i) => {
    const angle = angleStep * i - Math.PI / 2;
    const nx = cx + Math.cos(angle) * radius * (0.6 + Math.random() * 0.4);
    const ny = cy + Math.sin(angle) * radius * (0.6 + Math.random() * 0.4);
    n._cardX = nx;
    n._cardY = ny;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(nx, ny);
    const edgeType = graphEdges.find(e => {
      const sid = typeof e.source === 'object' ? e.source.id : e.source;
      const tid = typeof e.target === 'object' ? e.target.id : e.target;
      return (sid === egoNode.id && tid === n.id) || (sid === n.id && tid === egoNode.id);
    });
    ctx.strokeStyle = edgeType && edgeType.type !== 'co-citation' ? '#ff9800' : '#555';
    ctx.lineWidth = edgeType && edgeType.type !== 'co-citation' ? 2 : 1;
    ctx.stroke();
  });
  ctx.globalAlpha = 1;

  // Draw neighbor nodes
  neighborNodes.forEach(n => {
    ctx.beginPath();
    ctx.arc(n._cardX, n._cardY, 5, 0, Math.PI * 2);
    ctx.fillStyle = nodeColorFn(n);
    ctx.fill();
    // Small label
    ctx.font = '9px "Source Sans 3", sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.6)';
    const parts = n.id.split(' ');
    ctx.fillText(parts[parts.length - 1], n._cardX + 7, n._cardY + 3);
  });

  // Draw ego node (larger, centered)
  ctx.beginPath();
  ctx.arc(cx, cy, 14, 0, Math.PI * 2);
  ctx.fillStyle = nodeColorFn(egoNode);
  ctx.fill();
  ctx.strokeStyle = '#fff';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Left panel: text content
  // Name
  ctx.font = 'bold 32px "EB Garamond", Georgia, serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(egoNode.id, 40, 70);

  // School badge
  const schoolName = egoNode.hetSchool || egoNode.school || egoNode.lane || '';
  ctx.font = '14px "Source Sans 3", sans-serif';
  ctx.fillStyle = nodeColorFn(egoNode);
  ctx.fillText('\u25CF ' + schoolName, 40, 100);

  // Dates
  if (egoNode.birth) {
    ctx.font = '13px "Source Sans 3", sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('*' + egoNode.birth + (egoNode.death ? ' \u2013 \u2020' + egoNode.death : ''), 40, 124);
  }

  // Bio summary (wrapped)
  const bio = lang === 'en' ? (egoNode.bioSummaryEn || egoNode.descEn || '') : (egoNode.bioSummaryDe || egoNode.descDe || '');
  if (bio) {
    ctx.font = '13px "Source Sans 3", sans-serif';
    ctx.fillStyle = '#ccc';
    wrapText(ctx, bio, 40, 160, 440, 18);
  }

  // Key works
  if (egoNode.keyWorks) {
    ctx.font = 'bold 11px "Source Sans 3", sans-serif';
    ctx.fillStyle = '#aaa';
    ctx.fillText(lang === 'en' ? 'Key Works:' : 'Hauptwerke:', 40, 290);
    ctx.font = '11px "Source Sans 3", sans-serif';
    ctx.fillStyle = '#888';
    const works = egoNode.keyWorks.split(';').slice(0, 3);
    works.forEach((w, i) => ctx.fillText(w.trim(), 40, 308 + i * 16));
  }

  // Stats
  ctx.font = '12px "Source Sans 3", sans-serif';
  ctx.fillStyle = '#aaa';
  const statsY = 400;
  ctx.fillText(neighbors.size + ' ' + (lang === 'en' ? 'connections' : 'Verbindungen'), 40, statsY);
  if (egoNode.conferenceAppearances) {
    ctx.fillText(egoNode.conferenceAppearances + ' ' + (lang === 'en' ? 'conference volumes' : 'Konferenzb\u00e4nde'), 40, statsY + 18);
  }

  // Divider line
  ctx.strokeStyle = 'rgba(255,255,255,0.1)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(40, H - 80);
  ctx.lineTo(W - 40, H - 80);
  ctx.stroke();

  // Footer branding
  ctx.font = '11px "Source Sans 3", sans-serif';
  ctx.fillStyle = '#666';
  ctx.fillText('AGW \u00b7 Verein f\u00fcr Socialpolitik \u00b7 Intellectual Reception History 1980\u20132023', 40, H - 50);
  ctx.fillText('david-bieri.github.io/agw-vfs/analytics.html', 40, H - 32);

  // Legend in bottom-right
  ctx.font = '10px "Source Sans 3", sans-serif';
  ctx.fillStyle = '#555';
  ctx.fillText('\u2014 Co-citation', W - 160, H - 50);
  ctx.fillStyle = '#ff9800';
  ctx.fillText('\u2014 Lineage', W - 160, H - 34);

  return canvas;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(' ');
  let line = '';
  let currentY = y;
  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + ' ';
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      ctx.fillText(line, x, currentY);
      line = words[i] + ' ';
      currentY += lineHeight;
      if (currentY > y + lineHeight * 6) { ctx.fillText(line + '\u2026', x, currentY); return; }
    } else {
      line = testLine;
    }
  }
  ctx.fillText(line, x, currentY);
}

export default async function AGWEgoNetwork(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("EgoNetwork: container not found"); return; }

  // --- Load data ---
  const data = await fetch(DATA_URL).then(r => r.json());
  const { nodes, edges, schoolColors, schools, lanes } = data;

  // --- State ---
  let selectedEgo = null;
  let edgeFilter = "all"; // "all" | "co-citation" | "lineage"
  let simulation = null;

  // --- Layout ---
  el.innerHTML = "";
  el.style.position = "relative";
  el.style.overflow = "hidden";

  // Controls bar
  const controls = document.createElement("div");
  controls.className = "ego-controls";
  controls.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:#1a1a2e;border-bottom:1px solid #333;flex-wrap:wrap;">
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">${uiText('edges')}</label>
      <select id="ego-edge-filter" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:2px 8px;font-size:12px;">
        <option value="all">${uiText('edge_all')}</option>
        <option value="co-citation">${uiText('edge_cocit')}</option>
        <option value="lineage">${uiText('edge_lineage')}</option>
      </select>
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">${uiText('search')}</label>
      <input id="ego-search" type="text" placeholder="${uiText('search_placeholder')}" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:2px 8px;font-size:12px;width:160px;">
      <button id="ego-reset" style="background:#444;color:#eee;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;">${uiText('overview')}</button>
      <span id="ego-info" style="color:#888;font-size:11px;margin-left:auto;font-family:'Source Sans 3',sans-serif;">${uiText('ego_hint')}</span>
    </div>
  `;
  el.appendChild(controls);

  // SVG container
  const svgContainer = document.createElement("div");
  svgContainer.style.cssText = "width:100%;height:calc(100% - 42px);position:relative;";
  el.appendChild(svgContainer);

  const width = el.clientWidth || 900;
  const height = (el.clientHeight || 600) - 42;

  const svg = d3.select(svgContainer).append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "#0d1117");

  // Defs for arrow markers
  svg.append("defs").append("marker")
    .attr("id", "arrow-lineage")
    .attr("viewBox", "0 -5 10 10")
    .attr("refX", 20)
    .attr("refY", 0)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
    .append("path")
    .attr("d", "M0,-5L10,0L0,5")
    .attr("fill", "#ff9800");

  const g = svg.append("g");

  // Zoom behavior
  const zoom = d3.zoom()
    .scaleExtent([0.3, 5])
    .on("zoom", (event) => g.attr("transform", event.transform));
  svg.call(zoom);

  // --- Detail panel ---
  const detailPanel = document.createElement("div");
  detailPanel.id = "ego-detail-panel";
  detailPanel.style.cssText = `
    position:absolute;top:50px;right:12px;width:240px;
    background:rgba(20,20,40,0.95);border:1px solid #444;border-radius:8px;
    padding:14px;color:#eee;font-family:'Source Sans 3',sans-serif;font-size:12px;
    display:none;box-shadow:0 4px 20px rgba(0,0,0,0.5);z-index:10;
    max-height:calc(100% - 70px);overflow-y:auto;
  `;
  svgContainer.appendChild(detailPanel);

  // --- Prepare graph data ---
  // Create copies for D3 force (it mutates objects)
  let graphNodes = nodes.map(n => ({ ...n }));
  let graphEdges = edges.map(e => ({ ...e }));

  // Color function
  function nodeColor(node) {
    if (node.school && schoolColors[node.school]) return schoolColors[node.school];
    // Map lane names to approximate school colors
    const laneMap = {
      klassik: "#2196F3", hist: "#FF9800", aut: "#CE93D8",
      camb: "#4CAF50", anglo: "#90CAF9", stockholm: "#00BCD4",
      inst: "#FF8A65", ordo: "#80CBC4", raum: "#B39DDB"
    };
    return laneMap[node.lane] || "#757575";
  }

  // Node radius based on importance
  function nodeRadius(node) {
    if (node.conferenceAppearances) return Math.max(5, Math.sqrt(node.conferenceAppearances) * 2.5);
    return 5;
  }

  // --- Render functions ---
  function getVisibleEdges() {
    if (edgeFilter === "all") return graphEdges;
    if (edgeFilter === "co-citation") return graphEdges.filter(e => e.type === "co-citation");
    return graphEdges.filter(e => e.type !== "co-citation");
  }

  function getNeighbors(egoId) {
    const visEdges = getVisibleEdges();
    const neighbors = new Set();
    visEdges.forEach(e => {
      const sid = typeof e.source === "object" ? e.source.id : e.source;
      const tid = typeof e.target === "object" ? e.target.id : e.target;
      if (sid === egoId) neighbors.add(tid);
      if (tid === egoId) neighbors.add(sid);
    });
    return neighbors;
  }

  function renderGraph() {
    g.selectAll("*").remove();

    const visEdges = getVisibleEdges();

    // Filter edges to only those connecting existing nodes
    const nodeIds = new Set(graphNodes.map(n => n.id));
    const validEdges = visEdges.filter(e => {
      const sid = typeof e.source === "object" ? e.source.id : e.source;
      const tid = typeof e.target === "object" ? e.target.id : e.target;
      return nodeIds.has(sid) && nodeIds.has(tid);
    });

    // Links
    const link = g.append("g").attr("class", "links")
      .selectAll("line")
      .data(validEdges)
      .join("line")
      .attr("stroke", d => d.type === "co-citation" ? "#555" : "#ff9800")
      .attr("stroke-width", d => d.type === "co-citation" ? Math.max(0.5, (d.weight || 1) * 0.3) : 1.5)
      .attr("stroke-dasharray", d => d.type === "co-citation" ? "none" : "4,2")
      .attr("stroke-opacity", 0.4)
      .attr("marker-end", d => d.type !== "co-citation" ? "url(#arrow-lineage)" : null);

    // Nodes
    const node = g.append("g").attr("class", "nodes")
      .selectAll("g")
      .data(graphNodes)
      .join("g")
      .attr("cursor", "pointer")
      .call(d3.drag()
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended));

    node.append("circle")
      .attr("r", d => nodeRadius(d))
      .attr("fill", d => nodeColor(d))
      .attr("stroke", d => d.inLineage && d.inCoCitation ? "#fff" : "none")
      .attr("stroke-width", 1.5)
      .attr("opacity", 0.85);

    node.append("text")
      .text(d => {
        // Show short name
        const parts = d.id.split(" ");
        return parts[parts.length - 1]; // Last name
      })
      .attr("dx", d => nodeRadius(d) + 3)
      .attr("dy", 3)
      .attr("font-size", d => nodeRadius(d) > 8 ? 10 : 8)
      .attr("fill", "#ccc")
      .attr("font-family", "'Source Sans 3', sans-serif")
      .attr("opacity", 0.8);

    // Click handler
    node.on("click", (event, d) => {
      event.stopPropagation();
      selectEgo(d.id);
    });

    // Hover handler
    node.on("mouseenter", (event, d) => {
      if (!selectedEgo) {
        highlightNeighbors(d.id, node, link);
      }
    }).on("mouseleave", () => {
      if (!selectedEgo) {
        resetHighlight(node, link);
      }
    });

    // Force simulation
    if (simulation) simulation.stop();

    simulation = d3.forceSimulation(graphNodes)
      .force("link", d3.forceLink(validEdges).id(d => d.id).distance(d => d.type === "co-citation" ? 80 : 60).strength(d => d.type === "co-citation" ? 0.1 : 0.3))
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(d => nodeRadius(d) + 4))
      .on("tick", () => {
        link
          .attr("x1", d => d.source.x)
          .attr("y1", d => d.source.y)
          .attr("x2", d => d.target.x)
          .attr("y2", d => d.target.y);
        node.attr("transform", d => `translate(${d.x},${d.y})`);
      });

    return { node, link };
  }

  function highlightNeighbors(egoId, node, link) {
    const neighbors = getNeighbors(egoId);
    neighbors.add(egoId);

    node.select("circle")
      .transition().duration(200)
      .attr("opacity", d => neighbors.has(d.id) ? 1 : 0.1);
    node.select("text")
      .transition().duration(200)
      .attr("opacity", d => neighbors.has(d.id) ? 1 : 0.05);

    link
      .transition().duration(200)
      .attr("stroke-opacity", d => {
        const sid = typeof d.source === "object" ? d.source.id : d.source;
        const tid = typeof d.target === "object" ? d.target.id : d.target;
        return (sid === egoId || tid === egoId) ? 0.8 : 0.03;
      });
  }

  function resetHighlight(node, link) {
    node.select("circle").transition().duration(200).attr("opacity", 0.85);
    node.select("text").transition().duration(200).attr("opacity", 0.8);
    link.transition().duration(200).attr("stroke-opacity", 0.4);
  }

  function selectEgo(egoId) {
    selectedEgo = egoId;
    const neighbors = getNeighbors(egoId);

    // Update info text
    document.getElementById("ego-info").textContent = `Ego: ${egoId} \u2014 ${neighbors.size} Verbindungen`;

    // Update force to center on ego
    const egoNode = graphNodes.find(n => n.id === egoId);
    if (!egoNode) return;

    // Fix ego to center
    egoNode.fx = width / 2;
    egoNode.fy = height / 2;

    // Update forces
    simulation
      .force("charge", d3.forceManyBody().strength(d => neighbors.has(d.id) || d.id === egoId ? -200 : -400))
      .force("center", null)
      .force("x", d3.forceX(width / 2).strength(d => neighbors.has(d.id) ? 0.05 : 0.15))
      .force("y", d3.forceY(height / 2).strength(d => neighbors.has(d.id) ? 0.05 : 0.15))
      .alpha(0.8)
      .restart();

    // Highlight
    const allNodes = g.selectAll(".nodes g");
    const allLinks = g.selectAll(".links line");

    neighbors.add(egoId);

    allNodes.select("circle")
      .transition().duration(500)
      .attr("opacity", d => neighbors.has(d.id) ? 1 : 0.08)
      .attr("r", d => d.id === egoId ? nodeRadius(d) * 1.5 : nodeRadius(d));

    allNodes.select("text")
      .transition().duration(500)
      .attr("opacity", d => neighbors.has(d.id) ? 1 : 0)
      .attr("font-size", d => d.id === egoId ? 13 : (neighbors.has(d.id) ? 11 : 8));

    allLinks
      .transition().duration(500)
      .attr("stroke-opacity", d => {
        const sid = typeof d.source === "object" ? d.source.id : d.source;
        const tid = typeof d.target === "object" ? d.target.id : d.target;
        return (sid === egoId || tid === egoId) ? 0.8 : 0.02;
      })
      .attr("stroke-width", d => {
        const sid = typeof d.source === "object" ? d.source.id : d.source;
        const tid = typeof d.target === "object" ? d.target.id : d.target;
        if (sid === egoId || tid === egoId) {
          return d.type === "co-citation" ? Math.max(1.5, (d.weight || 1) * 0.5) : 2.5;
        }
        return d.type === "co-citation" ? 0.5 : 1;
      });

    // Show detail panel
    showDetailPanel(egoNode, neighbors);
  }

  // ── Share Card button handler ──
  async function downloadShareCard(egoNode, neighbors) {
    const canvas = await generateShareCard(egoNode, neighbors, nodeColor, graphNodes, graphEdges);
    const link = document.createElement('a');
    link.download = 'agw_ego_' + egoNode.id.replace(/\s+/g, '_') + '.png';
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  function showDetailPanel(egoNode, neighbors) {
    const neighborNodes = graphNodes.filter(n => neighbors.has(n.id) && n.id !== egoNode.id);
    const coCitNeighbors = neighborNodes.filter(n => {
      return edges.some(e => e.type === "co-citation" && 
        ((e.source === egoNode.id || (typeof e.source === "object" && e.source.id === egoNode.id)) && (e.target === n.id || (typeof e.target === "object" && e.target.id === n.id))) ||
        ((e.source === n.id || (typeof e.source === "object" && e.source.id === n.id)) && (e.target === egoNode.id || (typeof e.target === "object" && e.target.id === egoNode.id)))
      );
    });
    const lineageNeighbors = neighborNodes.filter(n => {
      return edges.some(e => e.type !== "co-citation" && 
        ((e.source === egoNode.id && e.target === n.id) || (e.source === n.id && e.target === egoNode.id))
      );
    });

    const lang = document.documentElement.lang || "de";
    const hasHetData = !!egoNode.bioSummaryDe;
    
    let html = `<div style="margin-bottom:10px;border-bottom:1px solid #444;padding-bottom:8px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;">
        <strong style="font-size:15px;color:#fff;font-family:'EB Garamond',serif;">${egoNode.id}</strong>
        ${egoNode.hetUrl ? `<a href="${egoNode.hetUrl}" target="_blank" title="HET Website Profil" style="color:#4a90e2;font-size:10px;text-decoration:none;background:#223;padding:2px 4px;border-radius:3px;">HET</a>` : ""}
      </div>
      <span style="color:${nodeColor(egoNode)};font-size:11px;">\u25CF ${egoNode.hetSchool || egoNode.school || egoNode.lane || "\u2014"}</span><br>`;
    
    if (egoNode.birth) html += `<span style="color:#888;font-size:11px;">*${egoNode.birth}${egoNode.death ? " \u2020" + egoNode.death : ""}</span><br>`;
    if (egoNode.conferenceAppearances) html += `<span style="color:#888;font-size:11px;">${egoNode.conferenceAppearances} ${lang === 'en' ? 'Conferences' : 'Konferenzb\u00e4nde'}</span><br>`;
    
    html += `<div style="margin-top:8px;font-size:11.5px;color:#ddd;line-height:1.4;">`;
    if (hasHetData) {
      html += lang === 'en' ? egoNode.bioSummaryEn : egoNode.bioSummaryDe;
      if (egoNode.keyWorks) {
        html += `<div style="margin-top:6px;padding:6px;background:#1a1a2e;border-radius:4px;color:#aaa;font-size:10.5px;">
          <strong style="color:#ccc;">${lang === 'en' ? 'Key Works:' : 'Hauptwerke:'}</strong><br>
          ${egoNode.keyWorks.replace(/;/g, '<br>')}
        </div>`;
      }
    } else if (egoNode.descDe) {
      html += `<span style="font-style:italic;">${lang === 'en' ? (egoNode.descEn || egoNode.descDe) : egoNode.descDe}</span>`;
    }
    html += `</div></div>`;

    if (coCitNeighbors.length > 0) {
      html += `<div style="margin-bottom:8px;"><strong style="color:#aaa;font-size:11px;">Co-Zitation (${coCitNeighbors.length}):</strong><br>`;
      coCitNeighbors.slice(0, 8).forEach(n => {
        const parts = n.id.split(" ");
        html += `<span style="color:${nodeColor(n)};">\u25CF</span> ${parts[parts.length - 1]}<br>`;
      });
      if (coCitNeighbors.length > 8) html += `<span style="color:#666;">+${coCitNeighbors.length - 8} weitere</span>`;
      html += `</div>`;
    }

    if (lineageNeighbors.length > 0) {
      html += `<div><strong style="color:#ff9800;font-size:11px;">Stammbaum (${lineageNeighbors.length}):</strong><br>`;
      lineageNeighbors.forEach(n => {
        const parts = n.id.split(" ");
        html += `<span style="color:#ff9800;">\u2192</span> ${parts[parts.length - 1]}<br>`;
      });
      html += `</div>`;
    }

    // Share button
    html += `<div style="margin-top:12px;padding-top:10px;border-top:1px solid #444;">
      <button id="ego-share-btn" style="width:100%;background:#2a4a7f;color:#fff;border:none;border-radius:4px;padding:8px 12px;font-size:12px;cursor:pointer;font-family:'Source Sans 3',sans-serif;transition:background .15s;">
        \ud83d\udcf7 ${getLang() === 'en' ? 'Download Share Card (PNG)' : 'Visitenkarte herunterladen (PNG)'}
      </button>
    </div>`;

    detailPanel.innerHTML = html;
    detailPanel.style.display = "block";

    // Attach share button handler
    const shareBtn = document.getElementById('ego-share-btn');
    if (shareBtn) {
      shareBtn.addEventListener('click', () => downloadShareCard(egoNode, neighbors));
      shareBtn.addEventListener('mouseenter', () => { shareBtn.style.background = '#3a6baf'; });
      shareBtn.addEventListener('mouseleave', () => { shareBtn.style.background = '#2a4a7f'; });
    }
  }

  function resetToOverview() {
    selectedEgo = null;
    detailPanel.style.display = "none";
    document.getElementById("ego-info").textContent = uiText('ego_hint');

    // Unfix all nodes
    graphNodes.forEach(n => { n.fx = null; n.fy = null; });

    // Reset forces
    simulation
      .force("charge", d3.forceManyBody().strength(-120))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("x", null)
      .force("y", null)
      .alpha(0.6)
      .restart();

    // Reset visual
    const allNodes = g.selectAll(".nodes g");
    const allLinks = g.selectAll(".links line");

    allNodes.select("circle")
      .transition().duration(400)
      .attr("opacity", 0.85)
      .attr("r", d => nodeRadius(d));
    allNodes.select("text")
      .transition().duration(400)
      .attr("opacity", 0.8)
      .attr("font-size", d => nodeRadius(d) > 8 ? 10 : 8);
    allLinks
      .transition().duration(400)
      .attr("stroke-opacity", 0.4)
      .attr("stroke-width", d => d.type === "co-citation" ? Math.max(0.5, (d.weight || 1) * 0.3) : 1.5);
  }

  // Drag functions
  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }
  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    if (d.id !== selectedEgo) { d.fx = null; d.fy = null; }
  }

  // --- Event listeners ---
  document.getElementById("ego-reset").addEventListener("click", resetToOverview);

  document.getElementById("ego-edge-filter").addEventListener("change", (e) => {
    edgeFilter = e.target.value;
    // Re-render with new filter
    graphNodes = nodes.map(n => ({ ...n }));
    graphEdges = edges.map(e => ({ ...e }));
    renderGraph();
    if (selectedEgo) {
      setTimeout(() => selectEgo(selectedEgo), 300);
    }
  });

  document.getElementById("ego-search").addEventListener("input", (e) => {
    const query = e.target.value.toLowerCase();
    if (query.length < 2) return;
    const match = graphNodes.find(n => n.id.toLowerCase().includes(query));
    if (match) {
      selectEgo(match.id);
    }
  });

  // Click on background to reset
  svg.on("click", () => {
    if (selectedEgo) resetToOverview();
  });

  // --- Initial render ---
  renderGraph();
}
