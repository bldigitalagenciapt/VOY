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
            console.log('[Service Worker] Unregistering self to fix blank screen issue');
            self.registration.unregister();
        })
    );
});

self.addEventListener('fetch', (event) => {
    // Always go to the network, never use cache to prevent the "white screen" error
    event.respondWith(fetch(event.request).catch(() => new Response("Network error - please check your connection.")));
});
