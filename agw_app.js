/* agw_app.js — Shared application logic for the AGW site
 * ─────────────────────────────────────────────────────────────
 * Render functions, event handlers, language setup. All render
 * functions are guarded with `if (document.getElementById(...))`
 * so they no-op safely when their target DOM isn't on the page.
 * Loaded by every page after agw_strings.js and agw_data.js.
 */

/* ── Language toggle ── */
/* Translations now live in agw_strings.js — edit that file to update all labels. */

/* ── Language state ─────────────────────────────────────────────────────────
 * Approach: data-i18n attributes hold the key; DE is the HTML default.
 * On first switch to EN, current textContent is saved as data-de.
 * On return to DE, data-de is restored. data-i18n-html for markup elements.
 * Persistence: localStorage 'agw-lang'. Init: saved → navigator.language → 'de'.
 * ─────────────────────────────────────────────────────────────────────────── */
let lang = 'de';

function setLang(l) {
  lang = l;
  document.documentElement.lang = l;

  // All translation delegated to agw_strings.js
  AGW.applyLang(l);

  // Search-field placeholders (not tagged with data-i18n)
  const ms = document.getElementById('member-search');
  if (ms) ms.placeholder = l === 'en' ? AGW.t('mbr_search','en') : 'Mitglieder suchen…';
  const ps = document.getElementById('pub-search');
  if (ps) ps.placeholder = l === 'en' ? 'Search by title or editor…' : 'Titel oder Herausgeber suchen…';

  // Re-render JS-driven sections (they read the `lang` variable)
  renderChairs();
  renderMembers(getMemberList());
  renderArchive();
  renderPubs();
  renderAnnouncements();
  updateCountdown();

  // Toggle button active state (guarded — nav buttons are injected by
  // agw_nav.js AFTER agw_app.js loads, so they're null during init.
  // Without these guards setLang('en') in initLang() throws, aborting
  // the whole init block including the Logistik-map IIFE further down.)
  const btnDe = document.getElementById('btn-de');
  const btnEn = document.getElementById('btn-en');
  if (btnDe) btnDe.classList.toggle('active', l === 'de');
  if (btnEn) btnEn.classList.toggle('active', l === 'en');

  // Persist across sessions
  AGW.setLang(l);
}

function initLang() {
  // Priority: 1) explicit user preference (set via toggle click), 2) German default
  // Note: We only honour localStorage if the user explicitly toggled.
  // Browser-language auto-detection was removed because it caused
  // the site to load in EN despite the DE default toggle being active,
  // confusing users across Chrome/Safari/Arc/Comet.
  let saved = null;
  try { saved = localStorage.getItem('agw-lang'); } catch(e) {}
  if (saved === 'en') { setLang('en'); return; }
  if (saved === 'de') return; // HTML default, no action needed
  // No saved preference — stay in German (site default)
  // (Previously auto-detected browser language here, but this caused
  //  cross-browser inconsistency and violated the DE-first design intent.)
}

/* ── Programme tabs ── */
function showDay(id) {
  document.querySelectorAll('.prog-day').forEach(d => d.classList.remove('active'));
  document.querySelectorAll('.prog-tab').forEach(t => t.classList.remove('active'));
  document.getElementById('day-' + id).classList.add('active');
  const map = { do: 0, fr: 1, sa: 2 };
  document.querySelectorAll('.prog-tab')[map[id]].classList.add('active');
}

/* ── Mobile menu ── */
function toggleMobileMenu() {
  document.getElementById('mobile-menu').classList.toggle('open');
}

/* ── Members data ── */

const VENUE_COORDS={
 'Gießen':[50.5841,8.6784],'Salzburg':[47.8095,13.0550],
 'Basel':[47.5596,7.5886],'Göttingen':[51.5413,9.9158],
 'Münster':[51.9607,7.6261],'Stuttgart':[48.7758,9.1829],
 'Würzburg':[49.7944,9.9294],'Berlin':[52.5200,13.4050],
 'Tübingen':[48.5216,9.0576],'Frankfurt am Main':[50.1109,8.6821],
 'Ittingen (Schweiz)':[47.5876,8.9572],'Augsburg':[48.3705,10.8978],
 'Tellow':[53.8667,12.2167],'Weimar':[50.9795,11.3235],
 'Maastricht':[50.8514,5.6910],'Stuttgart-Hohenheim':[48.7128,9.2124],
 'Ulm':[48.4011,9.9876],'Wien':[48.2082,16.3738],
 'Hamburg':[53.5753,10.0153],'Obermayerhofen bei Graz':[46.9972,15.4222],
 'Oldenburg':[53.1435,8.2146],'Bonn':[50.7374,7.0982],
 'Graz':[47.0707,15.4395],'Lüdinghausen / Nordkirchen':[51.7486,7.5194],
 'Freiburg im Breisgau':[47.9990,7.8421],'Marbach am Neckar':[48.9408,9.2603],
 'Erfurt':[50.9787,11.0328],'Karlsruhe':[49.0069,8.4037],
 'Siegen':[50.8743,8.0235],'Darmstadt':[49.8728,8.6512],
 'Jena':[50.9273,11.5892],'Edinburgh':[55.9533,-3.1883],
 'Fulda':[50.5559,9.6808],'Bayreuth':[49.9456,11.5713],
 'Riva San Vitale, Tessin':[45.9040,8.9703]
};

function getInitials(name) {
  const p = name.trim().split(/\s+/);
  return (p[0][0] + p[p.length-1][0]).toUpperCase();
}


/* ── Chairs timeline ── */
function renderChairs() {
  const el = document.getElementById('chairs-timeline');
  if (!el) return;
  const current_lbl = lang === 'en' ? ((AGW.S.chairs_current && AGW.S.chairs_current.en) || 'Current Chair') : 'Aktuelle Vorsitzende';
  const past_lbl    = lang === 'en' ? ((AGW.S.chairs_past && AGW.S.chairs_past.en)    || 'Past Chair')    : 'Ehemaliger Vorsitzender';

  el.innerHTML = '<div class="chairs-list">'
    + CHAIRS.map((c, i) => {
      const period = c.end ? (c.start + '\u2013' + c.end) : (c.start + '\u2013heute');
      const yrs    = c.end ? (c.end - c.start) : (2026 - c.start);
      const isCurrent = !c.past;
      return '<div class="chair-item' + (isCurrent ? ' chair-current' : '') + '">'
        + '<div class="chair-num">' + (i + 1) + '</div>'
        + '<div class="chair-body">'
        + '<div class="chair-name">' + (c.title ? c.title + ' ' : '') + c.name
        + (isCurrent ? ' <span class="badge badge-gold" style="font-size:10px;vertical-align:middle;">' + current_lbl + '</span>' : '')
        + '</div>'
        + '<div class="chair-inst">' + c.inst + '</div>'
        + '</div>'
        + '<div class="chair-period">'
        + '<div class="chair-years">' + period + '</div>'
        + '<div class="chair-dur">' + yrs + (lang === 'en' ? ' yr' : ' J.') + (yrs > 1 ? (lang === 'en' ? 's' : '') : '') + '</div>'
        + '</div>'
        + '</div>';
    }).join('')
    + '</div>';
}

/* ── Member filters ── */
let memberStatusFilter  = 'all';
let memberCountryFilter = 'all';

function setMemberFilter(type, val, btn) {
  if (type === 'status') memberStatusFilter = val;
  else memberCountryFilter = val;
  document.querySelectorAll('.mbr-filter-' + type).forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderMembers(getMemberList());
}

function getMemberList() {
  const q = (document.getElementById('member-search') || {value:''}).value.toLowerCase();
  return MEMBERS.filter(m => {
    if (memberStatusFilter === 'active'  &&  m.emeritus) return false;
    if (memberStatusFilter === 'emeriti' && !m.emeritus) return false;
    if (memberCountryFilter === 'DACH' && !['DE','AT','CH'].includes(m.country)) return false;
    if (memberCountryFilter === 'INTL' &&  ['DE','AT','CH'].includes(m.country)) return false;
    if (q) {
      const txt = (m.name + ' ' + m.inst + ' ' + m.city + ' ' +
                   (lang === 'de' ? m.focus_de : m.focus_en)).toLowerCase();
      if (!txt.includes(q)) return false;
    }
    return true;
  });
}

function filterMembers() { renderMembers(getMemberList()); }

function renderMembers(list) {
  const grid = document.getElementById('members-grid');
  if (!grid) return;
  const cnt  = document.getElementById('mbr-count');
  if (cnt) cnt.textContent = list.length + ' / ' + MEMBERS.length;
  if (!list.length) {
    grid.innerHTML = '<div style="padding:32px;text-align:center;color:var(--text-faint);font-style:italic;">Keine Mitglieder gefunden / No members found</div>';
    return;
  }
  const chair_lbl = lang === 'en' ? ((AGW.S.mbr_chair && AGW.S.mbr_chair.en)    || 'Chair')     : 'Vorsitzender';
  const host_lbl  = lang === 'en' ? ((AGW.S.mbr_host2026 && AGW.S.mbr_host2026.en) || '2026 Host') : 'Gastgeber 2026';
  const em_lbl    = lang === 'en' ? 'Emeritus/a' : 'Emeritus/a';
  const FLAG = { DE:'\u{1f1e9}\u{1f1ea}', AT:'\u{1f1e6}\u{1f1f9}', CH:'\u{1f1e8}\u{1f1ed}',
                 US:'\u{1f1fa}\u{1f1f8}', UK:'\u{1f1ec}\u{1f1e7}', JP:'\u{1f1ef}\u{1f1f5}' };
  grid.innerHTML = list.map(m => {
    const focus  = lang === 'de' ? m.focus_de : m.focus_en;
    const flag   = FLAG[m.country] || '';
    const badges = [];
    if (m.role === 'chair')    badges.push('<span class="badge badge-gold">'  + chair_lbl + '</span>');
    if (m.role === 'host2026') badges.push('<span class="badge badge-blue">'  + host_lbl  + '</span>');
    if (m.emeritus)            badges.push('<span class="badge" style="background:var(--border-light);color:var(--text-muted);">' + em_lbl + '</span>');
    return '<div class="member-card' + (m.role === 'chair' ? ' chair' : '') + '">'
      + '<div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">'
      + '<div class="member-initial">' + getInitials(m.name) + '</div>'
      + '<span style="font-size:18px;" title="' + m.country + '">' + flag + '</span></div>'
      + '<div class="member-name">' + m.name + '</div>'
      + '<div style="font-size:11px;color:var(--text-faint);font-weight:600;margin-bottom:2px;">' + m.title + '</div>'
      + '<div class="member-inst">' + m.inst + (m.city && m.city !== '–' ? ' · ' + m.city : '') + '</div>'
      + (focus ? '<div class="member-focus">' + focus + '</div>' : '')
      + (badges.length ? '<div class="member-badges">' + badges.join('') + '</div>' : '')
      + '</div>';
  }).join('');
}

/* ── Archive data ── */


/* ── Archive filters ── */
let archiveDecadeFilter  = 'all';
let archiveCountryFilter = 'all';

function setArchiveDecade(decade, btn) {
  archiveDecadeFilter = decade;
  document.querySelectorAll('.arch-decade').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderArchive();
}
function setArchiveCountry(cc, btn) {
  archiveCountryFilter = cc;
  document.querySelectorAll('.arch-country').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderArchive();
}

function renderArchive() {
  const list   = document.getElementById('archive-list');
  if (!list) return;
  const cnt    = document.getElementById('arch-count');
  const q      = ((document.getElementById('archive-search') || {}).value || '').toLowerCase().trim();
  const decadeOf = y => y >= 2020 ? '2020s' : y >= 2010 ? '2010s' : y >= 2000 ? '2000s' : y >= 1990 ? '1990s' : '1980s';
  const nr_lbl   = lang === 'en' ? 'Annual Conference' : 'Jahrestagung';
  const papers_lbl = lang === 'en' ? 'Selected Papers' : 'Beitr\u00e4ge';
  const venue_lbl  = lang === 'en' ? 'Venue' : 'Tagungsort';
  const pending    = lang === 'en' ? 'Forthcoming' : 'Angek\u00fcndigt';
  const no_papers  = lang === 'en' ? 'Programme details to be added.' : 'Programm wird erg\u00e4nzt.';
  const no_covid   = lang === 'en' ? '(No conference in 2020 due to COVID-19)' : '(2020 entf\u00e4llt aufgrund von COVID-19)';
  const speaker_match_lbl = lang === 'en' ? 'Speaker match' : 'Referent';

  const filtered = ARCHIVE.filter(c => {
    if (archiveDecadeFilter !== 'all' && decadeOf(c.year) !== archiveDecadeFilter) return false;
    if (archiveCountryFilter !== 'all' && c.country !== archiveCountryFilter) return false;
    if (q) {
      const theme    = (lang === 'en' ? c.theme_en : c.theme).toLowerCase();
      const loc      = (lang === 'en' ? c.loc_en   : c.loc_de).toLowerCase();
      const venue_s  = (c.venue || '').toLowerCase();
      const paper_tx = (c.papers || []).map(p => p.author + ' ' + p.title + ' ' + (p.inst||'')).join(' ').toLowerCase();
      if (!theme.includes(q) && !loc.includes(q) && !venue_s.includes(q) &&
          !String(c.year).includes(q) && !paper_tx.includes(q)) return false;
    }
    return true;
  });

  if (cnt) cnt.textContent = filtered.length + ' / ' + ARCHIVE.length;
  if (!filtered.length) { list.innerHTML = '<div class="pub-no-results">Keine Tagungen gefunden / No conferences found</div>'; return; }

  const years = filtered.map(c => c.year);
  const show2020 = (!q || q === '') && archiveDecadeFilter !== '1980s' && archiveDecadeFilter !== '1990s' && archiveDecadeFilter !== '2000s' && years.includes(2021);

  let html = '';
  filtered.forEach((c, i) => {
    const theme   = lang === 'en' ? c.theme_en : c.theme;
    const loc     = lang === 'en' ? c.loc_en   : c.loc_de;
    const papers  = c.papers || [];
    const volBadge = c.vol
      ? '<span class="badge badge-blue" style="font-size:10px;margin-left:8px;">\u2192 Band ' + c.vol + '</span>'
      : (c.vol === null && c.nr >= 43 ? '<span class="badge" style="background:var(--gold-light);color:#7A6000;font-size:10px;margin-left:8px;">' + pending + '</span>' : '');
    const countryFlag = { DE:'\uD83C\uDDE9\uD83C\uDDEA', AT:'\uD83C\uDDE6\uD83C\uDDF9', CH:'\uD83C\uDDE8\uD83C\uDDED', UK:'\uD83C\uDDEC\uD83C\uDDE7', NL:'\uD83C\uDDF3\uD83C\uDDF1', INT:'\uD83C\uDF10' }[c.country] || '';
    const hasVenue = c.venue && c.venue !== c.loc_de && c.venue !== c.loc_en;

    // Highlight matching papers when searching
    let papersHtml;
    if (!papers.length) {
      papersHtml = '<div style="font-size:13px;color:var(--text-faint);font-style:italic;padding:8px 0;">' + no_papers + '</div>';
    } else {
      const matchingOnly = q && papers.some(p =>
        (p.author + ' ' + p.title + ' ' + (p.inst||'')).toLowerCase().includes(q));
      papersHtml = papers
        .filter(p => !matchingOnly || (p.author + ' ' + p.title + ' ' + (p.inst||'')).toLowerCase().includes(q))
        .map(p => {
          const matchNote = matchingOnly ? '<span style="font-size:10px;background:var(--gold-light);color:var(--gold);padding:1px 5px;border-radius:3px;margin-left:4px;">' + speaker_match_lbl + '</span>' : '';
          const instNote  = p.inst ? '<span style="color:var(--text-faint);font-size:11px;"> · ' + p.inst + '</span>' : '';
          var discNote = p.discussant ? '<div style="font-size:11.5px;color:var(--text-faint);font-style:italic;margin-top:2px;">'+p.discussant+'</div>' : '';
        var absNote = p.abstract ? '<details style="margin-top:6px;"><summary style="font-size:11.5px;color:var(--accent);cursor:pointer;list-style:none;">&rsaquo; Abstract</summary><div style="font-size:12.5px;color:var(--text-muted);line-height:1.6;margin-top:6px;padding:10px 12px;background:var(--accent-pale);border-radius:6px;border-left:3px solid var(--accent);">'+p.abstract+'</div></details>' : '';
        return '<div class="archive-paper"><div>' + p.title + '</div><div class="archive-paper-author">' + p.author + instNote + matchNote + '</div>'+discNote+absNote+'</div>';
        }).join('');
    }

    html += '<div class="archive-item">'
      + '<div class="archive-head" onclick="toggleArchive(' + i + ')">'
      + '<div class="archive-year">' + c.year + '</div>'
      + '<div style="flex:1;min-width:0;">'
      + '<div style="font-size:11px;font-weight:600;color:var(--text-faint);letter-spacing:.06em;margin-bottom:2px;">'
      + c.nr + '. ' + nr_lbl + (c.dates && c.dates !== String(c.year) ? ' &nbsp;\u00b7&nbsp; <span style="font-weight:400;">' + c.dates + '</span>' : '')
      + '</div>'
      + '<div class="archive-theme">' + theme + volBadge + '</div>'
      + '<div class="archive-location">' + countryFlag + ' ' + loc
      + (hasVenue ? '<span style="font-size:11px;color:var(--text-faint);"> &nbsp;&middot; ' + c.venue + '</span>' : '')
      + '</div></div>'
      + '<button class="archive-toggle" id="archive-toggle-' + i + '">▾</button></div>'
      + '<div class="archive-body" id="archive-body-' + i + '">'
      + '<div class="archive-body-inner">'
      + '<div><div style="font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);margin-bottom:10px;">' + papers_lbl + (papers.length ? ' (' + papers.length + ')' : '') + '</div>'
      + '<div class="archive-papers-list">' + papersHtml + '</div></div>'
      + '</div></div></div>';

    if (show2020 && c.year === 2021) {
      html += '<div style="display:flex;align-items:center;gap:12px;padding:10px 16px;background:var(--gold-light);border:1px dashed #DDD0A0;border-radius:8px;font-size:13px;color:#7A5800;margin:4px 0;">'
        + '<span style="font-size:16px;">⚠\uFE0F</span><span>' + no_covid + '</span></div>';
    }
  });
  list.innerHTML = html;
}

function toggleArchive(i) {
  const body = document.getElementById('archive-body-' + i);
  const btn  = document.getElementById('archive-toggle-' + i);
  if (!body) return;
  const open = body.classList.toggle('open');
  btn.classList.toggle('open', open);
}

/* ── Publications data ── */
/* DH_SEARCH declared in agw_data.js — do NOT redeclare here */

let pubDecadeFilter = 'all';
let pubSearchQ = '';

/* ── Chapter data (populated entries; others show placeholder) ── */
const PUB_CHAPTERS = {
  'XLIII': [
    { author: 'Kerstin Dross-Kr\u00fcpe', title: 'Frauen und Wirtschaft in der r\u00f6mischen Antike' },
    { author: 'Charlotte Backerra', title: 'Regierende Frauen in der fr\u00fchen Neuzeit und ihre Wirtschaftskompetenz' },
    { author: 'Elisabeth Allgoewer', title: 'Frauen im Verein f\u00fcr Socialpolitik' },
    { author: 'Christian Kremser', title: 'Beatrice Webb (1858\u20131943) als \u00d6konomin' },
    { author: 'G\u00fcnther Chaloupek', title: 'Helene Bauer (1871\u20131942) \u2013 b\u00fcrgerliche und sozialistische \u00d6konomie' },
    { author: 'Reinhard Schumacher \u00b7 Svenja Flechtner \u00b7 Matthias St\u00f6rring', title: 'Charlotte Leubuscher (1888\u20131961)' },
    { author: 'Uwe Dathe \u00b7 Daniel Nientiedt', title: 'Edith Eucken (1896\u20131985)' },
    { author: 'Hans Frambach', title: 'Cl\u00e4re Tisch (1907\u20131941) \u2013 Leben und Werk' },
    { author: 'Harald Hagemann', title: 'Fanny Ginor (1911\u20132007): Die Basler National\u00f6konomie nach Israel getragen' },
    { author: 'Lachezar Grudev', title: 'Vera Smith (1912\u20131976). Eine mutige \u00d6konomin im Spannungsfeld dreier Welten' },
    { author: 'Bertram Schefold', title: 'Joan Robinson (1903\u20131983) \u2013 eine pers\u00f6nliche Charakterisierung' },
  ],
  'XLII': [
    { author: 'Karen Horn', title: 'Geschichte der Wirtschaftswissenschaften als interdisziplin\u00e4re Aufgabe: Ein \u00dcberblick \u00fcber die j\u00fcngere Adam-Smith-Forschung' },
    { author: 'Philipp Robinson R\u00f6ssner', title: 'Smith\u2019s Scotland. Contextualising the Wealth of Nations' },
    { author: 'Sabine F\u00f6llinger', title: 'Antike Philosophie im Denken von Adam Smith' },
    { author: 'Reinhard Schumacher', title: 'Die unterschiedlichen Ansichten Adam Smiths und David Humes \u00fcber wirtschaftliche Entwicklung und zwischenstaatliche Kriege' },
    { author: 'Ludwig Nellinger', title: 'Methodik und Erkenntnisfortschritt: Adam Smith und Johann Heinrich von Th\u00fcnen' },
    { author: 'Heinz D. Kurz', title: 'Smith, Marx und Schumpeter \u00fcber den Zivilisationsprozess' },
    { author: 'Reinhard Blomert', title: 'Adam Smith \u00fcber Gentlemen, Gesch\u00e4ftsleute und innere Richter' },
  ],
  'XLI': [
    { author: 'Elisabeth Allgoewer', title: 'Zur Gründungsgeschichte des Vereins für Socialpolitik' },
    { author: 'Volker Caspari', title: 'Methodenstreit und Werturteilsdebatte' },
    { author: 'Alexander Ebner', title: 'Schumpeter und der Verein für Socialpolitik' },
    { author: 'Tetsushi Harada', title: 'Rezeption der deutschen Sozialwissenschaften in Japan' },
    { author: 'Jan-Otmar Hesse', title: 'Wirtschaftswissenschaft in der Weimarer Republik' },
    { author: 'Hauke Janssen', title: 'Die Nationalökonomie im Nationalsozialismus' },
    { author: 'Bertram Schefold', title: 'Kontinuitäten und Brüche in der Theoriegeschichte des VfS' },
  ],
  'XXXI': [
    { author: 'Heinz D. Kurz', title: 'Geschichte der Entwicklungstheorien: Einleitung' },
    { author: 'N.N.', title: 'Friedrich List und die Historische Schule' },
    { author: 'N.N.', title: 'Werner Sombart und der technische Fortschritt' },
    { author: 'N.N.', title: 'Kumulatives Wachstum bei Myrdal und Krugman' },
  ],
  'XXIII': [
    { author: 'Elisabeth Allgoewer', title: 'Ökonomik und Technik: Einleitung' },
    { author: 'Christian Gehrke', title: 'Bortkiewicz und die Produktionstheorie' },
    { author: 'Harald Hagemann', title: 'Technischer Wandel in der ökonomischen Theorie' },
    { author: 'Heinz D. Kurz', title: 'Sraffa und die Produktion von Waren durch Waren' },
    { author: 'Helge Peukert', title: 'Schumpeter über Innovation und Konjunktur' },
    { author: 'Dieter Schneider', title: 'Investitionstheorie und technischer Fortschritt' },
  ],
  'IV': [
    { author: 'Harald Scherf (Hrsg.)', title: 'Drei Jubiläen (1983): Einleitung' },
    { author: 'N.N.', title: 'Karl Marx: 100 Jahre Kapital-Vollendung' },
    { author: 'N.N.', title: 'Joseph Schumpeter: Theorien und Erbe' },
    { author: 'N.N.', title: 'John Maynard Keynes: Allgemeine Theorie revisited' },
  ],
};

/* ── Citation state ── */
const pubCiteFormat = {};

function filterPubDecade(decade, btn) {
  pubDecadeFilter = decade;
  document.querySelectorAll('.pub-filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  renderPubs();
}

function filterPubs(q) { pubSearchQ = q.toLowerCase(); renderPubs(); }

/* ── Citation generation ── */
function parseEditorBibtex(edStr) {
  const clean = edStr.replace(/^hrsg\. v\. /i, '').trim();
  return clean.split(/\s+und\s+/i).map(e => {
    const pts = e.trim().split(/\s+/);
    if (pts.length < 2) return e.trim();
    return pts[pts.length - 1] + ', ' + pts.slice(0, -1).join(' ');
  }).join(' and ');
}

function generateCitation(pub, fmt) {
  const edRaw = pub.editor.replace(/^hrsg\. v\. /i, '').trim();
  const edBib = edRaw ? parseEditorBibtex(pub.editor) : '';
  const title = pub.title_de;
  const year = pub.year ? String(pub.year) : 'o.J.';
  const vol = pub.num;
  const key = `SVfS_115_${vol}`;
  const series = 'Schriften des Vereins für Socialpolitik';
  const fullTitle = `Studien zur Entwicklung der ökonomischen Theorie ${vol}`;

  if (fmt === 'bibtex') {
    const edLine = edBib ? `  editor    = {${edBib}},\n` : '';
    return `@book{${key},\n${edLine}  title     = {${title}},\n  booktitle = {${fullTitle}},\n  series    = {${series}},\n  volume    = {115/${vol}},\n  publisher = {Duncker {\\&} Humblot},\n  address   = {Berlin},\n  year      = {${year}},\n}`;
  }
  if (fmt === 'endnote') {
    const edLine = edRaw ? `%E ${edRaw}\n` : '';
    return `%0 Edited Book\n%T ${title}\n${edLine}%D ${year}\n%I Duncker & Humblot\n%C Berlin\n%S ${series}\n%V 115/${vol}\n%! ${fullTitle}`;
  }
  if (fmt === 'ris') {
    const edLines = edRaw ? edRaw.split(/ und /i).map(e => `ED  - ${e.trim()}`).join('\n') + '\n' : '';
    return `TY  - BOOK\nTI  - ${title}\n${edLines}PY  - ${year}\nPB  - Duncker & Humblot\nCY  - Berlin\nT3  - ${series}\nVL  - 115/${vol}\nER  - `;
  }
  if (fmt === 'chicago') {
    const edChicago = edRaw || '[Hrsg.]';
    return `${edChicago}, Hrsg. ${title}. ${fullTitle}. ${series} 115/${vol}. Berlin: Duncker & Humblot, ${year}.`;
  }
  return '';
}

function switchCiteTab(num, fmt) {
  pubCiteFormat[num] = fmt;
  document.querySelectorAll(`.cite-tab-${CSS.escape(num)}`).forEach(t =>
    t.classList.toggle('active', t.dataset.fmt === fmt));
  const pub = PUBLICATIONS.find(p => p.num === num);
  const el = document.getElementById(`cite-preview-${num}`);
  if (el && pub) el.value = generateCitation(pub, fmt);
}

function downloadCite(num) {
  const fmt = pubCiteFormat[num] || 'bibtex';
  const pub = PUBLICATIONS.find(p => p.num === num);
  if (!pub) return;
  const text = generateCitation(pub, fmt);
  const ext = { bibtex: 'bib', endnote: 'enw', ris: 'ris', chicago: 'txt' }[fmt] || 'txt';
  const fname = `AGW_SVfS_115_${num}.${ext}`;
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = fname; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function copyCite(num) {
  const fmt = pubCiteFormat[num] || 'bibtex';
  const pub = PUBLICATIONS.find(p => p.num === num);
  if (!pub) return;
  const text = generateCitation(pub, fmt);
  navigator.clipboard.writeText(text).then(() => {
    const conf = document.getElementById(`copy-conf-${num}`);
    if (conf) { conf.classList.add('show'); setTimeout(() => conf.classList.remove('show'), 1800); }
  });
}

function togglePub(num) {
  const wrap = document.getElementById(`pub-wrap-${num}`);
  const detail = document.getElementById(`pub-detail-${num}`);
  const btn = document.getElementById(`pub-expand-${num}`);
  if (!wrap || !detail || !btn) return;
  const isOpen = detail.classList.contains('open');
  detail.classList.toggle('open', !isOpen);
  btn.classList.toggle('open', !isOpen);
  wrap.classList.toggle('open', !isOpen);
}

function renderPubs() {
  const list = document.getElementById('pub-list');
  if (!list) return;
  const note = document.getElementById('pub-count-note');
  const band_lbl = lang === 'de' ? 'Band 115/' : 'Vol. 115/';
  const view_lbl = lang === 'de' ? 'Verlag <span class="ico ico-ext" aria-hidden="true"></span>' : 'Publisher <span class="ico ico-ext" aria-hidden="true"></span>';
  const cite_lbl = lang === 'de' ? 'Zitieren' : 'Cite';
  const toc_lbl = lang === 'de' ? 'Inhalt' : 'Contents';
  const no_toc = lang === 'de'
    ? 'Inhaltsverzeichnis wird ergänzt.'
    : 'Table of contents to be added.';

  const filtered = PUBLICATIONS.filter(p => {
    if (pubDecadeFilter !== 'all' && p.decade !== pubDecadeFilter) return false;
    if (pubSearchQ) {
      const t = (lang === 'de' ? p.title_de : p.title_en).toLowerCase();
      if (!t.includes(pubSearchQ) && !p.editor.toLowerCase().includes(pubSearchQ)
          && !p.num.toLowerCase().includes(pubSearchQ)) return false;
    }
    return true;
  });

  if (!filtered.length) {
    list.innerHTML = '<div class="pub-no-results">Keine Bände gefunden / No volumes found</div>';
    note.textContent = ''; return;
  }

  const total_note = lang === 'de'
    ? `${filtered.length} von ${PUBLICATIONS.length} Bänden · Vollständige Liste beim Verlag Duncker & Humblot. Bände ohne Jahreszahl: Erscheinungsjahr wird ergänzt.`
    : `${filtered.length} of ${PUBLICATIONS.length} volumes · Full list at Duncker & Humblot. Volumes without year: publication date to be confirmed.`;
  note.textContent = total_note;

  list.innerHTML = '<div class="pub-list-inner">' + filtered.map(p => {
    const title  = lang === 'de' ? p.title_de : p.title_en;
    const yr     = p.year ? ` · ${p.year}` : '';
    const edHtml = p.editor ? ` · <em>${p.editor}</em>` : '';
    const num    = p.num;
    const activeFmt = pubCiteFormat[num] || 'bibtex';

    /* — Chapter list — */
    const chaps = PUB_CHAPTERS[num];
    const chapHtml = chaps
      ? chaps.map(c => `<div class="pub-chapter">
          <span class="pub-chapter-author">${c.author}</span>
          <span class="pub-chapter-title">${c.title}</span>
          ${c.pages ? `<span class="pub-chapter-pages">S. ${c.pages}</span>` : ''}
        </div>`).join('')
      : `<div class="pub-toc-placeholder">${no_toc}</div>`;

    /* — Citation tabs — */
    const tabsHtml = FMTS.map(f =>
      `<button class="cite-tab cite-tab-${num}${f.id === activeFmt ? ' active' : ''}"
        data-fmt="${f.id}"
        onclick="event.stopPropagation();switchCiteTab('${num}','${f.id}')">${f.label}</button>`
    ).join('');

    const prevVal = generateCitation(p, activeFmt).replace(/</g,'&lt;').replace(/>/g,'&gt;');
    const dl_lbl  = lang === 'de' ? 'Herunterladen' : 'Download';
    const cp_lbl  = lang === 'de' ? 'Kopieren' : 'Copy';

    return `
<div class="pub-item-wrap" id="pub-wrap-${num}">
  <div class="pub-item" onclick="togglePub('${num}')">
    <div>
      <div class="pub-vol">${num}</div>
      <div class="pub-vol-sub">${band_lbl}${num}</div>
    </div>
    <div>
      <div class="pub-title">${title}</div>
      <div class="pub-meta"><em>Schriften des Vereins für Socialpolitik</em>${edHtml}${yr} · Duncker &amp; Humblot, Berlin</div>
    </div>
    <div class="pub-actions" onclick="event.stopPropagation()">
      ${p.econstor ? `<a href="${p.econstor}" target="_blank" rel="noopener" style="background:#2E7D32;color:#fff;font-size:11px;padding:4px 10px;border-radius:4px;text-decoration:none;font-weight:600;margin-right:6px;"><span class="ico ico-oa" aria-hidden="true"></span> Open Access <span class="ico ico-ext" aria-hidden="true"></span></a> ` : ""}      <a href="${p.url}" target="_blank" rel="noopener" class="pub-link">${view_lbl}</a>
      <button class="pub-expand-btn" id="pub-expand-${num}"
        onclick="event.stopPropagation();togglePub('${num}')" aria-label="expand">▾</button>
    </div>
  </div>
  <div class="pub-detail" id="pub-detail-${num}">
    <div class="pub-detail-inner">
      <div class="pub-detail-left">
        <div class="pub-detail-sec-lbl">${toc_lbl}</div>
        <div class="pub-chapter-list">${chapHtml}</div>
      </div>
      <div class="pub-detail-right">
        <div class="pub-detail-sec-lbl">${cite_lbl}</div>
        <div class="cite-tabs">${tabsHtml}</div>
        <textarea class="cite-preview" id="cite-preview-${num}"
          readonly onclick="event.stopPropagation()">${generateCitation(p, activeFmt)}</textarea>
        <div class="cite-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();downloadCite('${num}')">
            ↓ ${dl_lbl}
          </button>
          <button class="btn btn-sm btn-outline" onclick="event.stopPropagation();copyCite('${num}')">
            ${cp_lbl}
          </button>
          <span class="copy-confirm" id="copy-conf-${num}"><span class="ico ico-check" aria-hidden="true"></span> ${lang === 'de' ? 'Kopiert' : 'Copied'}</span>
        </div>
      </div>
    </div>
  </div>
</div>`;
  }).join('') + '</div>';
}

/* ── Init ── */
renderChairs();
renderMembers(MEMBERS);
renderArchive();
renderPubs();
renderAnnouncements();
updateCountdown();
initLang();
  addSessionIcalBtns(); // Apply saved/auto-detected language preference
/* ── Logistik map (Leaflet.js, no API key) ── */
var _mapInitialised = false;
function initLogistikMap() {
  if (_mapInitialised) return;
  var el = document.getElementById('logistik-map');
  if (!el) return;
  _mapInitialised = true;

  var map = L.map('logistik-map', { scrollWheelZoom: false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18
  }).addTo(map);

  function mkIcon(bg, emoji) {
    return L.divIcon({
      html: '<div style="width:30px;height:30px;background:'+bg+';border-radius:50%;border:2.5px solid #fff;'
          + 'box-shadow:0 2px 6px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;'
          + 'font-size:13px;line-height:1;">'+emoji+'</div>',
      iconSize:[30,30], iconAnchor:[15,15], popupAnchor:[0,-18], className:''
    });
  }

  var G='#B8860B', B='#3A6BAF', R='#C0392B', GR='#27AE60', P='#8E44AD';

  var pts = [
    [45.9040, 8.9703, G,  '\uD83C\uDF93',
      '<strong>Steger Center (Tagungsort)</strong><br>Villa Maderni, Via Settala 8<br>'
     +'Riva San Vitale<br><small>10\u201312 Min. Fussweg vom Bahnhof Capolago</small>'],
    [46.0048, 8.9533, R,  '\uD83C\uDF7D',
      '<strong>Ristorante Trattoria Galleria</strong><br>Via Giosu\u00e8 Carducci 4, Lugano<br>'
     +'<small>Willkommensnachtessen, Do 25. Juni, 19:30</small>'],
    [46.0044, 8.9497, B,  '\uD83C\uDFE8',
      '<strong>Hotel Dante</strong><br>Piazza Cioccaro 5, Lugano<br>'
     +'<small>Funicolare direkt vor der T\u00fcr \u00b7 5\u00a0Min. zur Trattoria Galleria</small>'],
    [46.0028, 8.9504, B,  '\uD83C\uDFE8',
      '<strong>Hotel Walter au Lac</strong><br>Riva Caccia 1, Lugano<br>'
     +'<small>Seelage, 10\u00a0Min. Fussweg zum HB Lugano</small>'],
    [46.0003, 8.9491, B,  '\uD83C\uDFE8',
      '<strong>Hotel Internationale</strong><br>Via Nassa 68, Lugano<br>'
     +'<small>Fussg\u00e4ngerzone, 10\u00a0Min. zum HB Lugano</small>'],
    [45.9043, 8.9794, B,  '\uD83C\uDFE8',
      '<strong>Hotel Svizzero</strong><br>Capolago<br>'
     +'<small>Direkt am Bahnhof \u00b7 kein Zug zur Tagung n\u00f6tig</small>'],
    [45.9055, 8.9796, GR, '\uD83D\uDE89',
      '<strong>Bahnhof Capolago-Riva San Vitale</strong><br>'
     +'<small>TILO S10/S90: mehrmals pro Stunde ab HB Lugano (\u223015\u00a0Min.)<br>'
     +'Fr Abfahrt 08:06 \u00b7 Sa Abfahrt 08:36</small>'],
    [45.9035, 8.9778, P,  '\uD83D\uDE9F',
      '<strong>Ferrovia Monte Generoso</strong><br>Capolago<br>'
     +'<small>Zahnradbahn zum Gipfel (1704\u00a0m), seit 1890<br>'
     +'Gruppenausflug Sa 27.\u00a0Juni, ab 13:00</small>'],
    [45.9830, 8.9189, P,  '\uD83C\uDFD4',
      '<strong>Museo Hermann Hesse</strong><br>Torre Camuzzi, Montagnola<br>'
     +'<small>Partnerprogramm \u00b7 Mit Ticino Ticket gratis</small>'],
    [46.0092, 8.9862, P,  '\uD83D\uDE9F',
      '<strong>Funicolare Monte Br\u00e8</strong><br>Cassarate, Lugano<br>'
     +'<small>Partnerprogramm \u00b7 Bus 12 ab HB Lugano</small>'],
  ];

  var bounds = [];
  pts.forEach(function(p) {
    L.marker([p[0],p[1]], {icon: mkIcon(p[2],p[3])})
      .addTo(map).bindPopup(p[4], {maxWidth:230});
    bounds.push([p[0],p[1]]);
  });
  map.fitBounds(bounds, {padding:[36,36]});
}

// Lazy-init: trigger when map div enters viewport
(function() {
  var el = document.getElementById('logistik-map');
  if (!el) return;
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function(entries, obs) {
      if (entries[0].isIntersecting) { initLogistikMap(); obs.disconnect(); }
    }, {threshold: 0.1}).observe(el);
  } else {
    initLogistikMap();
  }
})();
/* ── iCal download ── */
function downloadIcal(){
  var R='\r\n';
  var t=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//AGW VfS//JT2026//DE','CALSCALE:GREGORIAN','METHOD:PUBLISH',
    'BEGIN:VEVENT','UID:agw2026-main@agw-vfs.de','DTSTART;VALUE=DATE:20260625','DTEND;VALUE=DATE:20260628',
    'SUMMARY:AGW 46. Jahrestagung 2026','LOCATION:Steger Center\\, Via Settala 8\\, Riva San Vitale',
    'URL:https://david-bieri.github.io/agw-vfs/','END:VEVENT',
    'BEGIN:VEVENT','UID:agw2026-thu@agw-vfs.de','DTSTART:20260625T173000Z','DTEND:20260625T210000Z',
    'SUMMARY:AGW 2026 - Willkommensabendessen (Trattoria Galleria\\, Lugano)',
    'LOCATION:Ristorante Trattoria Galleria\\, Via Giosu\u00e8 Carducci 4\\, Lugano','END:VEVENT',
    'BEGIN:VEVENT','UID:agw2026-fri@agw-vfs.de','DTSTART:20260626T070000Z','DTEND:20260626T193000Z',
    'SUMMARY:AGW 2026 - Programm Tag 1 + Apericena & Abendvortrag (Schefold)','LOCATION:Steger Center\\, Riva San Vitale','END:VEVENT',
    'BEGIN:VEVENT','UID:agw2026-sat@agw-vfs.de','DTSTART:20260627T071500Z','DTEND:20260627T150000Z',
    'SUMMARY:AGW 2026 - Programm Tag 2 + Monte Generoso','LOCATION:Steger Center\\, Riva San Vitale','END:VEVENT',
    'END:VCALENDAR'].join(R);
  var blob=new Blob([t],{type:'text/calendar;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='AGW-Jahrestagung-2026.ics';a.click();
  URL.revokeObjectURL(url);
}

/* ── Countdown card ── */
function updateCountdown(){
  var el = document.getElementById('countdown-card');
  if (!el) return;

  var target = new Date('2026-06-25T09:00:00+02:00');
  var endDt  = new Date('2026-06-27T18:00:00+02:00');
  var now    = new Date();
  var isDE   = lang === 'de';

  // After conference: hide entirely
  if (now >= endDt) { el.style.display = 'none'; return; }
  el.style.display = '';

  var eyebrow = isDE
    ? '46. Jahrestagung · Riva San Vitale'
    : '46th Annual Meeting · Riva San Vitale';
  var footer  = isDE ? '25.–27. Juni 2026' : '25–27 June 2026';

  // During conference: pulsing live indicator
  if (now >= target) {
    var inProgress = isDE ? 'Tagung läuft gerade' : 'Conference in progress';
    el.innerHTML =
      '<div class="countdown-eyebrow">' + eyebrow + '</div>' +
      '<div class="countdown-live">' +
        '<span class="countdown-live-dot"></span>' +
        '<span class="countdown-live-text">' + inProgress + '</span>' +
      '</div>' +
      '<div class="countdown-footer">' + footer + '</div>';
    return;
  }

  // Before conference: D : H : M
  var ms = target - now;
  var days    = Math.floor(ms / 86400000);
  var hours   = Math.floor((ms % 86400000) / 3600000);
  var minutes = Math.floor((ms % 3600000) / 60000);
  var pad = function(n) { return n < 10 ? '0' + n : String(n); };

  var lbl_d = isDE ? (days    === 1 ? 'Tag'    : 'Tage') : (days    === 1 ? 'Day'  : 'Days');
  var lbl_h = isDE ? 'Std.' : (hours   === 1 ? 'Hour' : 'Hrs');
  var lbl_m = isDE ? 'Min.' : 'Min';

  el.innerHTML =
    '<div class="countdown-eyebrow">' + eyebrow + '</div>' +
    '<div class="countdown-numbers">' +
      '<div class="countdown-unit-block">' +
        '<div class="countdown-num">' + days + '</div>' +
        '<div class="countdown-label">' + lbl_d + '</div>' +
      '</div>' +
      '<div class="countdown-sep">:</div>' +
      '<div class="countdown-unit-block">' +
        '<div class="countdown-num">' + pad(hours) + '</div>' +
        '<div class="countdown-label">' + lbl_h + '</div>' +
      '</div>' +
      '<div class="countdown-sep">:</div>' +
      '<div class="countdown-unit-block">' +
        '<div class="countdown-num">' + pad(minutes) + '</div>' +
        '<div class="countdown-label">' + lbl_m + '</div>' +
      '</div>' +
    '</div>' +
    '<div class="countdown-footer">' + footer + '</div>';
}
setInterval(updateCountdown, 30000);

/* ── Back to top ── */
window.addEventListener('scroll',function(){
  document.getElementById('back-top').classList.toggle('visible',window.scrollY>400);
},{passive:true});

/* ── QR code ── */
(function(){
  var el=document.getElementById('footer-qr');
  if(!el||typeof QRCode==='undefined')return;
  new QRCode(el,{text:'https://david-bieri.github.io/agw-vfs/',
    width:88,height:88,colorDark:'#1B3A6B',colorLight:'#ffffff',
    correctLevel:QRCode.CorrectLevel.M});
})();

/* ── Archive view tabs ── */
var _archMapDone=false;
var _chronikDone=false;
function setArchiveView(view,btn){
  ['list','map','speakers','chronik'].forEach(function(v){
    document.getElementById('arch-view-'+v).style.display=v===view?'':'none';
  });
  document.querySelectorAll('.arch-view-btn').forEach(function(b){b.classList.remove('active');});
  btn.classList.add('active');
  if(view==='map'&&!_archMapDone){initArchiveMap();_archMapDone=true;}
  if(view==='speakers'){buildSpeakerStats();}
  if(view==='chronik'&&!_chronikDone){initChronik('arch-view-chronik');_chronikDone=true;}
}

/* ── Archive location map ── */
function initArchiveMap(){
  var el=document.getElementById('archive-location-map');
  if(!el||typeof L==='undefined')return;
  var map=L.map('archive-location-map',{scrollWheelZoom:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
    attribution:'\u00a9 <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:18
  }).addTo(map);
  var groups={};
  ARCHIVE.forEach(function(c){
    if(c.country==='INT')return;
    var k=c.loc_de;
    if(!groups[k])groups[k]={years:[],nrs:[],country:c.country};
    groups[k].years.push(c.year);groups[k].nrs.push(c.nr);
  });
  var bounds=[];
  Object.keys(groups).forEach(function(loc){
    var coords=null;
    if(VENUE_COORDS[loc])coords=VENUE_COORDS[loc];
    else{var k=Object.keys(VENUE_COORDS).find(function(k){return loc.indexOf(k)>=0||k.indexOf(loc)>=0;});if(k)coords=VENUE_COORDS[k];}
    if(!coords)return;
    var cnt=groups[loc].years.length,sz=cnt>2?38:28;
    var ic=L.divIcon({html:'<div style="width:'+sz+'px;height:'+sz+'px;background:var(--navy);border-radius:50%;border:2.5px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;color:#fff;font-size:'+(cnt>1?'11':'0')+'px;font-weight:700;">'+(cnt>1?cnt:'')+'</div>',iconSize:[sz,sz],iconAnchor:[sz/2,sz/2],popupAnchor:[0,-sz/2],className:''});
    var yhtml=groups[loc].nrs.map(function(n,i){return n+'. JT ('+groups[loc].years[i]+')';}).join('<br>');
    L.marker(coords,{icon:ic}).addTo(map).bindPopup('<strong>'+loc+'</strong><br><small>'+yhtml+'</small>',{maxWidth:180});
    bounds.push(coords);
  });
  if(bounds.length)map.fitBounds(bounds,{padding:[20,20]});
}

/* ── Speaker frequency ── */
function buildSpeakerStats(){
  var el=document.getElementById('speaker-freq-table');
  if(!el)return;
  var freq={};
  ARCHIVE.forEach(function(c){
    (c.papers||[]).forEach(function(p){
      p.author.split(/[\u00b7,]+/).forEach(function(raw){
        var name=raw.replace(/\s*\([^)]+\)\s*/g,'').trim();
        if(name.length<4)return;
        if(!freq[name])freq[name]=[];
        freq[name].push({year:c.year,nr:c.nr});
      });
    });
  });
  var sorted=Object.keys(freq).filter(function(n){return freq[n].length>=2;})
    .sort(function(a,b){return freq[b].length-freq[a].length;});
  var isDE=lang==='de';
  var rows=sorted.slice(0,25).map(function(name,i){
    var c=freq[name];
    var tags=c.map(function(x){return '<span style="font-size:11px;background:var(--border-light);color:var(--text-muted);padding:1px 6px;border-radius:3px;margin:1px;display:inline-block;">'+x.year+'</span>';}).join('');
    return '<tr><td style="color:var(--text-faint);font-size:12px;padding:8px 10px;">'+(i+1)+'.</td>'
      +'<td style="padding:8px 10px;"><strong>'+name+'</strong><div style="margin-top:4px;">'+tags+'</div></td>'
      +'<td style="padding:8px 10px;text-align:center;"><span style="background:var(--navy);color:#fff;font-size:11px;font-weight:700;padding:2px 7px;border-radius:10px;">'+c.length+'</span></td></tr>';
  }).join('');
  el.innerHTML='<p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">'
    +(isDE?'Referentinnen und Referenten mit mind. 2 Beitr\u00e4gen (aus dokumentierten Tagungen).':'Speakers with at least 2 contributions (from documented conferences).')
    +'</p><table style="width:100%;border-collapse:collapse;font-size:13.5px;">'
    +'<thead><tr>'
    +'<th style="text-align:left;padding:7px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);border-bottom:2px solid var(--border);width:28px;">#</th>'
    +'<th style="text-align:left;padding:7px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);border-bottom:2px solid var(--border);">'+(isDE?'Referent/in':'Speaker')+'</th>'
    +'<th style="text-align:center;padding:7px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);border-bottom:2px solid var(--border);width:64px;">'+(isDE?'Vortr\u00e4ge':'Papers')+'</th>'
    +'</tr></thead><tbody>'+rows+'</tbody></table>';
}

/* ── Global search ── */
function openSearch(){
  document.getElementById('search-overlay').classList.add('open');
  setTimeout(function(){document.getElementById('search-input').focus();},50);
  document.body.style.overflow='hidden';
}
function closeSearch(){
  document.getElementById('search-overlay').classList.remove('open');
  document.getElementById('search-input').value='';
  document.getElementById('search-results').innerHTML='<div class="srch-empty">'+(lang==='de'?'Suchbegriff eingeben\u2026':'Start typing\u2026')+'</div>';
  document.body.style.overflow='';
}
document.addEventListener('keydown',function(e){
  if((e.ctrlKey||e.metaKey)&&e.key==='k'){e.preventDefault();openSearch();}
  if(e.key==='Escape'&&document.getElementById('search-overlay').classList.contains('open'))closeSearch();
});
function runSearch(q){
  q=q.trim().toLowerCase();
  var el=document.getElementById('search-results');
  if(q.length<2){el.innerHTML='<div class="srch-empty">'+(lang==='de'?'Mind. 2 Zeichen\u2026':'Min. 2 characters\u2026')+'</div>';return;}
  var results=[];
  MEMBERS.filter(function(m){return(m.name+' '+m.inst+' '+(lang==='de'?m.focus_de:m.focus_en)).toLowerCase().includes(q);}).slice(0,4).forEach(function(m){
    results.push({sec:'mitglieder',icon:'<span class="ico ico-user" aria-hidden="true"></span>',title:m.name,sub:m.title+' \u00b7 '+m.inst,href:'#mitglieder'});
  });
  ARCHIVE.filter(function(c){
    return(lang==='de'?c.theme:c.theme_en).toLowerCase().includes(q)||(lang==='de'?c.loc_de:c.loc_en).toLowerCase().includes(q)||(c.papers||[]).map(function(p){return p.author+' '+p.title;}).join(' ').toLowerCase().includes(q)||String(c.year).includes(q);
  }).slice(0,5).forEach(function(c){
    results.push({sec:'archiv',icon:'<span class="ico ico-cal" aria-hidden="true"></span>',title:c.year+' \u2014 '+(lang==='de'?c.loc_de:c.loc_en),sub:(lang==='de'?c.theme:c.theme_en).substring(0,60),href:'#archiv'});
  });
  PUBLICATIONS.filter(function(p){return(p.title_de+' '+p.title_en+' '+p.editor+' '+p.num).toLowerCase().includes(q);}).slice(0,4).forEach(function(p){
    results.push({sec:'publikationen',icon:'<span class="ico ico-book" aria-hidden="true"></span>',title:'Band '+p.num+' \u00b7 '+(lang==='de'?p.title_de:p.title_en).substring(0,50),sub:p.editor||'',href:'#publikationen'});
  });
  if(!results.length){el.innerHTML='<div class="srch-empty">'+(lang==='de'?'Keine Ergebnisse.':'No results.')+'</div>';return;}
  var labs={mitglieder:lang==='de'?'Mitglieder':'Members',archiv:lang==='de'?'Archiv':'Archive',publikationen:lang==='de'?'Publikationen':'Publications'};
  var grps={},ord=[];
  results.forEach(function(r){if(!grps[r.sec]){grps[r.sec]=[];ord.push(r.sec);}grps[r.sec].push(r);});
  el.innerHTML=ord.map(function(s){return '<div class="srch-group">'+labs[s]+'</div>'+grps[s].map(function(r){return '<div class="srch-item" onclick="closeSearch();location.hash=\''+r.href.slice(1)+'\'">'+'<div class="srch-icon">'+r.icon+'</div>'+'<div><div class="srch-title">'+r.title+'</div>'+(r.sub?'<div class="srch-sub">'+r.sub+'</div>':'')+'</div></div>';}).join('');}).join('');
}

/* ── News feed ── */
function renderAnnouncements(){
  var el=document.getElementById('news-list');if(!el)return;
  el.innerHTML=ANNOUNCEMENTS.map(function(a){
    var d=new Date(a.date);
    var fmt=d.toLocaleDateString(lang==='de'?'de-DE':'en-GB',{day:'numeric',month:'long',year:'numeric'});
    return '<div style="padding:16px 0;border-bottom:1px solid var(--border-light);">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'
      +'<span style="font-size:16px;">'+a.icon+'</span>'
      +'<span style="font-size:11.5px;font-weight:600;letter-spacing:.06em;color:var(--text-faint);text-transform:uppercase;">'+fmt+'</span></div>'
      +'<div style="font-size:15px;font-weight:600;color:var(--text-dark);margin-bottom:4px;font-family:\'EB Garamond\',serif;">'+(lang==='de'?a.title_de:a.title_en)+'</div>'
      +'<div style="font-size:13.5px;color:var(--text-muted);line-height:1.55;">'+(lang==='de'?a.text_de:a.text_en)+'</div>'
      +'</div>';
  }).join('');
}
/* ── PWA: register service worker ── */
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/agw-vfs/service-worker.js',{scope:'/agw-vfs/'})
      .then(function(reg){ console.log('SW registered:', reg.scope); })
      .catch(function(e){ /* SW unavailable on this context */ });
  });
}
/* ── Per-session iCal ── */
function _sessionIcal(date, startZ, endZ, title, speaker) {
  var R='\r\n';
  var ical='BEGIN:VCALENDAR'+R+'VERSION:2.0'+R+'PRODID:-//AGW//JT2026//DE'+R
    +'BEGIN:VEVENT'+R
    +'UID:agw2026-'+date+'-'+startZ+'@agw-vfs.de'+R
    +'DTSTART:'+date+'T'+startZ+'Z'+R+'DTEND:'+date+'T'+endZ+'Z'+R
    +'SUMMARY:AGW 2026 \u2014 '+title.replace(/,/g,'\\\\,').replace(/\n/g,' ').substring(0,80)+R
    +(speaker?'DESCRIPTION:'+speaker.replace(/,/g,'\\\\,').replace(/\n/g,' ').substring(0,200)+R:'')
    +'LOCATION:Virginia Tech Steger Center\\\\, Via Settala 8\\\\, Riva San Vitale'+R
    +'END:VEVENT'+R+'END:VCALENDAR';
  var blob=new Blob([ical],{type:'text/calendar;charset=utf-8'});
  var url=URL.createObjectURL(blob);
  var a=document.createElement('a');
  a.href=url;a.download='AGW-Session.ics';a.click();URL.revokeObjectURL(url);
}

function addSessionIcalBtns() {
  [['day-fr','20260626'],['day-sa','20260627']].forEach(function(pair) {
    var dayEl=document.getElementById(pair[0]);
    if(!dayEl)return;
    dayEl.querySelectorAll('.tl-item.highlight, .tl-item.memorial').forEach(function(item) {
      var timeEl=item.querySelector('.tl-time');
      var titleEl=item.querySelector('.tl-title');
      var spEl=item.querySelector('.tl-speaker');
      if(!timeEl||!titleEl)return;
      var ts=timeEl.textContent.trim();
      var parts=ts.split(/[\u2013\-]/);
      if(parts.length<2)return;
      var s=parts[0].trim().replace(':','')+'00';
      var e=parts[1].trim().replace(':','')+'00';
      var sH=String(parseInt(s.substring(0,2))-2).padStart(2,'0')+s.substring(2);
      var eH=String(parseInt(e.substring(0,2))-2).padStart(2,'0')+e.substring(2);
      var title=titleEl.textContent.trim();
      var speaker=spEl?spEl.textContent.trim():'';
      var btn=document.createElement('button');
      btn.innerHTML='<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>';
      btn.title='Termin herunterladen (.ics)';
      btn.style.cssText='background:none;border:none;cursor:pointer;font-size:11px;padding:1px 4px;opacity:0.4;margin-left:6px;vertical-align:middle;';
      btn.addEventListener('mouseover',function(){this.style.opacity='1';});
      btn.addEventListener('mouseout',function(){this.style.opacity='0.4';});
      (function(d,s,e,t,sp){btn.onclick=function(){_sessionIcal(d,s,e,t,sp);};})(pair[1],sH,eH,title,speaker);
      titleEl.appendChild(btn);
    });
  });
}
