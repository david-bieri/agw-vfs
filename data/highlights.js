/**
 * data/highlights.js — "Im Fokus" landing highlight manifest (index.html)
 * ────────────────────────────────────────────────────────────────────────────
 * Consumed by agw_highlights.js. Live HTML (bilingual, accessible) — the branded
 * raster cards from tools/agw_thumbnail.py are for social / og:image, not this.
 *
 *   featured.media : diptych of two gallery stems (img/gallery/<id>) rendered from
 *                    the existing -480/-960/-1440 avif+webp+jpg variants.
 *   rail[].img     : a plain thumbnail stem under img/highlights/<name>
 *                    (expects <name>.webp + <name>.jpg).
 *   Bilingual fields are { de, en }; scholarly titles stay German (single string).
 *
 * Edit freely (text is live, no rebuild). Bump the SW cache after editing — this
 * file is precached. Image files are runtime-cached, never precached.
 */
window.AGW = window.AGW || {};
window.AGW.HIGHLIGHTS = {
  eyebrow: { de: 'Im Fokus', en: 'In focus' },

  featured: {
    media: ['img/gallery/p4936', 'img/gallery/p4921'],
    kicker: { de: 'Neuer Vorsitz', en: 'New chair' },
    title:  { de: 'Prof. Dr. Rainer Klump übergibt den AGW-Vorsitz an Prof. Dr. Elisabeth Allgöwer',
              en: 'Prof. Rainer Klump hands over the AGW chair to Prof. Elisabeth Allgöwer' },
    meta:   { de: 'Amtsübergabe · 46. Jahrestagung, Riva San Vitale · Juni 2026',
              en: 'Handover of office · 46th Annual Conference, Riva San Vitale · June 2026' },
    href: 'jahrestagung-2026.html#impressionen',
    cta:  { de: 'Zum Rückblick', en: 'To the review' }
  },

  rail: [
    { img: 'img/highlights/svfs_cover_xliii', ratio: '3 / 4',
      kicker: { de: 'Neuerscheinung', en: 'New volume' },
      title: 'Ökonominnen. Frauen in der Geschichte der Wirtschaftswissenschaften',
      meta:  { de: 'Hrsg. Rainer Klump · SVfS 115/XLIII · 2025 · Open Access',
               en: 'Ed. Rainer Klump · SVfS 115/XLIII · 2025 · Open Access' },
      href: 'https://www.duncker-humblot.de/buch/oekonominnen-frauen-in-der-geschichte-der-wirtschaftswissenschaften-9783428196388/',
      cta:  { de: 'Duncker & Humblot', en: 'Duncker & Humblot' } },

    { img: 'img/highlights/oped_loesch', ratio: '1 / 1',
      kicker: { de: 'Im Feuilleton', en: 'In the press' },
      title: 'August Lösch: Der räumliche Visionär',
      meta:  { de: 'David Bieri · Frankfurter Allgemeine Zeitung',
               en: 'David Bieri · Frankfurter Allgemeine Zeitung' },
      href: 'https://www.faz.net/aktuell/wirtschaft/geooekonom-august-loesch-der-raeumliche-visionaer-accg-110760868.html',
      cta:  { de: 'faz.net', en: 'faz.net' } }
  ]
};
