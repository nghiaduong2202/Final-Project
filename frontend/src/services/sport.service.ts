import api from './api';

// API Endpoints
export const sportService = {
  // Sport api
  getSport: async () => {
    const response = await api.get('/sport/all');
    return response.data;
  } 
  
};

export default api;