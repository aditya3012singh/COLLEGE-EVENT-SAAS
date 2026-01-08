import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  withCredentials: true, // Enable sending cookies with requests
  headers: { "Content-Type": "application/json" },
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user from localStorage and cookies
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        // Clear user cookie
        document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
        // Don't redirect here - let middleware handle it
      }
    }
    return Promise.reject(error);
  }
);

export default api;