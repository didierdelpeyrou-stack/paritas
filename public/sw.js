/* ════════════════════════════════════════════════════════════════
   PARITAS — Service Worker (offline 100 %)
   ════════════════════════════════════════════════════════════════
   Stratégie : "stale-while-revalidate" pour les bundles,
   "network-first avec fallback cache" pour les pages HTML.

   Argus IT : conformité avec V3_MASTERPLAN — "Tout est génératif,
   aucun fichier audio embarqué" → on ne pré-cache QUE le shell,
   pas les assets lourds (audio Tone.js reste lazy-loadé).

   Cache versionné par BUILD_VERSION pour invalidation propre.
   ──────────────────────────────────────────────────────────────── */

const CACHE_VERSION = 'v1.2026-05-08';
const CACHE_NAME = `paritas-${CACHE_VERSION}`;

/* Shell minimal pré-caché à l'install (≤ 100 kB) */
const SHELL_URLS = [
  '/',
  '/portail/',
  '/reglages/',
  '/manifest.webmanifest',
  '/favicon.svg',
  '/icon-192.svg',
  '/icon-512.svg'
];

/* ── INSTALL : pré-cache du shell ────────────────────────────── */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SHELL_URLS))
      .then(() => self.skipWaiting())
      .catch(err => console.warn('[PARITAS SW] install partial:', err))
  );
});

/* ── ACTIVATE : nettoyage des vieilles caches ─────────────────── */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k.startsWith('paritas-') && k !== CACHE_NAME)
            .map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── FETCH : stratégie hybride ────────────────────────────────── */
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;          // ignore CDN externes

  /* HTML (navigation) : network-first, fallback cache */
  const accept = req.headers.get('accept') || '';
  if (req.mode === 'navigate' || accept.includes('text/html')) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/portail/')))
    );
    return;
  }

  /* Assets bundlés (hash) : cache-first (immutables) */
  if (url.pathname.startsWith('/assets/') || /\.(js|css|svg|woff2?|png|jpg|jpeg|webp|json)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(res => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return res;
        });
      })
    );
    return;
  }

  /* Default : network */
});
