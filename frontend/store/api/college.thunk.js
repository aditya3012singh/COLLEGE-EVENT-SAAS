import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Get all colleges
export const getAllColleges = createAsyncThunk(
  "colleges/getAll",
  async ({ page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const response = await api.get("/colleges", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch colleges" }
      );
    }
  }
);

// Get college by ID
export const getCollegeById = createAsyncThunk(
  "colleges/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/colleges/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch college" }
      );
    }
  }
);

// Create college (ADMIN only)
export const createCollege = createAsyncThunk(
  "colleges/create",
  async (collegeData, { rejectWithValue }) => {
    try {
      const response = await api.post("/colleges", collegeData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to create college" }
      );
    }
  }
);

// Update college (ADMIN only)
export const updateCollege = createAsyncThunk(
  "colleges/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/colleges/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to update college" }
      );
    }
  }
);

// Delete college (ADMIN only)
export const deleteCollege = createAsyncThunk(
  "colleges/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/colleges/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to delete college" }
      );
    }
  }
);
