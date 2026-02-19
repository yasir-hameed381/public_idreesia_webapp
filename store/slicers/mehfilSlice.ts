import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface MehfilData {
  id: number;
  title: string;
  description: string;
}

interface FetchMehfilDataResponse {
  data: MehfilData[];
  meta: {
    total: number;
  };
  size: number;
}

interface MehfilState {
  allMehfildata: Record<number, MehfilData>; 
  SingleMehfildata: Record<number, MehfilData>;
  totalPages: number;
  loading: boolean;
  error: string | null;
}

interface FetchMehfilDataParams {
  page: number;
  size: number;
  search: string;
}

export const fetchMehfilData = createAsyncThunk<FetchMehfilDataResponse, FetchMehfilDataParams>(
  'mehfil/fetchMehfilData',
  async ({ page, size, search }) => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL; 
    
    const res = await fetch(
      `${apiUrl}/mehfils-data?page=${page}&size=${size}&search=${search}` 
    );
    const data = await res.json();
    return data;
  }
);

const mehfilSlice = createSlice({
  name: 'mehfil',
  initialState: {
    allMehfildata: {},
    SingleMehfildata: {},
    totalPages: 1,
    loading: false,
    error: null,
  } as MehfilState, 
  reducers: {
    setMehfilDataById: (state, action: PayloadAction<{ id: number; mehfil: MehfilData }>) => {
      const { id, mehfil } = action.payload;
      state.SingleMehfildata = { [id]: mehfil };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMehfilData.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMehfilData.fulfilled, (state, action) => {
        state.allMehfildata = action.payload.data.reduce((acc, item) => {
          acc[item.id] = item;
          return acc;
        }, {} as Record<number, MehfilData>);
        
        state.totalPages = Math.ceil(action.payload.meta.total / action.meta.arg.size);
        state.loading = false;
      })
      .addCase(fetchMehfilData.rejected, (state, action) => {
        state.error = action.error.message || null;
        state.loading = false;
      });
  },
});

export const { setMehfilDataById } = mehfilSlice.actions;

export default mehfilSlice.reducer;
