/* RGCE admin push service worker. Upload next to admin-app.html (same folder, e.g. /rgce-admin/firebase-messaging-sw.js).
   Receives data-only FCM messages and draws the notification (with action buttons for the 72-hour retention prompt). */
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js', 'https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');
firebase.initializeApp({
  apiKey: 'AIzaSyCZOUCY2_19d6g5pnuVmEi1prfc-wBeN9w', authDomain: 'rgce-sparkdesk-2.firebaseapp.com', projectId: 'rgce-sparkdesk-2',
  storageBucket: 'rgce-sparkdesk-2.firebasestorage.app', messagingSenderId: '1057222039031', appId: '1:1057222039031:web:f82f411076a579b905caf2'
});
const messaging = firebase.messaging();
messaging.onBackgroundMessage((payload) => {
  const d = payload.data || {};
  const retention = d.type === 'retention';
  return self.registration.showNotification(d.title || 'RGCE chat', {
    body: d.body || '', tag: retention ? 'retention' : 'chat-' + (d.chatId || ''), renotify: true, icon: undefined,
    data: { url: d.url || '/', type: d.type || '', chatId: d.chatId || '' },
    actions: retention ? [{ action: 'confirm', title: 'Confirm Deletion' }, { action: 'extend', title: 'Extend 3 Days' }] : []
  });
});
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const d = event.notification.data || {};
  // A button never changes data from here (no login inside a service worker). It opens the admin app on the right chat with the choice
  // pre-selected; one tap there confirms it.
  const u = new URL(d.url || '/', self.location.origin);
  if (event.action === 'confirm' || event.action === 'extend') u.searchParams.set('act', event.action);
  event.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
    for (const c of list) { if (c.url.indexOf(self.registration.scope) === 0 && 'focus' in c) { c.postMessage({ type: 'rgce-open', url: u.pathname + u.search }); return c.focus(); } }
    return self.clients.openWindow(u.href);
  }));
});
