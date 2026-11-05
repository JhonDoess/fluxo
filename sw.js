/*
 * FLUXO · service worker da página instaladora.
 * Guarda só esta página e os ícones (nada do FLUXO nem dos seus dados) para o
 * app abrir mesmo com a rede instável. Pedidos de outros endereços passam direto.
 */
const CACHE = 'fluxo-instalador-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png'];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(FILES); }));
  self.skipWaiting();
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});

self.addEventListener('fetch', function (e) {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(fetch(req).catch(function () {
    return caches.match(req, { ignoreSearch: true }).then(function (r) { return r || caches.match('./'); });
  }));
});
