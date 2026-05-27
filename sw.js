var CACHE_NAME = 'cradero-v7';
// App shell — own-origin assets that MUST cache for offline use.
var APP_SHELL_URLS = [
    './',
    './index.html'
];
// CDN resources — best-effort. Install must not fail if a corporate firewall
// blocks jsdelivr or it's temporarily unreachable.
var CDN_URLS = [
    'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.97.0/dist/umd/supabase.min.js',
    'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js'
];

// Files that should NEVER be cached (contain credentials or sensitive config)
var NO_CACHE_PATTERNS = ['config.js', 'config.json'];

function shouldNotCache(url) {
    var pathname = new URL(url).pathname;
    return NO_CACHE_PATTERNS.some(function(p) { return pathname.indexOf(p) !== -1; });
}

// Install: precache app shell (must succeed) + CDN resources (best-effort).
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(APP_SHELL_URLS).then(function() {
                // Best-effort CDN cache — individual failures are swallowed so
                // a blocked CDN doesn't prevent service worker installation.
                return Promise.all(CDN_URLS.map(function(url) {
                    return cache.add(url).catch(function() { /* skip on failure */ });
                }));
            });
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

// Message handler: clear all caches on LOGOUT
self.addEventListener('message', function(event) {
    if (event.data === 'LOGOUT') {
        caches.keys().then(function(keys) {
            return Promise.all(keys.map(function(k) { return caches.delete(k); }));
        });
    }
});

// Fetch: network-first for everything, fall back to cache when offline
self.addEventListener('fetch', function(event) {
    var url = new URL(event.request.url);

    // Never cache Supabase API calls
    if (url.hostname.includes('supabase.co')) {
        return;
    }

    // Never cache config files (contain credentials)
    if (shouldNotCache(event.request.url)) {
        return;
    }

    event.respondWith(
        fetch(event.request).then(function(response) {
            // Got a fresh response — cache it for offline use (only static assets)
            if (response.ok && !shouldNotCache(event.request.url)) {
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
