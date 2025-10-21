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
      console.log("🚀 Starting login process...");
      dispatch(loginStart());

      const response = await authService.login(credentials);

      console.log(
        "✅ Login successful, processing user data in Redux store..."
      );
      console.log("👤 User data being stored:", response.user);

      // User data is now included in the login response
      dispatch(loginSuccess(response.user));

      console.log("✅ User data successfully stored in Redux store");

      // Don't handle navigation here - let the component handle it
      // This prevents page refresh and allows for better UX

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
      authService.logout().catch((error) => {
        console.warn("Logout API call failed:", error);
      });

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
      console.log("🚀 Starting auth initialization...");

      // Check if we have a token
      const hasToken = authService.isAuthenticated();
      console.log("🔑 Has token:", hasToken);

      if (!hasToken) {
        console.log("❌ No token found, returning null immediately");
        return null;
      }

      // Check if we already have user data in the store
      const state = getState() as any;
      const currentUser = state.auth.user;
      console.log("👤 Current user in store:", currentUser);

      if (currentUser) {
        // User data is already available, no need to fetch
        console.log("✅ User data already available in store");
        return currentUser;
      }

      // Try to get user from localStorage first (faster)
      const userFromStorage = authService.getUserFromStorage();
      console.log("💾 User from localStorage:", userFromStorage);

      if (userFromStorage) {
        console.log("✅ Using user data from localStorage");
        dispatch(loadUserSuccess(userFromStorage));
        return userFromStorage;
      }

      // Only try API if we have a token but no user data
      try {
        console.log("📡 Fetching user data from API...");
        const user = await authService.getUser();
        console.log("✅ User data fetched from API:", user);
        dispatch(loadUserSuccess(user));
        return user;
      } catch (error) {
        console.warn("⚠️ Failed to fetch user from API:", error);
        // If API call fails and no localStorage data, clear auth state
        console.log("🧹 No user data available, clearing auth state");
        dispatch(logoutSuccess());
        return null;
      }
    } catch (error: any) {
      console.error("❌ Auth initialization failed:", error);
      // If initialization fails, clear auth state
      dispatch(logoutSuccess());
      return rejectWithValue("Authentication failed");
    }
  }
);
