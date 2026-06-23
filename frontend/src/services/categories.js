import api from './api';

export const categoryService = {
  // Get all categories
  async getCategories(active = true, search = '') {
    const params = new URLSearchParams();
    params.set('active', active !== undefined ? active : 'all');

    if (search) {
      params.set('search', search);
    }

    const endpoint = `/categories?${params.toString()}`;
    return api.get(endpoint);
  },

  // Get single category
  async getCategory(id) {
    return api.get(`/categories/${id}`);
  },

  // Create category (Admin/Staff only)
  async createCategory(categoryData) {
    return api.post('/categories', categoryData);
  },

  // Update category (Admin/Staff only)
  async updateCategory(id, categoryData) {
    return api.put(`/categories/${id}`, categoryData);
  },

  // Delete category (Admin only)
  async deleteCategory(id) {
    return api.delete(`/categories/${id}`);
  }
};
