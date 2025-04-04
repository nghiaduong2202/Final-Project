import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Facility, FacilityState } from '@/types/facility.type';
import { facilityService, FacilityDropdownItem } from '@/services/facility.service';
import { AxiosError } from 'axios';

// Interface for API error responses
interface ApiError {
  message: string;
  statusCode?: number;
}

// Mở rộng FacilityState để thêm danh sách dropdown
interface ExtendedFacilityState extends FacilityState {
  dropdownItems: FacilityDropdownItem[];
}

// Initial state
const initialState: ExtendedFacilityState = {
  facility: {} as Facility,
  isLoading: false,
  error: null,
  dropdownItems: []
};

// Async thunks
export const fetchOwnerFacilities = createAsyncThunk(
  'facility/fetchOwnerFacilities',
  async (ownerId: string, { rejectWithValue }) => {
    try {
      const response = await facilityService.getMyFacilities();
      return response.data;
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch facilities');
    }
  }
);

export const fetchFacilityById = createAsyncThunk(
  'facility/fetchFacilityById',
  async (facilityId: string, { rejectWithValue }) => {
    try {
      const response = await facilityService.getFacilityById(facilityId);
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch facility details');
    }
  }
);

export const fetchFacilityDropdown = createAsyncThunk(
  'facility/fetchFacilityDropdown',
  async (_, { rejectWithValue }) => {
    try {
      const response = await facilityService.getFacilitiesDropdown();
      return response;
    } catch (error) {
      const err = error as AxiosError<ApiError>;
      return rejectWithValue(err.response?.data?.message || 'Failed to fetch facility dropdown');
    }
  }
);

// Slice
const facilitySlice = createSlice({
  name: 'facility',
  initialState,
  reducers: {
    clearFacility: (state) => {
      state.facility = {} as Facility;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch facility details
      .addCase(fetchFacilityById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacilityById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.facility = action.payload;
      })
      .addCase(fetchFacilityById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      
      // Fetch facility dropdown
      .addCase(fetchFacilityDropdown.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchFacilityDropdown.fulfilled, (state, action) => {
        state.isLoading = false;
        state.dropdownItems = action.payload;
      })
      .addCase(fetchFacilityDropdown.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearFacility, clearError } = facilitySlice.actions;
export default facilitySlice.reducer;
