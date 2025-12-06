// src/slices/registrationsSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../api';

/**
 * Thunks
 */

// Register the current user for an event
// payload example: { eventId: 123 }
export const registerForEvent = createAsyncThunk(
  'registrations/registerForEvent',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/registrations', payload);
      // API returns shape { registration, razorpayOrder } per controller
      return res.data || res;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Registration failed' });
    }
  }
);

// Fetch registrations for a specific event (organizer view)
export const fetchRegistrationsForEvent = createAsyncThunk(
  'registrations/fetchForEvent',
  async (eventId, { rejectWithValue }) => {
    try {
      const res = await api.get(`/registrations/event/${eventId}`);
      return res.data.registrations || res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Fetch registrations failed' });
    }
  }
);

// Check-in event using QR token (organizer/admin)
export const checkInEvent = createAsyncThunk(
  'registrations/checkIn',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/registrations/checkin', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Check-in failed' });
    }
  }
);

// Optional: fetch current user's registrations (student view)
// NOTE: Backend route not implemented yet - keeping for future use
// export const fetchMyRegistrations = createAsyncThunk(
//   'registrations/fetchMy',
//   async (_, { rejectWithValue }) => {
//     try {
//       const res = await api.get('/registrations/my');
//       return res.data.registrations || res.data;
//     } catch (err) {
//       return rejectWithValue(err?.response?.data || { error: 'Fetch my registrations failed' });
//     }
//   }
// );

/**
 * Slice
 */

const initialState = {
  items: [], // list of registrations (for event or user)
  current: null, // single registration detail if needed
  status: 'idle', // 'idle' | 'loading' | 'succeeded' | 'failed'
  registering: false,
  checkingIn: false, // loading state for check-in
  lastCreated: null, // last created registration object
  lastOrder: null, // razorpay order if returned
  lastCheckIn: null, // last check-in result
  error: null,
};

const registrationsSlice = createSlice({
  name: 'registrations',
  initialState,
  reducers: {
    clearRegistrationsError(state) {
      state.error = null;
    },
    clearLastCreated(state) {
      state.lastCreated = null;
      state.lastOrder = null;
    },
    // Optionally allow optimistic removal from UI (e.g. cancel)
    removeRegistrationLocal(state, action) {
      const id = action.payload;
      state.items = state.items.filter((r) => r.id !== id);
    },
  },
  extraReducers: (builder) => {
    // registerForEvent
    builder
      .addCase(registerForEvent.pending, (state) => {
        state.registering = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.registering = false;
        state.status = 'succeeded';
        // handle API shape: { registration, razorpayOrder } or a flat registration
        const payload = action.payload;
        const registration = payload.registration || payload;
        const razorpayOrder = payload.razorpayOrder ?? null;

        // keep lastCreated for UI to show success / redirect to payment
        state.lastCreated = registration;
        state.lastOrder = razorpayOrder;

        // insert into items if not already present
        if (registration && registration.id) {
          const exists = state.items.find((r) => r.id === registration.id);
          if (!exists) {
            state.items.unshift(registration);
          } else {
            // update existing item
            state.items = state.items.map((r) => (r.id === registration.id ? registration : r));
          }
        }
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.registering = false;
        state.status = 'failed';
        state.error = action.payload || action.error;
      });

    // fetchRegistrationsForEvent
    builder
      .addCase(fetchRegistrationsForEvent.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRegistrationsForEvent.fulfilled, (state, action) => {
        state.status = 'succeeded';
        // Backend returns: { message, count, registrations: [...] }
        const payload = action.payload || {};
        state.items = payload.registrations || payload.data || (Array.isArray(payload) ? payload : []);
      })
      .addCase(fetchRegistrationsForEvent.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload || action.error;
      });

    // checkInEvent
    builder
      .addCase(checkInEvent.pending, (state) => {
        state.checkingIn = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(checkInEvent.fulfilled, (state, action) => {
        state.checkingIn = false;
        state.status = 'succeeded';
        const payload = action.payload || {};
        state.lastCheckIn = payload;
        // Update registration in items if found
        if (payload.registrationId) {
          state.items = state.items.map((r) =>
            r.id === payload.registrationId ? { ...r, attended: true, scannedAt: new Date() } : r
          );
        }
      })
      .addCase(checkInEvent.rejected, (state, action) => {
        state.checkingIn = false;
        state.status = 'failed';
        state.error = action.payload || action.error;
      });
  },
});

/**
 * Exports
 */
export const { clearRegistrationsError, clearLastCreated, removeRegistrationLocal } = registrationsSlice.actions;

export const selectRegistrationsState = (state) => state.registrations;
export const selectRegistrations = (state) => state.registrations.items;
export const selectRegistrationById = (state, id) =>
  state.registrations.items.find((r) => r.id === id);
export const selectLastCreatedRegistration = (state) => state.registrations.lastCreated;
export const selectLastOrder = (state) => state.registrations.lastOrder;
export const selectRegistrationsError = (state) => state.registrations.error;
export const selectCheckingIn = (state) => state.registrations.checkingIn;
export const selectLastCheckIn = (state) => state.registrations.lastCheckIn;

export default registrationsSlice.reducer;
