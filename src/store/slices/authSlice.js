/**
 * @file authSlice.js
 * @description Redux slice for authentication state.
 *
 * All HTTP calls are delegated to authService.
 * This file contains ONLY Redux state logic — no raw axios calls.
 */

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService.js';

// ─── Async Thunks ─────────────────────────────────────────────────────────────

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      const data = response?.data || response;
      if (data?.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Login failed';
      return rejectWithValue(msg);
    }
  }
);

export const signupUser = createAsyncThunk(
  'auth/signupUser',
  async (signupData, { rejectWithValue }) => {
    try {
      const response = await authService.signup(signupData);
      const data = response?.data || response;
      if (data?.accessToken) {
        localStorage.setItem('token', data.accessToken);
      }
      if (data?.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }
      return data;
    } catch (error) {
      const msg = error?.response?.data?.message || error?.message || 'Registration failed';
      return rejectWithValue(msg);
    }
  }
);

export const logoutUser = createAsyncThunk(
  'auth/logoutUser',
  async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore server errors on logout — we clear local state regardless
    }
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return true;
  }
);

export const fetchMe = createAsyncThunk(
  'auth/fetchMe',
  async (_, { rejectWithValue, getState }) => {
    try {
      const data = await authService.me();
      // authService.me() returns response.data directly after refactor
      const user = data?.user || data?.data?.user || data;
      if (user && user.id) {
        localStorage.setItem('user', JSON.stringify(user));
        return user;
      }
      // If no valid user object, return existing user from state without kicking out
      const existingUser = getState().auth.user;
      return existingUser;
    } catch (error) {
      // Do NOT clear token/user on network errors – keep user logged in
      // Only clear if it's a 401 (token truly invalid)
      if (error?.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        return rejectWithValue('Session expired. Please login again.');
      }
      // For any other error (network down, server error), keep existing session
      const existingUser = getState().auth.user;
      return existingUser;
    }
  }
);

// ─── Initial State ────────────────────────────────────────────────────────────

const rawToken = localStorage.getItem('token');
const initialToken = (rawToken && rawToken !== 'undefined' && rawToken !== 'null') ? rawToken : null;

const rawUser = localStorage.getItem('user');
let initialUser = null;
if (rawUser && rawUser !== 'undefined' && rawUser !== 'null') {
  try {
    initialUser = JSON.parse(rawUser);
  } catch (e) {
    initialUser = null;
  }
}

// ─── Slice ────────────────────────────────────────────────────────────────────

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user:            initialUser,
    token:           initialToken,
    loading:         false,
    error:           null,
    isAuthenticated: !!initialToken,
  },
  reducers: {
    clearError: (state) => { state.error = null; },
  },
  extraReducers: (builder) => {
    builder
      // ── Login ──────────────────────────────────────────────────────────────
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(loginUser.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload.user;
        state.token           = payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, { payload }) => {
        state.loading         = false;
        state.error           = payload;
        state.isAuthenticated = false;
      })

      // ── Signup ─────────────────────────────────────────────────────────────
      .addCase(signupUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(signupUser.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload.user;
        state.token           = payload.accessToken;
        state.isAuthenticated = true;
      })
      .addCase(signupUser.rejected, (state, { payload }) => {
        state.loading         = false;
        state.error           = payload;
        state.isAuthenticated = false;
      })

      // ── Logout ─────────────────────────────────────────────────────────────
      .addCase(logoutUser.fulfilled, (state) => {
        state.user            = null;
        state.token           = null;
        state.isAuthenticated = false;
        state.error           = null;
      })

      // ── Fetch Me ───────────────────────────────────────────────────────────
      .addCase(fetchMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMe.fulfilled, (state, { payload }) => {
        state.loading         = false;
        state.user            = payload;
        state.isAuthenticated = true;
      })
      .addCase(fetchMe.rejected, (state, { payload }) => {
        state.loading = false;
        // Only clear session if explicitly told session is expired (401)
        if (payload && typeof payload === 'string' && payload.includes('expired')) {
          state.user            = null;
          state.token           = null;
          state.isAuthenticated = false;
        }
        // Otherwise keep existing session — don't kick the user out on network errors
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
