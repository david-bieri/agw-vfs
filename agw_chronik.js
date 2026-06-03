/**
 * agw_chronik.js
 * Vanilla-JS Showcase for the AGW Archive "Chronik" tab.
 * No dependencies. Reads window.lang from the host page.
 *
 * Public API:
 *   initChronik(containerId)  — called once when the tab first opens
 *   renderChronik()           — called when language toggles
 */

(function () {
  'use strict';

  /* ── Embedded data ─────────────────────────────────────── */
  const D = {"key_numbers":{"n_conf":43,"n_figs":237,"n_links":1274,"top_figure":{"name":"Joseph Alois Schumpeter","df":28,"pct":65},"pillars":31,"single_appearance":9,"oldest":{"name":"Francis Bacon","birth":1561},"youngest":{"name":"Hans Jörg Hennecke","birth":1969},"max_lag":{"name":"Francis Bacon","lag":439,"birth":1561,"debut":2000},"birth_span_lo":1561,"birth_span_hi":1969},"canon_growth":[{"year":1980,"new":8,"total":8},{"year":1981,"new":0,"total":8},{"year":1982,"new":4,"total":12},{"year":1983,"new":8,"total":20},{"year":1984,"new":1,"total":21},{"year":1985,"new":16,"total":37},{"year":1986,"new":1,"total":38},{"year":1987,"new":5,"total":43},{"year":1988,"new":0,"total":43},{"year":1989,"new":3,"total":46},{"year":1990,"new":2,"total":48},{"year":1991,"new":0,"total":48},{"year":1992,"new":15,"total":63},{"year":1993,"new":12,"total":75},{"year":1994,"new":10,"total":85},{"year":1995,"new":4,"total":89},{"year":1996,"new":4,"total":93},{"year":1997,"new":17,"total":110},{"year":1998,"new":18,"total":128},{"year":1999,"new":9,"total":137},{"year":2000,"new":9,"total":146},{"year":2001,"new":17,"total":163},{"year":2002,"new":5,"total":168},{"year":2003,"new":8,"total":176},{"year":2004,"new":17,"total":193},{"year":2005,"new":9,"total":202},{"year":2006,"new":4,"total":206},{"year":2007,"new":7,"total":213},{"year":2008,"new":6,"total":219},{"year":2009,"new":6,"total":225},{"year":2010,"new":1,"total":226},{"year":2011,"new":1,"total":227},{"year":2012,"new":3,"total":230},{"year":2013,"new":2,"total":232},{"year":2014,"new":1,"total":233},{"year":2015,"new":0,"total":233},{"year":2016,"new":1,"total":234},{"year":2017,"new":0,"total":234},{"year":2018,"new":1,"total":235},{"year":2019,"new":1,"total":236},{"year":2021,"new":1,"total":237},{"year":2022,"new":0,"total":237},{"year":2023,"new":0,"total":237}],"temporal_reach":[{"year":1980,"min":1723,"p25":1806,"median":1842,"p75":1922,"max":1927,"span":204},{"year":1982,"min":1817,"p25":1883,"median":1925,"p75":1928,"max":1928,"span":111},{"year":1983,"min":1842,"p25":1883,"median":1912,"p75":1933,"max":1938,"span":96},{"year":1985,"min":1723,"p25":1815,"median":1879,"p75":1900,"max":1929,"span":206},{"year":1987,"min":1783,"p25":1864,"median":1893,"p75":1903,"max":1906,"span":123},{"year":1989,"min":1723,"p25":1806,"median":1842,"p75":1904,"max":1911,"span":188},{"year":1990,"min":1820,"p25":1835,"median":1920,"p75":1928,"max":1928,"span":108},{"year":1992,"min":1815,"p25":1851,"median":1883,"p75":1902,"max":1927,"span":112},{"year":1993,"min":1772,"p25":1842,"median":1895,"p75":1919,"max":1950,"span":178},{"year":1994,"min":1835,"p25":1877,"median":1901,"p75":1915,"max":1949,"span":114},{"year":1995,"min":1632,"p25":1806,"median":1842,"p75":1877,"max":1937,"span":305},{"year":1996,"min":1851,"p25":1883,"median":1900,"p75":1903,"max":1950,"span":99},{"year":1997,"min":1711,"p25":1868,"median":1899,"p75":1927,"max":1944,"span":233},{"year":1998,"min":1588,"p25":1835,"median":1895,"p75":1921,"max":1968,"span":380},{"year":1999,"min":1632,"p25":1817,"median":1864,"p75":1904,"max":1956,"span":324},{"year":2000,"min":1561,"p25":1851,"median":1883,"p75":1923,"max":1968,"span":407},{"year":2001,"min":1680,"p25":1863,"median":1900,"p75":1922,"max":1968,"span":288},{"year":2002,"min":1723,"p25":1842,"median":1895,"p75":1915,"max":1964,"span":241},{"year":2003,"min":1711,"p25":1845,"median":1895,"p75":1916,"max":1950,"span":239},{"year":2004,"min":1561,"p25":1885,"median":1903,"p75":1921,"max":1963,"span":402},{"year":2005,"min":1561,"p25":1817,"median":1899,"p75":1926,"max":1968,"span":407},{"year":2006,"min":1840,"p25":1880,"median":1904,"p75":1931,"max":1949,"span":109},{"year":2007,"min":1632,"p25":1879,"median":1910,"p75":1927,"max":1964,"span":332},{"year":2008,"min":1632,"p25":1851,"median":1895,"p75":1916,"max":1953,"span":321},{"year":2009,"min":1767,"p25":1851,"median":1877,"p75":1895,"max":1937,"span":170},{"year":2010,"min":1789,"p25":1864,"median":1902,"p75":1924,"max":1961,"span":172},{"year":2011,"min":1632,"p25":1881,"median":1902,"p75":1923,"max":1963,"span":331},{"year":2012,"min":1723,"p25":1885,"median":1921,"p75":1931,"max":1968,"span":245},{"year":2013,"min":1723,"p25":1840,"median":1883,"p75":1906,"max":1963,"span":240},{"year":2014,"min":1588,"p25":1818,"median":1900,"p75":1924,"max":1953,"span":365},{"year":2015,"min":1795,"p25":1883,"median":1905,"p75":1929,"max":1961,"span":166},{"year":2016,"min":1561,"p25":1863,"median":1904,"p75":1924,"max":1969,"span":408},{"year":2017,"min":1772,"p25":1887,"median":1905,"p75":1930,"max":1968,"span":196},{"year":2018,"min":1561,"p25":1844,"median":1900,"p75":1924,"max":1953,"span":392},{"year":2019,"min":1723,"p25":1879,"median":1899,"p75":1912,"max":1963,"span":240},{"year":2021,"min":1820,"p25":1880,"median":1910,"p75":1924,"max":1969,"span":149}],"entropy":[{"year":1980,"H":1.778,"theme":"Klassische Nationalökonomie","n_schools":4},{"year":1981,"H":0,"theme":"Merkantilismus und Kameralismus","n_schools":0},{"year":1982,"H":0.65,"theme":"Theoriegeschichte - wozu?","n_schools":2},{"year":1983,"H":2.118,"theme":"Marx, Keynes, Schumpeter","n_schools":7},{"year":1984,"H":-0.0,"theme":"Deutsche Nationalökonomie Ende des 18. J","n_schools":1},{"year":1985,"H":2.413,"theme":"Entwicklungen der deutschsprachigen Nati","n_schools":8},{"year":1986,"H":-0.0,"theme":"Allgemeine Gleichgewichtsanalyse","n_schools":1},{"year":1987,"H":1.252,"theme":"Konjunkturtheorie im ausgehenden 19. Jah","n_schools":3},{"year":1988,"H":-0.0,"theme":"Deutschsprachige Wirtschafts-, Konjunktu","n_schools":1},{"year":1989,"H":1.76,"theme":"Friedrich List; Carl Menger; Lorenz von ","n_schools":4},{"year":1990,"H":2.0,"theme":"Wirtschaft und Wirtschaftswissenschaften","n_schools":4},{"year":1991,"H":0,"theme":"Osteuropäische Dogmengeschichte","n_schools":0},{"year":1992,"H":2.901,"theme":"Deutsche Finanzwissenschaft zwischen 191","n_schools":11},{"year":1993,"H":3.435,"theme":"Johann Heinrich von Thünen als Wirtschaf","n_schools":12},{"year":1994,"H":2.905,"theme":"Revolution und Evolution in der Wirtscha","n_schools":10},{"year":1995,"H":1.743,"theme":"Umsetzung wirtschaftspolitischer Grundko","n_schools":5},{"year":1996,"H":2.919,"theme":"Umsetzung wirtschaftspolitischer Grundko","n_schools":8},{"year":1997,"H":2.982,"theme":"Knut Wicksell","n_schools":12},{"year":1998,"H":2.391,"theme":"John Stuart Mill","n_schools":13},{"year":1999,"H":2.843,"theme":"Die Ältere Historische Schule","n_schools":13},{"year":2000,"H":2.776,"theme":"Ideen, Methoden und Entwicklungen","n_schools":10},{"year":2001,"H":3.329,"theme":"Deutschsprachige Wirtschaftswissenschaft","n_schools":14},{"year":2002,"H":3.288,"theme":"Deutschsprachige Wirtschaftswissenschaft","n_schools":15},{"year":2003,"H":3.344,"theme":"Ökonomie und Religion","n_schools":15},{"year":2004,"H":3.118,"theme":"Wirtschaftswissenschaft und Technik","n_schools":14},{"year":2005,"H":3.347,"theme":"German–American Economic Thought","n_schools":16},{"year":2006,"H":2.169,"theme":"Wissen / The Knowledge Economy","n_schools":9},{"year":2007,"H":3.382,"theme":"Wechselseitige Einflüsse","n_schools":16},{"year":2008,"H":2.777,"theme":"Einfluss deutschsprachigen Denkens in Ja","n_schools":15},{"year":2009,"H":2.797,"theme":"Geschichte der Entwicklungstheorien","n_schools":11},{"year":2010,"H":3.117,"theme":"Ökonomik zwischen Natur- und Geisteswiss","n_schools":14},{"year":2011,"H":3.346,"theme":"Entwicklung der Raumwirtschaftslehre","n_schools":15},{"year":2012,"H":3.191,"theme":"Zeit um den Ersten Weltkrieg","n_schools":11},{"year":2013,"H":3.237,"theme":"Marx und Engels — Neue Perspektiven","n_schools":12},{"year":2014,"H":3.473,"theme":"Macht oder ökonomisches Gesetz?","n_schools":13},{"year":2015,"H":3.349,"theme":"Kontinuität und Wandel in der Institutio","n_schools":14},{"year":2016,"H":3.604,"theme":"Stagnations- und Deflationstheorien","n_schools":15},{"year":2017,"H":2.722,"theme":"Einkommens- und Vermögensverteilung","n_schools":12},{"year":2018,"H":3.205,"theme":"Kameralismus und Merkantilismus","n_schools":14},{"year":2019,"H":2.978,"theme":"Ökonomie und Evolution","n_schools":15},{"year":2021,"H":2.537,"theme":"Entwicklung der Konjunkturforschung","n_schools":13},{"year":2022,"H":0,"theme":"Geschichte des Vereins für Socialpolitik","n_schools":0},{"year":2023,"H":0,"theme":"Adam Smith@300","n_schools":0}],"df_distribution":[28,20,18,18,18,17,17,15,14,14,14,14,13,13,13,13,12,12,12,11,11,11,10,10,10,10,10,10,10,10,10,9,9,9,9,9,9,9,9,8,8,8,8,8,8,8,8,8,8,7,7,7,7,7,7,7,7,7,7,7],"school_shares":{"Historical School":16.3,"Neoclassical":16.2,"Austrian School":10.2,"Classical":7.8,"Contemporary":6.6,"Philosophy":5.7,"Mathematical Economics":5.3,"Institutional":4.9,"Post-Keynesian/Sraffian":4.6,"Keynesian":4.2,"Development Economics":3.8,"Ordoliberalismus":3.3,"Evolutionary":3.0,"Marxist":2.9,"Other":2.4,"Raumwirtschaftslehre":2.2,"National Economy":0.5}};

  /* ── Colours (consistent with rest of site) ─────────────── */
  const SC = {
    "Classical":"#2196F3","Historical School":"#FF9800","National Economy":"#795548",
    "Marxist":"#F44336","Austrian School":"#CE93D8","Keynesian":"#4CAF50",
    "Post-Keynesian/Sraffian":"#00BCD4","Evolutionary":"#E91E63",
    "Ordoliberalismus":"#80CBC4","Raumwirtschaftslehre":"#B39DDB",
    "Neoclassical":"#90CAF9","Mathematical Economics":"#B0BEC5",
    "Institutional":"#FF8A65","Development Economics":"#D4E157",
    "Contemporary":"#78909C","Philosophy":"#9E9E9E","Other":"#757575",
  };
  const ACC="#1B3A6B", GOLD="#B45309", GRN="#2D6A4F", RED="#991B1B";
  const MUTED="#6B7280";

  /* ── Language helper — delegates to agw_strings.js ─────── */
  function getLang() {
    if (window.AGW && window.AGW.getLang) return window.AGW.getLang();
    try { return localStorage.getItem('agw-lang') || 'de'; } catch(e) { return 'de'; }
  }
  function t(key, fallbackDE, fallbackEN) {
    if (window.AGW && window.AGW.t) return window.AGW.t(key, getLang());
    /* Fallback if agw_strings.js not yet loaded */
    return getLang() === 'de' ? (fallbackDE || key) : (fallbackEN || fallbackDE || key);
  }

  /* ── SVG helpers ────────────────────────────────────────── */
  function svgEl(tag, attrs, text) {
    const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    if (text !== undefined) el.textContent = text;
    return el;
  }
  function svg(w, h) {
    const el = svgEl('svg', { width: w, height: h });
    el.style.display = 'block';
    el.style.overflow = 'visible';
    return el;
  }
  function line(x1, y1, x2, y2, color, width, dash) {
    const el = svgEl('line', { x1, y1, x2, y2, stroke: color,
      'stroke-width': width || 1 });
    if (dash) el.setAttribute('stroke-dasharray', dash);
    return el;
  }
  function rect(x, y, w, h, fill, rx, opacity) {
    const el = svgEl('rect', { x, y, width: Math.max(0,w), height: Math.max(0,h),
      fill, rx: rx || 0 });
    if (opacity !== undefined) el.setAttribute('opacity', opacity);
    return el;
  }
  function circle(cx, cy, r, fill, opacity) {
    return svgEl('circle', { cx, cy, r, fill, opacity: opacity || 1 });
  }
  function text(x, y, content, opts) {
    const el = svgEl('text', {
      x, y, 'font-size': opts.size || 10, fill: opts.color || '#374151',
      'text-anchor': opts.anchor || 'start',
      'font-style': opts.italic ? 'italic' : 'normal',
    });
    if (opts.weight) el.setAttribute('font-weight', opts.weight);
    if (opts.transform) el.setAttribute('transform', opts.transform);
    el.textContent = content;
    return el;
  }
  function polyline(points, stroke, width, dash, fill) {
    const el = svgEl('polyline', {
      points: points.map(([x,y]) => `${x},${y}`).join(' '),
      stroke, 'stroke-width': width || 1.5, fill: fill || 'none',
    });
    if (dash) el.setAttribute('stroke-dasharray', dash);
    return el;
  }
  function path(d, fill, opacity) {
    const el = svgEl('path', { d, fill });
    if (opacity !== undefined) el.setAttribute('opacity', opacity);
    return el;
  }

  /* ── Stat cards ─────────────────────────────────────────── */
  function renderStatCards(container) {
    const kn = D.key_numbers;
    const cards = [
      { num: kn.n_conf,
        label: t('stat_conferences', 'Jahrestagungen', 'Annual Conferences'),
        note: '1980 – 2025', accent: '#1B3A6B' },
      { num: kn.n_figs,
        label: t('stat_figures', 'Intellektuelle Figuren', 'Intellectual Figures'),
        note: `${kn.birth_span_lo}–${kn.birth_span_hi}`, accent: GOLD },
      { num: kn.n_links,
        label: t('stat_engagements', 'Figur × Konferenz-Engagements', 'Figure × Conference Engagements'),
        note: `${kn.pillars} ${t('stat_core_note', 'im Kernkanon', 'in core canon')} (df ≥ 10)`,
        accent: GRN },
      { num: `${kn.birth_span_hi - kn.birth_span_lo}yr`,
        label: t('stat_span', 'Geburtsjahr-Spanne', 'Birth-Year Span'),
        note: `${kn.oldest.name.split(' ').pop()} → ${kn.youngest.name.split(' ').pop()}`,
        accent: '#6D28D9' },
      { num: `${kn.top_figure.pct}%`,
        label: t('stat_top_pct', 'aller Konferenzen', 'of all conferences'),
        note: kn.top_figure.name, accent: RED },
      { num: `${kn.max_lag.lag}yr`,
        label: t('stat_lag', 'längste Entdeckungsverzögerung', 'longest discovery lag'),
        note: `${kn.max_lag.name.split(' ').pop()} (b.${kn.max_lag.birth})`,
        accent: '#B45309' },
    ];
    const grid = document.createElement('div');
    grid.style.cssText = 'display:grid;grid-template-columns:repeat(3,1fr);gap:2px;margin-bottom:32px;';
    cards.forEach(c => {
      const card = document.createElement('div');
      card.style.cssText = `background:#F9FAFB;border:1px solid #E5E7EB;
        border-top:3px solid ${c.accent};padding:18px 20px;border-radius:2px;`;
      card.innerHTML = `
        <div style="font-size:28px;font-weight:300;color:${c.accent};
          letter-spacing:-0.02em;line-height:1;margin-bottom:6px;">${c.num}</div>
        <div style="font-size:12px;color:#374151;margin-bottom:4px;">${c.label}</div>
        <div style="font-size:11px;color:${MUTED};font-style:italic;">${c.note}</div>`;
      grid.appendChild(card);
    });
    container.appendChild(grid);
  }

  /* ── Canon Growth chart ─────────────────────────────────── */
  function renderCanonGrowth(container) {
    const data  = D.canon_growth;
    const W=680, H=160, PAD={l:42,r:16,t:12,b:32};
    const IW=W-PAD.l-PAD.r, IH=H-PAD.t-PAD.b;
    const years = data.map(d=>d.year);
    const maxT  = Math.max(...data.map(d=>d.total));
    const xOf   = yr => PAD.l + (yr-years[0])/(years[years.length-1]-years[0])*IW;
    const yOf   = v  => PAD.t + IH - (v/maxT)*IH;
    const el = svg(W, H);

    // Gridlines
    [50,100,150,200].forEach(v => {
      if (v > maxT) return;
      el.appendChild(line(PAD.l, yOf(v), PAD.l+IW, yOf(v), '#E5E7EB', 0.5));
      el.appendChild(text(PAD.l-4, yOf(v)+3, String(v),
        {size:8, color:MUTED, anchor:'end'}));
    });

    // Area fill
    const areaPts = [[xOf(years[0]), yOf(0)],
      ...data.map(d=>[xOf(d.year), yOf(d.total)]),
      [xOf(years[years.length-1]), yOf(0)]];
    el.appendChild(path(
      'M'+areaPts.map(([x,y])=>`${x},${y}`).join('L')+'Z',
      'rgba(27,58,107,0.08)'));

    // Line
    el.appendChild(polyline(data.map(d=>[xOf(d.year), yOf(d.total)]),
      ACC, 1.8));

    // Spike markers
    data.filter(d=>d.new>=12).slice(0,6).forEach(d => {
      const x=xOf(d.year), y=yOf(d.total);
      el.appendChild(rect(x-3, y-2, 6, 2, GOLD, 1));
      el.appendChild(line(x, y-2, x, y-18, GOLD, 0.5, '2,2'));
      el.appendChild(text(x, y-22, `+${d.new}`,
        {size:7.5, color:GOLD, anchor:'middle'}));
    });

    // X-axis
    years.filter(y=>y%10===0).forEach(yr =>
      el.appendChild(text(xOf(yr), H-4, String(yr),
        {size:8, color:MUTED, anchor:'middle'})));
    el.appendChild(text(xOf(years[0]), H-4, String(years[0]),
      {size:8, color:MUTED, anchor:'middle'}));

    container.appendChild(el);
  }

  /* ── Temporal Reach chart ───────────────────────────────── */
  function renderTemporalReach(container) {
    const data = D.temporal_reach;
    const W=680, H=220, PAD={l:50,r:16,t:10,b:32};
    const IW=W-PAD.l-PAD.r, IH=H-PAD.t-PAD.b;
    const years=data.map(d=>d.year);
    const yLo=1540, yHi=1980;
    const xOf=yr=>PAD.l+(yr-years[0])/(years[years.length-1]-years[0])*IW;
    const bOf=b =>PAD.t+IH-(b-yLo)/(yHi-yLo)*IH;
    const el=svg(W,H);

    // Era bands
    [
      [1540,1650,'rgba(251,191,36,0.06)'],
      [1650,1750,'rgba(59,130,246,0.05)'],
      [1750,1820,'rgba(34,197,94,0.05)'],
      [1820,1870,'rgba(34,197,94,0.04)'],
      [1870,1920,'rgba(168,85,247,0.06)'],
      [1920,1980,'rgba(6,182,212,0.04)'],
    ].forEach(([lo,hi,col])=>
      el.appendChild(rect(PAD.l, bOf(hi), xOf(years[years.length-1])-PAD.l,
        bOf(lo)-bOf(hi), col)));

    // Box plots
    data.forEach(d=>{
      const x=xOf(d.year);
      el.appendChild(line(x,bOf(d.max),x,bOf(d.min),'rgba(27,58,107,0.25)',1));
      el.appendChild(rect(x-3,bOf(d.p75),6,Math.max(1,bOf(d.p25)-bOf(d.p75)),
        'rgba(27,58,107,0.25)',1));
      el.appendChild(circle(x,bOf(d.median),2.5,ACC,0.9));
    });

    // Median trend line
    el.appendChild(polyline(data.map(d=>[xOf(d.year),bOf(d.median)]),
      ACC, 1, '3,3'));

    // Y-axis
    [1600,1700,1800,1900].forEach(b=>{
      el.appendChild(line(PAD.l-3,bOf(b),PAD.l+IW,bOf(b),'#E5E7EB',0.5));
      el.appendChild(text(PAD.l-5,bOf(b)+3,String(b),
        {size:8,color:MUTED,anchor:'end'}));
    });
    years.filter(y=>y%10===0).forEach(yr=>
      el.appendChild(text(xOf(yr),H-4,String(yr),
        {size:8,color:MUTED,anchor:'middle'})));
    el.appendChild(text(PAD.l-5,PAD.t+IH/2,
      t('birthyear','Geburtsjahr','Birth year'),
      {size:8,color:MUTED,anchor:'middle',
       transform:`rotate(-90,${PAD.l-5},${PAD.t+IH/2})`}));

    container.appendChild(el);
  }

  /* ── Two-column row: Entropy + School shares ────────────── */
  function renderTwoCol(container) {
    const row=document.createElement('div');
    row.style.cssText='display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:8px;';
    const left=document.createElement('div');
    const right=document.createElement('div');
    row.appendChild(left); row.appendChild(right);
    container.appendChild(row);
    renderEntropyChart(left);
    renderSchoolShares(right);
  }

  function renderEntropyChart(container) {
    const data=D.entropy.filter(e=>e.H>0);
    const W=300,H=150,PAD={l:30,r:8,t:8,b:26};
    const IW=W-PAD.l-PAD.r, IH=H-PAD.t-PAD.b;
    const years=data.map(d=>d.year);
    const maxH=Math.max(...data.map(d=>d.H));
    const xOf=yr=>PAD.l+(yr-years[0])/(years[years.length-1]-years[0])*IW;
    const yOf=v=>PAD.t+IH-(v/maxH)*IH;
    const el=svg(W,H);
    const tip=document.createElement('div');
    tip.style.cssText='font-size:11px;color:'+MUTED+';font-style:italic;min-height:16px;margin-top:4px;';

    data.forEach(d=>{
      const bar=rect(xOf(d.year)-3, yOf(d.H),
        6, IH-(yOf(d.H)-PAD.t), ACC, 1, 0.4);
      bar.style.cursor='default';
      bar.addEventListener('mouseenter',()=>{
        bar.setAttribute('opacity','0.85');
        bar.setAttribute('fill',GOLD);
        tip.textContent=`${d.year}: H=${d.H} — ${d.theme}`;
      });
      bar.addEventListener('mouseleave',()=>{
        bar.setAttribute('opacity','0.4');
        bar.setAttribute('fill',ACC);
        tip.textContent='';
      });
      el.appendChild(bar);
    });
    el.appendChild(polyline(data.map(d=>[xOf(d.year),yOf(d.H)]),ACC,1,'',));

    [1,2,3].forEach(v=>{
      if(v>maxH) return;
      el.appendChild(line(PAD.l,yOf(v),PAD.l+IW,yOf(v),'#E5E7EB',0.5));
      el.appendChild(text(PAD.l-3,yOf(v)+3,String(v),{size:7,color:MUTED,anchor:'end'}));
    });
    years.filter(y=>y%10===0).forEach(yr=>
      el.appendChild(text(xOf(yr),H-4,String(yr),{size:7,color:MUTED,anchor:'middle'})));

    container.appendChild(el);
    container.appendChild(tip);
  }

  function renderSchoolShares(container) {
    const shares=Object.entries(D.school_shares)
      .sort((a,b)=>b[1]-a[1]).slice(0,10);
    const maxV=shares[0][1];
    const BAR_H=16, LEFT=130, W=300, H=shares.length*(BAR_H+3)+8;
    const el=svg(W,H);
    shares.forEach(([school,pct],i)=>{
      const bw=(pct/maxV)*(W-LEFT-20);
      const y=i*(BAR_H+3);
      const col=SC[school]||MUTED;
      const name=school.length>18?school.slice(0,16)+'…':school;
      el.appendChild(text(LEFT-5,y+BAR_H-3,name,
        {size:8,color:col,anchor:'end'}));
      el.appendChild(rect(LEFT,y,bw,BAR_H-2,col,1,0.65));
      el.appendChild(text(LEFT+bw+4,y+BAR_H-3,`${pct}%`,
        {size:8,color:col}));
    });
    container.appendChild(el);
  }

  /* ── Canon Pyramid ──────────────────────────────────────── */
  function renderCanonPyramid(container) {
    const dfs=D.df_distribution;
    const total=dfs.reduce((a,b)=>a+b,0);
    const W=680, H=90, PAD={l:50,r:16,t:14,b:28};
    const IW=W-PAD.l-PAD.r, IH=H-PAD.t-PAD.b;
    const N=dfs.length, maxDf=dfs[0];
    const xOf=i=>PAD.l+(i/N)*IW;
    const yOf=v=>PAD.t+IH-(v/maxDf)*IH;
    const el=svg(W,H);

    // Bars
    dfs.forEach((v,i)=>{
      const fill=v>=10?GOLD:v>=5?'#3B82F6':'rgba(59,130,246,0.3)';
      el.appendChild(rect(xOf(i),yOf(v),
        Math.max(1,IW/N-0.5),IH-(yOf(v)-PAD.t),fill,0,0.8));
    });

    // Cumulative coverage line
    const cumPts=[];
    let cum=0;
    dfs.forEach((v,i)=>{
      cum+=v;
      cumPts.push([xOf(i), PAD.t+IH*(1-cum/total)]);
    });
    el.appendChild(polyline(cumPts,GRN,1.5));

    // 50%/80% markers
    let c2=0;
    const marks=[];
    dfs.forEach((v,i)=>{
      c2+=v;
      const pct=c2/total;
      if((pct>=0.5&&!marks.find(m=>m.pct===50))||
         (pct>=0.8&&!marks.find(m=>m.pct===80))) {
        marks.push({i,pct:pct>=0.8?80:50,
          color:pct>=0.8?GRN:GOLD});
      }
    });
    marks.forEach(m=>{
      el.appendChild(line(xOf(m.i),PAD.t,xOf(m.i),PAD.t+IH,
        m.color,0.8,'3,2'));
      el.appendChild(text(xOf(m.i)+2,PAD.t+10,
        `${m.pct}% ${t('coverage','Abdeckung','coverage')}`,
        {size:7.5,color:m.color}));
    });

    // Y-axis
    [10,20,30].filter(v=>v<=maxDf).forEach(v=>
      el.appendChild(text(PAD.l-4,yOf(v)+3,String(v),
        {size:7.5,color:MUTED,anchor:'end'})));

    // Schumpeter label
    el.appendChild(text(xOf(0)+3,yOf(dfs[0])-4,'Schumpeter',
      {size:8,color:GOLD}));

    // X-axis
    el.appendChild(text(PAD.l,H-4,'1',{size:8,color:MUTED}));
    el.appendChild(text(xOf(N/2),H-4,
      `${t('rank','Rang','Rank')} ${Math.round(N/2)}`,
      {size:8,color:MUTED,anchor:'middle'}));
    el.appendChild(text(xOf(N),H-4,String(N),
      {size:8,color:MUTED,anchor:'end'}));

    container.appendChild(el);
  }

  /* ── Chart section wrapper ──────────────────────────────── */
  function chartSection(container, titleDE, titleEN, descDE, descEN) {
    const sec=document.createElement('div');
    sec.style.cssText='margin-bottom:28px;padding-bottom:28px;'+
      'border-bottom:1px solid var(--border,#E5E7EB);';
    sec.innerHTML=`
      <h4 style="margin:0 0 4px;font-size:14px;font-weight:600;color:#111827;">
        ${t(titleDE,titleEN)}</h4>
      <p style="margin:0 0 12px;font-size:12px;color:${MUTED};font-style:italic;">
        ${t(descDE,descEN)}</p>`;
    container.appendChild(sec);
    return sec;
  }

  /* ── Main render ────────────────────────────────────────── */
  let _container = null;
  let _initialized = false;

  function renderChronik() {
    if (!_container) return;
    _container.innerHTML = '';

    // Heading
    const hdr=document.createElement('div');
    hdr.style.marginBottom='28px';
    hdr.innerHTML=`
      <div style="font-size:11px;letter-spacing:.15em;color:${MUTED};
        text-transform:uppercase;margin-bottom:6px;">
        ${t('chronik_heading', 'Der AGW in Zahlen', 'The AGW in Numbers')} · 1980–2025</div>
      <p style="margin:0;font-size:13px;color:${MUTED};font-style:italic;">
        ${t(
          'Der AGW hat seit seiner Gründung 1980 ein einzigartiges intellektuelles Kanon aufgebaut.',
          'Since its founding in 1980, the AGW has built a distinctive intellectual canon of economic thought.'
        )}</p>`;
    _container.appendChild(hdr);

    // Stat cards
    renderStatCards(_container);

    // Charts
    const s1=chartSection(_container,
      t('panel_canon','Das wachsende Kanon','The Expanding Canon'),
      'Kumulierte neue Figuren im AGW-Kanon nach Konferenzjahr. Goldene Spitzen = stärkste Zuwachsjahre.',
      'Cumulative unique figures entering the corpus per year. Gold spikes = strongest intake years.');
    renderCanonGrowth(s1);

    const s2=chartSection(_container,
      t('panel_time','Die Tiefe der Zeit','The Depth of Time'),
      'Geburtsjahr-Verteilung der zitierten Figuren pro Konferenz. Box = IQR, Punkt = Median.',
      'Birth-year distribution of cited figures per conference. Box = IQR, dot = median.');
    renderTemporalReach(s2);

    const s3=chartSection(_container,
      t('panel_diversity','Intellektuelle Vielfalt & Schulanteile','Intellectual Diversity & School Shares'),
      'Links: Shannon-Entropie pro Konferenz (höher = breiter Fokus). Rechts: Gesamtkorpus-Anteil nach Denkschule.',
      'Left: Shannon entropy per conference (higher = broader focus). Right: Overall corpus share by school.');
    renderTwoCol(s3);

    const s4=chartSection(_container,
      t('panel_pyramid','Die Kanonpyramide','The Canon Pyramid'),
      'Konferenzauftritte pro Figur. Gold = Kern (df≥10), Blau = Regulär (df 5–9). Grüne Linie = kumulative Abdeckung.',
      'Conference appearances per figure. Gold = core (df≥10), blue = regular (df 5–9). Green line = cumulative coverage.');
    renderCanonPyramid(s4);

    // Link to analytics
    const link=document.createElement('div');
    link.style.cssText='margin-top:20px;padding:14px 18px;'+
      'background:#EFF6FF;border:1px solid #BFDBFE;border-radius:4px;'+
      'display:flex;justify-content:space-between;align-items:center;';
    link.innerHTML=`
      <span style="font-size:13px;color:#1E40AF;">
        ${t(
          'Detaillierte Analyse: Intellektueller Blick, Themenassoziationen, Autorencluster',
          'Detailed Analysis: Intellectual Gaze Map, Topic Associations, Author Clusters'
        )}
      </span>
      <a href="analytics.html" target="_blank"
        style="font-size:13px;color:#1E40AF;font-weight:600;
          white-space:nowrap;margin-left:16px;">
        ${t('chronik_cta_link','Zur Analyse','Open Analytics')} ↗
      </a>`;
    _container.appendChild(link);
  }

  function initChronik(containerId) {
    _container = document.getElementById(containerId);
    if (!_container) return;
    renderChronik();
    _initialized = true;

    // Re-render on language toggle
    document.querySelectorAll('.lang-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        setTimeout(renderChronik, 20);
      });
    });
  }

  // Expose
  window.initChronik   = initChronik;
  window.renderChronik = renderChronik;

})();
