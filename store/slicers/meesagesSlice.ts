import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

export const fetchMessagesData = createAsyncThunk(
  'messages/fetchMessagesData',
  async ({ page, size = '', search = '' }: { page: number; size: string; search: string }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;

    const res = await fetch(
      `${apiUrl}/messages-data?page=${page}&size=${size}&search=${search}`
    );

    const data = await res.json();
    return data;
  }
);

const messagesSlice = createSlice({
  name: 'messages',
  initialState: {
    data: [],
    totalPages: 1,
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMessagesData.pending, (state: any) => {
        state.loading = true;
      })
      .addCase(fetchMessagesData.fulfilled, (state, action) => {
        state.data = action.payload.data;
        state.totalPages = Math.ceil(action.payload.meta.total / 15); 
        state.loading = false;
      })
      .addCase(fetchMessagesData.rejected, (state: any, action) => {
        state.error = action.error.message;
        state.loading = false;
      });
  },
});

export default messagesSlice.reducer;
