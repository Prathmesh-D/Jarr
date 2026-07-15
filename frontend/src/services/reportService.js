import api from './api';

export const reportService = {
  getReport: async (year, month) => {
    const response = await api.get('/reports', {
      params: { year, month }
    });
    return response.data;
  },

  exportCsv: async (year, month) => {
    const response = await api.get('/reports/export', {
      params: { year, month },
      responseType: 'blob', // Important for file downloads
    });
    return response.data;
  }
};
