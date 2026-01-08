import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Register user
export const register = createAsyncThunk(
  "auth/register",
  async (userData, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/register", userData);
      const { user } = response.data;
      
      // Cookie is set automatically by the server
      // Store user info in localStorage for UI purposes
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Registration failed" }
      );
    }
  }
);

// Login user
export const login = createAsyncThunk(
  "auth/login",
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const { user } = response.data;
      
      // Cookie is set automatically by the server
      // Store user info in localStorage for UI purposes
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(user));
      }
      
      return user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Login failed" }
      );
    }
  }
);

// Get current user
export const getCurrentUser = createAsyncThunk(
  "auth/me",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/me");
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch user" }
      );
    }
  }
);

// Verify token
export const verifyToken = createAsyncThunk(
  "auth/verify",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/auth/verify");
      return response.data.user;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Token verification failed" }
      );
    }
  }
);

// Logout
export const logout = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      await api.post("/auth/logout");
      // Clear user info from localStorage
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
      }
      return null;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Logout failed" }
      );
    }
  }
);
