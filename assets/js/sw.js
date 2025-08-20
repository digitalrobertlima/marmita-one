/**
 * PWA Service Worker - Marmita.One
 * Gerenciamento de cache e funcionalidade offline
 */

const CACHE_NAME = 'marmita-one-v0.1.0-beta';
const STATIC_CACHE = 'static-v0.1.0-beta';
const DYNAMIC_CACHE = 'dynamic-v0.1.0-beta';

// Arquivos essenciais para cache
const STATIC_ASSETS = [
  './',
  './index.html',
  './pages/custom.html',
  './pages/presets.html', 
  './pages/checkout.html',
  './assets/css/main.css',
  './assets/css/variables.css',
  './assets/css/reset.css',
  './assets/css/components.css',
  './assets/js/app.js',
  './assets/js/pwa.js',
  './manifest.json',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'
];

// URLs dinâmicas que podem ser cacheadas
const DYNAMIC_URLS = [
  './pages/',
  './assets/'
];

/**
 * Evento de instalação do Service Worker
 */
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando Service Worker...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('[SW] Cacheando arquivos estáticos...');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Arquivos estáticos cacheados com sucesso');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('[SW] Erro ao cachear arquivos estáticos:', error);
      })
  );
});

/**
 * Evento de ativação do Service Worker
 */
self.addEventListener('activate', (event) => {
  console.log('[SW] Ativando Service Worker...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('[SW] Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('[SW] Service Worker ativado');
        return self.clients.claim();
      })
  );
});

/**
 * Interceptação de requests
 */
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Ignorar requests não HTTP
  if (!request.url.startsWith('http')) return;
  
  // Estratégia Cache First para arquivos estáticos
  if (STATIC_ASSETS.some(asset => request.url.includes(asset)) || 
      request.destination === 'style' || 
      request.destination === 'script' ||
      request.destination === 'font') {
    
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            console.log('[SW] Servindo do cache:', request.url);
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              if (fetchResponse.ok) {
                const responseClone = fetchResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => cache.put(request, responseClone));
              }
              return fetchResponse;
            });
        })
        .catch(() => {
          // Fallback para HTML pages
          if (request.destination === 'document') {
            return caches.match('./index.html');
          }
        })
    );
    return;
  }
  
  // Estratégia Network First para conteúdo dinâmico
  if (DYNAMIC_URLS.some(pattern => request.url.includes(pattern))) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then((cache) => cache.put(request, responseClone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request)
            .then((response) => {
              if (response) {
                console.log('[SW] Servindo do cache dinâmico:', request.url);
                return response;
              }
              
              // Fallback genérico
              if (request.destination === 'document') {
                return caches.match('./index.html');
              }
            });
        })
    );
    return;
  }
  
  // Para outros requests, deixar o navegador lidar
  event.respondWith(fetch(request));
});

/**
 * Evento de sincronização em background
 */
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  
  if (event.tag === 'sync-orders') {
    event.waitUntil(syncPendingOrders());
  }
});

/**
 * Sincronizar pedidos pendentes
 */
async function syncPendingOrders() {
  try {
    // Implementar lógica de sincronização de pedidos offline
    console.log('[SW] Sincronizando pedidos pendentes...');
    
    // Aqui você pode implementar a lógica para enviar pedidos
    // que ficaram pendentes quando estava offline
    
  } catch (error) {
    console.error('[SW] Erro na sincronização:', error);
  }
}

/**
 * Evento de notificação push
 */
self.addEventListener('push', (event) => {
  console.log('[SW] Push recebido');
  
  const options = {
    body: 'Seu pedido está sendo preparado!',
    icon: '/assets/icons/icon-192x192.png',
    badge: '/assets/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: '1'
    },
    actions: [
      {
        action: 'explore',
        title: 'Ver pedido',
        icon: '/assets/icons/checkmark.png'
      },
      {
        action: 'close', 
        title: 'Fechar',
        icon: '/assets/icons/xmark.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Marmita.One', options)
  );
});

/**
 * Clique em notificação
 */
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notificação clicada:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      self.clients.openWindow('./pages/checkout.html')
    );
  }
});
