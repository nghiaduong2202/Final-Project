import api from './api';
import { FieldGroup, FieldGroupFormData } from '@/types/field.type';

// API Endpoints for Field and Field Group management
export const fieldService = { 
  // Get field groups by facility ID
  async getFieldGroupsByFacilityId(facilityId: string): Promise<FieldGroup[]> {
    try {
      const response = await api.get(`/field-group/${facilityId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching field groups:', error);
      throw error;
    }
  },

  // Create multiple field groups
  async createFieldGroups(facilityId: string, fieldGroups: FieldGroupFormData[]): Promise<{ message: string }> {
    try {
      // Lọc chỉ giữ các trường cần thiết cho mỗi field group
      const fieldGroupData = fieldGroups.map(group => {
        // Định nghĩa kiểu dữ liệu cho filtered group
        const filteredGroup: {
          name: string;
          dimension: string;
          surface: string;
          basePrice: number;
          sportIds: number[];
          fields: { name: string }[];
          peakStartTime1?: string;
          peakEndTime1?: string;
          priceIncrease1?: number;
          peakStartTime2?: string;
          peakEndTime2?: string;
          priceIncrease2?: number;
          peakStartTime3?: string;
          peakEndTime3?: string;
          priceIncrease3?: number;
        } = {
          name: group.name,
          dimension: group.dimension,
          surface: group.surface,
          basePrice: group.basePrice,
          sportIds: group.sportIds,
          fields: group.fields.map(field => ({ name: field.name }))
        };

        // Chỉ thêm các trường peak time nếu có
        if (group.peakStartTime1 && group.peakEndTime1) {
          filteredGroup.peakStartTime1 = group.peakStartTime1;
          filteredGroup.peakEndTime1 = group.peakEndTime1;
          filteredGroup.priceIncrease1 = group.priceIncrease1;
        }

        if (group.peakStartTime2 && group.peakEndTime2) {
          filteredGroup.peakStartTime2 = group.peakStartTime2;
          filteredGroup.peakEndTime2 = group.peakEndTime2;
          filteredGroup.priceIncrease2 = group.priceIncrease2;
        }

        if (group.peakStartTime3 && group.peakEndTime3) {
          filteredGroup.peakStartTime3 = group.peakStartTime3;
          filteredGroup.peakEndTime3 = group.peakEndTime3;
          filteredGroup.priceIncrease3 = group.priceIncrease3;
        }

        return filteredGroup;
      });

      // Luôn gửi một mảng, kể cả khi chỉ có một phần tử
      const response = await api.put(`/field-group/${facilityId}`, { 
        fieldGroups: fieldGroupData
      });
      
      return response.data;
    } catch (error) {
      console.error('Error creating field groups:', error);
      throw error;
    }
  },

  // Update field group
  async updateFieldGroup(fieldGroupId: string, fieldGroupData: Partial<FieldGroupFormData>): Promise<{ message: string }> {
    try {
      // Lọc chỉ giữ các trường cần thiết
      const filteredData: {
        name?: string;
        dimension?: string;
        surface?: string;
        basePrice?: number;
        sportIds?: number[];
        peakStartTime1?: string;
        peakEndTime1?: string;
        priceIncrease1?: number;
        peakStartTime2?: string;
        peakEndTime2?: string;
        priceIncrease2?: number;
        peakStartTime3?: string;
        peakEndTime3?: string;
        priceIncrease3?: number;
      } = {
        name: fieldGroupData.name,
        dimension: fieldGroupData.dimension,
        surface: fieldGroupData.surface,
        basePrice: fieldGroupData.basePrice,
        sportIds: fieldGroupData.sportIds
      };

      // Chỉ thêm các trường peak time nếu có
      if (fieldGroupData.peakStartTime1 && fieldGroupData.peakEndTime1) {
        filteredData.peakStartTime1 = fieldGroupData.peakStartTime1;
        filteredData.peakEndTime1 = fieldGroupData.peakEndTime1;
        filteredData.priceIncrease1 = fieldGroupData.priceIncrease1;
      }

      if (fieldGroupData.peakStartTime2 && fieldGroupData.peakEndTime2) {
        filteredData.peakStartTime2 = fieldGroupData.peakStartTime2;
        filteredData.peakEndTime2 = fieldGroupData.peakEndTime2;
        filteredData.priceIncrease2 = fieldGroupData.priceIncrease2;
      }

      if (fieldGroupData.peakStartTime3 && fieldGroupData.peakEndTime3) {
        filteredData.peakStartTime3 = fieldGroupData.peakStartTime3;
        filteredData.peakEndTime3 = fieldGroupData.peakEndTime3;
        filteredData.priceIncrease3 = fieldGroupData.priceIncrease3;
      }

      const response = await api.patch(`/field-group/${fieldGroupId}`, filteredData);
      return response.data;
    } catch (error) {
      console.error('Error updating field group:', error);
      throw error;
    }
  },

  // Delete field group
  async deleteFieldGroup(fieldGroupId: string): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/field-group/${fieldGroupId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting field group:', error);
      throw error;
    }
  },

  // Delete field
  async deleteField(fieldId: number): Promise<{ message: string }> {
    try {
      const response = await api.delete(`/field/${fieldId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting field:', error);
      throw error;
    }
  },

  // Create multiple fields for a field group
  async createFields(fieldGroupId: string, fields: { name: string }[]): Promise<{ message: string }> {
    try {
      const response = await api.put(`/field/${fieldGroupId}`, { fields });
      return response.data;
    } catch (error) {
      console.error('Error creating fields:', error);
      throw error;
    }
  }
};

export default api;