import React, { useState } from "react";
import "./Login.css";
import { GoogleIcon } from "../../components/icons";
import authApi from "../../api/authApi";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!username || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu");
      return;
    }

    setLoading(true);
    try {
      // Gọi API login
      const res = await authApi.login({ username, password });

      // Debug: log response
      console.log("LOGIN RESPONSE:", res);

      // Parse token linh hoạt
      let token = null;
      let message = "";

      if (res?.token) {
        token = res.token;
      } else if (res?.data?.token) {
        token = res.data.token;
      } else if (res?.accessToken) {
        token = res.accessToken;
      } else if (res?.data?.accessToken) {
        token = res.data.accessToken;
      } else if (res?.success === false) {
        message = res.msg || res.message || "Đăng nhập thất bại";
      } else if (res?.msg) {
        message = res.msg;
      }

      if (token) {
        // Save token with consistent key
        localStorage.setItem("authToken", token);
        
        // Also save to other keys for compatibility
        localStorage.setItem("token", token);
        
        // Save user info if available
        const user = res?.user || res?.data?.user;
        if (user) {
          localStorage.setItem("user", JSON.stringify(user));
        }
        
        console.log("✅ Token saved successfully");
        
        // Call onLogin callback
        if (onLogin) {
          onLogin();
        }
      } else {
        setError(message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
      }

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
            onClick={() => alert("Tính năng đăng nhập Google đang được phát triển")} 
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