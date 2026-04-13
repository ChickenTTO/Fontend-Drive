import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * PrivateRoute - Bảo vệ route theo auth và/hoặc role
 *
 * Cách dùng:
 *   <PrivateRoute>                          → chỉ cần đăng nhập
 *   <PrivateRoute roles={[ROLES.ADMIN]}>    → cần đúng role
 */
const PrivateRoute = ({ children, roles }) => {
    const { isAuthenticated, loading, hasRole } = useAuth();
    const location = useLocation();

    // Đang kiểm tra auth → hiển thị loading
    if (loading) {
        return (
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100vh',
                    fontSize: 18,
                    color: '#888',
                }}
            >
                <div style={{ textAlign: 'center' }}>
                    <div
                        style={{
                            width: 40,
                            height: 40,
                            border: '4px solid #e2e8f0',
                            borderTop: '4px solid #3b82f6',
                            borderRadius: '50%',
                            animation: 'spin 0.8s linear infinite',
                            margin: '0 auto 12px',
                        }}
                    />
                    Đang tải...
                </div>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    // Chưa đăng nhập → về trang login (lưu lại trang đang muốn vào)
    if (!isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Có yêu cầu role cụ thể nhưng không đủ quyền
    if (roles && roles.length > 0 && !hasRole(roles)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return children;
};

export default PrivateRoute;
