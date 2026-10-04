// ==============================
// sleepy calendar
// Service Worker
// ==============================

const CACHE_NAME = "sleepy-calendar-v2";

const FILES_TO_CACHE = [
  "./",
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./uzura.ttf",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];


// ==============================
// インストール
// ==============================

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(FILES_TO_CACHE);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});


// ==============================
// 古いキャッシュを削除
// ==============================

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(
              cacheName =>
                cacheName !== CACHE_NAME
            )
            .map(
              cacheName =>
                caches.delete(cacheName)
            )
        );
      })
      .then(() => {
        return self.clients.claim();
      })
  );
});


// ==============================
// ページ・ファイル取得
// ==============================

self.addEventListener("fetch", event => {

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {

        if (cachedResponse) {
          return cachedResponse;
        }

        return fetch(event.request);
      })
  );
});
