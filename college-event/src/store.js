import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import collegesReducer from './slices/collegesSlice';
import clubsReducer from './slices/clubsSlice';
import eventsReducer from './slices/eventsSlice';
import registrationsReducer from './slices/registrationsSlice';

const dev = process.env.NODE_ENV !== 'production';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    colleges: collegesReducer,
    clubs: clubsReducer,
    events: eventsReducer,
    registrations: registrationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }),
  devTools: dev,
});

export default store;