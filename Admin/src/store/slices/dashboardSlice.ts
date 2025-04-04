import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { apiClient } from '@/services/api.service';

interface DashboardStats {
  totalUsers: number;
  totalFacilities: number;
  pendingApprovals: number;
  recentIssues: number;
  userGrowth: {
    labels: string[];
    data: number[];
  };
  facilityGrowth: {
    labels: string[];
    data: number[];
  };
  recentApprovals: any[];
}

interface DashboardState {
  stats: DashboardStats;
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  stats: {
    totalUsers: 0,
    totalFacilities: 0,
    pendingApprovals: 0,
    recentIssues: 0,
    userGrowth: {
      labels: [],
      data: [],
    },
    facilityGrowth: {
      labels: [],
      data: [],
    },
    recentApprovals: [],
  },
  loading: false,
  error: null,
};

export const fetchDashboardStats = createAsyncThunk(
  'dashboard/fetchStats',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/admin/dashboard');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard stats');
    }
  }
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardStats.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDashboardStats.fulfilled, (state, action) => {
        state.loading = false;
        state.stats = action.payload;
      })
      .addCase(fetchDashboardStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default dashboardSlice.reducer;