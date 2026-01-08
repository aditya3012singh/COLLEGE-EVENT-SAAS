import axios from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api",
  withCredentials: true, // Enable sending cookies with requests
  headers: { "Content-Type": "application/json" },
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear user from localStorage and redirect to login
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        window.location.href = "/auth";
      }
    }
    return Promise.reject(error);
  }
);

export default api;