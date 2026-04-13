import { createContext, useEffect, useState, useCallback, useContext } from 'react';
import authApi from '../api/authApi';
import { ROLES } from '../constants/roles';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load user khi refresh trang
  const loadUser = useCallback(async () => {
    try {
      const res = await authApi.me();
      // Hỗ trợ cả res.data và res trực tiếp
      const userData = res?.data || res;
      setUser(userData);
    } catch (err) {
      // Fallback: thử đọc user từ localStorage nếu API lỗi
      const cachedUser = localStorage.getItem('user');
      if (cachedUser) {
        try {
          setUser(JSON.parse(cachedUser));
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('accessToken');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Chỉ load nếu có token
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

    // Lấy token linh hoạt
    const token = data?.token || data?.accessToken;
    if (token) {
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token);
    }

    // Lấy user info (có thể nằm trong data.user hoặc chính data)
    const userData = data?.user || (data?.role ? data : null);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
    } else {
      // Nếu không có user trong response, gọi /auth/profile
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

  // Helper: kiểm tra user có 1 trong các role cho phép không
  // Dùng: hasRole([ROLES.ADMIN, ROLES.DISPATCHER])
  const hasRole = (allowedRoles = []) => {
    if (!user) return false;
    if (!allowedRoles || allowedRoles.length === 0) return true;
    const userRole = user.role || user.roles;
    if (Array.isArray(userRole)) {
      return userRole.some((r) => allowedRoles.includes(r));
    }
    return allowedRoles.includes(userRole);
  };

  // Redirect mặc định theo role sau khi đăng nhập
  const getDefaultRoute = () => {
    const userRole = user?.role || user?.roles;
    const role = Array.isArray(userRole) ? userRole[0] : userRole;
    switch (role) {
      case ROLES.ACCOUNTANT:
        return '/reports';
      case ROLES.DRIVER:
        return '/driver-portal';
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

// Convenience hook (cũng export từ đây để dùng nếu muốn)
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
