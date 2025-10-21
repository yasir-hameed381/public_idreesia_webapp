import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface FetchSearchResultsParams {
  query: string;
  type: string;
}

interface SearchState {
  searchQuery: string;
  selectedCategory: string;
  searchResults: any[];
  searchDetails: any | null;
  error: string | null;
  isLoading: boolean;
}

const initialState: SearchState = {
  searchQuery: '',
  selectedCategory: '',
  searchResults: [],
  searchDetails: null,
  error: null,
  isLoading: false,
};

export const fetchSearchResults = createAsyncThunk(
  'search/fetchResults',
  async ({ query, type }: FetchSearchResultsParams) => {
    if (!query || !type) return [];
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(
      `${apiUrl}/search?query=${query}&type=${type.toLowerCase()}`
    );
    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.statusText}`);
    }
    const data = await response.json();
    return data.data || [];
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setSelectedCategory: (state, action: PayloadAction<string>) => {
      state.selectedCategory = action.payload;
    },
    clearSearchResults: (state) => {
      state.searchResults = [];
      state.searchQuery = '';
    },
    setSearchDetails: (state, action: PayloadAction<any>) => {
      state.searchDetails = action.payload;
    },
    clearSearchDetails: (state) => {
      state.searchDetails = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSearchResults.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchSearchResults.fulfilled, (state, action: PayloadAction<any[]>) => {
        state.isLoading = false;
        state.searchResults = action.payload;
      })
      .addCase(fetchSearchResults.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'An error occurred';
      });
  },
});

export const {
  setSearchQuery,
  setSelectedCategory,
  clearSearchResults,
  setSearchDetails,
  clearSearchDetails,
} = searchSlice.actions;

export default searchSlice.reducer;
