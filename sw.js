// Naikkan angka versi ini SETIAP kali index.html/manifest diupdate,
// supaya HP pengguna otomatis mengambil versi baru dan membuang cache lama.
const CACHE_NAME = 'dompetku-ai-v2';
const ASSETS = [
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  if (url.origin === self.location.origin) {
    // HTML/dokumen utama & file JS/JSON lokal: SELALU coba ambil versi terbaru dari internet dulu.
    // Cache hanya dipakai sebagai cadangan kalau HP sedang offline.
    event.respondWith(
      fetch(req)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, clone));
          return response;
        })
        .catch(() => caches.match(req))
    );
  } else {
    // Resource dari CDN luar (Tailwind, Chart.js, dll): cache-first seperti biasa
    event.respondWith(
      fetch(req).catch(() => caches.match(req))
    );
  }
});
