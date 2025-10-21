import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VALID_USER_TYPES } from './karkunJoinRequestsApi';

interface KarkunJoinRequestState {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedUserType: string;
  selectedApprovalStatus: boolean | null; // null means all, true means approved, false means pending
}

const initialState: KarkunJoinRequestState = {
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  selectedUserType: 'all', // Default to 'all' which is valid
  selectedApprovalStatus: null, // Show all by default
};

const karkunJoinRequestsSlice = createSlice({
  name: 'karkunJoinRequests',
  initialState,
  reducers: {
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    setPageSize(state, action: PayloadAction<number>) {
      state.pageSize = action.payload;
    },
    setSearchTerm(state, action: PayloadAction<string>) {
      state.searchTerm = action.payload;
    },
    setSelectedUserType(state, action: PayloadAction<string>) {
      // Validate the user type before setting it
      state.selectedUserType = VALID_USER_TYPES.includes(action.payload) 
        ? action.payload 
        : 'all';
    },
    setSelectedApprovalStatus(state, action: PayloadAction<boolean | null>) {
      state.selectedApprovalStatus = action.payload;
    },
    resetFilters(state) {
      state.searchTerm = '';
      state.selectedUserType = 'all';
      state.selectedApprovalStatus = null;
      state.currentPage = 1;
    },
  },
});

export const { 
  setCurrentPage, 
  setPageSize, 
  setSearchTerm, 
  setSelectedUserType,
  setSelectedApprovalStatus,
  resetFilters
} = karkunJoinRequestsSlice.actions;

export default karkunJoinRequestsSlice.reducer;
