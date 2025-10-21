import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Taleemat } from './taleematApi';

interface TaleematState {
  selectedTaleemat: Taleemat | null;
  filters: {
    page: number;
    size: number;
    search: string;
    category: string;
  };
  loading: boolean;
}

const initialState: TaleematState = {
  selectedTaleemat: null,
  filters: {
    page: 0,
    size: 10,
    search: '',
    category: 'all',
  },
  loading: false,
};

const taleematSlice = createSlice({
  name: 'taleemat',
  initialState,
  reducers: {
    setSelectedTaleemat: (state, action: PayloadAction<Taleemat | null>) => {
      state.selectedTaleemat = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<TaleematState['filters']>>) => {
      state.filters = {
        ...state.filters,
        ...action.payload,
      };
      // Reset page to 0 if search or category changes
      if (action.payload.search !== undefined || action.payload.category !== undefined) {
        state.filters.page = 0;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    resetFilters: (state) => {
      state.filters = initialState.filters;
    },
  },
});

export const { 
  setSelectedTaleemat, 
  setFilters, 
  setLoading,
  resetFilters
} = taleematSlice.actions;

export default taleematSlice.reducer;