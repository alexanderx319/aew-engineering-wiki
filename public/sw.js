/**
 * AEW Service Worker v2.0
 * Network-first para navegación/HTML (siempre trae el último deploy si hay
 * conexión, cae a caché solo offline). Cache-first para assets estáticos
 * con hash de Next.js (_next/static/*), que son inmutables por build y por
 * lo tanto seguros de cachear para siempre.
 *
 * v1.x usaba cache-first para TODO, incluyendo "/", lo que dejaba el shell
 * de la app pegado a la primera versión instalada — los deploys nuevos en
 * Vercel nunca llegaban a dispositivos que ya tenían el SW activo.
 */

const CACHE_NAME    = "aew-v2";
const PRECACHE_URLS = ["/manifest.json", "/icon-192.svg", "/icon-512.svg"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;
  if (!request.url.startsWith("http")) return;
  // Skip Next.js HMR requests in dev
  if (request.url.includes("_next/webpack-hmr")) return;
  if (request.url.includes("__nextjs")) return;

  const isNavigation =
    request.mode === "navigate" || request.destination === "document";

  if (isNavigation) {
    // Network-first: always try to get the latest deploy. Only fall back
    // to whatever's cached (so the app still opens offline) if the network
    // request fails entirely.
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
    return;
  }

  // Static, content-hashed assets (Next.js _next/static/*, icons, etc.) are
  // immutable per build — cache-first is correct and fast for these.
  event.respondWith(
    caches.match(request).then((cached) => {
      const network = fetch(request).then((response) => {
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        }
        return response;
      });
      return cached || network;
    })
  );
});
