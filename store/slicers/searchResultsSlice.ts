
// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// export const fetchSearchResults = createAsyncThunk(
//   'searchResults/fetchSearchResults',
//   async ({ query, type }) => {
//     if (!query || !type) return [];

//     const apiUrl = `http://localhost:3000/api/search?query=${query}&type=${type.toLowerCase()}`;
//     const response = await fetch(apiUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to fetch results: ${response.statusText}`);
//     }
//     const data = await response.json();
//     return data.data || [];
// //   }
// );

// const searchResultsSlice = createSlice({
//   name: 'searchResults', 
//   initialState: {
//     searchQuery: '',
//     selectedCategory: '',
//     searchResults: [],
//     isLoading: false,
//     error: null
//   },
//   reducers: {
//     setSearchQuery(state, action) {
//       state.searchQuery = action.payload;
//     },
//     setSelectedCategory(state, action) {
//       state.selectedCategory = action.payload;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchSearchResults.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(fetchSearchResults.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.searchResults = action.payload;
//       })
//       .addCase(fetchSearchResults.rejected, (state, action) => {
//         state.isLoading = false;
//         state.error = action.error.message;
//       });
//   }
// });

// export const { setSearchQuery, setSelectedCategory } = searchResultsSlice.actions;

// export default searchResultsSlice.reducer;
