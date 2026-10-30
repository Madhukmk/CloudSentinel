import api from './api';

export const authService = {
  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    if (response.data && response.data.data) {
      const { token, id, name, role } = response.data.data;
      localStorage.setItem('cs_token', token);
      const user = { id, name, email, role };
      localStorage.setItem('cs_user', JSON.stringify(user));
      return user;
    }
    throw new Error('Invalid login response');
  },

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data.data;
  },

  logout() {
    localStorage.removeItem('cs_token');
    localStorage.removeItem('cs_user');
  },

  getStoredUser() {
    try {
      const user = localStorage.getItem('cs_user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  getStoredToken() {
    return localStorage.getItem('cs_token');
  },

  isAuthenticated() {
    return !!localStorage.getItem('cs_token');
  },
};
