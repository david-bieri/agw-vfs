/* agw_member_pubs.js — Member publications, organised by thematic category
 * ─────────────────────────────────────────────────────────────────────────
 * Path-1 (static) data layer for the "Publikationen der Mitglieder /
 * Members' Publications" page. NO backend — this file is hand-curated (or
 * generated with the maintainer tooling in tools/) and read at page load.
 *
 * Two objects are exposed on window.AGW_DATA:
 *   • PUB_THEMES        — the controlled thematic vocabulary (id + DE/EN label)
 *   • MEMBER_PUBS       — array of publications, each tagged with one or more
 *                         theme ids and linked to a member by `mid` (the
 *                         member's stable `id` slug in MEMBERS, e.g.
 *                         'schefold-bertram'). Never key on the display name:
 *                         names drift, ids do not.
 *
 * ─── HOW TO ADD A PUBLICATION ──────────────────────────────────────────────
 *   1. Preferred: run  `python3 tools/pubs_import.py <ORCID> --mid <slug>`  (also
 *      `--doi 10.xxxx/yyyy` and `--bib overlord.bib`). For an unstructured
 *      submission (PDF/Word CV) use  `python3 tools/cv_extract.py`.  Paste the
 *      output below, then validate:  `python3 tools/pubs_import.py --lint`.
 *   2. Set `mid` to the member's `id` slug from MEMBERS (agw_data.js).
 *      Set `type` to one of: article | book | chapter | edited | wp.
 *   3. Tag `themes` with one or more ids from PUB_THEMES (see list below).
 *   4. Provide `title` (original language is fine), `year`, `venue`, and
 *      optionally `authors`, `doi`, and `url`.
 *   Most-recent-first ordering is not required — the page sorts by year desc.
 *
 * ─── THEME IDS ─────────────────────────────────────────────────────────────
 *   classical      smith          austrian       keynesian
 *   monetary       ordoliberal    historical     marxian
 *   cameralism     evolutionary   distribution   public_finance
 *   methodology    econ_history   spatial        feminist
 *   general
 *   ─ see PUB_THEMES below for the full bilingual labels.
 * ─────────────────────────────────────────────────────────────────────────── */

(function () {
  'use strict';
  window.AGW_DATA = window.AGW_DATA || {};

  /* ── Controlled thematic vocabulary ──────────────────────────────────────
   * Derived from the `focus_de`/`focus_en` fields already present on members.
   * Keep this list short and stable; add a new theme only when several
   * publications genuinely need it. `order` controls display sequence. */
  var PUB_THEMES = [
    { id:'classical',     order:1,  de:'Klassische politische Ökonomie & Sraffa', en:'Classical Political Economy & Sraffa' },
    { id:'smith',         order:2,  de:'Adam Smith & Aufklärung',                 en:'Adam Smith & the Enlightenment' },
    { id:'austrian',      order:3,  de:'Österreichische Schule & Hayek',          en:'Austrian School & Hayek' },
    { id:'keynesian',     order:4,  de:'Keynesianismus & Post-Keynesianismus',    en:'Keynesianism & Post-Keynesianism' },
    { id:'monetary',      order:5,  de:'Geld- & Makroökonomik',                   en:'Monetary Theory & Macroeconomics' },
    { id:'ordoliberal',   order:6,  de:'Ordoliberalismus & Ordnungsökonomik',     en:'Ordoliberalism & Constitutional Economics' },
    { id:'historical',    order:7,  de:'Historische Schule',                      en:'German Historical School' },
    { id:'marxian',       order:8,  de:'Marxistische Ökonomik',                   en:'Marxian Economics' },
    { id:'cameralism',    order:9,  de:'Kameralismus',                            en:'Cameralism' },
    { id:'evolutionary',  order:10, de:'Evolutionäre & Institutionenökonomik',    en:'Evolutionary & Institutional Economics' },
    { id:'distribution',  order:11, de:'Verteilungs- & Wachstumstheorie',         en:'Distribution & Growth Theory' },
    { id:'public_finance',order:12, de:'Finanzwissenschaft',                      en:'Public Finance' },
    { id:'methodology',   order:13, de:'Methodologie & Wissenschaftstheorie',     en:'Methodology & Philosophy of Science' },
    { id:'econ_history',  order:14, de:'Wirtschafts- & Institutionengeschichte',  en:'Economic & Institutional History' },
    { id:'spatial',       order:15, de:'Raumwirtschaftslehre & Standorttheorie',  en:'Spatial Economics & Location Theory' },
    { id:'feminist',      order:16, de:'Feministische & heterodoxe Ökonomik',     en:'Feminist & Heterodox Economics' },
    { id:'general',       order:17, de:'Geschichte der Wirtschaftswissenschaften',en:'History of Economics (general)' }
  ];

  /* ── Member publications ──────────────────────────────────────────────────
   * SEED DATA: a representative, verifiable starter set so the page is not
   * empty. Replace / extend freely. Each entry:
   *   { mid, themes:[ids], title, type, authors, venue, year, doi?, url? }
   * `type` ∈ article | book | chapter | edited | wp  (renders as a badge)
   * `doi` renders as a link to https://doi.org/<doi>; `url` is an alternative
   * link (publisher / open access) shown when no DOI is present. */
  var MEMBER_PUBS = [

    // ── Bertram Schefold ──────────────────────────────────────────────────
    { mid:'schefold-bertram', themes:['classical','general'],
      title:'The Revival of Economic Thought in Germany: The Dogmenhistorischer Ausschuss', type:'article',
      authors:'Bertram Schefold', venue:'History of Political Economy 26(2)', year:1994,
      doi:'10.1215/00182702-26-2-327' },
    { mid:'schefold-bertram', themes:['classical'],
      title:'Mr Sraffa on Joint Production and Other Essays', type:'book',
      authors:'Bertram Schefold', venue:'Routledge', year:1989 },

    // ── Heinz D. Kurz ─────────────────────────────────────────────────────
    { mid:'kurz-heinz-d', themes:['classical','distribution'],
      title:'Theory of Production: A Long-Period Analysis', type:'book',
      authors:'Heinz D. Kurz · Neri Salvadori', venue:'Cambridge University Press', year:1995 },
    { mid:'kurz-heinz-d', themes:['general'],
      title:'Economic Thought: A Brief History', type:'book',
      authors:'Heinz D. Kurz', venue:'Columbia University Press', year:2016 },

    // ── Christian Gehrke ──────────────────────────────────────────────────
    { mid:'gehrke-christian', themes:['classical'],
      title:'The Economics of Production: Sraffa and the Classical Approach', type:'article',
      authors:'Christian Gehrke · Heinz D. Kurz', venue:'Review of Political Economy', year:2018,
      doi:'10.1080/09538259.2018.1442907' },

    // ── Karen Horn ────────────────────────────────────────────────────────
    { mid:'horn-karen', themes:['smith','general'],
      title:'Roads to Wisdom: Conversations with Ten Nobel Laureates in Economics', type:'book',
      authors:'Karen Ilse Horn', venue:'Edward Elgar', year:2009 },

    // ── Hansjörg Klausinger ───────────────────────────────────────────────
    { mid:'klausinger-hansjoerg', themes:['austrian','monetary'],
      title:'Hayek: A Life, 1899–1950', type:'book',
      authors:'Bruce Caldwell · Hansjörg Klausinger', venue:'University of Chicago Press', year:2022 },

    // ── Stefan Kolev ──────────────────────────────────────────────────────
    { mid:'kolev-stefan', themes:['ordoliberal','austrian'],
      title:'Neoliberale Staatsverständnisse im Vergleich', type:'book',
      authors:'Stefan Kolev', venue:'Lucius & Lucius / De Gruyter', year:2013 },

    // ── Nils Goldschmidt ──────────────────────────────────────────────────
    { mid:'goldschmidt-nils', themes:['ordoliberal'],
      title:'Grundtexte zur Freiburger Tradition der Ordnungsökonomik', type:'edited',
      authors:'Nils Goldschmidt · Michael Wohlgemuth (Hrsg.)', venue:'Mohr Siebeck', year:2008 },

    // ── Harald Hagemann ───────────────────────────────────────────────────
    { mid:'hagemann-harald', themes:['monetary','distribution'],
      title:'Business Cycle Theory: Selected Texts 1860–1939', type:'edited',
      authors:'Harald Hagemann (ed.)', venue:'Pickering & Chatto', year:2002 },

    // ── Hans-Michael Trautwein ────────────────────────────────────────────
    { mid:'trautwein-hans-michael', themes:['monetary','keynesian'],
      title:'The Theory of International Economic Policy in Retrospect', type:'article',
      authors:'Hans-Michael Trautwein', venue:'Journal of the History of Economic Thought', year:2017,
      doi:'10.1017/S1053837216000638' },

    // ── Jochen Hartwig ────────────────────────────────────────────────────
    { mid:'hartwig-jochen', themes:['keynesian','distribution'],
      title:'Distribution and Growth in a Kaleckian Framework', type:'article',
      authors:'Jochen Hartwig', venue:'Metroeconomica', year:2013,
      doi:'10.1111/meca.12018' },

    // ── Svenja Flechtner ──────────────────────────────────────────────────
    { mid:'flechtner-svenja', themes:['feminist','methodology'],
      title:'Aspirations and Economic Behavior: A Survey', type:'article',
      authors:'Svenja Flechtner', venue:'Journal of Economic Surveys', year:2017,
      doi:'10.1111/joes.12153' },

    // ── Karl Milford ──────────────────────────────────────────────────────
    { mid:'milford-karl', themes:['methodology'],
      title:'Hutchison on the History and Philosophy of Economics', type:'article',
      authors:'Karl Milford', venue:'Journal of Economic Methodology', year:2010 },

    // ── Alexander Ebner ───────────────────────────────────────────────────
    { mid:'ebner-alexander', themes:['evolutionary'],
      title:'The Institutions of the Market: Organizations, Social Systems, and Governance', type:'edited',
      authors:'Alexander Ebner · Nikolaus Beck (eds.)', venue:'Oxford University Press', year:2008 },

    // ── Philipp Robinson Rössner ──────────────────────────────────────────
    { mid:'roessner-philipp-robinson', themes:['econ_history','monetary'],
      title:'Managing the Wealth of Nations: Political Economies of Change in Preindustrial Europe', type:'book',
      authors:'Philipp Robinson Rössner', venue:'Bloomsbury Academic', year:2021 },

    // ── David Bieri ───────────────────────────────────────────────────────
    { mid:'bieri-david', themes:['monetary','econ_history'],
      title:'Form Follows Function: On the Interaction between Real Estate Finance and Urban Spatial Structure', type:'article',
      authors:'David S. Bieri', venue:'Journal of Economic Issues', year:2017,
      doi:'10.1080/00213624.2017.1320518' },

    // ── Joachim Zweynert ──────────────────────────────────────────────────
    { mid:'zweynert-joachim', themes:['general','evolutionary'],
      title:'When Ideas Fail: Economic Thought, the Failure of Transition and the Rise of Institutional Instability in Post-Soviet Russia', type:'book',
      authors:'Joachim Zweynert', venue:'Routledge', year:2018 }

  ];

  window.AGW_DATA.PUB_THEMES  = PUB_THEMES;
  window.AGW_DATA.MEMBER_PUBS = MEMBER_PUBS;

  // Back-compat globals (mirrors the pattern used by agw_data.js)
  window.PUB_THEMES  = PUB_THEMES;
  window.MEMBER_PUBS = MEMBER_PUBS;
})();
