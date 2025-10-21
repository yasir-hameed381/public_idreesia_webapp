import { createSlice, createAsyncThunk, PayloadAction } from "@reduxjs/toolkit";
import { wazaifApi } from "./wazaifApi";

interface Wazaif {
  id: number;
  title_en: string;
  title_ur: string;
  description: string;
  images: string | string[];
}

interface WazaifState {
  data: Wazaif[];
  loading: boolean;
  error: string | null;
}

export const fetchWazaif = createAsyncThunk<Wazaif[], void>(
  "wazaif/fetchWazaif",
  async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const res = await fetch(`${apiUrl}/wazaifs-data?size=10&page=1`);
    const result = await res.json();
    return result.data;
  }
);

const wazaifSlice = createSlice({
  name: "wazaif",
  initialState: {
    data: [],
    loading: false,
    error: null,
  } as WazaifState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchWazaif.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchWazaif.fulfilled, (state, action: PayloadAction<Wazaif[]>) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchWazaif.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || null;
      });
  },
});

export default wazaifSlice.reducer;