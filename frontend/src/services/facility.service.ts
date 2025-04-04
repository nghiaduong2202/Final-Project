import { Facility, FacilityStatusChange, FacilityFormData } from '@/types/facility.type';
import api from './api';

// Interface cho response khi gọi API với pagination
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Interface cho response khi kiểm tra tên cơ sở
export interface FacilityNameCheckResponse {
  exists: boolean;
}

// Interface cho dropdown item
export interface FacilityDropdownItem {
  id: string;
  name: string;
}

// Facility service with real API calls
class FacilityService {
  // Get all facilities owned by the user with pagination support
  async getMyFacilities(page: number = 1, pageSize: number = 10, status: string = 'all', query: string = ''): Promise<PaginatedResponse<Facility>> {
    try {
      // Get current user ID from local storage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      console.log(`Service: Fetching facilities for userId=${userId}, status=${status}, query=${query}`);

      // Prepare params object for API request
      const params: Record<string, string | number | undefined> = { 
        page, 
        pageSize 
      };
      
      // Only add status param if it's not 'all'
      if (status !== 'all') {
        params.status = status;
      }
      
      // Only add query param if it's not empty
      if (query && query.trim() !== '') {
        params.query = query;
      }
      
      console.log('Request params:', params);

      // Call real API
      const response = await api.get(`/facility/owner/${userId}`, { params });

      console.log('API response status:', response.status);
      console.log('Total facilities received:', response.data.length || 0);

      // Format the response to match our expected structure
      const facilities = response.data;
      return {
        data: facilities,
        total: facilities.length,
        page,
        pageSize
      };
    } catch (error) {
      console.error('API call failed in getMyFacilities:', error);
      throw error;
    }
  }

  // Get a facility by ID
  async getFacilityById(id: string): Promise<Facility> {
    try {
      // Call real API
      const response = await api.get(`/facility/${id}`);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Create a new facility - real API implementation
  async createFacility(data: FormData | FacilityFormData): Promise<{ message: string }> {
    try {
      // If it's not a FormData object, we need to create one
      let formDataToSend: FormData;
      
      if (!(data instanceof FormData)) {
        formDataToSend = new FormData();
        
        // Add facility info as JSON
        formDataToSend.append('facilityInfo', JSON.stringify(data.facilityInfo));
        
        // Add images
        data.imageFiles.forEach((file) => {
          formDataToSend.append('images', file);
        });
        
        // Add certificate if exists
        if (data.certificateFile) {
          formDataToSend.append('certificate', data.certificateFile);
        }
        
        // Add licenses if exist
        if (data.licenseFiles && data.licenseFiles.length > 0) {
          data.licenseFiles.forEach((licenseFile) => {
            formDataToSend.append('licenses', licenseFile.file);
          });
          
          // Add sport licenses mapping
          const sportLicenses = {
            sportIds: data.licenseFiles.map(license => license.sportId)
          };
          formDataToSend.append('sportLicenses', JSON.stringify(sportLicenses));
        } else {
          // Empty sport licenses if no licenses
          formDataToSend.append('sportLicenses', JSON.stringify({}));
        }
      } else {
        formDataToSend = data;
      }
      
      const response = await api.post('/facility/create', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
  
  // Upload facility images - real API implementation
  async uploadFacilityImages(facilityId: string, images: File[]): Promise<string[]> {
    try {
      const formData = new FormData();
      images.forEach((image) => {
        formData.append('images', image);
      });

      const response = await api.put(`/facility/${facilityId}/update-images`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.urls || [];
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
  
  // Upload certificate document
  async uploadCertificate(facilityId: string, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('certificate', file);
      
      const response = await api.post(`/facility/${facilityId}/upload-certificate`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
  
  // Upload license document
  async uploadLicense(facilityId: string, sportId: number, file: File): Promise<string> {
    try {
      const formData = new FormData();
      formData.append('license', file);
      formData.append('sportId', sportId.toString());
      
      const response = await api.post(`/facility/${facilityId}/upload-license`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return response.data.url;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Update an existing facility
  async updateFacility(id: string, facilityData: Partial<Facility>): Promise<Facility> {
    try {
      const response = await api.patch(`/facility/${id}`, facilityData);
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Delete a facility
  async deleteFacility(id: string): Promise<void> {
    try {
      await api.delete(`/facility/${id}`);
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }


  // Change status of a facility (active/inactive)
  async changeFacilityStatus(statusChange: FacilityStatusChange): Promise<void> {
    try {
      await api.patch(`/facility/${statusChange.facilityId}/status`, {
        status: statusChange.newStatus,
        note: statusChange.note
      });
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Check if a facility name already exists
  async checkFacilityNameExists(name: string): Promise<FacilityNameCheckResponse> {
    try {
      const response = await api.get('/facility/check-name', {
        params: { name }
      });
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }

  // Delete facility images
  async deleteFacilityImages(facilityId: string, images: string[]): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/facility/${facilityId}/delete-image`, {
        data: { images }
      });
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
  
  // Get facilities for dropdown
  async getFacilitiesDropdown(): Promise<FacilityDropdownItem[]> {
    try {
      const response = await api.get('/facility/drop-down');
      return response.data;
    } catch (error) {
      console.error('API call failed:', error);
      return [];
    }
  }
}

// Export instance of the service
export const facilityService = new FacilityService();