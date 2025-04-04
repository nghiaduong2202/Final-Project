import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/services/api.service';
import { Facility, FacilityFilter } from '@/types/facility.types';

interface FacilitiesState {
  facilities: Facility[];
  selectedFacility: Facility | null;
  loading: boolean;
  error: string | null;
  totalFacilities: number;
}

const initialState: FacilitiesState = {
  facilities: [],
  selectedFacility: null,
  loading: false,
  error: null,
  totalFacilities: 0,
};

export const fetchFacilities = createAsyncThunk(
  'facilities/fetchFacilities',
  async (filter: FacilityFilter = {}, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/facilities', { params: filter });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch facilities');
    }
  }
);

export const fetchFacilityDetail = createAsyncThunk(
  'facilities/fetchFacilityDetail',
  async (facilityId: string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/admin/facilities/${facilityId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch facility details');
    }
  }
);

export const updateFacility = createAsyncThunk(
  'facilities/updateFacility',
  async ({ facilityId, facilityData }: { facilityId: string; facilityData: Partial<Facility> }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/admin/facilities/${facilityId}`, facilityData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update facility');
    }
  }
);

export const deleteFacility = createAsyncThunk(
  'facilities/deleteFacility',
  async (facilityId: string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/admin/facilities/${facilityId}`);
      return facilityId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete facility');
    }
  }
);

export const updateFacilityStatus = createAsyncThunk(
  'facilities/updateFacilityStatus',
  async ({ facilityId, status }: { facilityId: string; status: string }, { rejectWithValue }) => {
    try {
      const response = await apiClient.patch(`/admin/facilities/${facilityId}/status`, { status });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update facility status');
    }
  }
);

const facilitiesSlice = createSlice({
  name: 'facilities',
  initialState,
  reducers: {
    clearSelectedFacility: (state) => {
      state.selectedFacility = null;
    },
    clearFacilitiesError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFacilities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilities.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = action.payload.facilities;
        state.totalFacilities = action.payload.total;
      })
      .addCase(fetchFacilities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(fetchFacilityDetail.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFacilityDetail.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedFacility = action.payload;
      })
      .addCase(fetchFacilityDetail.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacility.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedFacility?.id === action.payload.id) {
          state.selectedFacility = action.payload;
        }
        state.facilities = state.facilities.map(facility => 
          facility.id === action.payload.id ? action.payload : facility
        );
      })
      .addCase(updateFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(deleteFacility.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteFacility.fulfilled, (state, action) => {
        state.loading = false;
        state.facilities = state.facilities.filter(facility => facility.id !== action.payload);
        if (state.selectedFacility?.id === action.payload) {
          state.selectedFacility = null;
        }
      })
      .addCase(deleteFacility.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      
      .addCase(updateFacilityStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateFacilityStatus.fulfilled, (state, action) => {
        state.loading = false;
        if (state.selectedFacility?.id === action.payload.id) {
          state.selectedFacility = action.payload;
        }
        state.facilities = state.facilities.map(facility => 
          facility.id === action.payload.id ? action.payload : facility
        );
      })
      .addCase(updateFacilityStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearSelectedFacility, clearFacilitiesError } = facilitiesSlice.actions;

export default facilitiesSlice.reducer;