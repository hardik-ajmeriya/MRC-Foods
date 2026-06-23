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

const parseTokenPayload = (token) => {
  if (!token || typeof atob !== 'function') {
    return null;
  }

  try {
    const [, payload] = token.split('.');

    if (!payload) {
      return null;
    }

    const base64 = payload
      .replace(/-/g, '+')
      .replace(/_/g, '/');
    const paddedBase64 = base64.padEnd(
      base64.length + ((4 - (base64.length % 4)) % 4),
      '='
    );

    const decodedPayload = atob(paddedBase64);
    return JSON.parse(decodedPayload);
  } catch {
    return null;
  }
};

const isTokenExpired = (token) => {
  if (!token) {
    return true;
  }

  const payload = parseTokenPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return payload.exp * 1000 <= Date.now();
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

  async getMe(options = {}) {
    const { suppressErrorLogging = false, signal } = options;

    return api.get('/auth/me', {
      suppressErrorLogging,
      signal
    });
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
  },

  isTokenExpired
};

export default authService;
