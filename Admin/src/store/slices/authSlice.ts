import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/types/errors';
import { LoginParams, AdminUser, AuthState } from '@/types/auth.types';

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginModalVisible: false,
  redirectPath: null,
  resetAuthChecksFlag: false,
};

export const login = createAsyncThunk<AdminUser, LoginParams, { rejectValue: string }>(
  'auth/login',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const authData = await authService.login(email, password);
      
      if (authData && authData.accessToken) {
        localStorage.setItem('admin_access_token', authData.accessToken);
        localStorage.setItem('admin_refresh_token', authData.refreshToken);
        const user = await authService.getMyInfo();
        
        // Kiểm tra xem người dùng có phải là admin hay không
        if (user.role !== 'admin') {
          // Xóa token nếu không phải admin
          localStorage.removeItem('admin_access_token');
          localStorage.removeItem('admin_refresh_token');
          return rejectWithValue('Tài khoản này không có quyền quản trị hệ thống');
        }
        
        return user;
      }
      return rejectWithValue('Đăng nhập thất bại');
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API if needed
      // await authService.logout();
      
      // Xóa tokens
      localStorage.removeItem('admin_access_token');
      localStorage.removeItem('admin_refresh_token');
      
      // Đặt flag để tránh redirect loop
      sessionStorage.setItem('just_logged_out', 'true');
      
      return true;
    } catch (error) {
      return rejectWithValue('Đăng xuất thất bại');
    }
  }
);

export const refreshToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      const refreshToken = localStorage.getItem('admin_refresh_token');
      if (!refreshToken) {
        return rejectWithValue('Không tìm thấy refresh token');
      }
      
      const response = await authService.refreshToken(refreshToken);
      
      if (response && response.accessToken) {
        localStorage.setItem('admin_access_token', response.accessToken);
        return response;
      }
      
      return rejectWithValue('Làm mới token thất bại');
    } catch (error) {
      return rejectWithValue('Làm mới token thất bại');
    }
  }
);

export const getAdminProfile = createAsyncThunk(
  'auth/getAdminProfile',
  async (_, { rejectWithValue }) => {
    try {
      const user = await authService.getAdminInfo();
      return user;
    } catch (error) {
      return rejectWithValue('Không thể lấy thông tin người dùng');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    showLoginModal: (state, action: PayloadAction<{ path?: string }>) => {
      state.loginModalVisible = true;
      state.redirectPath = action.payload.path || null;
    },
    hideLoginModal: (state) => {
      state.loginModalVisible = false;
    },
    resetAuthChecks: (state) => {
      state.resetAuthChecksFlag = !state.resetAuthChecksFlag;
    },
    clearAuthError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.loginModalVisible = false;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload || 'Đăng nhập thất bại';
      })
      .addCase(logout.fulfilled, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(refreshToken.fulfilled, (state) => {
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state) => {
        state.isAuthenticated = false;
        state.user = null;
      })
      .addCase(getAdminProfile.fulfilled, (state, action) => {
        state.user = action.payload;
        state.isAuthenticated = true;
      })
      .addCase(getAdminProfile.rejected, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      });
  },
});

export const { showLoginModal, hideLoginModal, resetAuthChecks, clearAuthError } = authSlice.actions;

export default authSlice.reducer;