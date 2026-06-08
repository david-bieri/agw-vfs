// agw_school_compare.js — Comparative School Profiles (Radar Chart)
// Compares 2–3 schools across multiple dimensions: prominence, figure count,
// temporal persistence, cross-school bridging, internal cohesion, growth trend.
import * as d3 from "d3";
import { schoolLabel, getLang, allSchoolLabels } from "./school_labels.js";

const NETWORK_URL = "./data/unified_network.json";
const SANKEY_URL = "./data/sankey_flows.json";

// ── UI Text ──────────────────────────────────────────────────────────────────
const SC_TEXT = {
  title:        { de: 'Schulvergleich', en: 'School Comparison' },
  subtitle:     { de: 'Vergleichen Sie das thematische Profil von 2\u20133 Denkschulen im AGW-Kanon.', 
                  en: 'Compare the thematic profile of 2\u20133 schools of thought in the AGW canon.' },
  select_label: { de: 'Schulen w\u00e4hlen:', en: 'Select schools:' },
  compare:      { de: 'Vergleichen', en: 'Compare' },
  add:          { de: '+ Schule hinzuf\u00fcgen', en: '+ Add school' },
  remove:       { de: 'Entfernen', en: 'Remove' },
  hint:         { de: 'W\u00e4hlen Sie 2\u20133 Schulen zum Vergleich.', en: 'Select 2\u20133 schools to compare.' },
  // Dimension labels
  dim_prominence:   { de: 'Prominenz', en: 'Prominence' },
  dim_figures:      { de: 'Figurenanzahl', en: 'Figure Count' },
  dim_persistence:  { de: 'Zeitliche Persistenz', en: 'Temporal Persistence' },
  dim_bridging:     { de: 'Schulbr\u00fccken', en: 'Cross-School Bridging' },
  dim_cohesion:     { de: 'Interne Koh\u00e4sion', en: 'Internal Cohesion' },
  dim_growth:       { de: 'Wachstumstrend', en: 'Growth Trend' },
  // Table headers
  tbl_dimension:    { de: 'Dimension', en: 'Dimension' },
  tbl_value:        { de: 'Wert', en: 'Value' },
  tbl_description:  { de: 'Beschreibung', en: 'Description' },
  // Descriptions
  desc_prominence:  { de: 'Gesamtanteil an allen Konferenzzitationen (%)', en: 'Total share of all conference citations (%)' },
  desc_figures:     { de: 'Anzahl der Figuren dieser Schule im Kanon', en: 'Number of figures from this school in the canon' },
  desc_persistence: { de: 'In wie vielen Dekaden die Schule aktiv war (0\u20135)', en: 'Number of decades the school was active (0\u20135)' },
  desc_bridging:    { de: 'Anteil der Kanten zu anderen Schulen (%)', en: 'Share of edges connecting to other schools (%)' },
  desc_cohesion:    { de: 'Dichte der Verbindungen innerhalb der Schule', en: 'Density of connections within the school' },
  desc_growth:      { de: 'Trend: positiv = wachsend, negativ = schrumpfend', en: 'Trend: positive = growing, negative = shrinking' },
};

function st(key) {
  const lang = getLang();
  const entry = SC_TEXT[key];
  return entry ? (entry[lang] || entry.de) : key;
}

export default async function AGWSchoolCompare(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("SchoolCompare: container not found"); return; }

  // Load both data sources
  const [networkData, sankeyData] = await Promise.all([
    fetch(NETWORK_URL).then(r => r.json()),
    fetch(SANKEY_URL).then(r => r.json())
  ]);

  const { nodes, edges, schoolColors } = networkData;
  const { nodeSizes, links, decades, schools } = sankeyData;

  // ── Compute school metrics ─────────────────────────────────────────────────
  const schoolMetrics = {};

  schools.forEach(school => {
    const metrics = {};

    // 1. Prominence: average share across all decades
    const shares = decades.map(d => nodeSizes[d.id][school] || 0);
    metrics.prominence = shares.reduce((a, b) => a + b, 0) / decades.length;

    // 2. Figure count: nodes belonging to this school
    metrics.figures = nodes.filter(n => n.school === school || n.hetSchool === school).length;

    // 3. Temporal persistence: number of decades with share > 0.5%
    metrics.persistence = shares.filter(s => s > 0.5).length;

    // 4. Cross-school bridging: % of edges connecting this school to others
    const schoolNodeIds = new Set(nodes.filter(n => n.school === school).map(n => n.id));
    let totalEdges = 0;
    let crossEdges = 0;
    edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      if (schoolNodeIds.has(src) || schoolNodeIds.has(tgt)) {
        totalEdges++;
        if (schoolNodeIds.has(src) !== schoolNodeIds.has(tgt)) {
          crossEdges++;
        }
      }
    });
    metrics.bridging = totalEdges > 0 ? (crossEdges / totalEdges) * 100 : 0;

    // 5. Internal cohesion: density of intra-school edges
    let intraEdges = 0;
    edges.forEach(e => {
      const src = typeof e.source === 'object' ? e.source.id : e.source;
      const tgt = typeof e.target === 'object' ? e.target.id : e.target;
      if (schoolNodeIds.has(src) && schoolNodeIds.has(tgt)) {
        intraEdges++;
      }
    });
    const maxPossible = (metrics.figures * (metrics.figures - 1)) / 2;
    metrics.cohesion = maxPossible > 0 ? (intraEdges / maxPossible) * 100 : 0;

    // 6. Growth trend: slope of share over decades (linear regression)
    if (shares.length >= 2) {
      const n = shares.length;
      const xMean = (n - 1) / 2;
      const yMean = shares.reduce((a, b) => a + b, 0) / n;
      let num = 0, den = 0;
      shares.forEach((y, i) => {
        num += (i - xMean) * (y - yMean);
        den += (i - xMean) * (i - xMean);
      });
      metrics.growth = den > 0 ? num / den : 0;
    } else {
      metrics.growth = 0;
    }

    schoolMetrics[school] = metrics;
  });

  // Normalize metrics to 0–1 scale for radar chart
  const dimensions = ['prominence', 'figures', 'persistence', 'bridging', 'cohesion', 'growth'];
  const dimLabels = ['dim_prominence', 'dim_figures', 'dim_persistence', 'dim_bridging', 'dim_cohesion', 'dim_growth'];
  const dimDescs = ['desc_prominence', 'desc_figures', 'desc_persistence', 'desc_bridging', 'desc_cohesion', 'desc_growth'];

  const maxVals = {};
  const minVals = {};
  dimensions.forEach(dim => {
    const vals = schools.map(s => schoolMetrics[s][dim]);
    maxVals[dim] = Math.max(...vals);
    minVals[dim] = Math.min(...vals);
  });

  function normalize(school, dim) {
    const val = schoolMetrics[school][dim];
    const range = maxVals[dim] - minVals[dim];
    if (range === 0) return 0.5;
    // For growth, center at 0.5 (negative growth maps below 0.5)
    if (dim === 'growth') {
      const absMax = Math.max(Math.abs(maxVals[dim]), Math.abs(minVals[dim]));
      return absMax > 0 ? 0.5 + (val / (2 * absMax)) : 0.5;
    }
    return (val - minVals[dim]) / range;
  }

  // ── Render UI ──────────────────────────────────────────────────────────────
  el.innerHTML = "";
  el.style.position = "relative";

  // Header
  const header = document.createElement("div");
  header.style.cssText = "padding:16px 20px;background:#1a1a2e;border-bottom:1px solid #333;";
  header.innerHTML = `
    <h3 style="margin:0 0 4px;font-family:'EB Garamond',serif;font-size:20px;color:#fff;font-weight:500;">${st('title')}</h3>
    <p style="margin:0 0 14px;font-size:12.5px;color:#888;font-family:'Source Sans 3',sans-serif;">${st('subtitle')}</p>
    <div id="school-selectors" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
    </div>
    <div style="margin-top:10px;">
      <button id="sc-add" style="background:transparent;color:#4a90e2;border:1px solid #4a90e2;border-radius:4px;padding:4px 12px;font-size:11px;cursor:pointer;font-family:'Source Sans 3',sans-serif;">${st('add')}</button>
      <button id="sc-compare" style="background:#2a4a7f;color:#fff;border:none;border-radius:4px;padding:6px 16px;font-size:12px;cursor:pointer;font-family:'Source Sans 3',sans-serif;margin-left:10px;">${st('compare')}</button>
    </div>
  `;
  el.appendChild(header);

  // Main content area (radar + table side by side)
  const content = document.createElement("div");
  content.style.cssText = "display:flex;gap:20px;padding:20px;flex-wrap:wrap;align-items:flex-start;";
  content.innerHTML = `
    <div id="sc-radar" style="flex:1;min-width:400px;min-height:420px;"></div>
    <div id="sc-table" style="flex:0 0 340px;min-width:300px;font-family:'Source Sans 3',sans-serif;font-size:12px;color:#ddd;"></div>
  `;
  el.appendChild(content);

  // School selector management
  const selectorsDiv = document.getElementById("school-selectors");
  let selectorCount = 0;

  function addSelector(preselected) {
    if (selectorCount >= 3) return;
    selectorCount++;
    const wrapper = document.createElement("div");
    wrapper.style.cssText = "display:flex;align-items:center;gap:6px;";
    wrapper.innerHTML = `
      <select class="sc-school-select" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:4px 8px;font-size:12px;width:180px;">
        <option value="">${st('hint')}</option>
        ${schools.map(s => `<option value="${s}" ${s === preselected ? 'selected' : ''}>${schoolLabel(s)}</option>`).join('')}
      </select>
      <button class="sc-remove" style="background:transparent;color:#ff6b6b;border:1px solid #ff6b6b;border-radius:3px;padding:2px 6px;font-size:10px;cursor:pointer;">\u00d7</button>
    `;
    selectorsDiv.appendChild(wrapper);

    wrapper.querySelector('.sc-remove').addEventListener('click', () => {
      wrapper.remove();
      selectorCount--;
    });
  }

  // Start with 2 selectors, pre-select interesting schools
  addSelector('Austrian School');
  addSelector('Historical School');

  document.getElementById("sc-add").addEventListener("click", () => addSelector(''));

  // ── Radar Chart Drawing ────────────────────────────────────────────────────
  function drawRadar(selectedSchools) {
    const radarEl = document.getElementById("sc-radar");
    radarEl.innerHTML = "";

    const size = Math.min(radarEl.clientWidth || 420, 420);
    const margin = 60;
    const r = (size - 2 * margin) / 2;
    const cx = size / 2;
    const cy = size / 2;

    const svg = d3.select(radarEl).append("svg")
      .attr("width", size)
      .attr("height", size)
      .style("display", "block")
      .style("margin", "0 auto");

    const numDims = dimensions.length;
    const angleSlice = (2 * Math.PI) / numDims;

    // Draw concentric circles
    const levels = 5;
    for (let i = 1; i <= levels; i++) {
      svg.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r * (i / levels))
        .attr("fill", "none")
        .attr("stroke", "rgba(255,255,255,0.08)")
        .attr("stroke-width", 0.5);
    }

    // Draw axis lines and labels
    dimensions.forEach((dim, i) => {
      const angle = angleSlice * i - Math.PI / 2;
      const x2 = cx + Math.cos(angle) * r;
      const y2 = cy + Math.sin(angle) * r;

      svg.append("line")
        .attr("x1", cx)
        .attr("y1", cy)
        .attr("x2", x2)
        .attr("y2", y2)
        .attr("stroke", "rgba(255,255,255,0.12)")
        .attr("stroke-width", 0.5);

      // Label
      const labelR = r + 20;
      const lx = cx + Math.cos(angle) * labelR;
      const ly = cy + Math.sin(angle) * labelR;

      svg.append("text")
        .attr("x", lx)
        .attr("y", ly)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "middle")
        .attr("font-size", 10)
        .attr("fill", "#aaa")
        .attr("font-family", "'Source Sans 3', sans-serif")
        .text(st(dimLabels[i]));
    });

    // Draw school polygons
    selectedSchools.forEach((school, schoolIdx) => {
      const points = dimensions.map((dim, i) => {
        const val = normalize(school, dim);
        const angle = angleSlice * i - Math.PI / 2;
        return {
          x: cx + Math.cos(angle) * r * val,
          y: cy + Math.sin(angle) * r * val
        };
      });

      const lineGen = d3.lineRadial()
        .angle((d, i) => angleSlice * i)
        .radius((d, i) => normalize(school, dimensions[i]) * r)
        .curve(d3.curveLinearClosed);

      // Filled polygon
      const color = schoolColors[school] || '#757575';
      const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + ' Z';

      svg.append("path")
        .attr("d", pathData)
        .attr("fill", color)
        .attr("fill-opacity", 0.15)
        .attr("stroke", color)
        .attr("stroke-width", 2)
        .attr("stroke-opacity", 0.8);

      // Data points
      points.forEach((p, i) => {
        svg.append("circle")
          .attr("cx", p.x)
          .attr("cy", p.y)
          .attr("r", 4)
          .attr("fill", color)
          .attr("stroke", "#fff")
          .attr("stroke-width", 1);
      });
    });

    // Legend
    const legend = svg.append("g")
      .attr("transform", `translate(10, ${size - 20 - selectedSchools.length * 18})`);

    selectedSchools.forEach((school, i) => {
      const color = schoolColors[school] || '#757575';
      legend.append("rect")
        .attr("x", 0)
        .attr("y", i * 18)
        .attr("width", 12)
        .attr("height", 12)
        .attr("fill", color)
        .attr("rx", 2);

      legend.append("text")
        .attr("x", 18)
        .attr("y", i * 18 + 10)
        .attr("font-size", 11)
        .attr("fill", "#ddd")
        .attr("font-family", "'Source Sans 3', sans-serif")
        .text(schoolLabel(school));
    });
  }

  // ── Comparison Table ───────────────────────────────────────────────────────
  function drawTable(selectedSchools) {
    const tableEl = document.getElementById("sc-table");
    tableEl.innerHTML = "";

    let html = `<table style="width:100%;border-collapse:collapse;font-size:11.5px;">
      <thead>
        <tr style="border-bottom:1px solid #444;">
          <th style="text-align:left;padding:6px 8px;color:#aaa;">${st('tbl_dimension')}</th>`;
    
    selectedSchools.forEach(school => {
      const color = schoolColors[school] || '#757575';
      html += `<th style="text-align:right;padding:6px 8px;color:${color};">${schoolLabel(school)}</th>`;
    });
    html += `</tr></thead><tbody>`;

    dimensions.forEach((dim, i) => {
      html += `<tr style="border-bottom:1px solid rgba(255,255,255,0.05);">
        <td style="padding:6px 8px;color:#ccc;" title="${st(dimDescs[i])}">${st(dimLabels[i])}</td>`;
      
      selectedSchools.forEach(school => {
        const val = schoolMetrics[school][dim];
        let display;
        if (dim === 'prominence') display = val.toFixed(1) + '%';
        else if (dim === 'figures') display = Math.round(val).toString();
        else if (dim === 'persistence') display = val + '/5';
        else if (dim === 'bridging') display = val.toFixed(0) + '%';
        else if (dim === 'cohesion') display = val.toFixed(1) + '%';
        else if (dim === 'growth') display = (val > 0 ? '+' : '') + val.toFixed(2);

        const color = schoolColors[school] || '#757575';
        html += `<td style="text-align:right;padding:6px 8px;color:${color};font-weight:500;">${display}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table>`;

    // Add description footnotes
    html += `<div style="margin-top:14px;padding-top:10px;border-top:1px solid #333;font-size:10.5px;color:#666;line-height:1.5;">`;
    dimensions.forEach((dim, i) => {
      html += `<strong style="color:#888;">${st(dimLabels[i])}:</strong> ${st(dimDescs[i])}<br>`;
    });
    html += `</div>`;

    tableEl.innerHTML = html;
  }

  // ── Compare button handler ─────────────────────────────────────────────────
  document.getElementById("sc-compare").addEventListener("click", () => {
    const selects = document.querySelectorAll('.sc-school-select');
    const selectedSchools = [];
    selects.forEach(sel => {
      if (sel.value && !selectedSchools.includes(sel.value)) {
        selectedSchools.push(sel.value);
      }
    });

    if (selectedSchools.length < 2) {
      document.getElementById("sc-radar").innerHTML = `<p style="color:#ff6b6b;text-align:center;padding:40px;font-size:13px;">${st('hint')}</p>`;
      return;
    }

    drawRadar(selectedSchools);
    drawTable(selectedSchools);
  });

  // Auto-compare on load with defaults
  setTimeout(() => {
    document.getElementById("sc-compare").click();
  }, 100);
}
