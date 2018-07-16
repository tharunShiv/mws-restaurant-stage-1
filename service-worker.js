// var dataCacheName = 'restaurantreviews-v1';
var cacheName = 'restaurantreviewsPWA-final-1';
var filesToCache = [
  '/',
  'index.html',
  'restaurant.html',
  'js/dbhelper.js',
  'js/main.js',
  'js/restaurant_info.js',
  'css/styles.css',
  'css/styleRes.css',
  'data/restaurants.json',
  'img/1.jpg',
  'img/2.jpg',
  'img/3.jpg',
  'img/4.jpg',
  'img/5.jpg',
  'img/6.jpg',
  'img/7.jpg',
  'img/8.jpg',
  'img/9.jpg',
  'img/10.jpg',
  'img/rate.png'
];

self.addEventListener('install', function(e) {
  console.log('[ServiceWorker] Install');
  e.waitUntil(
    caches.open(cacheName).then(function(cache) {
      console.log('[ServiceWorker] Caching app shell');
      return cache.addAll(filesToCache);
    })
  );
});

self.addEventListener('activate', function(e) {
  console.log('[ServiceWorker] Activate');
  e.waitUntil(
    caches.keys().then(function(keyList) {
      return Promise.all(keyList.map(function(key) {
        if (key !== cacheName ) {
          console.log('[ServiceWorker] Removing old cache', key);
          return caches.delete(key);
        }
      }));
    })
  );
  /*
   * Fixes a corner case in which the app wasn't returning the latest data.
   * You can reproduce the corner case by commenting out the line below and
   * then doing the following steps: 1) load app for first time so that the
   * initial New York City data is shown 2) press the refresh button on the
   * app 3) go offline 4) reload the app. You expect to see the newer NYC
   * data, but you actually see the initial data. This happens because the
   * service worker is not yet activated. The code below essentially lets
   * you activate the service worker faster.
   */
  return self.clients.claim();
});

// self.addEventListener('fetch', function(e) {
//   console.log('[Service Worker] Fetch', e.request.url);
  
  
//     /*
//      * The app is asking for app shell files. In this scenario the app uses the
//      * "Cache, falling back to the network" offline strategy:
//      * https://jakearchibald.com/2014/offline-cookbook/#cache-falling-back-to-network
//      */
//     e.respondWith(
//       caches.match(e.request).then(function(response) {
//         return response || fetch(e.request);
//       }).catch(function() {
//         // Do nothing.
//       })
//     );
  
// });

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.open(cacheName).then(function(cache) {
      return cache.match(event.request).then(function(response) {
          //console.log("cache request: " + event.request.url);
          var fetchPromise = fetch(event.request).then(function(networkResponse) {
              // if we got a response from the cache, update the cache
              //console.log("fetch completed: " + event.request.url, networkResponse);
              if (networkResponse) {
                  //console.debug("updated cached page: " + event.request.url, networkResponse);
                  cache.put(event.request, networkResponse.clone());
              }
              return networkResponse;
          }, function (e) {
              // rejected promise - just ignore it, we're offline
              //console.log("Error in fetch()", e);
              ;
          });

          // respond from the cache, or the network
          return response || fetchPromise;
      });
  }));
});
