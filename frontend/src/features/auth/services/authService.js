import api from '../../../services/api';
import { AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../constants/storageKeys';

const persistSession = ({ token, user }) => {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

const clearSession = () => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(AUTH_USER_KEY);
};

const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);

    if (response?.success && response?.token && response?.user) {
      persistSession({ token: response.token, user: response.user });
    }

    return response;
  },

  async register(payload) {
    const response = await api.post('/auth/register', payload);

    if (response?.success && response?.token && response?.user) {
      persistSession({ token: response.token, user: response.user });
    }

    return response;
  },

  async getMe() {
    return api.get('/auth/me');
  },

  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      // Intentionally ignore network failures to always clear local auth state.
      console.error('Logout request failed:', error);
    } finally {
      clearSession();
    }
  },

  clearSession,

  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },

  getStoredUser() {
    const rawUser = localStorage.getItem(AUTH_USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      return JSON.parse(rawUser);
    } catch {
      clearSession();
      return null;
    }
  },

  isAuthenticated() {
    return Boolean(localStorage.getItem(AUTH_TOKEN_KEY));
  }
};

export default authService;
