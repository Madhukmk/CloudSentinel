import api from './api';

export const logService = {
  async getLogs(params = {}) {
    const response = await api.get('/logs', { params });
    return response.data.data;
  },

  async getLogById(id) {
    const response = await api.get(`/logs/${id}`);
    return response.data.data;
  },

  async ingestLog(payload) {
    const response = await api.post('/logs', payload);
    return response.data.data;
  },
};
