/* AGW Jahrestagung 2026 — Service Worker
 * Strategy: Cache-first for shell + static assets; network-first for tiles
 */
const CACHE = 'agw-2026-v6-multipage';

const PRECACHE = [
  '/agw-vfs/',
  '/agw-vfs/index.html',
  '/agw-vfs/archive.html',
  '/agw-vfs/committee.html',
  '/agw-vfs/analytics.html',
  '/agw-vfs/guide.html',
  '/agw-vfs/manifest.json',
  // Foundation files (loaded by every page)
  '/agw-vfs/agw_styles.css',
  '/agw-vfs/agw_strings.js',
  '/agw-vfs/agw_data.js',
  '/agw-vfs/agw_app.js',
  '/agw-vfs/agw_nav.js',
  '/agw-vfs/agw_chronik.js',
  // External resources
  'https://fonts.googleapis.com/css2?family=EB+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Source+Sans+3:wght@300;400;500;600&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js',
];

// Install — pre-cache shell
self.addEventListener('install', function(e) {
  var isCross = function(u){ return /^https?:\/\//.test(u); };
  var shell   = PRECACHE.filter(function(u){ return !isCross(u); }); // same-origin: must cache
  var extern  = PRECACHE.filter(isCross);                            // CDN/fonts: best-effort
  e.waitUntil(
    caches.open(CACHE).then(function(c) {
      // Cross-origin assets are best-effort: a CDN/CORS failure must NOT fail the install
      // (an atomic addAll over all assets would, leaving the cache empty).
      var external = Promise.all(extern.map(function(u){
        return c.add(u).catch(function(){ /* non-fatal: skip uncacheable CDN asset */ });
      }));
      return Promise.all([ c.addAll(shell), external ]);
    }).then(function() { return self.skipWaiting(); })
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
          return caches.match('/agw-vfs/index.html');
        }
      });
    })
  );
});
