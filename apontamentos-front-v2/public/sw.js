const CACHE_NAME = "apontamentos-cache-v2";
const STATIC_ASSETS = [
  "/dashboard",
  "/login",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/tecalfoto.png",
  // '/manifest.webmanifest',
];

self.addEventListener("push", function (event) {
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: data.icon || "/icon.png",
      badge: "/badge.png",
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: "2",
      },
    };
    event.waitUntil(self.registration.showNotification(data.title, options));
  }
});

self.addEventListener("notificationclick", function (event) {
  console.log("Notification click received.");
  event.notification.close();
  event.waitUntil(clients.openWindow("localhost:3000"));
});

// Install: pré-cache dos assets estáticos
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate: limpar caches antigos
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name !== CACHE_NAME)
            .map((name) => caches.delete(name)),
        );
      })
      .then(() => self.clients.claim()),
  );
});

// Fetch: Network first para API, cache first para assets estáticos
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  // Requisições para a API do backend — sempre rede (sem cache)
  if (url.port === "8080" || url.pathname.startsWith("/api/")) {
    return;
  }

  // Next.js internals — sempre rede
  if (url.pathname.startsWith("/_next/")) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para páginas e assets: Network first, fallback para cache
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => caches.match(event.request)),
  );
});
