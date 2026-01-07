import { createSlice } from "@reduxjs/toolkit";
import {
  getAllColleges,
  getCollegeById,
  createCollege,
  updateCollege,
  deleteCollege,
} from "../api/college.thunk";

const initialState = {
  colleges: [],
  selectedCollege: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const collegeSlice = createSlice({
  name: "colleges",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedCollege: (state) => {
      state.selectedCollege = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Colleges
    builder
      .addCase(getAllColleges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllColleges.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAllColleges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get College By ID
    builder
      .addCase(getCollegeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getCollegeById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedCollege = action.payload;
        state.error = null;
      })
      .addCase(getCollegeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create College
    builder
      .addCase(createCollege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCollege.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges.push(action.payload);
        state.error = null;
      })
      .addCase(createCollege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update College
    builder
      .addCase(updateCollege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateCollege.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.colleges.findIndex(
          (c) => c.id === action.payload.id
        );
        if (index !== -1) {
          state.colleges[index] = action.payload;
        }
        if (state.selectedCollege?.id === action.payload.id) {
          state.selectedCollege = action.payload;
        }
        state.error = null;
      })
      .addCase(updateCollege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete College
    builder
      .addCase(deleteCollege.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteCollege.fulfilled, (state, action) => {
        state.loading = false;
        state.colleges = state.colleges.filter((c) => c.id !== action.payload);
        if (state.selectedCollege?.id === action.payload) {
          state.selectedCollege = null;
        }
        state.error = null;
      })
      .addCase(deleteCollege.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedCollege } = collegeSlice.actions;
export default collegeSlice.reducer;
