/**
 * school_labels.js — Bilingual school name labels for AGW visualizations
 * ───────────────────────────────────────────────────────────────────────
 * Maps internal school keys (English) to display labels in DE and EN.
 * All visualization modules import this to ensure consistent naming.
 *
 * Usage:
 *   import { schoolLabel, getLang, uiText } from './school_labels.js';
 *   schoolLabel('Austrian School')  → 'Österreichische Schule' (if lang=de)
 *   schoolLabel('Austrian School', 'en') → 'Austrian School'
 */

const SCHOOL_NAMES = {
  'Classical':              { de: 'Klassik',                     en: 'Classical' },
  'Neoclassical':           { de: 'Neoklassik',                  en: 'Neoclassical' },
  'Austrian School':        { de: 'Österreichische Schule',      en: 'Austrian School' },
  'Historical School':      { de: 'Historische Schule',          en: 'Historical School' },
  'Keynesian':              { de: 'Keynesianismus',              en: 'Keynesian' },
  'Evolutionary':           { de: 'Evolutionsökonomik',          en: 'Evolutionary' },
  'Marxian':                { de: 'Marxismus',                   en: 'Marxian' },
  'Marxist':                { de: 'Marxismus',                   en: 'Marxist' },
  'Institutional':          { de: 'Institutionalismus',          en: 'Institutional' },
  'Ordoliberalismus':       { de: 'Ordoliberalismus',            en: 'Ordoliberalism' },
  'Monetarist':             { de: 'Monetarismus',                en: 'Monetarist' },
  'Raumwirtschaftslehre':   { de: 'Raumwirtschaftslehre',        en: 'Spatial Economics' },
  'Philosophy':             { de: 'Philosophie & Methodologie',  en: 'Philosophy & Methodology' },
  'Development Economics':  { de: 'Entwicklungsökonomik',        en: 'Development Economics' },
  'Mathematical Economics': { de: 'Mathematische Ökonomik',      en: 'Mathematical Economics' },
  'Econometrics':           { de: 'Ökonometrie',                 en: 'Econometrics' },
  'Cameralism':             { de: 'Kameralismus',                en: 'Cameralism' },
  'Sociology':              { de: 'Wissenssoziologie',           en: 'Sociology of Knowledge' },
  'Post-Keynesian/Sraffian':{ de: 'Post-Keynesianismus/Sraffa',  en: 'Post-Keynesian/Sraffian' },
  'Contemporary':           { de: 'Zeitgenössisch',              en: 'Contemporary' },
};

const UI_TEXT = {
  // Alluvial controls
  smoothing:        { de: 'Glättung:',                en: 'Smoothing:' },
  no_smooth:        { de: 'Keine (Einzeljahr)',       en: 'None (single year)' },
  window_3:         { de: '3-Jahres-Fenster',         en: '3-year window' },
  window_5:         { de: '5-Jahres-Fenster',         en: '5-year window' },
  window_10:        { de: 'Dekade',                   en: 'Decade' },
  mode:             { de: 'Modus:',                   en: 'Mode:' },
  mode_stream:      { de: 'Streamgraph',              en: 'Streamgraph' },
  mode_stacked:     { de: 'Gestapelt (100%)',         en: 'Stacked (100%)' },
  mode_alluvial:    { de: 'Alluvial-Fluss',           en: 'Alluvial Flow' },
  all_schools:      { de: 'Alle Schulen',             en: 'All Schools' },
  click_hint:       { de: 'Klicken Sie auf eine Schule, um sie hervorzuheben.', en: 'Click a school to highlight it.' },
  highlighted:      { de: 'Hervorgehoben:',           en: 'Highlighted:' },
  share:            { de: 'Anteil',                   en: 'Share' },

  // Sankey controls
  sankey_title:     { de: 'Intellektuelle Aufmerksamkeitsströme zwischen Denkschulen', en: 'Intellectual Attention Flows Between Schools of Thought' },
  sankey_hint:      { de: 'Klicken Sie auf eine Schule, um ihre Ströme hervorzuheben', en: 'Click a school to highlight its flows' },
  show_all:         { de: 'Alle zeigen',              en: 'Show All' },
  persistence:      { de: 'Persistenz',               en: 'Persistence' },
  flow_label:       { de: 'Aufmerksamkeitsstrom',     en: 'Attention Flow' },
  strength:         { de: 'Stärke',                   en: 'Strength' },
  legend_note:      { de: 'Breite Bänder = Persistenz innerhalb einer Schule · Schmale Bänder = Aufmerksamkeitsmigration zwischen Schulen',
                      en: 'Wide bands = persistence within a school · Narrow bands = attention migration between schools' },

  // Ego-network controls
  edges:            { de: 'Kanten:',                  en: 'Edges:' },
  edge_all:         { de: 'Alle (Co-Zitation + Stammbaum)', en: 'All (Co-citation + Lineage)' },
  edge_cocit:       { de: 'Nur Co-Zitation',          en: 'Co-citation only' },
  edge_lineage:     { de: 'Nur Stammbaum (Lehrer/Schüler)', en: 'Lineage only (Teacher/Student)' },
  search:           { de: 'Suche:',                   en: 'Search:' },
  search_placeholder: { de: 'Name eingeben…',         en: 'Enter name…' },
  overview:         { de: '⟵ Übersicht',              en: '⟵ Overview' },
  ego_hint:         { de: 'Klicken Sie auf eine Figur, um ihr Ego-Netzwerk zu erkunden.', en: 'Click a figure to explore their ego network.' },
};

/**
 * Get the current page language
 */
export function getLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'de';
}

/**
 * Get the display label for a school key
 * @param {string} key - The internal school key (e.g., 'Austrian School')
 * @param {string} [lang] - Optional language override ('de' or 'en')
 * @returns {string} The localized display name
 */
export function schoolLabel(key, lang) {
  const l = lang || getLang();
  const entry = SCHOOL_NAMES[key];
  if (!entry) return key; // fallback to raw key
  return entry[l] || entry.de || key;
}

/**
 * Get a UI text string
 * @param {string} key - The UI text key
 * @param {string} [lang] - Optional language override
 * @returns {string}
 */
export function uiText(key, lang) {
  const l = lang || getLang();
  const entry = UI_TEXT[key];
  if (!entry) return key;
  return entry[l] || entry.de || key;
}

/**
 * Get all school labels as a map (useful for bulk operations)
 * @param {string} [lang] - Optional language override
 * @returns {Object} Map of key → localized name
 */
export function allSchoolLabels(lang) {
  const l = lang || getLang();
  const result = {};
  for (const [key, entry] of Object.entries(SCHOOL_NAMES)) {
    result[key] = entry[l] || entry.de || key;
  }
  return result;
}
