/**
 * Centralized API configuration utilities for RTK Query
 * Handles authentication headers and base URL configuration
 */

/**
 * Prepare headers with authentication token for API requests
 * This function should be used in the `prepareHeaders` option of fetchBaseQuery
 * RTK Query's prepareHeaders receives (headers, api) where headers is a Headers object
 */
export const prepareAuthHeaders = (headers: Headers, api: any) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth-token') 
    : null;
  
  // Create headers if they don't exist (shouldn't happen, but just in case)
  if (!headers) {
    headers = new Headers();
  }
  
  // Add authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  } else {
    // Log warning if no token found (only in development)
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
      console.warn('No auth token found in localStorage');
    }
  }
  
  // Set default content type
  headers.set('Content-Type', 'application/json');
  headers.set('Accept', 'application/json');
  
  return headers;
};

/**
 * Get the API base URL from environment variables
 */
export const getApiBaseUrl = (): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
  // Ensure /api is included in the base URL
  if (!baseUrl.includes('/api')) {
    return baseUrl.endsWith('/') ? `${baseUrl}api` : `${baseUrl}/api`;
  }
  return baseUrl.replace(/\/$/, ''); // Remove trailing slash
};

/**
 * API configuration object
 */
export const apiConfig = {
  baseURL: getApiBaseUrl(),
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
};
