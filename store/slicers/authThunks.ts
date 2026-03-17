import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
} from "./authSlice";
import { authService, LoginCredentials } from "@/services/auth-service";

// Login thunk
export const loginUser = createAsyncThunk(
  "auth/login",
  async (credentials: LoginCredentials, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loginStart());
      const response = await authService.login(credentials);
      dispatch(loginSuccess(response.user));
      return response;
    } catch (error: any) {
      console.error("❌ Login failed:", error);
      const errorMessage = error.message || "Login failed";
      dispatch(loginFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Logout thunk
export const logoutUser = createAsyncThunk(
  "auth/logout",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(logoutStart());

      // Clear local data immediately for faster logout
      dispatch(logoutSuccess());

      // Clear all authentication data
      authService.clearAuthData();

      // Handle API call in the background (don't wait for it)
      authService.logout().catch(() => {});

      return true;
    } catch (error: any) {
      const errorMessage = error.message || "Logout failed";
      dispatch(logoutFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Load user thunk
export const loadUser = createAsyncThunk(
  "auth/loadUser",
  async (_, { dispatch, rejectWithValue }) => {
    try {
      dispatch(loadUserStart());

      const user = await authService.getUser();

      dispatch(loadUserSuccess(user));

      return user;
    } catch (error: any) {
      const errorMessage = error.message || "Failed to load user";
      dispatch(loadUserFailure(errorMessage));
      return rejectWithValue(errorMessage);
    }
  }
);

// Refresh token thunk
export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.refreshToken();
      return response;
    } catch (error: any) {
      const errorMessage = error.message || "Token refresh failed";
      return rejectWithValue(errorMessage);
    }
  }
);

// Initialize auth state thunk
export const initializeAuth = createAsyncThunk(
  "auth/initialize",
  async (_, { dispatch, rejectWithValue, getState }) => {
    try {
      const hasToken = authService.isAuthenticated();
      if (!hasToken) return null;

      const state = getState() as any;
      const currentUser = state.auth.user;
      if (currentUser) return currentUser;

      const userFromStorage = authService.getUserFromStorage();
      if (userFromStorage) {
        dispatch(loadUserSuccess(userFromStorage));
        return userFromStorage;
      }

      try {
        const user = await authService.getUser();
        dispatch(loadUserSuccess(user));
        return user;
      } catch {
        dispatch(logoutSuccess());
        return null;
      }
    } catch (error: any) {
      // If initialization fails, clear auth state
      dispatch(logoutSuccess());
      return rejectWithValue("Authentication failed");
    }
  }
);
