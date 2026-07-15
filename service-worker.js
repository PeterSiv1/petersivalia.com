const CACHE_NAME = 'petersivalia-audio-v1';
const URLS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png'
];

// Install: cache core files
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(URLS_TO_CACHE))
  );
  self.skipWaiting();
});

// Activate: clean old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// Fetch: network-first for HTML, cache-first for static assets
self.addEventListener('fetch', event => {
  const request = event.request;

  if (request.mode === 'navigate') {
    // HTML navigation: always try network first
    event.respondWith(
      fetch(request).catch(() => caches.match('/index.html'))
    );
  } else {
    // Static assets: cache first, then network
    event.respondWith(
      caches.match(request).then(response => {
        return (
          response ||
          fetch(request).then(networkResponse => {
            return caches.open(CACHE_NAME).then(cache => {
              cache.put(request, networkResponse.clone());
              return networkResponse;
            });
          })
        );
      })
    );
  }
});
