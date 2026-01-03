import React, { useState } from 'react';
import './Login.css';
// Import Icons (Đường dẫn tùy thuộc vào cấu trúc thực tế của bạn, giả định là components/icons)
import { GoogleIcon } from '../../components/icons';

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu');
      return;
    }

    try {
      setLoading(true);
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Đăng nhập thất bại');
        setLoading(false);
        return;
      }

      // Lưu token vào localStorage (hoặc tuỳ theo cơ chế auth của bạn)
      if (data.token) localStorage.setItem('authToken', data.token);

      // Kích hoạt callback onLogin để App.jsx chuyển trang
      if (onLogin) onLogin();
    } catch (err) {
      setError('Có lỗi xảy ra, thử lại sau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">Chào mừng đến với Smart Fleet AI</h1>
        <p className="login-subtitle">Hệ thống điều xe thông minh.</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Tên đăng nhập</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Nhập tên đăng nhập"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Mật khẩu</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Nhập mật khẩu"
              autoComplete="current-password"
            />
          </div>

          {error && <div className="error-text">{error}</div>}

          <button className="login-btn" type="submit" disabled={loading}>
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div className="divider">Hoặc</div>

        <div className="login-actions">
          <button onClick={onLogin} className="google-btn">
            <GoogleIcon />
            <span>Đăng nhập với Google</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;