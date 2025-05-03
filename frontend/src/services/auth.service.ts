import api from './api';
import { ApiError } from '@/types/errors';
import { RegisterData, UpdateInfo } from '@/types/user.type';

// API Endpoints
export const authService = {
  login: async (email: string, password: string) => {
    try {
      const response = await api.post('/auth/login', { email, password });
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
  
  register: async (data: RegisterData) => {
    try {
      const formatPhoneNumber = (phone: string) => {
        if (phone.startsWith('+')) return phone;
        return `+84${phone.startsWith('0') ? phone.substring(1) : phone}`;
      };

      const formattedData = {
      ...data,
      phoneNumber: formatPhoneNumber(data.phoneNumber)
    };
            
      const response = await api.post('/auth/register', formattedData);
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
  
  getMyInfo: async () => {
    const response = await api.get('/person/my-info');
    return response.data;
  },

  updateAvatar: async (formData: FormData) => {
    const response = await api.put('/person/update-avatar', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateInfo: async (data: UpdateInfo) => {
    const response = await api.put('/person/update-infor', data);
    return response.data;
  },
  
  refreshToken: async (refreshToken: string) => {
    const response = await api.put('/auth/refresh-token', { refreshToken });
    return response.data;
  }
};

export default api;