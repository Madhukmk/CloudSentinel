import api from './api';

export const incidentService = {
  async getIncidents(params = {}) {
    const response = await api.get('/incidents', { params });
    return response.data.data;
  },

  async getIncidentById(id) {
    const response = await api.get(`/incidents/${id}`);
    return response.data.data;
  },

  async createIncident(payload) {
    const response = await api.post('/incidents', payload);
    return response.data.data;
  },

  async updateIncident(id, payload) {
    const response = await api.put(`/incidents/${id}`, payload);
    return response.data.data;
  },

  async getNotes(incidentId) {
    const response = await api.get(`/incidents/${incidentId}/notes`);
    return response.data.data;
  },

  async addNote(incidentId, note) {
    const response = await api.post(`/incidents/${incidentId}/notes`, { note });
    return response.data.data;
  },

  async updateNote(incidentId, noteId, note) {
    const response = await api.put(`/incidents/${incidentId}/notes/${noteId}`, { note });
    return response.data.data;
  },

  async deleteNote(incidentId, noteId) {
    const response = await api.delete(`/incidents/${incidentId}/notes/${noteId}`);
    return response.data.data;
  },
};
