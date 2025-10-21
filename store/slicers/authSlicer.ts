import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface SuthState {
  value: string;
}

const initialState: SuthState = {
  value: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setValue(state, action: PayloadAction<string>) {
      state.value = action.payload;
    },
    clearValue(state) {
      state.value = '';
    },
  },
});

export const { setValue, clearValue } = authSlice.actions;
export default authSlice.reducer; 