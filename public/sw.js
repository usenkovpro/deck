/**
 * Deck's service worker — the part that makes it work with no internet.
 *
 * Strategy is stale-while-revalidate: answer from the cache straight away so the app
 * opens instantly, and fetch a fresh copy in the background for next time. A
 * timetable app has to open at 07:45 in a corridor with no signal, and it must never
 * wait on a network request to do it.
 *
 * Paths are all resolved against the registration scope rather than "/", so this
 * works unchanged when the app is served from a subfolder.
 */

/**
 * These two are rewritten at build time by the `deck-precache` integration in
 * astro.config.mjs — the built JavaScript and CSS have hashed filenames that only
 * exist once a build has run, so they cannot be listed by hand.
 *
 * Left as-is they are harmless: the placeholder asset is filtered out, and the
 * worker is never registered in dev anyway.
 */
const BUILD = "__BUILD__";
const BUILD_ASSETS = ["__PRECACHE__"];

// The cache name carries the build hash, so a new deploy lands in a new cache and
// the previous one is deleted on activate. Without that, a stale bundle could
// outlive the HTML that goes with it.
const CACHE = `deck-${BUILD}`;

const CORE = [
  "",
  "week/",
  "setup/",
  "edit/",
  "manifest.webmanifest",
  "favicon.svg",
  "icon-192.png",
  "icon-512.png",
  "apple-touch-icon.png",
  ...BUILD_ASSETS.filter((path) => path !== "__PRECACHE__"),
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(CORE.map((path) => new URL(path, self.registration.scope).href));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(names.filter((n) => n !== CACHE).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);

      // Ignore the query string. `?at=` is a preview flag, not a different page, and
      // caching each value separately would fill the cache with duplicates.
      const key = url.origin + url.pathname;
      const cached = await cache.match(key);

      const fresh = fetch(request)
        .then((response) => {
          if (response && response.ok && response.type === "basic") {
            cache.put(key, response.clone());
          }
          return response;
        })
        .catch(() => null);

      const response = cached ?? (await fresh);
      if (response) return response;

      // Offline, and this exact page was never cached: give it the app shell, which
      // renders itself from localStorage anyway.
      if (request.mode === "navigate") {
        const shell = await cache.match(new URL("", self.registration.scope).href);
        if (shell) return shell;
      }

      return new Response("Deck is offline and this page is not cached yet.", {
        status: 503,
        headers: { "Content-Type": "text/plain" },
      });
    })(),
  );
});
