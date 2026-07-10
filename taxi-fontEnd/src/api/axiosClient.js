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
      console.warn("🔐 Unauthorized - Please login again");
      
      // Clear token
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("authToken");
      
      // Redirect to login (adjust path as needed)
      if (window.location.pathname !== "/login") {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.");
        window.location.href = "/login";
      }
    } else if (error.response?.status === 403) {
      // Forbidden - no permission
      console.warn("🚫 Forbidden - No permission");
      alert("Bạn không có quyền thực hiện thao tác này.");
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