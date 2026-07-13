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
  renderEvents();
  renderNextEvent();
  renderGlance();
  renderCommitteeFacts();   // committee.html: chair name + live counts (null-guarded elsewhere)
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
  const chair_lbl = lang === 'en' ? ((AGW.S.mbr_chair && AGW.S.mbr_chair.en)    || 'Chair')     : 'Vorsitzende';
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
  const pending    = lang === 'en' ? 'Volume in preparation' : 'Band in Vorbereitung';
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

    html += '<div class="archive-item is-clickable">'
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
      + '<div class="archive-body-inner">' + (c.page ? '<a href="' + c.page + '" style="display:inline-block;margin-bottom:12px;font-size:12.5px;font-weight:600;color:var(--navy);text-decoration:none;">' + (lang === 'en' ? 'View conference page \u2192' : 'Zur Tagungsseite \u2192') + '</a>' : '')
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

/* ── Volume chapters (Tagungsband ToCs) ──────────────────────────────────────
 * The full ToC of all 43 volumes lives in agw_volume_chapters.js
 * (window.AGW_DATA.VOLUME_CHAPTERS, 288 chapters harvested from the D&H eLibrary
 * and cross-checked against the volume PDFs). This supersedes the old hand-made
 * PUB_CHAPTERS map, which covered 6 volumes with no page numbers and no links.
 *
 * Read LAZILY, inside the render function — never as a top-level const. agw_app.js
 * must not depend on another file's globals being defined at parse time (ADR-017:
 * a top-level reference to a later-loaded constant aborts the whole file silently).
 * If agw_volume_chapters.js is absent, chaptersFor() returns [] and the ToC falls
 * back to its placeholder — the page still renders.
 */
function escHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
function chaptersFor(num) {
  const all = (window.AGW_DATA && window.AGW_DATA.VOLUME_CHAPTERS) || [];
  return all.filter(c => c.vol === num);
}

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

    /* — Chapter list (harvested ToC) — */
    const chaps = chaptersFor(num);
    const pp_lbl = lang === 'de' ? 'S.' : 'pp.';
    const cite_lbl = (AGW.S.cite_title && AGW.S.cite_title[lang]) || 'Zitieren';
    const bib_lbl  = (AGW.S.cite_vol_bib && AGW.S.cite_vol_bib[lang]) || 'Band als BibTeX';
    const chapHtml = chaps.length
      ? chaps.map(c => {
          const t = escHtml(c.title);
          const title = c.url
            ? `<a class="pub-chapter-link" href="${escHtml(c.url)}" target="_blank" rel="noopener">${t}</a>`
            : t;
          return `<div class="pub-chapter">
          <span class="pub-chapter-author">${escHtml(c.authors)}</span>
          <span class="pub-chapter-title">${title}</span>
          <span class="pub-chapter-pages">${c.pages ? `${pp_lbl} ${escHtml(c.pages)}` : ''}
            <button class="cite-btn" data-cite="${c.volN}|${escHtml(c.pages)}"
                    title="${escHtml(cite_lbl)}">${escHtml(cite_lbl)}</button>
          </span>
        </div>`;
        }).join('')
      : `<div class="pub-toc-placeholder">${no_toc}</div>`;
    const volBib = chaps.length
      ? `<div class="pub-toc-actions"><button class="cite-btn cite-btn-vol"
           data-cite-all="vol:${escHtml(num)}">${escHtml(bib_lbl)}</button></div>`
      : '';

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
        <div class="pub-chapter-list">${chapHtml}</div>${volBib}
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

/* ── Home: Nächste Jahrestagung spotlight (guarded — index.html only) ── */
function renderNextEvent(){
  var el=document.getElementById('next-event'); if(!el) return;
  var de=(typeof lang==='undefined')?true:lang!=='en';
  var today=new Date(); today.setHours(0,0,0,0);
  var fmt=function(s,e){var so=new Date(s),eo=e?new Date(e):null,loc=de?'de-DE':'en-GB',opt={day:'numeric',month:'long',year:'numeric'};
    if(!eo||s===e)return so.toLocaleDateString(loc,opt);
    return so.toLocaleDateString(loc,{day:'numeric'})+'\u2013'+eo.toLocaleDateString(loc,opt);};
  var up=[];
  (typeof EVENTS!=='undefined'?EVENTS:[]).forEach(function(ev){
    if(ev.kind!=='jahrestagung') return;
    var end=ev.end?new Date(ev.end):new Date(ev.start);
    if(end>=today) up.push({t:new Date(ev.start).getTime(),ev:ev});
  });
  up.sort(function(a,b){return a.t-b.t;});
  if(!up.length){
    el.innerHTML='<div class="home-next home-next-empty"><p>'+(de?'Die n\u00e4chste Jahrestagung ist derzeit in Planung.':'The next annual meeting is currently being planned.')
      +'</p><a class="home-next-cta" href="events.html">'+(de?'Alle Veranstaltungen \u2192':'All events \u2192')+'</a></div>';
    return;
  }
  var e=up[0].ev, loc=de?(e.loc_de||e.loc_en||''):(e.loc_en||e.loc_de||'');
  var sub=de?(e.desc_de||''):(e.desc_en||'');
  var ext=e.url&&/^https?:/.test(e.url);
  el.innerHTML='<a class="home-next is-clickable" href="'+(e.url||'events.html')+'"'+(ext?' target="_blank" rel="noopener"':'')+'>'
    +'<div class="home-next-kicker eyebrow">'+(de?'N\u00e4chste Jahrestagung':'Next annual meeting')+'</div>'
    +'<div class="home-next-title">'+e.title+'</div>'
    +(sub?'<div class="home-next-sub">'+sub+'</div>':'')
    +'<div class="home-next-meta">'+fmt(e.start,e.end)+(loc?' \u00b7 '+loc:'')+'</div>'
    +'<span class="home-next-cta">'+(de?'Mehr erfahren \u2192':'Learn more \u2192')+'</span></a>';
}

/* ── Home: Ausschuss auf einen Blick (guarded — index.html only) ── */
function renderGlance(){
  var el=document.getElementById('home-glance'); if(!el) return;
  var de=(typeof lang==='undefined')?true:lang!=='en';
  var chair=(typeof CHAIRS!=='undefined')?CHAIRS.filter(function(c){return !c.past;})[0]:null;
  var chairName=chair?((chair.title?chair.title+' ':'')+chair.name):'';
  var count=(typeof MEMBERS!=='undefined')?MEMBERS.length:0;
  var item=function(v,l){return '<div class="glance-item"><div class="glance-value">'+v+'</div><div class="glance-label">'+l+'</div></div>';};
  el.innerHTML=(chairName?item(chairName,de?'Vorsitzende':'Chair'):'')
    +item(count+(de?' Mitglieder':' members'),de?'Ausschuss':'Committee')
    +item('VfS',de?'Verein f\u00fcr Socialpolitik':'German Economic Association')
    +'<a class="glance-item glance-link is-clickable" href="analytics.html"><div class="glance-value">Stammbaum \u2192</div><div class="glance-label">'+(de?'Denkschulen erkunden':'Explore the schools')+'</div></a>';
}

/* ── Init ── */
renderChairs();
renderMembers(MEMBERS);
renderArchive();
renderPubs();
renderAnnouncements();
updateCountdown();
renderEvents();
renderNextEvent();
renderGlance();
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
    'URL:https://www.agw-vfs.de/','END:VEVENT',
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

/* ── Back to top ── moved to agw_nav.js (self-mounting; agw_app.js is not loaded on analytics.html / guide.html) ── */

/* ── QR code ── */
(function(){
  var el=document.getElementById('footer-qr');
  if(!el||typeof QRCode==='undefined')return;
  new QRCode(el,{text:'https://www.agw-vfs.de/',
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
/* ── Contributor statistics (Referenten tab) ─────────────────────────────────
 * Counts PUBLISHED CHAPTERS across all 43 Tagungsbände, not talks.
 *
 * This used to count ARCHIVE[].papers[] — 150 talk records covering only 18 of the
 * 46 conferences. The other 28 have no paper list, so the ranking was a biased
 * sample of the recent conferences and omitted 29 people with two or more published
 * chapters: Dieter Schneider (12 chapters) did not appear at all, nor did Heinz
 * Rieter (8) or Karl-Heinz Schmidt (10). VOLUME_CHAPTERS covers every volume.
 *
 * Names are folded before counting. The corpus spells the same person several ways
 * ("Erich Streißler" / "Erich W. Streissler", "Jürgen Backhaus" / "Jürgen G.
 * Backhaus"), and counting the raw strings splits one contributor into two. The key
 * is surname + first initial, umlauts and ß normalised — the same rule used to map
 * chapter authors to member ids. Nobiliary particles stay with the surname.
 */
var _NAME_PARTICLES = ['von','van','de','der','den','du','zu','zur','ter','la','le'];

function foldName(s){
  return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/\u00df/g,'ss').toLowerCase();
}
function personKey(n){
  var w = String(n||'').trim().split(/\s+/);
  if (w.length < 2) return foldName(n);
  var i = w.length - 1;
  while (i > 1 && _NAME_PARTICLES.indexOf(w[i-1].toLowerCase()) !== -1) i--;
  return foldName(w.slice(i).join(' ')) + '|' + foldName(w[0]).charAt(0);
}

/* ── "Der AGW in Zahlen" + Kontakt: derive the facts, never hardcode them ──────
 * committee.html used to spell the chair's name into the HTML twice. When the chair
 * changed in 2026 the page went on naming Rainer Klump, and no data edit could fix it.
 * The same card also carried "48 Mitglieder" and "42 Bände" as literals — the German
 * said 42 while the English string said 43.
 *
 * Everything here is now read from CHAIRS / MEMBERS / PUBLICATIONS / ARCHIVE. The current
 * chair is simply the CHAIRS entry that is not `past`. Re-run on language change, because
 * "Bände"/"volumes" is language-dependent. Null-guarded throughout (ADR-016): committee.html
 * is the only page with these nodes, and agw_app.js is loaded by several.
 */
function renderCommitteeFacts() {
  var isDE = lang === 'de';

  var chair = (typeof CHAIRS !== 'undefined')
    ? CHAIRS.filter(function (c) { return !c.past; })[0]
    : null;
  if (chair) {
    var name = ((chair.title ? chair.title + ' ' : '') + chair.name).trim();
    ['fact-chair', 'fact-chair-2'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = name;
    });
  }

  var yr = new Date().getFullYear();
  var asOf = isDE ? ' (Stand ' + yr + ')' : ' (as of ' + yr + ')';

  var m = document.getElementById('fact-members');
  if (m && typeof MEMBERS !== 'undefined') m.textContent = MEMBERS.length + asOf;

  var v = document.getElementById('fact-volumes');
  if (v && typeof PUBLICATIONS !== 'undefined') {
    v.textContent = PUBLICATIONS.length + (isDE ? ' Bände' : ' volumes') + asOf;
  }

  var c = document.getElementById('fact-confs');
  if (c && typeof ARCHIVE !== 'undefined') {
    c.textContent = ARCHIVE.length + (isDE ? ' Jahrestagungen' : ' annual conferences') + asOf;
  }
}

function buildSpeakerStats(){
  var el = document.getElementById('speaker-freq-table');
  if (!el) return;

  var CH = (window.AGW_DATA && window.AGW_DATA.VOLUME_CHAPTERS) || [];
  var VM = (window.AGW_DATA && window.AGW_DATA.VOLUME_META) || [];
  if (!CH.length) { el.innerHTML = ''; return; }   /* corpus absent: render nothing, never a wrong list */

  var YEAR = {};
  VM.forEach(function(v){ YEAR[v.vol] = v.year; });

  var P = {};
  CH.forEach(function(ch){
    String(ch.authors||'').split(/\s*\/\s*/).forEach(function(nm){
      nm = nm.trim();
      if (nm.length < 4) return;
      var k = personKey(nm);
      if (!P[k]) P[k] = { names:{}, n:0, years:{} };
      P[k].names[nm] = (P[k].names[nm]||0) + 1;
      P[k].n++;
      if (YEAR[ch.vol]) P[k].years[YEAR[ch.vol]] = 1;
    });
  });

  var sorted = Object.keys(P).filter(function(k){ return P[k].n >= 2; })
    .sort(function(a,b){ return P[b].n - P[a].n; });

  var isDE = lang === 'de';
  var rows = sorted.slice(0, 25).map(function(k, i){
    var p = P[k];
    /* Display the fullest spelling the corpus uses for this person. */
    var name = Object.keys(p.names).sort(function(a,b){ return b.length - a.length; })[0];
    var tags = Object.keys(p.years).sort().map(function(y){
      return '<span style="font-size:11px;background:var(--border-light);color:var(--text-muted);'
           + 'padding:1px 6px;border-radius:3px;margin:1px;display:inline-block;">' + y + '</span>';
    }).join('');
    return '<tr><td style="color:var(--text-faint);font-size:12px;padding:8px 10px;">' + (i+1) + '.</td>'
      + '<td style="padding:8px 10px;"><strong>' + name + '</strong><div style="margin-top:4px;">' + tags + '</div></td>'
      + '<td style="padding:8px 10px;text-align:center;"><span style="background:var(--navy);color:#fff;'
      + 'font-size:11px;font-weight:700;padding:2px 7px;border-radius:10px;">' + p.n + '</span></td></tr>';
  }).join('');

  el.innerHTML = '<p style="font-size:13px;color:var(--text-muted);margin-bottom:16px;">'
    + (isDE
        ? 'Autorinnen und Autoren mit mindestens zwei Beitr\u00e4gen in den Tagungsb\u00e4nden (alle 43 B\u00e4nde, '
          + CH.length + ' Beitr\u00e4ge).'
        : 'Authors with at least two contributions to the conference volumes (all 43 volumes, '
          + CH.length + ' chapters).')
    + '</p><table style="width:100%;border-collapse:collapse;font-size:13.5px;">'
    + '<thead><tr>'
    + '<th style="text-align:left;padding:7px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);border-bottom:2px solid var(--border);width:28px;">#</th>'
    + '<th style="text-align:left;padding:7px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);border-bottom:2px solid var(--border);">'
    + (isDE ? 'Autor/in' : 'Author') + '</th>'
    + '<th style="text-align:center;padding:7px 10px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:var(--text-faint);border-bottom:2px solid var(--border);width:64px;">'
    + (isDE ? 'Beitr\u00e4ge' : 'Chapters') + '</th>'
    + '</tr></thead><tbody>' + rows + '</tbody></table>';
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
  var items=ANNOUNCEMENTS.slice().sort(function(x,y){return y.date<x.date?-1:(y.date>x.date?1:0);});
  el.innerHTML=items.map(function(a){
    var d=new Date(a.date);
    var fmt=d.toLocaleDateString(lang==='de'?'de-DE':'en-GB',{day:'numeric',month:'long',year:'numeric'});
    return '<div style="padding:16px 0;border-bottom:1px solid var(--border-light);">'
      +'<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">'
      +'<span style="font-size:11.5px;font-weight:600;letter-spacing:.06em;color:var(--text-faint);text-transform:uppercase;">'+fmt+'</span></div>'
      +'<div style="font-size:15px;font-weight:600;color:var(--text-dark);margin-bottom:4px;font-family:\'EB Garamond\',serif;">'+(lang==='de'?a.title_de:a.title_en)+'</div>'
      +'<div style="font-size:13.5px;color:var(--text-muted);line-height:1.55;">'+(lang==='de'?a.text_de:a.text_en)+'</div>'
      +'</div>';
  }).join('');
}
/* ── PWA: register service worker ── */
if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('/service-worker.js',{scope:'/'})
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


/* ── Events: unified timeline (Jahrestagungen from ARCHIVE + affiliated EVENTS) ──
   ARCHIVE holds only past/current Jahrestagungen; upcoming items live in EVENTS
   with ISO dates until they happen, then move to ARCHIVE. Status is derived here.
   Guarded: renders only on the page carrying #events-timeline. */
function renderEvents(){
  var el=document.getElementById('events-timeline'); if(!el) return;
  var de = (typeof lang==='undefined') ? true : lang!=='en';
  var today=new Date(); today.setHours(0,0,0,0);
  var ord=function(n){var s=['th','st','nd','rd'],v=n%100;return n+(s[(v-20)%10]||s[v]||s[0]);};
  var kindLbl=function(k){
    var m=de?{jahrestagung:'Jahrestagung',seminar:'Seminar',workshop:'Workshop',lecture:'Vortrag',conference:'Tagung'}
            :{jahrestagung:'Annual Meeting',seminar:'Seminar',workshop:'Workshop',lecture:'Lecture',conference:'Conference'};
    return m[k]||k;
  };
  var fmt=function(s,e){
    var so=new Date(s), eo=e?new Date(e):null, loc=de?'de-DE':'en-GB';
    var opt={day:'numeric',month:'long',year:'numeric'};
    if(!eo||s===e) return so.toLocaleDateString(loc,opt);
    return so.toLocaleDateString(loc,{day:'numeric'})+'\u2013'+eo.toLocaleDateString(loc,opt);
  };
  var items=[];
  (typeof EVENTS!=='undefined'?EVENTS:[]).forEach(function(ev){
    var end=ev.end?new Date(ev.end):new Date(ev.start);
    items.push({sort:new Date(ev.start).getTime(), upcoming:end>=today,
      kind:ev.kind, affiliation:ev.affiliation, edition:ev.edition,
      title:ev.title, subtitle:de?(ev.desc_de||''):(ev.desc_en||''),
      loc:de?(ev.loc_de||ev.loc_en||''):(ev.loc_en||ev.loc_de||''), venue:'',
      host:ev.host||'', dates:fmt(ev.start,ev.end), url:ev.url, external:true});
  });
  var DE_MO={januar:0,februar:1,'m\u00e4rz':2,april:3,mai:4,juni:5,juli:6,august:7,september:8,oktober:9,november:10,dezember:11};
  var archiveTs=function(c){
    var y=c.year||0, mo=0, d=1, ds=(c.dates||'').toLowerCase();
    for(var k in DE_MO){ if(ds.indexOf(k)>-1){ mo=DE_MO[k]; break; } }
    var m=ds.match(/(\d{1,2})\s*\./); if(m) d=parseInt(m[1],10);
    return new Date(y,mo,d).getTime();
  };
  (typeof ARCHIVE!=='undefined'?ARCHIVE:[]).forEach(function(c){
    items.push({sort:archiveTs(c), upcoming:false,
      kind:'jahrestagung', affiliation:'agw', edition:c.nr,
      title:de?(c.nr+'. Jahrestagung des AGW'):(ord(c.nr)+' AGW Annual Meeting'),
      subtitle:de?(c.theme||''):(c.theme_en||c.theme||''),
      loc:de?(c.loc_de||''):(c.loc_en||c.loc_de||''), venue:c.venue||'',
      host:'', dates:(c.dates||String(c.year)), url:(c.page||'archive.html#archiv'), external:false, hasPage:!!c.page});
  });
  var up=items.filter(function(x){return x.upcoming;}).sort(function(a,b){return a.sort-b.sort;});
  var pa=items.filter(function(x){return !x.upcoming;}).sort(function(a,b){return b.sort-a.sort;});
  var card=function(x){
    var badge=x.affiliation==='agw'
      ? '<span class="ev-badge ev-badge-agw">AGW</span>'
      : '<span class="ev-badge ev-badge-aff">'+(de?'Affiliiert':'Affiliated')+'</span>';
    var kind='<span class="ev-kind">'+kindLbl(x.kind)+(x.edition?' \u00b7 '+(de?(x.edition+'.'):('#'+x.edition)):'')+'</span>';
    var meta=[x.dates,x.loc,x.venue,(x.host?(de?'Veranstalter: ':'Host: ')+x.host:'')].filter(Boolean).join(' \u00b7 ');
    var lt=x.external?(de?'Mehr erfahren \u2197':'Learn more \u2197'):(x.hasPage?(de?'Zur Tagungsseite \u2192':'Event page \u2192'):(de?'Zum Archiv':'To archive'));
    var la=x.external?' target="_blank" rel="noopener"':'';
    return '<article class="ev-card">'
      +'<div class="ev-card-top">'+badge+kind+'</div>'
      +'<h3 class="ev-title">'+x.title+'</h3>'
      +(x.subtitle?'<p class="ev-sub">'+x.subtitle+'</p>':'')
      +'<div class="ev-meta">'+meta+'</div>'
      +(x.url?'<a class="ev-link" href="'+x.url+'"'+la+'>'+lt+'</a>':'')
      +'</article>';
  };
  var h='';
  h+='<h2 class="ev-section-h">'+(de?'Kommende Veranstaltungen':'Upcoming Events')+'</h2>';
  h+= up.length ? '<div class="ev-grid">'+up.map(card).join('')+'</div>'
       : '<p class="ev-empty">'+(de?'Derzeit sind keine kommenden Veranstaltungen angek\u00fcndigt.':'No upcoming events are currently announced.')+'</p>';
  h+='<h2 class="ev-section-h" style="margin-top:44px;">'+(de?'Vergangene Veranstaltungen':'Past Events')+'</h2>';
  h+='<div class="ev-grid">'+pa.map(card).join('')+'</div>';
  el.innerHTML=h;
  var nl=document.getElementById('event-networks');
  if(nl && typeof EVENT_NETWORKS!=='undefined'){
    nl.innerHTML='<h2 class="ev-section-h">'+(de?'Verwandte Netzwerke & Veranstaltungskalender':'Related Networks & Event Calendars')+'</h2>'
      +'<p class="ev-empty" style="margin-bottom:18px;">'+(de?'Wissenschaftliche Netzwerke und Gesellschaften im Umfeld der Theorie- und Ordnungsgeschichte, deren Veranstaltungskalender f\u00fcr Mitglieder von Interesse sind.':'Scholarly networks and societies adjacent to the history of economics and constitutional economics, whose event calendars are of interest to members.')+'</p>'
      +'<div class="ev-net-grid">'+EVENT_NETWORKS.map(function(n){
          return '<div class="ev-net"><div class="ev-net-abbr">'+n.abbr+'</div>'
            +'<div class="ev-net-name">'+(de?n.name_de:n.name_en)+'</div>'
            +'<div class="ev-net-links"><a href="'+n.url+'" target="_blank" rel="noopener">'+(de?'Website \u2197':'Website \u2197')+'</a>'
            +(n.events_url?'<a href="'+n.events_url+'" target="_blank" rel="noopener">'+(de?'Veranstaltungen \u2197':'Events \u2197')+'</a>':'')
            +'</div></div>';
        }).join('')+'</div>';
  }
}
