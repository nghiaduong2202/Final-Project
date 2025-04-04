import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ServiceState } from '@/types/service.type';

// Initial state
const initialState: ServiceState = {
  services: [],
  isLoading: false,
  error: null,
  selectedFacilityId: null
};


// Slice
const serviceSlice = createSlice({
  name: 'service',
  initialState,
  reducers: {
    setSelectedFacilityId: (state, action: PayloadAction<string>) => {
      state.selectedFacilityId = action.payload;
    },
    resetServiceState: (state) => {
      state.services = [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: () => {   
  }
});

export const { setSelectedFacilityId, resetServiceState } = serviceSlice.actions;

export default serviceSlice.reducer;