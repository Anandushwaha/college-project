import axios from "axios";

// Create base axios instance for API calls
const api = axios.create({
  baseURL: "http://localhost:5000/api/v1", // Update with your backend URL
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add a request interceptor to include token in requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If the error is 401 and we haven't retried the request yet
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        const response = await axios.post(
          "http://localhost:5000/api/v1/auth/refresh",
          {},
          {
            withCredentials: true,
          }
        );

        if (response.status === 200) {
          // If token refresh was successful, retry the original request
          return api(originalRequest);
        }
      } catch (refreshError) {
        // If token refresh fails, redirect to login
        localStorage.removeItem("token");
        window.location.href = "/";
      }
    }

    return Promise.reject(error);
  }
);

export default api;
