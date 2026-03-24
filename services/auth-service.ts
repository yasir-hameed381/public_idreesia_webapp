import axios from "axios";
import { UserWithPermissions } from "@/types/permission";

// Types - Updated to expect user object in login response
export interface LoginCredentials {
  email: string;
  password: string;
  remember: boolean;
}

export interface User {
  id: number | string;
  name: string;
  email: string;
  phone_number?: string;
  avatar?: string;
  has_committee_portal_access?: boolean;
  is_super_admin: boolean;
  is_mehfil_admin: boolean;
  is_zone_admin: boolean;
  role?: {
    id: number;
    name: string;
    guard_name: string;
    permissions: Array<{
      id: number;
      name: string;
      guard_name: string;
    }>;
  } | null;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: UserWithPermissions;
  accessToken?: string;
  refreshToken?: string;
}

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  phone_number?: string;
}

export interface UpdatePasswordPayload {
  current_password: string;
  password: string;
  password_confirmation: string;
}

// Rate limiting storage
const rateLimitStorage = new Map<
  string,
  { attempts: number; lastAttempt: number; blockedUntil?: number }
>();

// API base configuration - UPDATE THIS TO YOUR NODE.JS API URL
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

const authApi = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add auth token
authApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("auth-token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle auth errors
authApi.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear auth data and redirect to login
      localStorage.removeItem("auth-token");
      localStorage.removeItem("user");
      document.cookie =
        "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Rate limiting functions
const getThrottleKey = (email: string): string => {
  return `${email.toLowerCase()}|${window.location.hostname}`;
};

const isRateLimited = (
  email: string
): { limited: boolean; secondsRemaining?: number } => {
  const key = getThrottleKey(email);
  const record = rateLimitStorage.get(key);

  if (!record) return { limited: false };

  // Check if still blocked
  if (record.blockedUntil && Date.now() < record.blockedUntil) {
    const secondsRemaining = Math.ceil(
      (record.blockedUntil - Date.now()) / 1000
    );
    return { limited: true, secondsRemaining };
  }

  // Reset if block period is over
  if (record.blockedUntil && Date.now() >= record.blockedUntil) {
    rateLimitStorage.delete(key);
    return { limited: false };
  }

  return { limited: false };
};

const hitRateLimit = (email: string): void => {
  const key = getThrottleKey(email);
  const record = rateLimitStorage.get(key) || { attempts: 0, lastAttempt: 0 };

  record.attempts += 1;
  record.lastAttempt = Date.now();

  // Block for 5 minutes after 5 failed attempts
  if (record.attempts >= 5) {
    record.blockedUntil = Date.now() + 5 * 60 * 1000; // 5 minutes
  }

  rateLimitStorage.set(key, record);
};

const clearRateLimit = (email: string): void => {
  const key = getThrottleKey(email);
  rateLimitStorage.delete(key);
};

// Helper function to determine if user is admin
const isUserAdmin = (user: User): boolean => {
  const hasAdminFlags =
    user.is_super_admin || user.is_mehfil_admin || user.is_zone_admin;
  const hasRole = !!user.role;
  return hasAdminFlags || hasRole;
};

// Authentication service
export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const { email, password, remember } = credentials;

    // Validate input
    if (!email || typeof email !== 'string' || email.trim() === '') {
      throw new Error("Email is required");
    }

    if (!password || typeof password !== 'string' || password.trim() === '') {
      throw new Error("Password is required");
    }

    // Normalize email (trim and lowercase)
    const normalizedEmail = email.trim().toLowerCase();

    // Check rate limiting
    const rateLimitCheck = isRateLimited(normalizedEmail);
    if (rateLimitCheck.limited) {
      throw new Error(
        `Too many login attempts. Please try again in ${rateLimitCheck.secondsRemaining} seconds.`
      );
    }

    try {
      const response = await authApi.post("/auth/login", {
        email: normalizedEmail,
        password: password.trim(),
      });

      const { message, token, accessToken, refreshToken, user } = response.data;

      // Use the appropriate token field
      const authToken = token || accessToken;

      if (!authToken) {
        throw new Error("No authentication token received");
      }

      if (!user) {
        throw new Error("No user data received");
      }

      // Clear rate limit on successful login
      clearRateLimit(normalizedEmail);

      // Store token and user data
      localStorage.setItem("auth-token", authToken);
      localStorage.setItem("user", JSON.stringify(user));

      // Store refresh token if provided
      if (refreshToken) {
        localStorage.setItem("refresh-token", refreshToken);
      }

      // Set cookie for remember me functionality
      if (remember) {
        const maxAge = 60 * 60 * 24 * 30; // 30 days
        document.cookie = `auth-token=${authToken}; path=/; max-age=${maxAge}`;
      } else {
        const maxAge = 60 * 60 * 24; // 1 day
        document.cookie = `auth-token=${authToken}; path=/; max-age=${maxAge}`;
      }

      return { message, user, token: authToken, refreshToken };
    } catch (error: any) {
      // Handle rate limiting from server
      if (error.response?.status === 429) {
        const retryAfter = error.response.headers["retry-after"] || 300;
        throw new Error(
          `Too many login attempts. Please try again in ${retryAfter} seconds.`
        );
      }

      // Handle validation errors (422)
      if (error.response?.status === 422) {
        const errors = error.response.data.errors;
        if (errors?.email) {
          throw new Error(errors.email[0]);
        }
        // For any other validation errors, use generic auth error
        hitRateLimit(normalizedEmail);
        throw new Error("Invalid email or password");
      }

      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.message || "Invalid email or password";
        hitRateLimit(normalizedEmail);
        throw new Error(errorMessage);
      }

      // Handle authentication failure (401) and any other auth-related errors
      if (error.response?.status === 401 || error.response?.status === 404) {
        hitRateLimit(normalizedEmail);
        throw new Error("Invalid email or password");
      }

      if (!error.response) {
        throw new Error("Network error. Please check your connection and try again.");
      }

      // Handle other errors
      throw new Error(
        error.response?.data?.message || "Invalid email or password"
      );
    }
  },

  async logout(): Promise<void> {
    // Clear local storage and cookies immediately
    this.clearAuthData();

    try {
      await authApi.post("/auth/logout");
    } catch {
      // Continue with logout even if API call fails
    }
  },

  async getUser(): Promise<UserWithPermissions> {
    const response = await authApi.get("/auth/user");
    return response.data.user;
  },

  async updateProfile(payload: UpdateProfilePayload): Promise<UserWithPermissions> {
    const response = await authApi.put("/auth/profile", payload);
    return response.data.user;
  },

  async updatePassword(payload: UpdatePasswordPayload): Promise<{ message: string }> {
    const response = await authApi.put("/auth/password", payload);
    return { message: response.data.message || "Password updated successfully." };
  },

  async refreshToken(): Promise<{ token: string }> {
    const refreshToken = localStorage.getItem("refresh-token");
    if (!refreshToken) {
      throw new Error("No refresh token available");
    }

    const response = await authApi.post("/auth/refresh", {
      refreshToken,
    });

    const { token, accessToken } = response.data;
    const newToken = token || accessToken;

    // Update stored token
    localStorage.setItem("auth-token", newToken);
    document.cookie = `auth-token=${newToken}; path=/; max-age=${
      60 * 60 * 24 * 7
    }`;

    return { token: newToken };
  },

  // Clear all authentication data
  clearAuthData(): void {
    if (typeof window !== "undefined") {
      // Clear localStorage auth items
      localStorage.removeItem("auth-token");
      localStorage.removeItem("refresh-token");
      localStorage.removeItem("user");

      // Clear cookies
      document.cookie =
        "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie =
        "refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";

      // Clear sessionStorage auth items
      sessionStorage.removeItem("auth-token");
      sessionStorage.removeItem("refresh-token");
      sessionStorage.removeItem("user");
    }
  },

  // Check if user is authenticated (has valid token)
  isAuthenticated(): boolean {
    if (typeof window === "undefined") return false;

    const token = localStorage.getItem("auth-token");
    if (!token) return false;

    // Quick token validation (check if it exists and has basic structure)
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return false;

      // Decode payload to check expiration
      const payload = JSON.parse(atob(parts[1]));
      const now = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < now) {
        // Token expired, clear it
        this.clearAuthData();
        return false;
      }

      return true;
    } catch (error) {
      // Invalid token format, clear it
      this.clearAuthData();
      return false;
    }
  },

  // Quick check for token existence (faster than isAuthenticated)
  hasToken(): boolean {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem("auth-token");
  },

  // Get user data from localStorage (faster than API call)
  getUserFromStorage(): UserWithPermissions | null {
    if (typeof window === "undefined") return null;

    try {
      const userData = localStorage.getItem("user");
      if (!userData) return null;

      const user = JSON.parse(userData);
      return user;
    } catch (error) {
      console.error("Error parsing user data from localStorage:", error);
      return null;
    }
  },

  // Check if user is admin - update this based on your user structure
  isUserAdmin(user: User): boolean {
    return isUserAdmin(user);
  },

  // Rate limiting utilities
  getRateLimitInfo(email: string) {
    return isRateLimited(email);
  },

  clearRateLimit(email: string) {
    clearRateLimit(email);
  },
};

export default authService;
