// src/slices/eventsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

/* -------------------- Thunks -------------------- */

// Fetch paginated events: returns API response (must include events[] and pagination)
export const fetchEvents = createAsyncThunk(
  'events/fetch',
  async ({ page = 1, limit = 10, search = '', visibility } = {}, { rejectWithValue }) => {
    try {
      const res = await api.get('/events', { params: { page, limit, search, visibility } });
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch events failed' });
    }
  }
);

// Fetch single event by id
export const fetchEventById = createAsyncThunk(
  'events/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.get(`/events/${id}`);
      return res.data.event || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch event failed' });
    }
  }
);

// Create a new event (organizer/admin)
// payload: { title, description, dateTime, venue, clubId, visibility, allowedColleges, isPaid, price, currency }
export const createEvent = createAsyncThunk(
  'events/create',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/events', payload);
      return res.data.event || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Create event failed' });
    }
  }
);

// Update event
// payload: { id, ...fields }
export const updateEvent = createAsyncThunk(
  'events/update',
  async ({ id, ...data }, { rejectWithValue }) => {
    try {
      const res = await api.put(`/events/${id}`, data);
      return res.data.event || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Update event failed' });
    }
  }
);

// Delete event
export const deleteEvent = createAsyncThunk(
  'events/delete',
  async (id, { rejectWithValue }) => {
    try {
      const res = await api.delete(`/events/${id}`);
      // expect { deletedEventId } or success
      return res.data.deletedEventId ?? id;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Delete event failed' });
    }
  }
);

/* -------------------- Slice -------------------- */

const initialState = {
  items: [], // list of event objects
  current: null, // detailed event object
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 0,
  status: 'idle', // general status: 'idle' | 'loading' | 'succeeded' | 'failed'
  loadingMap: {
    fetching: false,
    creating: false,
    updating: false,
    deleting: false,
  },
  error: null,
};

const eventsSlice = createSlice({
  name: 'events',
  initialState,
  reducers: {
    clearEventsError(state) {
      state.error = null;
    },
    setCurrentEvent(state, action) {
      state.current = action.payload;
    },
    clearCurrentEvent(state) {
      state.current = null;
    },
    // local optimistic update if you want to update an event in-place without refetch
    applyLocalEventUpdate(state, action) {
      const updated = action.payload;
      state.items = state.items.map((e) => (e.id === updated.id ? { ...e, ...updated } : e));
      if (state.current && state.current.id === updated.id) {
        state.current = { ...state.current, ...updated };
      }
    },
  },
  extraReducers: (builder) => {
    // fetchEvents
    builder
      .addCase(fetchEvents.pending, (state) => {
        state.status = 'loading';
        state.loadingMap.fetching = true;
        state.error = null;
      })
      .addCase(fetchEvents.fulfilled, (state, action) => {
        const payload = action.payload || {};
        // payload expected shape: { events: [...], pagination: { total, page, limit, totalPages } }
        state.status = 'succeeded';
        state.loadingMap.fetching = false;

        const events = payload.events ?? payload.data ?? [];
        state.items = Array.isArray(events) ? events : [];

        const pagination = payload.pagination ?? payload.meta ?? {};
        state.page = pagination.page ?? state.page;
        state.limit = pagination.limit ?? state.limit;
        state.total = pagination.total ?? (Array.isArray(events) ? events.length : state.total);
        state.totalPages = pagination.totalPages ?? Math.ceil(state.total / state.limit);
      })
      .addCase(fetchEvents.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMap.fetching = false;
        state.error = action.payload || action.error;
      });

    // fetchEventById
    builder
      .addCase(fetchEventById.pending, (state) => {
        state.status = 'loading';
        state.loadingMap.fetching = true;
        state.error = null;
      })
      .addCase(fetchEventById.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.loadingMap.fetching = false;
        state.current = action.payload || null;

        // Optionally upsert into items list
        if (action.payload && action.payload.id) {
          const idx = state.items.findIndex((e) => e.id === action.payload.id);
          if (idx >= 0) state.items[idx] = action.payload;
          else state.items.unshift(action.payload);
        }
      })
      .addCase(fetchEventById.rejected, (state, action) => {
        state.status = 'failed';
        state.loadingMap.fetching = false;
        state.error = action.payload || action.error;
      });

    // createEvent
    builder
      .addCase(createEvent.pending, (state) => {
        state.loadingMap.creating = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(createEvent.fulfilled, (state, action) => {
        state.loadingMap.creating = false;
        state.status = 'succeeded';
        const created = action.payload;
        if (created) {
          // add to front so recent events show up first
          state.items.unshift(created);
          state.lastCreated = created;
          state.total = state.total + 1;
        }
      })
      .addCase(createEvent.rejected, (state, action) => {
        state.loadingMap.creating = false;
        state.status = 'failed';
        state.error = action.payload || action.error;
      });

    // updateEvent
    builder
      .addCase(updateEvent.pending, (state) => {
        state.loadingMap.updating = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(updateEvent.fulfilled, (state, action) => {
        state.loadingMap.updating = false;
        state.status = 'succeeded';
        const updated = action.payload;
        if (updated && updated.id) {
          state.items = state.items.map((e) => (e.id === updated.id ? updated : e));
          if (state.current && state.current.id === updated.id) state.current = updated;
        }
      })
      .addCase(updateEvent.rejected, (state, action) => {
        state.loadingMap.updating = false;
        state.status = 'failed';
        state.error = action.payload || action.error;
      });

    // deleteEvent
    builder
      .addCase(deleteEvent.pending, (state) => {
        state.loadingMap.deleting = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(deleteEvent.fulfilled, (state, action) => {
        state.loadingMap.deleting = false;
        state.status = 'succeeded';
        const deletedId = action.payload;
        state.items = state.items.filter((e) => e.id !== deletedId);
        if (state.current && state.current.id === deletedId) state.current = null;
        state.total = Math.max(0, state.total - 1);
      })
      .addCase(deleteEvent.rejected, (state, action) => {
        state.loadingMap.deleting = false;
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  },
});

/* -------------------- Exports -------------------- */

export const { clearEventsError, setCurrentEvent, clearCurrentEvent, applyLocalEventUpdate } = eventsSlice.actions;

// Selectors
export const selectEventsState = (state) => state.events;
export const selectEvents = (state) => state.events.items;
export const selectEventsMeta = (state) => ({
  page: state.events.page,
  limit: state.events.limit,
  total: state.events.total,
  totalPages: state.events.totalPages,
});
export const selectEventById = (state, id) => state.events.items.find((e) => e.id === id) ?? null;
export const selectCurrentEvent = (state) => state.events.current;
export const selectEventsLoading = (state) => state.events.loadingMap;
export const selectEventsError = (state) => state.events.error;

export default eventsSlice.reducer;
