self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('notificationclick', event => {
    event.notification.close();
    event.waitUntil(self.clients.matchAll({ type:'window', includeUncontrolled:true }).then(async windows => {
        const current = windows.find(client => new URL(client.url).origin === self.location.origin);
        if (current) { await current.focus(); return current.navigate(new URL('./#/', self.location.href).href); }
        return self.clients.openWindow(new URL('./#/', self.location.href).href);
    }));
});
