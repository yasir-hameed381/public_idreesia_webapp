import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VALID_MESSAGE_CATEGORIES } from './messagesApi';

interface MessageState {
  currentPage: number;
  pageSize: number;
  searchTerm: string;
  selectedCategory: string;
}

const initialState: MessageState = {
  currentPage: 1,
  pageSize: 10,
  searchTerm: '',
  selectedCategory: 'all', // Default to 'all' which is valid
};

const messagesSlice = createSlice({
  name: 'messages',
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
      state.selectedCategory = VALID_MESSAGE_CATEGORIES.includes(action.payload) 
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
} = messagesSlice.actions;

export default messagesSlice.reducer;