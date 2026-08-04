const CACHE = 'avanza-v1';
const SHELL = ['/manifest.webmanifest'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) => cache.addAll(SHELL)),
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
      ),
  );
  self.clients.claim();
});

// Sólo navegaciones GET. Las Server Actions son POST y nunca deben servirse
// desde caché: v1 no tiene cola de escrituras sin conexión. Las respuestas que
// no son 2xx directas (redirecciones seguidas, 4xx, 5xx) no se cachean: sólo
// se sirven, para no envenenar la cáscara con contenido de error o de login.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (!response.ok || response.redirected) return response;

        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((hit) => hit ?? caches.match('/hoy'))),
  );
});
