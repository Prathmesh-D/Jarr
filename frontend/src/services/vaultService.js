import api from './api';

export const vaultService = {
  // Vault CRUD
  getVaults: async () => {
    const response = await api.get('/vaults');
    return response.data;
  },

  createVault: async (data) => {
    const response = await api.post('/vaults', data);
    return response.data;
  },

  updateVault: async (id, data) => {
    const response = await api.patch(`/vaults/${id}`, data);
    return response.data;
  },

  deleteVault: async (id) => {
    const response = await api.delete(`/vaults/${id}`);
    return response.data;
  },

  // Entries
  getEntries: async (vaultId) => {
    const response = await api.get(`/vaults/${vaultId}/entries`);
    return response.data;
  },

  deposit: async (vaultId, data) => {
    const response = await api.post(`/vaults/${vaultId}/deposit`, data);
    return response.data;
  },

  withdraw: async (vaultId, data) => {
    const response = await api.post(`/vaults/${vaultId}/withdraw`, data);
    return response.data;
  },

  transfer: async (fromVaultId, data) => {
    const response = await api.post(`/vaults/${fromVaultId}/transfer`, data);
    return response.data;
  },

  deleteEntry: async (entryId) => {
    const response = await api.delete(`/vaults/entries/${entryId}`);
    return response.data;
  },

  updateEntry: async (entryId, data) => {
    const response = await api.patch(`/vaults/entries/${entryId}`, data);
    return response.data;
  },
};
