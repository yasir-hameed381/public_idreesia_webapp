import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Category } from "@/app/types/category";

interface CategoryState {
  selectedCategory: Category | null;
}

const initialState: CategoryState = {
  selectedCategory: null,
};

const categorySlice = createSlice({
  name: "category",
  initialState,
  reducers: {
    setSelectedCategory: (state, action: PayloadAction<Category | null>) => {
      state.selectedCategory = action.payload;
    },
  },
});

export const { setSelectedCategory } = categorySlice.actions;
export default categorySlice.reducer;
