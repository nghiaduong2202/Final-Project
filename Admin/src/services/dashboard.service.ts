import { apiClient } from '@/services/api.service';

export const dashboardService = {
  async getStats() {
    const response = await apiClient.get('/admin/dashboard');
    return response.data;
  },
  
  async getRecentUsers(limit: number = 5) {
    const response = await apiClient.get(`/admin/users/recent?limit=${limit}`);
    return response.data;
  },
  
  async getRecentFacilities(limit: number = 5) {
    const response = await apiClient.get(`/admin/facilities/recent?limit=${limit}`);
    return response.data;
  },
  
  async getPendingApprovals(limit: number = 5) {
    const response = await apiClient.get(`/admin/approvals?status=pending&limit=${limit}`);
    return response.data;
  }
};