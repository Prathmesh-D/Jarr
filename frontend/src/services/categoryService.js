import api from './api';

const API_URL = '/categories';

export const categoryService = {
  getCategories: async () => {
    const response = await api.get(API_URL);
    return response.data;
  },

  createCategory: async (categoryData) => {
    const response = await api.post(API_URL, categoryData);
    return response.data;
  },

  updateCategory: async (id, categoryData) => {
    const response = await api.put(`${API_URL}/${id}`, categoryData);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`${API_URL}/${id}`);
    return response.data;
  }
};
