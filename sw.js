// STAGE.LAB Service Worker v3
// Updated to force fresh cache load

const CACHE_NAME = 'stagelab-v3';

const FILES_TO_CACHE = [
  '/Stage_lab/',
  '/Stage_lab/index.html',
  '/Stage_lab/manifest.json',
  '/Stage_lab/icon-192.png',
  '/Stage_lab/icon-512.png'
];

// Install — cache all core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate — delete ALL old caches immediately
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME)
            .map(key => {
              console.log('STAGE.LAB: Deleting old cache:', key);
              return caches.delete(key);
            })
      )
    )
  );
  self.clients.claim();
});

// Fetch — network first, fall back to cache
// This ensures users always get the latest version when online
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Got a fresh response — update the cache
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        // Offline — serve from cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/Stage_lab/index.html'));
      })
  );
});
