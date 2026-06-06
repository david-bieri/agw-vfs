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
    body: "Seit 1980 hat der Ausschuss für die Geschichte der Wirtschaftswissenschaften (AGW) im Verein für Socialpolitik jährlich Konferenzen veranstaltet. Über vier Jahrzehnte entstand ein einzigartiges Archiv intellektueller Rezeption — es kartiert nicht nur die Ideengeschichte, sondern die Geschichte der Historiker selbst. Wer wurde studiert, wer vergessen, und welche Denkschulen dominierten den deutschsprachigen Diskurs?",
    viz: "overview",
    highlight: null
  },
  {
    id: "classical-dominance",
    title: "Die Klassiker dominieren die Anfangsjahre",
    body: "In den 1980er Jahren standen die Gründungsfiguren der politischen Ökonomie im Mittelpunkt: Adam Smith, David Ricardo und Karl Marx. Die frühen AGW-Konferenzen widmeten sich stark der Dogmengeschichte und den Wurzeln der Werttheorie. In diesem ersten Jahrzehnt galt über 40% der Aufmerksamkeit der klassischen und neoklassischen Schule — ein Ausdruck des traditionellen Kanonverständnisses.",
    viz: "flow",
    highlight: { schools: ["Classical", "Neoclassical"], yearRange: [1980, 1990] }
  },
  {
    id: "austrian-rise",
    title: "Der Aufstieg der Österreichischen Schule",
    body: "Ab 1985 rückte die Österreichische Schule dramatisch ins Zentrum des Diskurses: Carl Menger, Eugen von Böhm-Bawerk, Ludwig von Mises und Friedrich von Hayek. Dieser Anstieg der AGW-Aufmerksamkeit spiegelt exakt den breiteren internationalen 'Austrian Revival' der 1980er Jahre wider, als Forscher die subjektive Werttheorie und die Debatte um die sozialistische Wirtschaftsrechnung neu bewerteten.",
    viz: "flow",
    highlight: { schools: ["Austrian School"], yearRange: [1985, 2000] }
  },
  {
    id: "schumpeter-hub",
    title: "Schumpeter — Die ultimative Brückenfigur",
    body: "Joseph Alois Schumpeter erscheint in 28 der 43 Konferenzbände — ein absoluter Rekord. Wie die Visualisierung zeigt, verbindet sein Ego-Netzwerk 38 andere Figuren über Co-Zitationen und Lehrer-Schüler-Beziehungen. Schumpeter fungiert als zentrale intellektuelle Brücke zwischen der österreichischen Tradition (seine Lehrer Böhm-Bawerk und Wieser), der Evolutionsökonomik und der neoklassischen Synthese (sein Schüler Paul Samuelson).",
    viz: "ego",
    highlight: { ego: "Joseph Alois Schumpeter" }
  },
  {
    id: "diversification",
    title: "Pluralisierung nach 2000",
    body: "Nach der Jahrtausendwende diversifiziert sich das Feld signifikant. Institutionalismus (Thorstein Veblen, John R. Commons), Evolutionsökonomik, Philosophie und Raumwirtschaftslehre gewinnen an Bedeutung. Die AGW-Konferenzen werden thematisch breiter und verlagern sich von der reinen Dogmengeschichte hin zu einer interdisziplinären Ideengeschichte und Methodologie.",
    viz: "flow",
    highlight: { schools: ["Institutional", "Evolutionary", "Philosophy", "Raumwirtschaftslehre"], yearRange: [2000, 2023] }
  },
  {
    id: "forgotten-figures",
    title: "Die Konjunktur der Reputation",
    body: "Intellektuelle Reputation unterliegt Zyklen. Manche Figuren erleben eine Renaissance: Walter Eucken, der Architekt des Ordoliberalismus, wird nach 2000 hochgradig zitiert, als Forscher die Grundlagen der Sozialen Marktwirtschaft neu untersuchen. Andere verblassen: Werner Sombart, ein Gigant der Historischen Schule, der in den 1980er Jahren noch häufig diskutiert wurde, taucht nach 2005 kaum noch auf.",
    viz: "slope",
    highlight: { risers: ["Walter Eucken"], fallers: ["Werner Sombart"] }
  },
  {
    id: "lineage-networks",
    title: "Intellektuelle Stammbäume",
    body: "Die Stammbaum-Daten zeigen, wie Wissen über Generationen weitergegeben wird. Am Beispiel von Eugen von Böhm-Bawerk sehen wir die enorme Reichweite seiner Lehre. In seinen berühmten Wiener Seminaren unterrichtete er Schumpeter, Mises und den Marxisten Rudolf Hilferding. Diese Lehrer-Schüler-Ketten zeichnen die Migration des ökonomischen Denkens vom Wien des Fin de Siècle ins Nachkriegs-Harvard und Cambridge nach.",
    viz: "ego",
    highlight: { ego: "Eugen von Böhm-Bawerk" }
  },
  {
    id: "conclusion",
    title: "Ein lebendiges Archiv",
    body: "Die AGW-Konferenzen sind mehr als eine Tagungsreihe — sie sind ein Spiegel der sich wandelnden Selbstwahrnehmung der Wirtschaftswissenschaften. Die quantitativen Daten bestätigen, was Ideenhistoriker qualitativ längst wissen: Die Denker, die wir zu studieren wählen, verraten ebenso viel über die Anliegen unserer eigenen Zeit wie über die Vergangenheit.",
    viz: "overview",
    highlight: null
  }
];

const SCENES_EN = [
  {
    id: "intro",
    title: "43 Conferences, One Story",
    body: "Since 1980, the Committee for the History of Economics (AGW) within the Verein für Socialpolitik has held annual conferences. Over four decades, a unique archive of intellectual reception emerged — mapping not just the history of economic thought, but the history of the historians themselves. Who was studied, who was forgotten, and which schools of thought dominated the German-speaking academic discourse?",
    viz: "overview",
    highlight: null
  },
  {
    id: "classical-dominance",
    title: "The Classics Dominate the Early Years",
    body: "In the 1980s, the foundational figures of political economy took center stage: Adam Smith, David Ricardo, and Karl Marx. The early AGW conferences focused heavily on doctrinal history and the roots of value theory. During this first decade, over 40% of scholarly attention was devoted to the Classical and Neoclassical schools, reflecting a traditional approach to the canon.",
    viz: "flow",
    highlight: { schools: ["Classical", "Neoclassical"], yearRange: [1980, 1990] }
  },
  {
    id: "austrian-rise",
    title: "The Rise of the Austrian School",
    body: "From 1985 onward, the Austrian School moved dramatically to the center of the discourse: Carl Menger, Eugen von Böhm-Bawerk, Ludwig von Mises, and Friedrich von Hayek. This surge in AGW attention perfectly mirrors the broader international 'Austrian Revival' of the 1980s, as scholars re-examined subjective value theory and the socialist calculation debate.",
    viz: "flow",
    highlight: { schools: ["Austrian School"], yearRange: [1985, 2000] }
  },
  {
    id: "schumpeter-hub",
    title: "Schumpeter — The Ultimate Bridge Figure",
    body: "Joseph Alois Schumpeter appears in 28 of the 43 conference volumes — an absolute record. As the visualization shows, his ego network connects 38 other figures through co-citation and teacher-student relationships. Schumpeter serves as the central intellectual bridge connecting the Austrian tradition (his teachers Böhm-Bawerk and Wieser) with Evolutionary economics and the Neoclassical synthesis (his student Paul Samuelson).",
    viz: "ego",
    highlight: { ego: "Joseph Alois Schumpeter" }
  },
  {
    id: "diversification",
    title: "Pluralization After 2000",
    body: "Following the millennium, the field diversified significantly. Institutionalism (Thorstein Veblen, John R. Commons), Evolutionary economics, Philosophy, and Spatial Economics (Raumwirtschaftslehre) gained prominence. The AGW conferences became thematically broader, shifting from pure doctrinal history toward an interdisciplinary history of ideas and methodology.",
    viz: "flow",
    highlight: { schools: ["Institutional", "Evolutionary", "Philosophy", "Raumwirtschaftslehre"], yearRange: [2000, 2023] }
  },
  {
    id: "forgotten-figures",
    title: "The Business Cycle of Reputation",
    body: "Intellectual reputation is subject to cycles. Some figures experience a renaissance: Walter Eucken, the architect of Ordoliberalism, became highly cited after 2000 as scholars revisited the foundations of the Social Market Economy. Others fade: Werner Sombart, a giant of the German Historical School who was frequently discussed in the 1980s, barely appears after 2005.",
    viz: "slope",
    highlight: { risers: ["Walter Eucken"], fallers: ["Werner Sombart"] }
  },
  {
    id: "lineage-networks",
    title: "Intellectual Family Trees",
    body: "The lineage data reveals how knowledge is transmitted across generations. Centering on Eugen von Böhm-Bawerk, we see the remarkable reach of his teaching. Through his famous Vienna seminars, he taught Schumpeter, Mises, and Marxist Rudolf Hilferding. These teacher-student chains trace the migration of economic thought from fin-de-siècle Vienna to post-war Harvard and Cambridge.",
    viz: "ego",
    highlight: { ego: "Eugen von Böhm-Bawerk" }
  },
  {
    id: "conclusion",
    title: "A Living Archive",
    body: "The AGW conferences are more than a series of meetings — they are a mirror of the economics profession's changing self-perception. The quantitative data confirms what historians of thought have long known qualitatively: the thinkers we choose to study say as much about our own era's concerns as they do about the past.",
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
