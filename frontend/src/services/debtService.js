import api from './api';

export const debtService = {
  getDebts: async () => {
    const response = await api.get('/debts');
    return response.data;
  },

  createDebt: async (data) => {
    const response = await api.post('/debts', data);
    return response.data;
  },

  settleDebt: async (id) => {
    const response = await api.patch(`/debts/${id}/settle`);
    return response.data;
  },

  markAsDone: async (id) => {
    const response = await api.patch(`/debts/${id}/mark-done`);
    return response.data;
  },

  payDebt: async (id, amount) => {
    const response = await api.patch(`/debts/${id}/pay`, { amount });
    return response.data;
  },

  deleteDebt: async (id) => {
    const response = await api.delete(`/debts/${id}`);
    return response.data;
  }
};
