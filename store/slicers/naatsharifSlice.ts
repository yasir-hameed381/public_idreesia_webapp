import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VALID_CATEGORIES } from './naatsharifApi';

interface NaatSharifState {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
}

const initialState: NaatSharifState = {
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  selectedCategory: 'all', // Default to 'all' which is valid
};

const naatsharifSlice = createSlice({
  name: 'naatsharif',
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
    setSelectedCategory(state, action: PayloadAction<string>) {
      // Validate the category before setting it
      state.selectedCategory = VALID_CATEGORIES.includes(action.payload) 
        ? action.payload 
        : 'all';
    },
  },
});

export const { 
  setCurrentPage, 
  setPageSize, 
  setSearchTerm, 
  setSelectedCategory 
} = naatsharifSlice.actions;

export default naatsharifSlice.reducer;