import api from './api';

export const dashboardService = {
  async getStats() {
    const response = await api.get('/dashboard/stats');
    return response.data.data;
  },

  async getEventsOverTime(range = '24h') {
    const response = await api.get('/dashboard/events-over-time', { params: { range } });
    return response.data.data;
  },

  async getDetectionActivity() {
    const response = await api.get('/dashboard/detection-activity');
    return response.data.data;
  },

  async search(query) {
    const response = await api.get('/dashboard/search', { params: { q: query } });
    return response.data.data;
  },

  async getAlertsBySeverity() {
    const response = await api.get('/dashboard/alerts-by-severity');
    return response.data.data;
  },

  async getLogsBySource() {
    const response = await api.get('/dashboard/logs-by-source');
    return response.data.data;
  },

  async getTopSourceIps() {
    const response = await api.get('/dashboard/top-source-ips');
    return response.data.data;
  },

  async getEventTypes() {
    const response = await api.get('/dashboard/event-types');
    return response.data.data;
  },

  async getRecentAlerts() {
    const response = await api.get('/dashboard/recent-alerts');
    return response.data.data;
  },

  async getRecentLogs() {
    const response = await api.get('/dashboard/recent-logs');
    return response.data.data;
  },
};
