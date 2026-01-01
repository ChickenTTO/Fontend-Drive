import React from 'react';
import './Login.css';
// Import Icons (Đường dẫn tùy thuộc vào cấu trúc thực tế của bạn, giả định là components/icons)
import { GoogleIcon } from '../../components/icons';

const Login = ({ onLogin }) => {
    return (
        <div className="login-container">
            <div className="login-card">
                <h1 className="login-title">
                    Chào mừng đến với Smart Fleet AI
                </h1>
                <p className="login-subtitle">
                    Hệ thống điều xe thông minh.
                </p>
                <div className="login-actions">
                    <button
                        onClick={onLogin}
                        className="google-btn"
                    >
                        <GoogleIcon />
                        <span>Đăng nhập với Google</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Login;