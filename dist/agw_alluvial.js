// agw_alluvial.js — Dynamic Alluvial / Sankey Topic Evolution (Feature B)
// Visualizes how intellectual school shares flow and shift across 43 conferences (1980–2023)
// Uses D3 for rendering. No React dependency.
import * as d3 from "d3";

const DATA_URL = "./data/unified_network.json";

export default async function AGWAlluvial(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("Alluvial: container not found"); return; }

  // --- Load data ---
  const data = await fetch(DATA_URL).then(r => r.json());
  const { flow, schoolColors, schools } = data;

  // --- State ---
  let highlightedSchool = null;
  let windowSize = 5; // rolling window for smoothing
  let showLabels = true;

  // --- Layout ---
  el.innerHTML = "";
  el.style.position = "relative";

  // Controls bar
  const controls = document.createElement("div");
  controls.innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;padding:8px 12px;background:#1a1a2e;border-bottom:1px solid #333;flex-wrap:wrap;">
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">Glättung:</label>
      <select id="alluv-window" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:2px 8px;font-size:12px;">
        <option value="1">Keine (Einzeljahr)</option>
        <option value="3">3-Jahres-Fenster</option>
        <option value="5" selected>5-Jahres-Fenster</option>
        <option value="10">Dekade</option>
      </select>
      <label style="color:#aaa;font-size:12px;font-family:'Source Sans 3',sans-serif;">Modus:</label>
      <select id="alluv-mode" style="background:#2a2a3e;color:#eee;border:1px solid #555;border-radius:4px;padding:2px 8px;font-size:12px;">
        <option value="stream">Streamgraph</option>
        <option value="stacked">Gestapelt (100%)</option>
        <option value="alluvial">Alluvial-Fluss</option>
      </select>
      <button id="alluv-reset" style="background:#444;color:#eee;border:none;border-radius:4px;padding:4px 10px;font-size:11px;cursor:pointer;">Alle Schulen</button>
      <span id="alluv-info" style="color:#888;font-size:11px;margin-left:auto;font-family:'Source Sans 3',sans-serif;">Klicken Sie auf eine Schule, um sie hervorzuheben.</span>
    </div>
  `;
  el.appendChild(controls);

  // SVG container
  const svgContainer = document.createElement("div");
  svgContainer.style.cssText = "width:100%;height:calc(100% - 42px);position:relative;";
  el.appendChild(svgContainer);

  const margin = { top: 30, right: 180, bottom: 50, left: 50 };
  const width = (el.clientWidth || 900) - margin.left - margin.right;
  const height = Math.max(400, (el.clientHeight || 550) - 42 - margin.top - margin.bottom);

  const svg = d3.select(svgContainer).append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .style("background", "#0d1117")
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Tooltip
  const tooltip = document.createElement("div");
  tooltip.style.cssText = `
    position:absolute;pointer-events:none;background:rgba(20,20,40,0.95);
    border:1px solid #555;border-radius:6px;padding:8px 12px;color:#eee;
    font-family:'Source Sans 3',sans-serif;font-size:12px;display:none;z-index:20;
    max-width:250px;
  `;
  svgContainer.appendChild(tooltip);

  // --- Data processing ---
  function smoothData(windowSz) {
    if (windowSz <= 1) return flow.map(d => ({ ...d }));
    const result = [];
    for (let i = 0; i < flow.length; i++) {
      const start = Math.max(0, i - Math.floor(windowSz / 2));
      const end = Math.min(flow.length, i + Math.ceil(windowSz / 2));
      const window = flow.slice(start, end);
      const entry = { year: flow[i].year, theme: flow[i].theme };
      for (const s of schools) {
        entry[s] = d3.mean(window, d => d[s]) || 0;
      }
      result.push(entry);
    }
    return result;
  }

  // --- Render ---
  function render(mode) {
    svg.selectAll("*").remove();
    const smoothed = smoothData(windowSize);

    // Filter out schools with negligible presence
    const activeSchools = schools.filter(s =>
      d3.max(smoothed, d => d[s]) > 2
    );

    // Scales
    const x = d3.scaleLinear()
      .domain(d3.extent(smoothed, d => d.year))
      .range([0, width]);

    // Stack
    let stack;
    if (mode === "stacked") {
      stack = d3.stack()
        .keys(activeSchools)
        .offset(d3.stackOffsetExpand)
        .order(d3.stackOrderInsideOut);
    } else if (mode === "stream") {
      stack = d3.stack()
        .keys(activeSchools)
        .offset(d3.stackOffsetWiggle)
        .order(d3.stackOrderInsideOut);
    } else {
      // Alluvial: use stackOffsetSilhouette for centered flow
      stack = d3.stack()
        .keys(activeSchools)
        .offset(d3.stackOffsetSilhouette)
        .order(d3.stackOrderInsideOut);
    }

    const series = stack(smoothed);

    const y = d3.scaleLinear()
      .domain([
        d3.min(series, s => d3.min(s, d => d[0])),
        d3.max(series, s => d3.max(s, d => d[1]))
      ])
      .range([height, 0]);

    // Area generator
    const area = d3.area()
      .x((d, i) => x(smoothed[i].year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveBasis);

    // Draw areas
    const paths = svg.append("g")
      .selectAll("path")
      .data(series)
      .join("path")
      .attr("d", area)
      .attr("fill", d => schoolColors[d.key] || "#757575")
      .attr("stroke", "rgba(0,0,0,0.3)")
      .attr("stroke-width", 0.5)
      .attr("opacity", d => highlightedSchool ? (d.key === highlightedSchool ? 1 : 0.1) : 0.8)
      .style("cursor", "pointer")
      .on("mouseenter", function(event, d) {
        if (!highlightedSchool) {
          d3.select(this).attr("opacity", 1);
          paths.filter(p => p.key !== d.key).attr("opacity", 0.2);
        }
        showTooltip(event, d.key);
      })
      .on("mousemove", (event) => {
        tooltip.style.left = (event.offsetX + 15) + "px";
        tooltip.style.top = (event.offsetY - 10) + "px";
      })
      .on("mouseleave", function() {
        if (!highlightedSchool) {
          paths.attr("opacity", 0.8);
        }
        tooltip.style.display = "none";
      })
      .on("click", (event, d) => {
        event.stopPropagation();
        toggleSchool(d.key, paths);
      });

    // X-axis
    svg.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(10))
      .selectAll("text")
      .attr("fill", "#aaa")
      .attr("font-size", 10);
    svg.selectAll(".domain, .tick line").attr("stroke", "#444");

    // Y-axis label
    if (mode === "stacked") {
      svg.append("g")
        .call(d3.axisLeft(y).tickFormat(d3.format(".0%")).ticks(5))
        .selectAll("text")
        .attr("fill", "#aaa")
        .attr("font-size", 10);
    }

    // Legend (right side)
    if (showLabels) {
      const legend = svg.append("g")
        .attr("transform", `translate(${width + 15}, 0)`);

      activeSchools.forEach((s, i) => {
        const g = legend.append("g")
          .attr("transform", `translate(0, ${i * 18})`)
          .style("cursor", "pointer")
          .on("click", () => toggleSchool(s, paths));

        g.append("rect")
          .attr("width", 12)
          .attr("height", 12)
          .attr("fill", schoolColors[s] || "#757575")
          .attr("rx", 2)
          .attr("opacity", highlightedSchool ? (s === highlightedSchool ? 1 : 0.3) : 0.8);

        g.append("text")
          .attr("x", 16)
          .attr("y", 10)
          .text(s)
          .attr("fill", highlightedSchool ? (s === highlightedSchool ? "#fff" : "#555") : "#aaa")
          .attr("font-size", 10)
          .attr("font-family", "'Source Sans 3', sans-serif");
      });
    }

    // Conference theme annotations (vertical markers)
    const themeMarkers = svg.append("g").attr("class", "theme-markers");
    smoothed.forEach((d, i) => {
      if (i % 5 === 0 || i === smoothed.length - 1) {
        themeMarkers.append("line")
          .attr("x1", x(d.year))
          .attr("x2", x(d.year))
          .attr("y1", 0)
          .attr("y2", height)
          .attr("stroke", "#333")
          .attr("stroke-width", 0.5)
          .attr("stroke-dasharray", "2,3");

        // Rotated theme label at top
        themeMarkers.append("text")
          .attr("x", x(d.year))
          .attr("y", -5)
          .attr("text-anchor", "start")
          .attr("transform", `rotate(-35, ${x(d.year)}, -5)`)
          .text(d.theme ? d.theme.substring(0, 25) : "")
          .attr("fill", "#555")
          .attr("font-size", 8)
          .attr("font-family", "'Source Sans 3', sans-serif");
      }
    });

    return paths;
  }

  function showTooltip(event, schoolKey) {
    const smoothed = smoothData(windowSize);
    // Find the year closest to mouse position
    const xPos = event.offsetX - margin.left;
    const xScale = d3.scaleLinear()
      .domain([0, width])
      .range(d3.extent(smoothed, d => d.year));
    const year = Math.round(xScale(xPos));
    const entry = smoothed.find(d => d.year === year) || smoothed[0];

    tooltip.innerHTML = `
      <strong style="color:${schoolColors[schoolKey]}">${schoolKey}</strong><br>
      <span style="color:#888;">${entry.year}: ${entry.theme || ""}</span><br>
      <span>Anteil: ${entry[schoolKey]?.toFixed(1) || 0}%</span>
    `;
    tooltip.style.display = "block";
    tooltip.style.left = (event.offsetX + 15) + "px";
    tooltip.style.top = (event.offsetY - 10) + "px";
  }

  function toggleSchool(schoolKey, paths) {
    if (highlightedSchool === schoolKey) {
      highlightedSchool = null;
      document.getElementById("alluv-info").textContent = "Klicken Sie auf eine Schule, um sie hervorzuheben.";
    } else {
      highlightedSchool = schoolKey;
      document.getElementById("alluv-info").textContent = `Hervorgehoben: ${schoolKey}`;
    }
    // Re-render to update highlighting
    render(document.getElementById("alluv-mode").value);
  }

  // --- Event listeners ---
  document.getElementById("alluv-window").addEventListener("change", (e) => {
    windowSize = parseInt(e.target.value);
    render(document.getElementById("alluv-mode").value);
  });

  document.getElementById("alluv-mode").addEventListener("change", (e) => {
    render(e.target.value);
  });

  document.getElementById("alluv-reset").addEventListener("click", () => {
    highlightedSchool = null;
    document.getElementById("alluv-info").textContent = "Klicken Sie auf eine Schule, um sie hervorzuheben.";
    render(document.getElementById("alluv-mode").value);
  });

  // --- Initial render ---
  render("stream");
}
