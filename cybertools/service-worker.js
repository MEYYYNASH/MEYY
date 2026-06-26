const CACHE_NAME = 'meytool-cache-v1.2';
const ASSETS = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './tools.js',
    './finance_tools.js',
    './file_tools.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install Service Worker and cache all vital assets
self.addEventListener('install', (e) => {
    e.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(ASSETS);
        }).then(() => self.skipWaiting())
    );
});

// Activate Service Worker and clean up old caches if any
self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Cache-first fetch strategy
self.addEventListener('fetch', (e) => {
    e.respondWith(
        caches.match(e.request).then((cachedResponse) => {
            // Return cached response if found, else fetch from network and cache it
            if (cachedResponse) {
                return cachedResponse;
            }
            return fetch(e.request).then((networkResponse) => {
                // Check if response is valid before caching
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
                    return networkResponse;
                }
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(e.request, responseToCache);
                });
                return networkResponse;
            }).catch(() => {
                // Return offline fallback if network fails (optional)
            });
        })
    );
});
