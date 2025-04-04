export interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    status: string;
    avatar?: string;
    phone?: string;
    address?: string;
    createdAt: string;
    updatedAt?: string;
  }
  
  export interface UsersState {
    users: User[];
    selectedUser: User | null;
    loading: boolean;
    error: string | null;
    totalUsers: number;
  }
  
  export interface UserFilter {
    role?: string;
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }