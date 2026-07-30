import { createContext, useEffect, useState, useCallback, useContext } from 'react';
import authApi from '../api/authApi';
import { ROLES } from '../constants/roles';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const cachedUser = localStorage.getItem('user');
    if (cachedUser) {
      try {
        return JSON.parse(cachedUser);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  // Load user khi refresh trang (F5)
  const loadUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      const raw = res?.data || res;
      // Server trả về { success: true, user: { ... } }
      const userData = raw?.user || (raw?.role ? raw : null);

      if (userData && (userData.role || userData.roles || userData._id || userData.id)) {
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
      } else {
        const cachedUser = localStorage.getItem('user');
        if (cachedUser) {
          try {
            setUser(JSON.parse(cachedUser));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.error('loadUser profile error:', err);
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch (e) {
          setUser(null);
        }
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('authToken') || localStorage.getItem('token');
    if (token) {
      loadUser();
    } else {
      setLoading(false);
    }
  }, [loadUser]);

  const login = async (credentials) => {
    const res = await authApi.login(credentials);
    const data = res?.data || res;

    const token = data?.token || data?.accessToken;
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
    }

    const userData = data?.user || (data?.role ? data : null);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      await loadUser();
    }

    return res;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const hasRole = (allowedRoles = []) => {
    if (!allowedRoles || allowedRoles.length === 0) return true;
    if (!user) return false;

    const userRole = user.role || user.roles;
    if (Array.isArray(userRole)) {
      return userRole.some(r => allowedRoles.includes(r));
    }
    return allowedRoles.includes(userRole);
  };

  const getDefaultRoute = () => {
    const userRole = user?.role || user?.roles;
    const role = Array.isArray(userRole) ? userRole[0] : userRole;
    switch (role) {
      case ROLES.ACCOUNTANT:
        return '/reports';
      case ROLES.DRIVER:
        return '/active-vehicles';
      case ROLES.USER:
      case ROLES.CUSTOMER:
        return '/user-dashboard';
      default:
        return '/map';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        isAuthenticated: !!user,
        role: user?.role || user?.roles || null,
        hasRole,
        getDefaultRoute,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
