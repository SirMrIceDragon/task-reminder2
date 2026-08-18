// Service Worker برای PWA - نسخه ۲
// پشتیبانی کامل از آفلاین با استراتژی کش پیشرفته

const CACHE_VERSION = 'task-reminder-v2'
const STATIC_CACHE = `${CACHE_VERSION}-static`
const RUNTIME_CACHE = `${CACHE_VERSION}-runtime`
const OFFLINE_URL = '/offline.html'

// منابع استاتیک که در نصب کش می‌شن
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/offline.html',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
  '/icons/icon-192-maskable.png',
  '/icons/icon-512-maskable.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-32.png',
  '/icons/screenshot-mobile.png',
  '/fonts/Vazirmatn-Regular.woff2',
  '/fonts/Vazirmatn-Medium.woff2',
  '/fonts/Vazirmatn-SemiBold.woff2',
  '/fonts/Vazirmatn-Bold.woff2',
]

// نصب Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing v2...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Caching static assets')
        // استفاده از addAll با fallback
        return Promise.allSettled(
          STATIC_ASSETS.map((url) =>
            cache.add(url).catch((err) => {
              console.warn(`[SW] Failed to cache ${url}:`, err.message)
            })
          )
        )
      })
      .then(() => {
        console.log('[SW] Installation complete')
        return self.skipWaiting()
      })
  )
})

// فعال‌سازی Service Worker
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating v2...')
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // حذف کش‌های قدیمی
            if (!cacheName.startsWith(CACHE_VERSION)) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Claiming clients')
        return self.clients.claim()
      })
  )
})

// استراتژی کش:
// - navigation (HTML): network first، fallback به cache، fallback به offline page
// - static assets (CSS, JS, fonts, images): stale-while-revalidate
// - API: network only
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // فقط GET را کش کن
  if (request.method !== 'GET') return

  // درخواست‌های cross-origin (مثل Google Fonts) رو مدیریت نکن
  if (url.origin !== self.location.origin) return

  // navigation requests (HTML pages)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // کش کردن response موفق
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
          return response
        })
        .catch(() => {
          // fallback به cache
          return caches.match(request).then((cached) => {
            if (cached) return cached
            // fallback به offline page یا صفحه اصلی کش شده
            return caches.match('/offline.html').then((offline) => {
              return offline || caches.match('/') || new Response(
                '<!DOCTYPE html><html><body dir="rtl"><h1>آفلاین</h1><p>این صفحه در حال حاضر در دسترس نیست.</p></body></html>',
                { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
              )
            })
          })
        })
    )
    return
  }

  // static assets - stale-while-revalidate
  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.startsWith('/fonts/') ||
    url.pathname === '/manifest.json' ||
    url.pathname === '/sw.js' ||
    url.pathname === '/favicon.ico'
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request)
          .then((response) => {
            // فقط response‌های موفق رو کش کن
            if (response && response.status === 200) {
              const responseClone = response.clone()
              caches.open(STATIC_CACHE).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            return response
          })
          .catch(() => cached)
        return cached || fetchPromise
      })
    )
    return
  }

  // سایر درخواست‌ها - network first با fallback به cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseClone = response.clone()
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseClone)
          })
        }
        return response
      })
      .catch(() => caches.match(request))
  )
})

// پشتیبانی از push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event)
  let data = { title: 'یادآور تسک‌ها', body: 'یادآوری جدید' }
  
  if (event.data) {
    try {
      data = event.data.json()
    } catch {
      data = { title: 'یادآور تسک‌ها', body: event.data.text() }
    }
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    vibrate: [200, 100, 200],
    tag: data.tag || 'task-reminder',
    requireInteraction: true,
    data: data.data || {},
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
})

// کلیک روی نوتیفیکیشن
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event)
  event.notification.close()

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // اگر اپ باز است، فوکوس کن
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus()
          }
        }
        // در غیر این صورت، اپ را باز کن
        if (clients.openWindow) {
          return clients.openWindow('/')
        }
      })
  )
})

// sync با canvas (برای آینده)
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag)
  if (event.tag === 'sync-tasks') {
    event.waitUntil(
      clients.matchAll({ type: 'window' }).then((clientList) => {
        clientList.forEach((client) => {
          client.postMessage({ type: 'SYNC_TASKS' })
        })
      })
    )
  }
})

// message از کلاینت
self.addEventListener('message', (event) => {
  console.log('[SW] Message:', event.data)
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
