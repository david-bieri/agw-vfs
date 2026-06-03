/**
 * agw_strings.js — Central string registry for AGW
 * ───────────────────────────────────────────────────────────────────
 * SINGLE SOURCE OF TRUTH for translations across:
 *   - index.html         (main conference microsite)
 *   - analytics.html     (interactive analytics)
 *   - guide.html         (user guide)
 *   - agw_chronik.js     (Chronik tab content)
 *
 * Structure: window.AGW.S[key] = { de, en }  for new keys, or
 *            window.AGW.S[key] = { en }      for legacy main-site keys
 *            where the German text lives in index.html's HTML.
 *
 * Edit any value here and all consumers update on next load.
 *
 * Usage:     AGW.t('key', lang)     → string for given language
 *            AGW.t('key')           → string for current (stored) language
 *            AGW.applyLang(lang)    → update all tagged elements on page
 *            AGW.getLang()          → 'de' or 'en' from localStorage
 *            AGW.setLang(lang)      → persist a language preference
 */

(function () {
  'use strict';

  window.AGW = window.AGW || {};

  window.AGW.S = {


    // ── Site-wide navigation ──────────────────────────────────────
    nav_back_main:       { de: 'Zur Tagungsseite',      en: 'Back to Conference Site' },
    nav_back_analytics:  { de: 'Zur Analyse',            en: 'Back to Analytics' },
    nav_back_guide:      { de: 'Zum Handbuch',           en: 'To User Guide' },
    nav_guide_link:      { de: 'Benutzerhandbuch',       en: 'User Guide' },
    nav_analytics_link:  { de: 'Analysenseite',          en: 'Analytics' },

    // ── Language toggle (shared pill component) ───────────────────
    lang_de:             { de: 'DE', en: 'DE' },
    lang_en:             { de: 'EN', en: 'EN' },

    // ── Archive tab label (index.html) ────────────────────────────
    arch_view_chronik:   { de: '📈 Chronik',             en: '📈 Chronicle' },

    // ── Analytics page — main tabs ───────────────────────────────
    tab_gaze:            { de: '🗺 Gaze Map',             en: '🗺 Gaze Map' },
    tab_analysis:        { de: '📊 Analysen A–E',         en: '📊 Analytics A–E' },
    tab_pmi:             { de: '🔬 Themenanalyse',        en: '🔬 Topic Analysis' },

    // ── Tool display names (used in guide + page headings) ────────
    tool_chronik:        { de: 'Chronik',                 en: 'Chronicle' },
    tool_gaze:           { de: 'Intellektueller Blick',   en: 'Intellectual Gaze' },
    tool_analysis:       { de: 'Historische Analysen',    en: 'Historical Analytics' },
    tool_pmi:            { de: 'Diskurssignaturen',       en: 'Discourse Signatures' },

    // ── Gaze Map sub-views ────────────────────────────────────────
    gaze_A:              { de: 'Präsenz-Streudiagramm',   en: 'Presence Scatter' },
    gaze_B:              { de: 'Epochen-Heatmap',         en: 'Era Heatmap' },
    gaze_C:              { de: 'Top-Figuren Zeitreihe',   en: 'Top Figures Timeline' },

    // ── Historical Analytics A–E sub-views ────────────────────────
    analysis_A:          { de: 'Intellektuelle Strömungen',     en: 'Intellectual Tides' },
    analysis_B:          { de: 'Intellektuelle Konstellation',  en: 'Intellectual Constellation' },
    analysis_C:          { de: 'Aufsteiger & Vergessene',       en: 'Rising & Fading' },
    analysis_D:          { de: 'Der lange Griff',               en: 'The Long Reach' },
    analysis_E:          { de: 'Säulen & Gäste',                en: 'Pillars & Guests' },

    // ── Topic Analysis (PMI) sub-views ────────────────────────────
    pmi_A:               { de: 'Themenmatrix',                  en: 'Topic Heatmap' },
    pmi_B:               { de: 'Intellektuelles Porträt',       en: 'Intellectual Portrait' },
    pmi_C:               { de: 'Im Wandel der Jahrzehnte',      en: 'Through the Decades' },
    pmi_D:               { de: 'Schulbrücken',                  en: 'School Bridges' },
    pmi_E:               { de: 'Intellektuelles Terrain',       en: 'Intellectual Terrain' },
    pmi_F:               { de: 'Ideennetz',                     en: 'Idea Web' },

    // ── Chronik / Showcase panels ─────────────────────────────────
    chronik_heading:     { de: 'Der AGW in Zahlen',             en: 'The AGW in Numbers' },
    chronik_subheading:  {
      de: '45 Jahre Geschichte der Wirtschaftswissenschaften — ein quantitatives Porträt',
      en: '45 years of the history of economic thought — a quantitative portrait'
    },
    chronik_intro:       {
      de: 'Der AGW hat seit seiner Gründung 1980 ein einzigartiges intellektuelles Kanon aufgebaut.',
      en: 'Since its founding in 1980, the AGW has built a distinctive intellectual canon of economic thought.'
    },
    panel_canon:         { de: 'Das wachsende Kanon',           en: 'The Expanding Canon' },
    panel_canon_desc:    {
      de: 'Kumulierte neue Figuren im AGW-Kanon nach Konferenzjahr. Goldene Spitzen = stärkste Zuwachsjahre.',
      en: 'Cumulative unique figures entering the corpus per year. Gold spikes = strongest intake years.'
    },
    panel_time:          { de: 'Die Tiefe der Zeit',            en: 'The Depth of Time' },
    panel_time_desc:     {
      de: 'Geburtsjahr-Verteilung der zitierten Figuren pro Konferenz. Box = IQR, Punkt = Median.',
      en: 'Birth-year distribution of cited figures per conference. Box = IQR, dot = median.'
    },
    panel_diversity:     { de: 'Intellektuelle Vielfalt & Schulanteile', en: 'Intellectual Diversity & School Shares' },
    panel_diversity_desc:{
      de: 'Links: Shannon-Entropie pro Konferenz (höher = breiter Fokus). Rechts: Gesamtkorpus-Anteil nach Denkschule.',
      en: 'Left: Shannon entropy per conference (higher = broader focus). Right: Overall corpus share by school.'
    },
    panel_pyramid:       { de: 'Die Kanonpyramide',             en: 'The Canon Pyramid' },
    panel_pyramid_desc:  {
      de: 'Konferenzauftritte pro Figur. Gold = Kern (df≥10), Blau = Regulär (df 5–9). Grüne Linie = kumulative Abdeckung.',
      en: 'Conference appearances per figure. Gold = core (df≥10), blue = regular (df 5–9). Green line = cumulative coverage.'
    },

    // ── Stat card labels ──────────────────────────────────────────
    stat_conferences:    { de: 'Jahrestagungen',                en: 'Annual Conferences' },
    stat_figures:        { de: 'Intellektuelle Figuren',        en: 'Intellectual Figures' },
    stat_engagements:    { de: 'Figur × Konferenz-Engagements', en: 'Figure × Conference Engagements' },
    stat_span:           { de: 'Geburtsjahr-Spanne',            en: 'Birth-Year Span' },
    stat_top_pct:        { de: 'aller Konferenzen',             en: 'of all conferences' },
    stat_lag:            { de: 'längste Entdeckungsverzögerung', en: 'longest discovery lag' },
    stat_core_note:      { de: 'im Kernkanon',                  en: 'in core canon' },

    // ── PCA axis labels ───────────────────────────────────────────
    pca_x:               { de: 'Methodologie / Wertlehre',      en: 'Methodology / Value Theory' },
    pca_y:               { de: 'Institutionen / Raum',          en: 'Institutions / Space' },
    pca_desc:            {
      de: 'PCA-Projektion im Themenraum. Farbe = Schule.',
      en: 'PCA projection in topic space. Colour = school.'
    },

    // ── Shared UI labels ──────────────────────────────────────────
    loading:             { de: 'Lädt…',                         en: 'Loading…' },
    clear:               { de: 'zurücksetzen',                  en: 'clear' },
    windows:             { de: 'Textstellen',                   en: 'windows' },
    decade:              { de: 'Jahrzehnt',                     en: 'decade' },
    score:               { de: 'Wert',                          en: 'score' },
    school:              { de: 'Schule',                        en: 'school' },
    schools:             { de: 'Schulen',                       en: 'schools' },
    rank:                { de: 'Rang',                          en: 'rank' },
    coverage:            { de: 'Abdeckung',                     en: 'coverage' },
    birthyear:           { de: 'Geburtsjahr',                   en: 'Birth year' },
    tip_hover:           { de: 'Hover',                         en: 'Hover' },
    tip_filter:          { de: 'Filter',                        en: 'Filter' },
    tip_select:          { de: 'Auswahl',                       en: 'Select' },

    // ── Analytics → Chronik CTA ───────────────────────────────────
    chronik_cta_text:    {
      de: 'Detaillierte Analyse: Intellektueller Blick, Themenassoziationen, Autorencluster',
      en: 'Detailed Analysis: Intellectual Gaze Map, Topic Associations, Author Clusters'
    },
    chronik_cta_link:    { de: 'Zur Analyse',                   en: 'Open Analytics' },

    // ── Guide page ─────────────────────────────────────────────────
    guide_h1:            { de: 'Benutzerhandbuch · Analytics',  en: 'User Guide · Analytics' },
    guide_intro:         {
      de: 'Diese Seite erklärt die drei Analysewerkzeuge und ihre Einzelansichten — was sie zeigen, wie man sie bedient und welche typischen Erkenntnisse sie liefern.',
      en: 'This page explains the three analytics tools and their individual views — what they show, how to use them, and what insights they typically yield.'
    },
    guide_cta_text:      {
      de: 'Alle Werkzeuge sind interaktiv und zweisprachig (DE/EN). Die Spracheinstellung wird seitenübergreifend gespeichert.',
      en: 'All tools are interactive and fully bilingual (DE/EN). The language setting persists across pages.'
    },
    guide_cta_link:      { de: 'Zur Analysenseite ↗',           en: 'Open Analytics ↗' },

    // ── Bundle-error messages ─────────────────────────────────────
    bundle_title:        { de: 'Bundle nicht gefunden',         en: 'Bundle not found' },
    bundle_body:         { de: 'Build-Skript in WSL ausführen:', en: 'Run the build script in WSL first:' },
    bundle_hint:         { de: 'Dann dist/ committen und neu laden.', en: 'Then commit the dist/ folder and reload.' },

    // ════════════════════════════════════════════════════════
    // ── MAIN SITE (index.html) — EN values only; DE in HTML ──
    // ════════════════════════════════════════════════════════
    nav_brand_sub          : { en: 'Verein für Socialpolitik' },
    nav_conference         : { en: 'Annual Conference 2026' },
    nav_programme          : { en: 'Academic Programme' },
    nav_social             : { en: 'Social Programme' },
    nav_travel             : { en: 'Travel & Logistics' },
    nav_archive            : { en: 'Archive' },
    nav_publications       : { en: 'Publications' },
    nav_about_group        : { en: 'About AGW' },
    nav_about              : { en: 'About the Committee' },
    nav_history            : { en: 'History of the AGW' },
    nav_members            : { en: 'Members' },
    sub_programme          : { en: 'Academic Programme' },
    sub_social             : { en: 'Social Programme' },
    sub_travel             : { en: 'Travel & Logistics' },
    sec_lbl_programme      : { en: 'Academic Programme' },
    sec_ttl_programme      : { en: 'Conference Programme' },
    sec_lbl_social         : { en: 'Social Programme' },
    sec_ttl_social         : { en: 'Social Events' },
    sec_lbl_travel         : { en: 'Travel & Local Logistics' },
    sec_ttl_travel         : { en: 'Travel & Accommodation' },
    sec_ttl_venue          : { en: 'Venue' },
    sec_lbl_archive        : { en: 'Conference Archive' },
    sec_ttl_archive        : { en: 'Previous Annual Conferences' },
    sec_intro_archive      : { en: 'The AGW holds an annual conference. Below is an overview of past conferences with programmes and selected contributions.' },
    sec_lbl_pub            : { en: 'Publications' },
    sec_ttl_pub            : { en: 'Conference Volumes' },
    sec_lbl_about          : { en: 'About the Committee' },
    sec_ttl_about          : { en: 'About the Committee' },
    sec_lbl_history        : { en: 'History' },
    sec_ttl_history        : { en: 'History of the AGW' },
    sec_lbl_members        : { en: 'Members' },
    sec_ttl_members        : { en: 'Members of the AGW' },
    tab_thu                : { en: 'Thursday, 25 June' },
    tab_fri                : { en: 'Friday, 26 June' },
    tab_sat                : { en: 'Saturday, 27 June' },
    prog_welcome_dinner    : { en: 'Welcome Dinner' },
    prog_welcome_note      : { en: 'Historic old town · next to the funicular station' },
    prog_opening           : { en: 'Opening / Welcome' },
    prog_memorial          : { en: 'In Memoriam: Three Departed Members' },
    prog_coffee            : { en: 'Coffee Break' },
    prog_lunch             : { en: 'Lunch Break' },
    prog_tour              : { en: 'Historical Walking Tour of Riva San Vitale (guided, German)' },
    prog_tour_note         : { en: 'Anabaptist Chapel (9th c.) · Battistero San Giovanni (4th/5th c.) · Santa Croce · Casa Bianchi (Mario Botta)' },
    prog_apericena         : { en: 'Apericena in the Gardens of Villa Maderni' },
    prog_apericena_venue   : { en: '18th-century palazzo · Steger Center' },
    prog_apericena_note    : { en: 'Regional Ticino cuisine · approx. CHF 40 p.p. (drinks excl.)' },
    prog_assembly          : { en: 'Members\' Assembly' },
    prog_assembly_note     : { en: 'Members of the committee only' },
    prog_lunch_sa          : { en: 'Lunch' },
    prog_lunch_sa_loc      : { en: 'Steger Center · Villa Maderni' },
    prog_excursion         : { en: 'Group Excursion: Monte Generoso' },
    prog_excursion_detail  : { en: 'Rack railway from Capolago station (since 1890) · Panoramic view over four countries' },
    lbl_partner            : { en: 'Partner Programme' },
    ttl_partner            : { en: 'Activities for Accompanying Guests' },
    ttl_accommodation      : { en: 'Accommodation in Lugano' },
    ttl_train              : { en: 'Getting There by Train' },
    partner_hesse          : { en: 'Montagnola · daily 10:30–17:30 · free entry with Ticino Ticket.' },
    partner_lugano_ttl     : { en: 'Lake Lugano Boat Trips' },
    partner_lugano         : { en: 'Navigazione del Lago di Lugano. Cruises on Lake Lugano.' },
    partner_bre            : { en: 'Viewpoint hill above Lugano with sweeping panorama.' },
    partner_verita         : { en: 'Museum Casa Anatta · historic centre of the German life-reform movement.' },
    about_p1               : { en: 'The <strong>Committee for the History of Economics (AGW)</strong> is the standing committee for the history of economic thought and the history of doctrines within the Verein für Socialpolitik (VfS), the largest German-language economics association.' },
    about_p2               : { en: 'The committee serves as a scholarly platform bringing together economists from German, Austrian, and Swiss higher education institutions — as well as neighbouring countries — who work on the methodological, philosophical, intellectual-historical, and historical dimensions of economics.' },
    about_p3               : { en: 'The annual conference is the centrepiece of the committee\'s activity. It provides a forum for research discussions, for dialogue between emerging and established scholars, and for international exchange on the history of economic thought as a discipline.' },
    about_p4               : { en: 'The AGW is part of the international network of history-of-economics societies, including the <strong>European Society for the History of Economic Thought (ESHET)</strong> and the <strong>History of Economics Society (HES)</strong>.' },
    about_pullquote        : { en: 'The history of economic ideas is not an end in itself — it opens our eyes to what economics could be.' },
    hist_p1                : { en: 'The <strong>Committee for the History of Economics (AGW)</strong> is one of the standing specialist committees of the Verein für Socialpolitik (VfS), the oldest professional association of economists in the world (founded 1873). The AGW was founded in 1980; its inaugural conference was held in Giessen. As an independent committee, the AGW brings together research on the history of economic theories and doctrines in the German-language academic tradition.' },
    hist_p2                : { en: 'The AGW\'s annual conferences regularly result in peer-reviewed collected volumes published as the subseries <em>Studien zur Entwicklung der ökonomischen Theorie</em> within the <em>Schriften des Vereins für Socialpolitik</em> (vol. 115) by Duncker &amp; Humblot, Berlin. Since the first volume in the early 1980s, the series — now numbering more than 40 volumes — has been the principal publication outlet for the German-language history of economic thought.' },
    hist_p3                : { en: 'The AGW meets annually at rotating locations in Germany, Austria, and Switzerland, and occasionally abroad. Papers presented cover the history of economic theories, the history of doctrines, and the philosophy of economics. The 2022 Jahrestagung in Jena was dedicated to the 150th anniversary of the VfS (volume XLI of the series, ed. Peter Spahn).' },
    hist_p4                : { en: 'The AGW maintains close ties with the international sister societies ESHET (European Society for the History of Economic Thought) and HES (History of Economics Society), as well as with other national associations in the German- and European-language scholarly community.' },
    hist_note_title        : { en: 'Note on History' },
    hist_note_text         : { en: 'This section is being updated continuously. Members wishing to contribute to the history of the committee should contact the chair.' },
    arch_view              : { en: 'View Programme' },
    arch_papers            : { en: 'Selected Papers' },
    arch_upload            : { en: 'Submit Paper' },
    arch_upload_note       : { en: 'Papers are added following consultation with the chair.' },
    mbr_chair              : { en: 'Chair' },
    mbr_host2026           : { en: '2026 Host' },
    mbr_search             : { en: 'Search members…' },
    pub_series_lbl         : { en: 'Series Information' },
    pub_all_link           : { en: 'All volumes at publisher ↗' },
    pub_filter_all         : { en: 'All' },
    pub_toc_placeholder    : { en: 'Table of contents to be added.' },
    pub_no_results         : { en: 'No volumes found' },
    pub_cite_lbl           : { en: 'Cite' },
    pub_toc_lbl            : { en: 'Contents' },
    pub_download           : { en: 'Download' },
    pub_copy               : { en: 'Copy' },
    pub_copied             : { en: 'Copied' },
    pub_publisher_lbl      : { en: 'Publisher ↗' },
    pub_band_lbl           : { en: 'Vol. 115/' },
    footer_desc            : { en: 'Standing committee for the history of economic thought within the' },
    footer_hosted          : { en: 'Annual Conference 2026 hosted by Dr. David Bieri,' },
    footer_col_conf        : { en: 'Annual Conference 2026' },
    footer_col_about       : { en: 'About AGW' },
    footer_updated         : { en: 'Updated: May 2026 · Subject to change' },
    // ── (uncategorised) ──
    hero_eyebrow           : { en: 'Committee for the History of Economics · Annual Conference 2026' },
    hero_pill_venue        : { en: 'Virginia Tech Steger Center · Riva San Vitale, Ticino' },
    hero_pill_days         : { en: 'Thu–Sat · 3 Days' },
    hero_org_by            : { en: 'Organised by' },
    hero_hosted_by         : { en: 'Hosted by' },
    card_thu_day           : { en: 'Thursday, 25 June' },
    card_thu_title         : { en: 'Welcome Dinner' },
    card_thu_note          : { en: 'The restaurant is located in the historic old town, adjacent to the funicular station, steps from the recommended conference hotel.' },
    card_fri_day           : { en: 'Friday, 26 June' },
    card_fri1_title        : { en: 'Historical Walking Tour' },
    card_fri1_note         : { en: 'Followed by: Apericena from 18:30 at Villa Maderni' },
    card_fri2_title        : { en: 'Apericena at Villa Maderni' },
    card_sat_day           : { en: 'Saturday, 27 June' },
    card_sat_title         : { en: 'Group Excursion: Monte Generoso' },
    card_sat_note          : { en: 'After Members\' Assembly · sturdy footwear recommended' },
    ticino_title           : { en: 'Ticino Ticket' },
    ticino_text            : { en: 'All hotel guests in Ticino receive the Ticino Ticket free of charge at check-in: valid for TILO, PostAuto, and city buses — including the Lugano–Capolago route. Also: free entry to the Hermann Hesse Museum and discounts at other attractions.' },
    badge_recommended      : { en: 'Recommended' },
    badge_dinner_near      : { en: 'Dinner venue nearby' },
    badge_no_train         : { en: 'No train needed' },
    hotel_svizzero_addr    : { en: 'Capolago · ~10 min walk to venue' },
    ticino_box_note        : { en: 'All guests receive the Ticino Ticket at hotel check-in — the Lugano ↔ Capolago train journey is therefore free of charge.' },
    ts1_label              : { en: 'TILO S10: Lugano HB → Capolago-Riva San Vitale' },
    ts1_detail             : { en: 'Every 30 min · Journey time approx. 15 min.' },
    ts2_label              : { en: 'Walk to Steger Center' },
    ts2_detail             : { en: 'approx. 750 m · 10–12 min from Capolago station' },
    train_times_hdr        : { en: 'Recommended Departure Times' },
    train_fri              : { en: 'Depart Lugano HB 08:12 (9:00 start)' },
    train_sat              : { en: 'Depart Lugano HB 07:42 (8:30 start)' },
    train_timetable        : { en: 'Timetable' },
    train_free_note        : { en: 'Ticino Ticket: the Lugano ↔ Capolago train journey is free of charge — no separate ticket needed.' },
    venue_address_lbl      : { en: 'Address' },
    venue_building_lbl     : { en: 'Building' },
    venue_building_val     : { en: 'Villa Maderni, 18th-century palazzo' },
    contact_title          : { en: 'Contact & Organisation' },
    contact_chair_lbl      : { en: 'Chair' },
    contact_host_lbl       : { en: '2026 Host' },
    contact_parent_lbl     : { en: 'Parent body' },
    contact_page_lbl       : { en: 'Committee page' },
    membership_title       : { en: 'Membership' },
    membership_text        : { en: 'Researchers interested in joining the committee should contact the chair or the VfS office directly.' },
  };

  /* ── Helpers ──────────────────────────────────────────────────── */

  /** Return string for key in given language (falls back to 'de' then 'en'). */
  window.AGW.t = function (key, lang) {
    var l = lang || window.AGW._lang || 'de';
    var entry = window.AGW.S[key];
    if (!entry) { console.warn('AGW.t: unknown key "' + key + '"'); return key; }
    return entry[l] || entry.de || entry.en || key;
  };

  /** Get the current language from localStorage (mirrors index.html). */
  window.AGW.getLang = function () {
    try { return localStorage.getItem('agw-lang') || 'de'; } catch (e) { return 'de'; }
  };

  /** Set language and persist (mirrors index.html). */
  window.AGW.setLang = function (l) {
    window.AGW._lang = l;
    try { localStorage.setItem('agw-lang', l); } catch (e) {}
  };

  /**
   * Walk all translation-tagged elements on the page and substitute text.
   * Supports three patterns:
   *
   *   1. data-str="key"        — new pattern; both DE and EN come from AGW.S
   *                              (or attribute set via data-str-attr="attr")
   *   2. data-i18n="key"       — legacy pattern; DE is the HTML's original
   *                              textContent (cached in dataset.de), EN comes
   *                              from AGW.S[key].en
   *   3. data-i18n-html="key"  — legacy pattern with innerHTML; DE cached in
   *                              dataset.deHtml, EN from AGW.S[key].en
   *
   * Call after DOM ready and again whenever language changes.
   */
  window.AGW.applyLang = function (lang) {
    var l = lang || window.AGW._lang || window.AGW.getLang();

    // 1. Modern data-str (both DE and EN in JS)
    document.querySelectorAll('[data-str]').forEach(function (el) {
      var key   = el.getAttribute('data-str');
      var attr  = el.getAttribute('data-str-attr');
      var entry = window.AGW.S[key];
      if (!entry) return;
      var val   = entry[l] || entry.de || entry.en || key;
      if (attr) el.setAttribute(attr, val);
      else       el.textContent = val;
    });

    // 2. Legacy data-i18n (DE in HTML, EN in JS)
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key   = el.dataset.i18n;
      var entry = window.AGW.S[key];
      if (l === 'en') {
        if (el.dataset.de === undefined) el.dataset.de = el.textContent;
        if (entry && entry.en !== undefined) el.textContent = entry.en;
      } else {
        if (el.dataset.de !== undefined) el.textContent = el.dataset.de;
      }
    });

    // 3. Legacy data-i18n-html (DE in HTML, EN in JS, innerHTML)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key   = el.dataset.i18nHtml;
      var entry = window.AGW.S[key];
      if (l === 'en') {
        if (el.dataset.deHtml === undefined) el.dataset.deHtml = el.innerHTML;
        if (entry && entry.en !== undefined) el.innerHTML = entry.en;
      } else {
        if (el.dataset.deHtml !== undefined) el.innerHTML = el.dataset.deHtml;
      }
    });
  };

  /* Initialise _lang from storage so AGW.t() works before any
     setLang() call on the host page. */
  window.AGW._lang = window.AGW.getLang();

})();
