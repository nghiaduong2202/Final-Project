import { apiClient } from '@/services/api.service';

export interface SportData {
  name: string;
}

// API Endpoints
export const sportService = {
  // Sport api
  getSport: async () => {
    const response = await apiClient.get('/sport/all');
    return response.data;
  },

  createSport: async (data: SportData) => {
    const response = await apiClient.post('/sport', data);
    return response.data;
  } 
  
};

export default apiClient;