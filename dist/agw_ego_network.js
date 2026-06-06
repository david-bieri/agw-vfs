// agw_ego_network.js — Interactive Ego-Network Explorer (Feature C)
// Pure D3 + vanilla JS, no React dependency. Mounts into a container element.
import * as d3 from "d3";

const DATA_URL = "./data/unified_network.json";

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
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">Kanten:</label>
      <select id="ego-edge-filter" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:2px 8px;font-size:12px;">
        <option value="all">Alle (Co-Zitation + Stammbaum)</option>
        <option value="co-citation">Nur Co-Zitation</option>
        <option value="lineage">Nur Stammbaum (Lehrer/Schüler)</option>
      </select>
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">Suche:</label>
      <input id="ego-search" type="text" placeholder="Name eingeben…" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:2px 8px;font-size:12px;width:160px;">
      <button id="ego-reset" style="background:#444;color:#eee;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;">⟵ Übersicht</button>
      <span id="ego-info" style="color:#888;font-size:11px;margin-left:auto;font-family:'Source Sans 3',sans-serif;">Klicken Sie auf eine Figur, um ihr Ego-Netzwerk zu erkunden.</span>
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
    document.getElementById("ego-info").textContent = `Ego: ${egoId} — ${neighbors.size} Verbindungen`;

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

    let html = `<div style="margin-bottom:10px;border-bottom:1px solid #444;padding-bottom:8px;">
      <strong style="font-size:14px;color:#fff;">${egoNode.id}</strong><br>
      <span style="color:${nodeColor(egoNode)};font-size:11px;">● ${egoNode.school || egoNode.lane || "—"}</span><br>`;
    if (egoNode.birth) html += `<span style="color:#888;">*${egoNode.birth}${egoNode.death ? " †" + egoNode.death : ""}</span><br>`;
    if (egoNode.conferenceAppearances) html += `<span style="color:#888;">${egoNode.conferenceAppearances} Konferenzbände</span><br>`;
    if (egoNode.descDe) html += `<span style="color:#aaa;font-style:italic;">${egoNode.descDe}</span>`;
    html += `</div>`;

    if (coCitNeighbors.length > 0) {
      html += `<div style="margin-bottom:8px;"><strong style="color:#aaa;font-size:11px;">Co-Zitation (${coCitNeighbors.length}):</strong><br>`;
      coCitNeighbors.slice(0, 8).forEach(n => {
        const parts = n.id.split(" ");
        html += `<span style="color:${nodeColor(n)};">●</span> ${parts[parts.length - 1]}<br>`;
      });
      if (coCitNeighbors.length > 8) html += `<span style="color:#666;">+${coCitNeighbors.length - 8} weitere</span>`;
      html += `</div>`;
    }

    if (lineageNeighbors.length > 0) {
      html += `<div><strong style="color:#ff9800;font-size:11px;">Stammbaum (${lineageNeighbors.length}):</strong><br>`;
      lineageNeighbors.forEach(n => {
        const parts = n.id.split(" ");
        html += `<span style="color:#ff9800;">→</span> ${parts[parts.length - 1]}<br>`;
      });
      html += `</div>`;
    }

    detailPanel.innerHTML = html;
    detailPanel.style.display = "block";
  }

  function resetToOverview() {
    selectedEgo = null;
    detailPanel.style.display = "none";
    document.getElementById("ego-info").textContent = "Klicken Sie auf eine Figur, um ihr Ego-Netzwerk zu erkunden.";

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
