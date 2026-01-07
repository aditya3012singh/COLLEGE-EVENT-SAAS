import { createAsyncThunk } from "@reduxjs/toolkit";
import api from "@/lib/axios";

// Get all clubs
export const getAllClubs = createAsyncThunk(
  "clubs/getAll",
  async ({ page = 1, limit = 20, collegeId } = {}, { rejectWithValue }) => {
    try {
      const params = { page, limit };
      if (collegeId) params.collegeId = collegeId;
      
      const response = await api.get("/clubs", { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch clubs" }
      );
    }
  }
);

// Get club by ID
export const getClubById = createAsyncThunk(
  "clubs/getById",
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/clubs/${id}`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch club" }
      );
    }
  }
);

// Get user's clubs
export const getMyClubs = createAsyncThunk(
  "clubs/getMyClubs",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/clubs/my/list");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch your clubs" }
      );
    }
  }
);

// Get user's memberships
export const getMyMemberships = createAsyncThunk(
  "clubs/getMyMemberships",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/clubs/my/memberships");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch memberships" }
      );
    }
  }
);

// Create club (ORGANIZER/ADMIN)
export const createClub = createAsyncThunk(
  "clubs/create",
  async (clubData, { rejectWithValue }) => {
    try {
      const response = await api.post("/clubs", clubData);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to create club" }
      );
    }
  }
);

// Update club
export const updateClub = createAsyncThunk(
  "clubs/update",
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/clubs/${id}`, data);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to update club" }
      );
    }
  }
);

// Delete club
export const deleteClub = createAsyncThunk(
  "clubs/delete",
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/clubs/${id}`);
      return id;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to delete club" }
      );
    }
  }
);

// Join club
export const joinClub = createAsyncThunk(
  "clubs/join",
  async (clubId, { rejectWithValue }) => {
    try {
      const response = await api.post(`/clubs/${clubId}/join`);
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to join club" }
      );
    }
  }
);

// Get membership requests (ORGANIZER/ADMIN)
export const getMembershipRequests = createAsyncThunk(
  "clubs/getMembershipRequests",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/clubs/membership-requests");
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to fetch requests" }
      );
    }
  }
);

// Update membership status (approve/reject)
export const updateMembershipStatus = createAsyncThunk(
  "clubs/updateMembershipStatus",
  async ({ id, status }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/clubs/memberships/${id}`, { status });
      return response.data.data;
    } catch (error) {
      return rejectWithValue(
        error.response?.data?.error || { message: "Failed to update membership" }
      );
    }
  }
);
