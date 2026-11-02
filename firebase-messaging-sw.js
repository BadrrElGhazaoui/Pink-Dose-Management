importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB3082us3rNOP5ZOOrztElLHrgcWR7tkXg',
  authDomain: 'pink-dose.firebaseapp.com',
  projectId: 'pink-dose',
  storageBucket: 'pink-dose.firebasestorage.app',
  messagingSenderId: '833630043648',
  appId: '1:833630043648:web:2084a8dc083898a95822e5'
});

firebase.messaging().onBackgroundMessage(function(payload) {
  var data = payload.data || {};
  return self.registration.showNotification(data.title || 'Pink Dose Management', {
    body: data.body || 'New app activity',
    icon: new URL('icon-192.png', self.registration.scope).href,
    badge: new URL('icon-192.png', self.registration.scope).href,
    tag: data.entryId || undefined,
    data: { url: self.registration.scope }
  });
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(function(windows) {
    var target = event.notification.data && event.notification.data.url || self.registration.scope;
    for (var i = 0; i < windows.length; i++) {
      if (windows[i].url.indexOf(self.registration.scope) === 0) {
        return windows[i].focus();
      }
    }
    return self.clients.openWindow(target);
  }));
});
