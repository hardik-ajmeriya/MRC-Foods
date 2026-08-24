import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState
} from 'react';
import authService from '../services/authService';

export const AuthContext = createContext(null);

export const getRoleHome = (role) => {
  if (role === 'staff' || role === 'admin') {
    return '/staff';
  }

  return '/';
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(authService.getStoredUser());
  const [token, setToken] = useState(authService.getToken());
  const [isLoading, setIsLoading] = useState(true);

  const bootstrapSession = useCallback(async ({ signal } = {}) => {
    const storedToken = authService.getToken();

    if (!storedToken) {
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    if (authService.isTokenExpired(storedToken)) {
      authService.clearSession();
      setToken(null);
      setUser(null);
      setIsLoading(false);
      return;
    }

    setToken(storedToken);

    try {
      const response = await authService.getMe({
        suppressErrorLogging: true,
        signal
      });

      if (response?.success && response?.user) {
        if (signal?.aborted) {
          return;
        }

        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } else {
        authService.clearSession();
        setToken(null);
        setUser(null);
      }
    } catch (error) {
      if (error?.code === 'ERR_CANCELED' || error?.name === 'CanceledError') {
        return;
      }

      authService.clearSession();
      setToken(null);
      setUser(null);
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    bootstrapSession({ signal: controller.signal });

    return () => {
      controller.abort();
    };
  }, [bootstrapSession]);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);

    if (response?.success && response?.user) {
      setUser(response.user);
      setToken(authService.getToken());
    }

    return response;
  }, []);

  const register = useCallback(async (payload) => {
    const response = await authService.register(payload);

    if (response?.success && response?.user) {
      setUser(response.user);
      setToken(authService.getToken());
    }

    return response;
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
    setToken(null);
  }, []);

  const isAuthenticated = Boolean(token && user);

  const hasRole = useCallback(
    (...roles) => {
      if (!user) {
        return false;
      }

      return roles.includes(user.role);
    },
    [user]
  );

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated,
      login,
      register,
      logout,
      hasRole,
      getRoleHome
    }),
    [user, token, isLoading, isAuthenticated, login, register, logout, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
