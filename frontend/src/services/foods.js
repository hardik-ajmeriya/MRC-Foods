import api from './api';

export const foodService = {
  async getFoods(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/foods${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  },

  async getFood(id) {
    return api.get(`/foods/${id}`);
  },

  async createFood(payload) {
    return api.post('/foods', payload);
  },

  async updateFood(id, payload) {
    return api.put(`/foods/${id}`, payload);
  },

  async deleteFood(id) {
    return api.delete(`/foods/${id}`);
  },

  async updateAvailability(id, isAvailable) {
    return api.patch(`/foods/${id}/availability`, { isAvailable });
  }
};
