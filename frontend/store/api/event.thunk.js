import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Get all events
export const getAllEvents = createAsyncThunk(
  "events/getAll",
  async ({ page = 1, limit = 20, visibility, clubId } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (visibility) params.visibility = visibility;
      if (clubId) params.clubId = clubId;
      
      const response = await api.get("/events", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch events" }
      );
    }
  }
);

// Get event by ID
export const getEventById = createAsyncThunk(
  "events/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/events/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch event" }
      );
    }
  }
);

// Create event (ORGANIZER/ADMIN)
export const createEvent = createAsyncThunk(
  "events/create",
  async (eventData, { rejectWithValue }) => {
    try {
      const response = await api.post("/events", eventData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to create event" }
      );
    }
  }
);

// Update event
export const updateEvent = createAsyncThunk(
  "events/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to update event" }
      );
    }
  }
);

// Delete event
export const deleteEvent = createAsyncThunk(
  "events/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/events/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to delete event" }
      );
    }
  }
);

// Update event visibility
export const updateEventVisibility = createAsyncThunk(
  "events/updateVisibility",
  async ({ id, visibility, allowedColleges }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/events/${id}/visibility`, {
        visibility,
        allowedColleges,
      });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to update visibility" }
      );
    }
  }
);
