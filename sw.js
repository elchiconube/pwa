// imports
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v1';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    // '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'js/app.js',
    'js/sw-utils.js'
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'js/libs/jquery-3.3.1.min.js'
];


self.addEventListener('install', e => {
  // Creamos la cache estática con los recursos de la APP SHELL
  const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
      cache.addAll(APP_SHELL));
  // Creamos la cache immutable con los recursos de terceros que no van a cambiar
  const cacheInmutable = caches.open(INMUTABLE_CACHE).then(cache =>
      cache.addAll(APP_SHELL_INMUTABLE));
  // Esperamos que ambas promesas terminen antes de continuar con la activación del SW    
  e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});


self.addEventListener('activate', e => {
  // Si hay alguna diferencia entre el caché y lo que trae la red lo actualizamos
  const response = caches.keys().then(keys => {
      keys.forEach(key => {
          if (key !== STATIC_CACHE && key.includes('static')) {
              return caches.delete(key);
          }
          if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
              return caches.delete(key);
          }
      });
  });
  e.waitUntil(response);
});

self.addEventListener('fetch', e => {
  const response = caches.match(e.request).then(res => {
      if (res) {
          return res;
      } else {
          // Request para los archivos nuevos que no estén declarados en la parte estática o immutable
          return fetch(e.request).then(newRes => {
              // Enviamos el nuevo archivo a la caché dinámica mediante función
              return updateCacheDynamic(DYNAMIC_CACHE, e.request, newRes);
          });
      }
  });
  e.respondWith(response);
});