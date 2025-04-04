import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FieldGroupState } from '@/types/field.type';

// Initial state
const initialState: FieldGroupState = {
  fieldGroups: [],
  isLoading: false,
  error: null,
  selectedFacilityId: null
};


// Slice
const fieldSlice = createSlice({
  name: 'field',
  initialState,
  reducers: {
    setSelectedFacilityId: (state, action: PayloadAction<string>) => {
      state.selectedFacilityId = action.payload;
    },
    resetFieldGroupState: (state) => {
      state.fieldGroups = [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: () => {       
  }
});

export const { setSelectedFacilityId, resetFieldGroupState } = fieldSlice.actions;

export default fieldSlice.reducer;