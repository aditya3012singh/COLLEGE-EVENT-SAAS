import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Register for event (STUDENT)
export const registerForEvent = createAsyncThunk(
  "registrations/register",
  async (eventId, { rejectWithValue }) => {
    try {
      const response = await api.post("/registrations", { eventId });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to register for event" }
      );
    }
  }
);

// Get registration by ID
export const getRegistrationById = createAsyncThunk(
  "registrations/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/registrations/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch registration" }
      );
    }
  }
);

// Cancel registration
export const cancelRegistration = createAsyncThunk(
  "registrations/cancel",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/registrations/${id}/cancel`);
      return { id, ...response.data.data };
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to cancel registration" }
      );
    }
  }
);

// Check-in to event (ORGANIZER/ADMIN)
export const checkInEvent = createAsyncThunk(
  "registrations/checkIn",
  async (qrPayload, { rejectWithValue }) => {
    try {
      const response = await api.post("/registrations/checkin", { qrPayload });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to check-in" }
      );
    }
  }
);
