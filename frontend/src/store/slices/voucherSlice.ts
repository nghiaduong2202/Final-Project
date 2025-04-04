import { VoucherState } from '@/types/voucher.type';
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Initial state
const initialState: VoucherState = {
  vouchers: [],
  isLoading: false,
  error: null,
  selectedFacilityId: null
};

// Helper function to determine voucher status
export const getVoucherStatus = (startDate: string, endDate: string): 'active' | 'upcoming' | 'expired' => {
  const now = new Date();
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  if (now < start) {
    return 'upcoming';
  } else if (now > end) {
    return 'expired';
  } else {
    return 'active';
  }
};

// Slice
const voucherSlice = createSlice({
  name: 'voucher',
  initialState,
  reducers: {
    setSelectedFacilityId: (state, action: PayloadAction<string>) => {
      state.selectedFacilityId = action.payload;
    },
    resetVoucherState: (state) => {
      state.vouchers = [];
      state.isLoading = false;
      state.error = null;
    }
  },
  extraReducers: () => {    
  }
});

export const { setSelectedFacilityId, resetVoucherState } = voucherSlice.actions;

export default voucherSlice.reducer;