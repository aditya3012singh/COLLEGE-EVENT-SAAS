import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Bootstrap system (first-time setup)
export const bootstrapSystem = createAsyncThunk(
  "bootstrap/system",
  async (bootstrapData, { rejectWithValue }) => {
    try {
      const response = await api.post("/bootstrap", bootstrapData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Bootstrap failed" }
      );
    }
  }
);
