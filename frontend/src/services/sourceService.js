import api from './api';

export const sourceService = {
  async getSources() {
    const response = await api.get('/sources');
    return response.data.data;
  },

  async getSourceById(id) {
    const response = await api.get(`/sources/${id}`);
    return response.data.data;
  },

  async createSource(data) {
    const response = await api.post('/sources', data);
    return response.data.data;
  },

  async updateSource(id, data) {
    const response = await api.put(`/sources/${id}`, data);
    return response.data.data;
  },

  async toggleSource(id) {
    const response = await api.patch(`/sources/${id}/toggle`);
    return response.data.data;
  },

  async deleteSource(id) {
    const response = await api.delete(`/sources/${id}`);
    return response.data.data;
  },
};
