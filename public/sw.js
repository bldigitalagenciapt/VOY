self.addEventListener('install', (e) => {
    self.skipWaiting();
});

self.addEventListener('activate', (e) => {
    e.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    console.log('[Service Worker] Deleting old cache:', cacheName);
                    return caches.delete(cacheName);
                })
            );
        }).then(() => {
            console.log('[Service Worker] Claiming clients for PWA installability');
            // We claim clients instead of unregistering to keep PWA installability active
            self.clients.claim();
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Always go to the network, never use cache to prevent the "white screen" error
    // but having the fetch listener is mandatory for Chrome's PWA install criteria
    event.respondWith(
        fetch(event.request).catch(() => new Response("Network error - please check your connection."))
    );
});
