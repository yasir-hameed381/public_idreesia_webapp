/**
 * Centralized API configuration utilities for RTK Query
 * Handles authentication headers and base URL configuration
 */

/**
 * Prepare headers with authentication token for API requests
 * This function should be used in the `prepareHeaders` option of fetchBaseQuery
 */
export const prepareAuthHeaders = (headers: Headers) => {
  // Get token from localStorage
  const token = typeof window !== 'undefined' 
    ? localStorage.getItem('auth-token') 
    : null;
  
  // Add authorization header if token exists
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
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
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
};

