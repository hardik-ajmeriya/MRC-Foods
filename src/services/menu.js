import api from './api';

export const menuService = {
  // Get all menu items
  async getMenuItems(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/menu${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  },

  // Get menu items by category
  async getMenuItemsByCategory(categoryName) {
    return api.get(`/menu?category=${encodeURIComponent(categoryName)}`);
  },

  // Get single menu item
  async getMenuItem(id) {
    return api.get(`/menu/${id}`);
  },

  // Search menu items
  async searchMenuItems(searchTerm) {
    return api.get(`/menu?search=${encodeURIComponent(searchTerm)}`);
  },

  // Create menu item (Admin/Staff only)
  async createMenuItem(menuItemData) {
    return api.post('/menu', menuItemData);
  },

  // Update menu item (Admin/Staff only)
  async updateMenuItem(id, menuItemData) {
    return api.put(`/menu/${id}`, menuItemData);
  },

  // Delete menu item (Admin only)
  async deleteMenuItem(id) {
    return api.delete(`/menu/${id}`);
  }
};
