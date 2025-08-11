import api from './api';

export const orderService = {
  // Create new order
  async createOrder(orderData) {
    return api.post('/orders', orderData);
  },

  // Get user's orders
  async getUserOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders/my-orders${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  },

  // Get single order
  async getOrder(id) {
    return api.get(`/orders/${id}`);
  },

  // Get all orders (Staff/Admin only)
  async getAllOrders(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    const endpoint = `/orders${queryString ? `?${queryString}` : ''}`;
    return api.get(endpoint);
  },

  // Update order status (Staff/Admin only)
  async updateOrderStatus(id, status) {
    return api.patch(`/orders/${id}/status`, { status });
  },

  // Cancel order
  async cancelOrder(id) {
    return api.patch(`/orders/${id}/cancel`);
  },

  // Listen to order updates (WebSocket implementation can be added later)
  async subscribeToOrderUpdates(orderId, callback) {
    // For now, we'll use polling. WebSocket can be implemented later
    const pollInterval = setInterval(async () => {
      try {
        const response = await this.getOrder(orderId);
        if (response.success) {
          callback(response.data);
        }
      } catch (error) {
        console.error('Error polling order updates:', error);
      }
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(pollInterval);
  }
};
