// store config

import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/auth.slice";
import collegeReducer from "./slices/college.slice";
import clubReducer from "./slices/club.slice";
import eventReducer from "./slices/event.slice";
import registrationReducer from "./slices/registration.slice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    colleges: collegeReducer,
    clubs: clubReducer,
    events: eventReducer,
    registrations: registrationReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: ["auth/login/fulfilled", "auth/register/fulfilled"],
      },
    }),
});

export default store;

