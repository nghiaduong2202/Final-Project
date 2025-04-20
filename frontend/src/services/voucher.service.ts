import api from './api';
import { Voucher, VoucherFormData } from '@/types/voucher.type';

// API Endpoints
export const voucherService = { 
  getVouchers: async (facilityId: string): Promise<Voucher[]> => {
    const response = await api.get(`/voucher/${facilityId}`);
    return response.data;
  },

  createVoucher: async (facilityId: string, data: VoucherFormData): Promise<Voucher> => {
    const response = await api.post(`/voucher/${facilityId}`, data);
    return response.data;
  },

  updateVoucher: async (data: Partial<Voucher>): Promise<Voucher> => {
    const response = await api.patch('/voucher', data);
    return response.data;
  },

  deleteVoucher: async (voucherId: number): Promise<void> => {
    await api.delete(`/voucher/${voucherId}`);
  }
};

export default api;