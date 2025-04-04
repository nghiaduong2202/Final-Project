import { apiClient } from './api.service';
import { Facility, FacilityFilter } from '@/types/facility.types';

export const facilityService = {
  async getFacilities(filter: FacilityFilter = {}) {
    const response = await apiClient.get('/admin/facilities', { params: filter });
    return response.data;
  },
  
  async getFacilityById(facilityId: string) {
    const response = await apiClient.get(`/admin/facilities/${facilityId}`);
    return response.data;
  },
  
  async updateFacility(facilityId: string, facilityData: Partial<Facility>) {
    const response = await apiClient.put(`/admin/facilities/${facilityId}`, facilityData);
    return response.data;
  },
  
  async deleteFacility(facilityId: string) {
    const response = await apiClient.delete(`/admin/facilities/${facilityId}`);
    return response.data;
  },
  
  async updateFacilityStatus(facilityId: string, status: string) {
    const response = await apiClient.patch(`/admin/facilities/${facilityId}/status`, { status });
    return response.data;
  },
  
  async getFacilityFields(facilityId: string) {
    const response = await apiClient.get(`/admin/facilities/${facilityId}/fields`);
    return response.data;
  },
  
  async getFacilityServices(facilityId: string) {
    const response = await apiClient.get(`/admin/facilities/${facilityId}/services`);
    return response.data;
  },
  
  async getFacilityReviews(facilityId: string) {
    const response = await apiClient.get(`/admin/facilities/${facilityId}/reviews`);
    return response.data;
  }
};