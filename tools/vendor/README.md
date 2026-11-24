# vendor/ — third-party code served from our own origin

No page loads script, style or font from a third-party host (privacy hardening,
2026-11-24, SW v78–v79). Everything here is a verbatim upstream artefact or a
reproducible build of one.

| Path | What | Version | Source | Licence |
|---|---|---|---|---|
| `vendor/leaflet/` | Leaflet JS + CSS + images | 1.9.4 | npm `leaflet@1.9.4` `dist/` (upstream build, unmodified) | BSD-2-Clause (`vendor/leaflet/LICENSE`) |
| `vendor/qrcodejs/qrcode.min.js` | QR code for the conference page | 1.0.0 | byte-identical to the cdnjs file the site loaded before | MIT (davidshimjs/qrcodejs) |
| `vendor/esm/` | React, react-dom, react-dom/client, react/jsx-runtime, recharts, d3 for `analytics.html` | react 18.3.1 · react-dom 18.3.1 · recharts 2.15.4 · d3 7.9.2 | built by `tools/vendor/build_vendor.sh` | MIT / ISC (licence comments at end of each file) |
| `fonts/` | EB Garamond, Source Sans 3 (woff2, latin + latin-ext) | @fontsource 5.3.0 / 5.3.1 | npm `@fontsource/*` `files/` | OFL-1.1 (`fonts/OFL-*.txt`) |

## Rules

- **`vendor/esm/` is one build.** Never replace a single file in it: the entries
  share hashed chunks, and React must exist exactly once (ADR-018). Rebuild all of
  it with `build_vendor.sh`, then click through **every** analytics tab with the
  console open before committing.
- The analytics importmap in `analytics.html` maps each bare specifier to
  `./vendor/esm/<name>.js`. A new React-dependent library goes into
  `build_vendor.sh` as a new entry, not onto a CDN.
- Map **tiles** still come from `tile.openstreetmap.org`, but only after a visitor
  opens a map; that is the one remaining third-party request.
