/* CODEWAY v4: network-first for updates, cache fallback for offline use. */
const CACHE = 'codeway-v4-project-lab';
const CORE = [
  './', './index.html', './styles.css?v=4.0.0',
  './app.js?v=4.0.0', './lessons.js?v=4.0.0',
  './studio.html', './studio.css?v=4.0.0', './studio-data.js?v=4.0.0', './studio.js?v=4.0.0', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon.svg'
];
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('codeway-') && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;
  const isAppResource = req.mode === 'navigate' || /\.(?:html|css|js)$/.test(url.pathname);
  if (isAppResource) {
    // Check server on every visit; retain local fallback for offline use.
    event.respondWith(
      fetch(new Request(req, {cache: 'no-store'}))
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE).then(cache => cache.put(req, copy)));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(req);
          if (cached) return cached;
          if (req.mode === 'navigate') return caches.match(url.pathname.endsWith('studio.html') ? './studio.html' : './index.html');
          return Response.error();
        })
    );
  } else {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE).then(cache => cache.put(req,copy)));
        }
        return response;
      }))
    );
  }
});
