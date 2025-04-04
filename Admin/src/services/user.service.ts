import { apiClient } from './api.service';
import { User, UserFilter } from '@/types/user.types';

export const userService = {
  async getUsers(filter: UserFilter = {}) {
    const response = await apiClient.get('/admin/users', { params: filter });
    return response.data;
  },
  
  async getUserById(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}`);
    return response.data;
  },
  
  async updateUser(userId: string, userData: Partial<User>) {
    const response = await apiClient.put(`/admin/users/${userId}`, userData);
    return response.data;
  },
  
  async deleteUser(userId: string) {
    const response = await apiClient.delete(`/admin/users/${userId}`);
    return response.data;
  },
  
  async updateUserStatus(userId: string, status: string) {
    const response = await apiClient.patch(`/admin/users/${userId}/status`, { status });
    return response.data;
  },
  
  async getUserActivities(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}/activities`);
    return response.data;
  },
  
  async getUserBookings(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}/bookings`);
    return response.data;
  },
  
  async getUserFacilities(userId: string) {
    const response = await apiClient.get(`/admin/users/${userId}/facilities`);
    return response.data;
  }
};