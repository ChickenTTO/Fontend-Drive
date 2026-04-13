import React, { useState } from "react";
import "./Login.css";
import { GoogleIcon } from "../../components/icons";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate, useLocation, Navigate } from "react-router-dom";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Lấy thêm 'user' từ useAuth để biết người đang đăng nhập có role gì
  const { login, getDefaultRoute, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu đã đăng nhập, redirect về trang phù hợp
  if (isAuthenticated) {
    let defaultPath = getDefaultRoute();

    // Ép route cho user phòng trường hợp hàm getDefaultRoute chưa được cập nhật
    if (user && (user.role === "user" || user.role === "customer")) {
      defaultPath = "/user-dashboard";
    }

    const from = location.state?.from?.pathname || defaultPath;
    // Dùng thẳng component <Navigate> của react-router-dom cho an toàn
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // Hứng kết quả trả về từ hàm login (nếu có)
      const loggedInUser = await login({ username, password });

      let targetRoute = getDefaultRoute();

      // Bắt luồng xử lý: Nếu tài khoản là user/customer thì ép về /user-dashboard
      const currentRole = loggedInUser?.role || user?.role;
      if (currentRole === "user" || currentRole === "customer") {
        targetRoute = "/user-dashboard";
      }

      // Redirect về trang user muốn vào trước đó (nếu có) hoặc default theo role
      const from = location.state?.from?.pathname;
      navigate(from || targetRoute, { replace: true });
    } catch (err) {
      console.error("LOGIN ERROR:", err);

      let errorMsg = "Có lỗi xảy ra, thử lại sau";
      if (err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err.response?.data?.msg) {
        errorMsg = err.response.data.msg;
      } else if (err.message) {
        errorMsg = err.message;
      }
      setError(errorMsg);
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
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <div className="divider">Hoặc</div>

        <div className="login-actions">
          <button
            type="button"
            onClick={() =>
              alert("Tính năng đăng nhập Google đang được phát triển")
            }
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
