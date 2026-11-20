const CACHE_PREFIX = "furkancosar-offline-";
const CACHE_NAME = `${CACHE_PREFIX}v1`;
const FALLBACK = "/offline.html";

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.add(new Request(FALLBACK, { cache: "reload" }))));
});

self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter(name => name.startsWith(CACHE_PREFIX) && name !== CACHE_NAME).map(name => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  const { request } = event;
  if (request.mode !== "navigate" || request.method !== "GET") return;

  // Pages, Next.js data and contact submissions keep their normal network behavior.
  event.respondWith(fetch(request).catch(async () => {
    const fallback = await (await caches.open(CACHE_NAME)).match(FALLBACK);
    return fallback ? new Response(fallback.body, {
      status: 503,
      headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
    }) : Response.error();
  }));
});
