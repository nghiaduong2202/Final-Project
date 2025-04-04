import { apiClient } from '@/services/api.service';
import { ApiError } from '@/types/errors';

export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      return response.data;
    } catch (error: unknown) {
      const apiError = error as ApiError;
      const errorMessage = apiError.response?.data?.message;
      if (errorMessage) {
        throw new Error(
          Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage
        );
      }
      throw error;
    }
  },

  refreshToken: async (refreshToken: string) => {
    const response = await apiClient.post('/auth/refresh-token', { refreshToken });
    return response.data;
  },

  getMyInfo: async () => {
    const response = await apiClient.get('/person/my-info');
    return response.data;
  },

  getAllPerson: async () => {
    const response = await apiClient.get('/person/all');
    return response.data;
  },
};