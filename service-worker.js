const CACHE_NAME = 'marmita-cache-v2';
const ASSETS = [
  'index.html',
  'manifest.json',
  'src/app.js',
  'src/app.css',
  'src/config.js',
  'src/utils.js',
];
const urlsToCache = ASSETS.map(p => new URL(p, self.registration.scope).toString());

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  // Serve safe placeholder PNGs for icons if files are missing
  if (url.pathname.endsWith('/icons/icon-192x192.png') || url.pathname.endsWith('/icons/icon-512x512.png')) {
    event.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res && res.ok) return res;
      } catch {}
      const b64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='; // 1x1 transparent PNG
      const bytes = Uint8Array.from(atob(b64), c => c.charCodeAt(0));
      return new Response(bytes, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=31536000, immutable' } });
    })());
    return;
  }
  // Para HTML, use network-first para pegar atualizações
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req))
    );
    return;
  }
  // Demais: cache-first
  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE_NAME).then((c) => c.put(req, copy));
      return res;
    }))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
    ))
  );
});
