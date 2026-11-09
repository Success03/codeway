const CACHE = 'codeway-v2-responsive';
const CORE = ['./','./index.html','./styles.css','./app.js','./lessons.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./icon.svg'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(()=>self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method!=='GET' || url.origin!==self.location.origin) return;
  e.respondWith(caches.match(e.request).then(saved => saved || fetch(e.request).then(response=>{
    if (response.ok) { const clone=response.clone(); caches.open(CACHE).then(cache=>cache.put(e.request,clone)); }
    return response;
  })));
});
