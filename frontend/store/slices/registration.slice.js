import { createSlice } from "@reduxjs/toolkit";
import {
  registerForEvent,
  getRegistrationById,
  cancelRegistration,
  checkInEvent,
} from "../api/registration.thunk";

const initialState = {
  registrations: [],
  selectedRegistration: null,
  loading: false,
  error: null,
};

const registrationSlice = createSlice({
  name: "registrations",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedRegistration: (state) => {
      state.selectedRegistration = null;
    },
  },
  extraReducers: (builder) => {
    // Register for Event
    builder
      .addCase(registerForEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerForEvent.fulfilled, (state, action) => {
        state.loading = false;
        state.registrations.push(action.payload);
        state.error = null;
      })
      .addCase(registerForEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Registration By ID
    builder
      .addCase(getRegistrationById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getRegistrationById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedRegistration = action.payload;
        state.error = null;
      })
      .addCase(getRegistrationById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Cancel Registration
    builder
      .addCase(cancelRegistration.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelRegistration.fulfilled, (state, action) => {
        state.loading = false;
        state.registrations = state.registrations.filter(
          (r) => r.id !== action.payload.id
        );
        if (state.selectedRegistration?.id === action.payload.id) {
          state.selectedRegistration = null;
        }
        state.error = null;
      })
      .addCase(cancelRegistration.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Check-in Event
    builder
      .addCase(checkInEvent.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkInEvent.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.registrations.findIndex(
          (r) => r.id === action.payload.id
        );
        if (index !== -1) {
          state.registrations[index] = action.payload;
        }
        if (state.selectedRegistration?.id === action.payload.id) {
          state.selectedRegistration = action.payload;
        }
        state.error = null;
      })
      .addCase(checkInEvent.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedRegistration } =
  registrationSlice.actions;
export default registrationSlice.reducer;
