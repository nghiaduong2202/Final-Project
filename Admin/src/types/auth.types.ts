export interface LoginParams {
    email: string;
    password: string;
  }
  
  export interface AdminUser {
    id: string;
    email: string;
    name: string;
    role: string;
    avatar?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  export interface AuthState {
    user: AdminUser | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
    loginModalVisible: boolean;
    redirectPath: string | null;
    resetAuthChecksFlag: boolean;
  }
  
  export interface AuthResponse {
    accessToken: string;
    refreshToken: string;
  }
  
  export interface TokenResponse {
    accessToken: string;
  }