import { createSlice } from "@reduxjs/toolkit";
import {
  getAllClubs,
  getClubById,
  getMyClubs,
  getMyMemberships,
  createClub,
  updateClub,
  deleteClub,
  joinClub,
  getMembershipRequests,
  updateMembershipStatus,
} from "../api/club.thunk";

const initialState = {
  clubs: [],
  myClubs: [],
  myMemberships: [],
  membershipRequests: [],
  selectedClub: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  loading: false,
  error: null,
};

const clubSlice = createSlice({
  name: "clubs",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSelectedClub: (state) => {
      state.selectedClub = null;
    },
  },
  extraReducers: (builder) => {
    // Get All Clubs
    builder
      .addCase(getAllClubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllClubs.fulfilled, (state, action) => {
        state.loading = false;
        state.clubs = action.payload.data;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(getAllClubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Club By ID
    builder
      .addCase(getClubById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getClubById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedClub = action.payload;
        state.error = null;
      })
      .addCase(getClubById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get My Clubs
    builder
      .addCase(getMyClubs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyClubs.fulfilled, (state, action) => {
        state.loading = false;
        state.myClubs = action.payload;
        state.error = null;
      })
      .addCase(getMyClubs.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get My Memberships
    builder
      .addCase(getMyMemberships.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyMemberships.fulfilled, (state, action) => {
        state.loading = false;
        state.myMemberships = action.payload;
        state.error = null;
      })
      .addCase(getMyMemberships.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Create Club
    builder
      .addCase(createClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createClub.fulfilled, (state, action) => {
        state.loading = false;
        state.clubs.push(action.payload);
        state.myClubs.push(action.payload);
        state.error = null;
      })
      .addCase(createClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Club
    builder
      .addCase(updateClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateClub.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.clubs.findIndex((c) => c.id === action.payload.id);
        if (index !== -1) {
          state.clubs[index] = action.payload;
        }
        const myIndex = state.myClubs.findIndex((c) => c.id === action.payload.id);
        if (myIndex !== -1) {
          state.myClubs[myIndex] = action.payload;
        }
        if (state.selectedClub?.id === action.payload.id) {
          state.selectedClub = action.payload;
        }
        state.error = null;
      })
      .addCase(updateClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Delete Club
    builder
      .addCase(deleteClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteClub.fulfilled, (state, action) => {
        state.loading = false;
        state.clubs = state.clubs.filter((c) => c.id !== action.payload);
        state.myClubs = state.myClubs.filter((c) => c.id !== action.payload);
        if (state.selectedClub?.id === action.payload) {
          state.selectedClub = null;
        }
        state.error = null;
      })
      .addCase(deleteClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Join Club
    builder
      .addCase(joinClub.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinClub.fulfilled, (state, action) => {
        state.loading = false;
        state.myMemberships.push(action.payload);
        state.error = null;
      })
      .addCase(joinClub.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Get Membership Requests
    builder
      .addCase(getMembershipRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMembershipRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.membershipRequests = action.payload;
        state.error = null;
      })
      .addCase(getMembershipRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });

    // Update Membership Status
    builder
      .addCase(updateMembershipStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMembershipStatus.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.membershipRequests.findIndex(
          (m) => m.id === action.payload.id
        );
        if (index !== -1) {
          state.membershipRequests[index] = action.payload;
        }
        state.error = null;
      })
      .addCase(updateMembershipStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSelectedClub } = clubSlice.actions;
export default clubSlice.reducer;
