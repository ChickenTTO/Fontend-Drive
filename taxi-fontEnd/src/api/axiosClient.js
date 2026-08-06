import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://localhost:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Add token to every request
axiosClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage - check all possible keys
    const token = localStorage.getItem("authToken") || 
                  localStorage.getItem("token") || 
                  localStorage.getItem("accessToken");
    
    if (token) {
      // Add token to Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn("⚠️ No token found in localStorage");
    }
    
    console.log("📤 API Request:", config.method?.toUpperCase(), config.url, {
      hasToken: !!token,
      headers: config.headers.Authorization ? "Bearer ***" : "No auth",
      data: config.data
    });
    
    return config;
  },
  (error) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - Handle responses and errors
axiosClient.interceptors.response.use(
  (response) => {
    console.log("✅ API Response:", response.status, response.config.url, response.data);
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      url: error.config?.url,
      status: error.response?.status,
      message: error.response?.data?.message || error.message,
      data: error.response?.data
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      // Unauthorized - token invalid or expired
      console.warn("🔐 Unauthorized - Session expired, clearing tokens & user state");
      
      // Clear all auth tokens & cached user data
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      localStorage.removeItem("user");
      
      // Dispatch logout event so AuthContext resets state instantly
      window.dispatchEvent(new Event("auth_logout"));

      // Redirect to login smoothly if not already on login page
      if (window.location.pathname !== "/login" && !window._isRedirectingToLogin) {
        window._isRedirectingToLogin = true;
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      // Forbidden - no permission (log to console instead of popping up intrusive alerts)
      console.warn("🚫 Forbidden:", error.response?.data?.message || "Bạn không có quyền thực hiện thao tác này.");
    } else if (error.response?.status === 404) {
      // Not found
      console.warn("🔍 Not Found");
    } else if (error.response?.status >= 500) {
      // Server error
      console.error("🔥 Server Error");
    }

    return Promise.reject(error);
  }
);

export default axiosClient;