const CACHE_NAME = "viswasai-hero-v1";
const APP_SCOPE = "./";

const APP_FILES = [
  APP_SCOPE,
  APP_SCOPE + "index.html",
  APP_SCOPE + "manifest.json",
  APP_SCOPE + "icons/hero-192.png",
  APP_SCOPE + "icons/hero-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll(APP_FILES)
    )
  );

  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );

  self.clients.claim();
});

self.addEventListener("fetch", event => {
  const request = event.request;

  if (request.method !== "GET") return;

  const url = new URL(request.url);

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache =>
            cache.put(request, copy)
          );
        }
        return response;
      })
      .catch(async () => {
        return await caches.match(request) ||
          (request.mode === "navigate"
            ? await caches.match(APP_SCOPE)
            : Response.error());
      })
  );
});
