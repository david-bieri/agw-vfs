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
    nav_back_short:      { de: 'Programm',              en: 'Programme' },
    nav_back_analytics:  { de: 'Zur Analyse',            en: 'Back to Analytics' },
    nav_back_guide:      { de: 'Zum Handbuch',           en: 'To User Guide' },
    nav_guide_link:      { de: 'Benutzerhandbuch',       en: 'User Guide' },
    nav_analytics_link:  { de: 'Analysenseite',          en: 'Analytics' },

    // ── Language toggle (shared pill component) ───────────────────
    lang_de:             { de: 'DE', en: 'DE' },
    lang_en:             { de: 'EN', en: 'EN' },

    // ── Archive tab label (index.html) ────────────────────────────
    arch_view_chronik:   { de: 'Chronik',                en: 'Chronicle' },

    // ── Analytics page — main tabs (consolidated 5-tab layout) ────
    tab_atlas:           { de: 'Atlas',                  en: 'Atlas' },
    tab_analysen:        { de: 'Analysen',               en: 'Analytics' },
    tab_netzwerke:       { de: 'Netzwerke',              en: 'Networks' },
    tab_zeitverlauf:     { de: 'Zeitverlauf',            en: 'Timeline' },
    tab_story:           { de: 'Rundgang',               en: 'Guided Tour' },

    // ── Analytics page — sub-tabs ────────────────────────────────
    sub_ego:             { de: 'Ego-Netzwerk',           en: 'Ego Network' },
    sub_lineage:         { de: 'Stammbaum',              en: 'Lineages' },
    sub_sankey:          { de: 'Sankey',                  en: 'Sankey' },
    sub_stream:          { de: 'Streamgraph',            en: 'Streamgraph' },
    sub_themen:          { de: 'Themenanalyse',          en: 'Topic Analysis' },
    sub_pathways:        { de: 'Pfade',                  en: 'Pathways' },
    sub_temporal:        { de: 'Zeitverlauf',            en: 'Temporal' },
    sub_analysis_main:   { de: 'Analysen',               en: 'Analytics' },
    sub_school_compare:  { de: 'Schulvergleich',         en: 'School Comparison' },

    // ── Legacy tab keys (kept for guide.html compatibility) ──────
    tab_gaze:            { de: 'Rezeptionsatlas',        en: 'Reception Atlas' },
    tab_analysis:        { de: 'Analysen',               en: 'Analytics' },
    tab_pmi:             { de: 'Themenanalyse',          en: 'Topic Analysis' },
    tab_lineage:         { de: 'Stammbaum',              en: 'Lineages' },
    tab_ego:             { de: 'Ego-Netzwerk',           en: 'Ego Network' },
    tab_alluvial:        { de: 'Themenfluss',             en: 'Topic Flow' },
    tab_sankey:          { de: 'Sankey',                  en: 'Sankey' },

    // ── Tool display names (used in guide + page headings) ────────
    tool_chronik:        { de: 'Chronik',                 en: 'Chronicle' },
    tool_gaze:           { de: 'Rezeptionsatlas',         en: 'Reception Atlas' },
    tool_analysis:       { de: 'Historische Analysen',    en: 'Historical Analytics' },
    tool_pmi:            { de: 'Diskurssignaturen',       en: 'Discourse Signatures' },
    pmi_page_title:      { de: 'Autoren × Themen Assoziationsanalyse', en: 'Intellectual Figure × Topic Associations' },

    // ── Reception Atlas sub-views ─────────────────────────────────
    gaze_A:              { de: 'Präsenz-Streudiagramm',   en: 'Presence Scatter' },
    gaze_B:              { de: 'Epochen-Heatmap',         en: 'Era Heatmap' },
    gaze_C:              { de: 'Top-Figuren Zeitreihe',   en: 'Top Figures Timeline' },

    // ── Historical Analytics sub-views ───────────────────────────
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
      de: 'Detaillierte Analyse: Rezeptionsatlas, Themenassoziationen, Autorencluster',
      en: 'Detailed Analysis: Reception Atlas, Topic Associations, Author Clusters'
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
    nav_analytics          : { de: 'Analyse', en: 'Analytics' },
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
    prog_welcome_note      : { en: 'Central Lugano · Tel. +41 91 922 24 15' },
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
    hist_p1                : { en: 'The <strong>Committee for the History of Economics (AGW)</strong> is one of the standing specialist committees of the Verein für Socialpolitik (VfS), the oldest professional association of economists in the world (founded 1873). The AGW was founded in 1980 on the initiative of Fritz Neumark; its first annual conference was held in Gießen. As an independent committee, it brings together research on the history of economic theory and doctrine in the German-speaking world.' },
    hist_p2                : { en: 'The study of the history of economic thought has a long tradition in the German-speaking world. In the era of the Historical School it was considered a natural part of training in economics; works such as Wilhelm Roscher\'s <em>Geschichte der Nationalökonomik in Deutschland</em> (1874) and Joseph Schumpeter\'s <em>Epochen der Dogmen- und Methodengeschichte</em> (1914) shaped the field. After the Second World War, however, the history of economic theory increasingly receded into the background in West Germany — a development the founding of the committee deliberately countered.' },
    hist_p3                : { en: 'Like the other specialist committees of the association, the AGW brings together specialists in its field, who are invited to the annual conferences to present and discuss their own work. The conferences are held at changing locations in Germany, Austria, and Switzerland, and occasionally abroad, and are usually devoted to a particular theme.' },
    hist_p4                : { en: 'Since the early 1980s the conference papers have appeared in the series <em>Studien zur Entwicklung der ökonomischen Theorie</em> (Schriften des Vereins für Socialpolitik, vol. 115), published by Duncker &amp; Humblot in Berlin. Now numbering more than forty volumes, it is the principal publication outlet for the German-language history of economic theory and doctrine; the early volumes were edited by the respective chairs of the committee.' },
    hist_p5                : { en: 'The volumes reflect the thematic breadth of the committee — from Adam Smith, mercantilism, and physiocracy, through nineteenth-century German economics and the theory of business cycles, to Friedrich List and, on the committee\'s tenth anniversary, the representation of the economy in imaginative literature. The 2022 Jahrestagung in Jena was dedicated to the 150th anniversary of the VfS (volume XLI of the series, ed. Peter Spahn).' },
    hist_p6                : { en: 'The AGW maintains close ties with the international sister societies ESHET (European Society for the History of Economic Thought) and HES (History of Economics Society), as well as with other national associations in the German- and European-language scholarly community.' },
    hist_note_title        : { en: 'Note on History' },
    hist_note_text         : { en: 'This section is being updated continuously. Members wishing to contribute to the history of the committee should contact the chair.' },
    further_reading_title  : { en: 'Further Reading' },
    further_reading_schefold : { en: 'Bertram Schefold, &ldquo;The Revival of Economic Thought in Germany: The <em>Dogmenhistorischer Ausschuss</em>,&rdquo; <em>History of Political Economy</em> 26, no.&nbsp;2 (1994), pp.&nbsp;327&ndash;335. <a href="https://doi.org/10.1215/00182702-26-2-327" target="_blank" rel="noopener">doi.org/10.1215/00182702-26-2-327</a>' },
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
    footer_updated         : { en: 'Updated: June 2026 · Subject to change' },
    // ── (uncategorised) ──
    hero_eyebrow           : { en: 'Committee for the History of Economics · Annual Conference 2026' },
    hero_pill_venue        : { en: 'Virginia Tech Steger Center · Riva San Vitale, Ticino' },
    hero_pill_days         : { en: 'Thu–Sat · 3 Days' },
    hero_org_by            : { en: 'Organised by' },
    hero_hosted_by         : { en: 'Hosted by' },
    card_thu_day           : { en: 'Thursday, 25 June' },
    card_thu_title         : { en: 'Welcome Dinner' },
    card_thu_note          : { en: 'Tel. +41 91 922 24 15 · www.trattoriagalleria.ch' },
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
      // ── Satzung (statutes) section ────────────────────────────────
    satz_title           : { en: 'Statutes of the Committee' },
    satz_p1              : { en: '<strong>§ 1 Purpose</strong> — The Committee fosters research and scholarly exchange in the history of economic thought. It supports early-career scholars and promotes excellence in its field.' },
    satz_p2              : { en: '<strong>§ 2 Membership</strong> — Members must have demonstrated scholarly standing in the history of economic thought and must hold membership in the Verein für Socialpolitik. Co-optation of new members requires a two-thirds majority of the General Assembly. Long-serving members who have retired may take Senior Member status (exempt from attendance requirements, without voting rights).' },
    satz_p3              : { en: '<strong>§ 3 Chairmanship</strong> — The Chair is elected by the General Assembly by secret ballot with simple majority for a two-year term. One re-election is permitted. The Chair conducts all ongoing affairs and represents the Committee on the Extended Board of the VfS.' },
    satz_p4              : { en: '<strong>§ 4 General Assembly</strong> — The General Assembly meets at least once annually during the Jahrestagung. Resolutions are adopted by simple majority; amendments to the statutes require a two-thirds majority. A quorum requires the presence of at least one quarter of voting members.' },
    satz_p7              : { en: '<strong>§ 7 Formal Matters</strong> — The statutes, membership list, and conference programmes of the Committee are publicly accessible (§ 7 para. 2).' },
    satz_pdf_title       : { en: 'Full Statutes' },
    satz_pdf_text        : { en: 'The full statutes are available as a PDF.<br><br><a href="AGW_Satzung.pdf" download style="color:inherit;font-weight:600;">Download statutes (PDF) ↓</a>' },
    satz_info_title      : { en: 'Foundation &amp; History' },
    satz_lbl_grund       : { en: 'Founded' },
    satz_val_grund       : { en: '1980 (1st Jahrestagung in Gießen)' },
    satz_lbl_tag         : { en: 'Conferences' },
    satz_val_tag         : { en: '46 Jahrestagungen (as of 2026)' },
    satz_lbl_mbr         : { en: 'Members' },
    satz_val_mbr         : { en: '48 (as of 2026)' },
    satz_lbl_pub         : { en: 'Publications' },
    satz_val_pub         : { en: '43 volumes (as of 2026)' },
    satz_lbl_chair       : { en: 'Chair' },
    // ── Missing translations gap-fill (audit 2026-06-03) ─────────
    sec_lbl_news         : { en: 'News' },
    sec_ttl_news         : { en: 'News &amp; Societies' },
    sec_ttl_news_only    : { de: 'Neuigkeiten', en: 'News' },
    link_societies       : { de: 'Schwestergesellschaften &amp; Zeitschriften →', en: 'Sister Societies &amp; Journals →' },
    sec_ttl_societies    : { en: 'Related Societies &amp; Journals' },
    sec_lbl_societies    : { de: 'Schwestergesellschaften', en: 'Sister Societies' },
    sec_lbl_chairs       : { en: 'Committee Chairs' },
    sec_ttl_chairs       : { en: 'Past Chairs of the Committee' },
    chairs_note          : { en: 'Tenure dates from c. 1990 reconstructed from conference proceedings; pre-1990 dates approximate.' },
    arch_view_list       : { en: 'List' },
    arch_view_map        : { en: 'Map' },
    arch_view_speakers   : { en: 'Speakers' },
    arch_map_note        : { en: 'All 46 conference venues since 1980.' },
    btn_ical             : { en: 'Calendar (.ics)' },
    lbl_map              : { en: 'Map' },
    footer_hosted_by_lbl : { en: 'Hosted by' },
    mbr_active           : { en: 'Active' },
    mbr_emeriti          : { en: 'Emeriti' },
    mbr_intl             : { en: 'Intl.' },
    mbr_privacy_text     : { en: 'Only names and institutions are published. For contact, please reach out to the Chair:' },
    mbr_privacy_title    : { en: 'Privacy notice' },
    nav_satzung          : { en: 'Statutes' },
    pub_bib_download     : { en: 'Full bibliography (.bib) ↓' },
    // ── Conference theme (hero) ───────────────────────────────────
    hero_title           : { de: 'Zukunftsperspektiven der Theoriegeschichte: Methoden, Themen, Kontroversen', en: 'Future Directions in the History of Economic Thought: Methods, Topics, Controversies' },
    news_h3              : { de: 'News', en: 'News' },
    // ── Paper/keynote titles — Option 3 (DE original + EN subtitle) ─
    prog_title_1        : { en: '<em>Der Stand und die Zukunft der theoriegeschichtlichen Forschung</em> <span class="title-trans">— The State and Future of Research in the History of Economic Thought</span>' },
    prog_title_2        : { en: '<em>Theoriegeschichte und Wissenschaftsphilosophie: Gedanken zum schlummernden Potenzial einer prekären Kooperation</em> <span class="title-trans">— History of Economic Thought and Philosophy of Science: Reflections on the Dormant Potential of a Precarious Collaboration</span>' },
    prog_title_3        : { en: '<em>Inhalt und Grenzen der «philosophie économique»</em> <span class="title-trans">— Scope and Limits of "philosophie économique"</span>' },
    prog_title_4        : { en: '<em>Worum geht es eigentlich? Zentrale Einsichten aus Gesprächen über die Theorie rationalen Entscheidens</em> <span class="title-trans">— What Is It Really About? Central Insights from Conversations on the Theory of Rational Choice</span>' },
    prog_title_5        : { en: '<em>Wirtschaft und Leben: Zu Friedrich von Gottl-Ottlilienfelds Ökonomik</em> <span class="title-trans">— Economy and Life: On Friedrich von Gottl-Ottlilienfeld\'s Economics</span>' },
    prog_title_6        : { en: '<em>Zwischen Freiburg und Michigan: Quantitative Textanalyse transnationaler Verbindungen in der ordoliberalen Tradition</em> <span class="title-trans">— Between Freiburg and Michigan: Quantitative Text Analysis of Transnational Connections in the Ordoliberal Tradition</span>' },
    prog_title_7        : { en: '<em>Theorien des wissenschaftlichen Fortschritts und Geschichtsschreibung der Wirtschaftswissenschaften</em> <span class="title-trans">— Theories of Scientific Progress and the Historiography of Economics</span>' },
    prog_title_8        : { en: '<em>Geschichte schreiben. Die Vergangenheit der ökonomischen Moderne</em> <span class="title-trans">— Writing History: The Past of Economic Modernity</span>' },
    prog_title_9        : { en: '<em>Wie Geschichte des ökonomischen Denkens unterrichten?</em> <span class="title-trans">— How to Teach the History of Economic Thought?</span>' },
    prog_title_10       : { en: '<em>Geschichte der ökonomischen Analyse – wozu? Eine kritische Auseinandersetzung mit dem Geschichtsverständnis der heutigen Ökonomen</em> <span class="title-trans">— History of Economic Analysis — What For? A Critical Engagement with the Historical Self-Understanding of Today\'s Economists</span>' },
    // ── Sister societies section (committee.html) ───────────
    soc_grp_parent       : { de: 'Übergeordnete Gesellschaft', en: 'Parent Organisation' },
    soc_grp_sisters      : { de: 'Internationale Schwestergesellschaften', en: 'International Sister Societies' },
    soc_grp_journals     : { de: 'Wichtige Fachzeitschriften', en: 'Major Journals' },
    soc_grp_more         : { de: 'Weitere internationale Gesellschaften', en: 'Further International Societies' },
    soc_organ_lbl        : { de: 'Organ:', en: 'Journal:' },
    soc_vfs_note         : { de: 'Trägerorganisation des AGW', en: 'Parent organisation of the AGW' },
    soc_hope_meta        : { de: 'Duke University Press · seit 1969', en: 'Duke University Press · since 1969' },
    soc_hei_meta         : { de: 'Fabrizio Serra Editore · seit 1993', en: 'Fabrizio Serra Editore · since 1993' },
    soc_oec_meta         : { de: 'Association Œconomia · Frankreich · zweisprachig FR/EN · seit 2011', en: 'Association Œconomia · France · bilingual FR/EN · since 2011' },
    // ── Action buttons & guide labels ────────────────────────────────────
    print_prog           : { de: '⎙ Programm drucken', en: '⎙ Print Programme' },
    guide_pdf_btn        : { de: 'Wissenschaftliches Handbuch herunterladen (PDF)', en: 'Download Academic Manual (PDF)' },
    tip_click            : { de: 'Klick', en: 'Click' },
    tip_hover            : { de: 'Hover', en: 'Hover' },
    tool_hero            : { de: 'Startseite', en: 'Landing Page' },
    guide_cite_title     : { de: 'Zitierweise / How to Cite', en: 'How to Cite' },
    guide_cite_sub       : { de: 'AGW Analytics in wissenschaftlichen Arbeiten zitieren', en: 'Citing AGW Analytics in academic publications' },
    guide_cite_desc      : { de: 'Wenn Sie Erkenntnisse, Daten oder Visualisierungen aus dem AGW Analytics-Modul in Ihrer Forschung verwenden, zitieren Sie bitte die Anwendung wie folgt:', en: 'If you use insights, data, or visualizations from the AGW Analytics module in your research, please cite the application as follows:' },
    footer_cite          : { de: 'Zitierweise', en: 'How to Cite' },
    footer_contact_lbl   : { de: 'Kontakt', en: 'Contact' },
    contact_channels_lbl : { de: 'Kontakt', en: 'Contact' },
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

  /** Set language and persist (mirrors index.html).
      Also broadcasts an 'agw-lang-change' event so React components
      compiled by esbuild can react without their own toggles. */
  window.AGW.setLang = function (l) {
    window.AGW._lang = l;
    try { localStorage.setItem('agw-lang', l); } catch (e) {}
    try {
      window.dispatchEvent(new CustomEvent('agw-lang-change', { detail: l }));
    } catch (e) {}
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
