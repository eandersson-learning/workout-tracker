// Offline support: caches the app shell so the tracker opens without a
// connection (e.g. in a gym with no signal). Data itself lives in IndexedDB.
const CACHE = 'workout-tracker-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE)
      const res = await fetch('./', { cache: 'no-cache' })
      const html = await res.clone().text()
      await cache.put('./', res)
      // Precache the hashed JS/CSS the page references, plus static files.
      const assets = [...html.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)].map((m) => m[1])
      await cache.addAll([...assets, 'manifest.webmanifest', 'favicon.svg', 'icon-192.png'])
      await self.skipWaiting()
    })(),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      for (const key of await caches.keys()) if (key !== CACHE) await caches.delete(key)
      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return

  if (req.mode === 'navigate') {
    // Network first so updates show up; fall back to the cached page offline.
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone()
          caches.open(CACHE).then((c) => c.put('./', copy))
          return res
        })
        .catch(() => caches.match('./')),
    )
    return
  }

  // Hashed assets never change, so cache first.
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok) {
            const copy = res.clone()
            caches.open(CACHE).then((c) => c.put(req, copy))
          }
          return res
        }),
    ),
  )
})
