self.addEventListener('push', function(event) {
    if (event.data) {
        try {
            const data = event.data.json();
            const options = {
                body: data.body,
                icon: '/icon-192x192.png',
                badge: '/icon-192x192.png',
                vibrate: [100, 50, 100],
                data: {
                    dateOfArrival: Date.now(),
                    primaryKey: '2'
                },
                actions: [
                    {action: 'explore', title: 'Open Jarr'}
                ]
            };
            event.waitUntil(
                self.registration.showNotification(data.title || 'Jarr', options)
            );
        } catch (e) {
            // Fallback for plain text
            event.waitUntil(
                self.registration.showNotification('Jarr', {
                    body: event.data.text()
                })
            );
        }
    }
});

self.addEventListener('notificationclick', function(event) {
    event.notification.close();
    event.waitUntil(
        clients.matchAll({ type: 'window' }).then(windowClients => {
            for (let client of windowClients) {
                if (client.url === '/' && 'focus' in client) {
                    return client.focus();
                }
            }
            if (clients.openWindow) {
                return clients.openWindow('/');
            }
        })
    );
});
