import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { UserWithPermissions } from "@/types/permission";

interface AuthState {
  isAuthenticated: boolean;
  user: UserWithPermissions | null;
  isLoading: boolean;
  error: string | null;
  isLoggingIn: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  isLoading: true,
  error: null,
  isLoggingIn: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login actions
    loginStart(state) {
      state.isLoggingIn = true;
      state.error = null;
    },
    loginSuccess(state, action: PayloadAction<UserWithPermissions>) {
      state.isAuthenticated = true;
      state.user = action.payload;
      state.isLoggingIn = false;
      state.error = null;
      state.isLoading = false;
      // Store user in localStorage
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
    loginFailure(state, action: PayloadAction<string>) {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoggingIn = false;
      state.error = action.payload;
      state.isLoading = false;
    },

    // Logout actions
    logoutStart(state) {
      state.isLoading = true;
    },
    logoutSuccess(state) {
      state.isAuthenticated = false;
      state.user = null;
      state.isLoading = false;
      state.error = null;
      // Clear localStorage items
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        localStorage.removeItem("auth-token");
      }
    },
    logoutFailure(state, action: PayloadAction<string>) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // User loading actions
    loadUserStart(state) {
      state.isLoading = true;
      state.error = null;
    },
    loadUserSuccess(state, action: PayloadAction<UserWithPermissions>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.isLoading = false;
      state.error = null;
    },
    loadUserFailure(state, action: PayloadAction<string>) {
      state.user = null;
      state.isAuthenticated = false;
      state.isLoading = false;
      state.error = action.payload;
    },

    // Utility actions
    clearError(state) {
      state.error = null;
    },
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    loadUserFromStorage(state) {
      if (typeof window !== "undefined") {
        const userData = localStorage.getItem("user");
        const token = localStorage.getItem("auth-token");

        if (userData && token) {
          try {
            state.user = JSON.parse(userData);
            state.isAuthenticated = true;
            state.isLoading = false;
          } catch (error) {
            // Invalid JSON in localStorage, clear it
            localStorage.removeItem("user");
            localStorage.removeItem("auth-token");
            state.user = null;
            state.isAuthenticated = false;
            state.isLoading = false;
          }
        } else {
          state.isLoading = false;
        }
      } else {
        state.isLoading = false;
      }
    },
    setUser(state, action: PayloadAction<UserWithPermissions>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(action.payload));
      }
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  logoutStart,
  logoutSuccess,
  logoutFailure,
  loadUserStart,
  loadUserSuccess,
  loadUserFailure,
  clearError,
  setLoading,
  loadUserFromStorage,
  setUser,
} = authSlice.actions;

export default authSlice.reducer;
