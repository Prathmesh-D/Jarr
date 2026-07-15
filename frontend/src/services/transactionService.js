import api from './api';

export const transactionService = {
  getTransactions: async (page = 0, size = 20) => {
    const response = await api.get(`/transactions?page=${page}&size=${size}`);
    return response.data;
  },

  getTransaction: async (id) => {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  createTransaction: async (data) => {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  updateTransaction: async (id, data) => {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  deleteTransaction: async (id) => {
    const response = await api.delete(`/transactions/${id}`);
    return response.data;
  }
};
