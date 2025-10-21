import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import DutyTypeService, { DutyType, DutyTypeListResponse } from '../../services/DutyTypes';

interface DutyTypesState {
  dutyTypes: DutyType[];
  activeDutyTypes: DutyType[];
  currentDutyType: DutyType | null;
  loading: boolean;
  error: string | null;
  totalItems: number;
  totalPages: number;
  currentPage: number;
}

const initialState: DutyTypesState = {
  dutyTypes: [],
  activeDutyTypes: [],
  currentDutyType: null,
  loading: false,
  error: null,
  totalItems: 0,
  totalPages: 0,
  currentPage: 1,
};

// Async thunks
export const fetchAllDutyTypes = createAsyncThunk(
  'dutyTypes/fetchAll',
  async ({ page = 1, size = 10, search = '' }: { page?: number; size?: number; search?: string }) => {
    const response = await DutyTypeService.getAllDutyTypes(page, size, search);
    return response;
  }
);

export const fetchActiveDutyTypes = createAsyncThunk(
  'dutyTypes/fetchActive',
  async () => {
    const response = await DutyTypeService.getActiveDutyTypes();
    return response;
  }
);

export const fetchDutyTypeById = createAsyncThunk(
  'dutyTypes/fetchById',
  async (id: number) => {
    const response = await DutyTypeService.getDutyTypeById(id);
    return response;
  }
);

export const createDutyType = createAsyncThunk(
  'dutyTypes/create',
  async (dutyType: DutyType) => {
    const response = await DutyTypeService.createDutyType(dutyType);
    return response;
  }
);

export const updateDutyType = createAsyncThunk(
  'dutyTypes/update',
  async ({ id, dutyType }: { id: number; dutyType: Partial<DutyType> }) => {
    const response = await DutyTypeService.updateDutyType(id, dutyType);
    return response;
  }
);

export const deleteDutyType = createAsyncThunk(
  'dutyTypes/delete',
  async (id: number) => {
    await DutyTypeService.deleteDutyType(id);
    return id;
  }
);

// Slice
const dutyTypesSlice = createSlice({
  name: 'dutyTypes',
  initialState,
  reducers: {
    clearCurrentDutyType: (state) => {
      state.currentDutyType = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all
      .addCase(fetchAllDutyTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllDutyTypes.fulfilled, (state, action: PayloadAction<DutyTypeListResponse>) => {
        state.loading = false;
        state.dutyTypes = action.payload.data;
        state.totalItems = action.payload.totalItems;
        state.totalPages = action.payload.totalPages;
        state.currentPage = action.payload.currentPage;
      })
      .addCase(fetchAllDutyTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch duty types';
      })
      // Fetch active
      .addCase(fetchActiveDutyTypes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchActiveDutyTypes.fulfilled, (state, action: PayloadAction<DutyType[]>) => {
        state.loading = false;
        state.activeDutyTypes = action.payload;
      })
      .addCase(fetchActiveDutyTypes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch active duty types';
      })
      // Fetch by ID
      .addCase(fetchDutyTypeById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDutyTypeById.fulfilled, (state, action: PayloadAction<DutyType>) => {
        state.loading = false;
        state.currentDutyType = action.payload;
      })
      .addCase(fetchDutyTypeById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch duty type';
      })
      // Create
      .addCase(createDutyType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDutyType.fulfilled, (state, action: PayloadAction<DutyType>) => {
        state.loading = false;
        state.dutyTypes.unshift(action.payload);
      })
      .addCase(createDutyType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to create duty type';
      })
      // Update
      .addCase(updateDutyType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDutyType.fulfilled, (state, action: PayloadAction<DutyType>) => {
        state.loading = false;
        const index = state.dutyTypes.findIndex((d) => d.id === action.payload.id);
        if (index !== -1) {
          state.dutyTypes[index] = action.payload;
        }
        if (state.currentDutyType?.id === action.payload.id) {
          state.currentDutyType = action.payload;
        }
      })
      .addCase(updateDutyType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to update duty type';
      })
      // Delete
      .addCase(deleteDutyType.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteDutyType.fulfilled, (state, action: PayloadAction<number>) => {
        state.loading = false;
        state.dutyTypes = state.dutyTypes.filter((d) => d.id !== action.payload);
      })
      .addCase(deleteDutyType.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to delete duty type';
      });
  },
});

export const { clearCurrentDutyType, clearError } = dutyTypesSlice.actions;
export default dutyTypesSlice.reducer;


