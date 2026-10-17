// self.addEventListener('install',e => {
//     e.waitUntil('static').then(cache => {
//         return cache.addAll(['./'])
//     });
//     console.log('service worker changed')
//     console.log('serviceworker updation')
// });

// self.addEventListener('fetch',e => {
//     e.respondWith(caches.match(e.request).then(response => {
//         return response || fetch(e.request)
//     }))
// });

// const CACHE_NAME = 'hajar-v1';

// const APP_SHELL = [
    
//     './index.html',
//     './style/general.css',
//     './style/top-navbar.css',
//     './style/bottom-navbar.css',
//     './style/attendence-filter.css',
//     './scripts.js',
//     './images/nooru.jpeg',
//     './icons/attendence-icon-64.png',
//     './icons/attendence-icon-512.png'
// ];


// self.addEventListener('install', event => {
//     event.waitUntil(
//         caches.open(CACHE_NAME).then(cache => {
//                 return cache.addAll(APP_SHELL);
//             })
//     );
//     console.log('Hajar Service Worker installed');
// });

// self.addEventListener('activate', event => {
//     event.waitUntil(
//         caches.keys().then(cacheNames => {
//             return Promise.all(
//                 cacheNames
//                     .filter(cacheName => cacheName !== CACHE_NAME)
//                     .map(cacheName => caches.delete(cacheName))
//             );
//         })
//     );
//     console.log('Hajar Service Worker activated');
// });

// self.addEventListener('fetch', event => {
//     event.respondWith(
//         caches.match(event.request).then(response => {
//                 return response || fetch(event.request);
//             })
//     );
// });

// const CACHE_NAME = 'todo-app-v1';
// const urlsToCache = [
//     './index.html',
//     './style/general.css',
//     './style/top-navbar.css',
//     './style/bottom-navbar.css',
//     './style/attendence-filter.css',
//     './scripts.js',
//     './images/nooru.jpeg',
//     './icons/attendence-icon-64.png',
//     './icons/attendence-icon-512.png',
//     './manifest.json'

// ];

// self.addEventListener('install', (event) => {
//   event.waitUntil(
//     caches.open(CACHE_NAME).then((cache) => {
//       return cache.addAll(urlsToCache);
//     })
//   );
// });

// self.addEventListener('fetch', (event) => {
//   event.respondWith(
//     caches.match(event.request).then((response) => {
//       return response || fetch(event.request);
//     })
//   );
// });