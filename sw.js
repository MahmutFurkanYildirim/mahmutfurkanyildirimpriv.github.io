/**
 * Self-destructing Service Worker
 * This SW replaces any old cached SW and immediately:
 * 1. Clears ALL cache storage
 * 2. Unregisters itself
 * 3. Forces a page reload so users get fresh content
 */

self.addEventListener('install', function(event) {
  // Skip waiting so this SW activates immediately
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    // Delete every cache bucket
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          console.log('[SW] Deleting cache:', cacheName);
          return caches.delete(cacheName);
        })
      );
    }).then(function() {
      // Take control of all open tabs
      return self.clients.claim();
    }).then(function() {
      // Tell all clients to reload so they get fresh HTML + assets
      return self.clients.matchAll({ type: 'window' }).then(function(clients) {
        clients.forEach(function(client) {
          client.postMessage({ type: 'SW_CACHE_CLEARED' });
        });
      });
    }).then(function() {
      // Unregister this SW so it doesn't interfere in future
      return self.registration.unregister();
    })
  );
});

// Never intercept network requests — always go to network
self.addEventListener('fetch', function(event) {
  // Passthrough: no caching at all
});
