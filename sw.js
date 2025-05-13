const CACHE_NAME = 'controle-financeiro-v1';
const FILES_TO_CACHE = [
  '/controle-financeiro/',
  '/controle-financeiro/index.html',
  '/controle-financeiro/styles.css',
  '/controle-financeiro/script.js',
  '/controle-financeiro/manifest.json',
  '/controle-financeiro/icon.png',
  '/controle-financeiro/lib/chart.js',
  '/controle-financeiro/lib/jspdf.umd.min.js',
  '/controle-financeiro/lib/fontawesome/css/all.min.css',
  '/controle-financeiro/lib/fontawesome/webfonts/fa-solid-900.woff2',
  '/controle-financeiro/lib/fontawesome/webfonts/fa-regular-400.woff2'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        }).catch(() => {
            return caches.match('/index.html');
        })
    );
});
