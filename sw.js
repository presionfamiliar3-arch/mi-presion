// Service worker: permite abrir la app sin internet. Primero intenta la red (para recibir actualizaciones)
// y si no hay conexión usa la copia guardada. Las llamadas a Google no se tocan.
const V = 'mi-presion-v1';
const ARCHIVOS = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(V).then(c => c.addAll(ARCHIVOS))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== V).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(fetch(req).then(res => {
    const copia = res.clone(); caches.open(V).then(c => c.put(req, copia)); return res;
  }).catch(() => caches.match(req).then(m => m || caches.match('./index.html'))));
});
