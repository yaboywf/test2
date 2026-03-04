const STATIC_CACHE = "static-v1";
const VIDEO_CACHE = "video-v1";

self.addEventListener("install", (event) => {
    event.waitUntil(
        caches.open(STATIC_CACHE).then(cache =>
            cache.addAll([
                "/bb-banner-1.webp",
                "/bb-crest.png",
            ])
        )
    );
    self.skipWaiting();
});

self.addEventListener("activate", (event) => {
    event.waitUntil(clients.claim());
});

self.addEventListener("fetch", (event) => {
    const url = new URL(event.request.url);

    // Cache intro video files
    if (url.pathname.startsWith("/intro_vid/")) {
        event.respondWith(
            caches.open(VIDEO_CACHE).then(async cache => {
                const cached = await cache.match(event.request);
                if (cached) return cached;

                const response = await fetch(event.request);
                cache.put(event.request, response.clone());
                return response;
            })
        );
        return;
    }

    // Cache first strategy for images
    if (event.request.destination === "image") {
        event.respondWith(
            caches.open(STATIC_CACHE).then(async cache => {
                const cached = await cache.match(event.request);
                if (cached) return cached;

                const response = await fetch(event.request);
                cache.put(event.request, response.clone());
                return response;
            })
        );
        return;
    }

    // Default network
    event.respondWith(fetch(event.request));
});