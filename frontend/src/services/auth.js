import featureAuthService from '../features/auth/services/authService';

export const authService = {
  register: (userData) => featureAuthService.register(userData),
  login: (credentials) => featureAuthService.login(credentials),
  logout: () => featureAuthService.logout(),
  getCurrentUser: () => featureAuthService.getMe(),
  isAuthenticated: () => featureAuthService.isAuthenticated(),
  getUser: () => featureAuthService.getStoredUser(),
  getToken: () => featureAuthService.getToken()
};
