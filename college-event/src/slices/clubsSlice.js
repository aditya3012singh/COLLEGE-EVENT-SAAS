// src/slices/clubsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

/* -------------------- Thunks -------------------- */

// Fetch paginated clubs (optionally filtered by collegeId)
export const fetchClubs = createAsyncThunk(
  'clubs/fetch',
  async ({ collegeId, page = 1, limit = 20 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/clubs', { params: { collegeId, page, limit } });
      // backend returns { data: [...], pagination: { total, page, limit } } or array
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch clubs failed' });
    }
  }
);

// Fetch a single club by id
export const fetchClubById = createAsyncThunk(
  'clubs/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/clubs/${id}`);
      return res.data.data ?? res.data.club ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch club failed' });
    }
  }
);

// Create a club (organizer/admin)
export const createClub = createAsyncThunk(
  'clubs/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/clubs', payload);
      // controller returns { data: club }
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Create club failed' });
    }
  }
);

// Update a club
export const updateClub = createAsyncThunk(
  'clubs/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/clubs/${id}`, data);
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Update club failed' });
    }
  }
);

// Delete a club
export const deleteClub = createAsyncThunk(
  'clubs/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/clubs/${id}`);
      // controller returns { message, data: club } or maybe success boolean
      // return deleted id for reducer convenience
      return res.data.data?.id ?? res.data.deletedId ?? id;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Delete club failed' });
    }
  }
);

// Get my club memberships (student)
export const fetchMyMemberships = createAsyncThunk(
  'clubs/fetchMyMemberships',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/clubs/my-memberships');
      return res.data.data ?? res.data.memberships ?? [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch memberships failed' });
    }
  }
);

// Join a club (student registration)
export const joinClub = createAsyncThunk(
  'clubs/join',
  async (clubId, { rejectWithValue }) => {
    try {
      const res = await api.post(`/clubs/${clubId}/join`);
      return res.data.data ?? res.data.membership ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Join club failed' });
    }
  }
);

// Get my created clubs (organizer/admin)
export const fetchMyClubs = createAsyncThunk(
  'clubs/fetchMy',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/clubs/my');
      return res.data.data ?? res.data.clubs ?? [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch my clubs failed' });
    }
  }
);

// Get club membership requests (organizer/admin)
export const fetchMembershipRequests = createAsyncThunk(
  'clubs/fetchMembershipRequests',
  async (_, { rejectWithValue }) => {
    try {
      const res = await api.get('/clubs/membership-requests');
      return res.data.data ?? res.data.requests ?? [];
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch membership requests failed' });
    }
  }
);

// Update membership status (approve/reject)
export const updateMembershipStatus = createAsyncThunk(
  'clubs/updateMembershipStatus',
  async ({ membershipId, status }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/clubs/memberships/${membershipId}`, { status });
      return res.data.data ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Update membership status failed' });
    }
  }
);

/* -------------------- Slice -------------------- */

const initialState = {
  items: [],
  current: null,
  myMemberships: [], // Student's club memberships
  myClubs: [], // Organizer's created clubs
  membershipRequests: [], // Pending membership requests for organizer's clubs
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 0,
  status: 'idle',
  loadingMap: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
    fetchingMemberships: false,
    fetchingMyClubs: false,
    fetchingRequests: false,
    updatingMembership: false,
    joining: false,
  },
  error: null,
};

const clubsSlice = createSlice({
  name: 'clubs',
  initialState,
  reducers: {
    clearClubsError(state) {
      state.error = null;
    },
    clearCurrentClub(state) {
      state.current = null;
    },
    setClubs(state, action) {
      state.items = action.payload || [];
    },
    addClubLocal(state, action) {
      state.items.unshift(action.payload);
    },
    removeClubLocal(state, action) {
      const id = action.payload;
      state.items = state.items.filter((c) => c.id !== id);
      if (state.current?.id === id) state.current = null;
      state.total = Math.max(0, state.total - 1);
    },
    applyLocalClubUpdate(state, action) {
      const updated = action.payload;
      state.items = state.items.map((c) => (c.id === updated.id ? { ...c, ...updated } : c));
      if (state.current?.id === updated.id) state.current = { ...state.current, ...updated };
    },
  },
  extraReducers: (builder) => {
    // fetchClubs
    builder
      .addCase(fetchClubs.pending, (state) => {
        state.status = 'loading';
        state.loadingMap.fetching = true;
        state.error = null;
      })
      .addCase(fetchClubs.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loadingMap.fetching = false;

        const payload = action.payload ?? {};
        // payload may be array or object with data & pagination
        const items = Array.isArray(payload) ? payload : payload.data ?? payload.clubs ?? [];
        state.items = items;

        const pagination = payload.pagination ?? payload.meta ?? {};
        state.page = pagination.page ?? state.page;
        state.limit = pagination.limit ?? state.limit;
        state.total = pagination.total ?? (Array.isArray(items) ? items.length : state.total);
        state.totalPages = pagination.totalPages ?? Math.ceil(state.total / state.limit);
      })
      .addCase(fetchClubs.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMap.fetching = false;
        state.error = action.payload ?? action.error;
      });

    // fetchClubById
    builder
      .addCase(fetchClubById.pending, (state) => {
        state.status = 'loading';
        state.loadingMap.fetching = true;
        state.error = null;
      })
      .addCase(fetchClubById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loadingMap.fetching = false;
        state.current = action.payload ?? null;
        if (action.payload?.id) {
          const idx = state.items.findIndex((c) => c.id === action.payload.id);
          if (idx >= 0) state.items[idx] = action.payload;
          else state.items.unshift(action.payload);
        }
      })
      .addCase(fetchClubById.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMap.fetching = false;
        state.error = action.payload ?? action.error;
      });

    // createClub
    builder
      .addCase(createClub.pending, (state) => {
        state.loadingMap.creating = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createClub.fulfilled, (state, action) => {
        state.loadingMap.creating = false;
        state.status = 'succeeded';
        const created = action.payload;
        if (created && created.id) {
          const exists = state.items.find((c) => c.id === created.id);
          if (!exists) state.items.unshift(created);
          state.total = state.total + 1;
          state.current = created;
        }
      })
      .addCase(createClub.rejected, (state, action) => {
        state.loadingMap.creating = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // updateClub
    builder
      .addCase(updateClub.pending, (state) => {
        state.loadingMap.updating = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateClub.fulfilled, (state, action) => {
        state.loadingMap.updating = false;
        state.status = 'succeeded';
        const updated = action.payload;
        if (updated && updated.id) {
          state.items = state.items.map((c) => (c.id === updated.id ? updated : c));
          if (state.current?.id === updated.id) state.current = updated;
        }
      })
      .addCase(updateClub.rejected, (state, action) => {
        state.loadingMap.updating = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // deleteClub
    builder
      .addCase(deleteClub.pending, (state) => {
        state.loadingMap.deleting = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteClub.fulfilled, (state, action) => {
        state.loadingMap.deleting = false;
        state.status = 'succeeded';
        const deletedId = action.payload;
        state.items = state.items.filter((c) => c.id !== deletedId);
        if (state.current?.id === deletedId) state.current = null;
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteClub.rejected, (state, action) => {
        state.loadingMap.deleting = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // fetchMyMemberships
    builder
      .addCase(fetchMyMemberships.pending, (state) => {
        state.loadingMap.fetchingMemberships = true;
        state.error = null;
      })
      .addCase(fetchMyMemberships.fulfilled, (state, action) => {
        state.loadingMap.fetchingMemberships = false;
        state.myMemberships = action.payload ?? [];
      })
      .addCase(fetchMyMemberships.rejected, (state, action) => {
        state.loadingMap.fetchingMemberships = false;
        state.error = action.payload ?? action.error;
      });

    // joinClub
    builder
      .addCase(joinClub.pending, (state) => {
        state.loadingMap.joining = true;
        state.error = null;
      })
      .addCase(joinClub.fulfilled, (state, action) => {
        state.loadingMap.joining = false;
        const membership = action.payload;
        if (membership) {
          // Add to memberships if not already there
          const exists = state.myMemberships.find((m) => m.id === membership.id);
          if (!exists) {
            state.myMemberships.unshift(membership);
          }
        }
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.loadingMap.joining = false;
        state.error = action.payload ?? action.error;
      });

    // fetchMyClubs
    builder
      .addCase(fetchMyClubs.pending, (state) => {
        state.loadingMap.fetchingMyClubs = true;
        state.error = null;
      })
      .addCase(fetchMyClubs.fulfilled, (state, action) => {
        state.loadingMap.fetchingMyClubs = false;
        state.myClubs = action.payload ?? [];
      })
      .addCase(fetchMyClubs.rejected, (state, action) => {
        state.loadingMap.fetchingMyClubs = false;
        state.error = action.payload ?? action.error;
      });

    // fetchMembershipRequests
    builder
      .addCase(fetchMembershipRequests.pending, (state) => {
        state.loadingMap.fetchingRequests = true;
        state.error = null;
      })
      .addCase(fetchMembershipRequests.fulfilled, (state, action) => {
        state.loadingMap.fetchingRequests = false;
        state.membershipRequests = action.payload ?? [];
      })
      .addCase(fetchMembershipRequests.rejected, (state, action) => {
        state.loadingMap.fetchingRequests = false;
        state.error = action.payload ?? action.error;
      });

    // updateMembershipStatus
    builder
      .addCase(updateMembershipStatus.pending, (state) => {
        state.loadingMap.updatingMembership = true;
        state.error = null;
      })
      .addCase(updateMembershipStatus.fulfilled, (state, action) => {
        state.loadingMap.updatingMembership = false;
        const updated = action.payload;
        // Remove from requests if approved/rejected
        state.membershipRequests = state.membershipRequests.filter((r) => r.id !== updated.id);
      })
      .addCase(updateMembershipStatus.rejected, (state, action) => {
        state.loadingMap.updatingMembership = false;
        state.error = action.payload ?? action.error;
      });
  },
});

/* -------------------- Exports -------------------- */

export const {
  clearClubsError,
  clearCurrentClub,
  setClubs,
  addClubLocal,
  removeClubLocal,
  applyLocalClubUpdate,
} = clubsSlice.actions;

export const selectClubsState = (state) => state.clubs;
export const selectClubs = (state) => state.clubs.items;
export const selectClubsMeta = (state) => ({
  page: state.clubs.page,
  limit: state.clubs.limit,
  total: state.clubs.total,
  totalPages: state.clubs.totalPages,
});
export const selectCurrentClub = (state) => state.clubs.current;
export const selectMyMemberships = (state) => state.clubs.myMemberships;
export const selectMyClubs = (state) => state.clubs.myClubs;
export const selectMembershipRequests = (state) => state.clubs.membershipRequests;
export const selectClubsLoading = (state) => state.clubs.loadingMap;
export const selectClubsError = (state) => state.clubs.error;

export default clubsSlice.reducer;
