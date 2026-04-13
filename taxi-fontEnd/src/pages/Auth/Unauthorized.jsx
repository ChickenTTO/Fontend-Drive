import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Unauthorized = () => {
    const navigate = useNavigate();
    const { getDefaultRoute } = useAuth();

    return (
        <div
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100vh',
                textAlign: 'center',
                gap: 16,
                background: 'var(--bg-primary, #f8fafc)',
                color: 'var(--text-primary, #1e293b)',
            }}
        >
            <div style={{ fontSize: 80 }}>🚫</div>
            <h1 style={{ fontSize: 32, fontWeight: 700, margin: 0 }}>403 - Không đủ quyền</h1>
            <p style={{ color: '#64748b', maxWidth: 400, lineHeight: 1.6 }}>
                Bạn không có quyền truy cập trang này. Vui lòng liên hệ quản trị viên nếu bạn
                cần được cấp quyền.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: '1px solid #e2e8f0',
                        background: 'white',
                        cursor: 'pointer',
                        fontWeight: 500,
                    }}
                >
                    ← Quay lại
                </button>
                <button
                    onClick={() => navigate(getDefaultRoute())}
                    style={{
                        padding: '10px 20px',
                        borderRadius: 8,
                        border: 'none',
                        background: '#3b82f6',
                        color: 'white',
                        cursor: 'pointer',
                        fontWeight: 500,
                    }}
                >
                    Về trang chính
                </button>
            </div>
        </div>
    );
};

export default Unauthorized;
