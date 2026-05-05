const CACHE_NAME = 'rohan-villoth-site-v2.2';
const urlsToCache = [
  './',
  './index.html',
  './assets/styles/style.css',
  './assets/images/rohan-villoth-logo.png',
  './assets/images/rohan-villoth-logo.svg'
];

// Install Event - Precache core assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting();
});

// Activate Event - Clean up old unused caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch Event - Stale-While-Revalidate Strategy
self.addEventListener('fetch', event => {
  // We only want to handle GET requests
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // 1. Kick off the network request in the background to fetch fresh content
      const fetchPromise = fetch(event.request).then(networkResponse => {
        // Make sure response is valid before caching
        if (networkResponse && networkResponse.status === 200) {
           const responseToCache = networkResponse.clone();
           caches.open(CACHE_NAME).then(cache => {
             cache.put(event.request, responseToCache);
           });
        }
        return networkResponse;
      }).catch(error => {
        console.warn('Network fetch failed, relying entirely on cache.', error);
      });

      // 2. Return the cached response immediately if it exists, otherwise wait for the network response
      return cachedResponse || fetchPromise;
    })
  );
});
