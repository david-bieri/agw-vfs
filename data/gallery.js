/**
 * data/gallery.js — "Impressionen 2026" photo manifest for jahrestagung-2026.html
 * ────────────────────────────────────────────────────────────────────────────
 * Consumed by agw_gallery.js. Same data-driven pattern as EVENTS / ARCHIVE.
 *
 * Each shot:
 *   id  — file stem under AGW.GALLERY.dir. Expected files per shot:
 *           {dir}{id}-{w}.avif  and  {dir}{id}-{w}.webp   for each width in widths[]
 *           {dir}{id}.jpg                                   (fallback, ~1440px wide)
 *   w,h — intrinsic pixel size of the original (fixes the grid aspect box → no layout shift)
 *   alt — bilingual alt text (accessibility; also shown if the image fails to load)
 *   cap — bilingual caption (shown under the thumbnail and in the lightbox)
 *
 * ── HOW TO EDIT ────────────────────────────────────────────────────────────
 *   • Caption:  change cap.de / cap.en on the relevant line. One line per photo.
 *   • Reorder:  move the { … } entries within shots[].
 *   • Add:      drop new image files in img/gallery/ (same -480/-960/-1440 + .jpg
 *               set), then add a matching entry here.
 *   • Remove:   delete the entry (and optionally its image files).
 *   No rebuild step — this is plain JS loaded at runtime. Bump the SW cache after
 *   editing so clients pick up the change.
 *
 * NOTE: the captions below are AUTO-GENERATED PLACEHOLDERS (neutral venue/event
 *       framing) pending David's revised versions. Replace cap.de / cap.en freely.
 */
window.AGW = window.AGW || {};
window.AGW.GALLERY = {
  dir: 'img/gallery/',
  widths: [480, 960, 1440],
  shots: [
    { id: 'p4901', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p4905', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p4918', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p4921', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p4924', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p4929', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p4936', w: 5712, h: 4284,
      alt: { de: 'Impression von der 46. Jahrestagung des AGW, Villa Maderni, Riva San Vitale',
             en: 'Scene from the 46th AGW Annual Conference, Villa Maderni, Riva San Vitale' },
      cap: { de: '46. Jahrestagung des AGW · Villa Maderni, Riva San Vitale',
             en: '46th AGW Annual Conference · Villa Maderni, Riva San Vitale' } },

    { id: 'p1480b', w: 5472, h: 3648,
      alt: { de: 'Das Gipfelgebäude Fiore di pietra (Mario Botta) am Monte Generoso mit Alpenpanorama',
             en: 'The Fiore di pietra summit building (Mario Botta) on Monte Generoso with alpine panorama' },
      cap: { de: 'Fiore di pietra (Mario Botta) am Monte Generoso · Exkursion der 46. Jahrestagung',
             en: 'Fiore di pietra (Mario Botta) on Monte Generoso · 46th Annual Conference excursion' } },

    { id: 'p1473', w: 5472, h: 3648,
      alt: { de: 'Gruppenfoto der AGW-Teilnehmenden vor dem Fiore di pietra am Monte Generoso',
             en: 'Group photo of AGW participants in front of Fiore di pietra on Monte Generoso' },
      cap: { de: 'AGW-Teilnehmende am Monte Generoso · Exkursion 2026',
             en: 'AGW participants on Monte Generoso · 2026 excursion' } }
  ]
};
