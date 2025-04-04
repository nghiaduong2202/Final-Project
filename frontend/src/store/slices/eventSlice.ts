import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { EventState } from '@/types/event.type';

// Initial state
const initialState: EventState = {
  events: [],
  isLoading: false,
  error: null,
  selectedFacilityId: null
};


// Slice
const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setSelectedFacilityId: (state, action: PayloadAction<string>) => {
      state.selectedFacilityId = action.payload;
    },
    resetEventState: (state) => {
      state.events = [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: () => {   
  }
});

export const { setSelectedFacilityId, resetEventState } = eventSlice.actions;

export default eventSlice.reducer;