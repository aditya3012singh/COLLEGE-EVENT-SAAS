// Selectors for accessing store state

// Auth selectors
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectAuthToken = (state) => state.auth.token;
export const selectAuthLoading = (state) => state.auth.loading;
export const selectAuthError = (state) => state.auth.error;

// College selectors
export const selectColleges = (state) => state.colleges;
export const selectAllColleges = (state) => state.colleges.colleges;
export const selectSelectedCollege = (state) => state.colleges.selectedCollege;
export const selectCollegePagination = (state) => state.colleges.pagination;
export const selectCollegeLoading = (state) => state.colleges.loading;
export const selectCollegeError = (state) => state.colleges.error;

// Club selectors
export const selectClubs = (state) => state.clubs;
export const selectAllClubs = (state) => state.clubs.clubs;
export const selectMyClubs = (state) => state.clubs.myClubs;
export const selectMyMemberships = (state) => state.clubs.myMemberships;
export const selectMembershipRequests = (state) => state.clubs.membershipRequests;
export const selectSelectedClub = (state) => state.clubs.selectedClub;
export const selectClubPagination = (state) => state.clubs.pagination;
export const selectClubLoading = (state) => state.clubs.loading;
export const selectClubError = (state) => state.clubs.error;

// Event selectors
export const selectEvents = (state) => state.events;
export const selectAllEvents = (state) => state.events.events;
export const selectSelectedEvent = (state) => state.events.selectedEvent;
export const selectEventPagination = (state) => state.events.pagination;
export const selectEventLoading = (state) => state.events.loading;
export const selectEventError = (state) => state.events.error;

// Registration selectors
export const selectRegistrations = (state) => state.registrations;
export const selectAllRegistrations = (state) => state.registrations.registrations;
export const selectSelectedRegistration = (state) => state.registrations.selectedRegistration;
export const selectRegistrationLoading = (state) => state.registrations.loading;
export const selectRegistrationError = (state) => state.registrations.error;

// Memoized selectors (derived state)
export const selectUserRole = (state) => state.auth.user?.role;
export const selectUserCollegeId = (state) => state.auth.user?.collegeId;
export const selectIsAdmin = (state) => state.auth.user?.role === "ADMIN";
export const selectIsOrganizer = (state) => 
  state.auth.user?.role === "ORGANIZER" || state.auth.user?.role === "ADMIN";
export const selectIsStudent = (state) => state.auth.user?.role === "STUDENT";
