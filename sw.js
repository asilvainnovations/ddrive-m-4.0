/* DDRiVE-M Service Worker — PWA Offline Support */
const CACHE_NAME = 'ddrive-m-v1.0.0';
const STATIC_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/data.js',
  './js/app.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;600;700&family=Orbitron:wght@400;700;900&display=swap'
];

/* Install: cache static assets */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(STATIC_ASSETS.map(url => new Request(url, { cache: 'reload' })))
        .catch(() => cache.addAll(['./index.html', './css/styles.css', './js/data.js', './js/app.js']));
    }).then(() => self.skipWaiting())
  );
});

/* Activate: clean old caches */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Fetch: network-first for API, cache-first for assets */
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  /* API calls: network only, no caching */
  if (url.hostname === 'api.anthropic.com') {
    event.respondWith(fetch(event.request).catch(() =>
      new Response(JSON.stringify({ error: 'offline', message: 'AI features require internet connection.' }),
        { headers: { 'Content-Type': 'application/json' }, status: 503 })
    ));
    return;
  }

  /* Google Fonts: cache-first */
  if (url.hostname.includes('fonts')) {
    event.respondWith(
      caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        return response;
      }))
    );
    return;
  }

  /* Static assets: stale-while-revalidate */
  event.respondWith(
    caches.match(event.request).then(cached => {
      const fetchPromise = fetch(event.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => cached);
      return cached || fetchPromise;
    })
  );
});

/* Background sync for offline actions */
self.addEventListener('sync', event => {
  if (event.tag === 'ddrive-sync') {
    event.waitUntil(syncOfflineData());
  }
});

async function syncOfflineData() {
  const clients = await self.clients.matchAll();
  clients.forEach(client => client.postMessage({ type: 'SYNC_COMPLETE' }));
}

/* Push notifications */
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'DDRiVE-M Alert', {
      body: data.body || 'New hazard alert received.',
      icon: './icons/icon-192.png',
      badge: './icons/icon-72.png',
      tag: data.tag || 'ddrive-alert',
      vibrate: [200, 100, 200],
      data: { url: data.url || './' }
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url || './'));
});
