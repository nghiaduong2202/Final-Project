export interface Voucher {
    id: number;
    name: string;
    code: string;
    startDate: string;
    endDate: string;
    voucherType: 'cash' | 'percent';
    discount: number;
    minPrice: number;
    maxDiscount: number;
    amount: number;
    remain: number;
    facilityId: string;
    createdAt: string;
    updatedAt: string;
  }

  export interface VoucherFormData {
    name: string;
    code?: string;
    startDate: string;
    endDate: string;
    voucherType: 'cash' | 'percent';
    discount: number;
    minPrice: number;
    maxDiscount: number;
    amount: number;
    facilityId: string;
  }

  export interface VoucherFilter {
    facilityId?: string;
    status?: 'active' | 'upcoming' | 'expired';
  }

  export interface VoucherState {
    vouchers: Voucher[];
    isLoading: boolean;
    error: string | null;
    selectedFacilityId: string | null;
  }