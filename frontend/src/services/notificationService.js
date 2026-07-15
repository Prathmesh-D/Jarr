import api from './api';

export const notificationService = {
  getVapidPublicKey: async () => {
    const response = await api.get('/notifications/vapidPublicKey');
    return response.data.publicKey;
  },

  subscribe: async (subscription) => {
    const key = subscription.getKey('p256dh');
    const auth = subscription.getKey('auth');
    
    // Convert ArrayBuffer to Base64
    const p256dh = btoa(String.fromCharCode.apply(null, new Uint8Array(key)))
                   .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const authBase64 = btoa(String.fromCharCode.apply(null, new Uint8Array(auth)))
                   .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

    const response = await api.post('/notifications/subscribe', {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: p256dh,
        auth: authBase64
      }
    });
    return response.data;
  }
};
