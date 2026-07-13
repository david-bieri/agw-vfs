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
 *   preclassical   evolutionary   distribution   public_finance
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
    { id:'preclassical',  order:9,  de:'Vorklassik: Merkantilismus, Kameralismus & Physiokratie', en:'Pre-classical: Mercantilism, Cameralism & Physiocracy' },
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
      authors:'Joachim Zweynert', venue:'Routledge', year:2018 },

    /* ── Ergänzungen 2026: selected further publications ───────────────────
     * Curated by the maintainer from the master bibliography for the members whose
     * AGW chapter record is thin (≤1 chapter) — for everyone else the Tagungsband
     * chapters already carry the page. Explicitly a SELECTION („ausgewählte
     * Publikationen“), which is what caps the maintenance obligation (ADR-029).
     * Titles already present in VOLUME_CHAPTERS were excluded, so nothing is
     * double-listed as both an AGW contribution and a „further publication“. */
    // ── Dirk Ehnts ──
    { mid:'ehnts-dirk', themes:['monetary'],
      title:'Knapp\'s `State Theory of Money\' and its Reception in German Academic Discourse', type:'wp',
      authors:'Dirk Ehnts', venue:'Institute for International Political Economy, Berlin School of Economics and Law', year:2019 },
    { mid:'ehnts-dirk', themes:['spatial','methodology'],
      title:'From New Trade Theory to New Economic Geography: A Space Odyssey', type:'article',
      authors:'Dirk Ehnts · Hans-Michael Trautwein', venue:'Œconomia: A Journal for the History, Methodology and Philosophy of Economics', year:2012 },

    // ── Hans Frambach ──
    { mid:'frambach-hans', themes:['general'],
      title:'On the Economic Significance of the Catholic Social Doctrine: 125 Years of Rerum Novarum', type:'edited',
      authors:'Jürgen Backhaus · Günther Chaloupek · Hans A. Frambach', venue:'SPringer International', year:2017 },
    { mid:'frambach-hans', themes:['general'],
      title:'How to Fight Unemployment? A Review of the Strategy Discussion in ``Der Deutsche Volkswirt\'\', 1930–1932', type:'chapter',
      authors:'Hans A. Frambach', venue:'Springer', year:2011 },

    // ── Horst Todt ──
    { mid:'todt-horst', themes:['spatial'],
      title:'Die Struktur der Wirtschaftsraumes: Eine vergleichende Betrachtung der Konzeptionen von Walter Christaller und August Lösch', type:'chapter',
      authors:'Horst Todt', venue:'Duncker und Humblot', year:2014 },

    // ── Ingo Barens ──
    { mid:'barens-ingo', themes:['keynesian','monetary'],
      title:'Keynes on Monetary Policy, Finance and Uncertainty', type:'article',
      authors:'Ingo Barens', venue:'European Journal of the History of Economic Thought', year:2012 },
    { mid:'barens-ingo', themes:['keynesian','monetary'],
      title:'“Animal spirits” in John Maynard Keynes\'s General Theory of Employment, Interest and Money: Some Short and Sceptical Remarks', type:'wp',
      authors:'Ingo Barens', venue:'Technische Universität Darmstadt, Department of Law and Economics', year:2011 },

    // ── Jan Greitens ──
    { mid:'greitens-jan', themes:['monetary','preclassical'],
      title:'Geldtheorie und -politik in Preußen Mitte des 18. Jahrhunderts', type:'article',
      authors:'Jan Greitens', venue:'Jahrbuch für Wirtschaftsgeschichte / Economic History Yearbook 61(1), 217–257', year:2020,
      doi:'10.1515/jbwg-2020-0010' },
    { mid:'greitens-jan', themes:['monetary','econ_history'],
      title:'Monetary Anchors in a Digital Age: A Historical Perspective on the ECB\u2019s Digital Euro and US Stablecoins', type:'wp',
      authors:'Jan Greitens', venue:'IBF Paper Series 02-26, Institut f\u00fcr Bank- und Finanzgeschichte, Frankfurt a.M.', year:2026,
      url:'https://hdl.handle.net/10419/340050' },

    // ── Jan-Otmar Hesse ──
    { mid:'hesse-jan-otmar', themes:['general'],
      title:'Wirtschaft als Wissenschaft: Die Volkswirtschaftslehre in der frühen Bundesrepublik', type:'book',
      authors:'Jan-Otmar Hesse', venue:'Campus Verlag', year:2010 },
    { mid:'hesse-jan-otmar', themes:['general'],
      title:'Some Relationships between a Scholar\'s and an Entrepreneur\'s Life: The Biography of L. Albert Hahn', type:'article',
      authors:'Jan-Otmar Hesse', venue:'History of Political Economy', year:2007 },

    // ── Jochen Hartwig ──
    { mid:'hartwig-jochen', themes:['general'],
      title:'Testing the Baumol-Norhaus Model with EU KLEMS Data', type:'article',
      authors:'Jochen Hartwig', venue:'Review of Income and Wealth', year:2011 },

    // ── Johannes Schmidt ──
    { mid:'schmidt-johannes', themes:['general'],
      title:'Die Bedeutung der Saldenmechanik für die makroökonomische Theoriebildung', type:'chapter',
      authors:'Johannes Schmidt', venue:'Metropolis-Verlag', year:2011 },
    { mid:'schmidt-johannes', themes:['monetary','distribution'],
      title:'Wachstum und Verteilung in der Geldwirtschaft: Das wissenschaftliche Werk Erich Preiser (1900-1967)', type:'book',
      authors:'Johannes Schmidt', venue:'Metropolis-Verlag', year:1998 },

    // ── Karl Milford ──
    { mid:'milford-karl', themes:['methodology','econ_history'],
      title:'Theoretical and Methodological Positions of German Economics in the Middle of the Nineteenth Centruy', type:'article',
      authors:'Erich W. Streissler · Karl Milford', venue:'History of Economic Ideas', year:1993 },

    // ── Nils Goldschmidt ──
    { mid:'goldschmidt-nils', themes:['austrian','ordoliberal'],
      title:'Walter Eucken’s Place in the History of Ideas', type:'article',
      authors:'Nils Goldschmidt', venue:'Review of Austrian Economics', year:2013 },
    { mid:'goldschmidt-nils', themes:['ordoliberal','methodology'],
      title:'The Philosophy of Social Market Economy: Michel Foucault’s Analysis of Ordoliberalism', type:'article',
      authors:'Nils Goldschmidt · Hermann Rauchenschwandtner', venue:'Journal of Contextual Economics – Schmollers Jahrbuch 138(2), 157–184', year:2018,
      doi:'10.3790/schm.138.2.157' },
    { mid:'goldschmidt-nils', themes:['ordoliberal'],
      title:'Phänomenologie und die Ordnung der Wirtschaft: Edmund Husserl, Rudolf Eucken, Walter Eucken, Michel Foucault', type:'edited',
      authors:'Hans-Helmuth Gander · Nils Goldschmidt · Uwe Dathe', venue:'Ergon Verlag', year:2009 },

    // ── Stefan Kolev ──
    { mid:'kolev-stefan', themes:['ordoliberal'],
      title:'Transatlantic Roads to Mont Pèlerin: “Old Chicago” and Freiburg in a World of Disintegrating Orders', type:'article',
      authors:'Stefan Kolev · Ekkehard A. Köhler', venue:'History of Political Economy 54(4), 745–784', year:2022,
      doi:'10.1215/00182702-9895916' },
    { mid:'kolev-stefan', themes:['austrian','ordoliberal'],
      title:'Paleo- and Neoliberals: Ludwig von Mises and the “Ordo-interventionists”', type:'chapter',
      authors:'Stefan Kolev', venue:'in: Commun/Kolev (Hrsg.), Wilhelm Röpke (1899–1966), Springer, S. 65–90', year:2018,
      doi:'10.1007/978-3-319-68357-7_5' },

    /* ── ORCID seed 2026 ─────────────────────────────────────
     * Harvested via tools/orcid_seed.py, then selected and verified by hand.
     * Not everything ORCID returned is here, and that is deliberate:
     *   • Michael Wohlgemuth's ORCID hit was a DIFFERENT PERSON (an open-access /
     *     bibliometrics researcher at Bielefeld, not the ordoliberal economist).
     *     Nothing was taken from it. Homonyms are the standing hazard here.
     *   • Stephan Thomsen's record claims Band XXXVII as an EDITED volume; the
     *     publisher's own citation gives the editor as Caspari. He has a chapter in
     *     it, which the corpus already carries. Not added.
     *   • Helmut Wagner's five hits were one book in two language editions plus three
     *     of its own chapters. Listed once. (One of those DOIs also had a typo:
     *     10.10l07/… with a lowercase L.) */
    // ── Eduard Braun ──
    { mid:'braun-eduard', themes:['austrian','distribution'],
      title:'Capital is not a factor of production but organizes the allocation and distribution of resources in capitalism', type:'article',
      authors:'Eduard Braun', venue:'The Review of Austrian Economics 38(4)', year:2025,
      doi:'10.1007/s11138-024-00655-1' },
    { mid:'braun-eduard', themes:['historical','monetary'],
      title:'The German Historical School on Monetary Calculation and the Feasibility of Socialism', type:'article',
      authors:'Eduard Braun', venue:'Journal of Institutional Economics 19(5)', year:2023,
      doi:'10.1017/S1744137423000127' },
    { mid:'braun-eduard', themes:['austrian','distribution'],
      title:'Carl Menger’s Contribution to Capital Theory', type:'chapter',
      authors:'Eduard Braun', venue:'in: Mengerian Economics, Edward Elgar', year:2023,
      doi:'10.4337/9781035302895.00012' },

    // ── Hagen Krämer ──
    { mid:'kraemer-hagen', themes:['general'],
      title:'The Gypsy Economist: The Life and Times of Colin Clark', type:'article',
      authors:'Hagen M. Krämer', venue:'European Journal of the History of Economic Thought 30(1)', year:2023,
      doi:'10.1080/09672567.2022.2138898' },
    { mid:'kraemer-hagen', themes:['general','methodology'],
      title:'What are services? Misconceptions and neglected insights from the productivity controversy in the classical period', type:'article',
      authors:'Hagen M. Krämer', venue:'European Journal of the History of Economic Thought 30(6)', year:2023,
      doi:'10.1080/09672567.2023.2292804' },
    { mid:'kraemer-hagen', themes:['marxian','keynesian','evolutionary'],
      title:'The Marx-Keynes-Schumpeter System, Part I: Long Waves and Short Cycles in the Capitalist Growth Record', type:'chapter',
      authors:'Hagen M. Krämer · Christian R. Proaño · Mark Setterfield', venue:'in: Capitalism, Inclusive Growth, and Social Protection, Edward Elgar', year:2023,
      doi:'10.4337/9781786433077.00010' },

    // ── Oliver Landmann ──
    { mid:'landmann-oliver', themes:['monetary'],
      title:'On the Logic of Fiscal Policy Coordination in a Monetary Union', type:'article',
      authors:'Oliver Landmann', venue:'Open Economies Review 29(1)', year:2018,
      doi:'10.1007/s11079-017-9446-z' },

    // ── Richard Sturn ──
    { mid:'sturn-richard', themes:['public_finance','general'],
      title:'From public finance to public economics', type:'article',
      authors:'Maxime Desmarais-Tremblay · Marianne Johnson · Richard Sturn', venue:'European Journal of the History of Economic Thought 30(5)', year:2023,
      doi:'10.1080/09672567.2023.2248323' },
    { mid:'sturn-richard', themes:['methodology','general'],
      title:'Ideology, power, and progress: Economics and its dilemmas', type:'article',
      authors:'Richard Sturn', venue:'Acta Oeconomica 72(S1)', year:2022,
      doi:'10.1556/032.2022.00020' },
    { mid:'sturn-richard', themes:['preclassical','methodology'],
      title:'Agency, exchange, and power in scholastic thought', type:'article',
      authors:'Richard Sturn', venue:'European Journal of the History of Economic Thought 24(4)', year:2017,
      doi:'10.1080/09672567.2017.1338393' },

    // ── Helmut Wagner ──
    { mid:'wagner-helmut', themes:['general'],
      title:'China: Quo Vadis?', type:'book',
      authors:'Helmut Wagner', venue:'Springer Fachmedien Wiesbaden', year:2025,
      doi:'10.1007/978-3-658-46816-3' },
  ];

  window.AGW_DATA.PUB_THEMES  = PUB_THEMES;
  window.AGW_DATA.MEMBER_PUBS = MEMBER_PUBS;

  // Back-compat globals (mirrors the pattern used by agw_data.js)
  window.PUB_THEMES  = PUB_THEMES;
  window.MEMBER_PUBS = MEMBER_PUBS;
})();
