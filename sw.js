importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-cache-v1';
const DYNAMIC_CACHE = 'dynamic-cache-v1';
const IMMUTABLE_CACHE = 'immutable-cache-v1';

// Definimos el corazón de nuestra app con nuestro código
const APP_SHELL = [
  // '/',
  'index.html',
  'css/style.css',
  'img/favicon.ico',
  'img/no-image.jpg',
  'js/app.js',
  'js/sw-utils.js'
]

// Definimos el corazón de nuestra app con recursos de terceros
const APP_SHELL_IMMUTABLE = [
  'js/lib/jquery-3.3.1.min.js',
  'https://fonts.googleapis.com/css?family=Lato',
]


self.addEventListener('install', event => {
  // Creamos la cache estática con los recursos de la APP SHELL
  const cacheStatic = caches.open(STATIC_CACHE).then(cache =>
    cache.addAll(APP_SHELL));

  // Creamos la cache immutable con los recursos de terceros que no van a cambiar
  const cacheImmutable = caches.open(IMMUTABLE_CACHE).then(cache =>
    cache.addAll(APP_SHELL_IMMUTABLE));

  // Esperamos que ambas promesas terminen antes de continuar con la activación del SW
  event.waitUntil(
    Promise.all([cacheStatic, cacheImmutable])
  )
});

self.addEventListener('activate', event => {
  // Si hay alguna diferencia entre el caché estatuci nuevo y el guardado lo actualizamos
  const response = caches.keys().then(keys => {
    keys.forEach(key => {
      if (key !== STATIC_CACHE && key.includes('static')) {
        return caches.delete(key)
      }
    })
  })  
  event.waitUntil(response)
});


self.addEventListener('fetch', event => {
  const response = caches.match(event.request).then(res => {
    if (res) {
      return res;
    } else {
      // Request para los archivos nuevos que no estén declarados en la parte estática o immutable
      return fetch(event.request).then(newRes => {
        // Enviamos el nuevo archivo a la caché dinámica mediante función
        return updateCacheDynamic(DYNAMIC_CACHE, event.request, newRes);
      })
    }
  })
  event.waitUntil(response);
});