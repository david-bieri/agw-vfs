// agw_scrollytelling.js — Guided Narrative Mode (Feature A)
// A scrollytelling experience that walks the reader through key findings
// from the AGW conference data with animated transitions between story "scenes."
// Uses D3 for visualization and IntersectionObserver for scroll-triggered transitions.
import * as d3 from "d3";

const DATA_URL = "./data/unified_network.json";

// --- Narrative scenes ---
// Each scene has: title, body text, a visualization function, and optional highlight state
const SCENES_DE = [
  {
    id: "intro",
    title: "43 Konferenzen, eine Geschichte",
    body: "Seit 1980 hat der Ausschuss für die Geschichte der Wirtschaftswissenschaften (AGW) im Verein für Socialpolitik jährlich Konferenzen veranstaltet. Über vier Jahrzehnte entstand ein einzigartiges Archiv intellektueller Rezeption — wer wurde studiert, wer vergessen, welche Denkschulen dominierten?",
    viz: "overview",
    highlight: null
  },
  {
    id: "classical-dominance",
    title: "Die Klassiker dominieren die Anfangsjahre",
    body: "In den 1980er Jahren standen die Klassiker im Mittelpunkt: Adam Smith, David Ricardo, Karl Marx. Die ersten Konferenzen widmeten sich der Nationalökonomie und ihren Wurzeln. Über 40% der Aufmerksamkeit galt der klassischen und neoklassischen Schule.",
    viz: "flow",
    highlight: { schools: ["Classical", "Neoclassical"], yearRange: [1980, 1990] }
  },
  {
    id: "austrian-rise",
    title: "Der Aufstieg der Österreichischen Schule",
    body: "Ab 1985 rückte die Österreichische Schule ins Zentrum: Menger, Böhm-Bawerk, Mises, Hayek und vor allem Schumpeter. Die Wiederentdeckung der österreichischen Tradition spiegelt den breiteren 'Austrian Revival' der 1980er Jahre wider.",
    viz: "flow",
    highlight: { schools: ["Austrian School"], yearRange: [1985, 2000] }
  },
  {
    id: "schumpeter-hub",
    title: "Schumpeter — der vernetzteste Denker",
    body: "Joseph Alois Schumpeter erscheint in 28 von 43 Konferenzbänden — ein Rekord. Sein Ego-Netzwerk verbindet 38 andere Figuren über Co-Zitation und Lehrer-Schüler-Beziehungen. Er ist die zentrale Brückenfigur zwischen österreichischer, evolutionärer und neoklassischer Tradition.",
    viz: "ego",
    highlight: { ego: "Joseph Alois Schumpeter" }
  },
  {
    id: "diversification",
    title: "Pluralisierung nach 2000",
    body: "Nach der Jahrtausendwende diversifiziert sich das Feld dramatisch. Institutionalismus, Evolutionsökonomik, Philosophie und Raumwirtschaftslehre gewinnen an Bedeutung. Die Konferenzen werden thematisch breiter — von der reinen Dogmengeschichte zur interdisziplinären Ideengeschichte.",
    viz: "flow",
    highlight: { schools: ["Institutional", "Evolutionary", "Philosophy", "Raumwirtschaftslehre"], yearRange: [2000, 2023] }
  },
  {
    id: "forgotten-figures",
    title: "Aufsteiger und Vergessene",
    body: "Manche Figuren erleben eine Renaissance: Walter Eucken, einst vergessen, wird ab 2000 zum meistzitierten Ordoliberalen. Andere verschwinden: Werner Sombart, in den 1980ern noch präsent, findet nach 2005 kaum Erwähnung. Die Daten offenbaren die Konjunkturen intellektueller Reputation.",
    viz: "slope",
    highlight: { risers: ["Walter Eucken"], fallers: ["Werner Sombart"] }
  },
  {
    id: "lineage-networks",
    title: "Lehrer und Schüler — intellektuelle Stammbäume",
    body: "Die Stammbaum-Daten zeigen, wie Wissen über Generationen weitergegeben wurde. Von Böhm-Bawerk zu Schumpeter, von Schumpeter zu Samuelson — die Lehrer-Schüler-Ketten verbinden Wien, Harvard und Cambridge über ein Jahrhundert.",
    viz: "ego",
    highlight: { ego: "Eugen von Böhm-Bawerk" }
  },
  {
    id: "conclusion",
    title: "Ein lebendiges Archiv",
    body: "Die AGW-Konferenzen sind mehr als eine Tagungsreihe — sie sind ein Spiegel der sich wandelnden Selbstwahrnehmung der Ökonomik. Die Daten zeigen: Welche Denker wir studieren, sagt ebenso viel über uns wie über sie.",
    viz: "overview",
    highlight: null
  }
];

const SCENES_EN = [
  {
    id: "intro",
    title: "43 Conferences, One Story",
    body: "Since 1980, the Committee for the History of Economics (AGW) within the Verein für Socialpolitik has held annual conferences. Over four decades, a unique archive of intellectual reception emerged — who was studied, who forgotten, which schools of thought dominated?",
    viz: "overview",
    highlight: null
  },
  {
    id: "classical-dominance",
    title: "The Classics Dominate the Early Years",
    body: "In the 1980s, the classics took center stage: Adam Smith, David Ricardo, Karl Marx. The first conferences focused on political economy and its roots. Over 40% of attention went to the classical and neoclassical schools.",
    viz: "flow",
    highlight: { schools: ["Classical", "Neoclassical"], yearRange: [1980, 1990] }
  },
  {
    id: "austrian-rise",
    title: "The Rise of the Austrian School",
    body: "From 1985 onward, the Austrian School moved to center stage: Menger, Böhm-Bawerk, Mises, Hayek, and above all Schumpeter. The rediscovery of the Austrian tradition mirrors the broader 'Austrian Revival' of the 1980s.",
    viz: "flow",
    highlight: { schools: ["Austrian School"], yearRange: [1985, 2000] }
  },
  {
    id: "schumpeter-hub",
    title: "Schumpeter — The Most Connected Thinker",
    body: "Joseph Alois Schumpeter appears in 28 of 43 conference volumes — a record. His ego network connects 38 other figures through co-citation and teacher-student relationships. He is the central bridge figure between Austrian, evolutionary, and neoclassical traditions.",
    viz: "ego",
    highlight: { ego: "Joseph Alois Schumpeter" }
  },
  {
    id: "diversification",
    title: "Pluralization After 2000",
    body: "After the millennium, the field diversifies dramatically. Institutionalism, evolutionary economics, philosophy, and spatial economics gain prominence. Conferences become thematically broader — from pure doctrinal history to interdisciplinary history of ideas.",
    viz: "flow",
    highlight: { schools: ["Institutional", "Evolutionary", "Philosophy", "Raumwirtschaftslehre"], yearRange: [2000, 2023] }
  },
  {
    id: "forgotten-figures",
    title: "Risers and the Forgotten",
    body: "Some figures experience a renaissance: Walter Eucken, once forgotten, becomes the most cited ordoliberal after 2000. Others disappear: Werner Sombart, still present in the 1980s, barely appears after 2005. The data reveals the business cycles of intellectual reputation.",
    viz: "slope",
    highlight: { risers: ["Walter Eucken"], fallers: ["Werner Sombart"] }
  },
  {
    id: "lineage-networks",
    title: "Teachers and Students — Intellectual Family Trees",
    body: "The lineage data shows how knowledge was transmitted across generations. From Böhm-Bawerk to Schumpeter, from Schumpeter to Samuelson — the teacher-student chains connect Vienna, Harvard, and Cambridge across a century.",
    viz: "ego",
    highlight: { ego: "Eugen von Böhm-Bawerk" }
  },
  {
    id: "conclusion",
    title: "A Living Archive",
    body: "The AGW conferences are more than a series of meetings — they are a mirror of economics' changing self-perception. The data shows: which thinkers we study says as much about us as about them.",
    viz: "overview",
    highlight: null
  }
];

export default async function AGWScrollytelling(container) {
  const el = typeof container === "string" ? document.querySelector(container) : container;
  if (!el) { console.error("Scrollytelling: container not found"); return; }

  // --- Load data ---
  const data = await fetch(DATA_URL).then(r => r.json());
  const { flow, schoolColors, schools, nodes, edges } = data;

  // Detect language
  const lang = document.documentElement.lang || "de";
  const scenes = lang === "en" ? SCENES_EN : SCENES_DE;

  // --- Layout ---
  el.innerHTML = "";
  el.style.cssText = "position:relative;width:100%;height:600px;overflow:hidden;";

  // Split layout: left = narrative text, right = visualization
  const wrapper = document.createElement("div");
  wrapper.style.cssText = "display:flex;width:100%;height:100%;";
  el.appendChild(wrapper);

  // Left panel: scrollable narrative
  const narrative = document.createElement("div");
  narrative.id = "scroll-narrative";
  narrative.style.cssText = `
    width:35%;min-width:280px;height:100%;overflow-y:auto;
    padding:32px 24px;background:#0d1117;
    font-family:'Source Sans 3',sans-serif;color:#ddd;
    scroll-behavior:smooth;
  `;
  wrapper.appendChild(narrative);

  // Right panel: sticky visualization
  const vizPanel = document.createElement("div");
  vizPanel.id = "scroll-viz";
  vizPanel.style.cssText = `
    flex:1;height:100%;position:relative;background:#0d1117;
    border-left:1px solid #222;
  `;
  wrapper.appendChild(vizPanel);

  // --- Build narrative sections ---
  scenes.forEach((scene, i) => {
    const section = document.createElement("div");
    section.className = "scroll-scene";
    section.dataset.sceneIdx = i;
    section.style.cssText = `
      min-height:${i === 0 ? '60%' : '80%'};
      padding:40px 0;display:flex;flex-direction:column;justify-content:center;
      opacity:0.4;transition:opacity 0.5s ease;
    `;
    section.innerHTML = `
      <h3 style="font-family:'EB Garamond',serif;font-size:1.5rem;color:#fff;margin-bottom:12px;
        border-left:3px solid ${getSceneColor(scene)};padding-left:12px;">${scene.title}</h3>
      <p style="font-size:0.95rem;line-height:1.7;color:#bbb;">${scene.body}</p>
      ${i === 0 ? '<p style="margin-top:16px;color:#666;font-size:0.8rem;">↓ Scrollen Sie, um die Geschichte zu erkunden</p>' : ''}
    `;
    narrative.appendChild(section);
  });

  // --- Scene color helper ---
  function getSceneColor(scene) {
    if (scene.highlight && scene.highlight.schools) {
      return schoolColors[scene.highlight.schools[0]] || "#3A6BAF";
    }
    if (scene.highlight && scene.highlight.ego) return "#CE93D8";
    return "#3A6BAF";
  }

  // --- Visualization renderers ---
  const vizWidth = vizPanel.clientWidth || 500;
  const vizHeight = vizPanel.clientHeight || 560;

  function renderOverview() {
    vizPanel.innerHTML = "";
    const svg = d3.select(vizPanel).append("svg")
      .attr("width", vizWidth).attr("height", vizHeight)
      .style("background", "#0d1117");

    // Draw a summary: large centered text with key stats
    const g = svg.append("g").attr("transform", `translate(${vizWidth/2}, ${vizHeight/2})`);

    g.append("text").attr("text-anchor", "middle").attr("y", -80)
      .attr("fill", "#fff").attr("font-size", 48).attr("font-family", "'EB Garamond', serif")
      .text("43");
    g.append("text").attr("text-anchor", "middle").attr("y", -50)
      .attr("fill", "#888").attr("font-size", 14).attr("font-family", "'Source Sans 3', sans-serif")
      .text(lang === "en" ? "Conferences" : "Konferenzen");

    g.append("text").attr("text-anchor", "middle").attr("y", 0)
      .attr("fill", "#fff").attr("font-size", 48).attr("font-family", "'EB Garamond', serif")
      .text(nodes.length);
    g.append("text").attr("text-anchor", "middle").attr("y", 30)
      .attr("fill", "#888").attr("font-size", 14).attr("font-family", "'Source Sans 3', sans-serif")
      .text(lang === "en" ? "Intellectual Figures" : "Intellektuelle Figuren");

    g.append("text").attr("text-anchor", "middle").attr("y", 80)
      .attr("fill", "#fff").attr("font-size", 48).attr("font-family", "'EB Garamond', serif")
      .text("1980–2023");
    g.append("text").attr("text-anchor", "middle").attr("y", 110)
      .attr("fill", "#888").attr("font-size", 14).attr("font-family", "'Source Sans 3', sans-serif")
      .text(lang === "en" ? "Four Decades of Intellectual History" : "Vier Jahrzehnte Ideengeschichte");

    // Animated dots background
    const dotData = nodes.slice(0, 40).map((n, i) => ({
      x: Math.random() * vizWidth,
      y: Math.random() * vizHeight,
      r: Math.random() * 3 + 1,
      color: schoolColors[n.school] || "#555"
    }));
    svg.append("g").selectAll("circle").data(dotData).join("circle")
      .attr("cx", d => d.x).attr("cy", d => d.y).attr("r", d => d.r)
      .attr("fill", d => d.color).attr("opacity", 0.3);
  }

  function renderFlow(highlight) {
    vizPanel.innerHTML = "";
    const margin = { top: 20, right: 120, bottom: 40, left: 40 };
    const w = vizWidth - margin.left - margin.right;
    const h = vizHeight - margin.top - margin.bottom;

    const svg = d3.select(vizPanel).append("svg")
      .attr("width", vizWidth).attr("height", vizHeight)
      .style("background", "#0d1117")
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain(d3.extent(flow, d => d.year)).range([0, w]);

    // Smooth data
    const smoothed = flow.map((d, i) => {
      const start = Math.max(0, i - 2);
      const end = Math.min(flow.length, i + 3);
      const win = flow.slice(start, end);
      const entry = { year: d.year };
      for (const s of schools) entry[s] = d3.mean(win, dd => dd[s]) || 0;
      return entry;
    });

    const stack = d3.stack()
      .keys(schools)
      .offset(d3.stackOffsetWiggle)
      .order(d3.stackOrderInsideOut);
    const series = stack(smoothed);

    const y = d3.scaleLinear()
      .domain([d3.min(series, s => d3.min(s, d => d[0])), d3.max(series, s => d3.max(s, d => d[1]))])
      .range([h, 0]);

    const area = d3.area()
      .x((d, i) => x(smoothed[i].year))
      .y0(d => y(d[0]))
      .y1(d => y(d[1]))
      .curve(d3.curveBasis);

    const highlightedSchools = highlight ? highlight.schools : [];
    const yearRange = highlight ? highlight.yearRange : null;

    svg.selectAll("path").data(series).join("path")
      .attr("d", area)
      .attr("fill", d => schoolColors[d.key] || "#555")
      .attr("opacity", d => highlightedSchools.length === 0 ? 0.7 :
        highlightedSchools.includes(d.key) ? 1 : 0.08)
      .attr("stroke", d => highlightedSchools.includes(d.key) ? "#fff" : "none")
      .attr("stroke-width", 0.5);

    // Year range highlight
    if (yearRange) {
      svg.append("rect")
        .attr("x", x(yearRange[0]))
        .attr("width", x(yearRange[1]) - x(yearRange[0]))
        .attr("y", 0).attr("height", h)
        .attr("fill", "none")
        .attr("stroke", "#fff")
        .attr("stroke-width", 1.5)
        .attr("stroke-dasharray", "4,3")
        .attr("opacity", 0.5);
    }

    // X-axis
    svg.append("g").attr("transform", `translate(0,${h})`)
      .call(d3.axisBottom(x).tickFormat(d3.format("d")).ticks(8))
      .selectAll("text").attr("fill", "#888").attr("font-size", 10);
    svg.selectAll(".domain, .tick line").attr("stroke", "#333");

    // Legend for highlighted schools
    if (highlightedSchools.length > 0) {
      const legend = svg.append("g").attr("transform", `translate(${w + 10}, 20)`);
      highlightedSchools.forEach((s, i) => {
        legend.append("rect").attr("y", i * 20).attr("width", 12).attr("height", 12)
          .attr("fill", schoolColors[s]).attr("rx", 2);
        legend.append("text").attr("x", 16).attr("y", i * 20 + 10)
          .text(s).attr("fill", "#ccc").attr("font-size", 11)
          .attr("font-family", "'Source Sans 3', sans-serif");
      });
    }
  }

  function renderEgo(highlight) {
    vizPanel.innerHTML = "";
    const egoName = highlight ? highlight.ego : nodes[0].id;
    const egoNode = nodes.find(n => n.id === egoName);
    if (!egoNode) { vizPanel.innerHTML = `<p style="color:#888;padding:20px;">Figur nicht gefunden.</p>`; return; }

    // Get neighbors
    const neighbors = new Set();
    const egoEdges = [];
    edges.forEach(e => {
      if (e.source === egoName) { neighbors.add(e.target); egoEdges.push(e); }
      if (e.target === egoName) { neighbors.add(e.source); egoEdges.push(e); }
    });

    // Build mini-network: ego + neighbors
    const miniNodes = [egoNode, ...Array.from(neighbors).map(id => nodes.find(n => n.id === id)).filter(Boolean)];

    const svg = d3.select(vizPanel).append("svg")
      .attr("width", vizWidth).attr("height", vizHeight)
      .style("background", "#0d1117");

    const g = svg.append("g");
    const cx = vizWidth / 2, cy = vizHeight / 2;

    // Position ego at center, neighbors in a circle
    const angleStep = (2 * Math.PI) / neighbors.size;
    const radius = Math.min(vizWidth, vizHeight) * 0.35;
    const positions = new Map();
    positions.set(egoName, { x: cx, y: cy });
    let idx = 0;
    neighbors.forEach(id => {
      positions.set(id, {
        x: cx + radius * Math.cos(idx * angleStep - Math.PI / 2),
        y: cy + radius * Math.sin(idx * angleStep - Math.PI / 2)
      });
      idx++;
    });

    // Draw edges
    egoEdges.forEach(e => {
      const s = positions.get(e.source);
      const t = positions.get(e.target);
      if (s && t) {
        g.append("line")
          .attr("x1", s.x).attr("y1", s.y)
          .attr("x2", t.x).attr("y2", t.y)
          .attr("stroke", e.type === "co-citation" ? "#555" : "#ff9800")
          .attr("stroke-width", e.type === "co-citation" ? 1 : 2)
          .attr("stroke-dasharray", e.type === "co-citation" ? "none" : "4,2")
          .attr("opacity", 0.6);
      }
    });

    // Draw nodes
    miniNodes.forEach(n => {
      const pos = positions.get(n.id);
      if (!pos) return;
      const isEgo = n.id === egoName;
      const r = isEgo ? 18 : 8;

      g.append("circle")
        .attr("cx", pos.x).attr("cy", pos.y).attr("r", r)
        .attr("fill", schoolColors[n.school] || "#757575")
        .attr("stroke", isEgo ? "#fff" : "none")
        .attr("stroke-width", isEgo ? 2 : 0)
        .attr("opacity", 0.9);

      // Label
      const parts = n.id.split(" ");
      const label = parts[parts.length - 1];
      g.append("text")
        .attr("x", pos.x).attr("y", pos.y + r + 14)
        .attr("text-anchor", "middle")
        .attr("fill", isEgo ? "#fff" : "#aaa")
        .attr("font-size", isEgo ? 13 : 10)
        .attr("font-family", "'Source Sans 3', sans-serif")
        .attr("font-weight", isEgo ? "600" : "400")
        .text(label);
    });

    // Title
    svg.append("text")
      .attr("x", 15).attr("y", 25)
      .attr("fill", "#fff").attr("font-size", 14)
      .attr("font-family", "'EB Garamond', serif")
      .text(`Ego-Netzwerk: ${egoName}`);

    // Stats
    const coCit = egoEdges.filter(e => e.type === "co-citation").length;
    const lin = egoEdges.filter(e => e.type !== "co-citation").length;
    svg.append("text")
      .attr("x", 15).attr("y", vizHeight - 15)
      .attr("fill", "#666").attr("font-size", 11)
      .attr("font-family", "'Source Sans 3', sans-serif")
      .text(`${coCit} Co-Zitationen · ${lin} Stammbaum-Verbindungen`);
  }

  function renderSlope(highlight) {
    vizPanel.innerHTML = "";
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const w = vizWidth - margin.left - margin.right;
    const h = vizHeight - margin.top - margin.bottom;

    const svg = d3.select(vizPanel).append("svg")
      .attr("width", vizWidth).attr("height", vizHeight)
      .style("background", "#0d1117")
      .append("g").attr("transform", `translate(${margin.left},${margin.top})`);

    // Compute early vs late presence for each node
    const earlyYears = flow.filter(d => d.year <= 1995);
    const lateYears = flow.filter(d => d.year >= 2005);

    // Use nodes that appear in co-citation data
    const slopeData = nodes
      .filter(n => n.inCoCitation && n.conferenceAppearances > 3)
      .map(n => {
        const parts = n.id.split(" ");
        const lastName = parts[parts.length - 1];
        return { id: n.id, label: lastName, school: n.school, apps: n.conferenceAppearances };
      })
      .sort((a, b) => b.apps - a.apps)
      .slice(0, 20);

    const y = d3.scalePoint()
      .domain(slopeData.map(d => d.id))
      .range([0, h])
      .padding(0.5);

    // Left column: rank by early appearances, Right: rank by late
    // For simplicity, use conference appearances as proxy
    const risers = highlight ? highlight.risers : [];
    const fallers = highlight ? highlight.fallers : [];

    slopeData.forEach(d => {
      const isRiser = risers.includes(d.label) || risers.includes(d.id);
      const isFaller = fallers.includes(d.label) || fallers.includes(d.id);
      const color = isRiser ? "#4CAF50" : isFaller ? "#f44336" : (schoolColors[d.school] || "#555");
      const opacity = (isRiser || isFaller) ? 1 : 0.3;

      // Draw bar
      const barWidth = Math.min(w, (d.apps / 28) * w);
      svg.append("rect")
        .attr("x", 0).attr("y", y(d.id) - 8)
        .attr("width", barWidth).attr("height", 16)
        .attr("fill", color).attr("opacity", opacity).attr("rx", 3);

      // Label left
      svg.append("text")
        .attr("x", -8).attr("y", y(d.id) + 4)
        .attr("text-anchor", "end")
        .attr("fill", (isRiser || isFaller) ? "#fff" : "#888")
        .attr("font-size", 11)
        .attr("font-family", "'Source Sans 3', sans-serif")
        .attr("font-weight", (isRiser || isFaller) ? "600" : "400")
        .text(d.label);

      // Value right
      svg.append("text")
        .attr("x", barWidth + 6).attr("y", y(d.id) + 4)
        .attr("fill", "#666").attr("font-size", 10)
        .attr("font-family", "'Source Sans 3', sans-serif")
        .text(`${d.apps} Bände`);
    });

    // Title
    svg.append("text")
      .attr("x", w / 2).attr("y", -15)
      .attr("text-anchor", "middle")
      .attr("fill", "#aaa").attr("font-size", 12)
      .attr("font-family", "'Source Sans 3', sans-serif")
      .text(lang === "en" ? "Conference Appearances (Top 20)" : "Konferenzauftritte (Top 20)");
  }

  // --- Scene activation ---
  let activeScene = -1;

  function activateScene(idx) {
    if (idx === activeScene) return;
    activeScene = idx;
    const scene = scenes[idx];

    // Update narrative highlighting
    narrative.querySelectorAll(".scroll-scene").forEach((el, i) => {
      el.style.opacity = i === idx ? "1" : "0.3";
    });

    // Render appropriate visualization
    switch (scene.viz) {
      case "overview": renderOverview(); break;
      case "flow": renderFlow(scene.highlight); break;
      case "ego": renderEgo(scene.highlight); break;
      case "slope": renderSlope(scene.highlight); break;
      default: renderOverview();
    }
  }

  // --- IntersectionObserver for scroll-triggered transitions ---
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
        const idx = parseInt(entry.target.dataset.sceneIdx);
        activateScene(idx);
      }
    });
  }, {
    root: narrative,
    threshold: 0.5
  });

  narrative.querySelectorAll(".scroll-scene").forEach(section => {
    observer.observe(section);
  });

  // --- Initial state ---
  activateScene(0);
}
