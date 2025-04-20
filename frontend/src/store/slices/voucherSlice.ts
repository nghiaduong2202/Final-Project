import { VoucherState, Voucher, VoucherFormData } from '@/types/voucher.type';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { voucherService } from '@/services/voucher.service';

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

// Async thunks
export const fetchVouchers = createAsyncThunk(
  'voucher/fetchVouchers',
  async (facilityId: string, { rejectWithValue }) => {
    try {
      return await voucherService.getVouchers(facilityId);
    } catch (error: unknown) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to fetch vouchers');
    }
  }
);

export const createVoucher = createAsyncThunk(
  'voucher/createVoucher',
  async ({ facilityId, voucherData }: { facilityId: string, voucherData: VoucherFormData }, { rejectWithValue }) => {
    try {
      return await voucherService.createVoucher(facilityId, voucherData);
    } catch (error: unknown) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to create voucher');
    }
  }
);

export const updateVoucher = createAsyncThunk(
  'voucher/updateVoucher',
  async (voucherData: Partial<Voucher>, { rejectWithValue }) => {
    try {
      return await voucherService.updateVoucher(voucherData);
    } catch (error: unknown) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to update voucher');
    }
  }
);

export const deleteVoucher = createAsyncThunk(
  'voucher/deleteVoucher',
  async (voucherId: number, { rejectWithValue }) => {
    try {
      await voucherService.deleteVoucher(voucherId);
      return voucherId;
    } catch (error: unknown) {
      const err = error as Error;
      return rejectWithValue(err.message || 'Failed to delete voucher');
    }
  }
);

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
  extraReducers: (builder) => {
    // Fetch vouchers
    builder.addCase(fetchVouchers.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(fetchVouchers.fulfilled, (state, action) => {
      state.isLoading = false;
      state.vouchers = action.payload;
    });
    builder.addCase(fetchVouchers.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Create voucher
    builder.addCase(createVoucher.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(createVoucher.fulfilled, (state, action) => {
      state.isLoading = false;
      state.vouchers.push(action.payload);
    });
    builder.addCase(createVoucher.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Update voucher
    builder.addCase(updateVoucher.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(updateVoucher.fulfilled, (state, action) => {
      state.isLoading = false;
      const updatedVoucher = action.payload;
      state.vouchers = state.vouchers.map(voucher => 
        voucher.id === updatedVoucher.id ? updatedVoucher : voucher
      );
    });
    builder.addCase(updateVoucher.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    
    // Delete voucher
    builder.addCase(deleteVoucher.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(deleteVoucher.fulfilled, (state, action) => {
      state.isLoading = false;
      state.vouchers = state.vouchers.filter(voucher => voucher.id !== action.payload);
    });
    builder.addCase(deleteVoucher.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setSelectedFacilityId, resetVoucherState } = voucherSlice.actions;

export default voucherSlice.reducer;