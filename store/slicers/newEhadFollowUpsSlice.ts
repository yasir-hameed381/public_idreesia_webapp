import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import NewEhadFollowUpService, {
  NewEhadFollowUp,
  FollowUpListResponse,
} from '../../services/NewEhadFollowUps';

interface NewEhadFollowUpsState {
  followUps: NewEhadFollowUp[];
  currentFollowUp: NewEhadFollowUp | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const initialState: NewEhadFollowUpsState = {
  followUps: [],
  currentFollowUp: null,
  loading: false,
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchAllFollowUps = createAsyncThunk(
  'newEhadFollowUps/fetchAll',
  async ({ page = 1, size = 10, search = '' }: { page?: number; size?: number; search?: string }) => {
    const response = await NewEhadFollowUpService.getAllFollowUps(page, size, search);
    return response;
  }
);

export const fetchFollowUpsByNewEhadId = createAsyncThunk(
  'newEhadFollowUps/fetchByNewEhadId',
  async (newEhadId: number) => {
    const response = await NewEhadFollowUpService.getFollowUpsByNewEhadId(newEhadId);
    return response;
  }
);

export const fetchFollowUpById = createAsyncThunk(
  'newEhadFollowUps/fetchById',
  async (id: number) => {
    const response = await NewEhadFollowUpService.getFollowUpById(id);
    return response;
  }
);

export const createFollowUp = createAsyncThunk(
  'newEhadFollowUps/create',
  async (followUp: NewEhadFollowUp) => {
    const response = await NewEhadFollowUpService.createFollowUp(followUp);
    return response;
  }
);

export const updateFollowUp = createAsyncThunk(
  'newEhadFollowUps/update',
  async ({ id, followUp }: { id: number; followUp: Partial<NewEhadFollowUp> }) => {
    const response = await NewEhadFollowUpService.updateFollowUp(id, followUp);
    return response;
  }
);

export const deleteFollowUp = createAsyncThunk(
  'newEhadFollowUps/delete',
  async (id: number) => {
    await NewEhadFollowUpService.deleteFollowUp(id);
    return id;
  }
);

// Slice
const newEhadFollowUpsSlice = createSlice({
  name: 'newEhadFollowUps',
  initialState,
  reducers: {
    clearCurrentFollowUp: (state) => {
      state.currentFollowUp = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all follow-ups
      .addCase(fetchAllFollowUps.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllFollowUps.fulfilled, (state, action: PayloadAction<FollowUpListResponse>) => {
        state.loading = false;
        state.followUps = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllFollowUps.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch follow-ups';
      })
      // Fetch by new ehad ID
      .addCase(fetchFollowUpsByNewEhadId.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowUpsByNewEhadId.fulfilled, (state, action: PayloadAction<NewEhadFollowUp[]>) => {
        state.loading = false;
        state.followUps = action.payload;
      })
      .addCase(fetchFollowUpsByNewEhadId.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch follow-ups';
      })
      // Fetch by ID
      .addCase(fetchFollowUpById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFollowUpById.fulfilled, (state, action: PayloadAction<NewEhadFollowUp>) => {
        state.loading = false;
        state.currentFollowUp = action.payload;
      })
      .addCase(fetchFollowUpById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch follow-up';
      })
      // Create
      .addCase(createFollowUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createFollowUp.fulfilled, (state, action: PayloadAction<NewEhadFollowUp>) => {
        state.loading = false;
        state.followUps.unshift(action.payload);
      })
      .addCase(createFollowUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create follow-up';
      })
      // Update
      .addCase(updateFollowUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFollowUp.fulfilled, (state, action: PayloadAction<NewEhadFollowUp>) => {
        state.loading = false;
        const index = state.followUps.findIndex((f) => f.id === action.payload.id);
        if (index !== -1) {
          state.followUps[index] = action.payload;
        }
        if (state.currentFollowUp?.id === action.payload.id) {
          state.currentFollowUp = action.payload;
        }
      })
      .addCase(updateFollowUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update follow-up';
      })
      // Delete
      .addCase(deleteFollowUp.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFollowUp.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.followUps = state.followUps.filter((f) => f.id !== action.payload);
      })
      .addCase(deleteFollowUp.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete follow-up';
      });
  },
});

export const { clearCurrentFollowUp, clearError } = newEhadFollowUpsSlice.actions;
export default newEhadFollowUpsSlice.reducer;


