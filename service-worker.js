/* AGW Jahrestagung 2026 — Service Worker
 * Strategy: Cache-first for shell + static assets; network-first for tiles
 */
const CACHE = 'agw-2026-v59-archive-map';

const PRECACHE = [
  '/',
  '/index.html',
  '/archive.html',
  '/committee.html',
  '/events.html',
  '/jahrestagung-2026.html',
  '/analytics.html',
  '/guide.html',
  '/publications-members.html',
  '/manifest.json',
  // Foundation files (loaded by every page)
  '/agw_styles.css',
  '/agw_strings.js',
  '/agw_data.js',
  '/agw_app.js',
  '/agw_nav.js',
  '/agw_chronik.js',
  '/agw_hero_viz.js',
  '/agw_schools_net.js',
  '/agw_gallery.js',
  '/agw_highlights.js',
  '/agw_member_pubs.js',
  '/agw_volume_chapters.js',
  '/agw_cite.js',
  '/agw_member_pubs_app.js',
  // Analytics & visualization modules
  '/dist/agw_gaze_map.js',
  '/dist/agw_scrollytelling.js',
  '/dist/agw_analysis.js',
  '/dist/agw_pmi.js',
  '/dist/agw_sankey.js',
  '/dist/agw_alluvial.js',
  '/dist/agw_ego_network.js',
  '/dist/school_labels.js',
  // New feature modules
  '/dist/agw_pathways.js',
  '/dist/agw_temporal.js',
  '/dist/agw_school_compare.js',
  '/dist/agw_product_tips.js',
  // Data files
  '/data/analysis_data.json',
  '/data/lineage_data.json',
  '/data/sankey_flows.json',
  '/data/unified_network.json',
  // Gallery manifest (images are cached on demand, NOT precached)
  '/data/gallery.js',
  '/data/highlights.js',
  // External resources
  'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Sans+3:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
];

// Install — pre-cache shell
self.addEventListener('install', function(e) {
  e.waitUntil(
    caches.open(CACHE)
      .then(function(c) { return c.addAll(PRECACHE); })
      .then(function() { return self.skipWaiting(); })
  );
});

// Activate — delete old caches
self.addEventListener('activate', function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE; })
            .map(function(k) { return caches.delete(k); })
      );
    }).then(function() { return self.clients.claim(); })
  );
});

// Fetch — cache-first for shell/static, network-first for tiles
self.addEventListener('fetch', function(e) {
  var url = e.request.url;

  // Network-first for OSM tiles (cache as they load)
  if (url.includes('tile.openstreetmap.org')) {
    e.respondWith(
      fetch(e.request)
        .then(function(resp) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
          return resp;
        })
        .catch(function() { return caches.match(e.request); })
    );
    return;
  }

  // Runtime cache-on-demand for gallery images (never precached)
  if (e.request.destination === 'image' && url.indexOf('/img/') !== -1) {
    e.respondWith(
      caches.match(e.request).then(function(cached) {
        if (cached) return cached;
        return fetch(e.request).then(function(resp) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
          return resp;
        });
      })
    );
    return;
  }

  // Cache-first for everything else
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(resp) {
        // Cache Google Fonts and cdnjs resources
        if (url.includes('fonts.googleapis.com') ||
            url.includes('fonts.gstatic.com') ||
            url.includes('cdnjs.cloudflare.com')) {
          var clone = resp.clone();
          caches.open(CACHE).then(function(c) { c.put(e.request, clone); });
        }
        return resp;
      }).catch(function() {
        // Offline fallback — return cached index
        if (e.request.destination === 'document') {
          return caches.match('/index.html');
        }
      });
    })
  );
});
