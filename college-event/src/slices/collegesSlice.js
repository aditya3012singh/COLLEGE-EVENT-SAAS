// src/slices/collegesSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

/* -------------------- Thunks -------------------- */

// Fetch all colleges (paginated optional in backend)
export const fetchColleges = createAsyncThunk(
  'colleges/fetchAll',
  async ({ limit = 100, skip = 0 } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/colleges', { params: { limit, skip } });
      // backend returns { colleges: [...], count } or array directly
      return res.data.colleges ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { error: 'Fetch colleges failed' });
    }
  }
);

// Fetch single college by id
export const fetchCollegeById = createAsyncThunk(
  'colleges/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/colleges/${id}`);
      return res.data.college ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { error: 'Fetch college failed' });
    }
  }
);

// Create a college (admin)
export const createCollege = createAsyncThunk(
  'colleges/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/colleges', payload);
      return res.data.college ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { error: 'Create college failed' });
    }
  }
);

// Update college
export const updateCollege = createAsyncThunk(
  'colleges/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/colleges/${id}`, data);
      return res.data.college ?? res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { error: 'Update college failed' });
    }
  }
);

// Delete college (admin) - returns deleted id or confirmation
export const deleteCollege = createAsyncThunk(
  'colleges/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/colleges/${id}`);
      // server returns { college: { id,... } } or { deleted: id } or nothing
      return res.data.college?.id ?? res.data.deletedId ?? id;
    } catch (err) {
      return rejectWithValue(err?.response?.data ?? { error: 'Delete college failed' });
    }
  }
);

/* -------------------- Slice -------------------- */

const initialState = {
  items: [], // list of colleges
  current: null, // single college details
  status: 'idle',
  // Pagination state
  total: 0,
  count: 0,
  skip: 0,
  limit: 100,
  totalPages: 0,
  loadingMap: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
};

const collegesSlice = createSlice({
  name: 'colleges',
  initialState,
  reducers: {
    clearCollegesError(state) {
      state.error = null;
    },
    clearCurrentCollege(state) {
      state.current = null;
    },
    // optimistic add (UI-only; server should return canonical)
    addCollegeLocal(state, action) {
      state.items.unshift(action.payload);
    },
    // optimistic remove (UI-only)
    removeCollegeLocal(state, action) {
      const id = action.payload;
      state.items = state.items.filter((c) => c.id !== id);
      if (state.current?.id === id) state.current = null;
    },
    // replace whole list (useful for rehydration)
    setColleges(state, action) {
      state.items = action.payload || [];
    },
  },
  extraReducers: (builder) => {
    // fetchColleges
    builder
      .addCase(fetchColleges.pending, (state) => {
        state.status = 'loading';
        state.loadingMap.fetching = true;
        state.error = null;
      })
      .addCase(fetchColleges.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loadingMap.fetching = false;
        // Backend returns: { message, count, total, colleges: [...], pagination: { skip, limit, totalPages } }
        const payload = action.payload || {};
        if (Array.isArray(payload)) {
          // Fallback: if payload is direct array
          state.items = payload;
        } else if (payload.colleges) {
          // Normal case: backend returns object with colleges array
          state.items = payload.colleges;
          state.count = payload.count ?? payload.colleges.length;
          state.total = payload.total ?? payload.colleges.length;
          if (payload.pagination) {
            state.skip = payload.pagination.skip ?? 0;
            state.limit = payload.pagination.limit ?? 100;
            state.totalPages = payload.pagination.totalPages ?? Math.ceil(state.total / state.limit);
          }
        } else {
          state.items = [];
        }
      })
      .addCase(fetchColleges.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMap.fetching = false;
        state.error = action.payload ?? action.error;
      });

    // fetchCollegeById
    builder
      .addCase(fetchCollegeById.pending, (state) => {
        state.status = 'loading';
        state.loadingMap.fetching = true;
        state.error = null;
      })
      .addCase(fetchCollegeById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loadingMap.fetching = false;
        state.current = action.payload ?? null;
        // upsert into list
        if (action.payload?.id) {
          const idx = state.items.findIndex((c) => c.id === action.payload.id);
          if (idx >= 0) state.items[idx] = action.payload;
          else state.items.unshift(action.payload);
        }
      })
      .addCase(fetchCollegeById.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMap.fetching = false;
        state.error = action.payload ?? action.error;
      });

    // createCollege
    builder
      .addCase(createCollege.pending, (state) => {
        state.loadingMap.creating = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createCollege.fulfilled, (state, action) => {
        state.loadingMap.creating = false;
        state.status = 'succeeded';
        const created = action.payload;
        if (created && created.id) {
          // avoid dupes
          const exists = state.items.find((c) => c.id === created.id);
          if (!exists) state.items.unshift(created);
          state.current = created;
        }
      })
      .addCase(createCollege.rejected, (state, action) => {
        state.loadingMap.creating = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // updateCollege
    builder
      .addCase(updateCollege.pending, (state) => {
        state.loadingMap.updating = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateCollege.fulfilled, (state, action) => {
        state.loadingMap.updating = false;
        state.status = 'succeeded';
        const updated = action.payload;
        if (updated && updated.id) {
          state.items = state.items.map((c) => (c.id === updated.id ? updated : c));
          if (state.current?.id === updated.id) state.current = updated;
        }
      })
      .addCase(updateCollege.rejected, (state, action) => {
        state.loadingMap.updating = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // deleteCollege
    builder
      .addCase(deleteCollege.pending, (state) => {
        state.loadingMap.deleting = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteCollege.fulfilled, (state, action) => {
        state.loadingMap.deleting = false;
        state.status = 'succeeded';
        const deletedId = action.payload;
        state.items = state.items.filter((c) => c.id !== deletedId);
        if (state.current?.id === deletedId) state.current = null;
      })
      .addCase(deleteCollege.rejected, (state, action) => {
        state.loadingMap.deleting = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });
  },
});

/* -------------------- Exports -------------------- */

export const {
  clearCollegesError,
  clearCurrentCollege,
  addCollegeLocal,
  removeCollegeLocal,
  setColleges,
} = collegesSlice.actions;

export const selectCollegesState = (state) => state.colleges;
export const selectColleges = (state) => state.colleges.items;
export const selectCollegesLoading = (state) => state.colleges.loadingMap;
export const selectCurrentCollege = (state) => state.colleges.current;
export const selectCollegesError = (state) => state.colleges.error;
export const selectCollegesPagination = (state) => ({
  total: state.colleges.total,
  count: state.colleges.count,
  skip: state.colleges.skip,
  limit: state.colleges.limit,
  totalPages: state.colleges.totalPages,
});

export default collegesSlice.reducer;
