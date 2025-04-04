import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '@/services/auth.service';
import { ApiError } from '@/types/errors';
import { LoginParams, RegisterData, UserState } from '@/types/user.type';

const initialState: UserState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  loginModalVisible: false,
  redirectPath: null,
  roleModalVisible: false,
  selectedRole: null,
  playerRoleModalVisible: false,
  ownerRoleModalVisible: false,
  resetAuthChecksFlag: false,
};

// Async thunks for authentication
export const login = createAsyncThunk(
  'user/login',
  async ({ email, password, requiredRole, fromToken= false  }: LoginParams, { rejectWithValue }) => {
    try {
      let user;
      if (fromToken) {
        const token = localStorage.getItem('access_token');
        if (!token) {
          return rejectWithValue('Không tìm thấy token');
        }
        user = await authService.getMyInfo();
      } else {
        const authData = await authService.login(email, password);     
        localStorage.setItem('access_token', authData.accessToken);
        localStorage.setItem('refresh_token', authData.refreshToken);
        user = await authService.getMyInfo();
      }      
       // Kiểm tra vai trò nếu được yêu cầu
       if (requiredRole && user.role !== requiredRole) {
        // Xóa token nếu vai trò không phù hợp
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        return rejectWithValue(`Tài khoản này không có quyền truy cập với vai trò ${requiredRole === 'owner' ? 'Chủ sân' : 'Người chơi'}`);
      }
      
      return user;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
    }
  }
);

export const register = createAsyncThunk(
  'user/register',
  async (userData: RegisterData, { rejectWithValue }) => {
    try {            
      await authService.register(userData);
      return true;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      return rejectWithValue(apiError.response?.data?.message || 'Đăng ký tài khoản thất bại. Vui lòng thử lại.');
    }
  }
);

export const logout = createAsyncThunk(
  'user/logout',
  async () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('userId');
    return null;
  }
);

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    showLoginModal: (state, action: PayloadAction<{ path: string, role?: 'player' | 'owner' }>) => {
      state.loginModalVisible = true;
      state.redirectPath = action.payload.path;
      if (action.payload.role) {
        state.selectedRole = action.payload.role;
      }
    },
    hideLoginModal: (state) => {
      state.loginModalVisible = false;  
    },
    showRoleModal: (state, action: PayloadAction<string>) => {
      state.roleModalVisible = true;
      state.redirectPath = action.payload;
      state.selectedRole = null;
    },
    hideRoleModal: (state) => {
      state.roleModalVisible = false;
    },
    showPlayerRoleModal: (state, action: PayloadAction<string>) => {
      state.playerRoleModalVisible = true;
      state.redirectPath = action.payload;
    },
    hidePlayerRoleModal: (state) => {
      state.playerRoleModalVisible = false;
    },
    showOwnerRoleModal: (state, action: PayloadAction<string>) => {
      state.ownerRoleModalVisible = true;
      state.redirectPath = action.payload;
    },
    hideOwnerRoleModal: (state) => {
      state.ownerRoleModalVisible = false;
    },
    resetAuthChecks: (state) => {
      // Đảo ngược giá trị flag để tạo ra sự thay đổi và trigger useEffect
      state.resetAuthChecksFlag = !state.resetAuthChecksFlag;
    }
  },
  extraReducers: (builder) => {
    // Login cases
    builder.addCase(login.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(login.fulfilled, (state, action) => {
      state.isLoading = false;
      state.isAuthenticated = true;
      state.user = action.payload;
      state.loginModalVisible = false;
      
      // Lưu userId vào localStorage
      if (action.payload && action.payload.id) {
        localStorage.setItem('userId', action.payload.id);
      }
    });
    builder.addCase(login.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });    
    // Register cases
    builder.addCase(register.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(register.fulfilled, (state) => {
      state.isLoading = false;
    });
    builder.addCase(register.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
    // Logout cases
    builder.addCase(logout.fulfilled, (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.redirectPath = null;
      state.loginModalVisible = false;
      state.roleModalVisible = false;
      state.selectedRole = null;
    });
  },
});

export const { showLoginModal, hideLoginModal, showRoleModal, hideRoleModal, showPlayerRoleModal, hidePlayerRoleModal, showOwnerRoleModal, hideOwnerRoleModal, resetAuthChecks } = userSlice.actions;

export default userSlice.reducer;