import api from './api';

export const userService = {
  async getUsers() {
    const response = await api.get('/users');
    return response.data.data;
  },

  async getUserById(id) {
    const response = await api.get(`/users/${id}`);
    return response.data.data;
  },

  async createUser(data) {
    const response = await api.post('/users', data);
    return response.data.data;
  },

  async updateUser(id, data) {
    const response = await api.put(`/users/${id}`, data);
    return response.data.data;
  },

  async deleteUser(id) {
    const response = await api.delete(`/users/${id}`);
    return response.data.data;
  },

  async getAuditLogs(params = {}) {
    const response = await api.get('/audit-logs', { params });
    return response.data.data;
  },
};
