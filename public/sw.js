// EcoScan Service Worker - Unregister & Cache Purge to prevent stale builds
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Always go straight to network - never serve stale HTML or JS
  event.respondWith(fetch(event.request));
});
