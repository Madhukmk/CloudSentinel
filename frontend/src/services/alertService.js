import api from './api';

export const alertService = {
  async getAlerts(params = {}) {
    const response = await api.get('/alerts', { params });
    return response.data.data;
  },

  async getAlertById(id) {
    const response = await api.get(`/alerts/${id}`);
    return response.data.data;
  },

  async acknowledge(id) {
    const response = await api.put(`/alerts/${id}/acknowledge`);
    return response.data.data;
  },

  async resolve(id) {
    const response = await api.put(`/alerts/${id}/resolve`);
    return response.data.data;
  },

  async markFalsePositive(id) {
    const response = await api.put(`/alerts/${id}/false-positive`);
    return response.data.data;
  },

  async updateStatus(id, status) {
    const response = await api.put(`/alerts/${id}/status`, { status });
    return response.data.data;
  },

  async bulkAcknowledge(ids) {
    const response = await api.post('/alerts/bulk/acknowledge', ids);
    return response.data.data;
  },

  async bulkResolve(ids) {
    const response = await api.post('/alerts/bulk/resolve', ids);
    return response.data.data;
  },
};
