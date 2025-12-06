// src/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api, { setAuthToken } from '../api';

/* -------------------- Async thunks -------------------- */

// Register user
export const register = createAsyncThunk(
  'auth/register',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/register', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Registration failed' });
    }
  }
);

// Login user
export const login = createAsyncThunk(
  'auth/login',
  async (payload, { rejectWithValue }) => {
    try {
      const res = await api.post('/auth/login', payload);
      return res.data;
    } catch (err) {
      return rejectWithValue(err?.response?.data || { error: 'Login failed' });
    }
  }
);

// Verify token (used for auto-login / token validation)
export const verify = createAsyncThunk('auth/verify', async (_, { rejectWithValue }) => {
  try {
    const res = await api.get('/auth/verify');
    return res.data;
  } catch (err) {
    return rejectWithValue(err?.response?.data || { error: 'Verify failed' });
  }
});

/**
 * bootstrapAuth
 * - Try to load token from localStorage and set axios header.
 * - Optionally call /auth/verify to validate token (this thunk only sets token locally).
 * Use this at app startup to restore session.
 */
export const bootstrapAuth = createAsyncThunk('auth/bootstrap', async (_, { dispatch }) => {
  const token = localStorage.getItem('token');
  if (token) {
    setAuthToken(token);
    // Optionally verify immediately:
    try {
      await dispatch(verify()).unwrap();
      return { token };
    } catch {
      // verification failed — fall through and return null so UI can prompt login
      setAuthToken(null);
      localStorage.removeItem('token');
      return { token: null };
    }
  }
  return { token: null };
});

/* -------------------- Initial state -------------------- */

const initialState = {
  user: null,
  token: null,
  status: 'idle', // idle | loading | succeeded | failed
  registering: false,
  loggingIn: false,
  verifying: false,
  error: null,
};

/* -------------------- Slice -------------------- */

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    // Clears auth completely (logout)
    logout(state) {
      state.user = null;
      state.token = null;
      state.error = null;
      state.status = 'idle';
      setAuthToken(null);
      try {
        localStorage.removeItem('token');
      } catch (e) {
        // ignore
      }
    },
    // Directly set token (and persist) — useful if you obtain token outside thunks
    setToken(state, action) {
      state.token = action.payload;
      setAuthToken(action.payload);
      try {
        if (action.payload) localStorage.setItem('token', action.payload);
        else localStorage.removeItem('token');
      } catch (e) {
        // ignore storage errors
      }
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // register
    builder
      .addCase(register.pending, (state) => {
        state.registering = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.registering = false;
        state.status = 'succeeded';
        const payload = action.payload || {};
        state.token = payload.token ?? state.token;
        state.user = payload.user ?? state.user;
        if (payload.token) {
          setAuthToken(payload.token);
          try {
            localStorage.setItem('token', payload.token);
          } catch (e) {
            // ignore
          }
        }
      })
      .addCase(register.rejected, (state, action) => {
        state.registering = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // login
    builder
      .addCase(login.pending, (state) => {
        state.loggingIn = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loggingIn = false;
        state.status = 'succeeded';
        const payload = action.payload || {};
        state.token = payload.token ?? state.token;
        state.user = payload.user ?? state.user;
        if (payload.token) {
          setAuthToken(payload.token);
          try {
            localStorage.setItem('token', payload.token);
          } catch (e) {
            // ignore
          }
        }
      })
      .addCase(login.rejected, (state, action) => {
        state.loggingIn = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
      });

    // verify
    builder
      .addCase(verify.pending, (state) => {
        state.verifying = true;
        state.status = 'loading';
        state.error = null;
      })
      .addCase(verify.fulfilled, (state, action) => {
        state.verifying = false;
        state.status = 'succeeded';
        // expected payload: { valid: true, user: { ... } }
        const payload = action.payload || {};
        if (payload.user) state.user = payload.user;
      })
      .addCase(verify.rejected, (state, action) => {
        state.verifying = false;
        state.status = 'failed';
        state.error = action.payload ?? action.error;
        // on verify failure remove local token to avoid repeated failures
        state.token = null;
        try {
          localStorage.removeItem('token');
        } catch (e) {
          // ignore
        }
        setAuthToken(null);
      });

    // bootstrapAuth just sets token locally via its fulfilled handler (if used)
    builder.addCase(bootstrapAuth.fulfilled, (state, action) => {
      const token = action.payload?.token ?? null;
      state.token = token;
    });
  },
});

/* -------------------- Exports -------------------- */

export const { logout, setToken, clearAuthError } = authSlice.actions;

/* Selectors */
export const selectAuth = (state) => state.auth;
export const selectUser = (state) => state.auth.user;
export const selectToken = (state) => state.auth.token;
export const selectAuthStatus = (state) => ({
  status: state.auth.status,
  registering: state.auth.registering,
  loggingIn: state.auth.loggingIn,
  verifying: state.auth.verifying,
});
export const selectAuthError = (state) => state.auth.error;

export default authSlice.reducer;
