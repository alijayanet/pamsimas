const CACHE_NAME = 'pamsimas-catter-cache-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/catter',
  '/vendor/jquery/dist/jquery.min.js',
  '/vendor/bootstrap/dist/js/bootstrap.bundle.min.js',
  '/vendor/admin-lte/dist/js/adminlte.min.js',
  '/vendor/fontawesome/css/all.min.css',
  '/vendor/admin-lte/dist/css/adminlte.min.css',
  '/public/css/app.css',
  '/vendor/fontawesome/webfonts/fa-solid-900.woff2',
  '/vendor/fontawesome/webfonts/fa-brands-400.woff2'
];

// Install Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

// Activate Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Interceptor
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Caching strategy for HTML pages: Network First, Fallback to Cache
  if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Clone the response and save it to the cache
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
          return response;
        })
        .catch(() => {
          // If network fails, serve from cache
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            // If not found in cache, fallback to main /catter cached page
            return caches.match('/catter');
          });
        })
    );
    return;
  }

  // Cache First strategy for static vendor assets
  if (
    requestUrl.pathname.startsWith('/vendor/') ||
    requestUrl.pathname.startsWith('/public/')
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(event.request).then((response) => {
          const responseCopy = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseCopy);
          });
          return response;
        });
      })
    );
    return;
  }

  // Default behavior: Network Only
  event.respondWith(fetch(event.request).catch(() => caches.match(event.request)));
});
