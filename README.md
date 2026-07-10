# AGW – Ausschuss für die Geschichte der Wirtschaftswissenschaften

**Website & standing-committee presence of the AGW within the Verein für Socialpolitik (VfS).**

[![Deploy to GitHub Pages](https://github.com/david-bieri/agw-vfs/actions/workflows/pages.yml/badge.svg)](https://github.com/david-bieri/agw-vfs/actions/workflows/pages.yml)

🌐 **Live:** [www.agw-vfs.de](https://www.agw-vfs.de)
📚 The AGW is the VfS standing committee for the history of economic thought (Theorie- und Dogmengeschichte).
📅 The 46th Jahrestagung (Riva San Vitale, 25–27 June 2026) has concluded; the site is now the committee's evergreen home.

---

## Architecture

Static, multi-page site — **no framework, no backend, no build step for the pages**. The only build step is the React analytics bundles, compiled with esbuild and loaded via an importmap from esm.sh.

```
index.html               Committee landing (hero constellation + "Im Fokus")
events.html              Unified timeline: Jahrestagungen + affiliated events
jahrestagung-2026.html   Archival page for the 2026 conference (+ Impressionen gallery)
archive.html             Scholarly archive + publications
committee.html           About · history · members · chairs · societies · statutes
analytics.html           Interactive analytics (Stammbaum, Schulen, Rezeptionsatlas, …)
guide.html               Analytics user guide

agw_styles.css           Shared styles                 agw_data.js     Shared data (CHAIRS, MEMBERS, ARCHIVE, PUBLICATIONS, EVENTS, …)
agw_strings.js           i18n registry (DE/EN)         agw_app.js      Shared render/init logic
agw_nav.js               Shared nav + footer           agw_chronik.js  Chronik panel
agw_hero_viz.js          Hero constellation            agw_schools_net.js  Denkschulen network panel
agw_gallery.js           Impressionen gallery+lightbox agw_highlights.js   "Im Fokus" landing band
data/                    gallery.js · highlights.js · *.json (analytics/network data)
dist/                    Compiled React analytics bundles (sources in gitignored src-jsx/)
img/gallery/  img/highlights/   Photos + generated cards
tools/                   agw_thumbnail.py (social-card generator) · gallery_add.py · fonts/ · docs
service-worker.js        PWA cache (bump the version on any precached-asset change)
```

**Languages:** German (default) · English (toggle, top right). All translations live in `agw_strings.js`.
**Deployment:** GitHub Pages via GitHub Actions (auto-deploy on push to `main`), custom domain `www.agw-vfs.de`.

---

## Updating content

No build step — edit the data files directly, then bump the service-worker cache and push.

| What | Where |
|---|---|
| Members, chairs, archive, publications | arrays in `agw_data.js` |
| Events (affiliated conferences/seminars) | `EVENTS` / `EVENT_NETWORKS` in `agw_data.js` |
| Translations | `agw_strings.js` |
| Gallery photos | `data/gallery.js` + `img/gallery/` (see `tools/GALLERY.md`) |
| "Im Fokus" landing highlights | `data/highlights.js` |
| Denkschulen network | `NET` object in `agw_schools_net.js` |
| Social / og:image cards | `tools/agw_thumbnail.py` → `img/highlights/` (see `tools/THUMBNAIL.md`) |

Full guide: **[AGW_README.md](AGW_README.md)** · Decisions: **[AGW_DECISIONS.md](AGW_DECISIONS.md)**

---

## Deployment

```bash
git clone https://github.com/david-bieri/agw-vfs.git && cd agw-vfs
# edit files …
git add .
git commit -m "content: …"
git push          # GitHub Actions deploys to GitHub Pages
```

After any change to a **precached** asset, bump `const CACHE = 'agw-2026-vN-…'` in `service-worker.js`, then unregister the old SW once and hard-reload to confirm. Image files are runtime-cached (not precached) and don't require a bump on their own.

---

## Contact

**Host, Jahrestagung 2026:** Dr. David Bieri · [bieri@vt.edu](mailto:bieri@vt.edu) · Virginia Tech SPIA
**Committee chair:** Prof. Dr. Elisabeth Allgöwer (from 2026; succeeding Prof. Dr. Rainer Klump)
**VfS · AGW:** [history-economicthought.committee.socialpolitik.de](https://history-economicthought.committee.socialpolitik.de/)
