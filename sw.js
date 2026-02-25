var CACHE_NAME = 'cradero-v2';
var PRECACHE_URLS = [
    './',
    './index.html',
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Install: precache app shell and CDN resources
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(PRECACHE_URLS);
        }).then(function() {
            return self.skipWaiting();
        })
    );
});

// Activate: clean old caches
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(k) { return k !== CACHE_NAME; })
                    .map(function(k) { return caches.delete(k); })
            );
        }).then(function() {
            return self.clients.claim();
        })
    );
});

// Fetch: network-first for everything, fall back to cache when offline
self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);

    // Never cache Supabase API calls
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    event.respondWith(
        fetch(event.request).then(function(response) {
            // Got a fresh response — cache it for offline use
            if (response.ok) {
                var clone = response.clone();
                caches.open(CACHE_NAME).then(function(cache) {
                    cache.put(event.request, clone);
                });
            }
            return response;
        }).catch(function() {
            // Offline — serve from cache
            return caches.match(event.request).then(function(cached) {
                if (cached) return cached;
                // Last resort for navigation — return cached index
                if (event.request.mode === 'navigate') {
                    return caches.match('./index.html');
                }
            });
        })
    );
});
