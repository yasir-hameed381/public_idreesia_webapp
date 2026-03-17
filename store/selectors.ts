/**
 * Memoized Redux selectors using createSelector
 * Prevents unnecessary re-renders when derived state hasn't changed
 */
import { createSelector } from "@reduxjs/toolkit";
import type { RootState } from "./store";

// Auth selectors
export const selectAuth = (state: RootState) => state.auth;

export const selectAuthUser = createSelector(
  [selectAuth],
  (auth) => auth.user
);

export const selectIsAuthenticated = createSelector(
  [selectAuth],
  (auth) => auth.isAuthenticated
);

export const selectAuthLoading = createSelector(
  [selectAuth],
  (auth) => auth.isLoading
);

export const selectAuthError = createSelector(
  [selectAuth],
  (auth) => auth.error
);

export const selectIsLoggingIn = createSelector(
  [selectAuth],
  (auth) => auth.isLoggingIn
);

export const selectAuthState = createSelector(
  [selectAuth],
  (auth) => ({
    isAuthenticated: auth.isAuthenticated,
    user: auth.user,
    isLoading: auth.isLoading,
    error: auth.error,
    isLoggingIn: auth.isLoggingIn,
  })
);

// Search selectors
export const selectSearch = (state: RootState) => state.search;

export const selectSearchDetails = createSelector(
  [selectSearch],
  (search) => search.searchDetails
);

export const selectSearchState = createSelector(
  [selectSearch],
  (search) => ({
    searchQuery: search.searchQuery,
    selectedCategory: search.selectedCategory,
    searchResults: search.searchResults,
    searchDetails: search.searchDetails,
    error: search.error,
    isLoading: search.isLoading,
  })
);

// Language selector
export const selectLanguage = createSelector(
  [(state: RootState) => state.language],
  (language) => language?.language ?? "en"
);

// Mehfil selectors (state.mehfil uses normalized keys: singleMehfilData, allMehfilData)
export const selectSingleMehfilData = createSelector(
  [(state: RootState) => state.mehfil?.singleMehfilData],
  (data) => data
);

export const selectAllMehfilData = createSelector(
  [(state: RootState) => state.mehfil?.allMehfilData],
  (data) => data
);

