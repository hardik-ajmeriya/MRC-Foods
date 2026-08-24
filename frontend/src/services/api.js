import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const HOME_FOODS_ENDPOINT = import.meta.env.VITE_FOODS_ENDPOINT || '/foods';

const axiosClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 12000,
  headers: {
    'Content-Type': 'application/json'
  }
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
    if (config.headers && typeof config.headers.set === 'function') {
      config.headers.set('Content-Type', undefined);
    } else if (config.headers) {
      delete config.headers['Content-Type'];
    }
  }

  return config;
});

class ApiClient {
  constructor(client) {
    this.client = client;
  }

  async request(config) {
    const { suppressErrorLogging = false, ...axiosConfig } = config;

    try {
      const response = await this.client.request(axiosConfig);
      return response.data;
    } catch (error) {
      if (!suppressErrorLogging) {
        console.error('API Request Error:', error);
      }

      const apiError = new Error(
        error.response?.data?.message ||
          error.response?.data?.error ||
          error.message ||
          'API request failed'
      );

      apiError.status = error.response?.status;
      apiError.payload = error.response?.data;
      throw apiError;
    }
  }

  async get(endpoint, config = {}) {
    return this.request({
      url: endpoint,
      method: 'GET',
      ...config
    });
  }

  async post(endpoint, data = {}, config = {}) {
    return this.request({
      url: endpoint,
      method: 'POST',
      data,
      ...config
    });
  }

  async put(endpoint, data = {}, config = {}) {
    return this.request({
      url: endpoint,
      method: 'PUT',
      data,
      ...config
    });
  }

  async patch(endpoint, data = {}, config = {}) {
    return this.request({
      url: endpoint,
      method: 'PATCH',
      data,
      ...config
    });
  }

  async delete(endpoint, config = {}) {
    return this.request({
      url: endpoint,
      method: 'DELETE',
      ...config
    });
  }
}

const api = new ApiClient(axiosClient);

const getDataArray = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  return [];
};

export const homeApi = {
  async getFoods(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const foodsEndpoint = `${HOME_FOODS_ENDPOINT}${queryString ? `?${queryString}` : ''}`;

    try {
      const response = await api.get(foodsEndpoint, {
        suppressErrorLogging: true
      });
      return getDataArray(response);
    } catch (error) {
      if (HOME_FOODS_ENDPOINT !== '/foods' || error.status !== 404) {
        throw error;
      }

      const fallbackResponse = await api.get(`/menu${queryString ? `?${queryString}` : ''}`);
      return getDataArray(fallbackResponse);
    }
  },

  async getCategories() {
    const response = await api.get('/categories');
    return getDataArray(response);
  }
};

export default api;
