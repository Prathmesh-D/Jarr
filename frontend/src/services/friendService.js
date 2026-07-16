import api from './api';

export const friendService = {
  getFriends: async () => {
    const response = await api.get('/friends');
    return response.data;
  },

  createFriend: async (data) => {
    const response = await api.post('/friends', data);
    return response.data;
  },

  deleteFriend: async (id) => {
    const response = await api.delete(`/friends/${id}`);
    return response.data;
  }
};
