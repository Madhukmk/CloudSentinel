import api from './api';

export const ruleService = {
  async getRules() {
    const response = await api.get('/rules');
    return response.data.data;
  },

  async getRuleById(id) {
    const response = await api.get(`/rules/${id}`);
    return response.data.data;
  },

  async createRule(data) {
    const response = await api.post('/rules', data);
    return response.data.data;
  },

  async updateRule(id, data) {
    const response = await api.put(`/rules/${id}`, data);
    return response.data.data;
  },

  async toggleRule(id) {
    const response = await api.patch(`/rules/${id}/toggle`);
    return response.data.data;
  },

  async deleteRule(id) {
    const response = await api.delete(`/rules/${id}`);
    return response.data.data;
  },
};
