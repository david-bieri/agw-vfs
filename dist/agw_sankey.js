// agw_sankey.js — True Sankey/Alluvial diagram showing inter-school attention flows
// Uses d3-sankey layout to show how intellectual attention migrates between schools across decades
import * as d3 from "d3";
import { schoolLabel, getLang, uiText } from "./school_labels.js";

const SANKEY_DATA_URL = "./data/sankey_flows.json";

export default async function AGWSankey(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("Sankey: container not found"); return; }

  // Load data
  const data = await fetch(SANKEY_DATA_URL).then(r => r.json());
  const { decades, schools, schoolColors, nodeSizes, links } = data;

  // State
  let highlightSchool = null;

  // Layout
  el.innerHTML = "";
  el.style.position = "relative";
  el.style.overflow = "hidden";

  // Controls bar
  const controls = document.createElement("div");
  controls.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:#1a1a2e;border-bottom:1px solid #333;flex-wrap:wrap;">
      <span style="color:#ccc;font-size:13px;font-family:'EB Garamond',serif;font-weight:600;">
        ${uiText('sankey_title')}
      </span>
      <span style="color:#888;font-size:11px;font-family:'Source Sans 3',sans-serif;margin-left:auto;">
        ${uiText('sankey_hint')}
      </span>
      <button id="sankey-reset" style="background:#444;color:#eee;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;">${uiText('show_all')}</button>
    </div>
  `;
  el.appendChild(controls);

  // SVG container
  const svgContainer = document.createElement("div");
  svgContainer.style.cssText = "width:100%;height:calc(100% - 42px);position:relative;";
  el.appendChild(svgContainer);

  const width = el.clientWidth || 900;
  const height = (el.clientHeight || 600) - 42;
  const margin = { top: 30, right: 160, bottom: 30, left: 160 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3.select(svgContainer).append("svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr("viewBox", `0 0 ${width} ${height}`)
    .style("background", "#0d1117");

  const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // === Build Sankey layout manually (no d3-sankey dependency) ===
  // We'll implement a custom alluvial layout since d3-sankey isn't in the importmap

  // X scale: decades as columns
  const xScale = d3.scalePoint()
    .domain(decades.map(d => d.id))
    .range([0, innerWidth])
    .padding(0);

  // For each decade column, compute node positions (stacked by share)
  const columns = {};
  const nodeMap = {};

  for (const decade of decades) {
    const shares = nodeSizes[decade.id];
    if (!shares) continue;

    // Sort schools by share (descending) for this decade
    const sorted = schools
      .map(s => ({ school: s, share: shares[s] || 0 }))
      .filter(s => s.share > 0)
      .sort((a, b) => b.share - a.share);

    const totalShare = sorted.reduce((sum, s) => sum + s.share, 0);
    const nodeHeight = innerHeight * 0.85; // Leave gaps
    const gap = 3;
    const availableHeight = nodeHeight - (sorted.length - 1) * gap;

    let y = (innerHeight - nodeHeight) / 2;
    columns[decade.id] = [];

    for (const item of sorted) {
      const h = (item.share / totalShare) * availableHeight;
      const node = {
        id: `${decade.id}_${item.school}`,
        decade: decade.id,
        school: item.school,
        x: xScale(decade.id),
        y: y,
        height: h,
        share: item.share
      };
      columns[decade.id].push(node);
      nodeMap[node.id] = node;
      y += h + gap;
    }
  }

  // === Draw decade labels ===
  g.selectAll(".decade-label")
    .data(decades)
    .join("text")
    .attr("class", "decade-label")
    .attr("x", d => xScale(d.id))
    .attr("y", -12)
    .attr("text-anchor", "middle")
    .attr("fill", "#aaa")
    .attr("font-size", 13)
    .attr("font-family", "'EB Garamond', serif")
    .text(d => d.label);

  // === Draw nodes (school bars per decade) ===
  const nodeWidth = 18;

  const nodeGroups = g.selectAll(".sankey-node")
    .data(Object.values(nodeMap))
    .join("g")
    .attr("class", "sankey-node")
    .attr("cursor", "pointer");

  nodeGroups.append("rect")
    .attr("x", d => d.x - nodeWidth / 2)
    .attr("y", d => d.y)
    .attr("width", nodeWidth)
    .attr("height", d => Math.max(2, d.height))
    .attr("fill", d => schoolColors[d.school] || "#666")
    .attr("stroke", "#222")
    .attr("stroke-width", 0.5)
    .attr("opacity", 0.9)
    .attr("rx", 2);

  // Node labels (school names on left/right of first/last columns)
  const firstDecade = decades[0].id;
  const lastDecade = decades[decades.length - 1].id;

  // Left labels (first column)
  g.selectAll(".label-left")
    .data(columns[firstDecade] || [])
    .join("text")
    .attr("class", "label-left")
    .attr("x", d => d.x - nodeWidth / 2 - 6)
    .attr("y", d => d.y + d.height / 2)
    .attr("text-anchor", "end")
    .attr("dominant-baseline", "middle")
    .attr("fill", d => schoolColors[d.school] || "#888")
    .attr("font-size", d => d.height > 12 ? 10 : 8)
    .attr("font-family", "'Source Sans 3', sans-serif")
    .text(d => d.height > 6 ? schoolLabel(d.school) : "");

  // Right labels (last column)
  g.selectAll(".label-right")
    .data(columns[lastDecade] || [])
    .join("text")
    .attr("class", "label-right")
    .attr("x", d => d.x + nodeWidth / 2 + 6)
    .attr("y", d => d.y + d.height / 2)
    .attr("text-anchor", "start")
    .attr("dominant-baseline", "middle")
    .attr("fill", d => schoolColors[d.school] || "#888")
    .attr("font-size", d => d.height > 12 ? 10 : 8)
    .attr("font-family", "'Source Sans 3', sans-serif")
    .text(d => d.height > 6 ? schoolLabel(d.school) : "");

  // === Draw links (flows between decades) ===
  // For each link, compute source and target y positions within the node
  // Track accumulated offsets for stacking flows within each node
  const sourceOffsets = {};
  const targetOffsets = {};

  // Sort links by value (largest first) for better visual stacking
  const sortedLinks = [...links].sort((a, b) => b.value - a.value);

  // Compute link paths
  const linkData = [];
  for (const link of sortedLinks) {
    const sourceId = `${link.sourceDec}_${link.sourceSchool}`;
    const targetId = `${link.targetDec}_${link.targetSchool}`;
    const sourceNode = nodeMap[sourceId];
    const targetNode = nodeMap[targetId];
    if (!sourceNode || !targetNode) continue;

    // Compute flow thickness proportional to value relative to source node
    const maxLinkValue = Math.max(...links.filter(l => l.sourceDec === link.sourceDec).map(l => l.value));
    const thickness = Math.max(1, (link.value / maxLinkValue) * Math.min(sourceNode.height, targetNode.height) * 0.6);

    // Source y offset
    if (!sourceOffsets[sourceId]) sourceOffsets[sourceId] = 0;
    const sy = sourceNode.y + sourceOffsets[sourceId];
    sourceOffsets[sourceId] += thickness + 0.5;

    // Target y offset
    if (!targetOffsets[targetId]) targetOffsets[targetId] = 0;
    const ty = targetNode.y + targetOffsets[targetId];
    targetOffsets[targetId] += thickness + 0.5;

    // Skip if overflow
    if (sy + thickness > sourceNode.y + sourceNode.height + 2) continue;
    if (ty + thickness > targetNode.y + targetNode.height + 2) continue;

    linkData.push({
      ...link,
      sx: sourceNode.x + nodeWidth / 2,
      sy: sy + thickness / 2,
      tx: targetNode.x - nodeWidth / 2,
      ty: ty + thickness / 2,
      thickness: thickness,
      isSameSchool: link.sourceSchool === link.targetSchool
    });
  }

  // Draw links as curved paths
  const linkPaths = g.append("g").attr("class", "sankey-links")
    .selectAll("path")
    .data(linkData)
    .join("path")
    .attr("d", d => {
      const midX = (d.sx + d.tx) / 2;
      return `M${d.sx},${d.sy} C${midX},${d.sy} ${midX},${d.ty} ${d.tx},${d.ty}`;
    })
    .attr("fill", "none")
    .attr("stroke", d => {
      if (d.isSameSchool) return schoolColors[d.sourceSchool] || "#555";
      // Cross-school flows: blend colors or use gradient
      return d3.interpolateRgb(
        schoolColors[d.sourceSchool] || "#555",
        schoolColors[d.targetSchool] || "#555"
      )(0.5);
    })
    .attr("stroke-width", d => d.thickness)
    .attr("stroke-opacity", d => d.isSameSchool ? 0.35 : 0.5)
    .attr("stroke-linecap", "butt");

  // === Tooltip ===
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position:absolute;display:none;background:rgba(20,20,40,0.95);
    border:1px solid #555;border-radius:6px;padding:10px 14px;
    color:#eee;font-size:12px;font-family:'Source Sans 3',sans-serif;
    pointer-events:none;z-index:100;max-width:280px;line-height:1.4;
    box-shadow:0 4px 12px rgba(0,0,0,0.5);
  `;
  svgContainer.appendChild(tooltip);

  // === Interactions ===
  // Hover on links
  linkPaths
    .on("mouseenter", function(event, d) {
      d3.select(this).attr("stroke-opacity", 0.9).attr("stroke-width", d.thickness + 1);
      const direction = d.isSameSchool ? uiText('persistence') : uiText('flow_label');
      tooltip.innerHTML = `
        <strong>${direction}</strong><br>
        <span style="color:${schoolColors[d.sourceSchool] || '#888'};">● ${schoolLabel(d.sourceSchool)}</span>
        (${d.sourceDec})<br>
        → <span style="color:${schoolColors[d.targetSchool] || '#888'};">● ${schoolLabel(d.targetSchool)}</span>
        (${d.targetDec})<br>
        <span style="color:#aaa;">${uiText('strength')}: ${d.value.toFixed(1)}</span>
      `;
      tooltip.style.display = "block";
      tooltip.style.left = (event.offsetX + 15) + "px";
      tooltip.style.top = (event.offsetY - 30) + "px";
    })
    .on("mousemove", function(event) {
      tooltip.style.left = (event.offsetX + 15) + "px";
      tooltip.style.top = (event.offsetY - 30) + "px";
    })
    .on("mouseleave", function(event, d) {
      d3.select(this)
        .attr("stroke-opacity", d.isSameSchool ? 0.35 : 0.5)
        .attr("stroke-width", d.thickness);
      tooltip.style.display = "none";
    });

  // Click on nodes to highlight a school across all decades
  nodeGroups.on("click", function(event, d) {
    event.stopPropagation();
    highlightSchool = highlightSchool === d.school ? null : d.school;
    updateHighlight();
  });

  // Click on background to reset
  svg.on("click", () => {
    highlightSchool = null;
    updateHighlight();
  });

  // Reset button
  document.getElementById("sankey-reset").addEventListener("click", () => {
    highlightSchool = null;
    updateHighlight();
  });

  function updateHighlight() {
    if (!highlightSchool) {
      // Show all
      nodeGroups.select("rect")
        .transition().duration(300)
        .attr("opacity", 0.9);
      linkPaths
        .transition().duration(300)
        .attr("stroke-opacity", d => d.isSameSchool ? 0.35 : 0.5);
      g.selectAll(".label-left, .label-right")
        .transition().duration(300)
        .attr("opacity", 1);
    } else {
      // Highlight selected school
      nodeGroups.select("rect")
        .transition().duration(300)
        .attr("opacity", d => d.school === highlightSchool ? 1 : 0.15);
      linkPaths
        .transition().duration(300)
        .attr("stroke-opacity", d => {
          if (d.sourceSchool === highlightSchool || d.targetSchool === highlightSchool) {
            return 0.8;
          }
          return 0.03;
        });
      g.selectAll(".label-left, .label-right")
        .transition().duration(300)
        .attr("opacity", function() {
          const text = d3.select(this).text();
          return text === highlightSchool ? 1 : 0.2;
        });
    }
  }

  // === Legend (bottom) ===
  const legend = g.append("g")
    .attr("transform", `translate(0, ${innerHeight + 5})`);

  // Show interpretation note
  legend.append("text")
    .attr("x", innerWidth / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .attr("fill", "#666")
    .attr("font-size", 10)
    .attr("font-family", "'Source Sans 3', sans-serif")
    .text(uiText('legend_note'));
}
