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
 * NOTE: captions were written by David (2026-07). ONE placeholder remains: p4901 still
 *       carries the neutral venue framing — replace cap.de / cap.en when known.
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
      alt: { de: 'Konferenzraum im Neubau der Villa Maderni, 46. Jahrestagung des AGW',
             en: 'Conference room in the new wing of the Villa Maderni, 46th AGW Annual Conference' },
      cap: { de: 'Konferenzraum im Neubau der Villa Maderni',
             en: 'Conference room in the new wing of the Villa Maderni' } },

    { id: 'p4918', w: 5712, h: 4284,
      alt: { de: 'Übergabe der Jubiläumsausgabe der „Revue de Philosophie Économique“ während der 46. Jahrestagung des AGW',
             en: 'Presentation of the anniversary issue of the “Revue de Philosophie Économique” during the 46th AGW Annual Conference' },
      cap: { de: 'Gilles Campagnolo (CNRS, Paris) überreicht die Jubiläumsausgabe der „Revue de Philosophie Économique“ an David Bieri (Virginia Tech, Blacksburg) und Sara Steinert Borella (Virginia Tech, Riva)',
             en: 'Gilles Campagnolo (CNRS, Paris) presents the anniversary issue of the “Revue de Philosophie Économique” to David Bieri (Virginia Tech, Blacksburg) and Sara Steinert Borella (Virginia Tech, Riva)' } },

    { id: 'p4921', w: 4284, h: 5712,
      alt: { de: 'Lesesaal der Villa Maderni, Riva San Vitale',
             en: 'Reading room of the Villa Maderni, Riva San Vitale' },
      cap: { de: 'Lesesaal der Villa Maderni',
             en: 'Reading room of the Villa Maderni' } },

    { id: 'p4924', w: 5712, h: 4284,
      alt: { de: 'Bertram Schefold beim traditionellen Kamingespräch der Jahrestagung',
             en: 'Bertram Schefold delivering the conference’s traditional fireside talk' },
      cap: { de: 'Traditionelles Kamingespräch von Bertram Schefold (Frankfurt) zu „Raffaels Schule von Athen“',
             en: 'Bertram Schefold (Frankfurt) gives the traditional fireside talk on “Raffaels Schule von Athen”' } },

    { id: 'p4929', w: 5712, h: 4284,
      alt: { de: 'Blick auf den Luganersee aus Riva San Vitale',
             en: 'View of Lake Lugano from Riva San Vitale' },
      cap: { de: 'Blick auf den Luganersee aus Riva San Vitale',
             en: 'View of Lake Lugano from Riva San Vitale' } },

    { id: 'p4936', w: 4284, h: 5712,
      alt: { de: 'Übergabe der Glocke des AGW-Vorsitzes von Rainer Klump an Elisabeth Allgoewer',
             en: 'Handover of the AGW chair’s bell from Rainer Klump to Elisabeth Allgoewer' },
      cap: { de: 'Übergabe der Glocke des AGW-Vorsitzes von Rainer Klump an Elisabeth Allgoewer',
             en: 'Handover of the AGW chair’s bell from Rainer Klump to Elisabeth Allgoewer' } },

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
