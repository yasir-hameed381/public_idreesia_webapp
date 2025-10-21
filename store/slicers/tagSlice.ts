import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Tag } from "@/app/types/tag";

interface TagState {
  selectedTag: Tag | null;
}

const initialState: TagState = {
  selectedTag: null,
};

const tagSlice = createSlice({
  name: "tag",
  initialState,
  reducers: {
    setSelectedTag: (state, action: PayloadAction<Tag | null>) => {
      state.selectedTag = action.payload;
    },
  },
});

export const { setSelectedTag } = tagSlice.actions;
export default tagSlice.reducer;