import api from './api';
import { Service, ServiceApiRequest, UpdatedServiceValues } from '@/types/service.type';

// API Endpoints
export const serviceService = {
  /**
   * Lấy danh sách dịch vụ theo cơ sở
   * @param facilityId ID của cơ sở
   */
  async getServicesByFacility(facilityId: string): Promise<Service[]> {
    try {
      const response = await api.get(`/service/${facilityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching services:', error);
      throw error;
    }
  },

  /**
   * Tạo nhiều dịch vụ mới
   * @param facilityId ID của cơ sở
   * @param services Danh sách dịch vụ cần tạo
   */
  async createServices(facilityId: string, services: ServiceApiRequest[]): Promise<{ message: string }> {
    try {
      const response = await api.post('/service', {
        facilityId,
        services
      });
      return response.data;
    } catch (error) {
      console.error('Error creating services:', error);
      throw error;
    }
  },

  /**
   * Cập nhật thông tin dịch vụ
   * @param serviceId ID của dịch vụ cần cập nhật
   * @param serviceData Dữ liệu cập nhật
   */
  async updateService(serviceId: number, serviceData: Partial<UpdatedServiceValues>): Promise<{ message: string }> {
    try {
      const response = await api.patch(`/service/${serviceId}`, serviceData);
      return response.data;
    } catch (error) {
      console.error('Error updating service:', error);
      throw error;
    }
  },

  /**
   * Xóa dịch vụ
   * @param serviceId ID của dịch vụ cần xóa
   */
  async deleteService(serviceId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/service/${serviceId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting service:', error);
      throw error;
    }
  }
};

export default api;